'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Review } from '../lib/types'
import BannerAd from './components/BannerAd'
import SearchReviews from './components/SearchReviews'

function getKoreanDate(): Date {
  return new Date()
}

function getDateString(date: Date): string {
  return date.toLocaleDateString('en-CA')
}

function getWeekRange(date: Date): { start: string; end: string } {
  const current = new Date(date)
  const dayOfWeek = current.getDay() === 0 ? 7 : current.getDay()
  const monday = new Date(current)
  monday.setDate(current.getDate() - dayOfWeek + 1)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    start: getDateString(monday),
    end: getDateString(sunday),
  }
}

function calcDDay(deadline: string): string {
  const today = getKoreanDate()
  const target = new Date(deadline)
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff <= 0 ? 'D-day' : `D-${diff}`
}

async function getReviewsByPeriod(period: string) {
  const today = getKoreanDate()
  let query = supabase.from('reviews').select('*')
  let periodText = ''

  if (period === '오늘') {
    query = query.eq('deadline', getDateString(today))
    periodText = '오늘 마감되는'
  } else if (period === '이번주') {
    const weekRange = getWeekRange(today)
    query = query.gte('deadline', getDateString(today)).lte('deadline', weekRange.end)
    periodText = '이번주 마감되는'
  } else if (period === '다음주') {
    const { start: thisMon, end: thisSun } = getWeekRange(today)
    const nextMon = new Date(thisMon)
    nextMon.setDate(nextMon.getDate() + 7)
    const nextSun = new Date(thisSun)
    nextSun.setDate(nextSun.getDate() + 7)
    query = query.gte('deadline', getDateString(nextMon)).lte('deadline', getDateString(nextSun))
    periodText = '다음주 마감되는'
  }

  const { data, error } = await query.order('deadline', { ascending: true })
  if (error) {
    return { reviews: [], periodText, error }
  }
  return { reviews: (data as Review[]) || [], periodText, error: null }
}

export default function HomePage() {
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [periodText, setPeriodText] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const displayReviews = showAll ? reviews : reviews.slice(0, 2)

  useEffect(() => {
    async function loadInitialData() {
      const periods = ['오늘', '이번주', '다음주']
      const available: string[] = []
      for (const period of periods) {
        const result = await getReviewsByPeriod(period)
        if (result.reviews.length > 0) {
          available.push(period)
        }
      }
      setAvailablePeriods(available)
      if (available.length > 0) {
        const initial = available[0]
        const initialData = await getReviewsByPeriod(initial)
        setReviews(initialData.reviews)
        setPeriodText(initialData.periodText)
      }
      setLoading(false)
    }
    loadInitialData()
  }, [])

  const handlePeriodChange = async (direction: 'prev' | 'next') => {
    const newIndex =
      direction === 'prev'
        ? Math.max(0, currentPeriodIndex - 1)
        : Math.min(availablePeriods.length - 1, currentPeriodIndex + 1)
    if (newIndex === currentPeriodIndex) return
    setLoading(true)
    const period = availablePeriods[newIndex]
    const result = await getReviewsByPeriod(period)
    if (!result.error) {
      setCurrentPeriodIndex(newIndex)
      setReviews(result.reviews)
      setPeriodText(result.periodText)
    }
    setLoading(false)
  }

  const canGoPrev = currentPeriodIndex > 0
  const canGoNext = currentPeriodIndex < availablePeriods.length - 1

  if (loading) {
    return (
      <main className="min-h-screen p-6 max-w-md mx-auto">
        <p className="text-center text-gray-500">로딩 중...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <section className="mb-8">
        {availablePeriods.length === 0 ? (
          <>
            <h2 className="text-xl font-semibold mb-2">
              마감 예정인 서평단 <span className="text-point">0개</span>
            </h2>
            <p className="text-gray-500">현재 마감 예정인 서평단이 없습니다.</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">
                {periodText} 서평단 <span className="text-point">{reviews.length}개</span>
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePeriodChange('prev')}
                  disabled={!canGoPrev || loading}
                  className={`text-xl ${canGoPrev && !loading ? 'text-point' : 'text-gray-300'}`}
                >
                  ◁
                </button>
                <button
                  onClick={() => handlePeriodChange('next')}
                  disabled={!canGoNext || loading}
                  className={`text-xl ${canGoNext && !loading ? 'text-point' : 'text-gray-300'}`}
                >
                  ▷
                </button>
              </div>
            </div>
            {reviews.length > 0 ? (
              <>
                <ul className="mt-4 space-y-2">
                  {displayReviews.map((r) => (
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
                {reviews.length > 2 && (
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="mt-2 text-point underline"
                  >
                    {showAll ? '접기' : '더보기'}
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-500">현재 {periodText} 서평단이 없습니다.</p>
            )}
          </>
        )}
        
      </section>

      <BannerAd />
      <SearchReviews />
    </main>
  )
}
