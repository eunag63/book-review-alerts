'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function RecommendationChips({
  onSelect,
  limit = 5,
}: {
  onSelect: (kw: string) => void
  limit?: number
}) {
  const [keywords, setKeywords] = useState<string[]>([])

  useEffect(() => {
    ;(async () => {
      // 1) 클릭 로그에서 리뷰 메타데이터(join) 가져오기
      const { data, error } = await supabase
        .from('log_clicks')
        .select(`
          review:review_id (
            genre,
            author_gender,
            nationality,
            type,
            category
          )
        `) // implicit FK join
      if (error) {
        console.error('로그 조회 에러', error)
        return
      }
      // 2) 모든 필드 값을 하나의 배열로 합치고, 빈 문자열·null 필터링
      const allTags = (data || [])
        .flatMap((row) => {
          const r = (row as any).review
          return [
            r.genre,
            r.author_gender,
            r.nationality,
            r.type,
            r.category,
          ].filter((v) => typeof v === 'string' && v !== '')
        })

      // 3) 빈도수 집계
      const freqMap: Record<string, number> = {}
      allTags.forEach((tag) => {
        freqMap[tag] = (freqMap[tag] || 0) + 1
      })

      // 4) 빈도 높은 순으로 정렬해 상위 limit개만 추출
      const sorted = Object.entries(freqMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([kw]) => kw)

      setKeywords(sorted)
    })()
  }, [limit])

  if (keywords.length === 0) return null

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2">✨ 추천 키워드</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <button
            key={kw}
            onClick={() => onSelect(kw)}
            className="px-3 py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-100"
          >
            {kw}
          </button>
        ))}
      </div>
    </div>
  )
}
