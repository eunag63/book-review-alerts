import { Metadata } from 'next'
import { getReviewCountsByPeriod } from '../../../lib/reviewUtils'
import TodayClient from './TodayClient'

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params
  const counts = await getReviewCountsByPeriod()
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://freebook.kr'
  const ogImageUrl = `${baseUrl}/api/og-image?date=${date}`
  
  const title = `${counts.today}개의 서평단이 오늘 마감! - 프리북`
  const description = `오늘 마감: ${counts.today}개, 이번주: ${counts.thisWeek}개, 다음주: ${counts.nextWeek}개`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/today/${date}`,
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
  }
}

export default function TodayPage() {
  return <TodayClient />
}