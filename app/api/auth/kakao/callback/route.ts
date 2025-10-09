import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabaseClient'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.error('카카오 로그인 에러:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}?error=kakao_login_failed`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}?error=no_code`)
  }

  try {
    // 카카오 액세스 토큰 요청
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY!,
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/kakao/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('토큰 요청 실패:', tokenData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}?error=token_failed`)
    }

    // 카카오 사용자 정보 요청
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      console.error('사용자 정보 요청 실패:', userData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}?error=user_info_failed`)
    }

    // 사용자 정보를 데이터베이스에 저장/업데이트
    const { error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('kakao_id', userData.id)
      .single()

    let user
    if (findError && findError.code === 'PGRST116') {
      // 사용자가 존재하지 않음 - 새로 생성
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            kakao_id: userData.id,
            email: userData.kakao_account?.email,
            nickname: userData.properties?.nickname,
            profile_image: userData.properties?.profile_image,
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('사용자 생성 실패:', createError)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}?error=user_creation_failed`)
      }
      user = newUser
    } else if (findError) {
      console.error('사용자 조회 실패:', findError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}?error=user_lookup_failed`)
    } else {
      // 기존 사용자 정보 업데이트
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          email: userData.kakao_account?.email,
          nickname: userData.properties?.nickname,
          profile_image: userData.properties?.profile_image,
          last_login: new Date().toISOString(),
        })
        .eq('kakao_id', userData.id)
        .select()
        .single()

      if (updateError) {
        console.error('사용자 업데이트 실패:', updateError)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}?error=user_update_failed`)
      }
      user = updatedUser
    }

    // 로그인 성공 - 홈페이지로 리다이렉트 (사용자 정보를 쿼리 파라미터로 전달)
    const redirectUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL!)
    redirectUrl.searchParams.set('login_success', 'true')
    redirectUrl.searchParams.set('user_id', user.id)
    redirectUrl.searchParams.set('nickname', user.nickname || '')

    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('카카오 로그인 콜백 처리 중 오류:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}?error=callback_error`)
  }
}