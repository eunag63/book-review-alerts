import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  try {
    console.log('API 키:', process.env.RESEND_API_KEY ? '존재함' : '없음');
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'API 키가 없습니다' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'hello@freebook.kr',
      subject: 'Test Email',
      html: '<p>테스트 이메일입니다!</p>'
    });

    console.log('발송 결과:', result);
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('오류:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}