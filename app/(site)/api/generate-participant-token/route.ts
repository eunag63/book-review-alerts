import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { reviewId, participantCount } = await request.json();

    if (!reviewId || !participantCount) {
      return NextResponse.json(
        { error: '서평단 ID와 참가자 수가 필요합니다.' },
        { status: 400 }
      );
    }

    // 참가자 토큰들 생성
    const tokens = [];
    for (let i = 1; i <= participantCount; i++) {
      const data = `participant-${reviewId}-${i}-${Date.now()}-${Math.random()}`;
      const token = createHash('sha256').update(data).digest('hex').substring(0, 32);
      
      tokens.push({
        participantNumber: i,
        token,
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/participant/${token}`
      });
    }

    return NextResponse.json({
      reviewId,
      participantCount,
      tokens
    });

  } catch (error) {
    console.error('참가자 토큰 생성 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}