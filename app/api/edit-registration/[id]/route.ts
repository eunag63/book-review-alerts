import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { verifyEditToken } from '../../../../lib/tokenUtils';

// 토큰 검증 후 등록 데이터 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const token = request.nextUrl.searchParams.get('token');
    
    if (isNaN(id) || !token) {
      return NextResponse.json(
        { error: '잘못된 요청입니다.' },
        { status: 400 }
      );
    }

    // 등록 데이터 조회
    const { data: registration, error } = await supabase
      .from('review_registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !registration) {
      return NextResponse.json(
        { error: '등록 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 토큰 검증
    if (!verifyEditToken(token, id, registration.email)) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      registration
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 토큰 검증 후 등록 데이터 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    const { token, description, deadline, link } = body;
    
    if (isNaN(id) || !token || !description || !deadline || !link) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 등록 데이터 조회 (토큰 검증용)
    const { data: registration, error: fetchError } = await supabase
      .from('review_registrations')
      .select('email')
      .eq('id', id)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json(
        { error: '등록 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 토큰 검증
    if (!verifyEditToken(token, id, registration.email)) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // 등록 데이터 전체 조회 (reviews 테이블 업데이트용)
    const { data: fullRegistration, error: fullFetchError } = await supabase
      .from('review_registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fullFetchError || !fullRegistration) {
      return NextResponse.json(
        { error: '등록 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 등록 데이터 업데이트
    const { error: updateError } = await supabase
      .from('review_registrations')
      .update({
        description,
        deadline,
        link
      })
      .eq('id', id);

    if (updateError) {
      console.error('등록 데이터 수정 오류:', updateError);
      return NextResponse.json(
        { error: '수정 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 만약 이미 승인된 상태라면 reviews 테이블도 업데이트
    if (fullRegistration.status === 'approved' && fullRegistration.existing_review_id) {
      const { error: reviewUpdateError } = await supabase
        .from('reviews')
        .update({
          description,
          deadline,
          url: link
        })
        .eq('id', fullRegistration.existing_review_id);

      if (reviewUpdateError) {
        console.error('reviews 테이블 수정 오류:', reviewUpdateError);
        // reviews 테이블 업데이트 실패해도 등록 데이터 수정은 완료된 상태로 유지
      }
    }

    return NextResponse.json({
      message: '수정이 완료되었습니다.'
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}