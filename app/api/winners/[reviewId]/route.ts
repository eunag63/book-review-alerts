import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

// 당첨자 정보 등록
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const { name, contact, reviewContact, address } = await request.json();

    // 필수 필드 검증
    if (!name || !contact || !reviewContact || !address) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 서평단 존재 확인
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('id', parseInt(reviewId))
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: '존재하지 않는 서평단입니다.' },
        { status: 404 }
      );
    }

    // 중복 등록 확인 (같은 연락처로 이미 등록했는지)
    const { data: existing } = await supabase
      .from('review_winners')
      .select('id')
      .eq('review_id', parseInt(reviewId))
      .eq('contact', contact)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: '이미 등록된 연락처입니다.' },
        { status: 400 }
      );
    }

    // 당첨자 정보 저장
    const { data: winner, error } = await supabase
      .from('review_winners')
      .insert({
        review_id: parseInt(reviewId),
        name,
        contact,
        review_contact: reviewContact,
        address,
        registered_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('당첨자 정보 저장 오류:', error);
      return NextResponse.json(
        { error: '등록 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '당첨자 정보가 성공적으로 등록되었습니다.',
      winner
    });

  } catch (error) {
    console.error('당첨자 등록 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}