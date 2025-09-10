import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

// 출판사 대시보드 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // 출판사 대시보드 조회
    const { data: dashboard, error: dashboardError } = await supabase
      .from('publisher_dashboards')
      .select(`
        *,
        reviews (
          id,
          title,
          author,
          publisher,
          deadline
        )
      `)
      .eq('token', token)
      .single();

    if (dashboardError || !dashboard) {
      return NextResponse.json(
        { error: '출판사 대시보드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      review: dashboard.reviews,
      participants: []
    });

  } catch (error) {
    console.error('출판사 대시보드 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}