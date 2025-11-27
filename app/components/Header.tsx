'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const pathname = usePathname()
  const isPublisherPage = pathname?.startsWith('/publisher/')
  const isWinnersPage = pathname?.startsWith('/winners/')
  const isSubmitPage = pathname?.startsWith('/submit/')
  const [isApp, setIsApp] = useState(false)
  
  // 앱에서 접근하는지 확인 (User-Agent로 감지)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsApp(navigator.userAgent.includes('BookReviewAlerts-App'))
    }
  }, [])

  return (
    <header style={{ backgroundColor: '#0a0a0a' }} className="pl-10 pr-6 py-5 flex items-center justify-between">
      <Link href="/" className="block">
        <h1 className="text-white text-2xl font-bold tracking-tight m-0 hover:opacity-80 transition-opacity" style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
          {!isApp && <span className="text-[#80FD8F]">freebook</span>} {isPublisherPage ? '출판사 대시보드' : isWinnersPage ? '서평단 개인정보 입력' : isSubmitPage ? '서평 링크 제출' : !isApp ? '책 서평단 모음' : ''}
        </h1>
      </Link>
      
      {/* 앱에서만 알림 설정 버튼 표시 */}
      {isApp && (
        <button 
          onClick={() => {
            // React Native와 통신하여 알림 설정 화면으로 이동
            if ((window as any).ReactNativeWebView) {
              (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'NAVIGATE_TO_SETTINGS' }));
            }
          }}
          className="text-xl hover:opacity-80 transition-opacity"
        >
          🔔
        </button>
      )}
    </header>
  )
}