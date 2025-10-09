import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabaseClient'

// 사용자 마감일 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('user_selected_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true })

    if (error) {
      console.error('마감일 조회 오류:', error)
      return NextResponse.json(
        { error: '마감일 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deadlines: data || []
    })

  } catch (error) {
    console.error('마감일 조회 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 새로운 마감일 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      review_id,
      book_title,
      author,
      publisher,
      deadline
    } = body

    if (!user_id || !book_title || !deadline) {
      return NextResponse.json(
        { error: '필수 항목이 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 날짜 형식 검증
    const deadlineDate = new Date(deadline)
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json(
        { error: '올바른 날짜 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('user_selected_reviews')
      .insert([
        {
          user_id,
          review_id: review_id || null,
          book_title,
          author: author || null,
          publisher: publisher || null,
          deadline: deadline,
          submission_status: 'pending'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('마감일 등록 오류:', error)
      return NextResponse.json(
        { error: '마감일 등록에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deadline: data
    })

  } catch (error) {
    console.error('마감일 등록 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}