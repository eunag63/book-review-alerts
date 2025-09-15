import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { createHash } from 'crypto';

// 출판사 대시보드 목록 조회
export async function GET() {
  try {
    const { data: dashboards, error } = await supabase
      .from('publisher_dashboards')
      .select(`
        *,
        reviews (
          title,
          author,
          publisher
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedDashboards = dashboards.map(dashboard => ({
      id: dashboard.id,
      review_id: dashboard.review_id,
      token: dashboard.token,
      created_at: dashboard.created_at,
      review_title: dashboard.reviews.title,
      review_author: dashboard.reviews.author,
      review_publisher: dashboard.reviews.publisher
    }));

    return NextResponse.json({
      dashboards: formattedDashboards
    });

  } catch (error) {
    console.error('출판사 대시보드 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새 출판사 대시보드 생성
export async function POST(request: NextRequest) {
  try {
    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: '서평단 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 이미 해당 서평단의 대시보드가 있는지 확인
    const { data: existing } = await supabase
      .from('publisher_dashboards')
      .select('id')
      .eq('review_id', reviewId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: '이미 해당 서평단의 출판사 대시보드가 존재합니다.' },
        { status: 400 }
      );
    }

    // 출판사 대시보드 토큰 생성
    const data = `publisher-${reviewId}-${Date.now()}-${Math.random()}`;
    const token = createHash('sha256').update(data).digest('hex').substring(0, 32);

    // 출판사 대시보드 생성
    const { data: dashboard, error } = await supabase
      .from('publisher_dashboards')
      .insert({
        review_id: reviewId,
        token,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        reviews (
          title,
          author,
          publisher
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({
      dashboard: {
        id: dashboard.id,
        review_id: dashboard.review_id,
        token: dashboard.token,
        created_at: dashboard.created_at,
        review_title: dashboard.reviews.title,
        review_author: dashboard.reviews.author,
        review_publisher: dashboard.reviews.publisher
      }
    });

  } catch (error) {
    console.error('출판사 대시보드 생성 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}