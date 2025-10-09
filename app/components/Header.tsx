'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/authContext'
import KakaoLogin from './KakaoLogin'

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const isPublisherPage = pathname?.startsWith('/publisher/')
  const isWinnersPage = pathname?.startsWith('/winners/')
  const isSubmitPage = pathname?.startsWith('/submit/')

  const handleLoginSuccess = (userInfo: { id: number; email?: string; nickname?: string; profile_image?: string; access_token: string }) => {
    console.log('로그인 성공:', userInfo)
    // 실제로는 API를 통해 사용자 정보를 저장하고 토큰을 받아야 함
  }

  return (
    <header style={{ backgroundColor: '#0a0a0a' }} className="pl-10 pr-6 py-5">
      <div className="flex items-center justify-between">
        <Link href="/" className="block">
          <h1 className="text-white text-2xl font-bold tracking-tight m-0 hover:opacity-80 transition-opacity" style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            <span className="text-[#80FD8F]">freebook</span> {isPublisherPage ? '출판사 대시보드' : isWinnersPage ? '서평단 개인정보 입력' : isSubmitPage ? '서평 링크 제출' : '책 서평단 모음'}
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-white text-sm">
                안녕하세요, {user.nickname || '사용자'}님!
              </span>
              <button
                onClick={logout}
                className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="scale-75">
              <KakaoLogin onLoginSuccess={handleLoginSuccess} />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}