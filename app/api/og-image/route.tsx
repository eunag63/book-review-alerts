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
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
            fontFamily: 'system-ui, sans-serif',
            padding: '40px',
          }}
        >
          {/* 하얀 테두리 컨테이너 */}
          <div
            style={{
              border: '2px solid rgba(79, 209, 199, 0.3)',
              borderRadius: '20px',
              padding: '40px',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(79, 209, 199, 0.02)',
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
                <span style={{ color: '#4fd1c7', fontWeight: '900', textShadow: '0 0 10px rgba(79, 209, 199, 0.5)' }}>{count}</span>
                <span>개</span>
              </div>
              
              {/* 배지 */}
              {showBadge && (
                <div
                  style={{
                    display: 'flex',
                    background: '#4fd1c7',
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
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
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
      }
    )
  }
}