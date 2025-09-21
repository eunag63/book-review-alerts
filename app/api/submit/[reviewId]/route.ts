import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

// 서평 링크 제출
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const { name, contact, review_link, store_url } = await request.json();

    // 필수 필드 검증
    if (!name || !contact || !review_link || !store_url) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 서평 링크 URL 유효성 검사
    try {
      new URL(review_link);
    } catch {
      return NextResponse.json(
        { error: '올바른 서평 링크 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 서평단 존재 및 마감일 확인
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, review_deadline')
      .eq('id', parseInt(reviewId))
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: '존재하지 않는 서평단입니다.' },
        { status: 404 }
      );
    }

    // 서평 제출 마감일 체크
    if (!review.review_deadline) {
      return NextResponse.json(
        { error: '서평 제출 기간이 아직 설정되지 않았습니다.' },
        { status: 400 }
      );
    }

    const deadline = new Date(review.review_deadline);
    const now = new Date();
    
    if (deadline < now) {
      return NextResponse.json(
        { error: '서평 제출 기간이 마감되었습니다.' },
        { status: 400 }
      );
    }

    // 중복 제출 확인 (같은 연락처로 이미 제출했는지)
    const { data: existing } = await supabase
      .from('review_submissions')
      .select('id')
      .eq('review_id', parseInt(reviewId))
      .eq('contact', contact)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: '이미 제출된 연락처입니다.' },
        { status: 400 }
      );
    }

    // 서평 링크 제출 저장
    const { data: submission, error } = await supabase
      .from('review_submissions')
      .insert({
        review_id: parseInt(reviewId),
        name,
        contact,
        review_link,
        store_url,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('서평 링크 제출 저장 오류:', error);
      return NextResponse.json(
        { error: '제출 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '서평 링크가 성공적으로 제출되었습니다.',
      submission
    });

  } catch (error) {
    console.error('서평 링크 제출 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}