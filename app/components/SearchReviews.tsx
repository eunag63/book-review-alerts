// app/components/SearchReviews.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Review } from '../../lib/types'

export default function SearchReviews() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)

  // D-Day 계산 함수
  const calcDDay = (deadline: string) => {
    const today = new Date()
    const target = new Date(deadline)
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return `D-${diff}`
  }

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!query) {
        setResults([])
        return
      }
      setLoading(true)
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .or(
          `title.ilike.%${query}%,` +
          `author.ilike.%${query}%,` +
          `publisher.ilike.%${query}%`
        )
      if (!error && data) {
        const list = data as Review[]
        // 마감일이 이른 순서로 정렬
        list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        setResults(list)
      }
      setLoading(false)
    }, 300)

    return () => clearTimeout(handler)
  }, [query])

  return (
    <div className="mb-6">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="검색어를 입력해주세요"
        className="w-full border-b border-gray-300 pb-1 focus:border-point focus:outline-none"
      />

      {loading && <p className="text-sm text-gray-500 mt-2">검색 중...</p>}

      {!loading && query !== '' && results.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">검색 결과가 없습니다.</p>
      )}

      {!loading && results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map(r => (
            <li key={r.id} className="p-4 border rounded">
              <p className="font-medium">{r.title}</p>
              <p className="text-sm text-gray-600 mb-1">
                {r.publisher} | {r.author}
              </p>
              <p className="text-sm text-point mb-1">{calcDDay(r.deadline)}</p>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-point underline text-sm mt-1 inline-block"
              >
                신청하러 가기
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
