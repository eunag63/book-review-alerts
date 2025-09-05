'use client'

import { useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function RedirectClient({ id }: { id: string }) {
  useEffect(() => {
    async function handleRedirect() {
      try {
        // 1. 리뷰 정보 가져오기
        const { data: review, error } = await supabase
          .from('reviews')
          .select('url')
          .eq('id', id)
          .single()

        if (error || !review) {
          console.error('리뷰를 찾을 수 없음:', error)
          // 메인 페이지로 리다이렉트
          window.location.href = '/'
          return
        }

        // 2. 클릭수 로깅
        await supabase
          .from('log_clicks')
          .insert([{ review_id: parseInt(id) }])

        // 3. 실제 서평단 URL로 리다이렉트
        console.log('리다이렉트 URL:', review.url)
        // window.location.href = review.url // 개발용으로 잠시 비활성화
      } catch (error) {
        console.error('리다이렉트 오류:', error)
        window.location.href = '/'
      }
    }

    if (id) {
      handleRedirect()
    }
  }, [id])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">서평단 페이지로 이동 중...</p>
      </div>
    </div>
  )
}