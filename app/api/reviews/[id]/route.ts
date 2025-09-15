import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

// 서평단 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: review, error } = await supabase
      .from('reviews')
      .select('id, title, author, publisher, deadline, review_deadline')
      .eq('id', parseInt(id))
      .single();

    if (error || !review) {
      return NextResponse.json(
        { error: '서평단 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      review
    });

  } catch (error) {
    console.error('서평단 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}