import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabaseClient'

// 특정 마감일 조회
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { data, error } = await supabase
      .from('user_selected_reviews')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('마감일 조회 오류:', error)
      return NextResponse.json(
        { error: '마감일을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      deadline: data
    })

  } catch (error) {
    console.error('마감일 조회 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 마감일 정보 수정
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const body = await request.json()
    const {
      book_title,
      author,
      publisher,
      deadline,
      submission_status,
      submitted_at
    } = body

    const updateData: Record<string, string | null> = {}
    
    if (book_title) updateData.book_title = book_title
    if (author !== undefined) updateData.author = author
    if (publisher !== undefined) updateData.publisher = publisher
    if (deadline) {
      const deadlineDate = new Date(deadline)
      if (isNaN(deadlineDate.getTime())) {
        return NextResponse.json(
          { error: '올바른 날짜 형식이 아닙니다.' },
          { status: 400 }
        )
      }
      updateData.deadline = deadline
    }
    if (submission_status) {
      updateData.submission_status = submission_status
      if (submission_status === 'submitted') {
        updateData.submitted_at = new Date().toISOString()
      }
    }
    if (submitted_at !== undefined) updateData.submitted_at = submitted_at

    const { data, error } = await supabase
      .from('user_selected_reviews')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('마감일 수정 오류:', error)
      return NextResponse.json(
        { error: '마감일 수정에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deadline: data
    })

  } catch (error) {
    console.error('마감일 수정 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 마감일 삭제
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { error } = await supabase
      .from('user_selected_reviews')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('마감일 삭제 오류:', error)
      return NextResponse.json(
        { error: '마감일 삭제에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '마감일이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('마감일 삭제 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}