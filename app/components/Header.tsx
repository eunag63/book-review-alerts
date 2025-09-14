'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const pathname = usePathname()
  const isPublisherPage = pathname?.startsWith('/publisher/')
  const isWinnersPage = pathname?.startsWith('/winners/')

  return (
    <header style={{ backgroundColor: '#0a0a0a' }} className="pl-10 pr-6 py-5">
      <Link href="/" className="block">
        <h1 className="text-white text-2xl font-bold tracking-tight m-0 hover:opacity-80 transition-opacity" style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
          <span className="text-[#80FD8F]">freebook</span> {isPublisherPage ? '출판사 대시보드' : isWinnersPage ? '서평단 개인정보 입력' : '책 서평단 모음'}
        </h1>
      </Link>
    </header>
  )
}