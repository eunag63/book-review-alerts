import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabaseClient';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { review_deadline } = await request.json();

    if (!review_deadline) {
      return NextResponse.json(
        { error: '마감일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 날짜 형식 확인 및 변환
    const deadlineDate = new Date(review_deadline);
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json(
        { error: '유효하지 않은 날짜 형식입니다.' },
        { status: 400 }
      );
    }

    // ISO 문자열로 변환하여 데이터베이스에 저장
    const isoDeadline = deadlineDate.toISOString();

    const { error } = await supabase
      .from('reviews')
      .update({ review_deadline: isoDeadline })
      .eq('id', id);

    if (error) {
      console.error('마감일 업데이트 오류:', error);
      return NextResponse.json(
        { error: '마감일 설정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}