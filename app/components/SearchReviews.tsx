'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Review } from '../../lib/types'
import KeywordFilter from './KeywordFilter'

export default function SearchReviews() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)

  // 전체 리뷰를 불러오는 함수
  const loadAllReviews = useCallback(async () => {
    const { data, error } = await supabase.from('reviews').select('*')
    if (!error && data) {
      const list = data as Review[]
      list.sort((a, b) => b.id - a.id) // 최신순 정렬
      setResults(list)
    }
  }, [])

  // 컴포넌트 마운트시 전체 리스트 로드
  useEffect(() => {
    loadAllReviews()
  }, [loadAllReviews])

  const calcDDay = (deadline: string) => {
    const today = new Date()
    const target = new Date(deadline)
    const diff = Math.ceil(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    return diff <= 0 ? 'D-day' : `D-${diff}`
  }

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query) {
        // 검색어가 없으면 전체 리스트 다시 로드
        loadAllReviews()
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
        list.sort(
          (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
        setResults(list)
      }
      setLoading(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, loadAllReviews])

  // 키워드 필터링
  const searchByFilters = useCallback(async (filters: { genre?: string; authorGender?: string; nationality?: string }) => {
    setLoading(true)
    
    // 필터가 없으면 전체 데이터 가져오기
    if (Object.keys(filters).length === 0) {
      await loadAllReviews()
      setLoading(false)
      return
    }
    
    // 필터가 있으면 조건에 맞는 데이터만 가져오기
    let queryBuilder = supabase.from('reviews').select('*')
    
    if (filters.genre) {
      queryBuilder = queryBuilder.eq('category', filters.genre)
    }
    if (filters.authorGender) {
      const dbValue = filters.authorGender === '여성 작가' ? '여자' : '남자'
      queryBuilder = queryBuilder.eq('author_gender', dbValue)
    }
    if (filters.nationality) {
      queryBuilder = queryBuilder.eq('nationality', filters.nationality)
    }
    
    const { data, error } = await queryBuilder
    if (!error && data) {
      const list = data as Review[]
      list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      setResults(list)
    }
    setLoading(false)
  }, [loadAllReviews])

  const handleClick = async (reviewId: number) => {
    await supabase.from('log_clicks').insert([{ review_id: reviewId }])
  }

  return (
    <div className="mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색어를 입력해주세요"
        className="w-full border-b border-gray-300 pb-1 focus:border-point focus:outline-none mb-4"
      />

      <KeywordFilter onFilter={searchByFilters} />

      {loading && <p className="text-sm text-gray-500 mt-2">검색 중...</p>}

      {!loading && query !== '' && results.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">검색 결과가 없습니다.</p>
      )}

      {!loading && results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((r) => (
            <li key={r.id} className="p-4 border rounded">
              <p className="font-medium">{r.title}</p>
              <p className="text-sm text-gray-600 mb-1">
                {r.publisher} | {r.author}
              </p>
              <p className="text-sm text-point mb-1">{calcDDay(r.deadline)}</p>
              <a
                href={r.url}
                onClick={() => handleClick(r.id)}
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