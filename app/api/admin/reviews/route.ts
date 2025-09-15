import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

// 모든 리뷰 데이터 조회 (서평단 관리용)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, title, author, publisher, url, deadline, source, created_at')
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