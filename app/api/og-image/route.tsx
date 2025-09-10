// app/api/og-image/route.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// 캐시 무효화
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getReviewCountsByPeriod } from '../../../lib/reviewUtils'

export async function GET() {
  try {
    console.log('=== OG Image API 호출 ===')
    const counts = await getReviewCountsByPeriod()
    console.log('DB에서 가져온 개수:', counts)
    
    const todayCount = counts.today
    const thisWeekCount = counts.thisWeek  
    const nextWeekCount = counts.nextWeek
    
    console.log('사용할 개수:', { todayCount, thisWeekCount, nextWeekCount })

    // 메시지 결정
    let mainText = '새로운 서평단 모집'
    let count = '0'
    let showBadge = false

    if (todayCount > 0) {
      mainText = '오늘 마감 서평단'
      count = todayCount.toString()
      showBadge = true
    } else if (thisWeekCount > 0) {
      mainText = '이번주 마감 서평단'
      count = thisWeekCount.toString()
      showBadge = true
    } else if (nextWeekCount > 0) {
      mainText = '다음주 마감 서평단'
      count = nextWeekCount.toString()
      showBadge = true
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000000',
            fontFamily: 'system-ui, sans-serif',
            padding: '40px',
          }}
        >
          {/* 하얀 테두리 컨테이너 */}
          <div
            style={{
              border: '2px solid white',
              borderRadius: '20px',
              padding: '40px',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
            }}
          >
            {/* 내용 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              {/* 메인 텍스트 */}
              <div
                style={{
                  display: 'flex',
                  fontSize: '72px',
                  fontWeight: '900',
                  color: 'white',
                  marginBottom: showBadge ? '64px' : '0',
                  lineHeight: '1.2',
                  gap: '16px',
                }}
              >
                <span>{mainText}</span>
                <span>{count}개</span>
              </div>
              
              {/* 배지 */}
              {showBadge && (
                <div
                  style={{
                    display: 'flex',
                    background: '#80FD8F',
                    color: '#000',
                    padding: '16px 40px',
                    borderRadius: '40px',
                    fontSize: '28px',
                    fontWeight: '600',
                  }}
                >
                  지금 확인하기
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
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
            background: '#000000',
            fontFamily: 'system-ui, sans-serif',
            padding: '40px',
          }}
        >
          <div
            style={{
              border: '2px solid white',
              borderRadius: '20px',
              padding: '40px',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '72px',
                fontWeight: '600',
                color: 'white',
                textAlign: 'center',
              }}
            >
              책 서평단 알림
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  }
}