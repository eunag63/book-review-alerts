import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, title, action } = body;

    if (!email || !title || !action) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    let subject = '';
    let htmlContent = '';

    if (action === 'approved') {
      subject = `[FreBook] "${title}" 서평단 등록이 승인되었습니다`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #80FD8F;">서평단 등록 승인 완료</h2>
          <p>안녕하세요!</p>
          <p><strong>"${title}"</strong> 서평단 등록이 승인되어 FreBook 사이트에 게시되었습니다.</p>
          <p>많은 독자들이 여러분의 책에 관심을 가질 것으로 기대합니다.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            FreBook 팀<br>
            <a href="mailto:hello@freebook.kr">hello@freebook.kr</a>
          </p>
        </div>
      `;
    } else if (action === 'rejected') {
      subject = `[FreBook] "${title}" 서평단 등록이 거부되었습니다`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b6b;">서평단 등록 거부</h2>
          <p>안녕하세요!</p>
          <p><strong>"${title}"</strong> 서평단 등록이 검토 결과 거부되었습니다.</p>
          <p>자세한 사항은 hello@freebook.kr로 문의해 주시기 바랍니다.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            FreBook 팀<br>
            <a href="mailto:hello@freebook.kr">hello@freebook.kr</a>
          </p>
        </div>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: 'FreBook <hello@freebook.kr>',
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('이메일 발송 오류:', error);
      return NextResponse.json(
        { error: '이메일 발송에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '이메일이 성공적으로 발송되었습니다.',
      data
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}