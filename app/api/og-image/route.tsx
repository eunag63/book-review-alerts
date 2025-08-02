// app/api/og-image/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const today = searchParams.get('today') || '0'
    const thisWeek = searchParams.get('thisWeek') || '0'
    const nextWeek = searchParams.get('nextWeek') || '0'

    const todayCount = parseInt(today, 10)
    const thisWeekCount = parseInt(thisWeek, 10)
    const nextWeekCount = parseInt(nextWeek, 10)

    // 메시지 결정
    let mainText = '📚 책 서평단 알림'
    let subText = '새로운 서평단 모집 정보'
    let bgColor = '#667eea'

    if (todayCount > 0) {
      mainText = '🔥 오늘 마감!'
      subText = `서평단 ${todayCount}개`
      bgColor = '#ff4757'
    } else if (thisWeekCount > 0) {
      mainText = '⏰ 이번주 마감'
      subText = `서평단 ${thisWeekCount}개`
      bgColor = '#ffa502'
    } else if (nextWeekCount > 0) {
      mainText = '📅 다음주 마감'
      subText = `서평단 ${nextWeekCount}개`
      bgColor = '#3742fa'
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bgColor,
            fontFamily: 'system-ui, sans-serif',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              marginBottom: '20px',
            }}
          >
            📚
          </div>
          
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '16px',
            }}
          >
            {mainText}
          </div>
          
          <div
            style={{
              fontSize: '32px',
              fontWeight: '600',
            }}
          >
            {subText}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    
    // 에러 시 기본 이미지 반환
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#667eea',
            color: 'white',
            fontSize: '48px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          📚 책 서평단 알림
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}