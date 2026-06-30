'use client'

export default function TodayClient() {
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