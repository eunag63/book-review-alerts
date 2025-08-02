// lib/metadata.ts
import { Metadata } from 'next'
import { getReviewCountsByPeriod } from './reviewUtils'

export async function generateDynamicMetadata(): Promise<Metadata> {
  const counts = await getReviewCountsByPeriod()
  
  // 우선순위에 따른 메시지 생성
  let title = "📚 책 서평단 알림"
  let description = "새로운 서평단 모집 정보를 확인하세요!"
  
  if (counts.today > 0) {
    title = `🔥 오늘 마감! 서평단 ${counts.today}개`
    description = `오늘 마감되는 서평단 ${counts.today}개가 있습니다. 놓치지 마세요!`
  } else if (counts.thisWeek > 0) {
    title = `⏰ 이번주 마감 서평단 ${counts.thisWeek}개`
    description = `이번주 마감되는 서평단 ${counts.thisWeek}개를 확인하고 신청하세요!`
  } else if (counts.nextWeek > 0) {
    title = `📅 다음주 마감 서평단 ${counts.nextWeek}개`
    description = `다음주 마감되는 서평단 ${counts.nextWeek}개가 준비되어 있습니다.`
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'
  const ogImageUrl = `${baseUrl}/api/og-image?today=${counts.today}&thisWeek=${counts.thisWeek}&nextWeek=${counts.nextWeek}`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: '책 서평단 알림',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    keywords: ['서평단', '책', '독서', '리뷰', '무료도서'],
    authors: [{ name: '책 서평단 알림' }],
    creator: '책 서평단 알림',
    publisher: '책 서평단 알림',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// 기본 메타데이터 (에러 시 사용)
export const defaultMetadata: Metadata = {
  title: '📚 책 서평단 알림',
  description: '새로운 서평단 모집 정보를 확인하세요!',
  openGraph: {
    title: '📚 책 서평단 알림',
    description: '새로운 서평단 모집 정보를 확인하세요!',
    images: ['/default-og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '📚 책 서평단 알림',
    description: '새로운 서평단 모집 정보를 확인하세요!',
  },
}