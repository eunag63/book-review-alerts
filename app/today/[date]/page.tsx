import { Metadata } from 'next'
import { getReviewCountsByPeriod } from '../../../lib/reviewUtils'
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

'use client'

export default function TodayPage() {
  // 클라이언트에서 즉시 메인으로 리다이렉트
  if (typeof window !== 'undefined') {
    window.location.href = '/'
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#80FD8F] mx-auto mb-4"></div>
        <p>메인 페이지로 이동 중...</p>
      </div>
    </div>
  )
}