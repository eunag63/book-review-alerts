import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author, publisher, link, genre, authorGender, email, description } = body;

    // 필수 필드 검증
    if (!title || !author || !publisher || !link || !email || !description) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // URL 형식 검증
    try {
      new URL(link);
    } catch {
      return NextResponse.json(
        { error: '올바른 URL을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 성별 변환
    const genderMap: { [key: string]: string } = {
      '여성': '여자',
      '남성': '남자'
    };
    const convertedGender = authorGender ? genderMap[authorGender] || authorGender : null;

    // Supabase에 데이터 저장
    const { data, error } = await supabase
      .from('review_registrations')
      .insert([
        {
          title,
          author,
          publisher,
          link,
          category: genre,
          author_gender: convertedGender,
          email,
          description,
          status: 'pending', // 기본 상태: 검토 대기
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase 저장 오류:', error);
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: '성공적으로 등록되었습니다.', data },
      { status: 201 }
    );

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}