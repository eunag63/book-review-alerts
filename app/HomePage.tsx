// app/HomePage.tsx
'use client'

import { useState, useEffect } from 'react'
import type { ReviewWithBadge } from '../lib/clickAnalytics'
import { getReviewsByPeriod, getAvailablePeriods, calcDDay, isCreatedToday, isDeadlineValid } from '../lib/reviewUtils'
import { assignBadgesToReviews } from '../lib/clickAnalytics'
// import BannerAd from './components/BannerAd'
import SearchReviews from './components/SearchReviews'
import DescriptionBubble from './components/DescriptionBubble'
import { useAuth } from '../lib/authContext'

export default function HomePage() {
  const { user } = useAuth()
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0)
  const [reviews, setReviews] = useState<ReviewWithBadge[]>([])
  const [periodText, setPeriodText] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [urgentDeadline, setUrgentDeadline] = useState<{
    id: number
    book_title: string
    deadline: string
    submission_status: 'pending' | 'submitted'
  } | null>(null)
  const validReviews = reviews.filter(isDeadlineValid)
  const displayReviews = showAll ? validReviews : validReviews.slice(0, 2)

  useEffect(() => {
    async function loadInitialData() {
      const available = await getAvailablePeriods()
      setAvailablePeriods(available)
      
      if (available.length > 0) {
        const initial = available[0]
        const initialData = await getReviewsByPeriod(initial)
        // 배지 할당
        const reviewsWithBadges = await assignBadgesToReviews(initialData.reviews)
        setReviews(reviewsWithBadges)
        setPeriodText(initialData.periodText)
      }
      setLoading(false)
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    if (user) {
      fetchUrgentDeadline()
    }
  }, [user])

  const fetchUrgentDeadline = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/deadlines?user_id=${user.id}`)
      const result = await response.json()

      if (result.success && result.deadlines.length > 0) {
        const today = new Date()
        const todayString = today.getFullYear() + '-' + 
          String(today.getMonth() + 1).padStart(2, '0') + '-' + 
          String(today.getDate()).padStart(2, '0')

        // 가장 가까운 마감일 찾기 (오늘 이후)
        const upcomingDeadlines = result.deadlines.filter((d: { deadline: string }) => d.deadline >= todayString)
        if (upcomingDeadlines.length > 0) {
          setUrgentDeadline(upcomingDeadlines[0])
        }
      }
    } catch (error) {
      console.error('마감일 조회 오류:', error)
    }
  }

  const getDaysRemaining = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return '마감'
    if (diffDays === 0) return 'D-day'
    return `D-${diffDays}`
  }

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
      // 배지 할당
      const reviewsWithBadges = await assignBadgesToReviews(result.reviews)
      setReviews(reviewsWithBadges)
      setPeriodText(result.periodText)
    }
    setLoading(false)
  }

  const canGoPrev = currentPeriodIndex > 0
  const canGoNext = currentPeriodIndex < availablePeriods.length - 1

  if (loading) {
    return (
      <div className="min-h-screen">
        <p className="text-center text-gray-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 로그인한 사용자의 긴급 마감일 표시 */}
      {user && urgentDeadline && (
        <section className="mb-6 p-4 bg-[#80FD8F] text-black rounded">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">🍀 다가오는 마감일</h3>
              <p className="font-medium">{urgentDeadline.book_title}</p>
              <p className="text-xs">
                {urgentDeadline.deadline} ({getDaysRemaining(urgentDeadline.deadline)})
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/my-deadlines'}
              className="bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-800 transition-colors"
            >
              전체 보기
            </button>
          </div>
        </section>
      )}
      
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
                {periodText} 서평단 <span className="text-point">{validReviews.length}개</span>
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
            {validReviews.length > 0 ? (
              <>
                <ul className="mt-4 space-y-2">
                  {displayReviews.map((r) => (
                    <li key={r.id} className="p-4 border rounded relative">
                      {/* NEW 배지 */}
                      {isCreatedToday(r) && (
                        <span 
                          className="absolute top-4 right-3 text-xs font-bold px-1 py-0.5 rounded text-black"
                          style={{ backgroundColor: '#80FD8F', fontSize: '10px' }}
                        >
                          NEW
                        </span>
                      )}
                      <p className="font-medium pr-12">{r.title}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        {[r.publisher, r.author, r.genre].filter(Boolean).join(' | ')}
                      </p>
                      {(() => {
                        const dday = calcDDay(r.deadline)
                        return dday !== 'D-day' ? <p className="text-sm text-point mb-1">{dday}</p> : null
                      })()}
                      <div className="flex justify-between items-center">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-point underline text-sm mt-1 inline-block"
                        >
                          신청하러 가기
                        </a>
                        {/* 배지를 오른쪽 아래에 작은 글자로 */}
                        {r.badge && (
                          <span 
                            className="text-xs mt-1 font-medium"
                            style={{ color: '#80FD8F' }}
                          >
                            {r.badge}
                          </span>
                        )}
                      </div>

                      {r.source === 'registration' && r.registration_id ? (
                        <DescriptionBubble registrationId={r.registration_id} />
                      ) : null}
                    </li>
                  ))}
                </ul>
                {validReviews.length > 2 && (
                  <div className="pt-3 mt-3">
                    <button
                      onClick={() => setShowAll((prev) => !prev)}
                      className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showAll ? '△ 접기' : '▽ 더보기'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">현재 {periodText} 서평단이 없습니다.</p>
            )}
          </>
        )}
      </section>

      {/* <BannerAd /> */}
      <SearchReviews />
    </div>
  )
}