// lib/metadata.ts
import { Metadata } from 'next'
import { getReviewCountsByPeriod } from './reviewUtils'

export async function generateDynamicMetadata(): Promise<Metadata> {
  const counts = await getReviewCountsByPeriod()
  
  const title = "프리북 - 책 서평단 모음"
  const description = "새로운 서평단 모집 정보를 확인하세요!"

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'
  // 데이터 기반 해시 생성 (데이터가 같으면 같은 URL)
  const dataString = `${counts.today}-${counts.thisWeek}-${counts.nextWeek}`
  const hash = Buffer.from(dataString).toString('base64').replace(/[^a-zA-Z0-9]/g, '')
  const ogImageUrl = `${baseUrl}/api/og-image?today=${counts.today}&thisWeek=${counts.thisWeek}&nextWeek=${counts.nextWeek}&v=${hash}`
  
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

export const defaultMetadata: Metadata = {
  title: '프리북 - 책 서평단 모음',
  description: '새로운 서평단 모집 정보를 확인하세요!',
  openGraph: {
    title: '프리북 - 책 서평단 모음',
    description: '새로운 서평단 모집 정보를 확인하세요!',
    images: ['/default-og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '프리북 - 책 서평단 모음',
    description: '새로운 서평단 모집 정보를 확인하세요!',
  },
}