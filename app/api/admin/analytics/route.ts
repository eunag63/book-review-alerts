import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

// 전체 서평단 클릭수 분석 데이터 조회
export async function GET() {
  try {
    // 먼저 reviews 데이터 조회
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, title, author, publisher, deadline, source, created_at')
      .order('created_at', { ascending: false });

    if (reviewsError) {
      throw reviewsError;
    }

    // 각 review별 클릭수 조회
    const analyticsData = [];
    for (const review of reviewsData || []) {
      const { count, error: countError } = await supabase
        .from('log_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', review.id);

      if (countError) {
        console.error(`Review ${review.id} 클릭수 조회 오류:`, countError);
      }

      analyticsData.push({
        ...review,
        click_count: count || 0
      });
    }

    return NextResponse.json({
      analytics: analyticsData
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}