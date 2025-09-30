'use client'

import { useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function RedirectClient({ id }: { id: string }) {
  useEffect(() => {
    async function handleRedirect() {
      try {
        // URL에서 source 파라미터 가져오기 (수동 설정)
        const urlParams = new URLSearchParams(window.location.search)
        let source = urlParams.get('source')
        
        // source가 없으면 Referer로 자동 감지
        if (!source) {
          const referer = document.referrer
          if (referer.includes('twitter.com') || referer.includes('t.co')) {
            source = 'twitter'
          } else if (referer.includes('facebook.com') || referer.includes('instagram.com') || referer.includes('linkedin.com')) {
            source = 'external'
          } else if (referer && !referer.includes(window.location.hostname)) {
            // 다른 외부 사이트에서 온 경우
            source = 'external'
          } else {
            // 직접 접근하거나 같은 사이트에서 온 경우
            source = 'website'
          }
        }

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

        // 2. 클릭수 로깅 (source 포함)
        await supabase
          .from('log_clicks')
          .insert([{ 
            review_id: parseInt(id),
            source: source 
          }])

        // 3. 실제 서평단 URL로 리다이렉트
        window.location.href = review.url
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