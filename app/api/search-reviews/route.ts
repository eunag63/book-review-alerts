import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');

    if (!title) {
      return NextResponse.json(
        { error: '제목이 필요합니다.' },
        { status: 400 }
      );
    }

    // reviews 테이블에서 제목으로 검색 (부분 일치)
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .ilike('title', `%${title}%`)
      .limit(5); // 최대 5개 결과만 반환

    if (error) {
      console.error('검색 오류:', error);
      return NextResponse.json(
        { error: '검색에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      results: data || []
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}