import { supabase } from './supabaseClient'
import type { Review } from './types'

export interface ReviewWithBadge extends Review {
  badge?: '🔥 인기 서평단' | '⭐ 주목받는 서평단' | '🚀 급상승 서평단' | null
  clickCount: number
}

// 간단한 배지 할당 함수 (기존 리뷰에 배지만 추가)  
export async function assignBadgesToReviews(reviews: Review[]): Promise<ReviewWithBadge[]> {
  const reviewsWithBadges = await getReviewsWithBadges()
  const badgeMap = new Map<number, string>()
  
  reviewsWithBadges.forEach(r => {
    if (r.badge) {
      badgeMap.set(r.id, r.badge)
    }
  })
  
  return reviews.map(review => ({
    ...review,
    clickCount: 0,
    badge: (badgeMap.get(review.id) as '🔥 인기 서평단' | '⭐ 주목받는 서평단' | '🚀 급상승 서평단' | null) || null
  }))
}

// 클릭 데이터로부터 리뷰 정보와 배지를 함께 가져오는 함수
export async function getReviewsWithBadges(): Promise<ReviewWithBadge[]> {
  const today = new Date().toLocaleDateString('en-CA')
  
  // 1. 마감 안 지난 리뷰들의 전체 클릭수 집계
  const { data: clickData, error: clickError } = await supabase
    .from('log_clicks')
    .select(`
      review_id,
      reviews!inner(*)
    `)
    .gte('reviews.deadline', today)
  
  if (clickError) {
    console.error('클릭 데이터 조회 에러:', clickError)
    return []
  }
  
  // 2. 클릭수 집계
  const reviewClickMap = new Map<number, { review: Review, clickCount: number }>()
  
  clickData?.forEach(log => {
    const reviewId = log.review_id
    const reviewData = (log.reviews as unknown) as Review
    
    if (reviewClickMap.has(reviewId)) {
      reviewClickMap.get(reviewId)!.clickCount++
    } else {
      reviewClickMap.set(reviewId, {
        review: reviewData,
        clickCount: 1
      })
    }
  })
  
  // 3. 클릭수가 0인 리뷰들도 추가 (마감 안 지난 모든 리뷰)
  const { data: allActiveReviews, error: reviewError } = await supabase
    .from('reviews')
    .select('*')
    .gte('deadline', today)
  
  if (reviewError) {
    console.error('전체 리뷰 조회 에러:', reviewError)
    return []
  }
  
  allActiveReviews?.forEach(review => {
    if (!reviewClickMap.has(review.id)) {
      reviewClickMap.set(review.id, {
        review: review as Review,
        clickCount: 0
      })
    }
  })
  
  // 4. ReviewWithBadge 형태로 변환
  const reviewsWithClicks: ReviewWithBadge[] = Array.from(reviewClickMap.values()).map(item => ({
    ...item.review,
    clickCount: item.clickCount,
    badge: null
  }))
  
  // 5. 최근 1시간 클릭수 집계 (급상승 배지용)
  const oneHourAgo = new Date()
  oneHourAgo.setHours(oneHourAgo.getHours() - 1)
  
  const { data: recentClickData } = await supabase
    .from('log_clicks')
    .select(`
      review_id,
      reviews!inner(id)
    `)
    .gte('reviews.deadline', today)
    .gte('occurred_at', oneHourAgo.toISOString())
  
  const recentClickCounts = new Map<number, number>()
  recentClickData?.forEach(log => {
    const current = recentClickCounts.get(log.review_id) || 0
    recentClickCounts.set(log.review_id, current + 1)
  })
  
  // 6. 배지 할당 로직
  // 클릭수로 정렬
  const sortedByTotal = [...reviewsWithClicks].sort((a, b) => b.clickCount - a.clickCount)
  const sortedByRecent = [...reviewsWithClicks]
    .map(r => ({ ...r, recentClicks: recentClickCounts.get(r.id) || 0 }))
    .sort((a, b) => b.recentClicks - a.recentClicks)
  
  // 1. 🔥 인기 서평단 - 전체 클릭수 1위 (최소 1클릭 이상)
  if (sortedByTotal.length > 0 && sortedByTotal[0].clickCount > 0) {
    const topReview = reviewsWithClicks.find(r => r.id === sortedByTotal[0].id)
    if (topReview) topReview.badge = '🔥 인기 서평단'
  }
  
  // 2. ⭐ 주목받는 서평단 - 클릭수 상위 20% (1위 제외, 최소 1클릭)
  if (reviewsWithClicks.length >= 5) {
    const topCount = Math.max(1, Math.ceil(reviewsWithClicks.length * 0.2))
    const eligibleReviews = sortedByTotal.filter(r => r.clickCount > 0).slice(1, topCount + 1)
    
    eligibleReviews.forEach(review => {
      const targetReview = reviewsWithClicks.find(r => r.id === review.id)
      if (targetReview && !targetReview.badge) {
        targetReview.badge = '⭐ 주목받는 서평단'
      }
    })
  }
  
  // 3. 🚀 급상승 서평단 - 최근 1시간 클릭수 1위 (아직 배지 없는 것)
  if (sortedByRecent.length > 0 && sortedByRecent[0].recentClicks > 0) {
    const topRecent = sortedByRecent[0]
    const targetReview = reviewsWithClicks.find(r => r.id === topRecent.id)
    if (targetReview && !targetReview.badge) {
      targetReview.badge = '🚀 급상승 서평단'
    }
  }
  
  return reviewsWithClicks
}

