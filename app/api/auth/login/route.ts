import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kakao_id, email, nickname, profile_image } = body

    if (!kakao_id) {
      return NextResponse.json(
        { error: '카카오 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 기존 사용자 확인
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('kakao_id', kakao_id)
      .single()

    let user

    if (findError && findError.code === 'PGRST116') {
      // 사용자가 존재하지 않음 - 새로 생성
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            kakao_id,
            email: email || null,
            nickname: nickname || null,
            profile_image: profile_image || null,
            last_login: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('사용자 생성 실패:', createError)
        return NextResponse.json(
          { error: '사용자 생성에 실패했습니다.' },
          { status: 500 }
        )
      }
      
      user = newUser
      console.log('새 사용자 생성:', user)

    } else if (findError) {
      console.error('사용자 조회 실패:', findError)
      return NextResponse.json(
        { error: '사용자 조회에 실패했습니다.' },
        { status: 500 }
      )
    } else {
      // 기존 사용자 정보 업데이트
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          email: email || existingUser.email,
          nickname: nickname || existingUser.nickname,
          profile_image: profile_image || existingUser.profile_image,
          last_login: new Date().toISOString()
        })
        .eq('kakao_id', kakao_id)
        .select()
        .single()

      if (updateError) {
        console.error('사용자 업데이트 실패:', updateError)
        return NextResponse.json(
          { error: '사용자 정보 업데이트에 실패했습니다.' },
          { status: 500 }
        )
      }

      user = updatedUser
      console.log('기존 사용자 업데이트:', user)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        kakao_id: user.kakao_id,
        email: user.email,
        nickname: user.nickname,
        profile_image: user.profile_image
      }
    })

  } catch (error) {
    console.error('로그인 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}