import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: '페이지를 가져올 수 없습니다.' }, { status: 400 });
    }

    const html = await response.text();
    
    // 간단한 정규표현식으로 메타 태그 파싱
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descriptionMatch = html.match(/<meta[^>]*name=['"']description['"'][^>]*content=['"']([^'"]*)['"'][^>]*>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=['"']og:title['"'][^>]*content=['"']([^'"]*)['"'][^>]*>/i);
    const ogDescriptionMatch = html.match(/<meta[^>]*property=['"']og:description['"'][^>]*content=['"']([^'"]*)['"'][^>]*>/i);
    const ogImageMatch = html.match(/<meta[^>]*property=['"']og:image['"'][^>]*content=['"']([^'"]*)['"'][^>]*>/i);

    const title = ogTitleMatch?.[1] || titleMatch?.[1] || '제목 없음';
    const description = ogDescriptionMatch?.[1] || descriptionMatch?.[1] || '설명 없음';
    const image = ogImageMatch?.[1] || '';
    const domain = new URL(url).hostname;

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image: image,
      domain: domain
    });

  } catch (error) {
    console.error('링크 미리보기 오류:', error);
    return NextResponse.json({ error: '미리보기를 가져올 수 없습니다.' }, { status: 500 });
  }
}