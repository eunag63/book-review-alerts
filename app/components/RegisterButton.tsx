'use client'

import { useState, useEffect } from 'react'

export default function RegisterButton() {
  const [isApp, setIsApp] = useState(false)
  
  // 앱에서 접근하는지 확인 (User-Agent로 감지)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsApp(navigator.userAgent.includes('BookReviewAlerts-App'))
    }
  }, [])

  // 앱에서는 등록 버튼 숨기기
  if (isApp) {
    return null
  }

  return (
    <div className="bg-[#80FD8F] py-1 flex items-center relative">
      <div className="absolute left-0 top-0 bottom-0 right-32 opacity-20 text-black text-xs font-bold whitespace-nowrap overflow-hidden flex items-center justify-end">
&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;
      </div>
      <div className="flex-1"></div>
      <a 
        href="/register"
        className="text-black font-medium hover:text-gray-700 transition-colors text-sm whitespace-nowrap mr-6"
      >
        서평단 등록하기
      </a>
    </div>
  )
}