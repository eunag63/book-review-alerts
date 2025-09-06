import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { getEmailTemplate } from '../../../../lib/emailTemplates';

// 대기 중인 등록 건 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('review_registrations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('등록 건 조회 오류:', error);
      return NextResponse.json(
        { error: '데이터 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      registrations: data || []
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 승인/거부 처리
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, additionalData } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 1. 원본 데이터 조회 (이메일 발송용으로도 필요)
    const { data: registration, error: fetchError } = await supabase
      .from('review_registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json(
        { error: '등록 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // 승인 처리: reviews 테이블로 데이터 복사

      // reviews 테이블 처리
      if (registration.existing_review_id) {
        // 기존 서평단 업데이트: source와 registration_id만 업데이트
        const { error: updateError } = await supabase
          .from('reviews')
          .update({
            source: 'registration',
            registration_id: registration.id
          })
          .eq('id', registration.existing_review_id);

        if (updateError) {
          console.error('기존 reviews 업데이트 오류:', updateError);
          return NextResponse.json(
            { error: '기존 서평단 업데이트 중 오류가 발생했습니다.' },
            { status: 500 }
          );
        }
      } else {
        // 새 책 등록: 새 레코드 생성
        const { error: insertError } = await supabase
          .from('reviews')
          .insert([
            {
              title: registration.title,
              author: registration.author,
              publisher: registration.publisher,
              deadline: registration.deadline,
              url: registration.link,
              genre: additionalData?.genre || '',
              author_gender: registration.author_gender || '',
              nationality: additionalData?.nationality || '',
              type: additionalData?.type || '',
              category: registration.category,
              source: 'registration',
              registration_id: registration.id
            }
          ]);

        if (insertError) {
          console.error('새 reviews 생성 오류:', insertError);
          return NextResponse.json(
            { error: '새 서평단 등록 중 오류가 발생했습니다.' },
            { status: 500 }
          );
        }
      }

      // 상태를 approved로 변경
      const { error: updateError } = await supabase
        .from('review_registrations')
        .update({ status: 'approved' })
        .eq('id', id);

      if (updateError) {
        console.error('상태 업데이트 오류:', updateError);
        return NextResponse.json(
          { error: '상태 업데이트 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

    } else if (action === 'reject') {
      // 거부 처리: 상태만 변경
      const { error: updateError } = await supabase
        .from('review_registrations')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (updateError) {
        console.error('거부 처리 오류:', updateError);
        return NextResponse.json(
          { error: '거부 처리 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: '올바르지 않은 액션입니다.' },
        { status: 400 }
      );
    }

    // 이메일 발송 - 직접 Resend 호출로 변경
    console.log('=== 이메일 발송 시작 ===');
    console.log('받는 사람:', registration.email);
    console.log('액션:', action);
    
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { subject, htmlContent } = getEmailTemplate({
        title: registration.title,
        isApproved: action === 'approve'
      });

      const result = await resend.emails.send({
        from: 'Free Book <hello@freebook.kr>',  // 발신자명 변경
        to: [registration.email],   // 실제 출판사 이메일로 발송
        subject: subject,
        html: htmlContent,
      });

      console.log('=== 이메일 발송 성공 ===');
      console.log('결과:', result);

    } catch (emailError) {
      console.error('=== 이메일 발송 오류 ===');
      console.error('오류 내용:', emailError);
      // 이메일 발송 실패해도 승인/거부 처리는 완료된 상태로 유지
    }

    return NextResponse.json({
      message: action === 'approve' ? '승인되었습니다.' : '거부되었습니다.'
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}