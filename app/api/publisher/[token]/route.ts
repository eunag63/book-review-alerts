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
          deadline,
          review_deadline
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

    // 해당 서평단의 제출 현황 조회
    const { data: submissions, error: submissionsError } = await supabase
      .from('review_submissions')
      .select('*')
      .eq('review_id', dashboard.review_id)
      .order('submitted_at', { ascending: false });

    if (submissionsError) {
      console.error('제출 현황 조회 오류:', submissionsError);
    }

    // 해당 서평단의 당첨자 정보 조회
    const { data: winners, error: winnersError } = await supabase
      .from('review_winners')
      .select('*')
      .eq('review_id', dashboard.review_id)
      .order('registered_at', { ascending: false });

    if (winnersError) {
      console.error('당첨자 정보 조회 오류:', winnersError);
    }

    return NextResponse.json({
      review: dashboard.reviews,
      submissions: submissions || [],
      winners: winners || [],
      guidelines: dashboard.guidelines || ''
    });

  } catch (error) {
    console.error('출판사 대시보드 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 출판사 대시보드 가이드라인 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { guidelines } = await request.json();

    // 출판사 대시보드 조회
    const { data: dashboard, error: dashboardError } = await supabase
      .from('publisher_dashboards')
      .select('id')
      .eq('token', token)
      .single();

    if (dashboardError || !dashboard) {
      return NextResponse.json(
        { error: '출판사 대시보드를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 가이드라인 업데이트
    const { error: updateError } = await supabase
      .from('publisher_dashboards')
      .update({ guidelines })
      .eq('token', token);

    if (updateError) {
      console.error('가이드라인 업데이트 오류:', updateError);
      return NextResponse.json(
        { error: '가이드라인 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '가이드라인이 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('가이드라인 업데이트 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}