interface EmailTemplateProps {
  title: string;
  isApproved: boolean;
}

export function getEmailTemplate({ title, isApproved }: EmailTemplateProps) {
  const subject = isApproved 
    ? `『${title}』 서평단 등록이 승인되었습니다`
    : `『${title}』 서평단 등록이 거부되었습니다`;

  const htmlContent = isApproved
    ? `
    <div style="background-color: #000000; min-height: 100vh; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border-radius: 12px; padding: 40px; border: 1px solid #333;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="display: inline-block; margin-bottom: 20px; font-size: 24px;">
            🍀
          </div>
          <h1 style="color: #80FD8F; margin: 0; font-size: 28px; font-weight: 700;">서평단 등록 승인</h1>
        </div>
 
        <!-- Main Content -->
        <div style="color: #ffffff; line-height: 1.6; margin-bottom: 40px;">
          <p style="font-size: 16px; margin-bottom: 20px;">안녕하세요, 서평단 플랫폼 FreeBook입니다.</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            『${title}』 서평단 등록이 <span style="color: #80FD8F; font-weight: 600;">승인</span>되었습니다.
          </p>
 
          <p style="color: #cccccc; font-size: 16px; margin-bottom: 30px;">
            소중한 책을 FreeBook을 통해 독자들과 나눠주셔서 진심으로 감사드립니다. 많은 독자들이 여러분의 책에 관심을 가질 것으로 기대합니다.
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://freebook.kr/register" 
               style="display: inline-block; background-color: #80FD8F; color: #000000; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
              서평단 정보 수정하기
            </a>
          </div>
        </div>
 
        <!-- Footer -->
        <div style="border-top: 1px solid #333; padding-top: 30px; text-align: center;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            <strong style="color: #80FD8F;">FreeBook</strong> 팀<br>
            <a href="mailto:hello@freebook.kr" style="color: #80FD8F; text-decoration: none;">hello@freebook.kr</a>
          </p>
        </div>
      </div>
    </div>
  `
    : `
    <div style="background-color: #000000; min-height: 100vh; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border-radius: 12px; padding: 40px; border: 1px solid #333;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="display: inline-block; margin-bottom: 20px; font-size: 24px;">
            🍀
          </div>
          <h1 style="color: #80FD8F; margin: 0; font-size: 28px; font-weight: 700;">서평단 등록 거부</h1>
        </div>
 
        <!-- Main Content -->
        <div style="color: #ffffff; line-height: 1.6; margin-bottom: 40px;">
          <p style="font-size: 16px; margin-bottom: 20px;">안녕하세요, 서평단 플랫폼 FreeBook입니다.</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            『${title}』 서평단 등록이 검토 결과 <span style="color: #80FD8F; font-weight: 600;">거부</span>되었습니다.
          </p>
 
          <p style="color: #cccccc; font-size: 16px; margin-bottom: 30px;">
            자세한 사항이나 재신청 관련 문의는 아래 이메일로 연락 주시기 바랍니다. 빠른 시일 내에 답변드리겠습니다.
          </p>
        </div>
 
        <!-- Footer -->
        <div style="border-top: 1px solid #333; padding-top: 30px; text-align: center;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            <strong style="color: #80FD8F;">FreeBook</strong> 팀<br>
            <a href="mailto:hello@freebook.kr" style="color: #80FD8F; text-decoration: none;">hello@freebook.kr</a>
          </p>
        </div>
      </div>
    </div>
  `;

  return { subject, htmlContent };
}