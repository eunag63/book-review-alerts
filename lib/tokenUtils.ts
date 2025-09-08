import { createHash } from 'crypto';

// 등록 데이터별 고유 토큰 생성
export function generateEditToken(registrationId: number, email: string): string {
  const salt = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default-salt';
  const data = `${registrationId}-${email}-${salt}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 32);
}

// 토큰 검증
export function verifyEditToken(token: string, registrationId: number, email: string): boolean {
  const expectedToken = generateEditToken(registrationId, email);
  return token === expectedToken;
}

// 영업용 토큰 생성 (reviews ID 기반)
export function generateSalesToken(reviewId: number): string {
  const salt = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default-salt';
  const data = `sales-${reviewId}-${salt}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 32);
}

// 영업용 토큰 검증
export function verifySalesToken(token: string, reviewId: number): boolean {
  const expectedToken = generateSalesToken(reviewId);
  return token === expectedToken;
}