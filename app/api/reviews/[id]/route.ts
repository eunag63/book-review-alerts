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

    // 해당 서평단의 출판사 대시보드 가이드라인 조회
    const { data: dashboard } = await supabase
      .from('publisher_dashboards')
      .select('guidelines')
      .eq('review_id', parseInt(id))
      .single();

    return NextResponse.json({
      review,
      guidelines: dashboard?.guidelines || ''
    });

  } catch (error) {
    console.error('서평단 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}