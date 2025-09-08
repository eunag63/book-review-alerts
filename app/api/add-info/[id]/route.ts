import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { verifySalesToken } from '../../../../lib/tokenUtils';

// 토큰 검증 후 review 데이터 조회
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

    // 토큰 검증
    if (!verifySalesToken(token, id)) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // review 데이터 조회
    const { data: review, error } = await supabase
      .from('reviews')
      .select('id, title, author, publisher, url, deadline, genre')
      .eq('id', id)
      .single();

    if (error || !review) {
      return NextResponse.json(
        { error: '서평단 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      review
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 토큰 검증 후 review_registrations에 새 레코드 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    const { token, description, email } = body;
    
    if (isNaN(id) || !token || !description || !email) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 토큰 검증
    if (!verifySalesToken(token, id)) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // 기존 review 데이터 조회
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: '서평단 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // review_registrations에 새 레코드 생성
    const { error: insertError } = await supabase
      .from('review_registrations')
      .insert([
        {
          title: review.title,
          author: review.author,
          publisher: review.publisher,
          link: review.url,
          deadline: review.deadline,
          category: review.category || '',
          author_gender: review.author_gender || '',
          email: email,
          description: description,
          status: 'pending',
          existing_review_id: id
        }
      ]);

    if (insertError) {
      console.error('등록 데이터 생성 오류:', insertError);
      return NextResponse.json(
        { error: '등록 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '정보가 성공적으로 등록되었습니다.'
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}