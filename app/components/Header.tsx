'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/authContext'
import KakaoLogin from './KakaoLogin'

export default function Header() {
  const pathname = usePathname()
  const { user, logout, login } = useAuth()
  const isPublisherPage = pathname?.startsWith('/publisher/')
  const isWinnersPage = pathname?.startsWith('/winners/')
  const isSubmitPage = pathname?.startsWith('/submit/')
  const isMyDeadlinesPage = pathname === '/my-deadlines'

  const handleLoginSuccess = (userInfo: { id: number; email?: string; nickname?: string; profile_image?: string; access_token: string }) => {
    console.log('로그인 성공:', userInfo)
    // AuthContext의 login 함수 호출해서 상태 업데이트
    login({
      id: userInfo.id,
      kakao_id: 0, // 실제 kakao_id는 서버에서 관리
      email: userInfo.email,
      nickname: userInfo.nickname,
      profile_image: userInfo.profile_image
    })
  }

  return (
    <header style={{ backgroundColor: '#0a0a0a' }} className="pl-10 pr-6 py-5">
      <div className="flex items-center justify-between">
        <Link href="/" className="block">
          <h1 className="text-white text-2xl font-bold tracking-tight m-0 hover:opacity-80 transition-opacity" style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            <span className="text-[#80FD8F]">freebook</span> {isPublisherPage ? '출판사 대시보드' : isWinnersPage ? '서평단 개인정보 입력' : isSubmitPage ? '서평 링크 제출' : isMyDeadlinesPage ? '내 서평단 마감일' : '책 서평단 모음'}
          </h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href="/my-deadlines"
                className="text-white text-sm hover:text-gray-300 transition-colors"
              >
                내 마감일
              </Link>
              <button
                onClick={logout}
                className="text-white text-sm hover:text-gray-300 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <KakaoLogin onLoginSuccess={handleLoginSuccess} />
          )}
        </div>
      </div>
    </header>
  )
}