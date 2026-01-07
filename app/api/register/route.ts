import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, author, publisher, link, deadline, genre, authorGender, email, description,
      existingReviewId, isExistingBook
    } = body;

    // 필수 필드 검증
    if (!title || !author || !publisher || !link || !deadline || !email || !description) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 마감 날짜 검증 (과거 날짜 체크)
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadlineDate < today) {
      return NextResponse.json(
        { error: '마감 날짜는 오늘 이후여야 합니다.' },
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
    const insertData: Record<string, unknown> = {
      title,
      author,
      publisher,
      link,
      deadline,
      category: genre,
      author_gender: convertedGender,
      email,
      description,
      status: 'pending', // 기본 상태: 검토 대기
      created_at: new Date().toISOString()
    };

    // 기존 책인 경우 참조 ID 추가
    if (isExistingBook && existingReviewId) {
      insertData.existing_review_id = existingReviewId;
    }

    const { data, error } = await supabase
      .from('review_registrations')
      .insert([insertData])
      .select();
    
    // FreeBook에 이메일 전송
    // 미 등록된 사태 재발 방지
    if(!error) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'FreeBook <hello@freebook.kr>',
          to: 'hello@freebook.kr',
          subject: '[FreeBook] 신규 서평단 등록 요청',
          html: `${publisher} 출판사로부터 ${title} 서평단 등록 요청이 들어왔습니다.`
        })

      } catch (error) {
        console.log('운영자 알림 이메일 발송 실패:', error)
      }
    }

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