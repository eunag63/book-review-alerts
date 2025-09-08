import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

// 마감일이 지나지 않은 리뷰 데이터 조회 (영업용 링크 생성용)
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    const { data, error } = await supabase
      .from('reviews')
      .select('id, title, author, publisher, url, deadline, source, created_at')
      .gte('deadline', today) // 오늘 이후 마감일만
      .order('created_at', { ascending: false }); // 최신 등록순으로 정렬

    if (error) {
      console.error('리뷰 데이터 조회 오류:', error);
      return NextResponse.json(
        { error: '데이터 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reviews: data || []
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}