// lib/reviewUtils.ts
import { supabase } from './supabaseClient'
import type { Review } from './types'

// 날짜 관련 유틸리티 함수들
export function getKoreanDate(): Date {
  return new Date()
}

export function getDateString(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

export function getWeekRange(date: Date): { start: string; end: string } {
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

export function calcDDay(deadline: string): string {
  const today = getKoreanDate()
  const target = new Date(deadline)
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff <= 0 ? 'D-day' : `D-${diff}`
}

export function isCreatedToday(review: Review): boolean {
  if (!review.created_at) return false
  
  // 현재 한국 시간으로 오늘 날짜 구하기
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
  
  // created_at을 한국 시간으로 변환
  const createdKST = new Date(review.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
  
  return createdKST === today
}

export function isDeadlineValid(review: Review): boolean {
  const today = getKoreanDate()
  const deadline = new Date(review.deadline)
  // 마감일이 오늘 이후이거나 오늘인 경우만 유효
  return deadline >= today || deadline.toDateString() === today.toDateString()
}

// 기간별 서평단 조회 (상세 정보 포함)
export async function getReviewsByPeriod(period: string) {
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

  const { data, error } = await query.select('*').order('deadline', { ascending: true })
  if (error) {
    return { reviews: [], periodText, error }
  }
  return { reviews: (data as Review[]) || [], periodText, error: null }
}

// 기간별 서평단 개수만 조회 (메타데이터용)
export async function getReviewCountsByPeriod() {
  const today = getKoreanDate()
  const weekRange = getWeekRange(today)
  
  try {
    // 오늘 마감
    const { count: todayCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('deadline', getDateString(today))

    // 이번주 마감 (오늘 포함)
    const { count: thisWeekCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .gte('deadline', getDateString(today))
      .lte('deadline', weekRange.end)

    // 다음주 마감
    const nextMon = new Date(weekRange.start)
    nextMon.setDate(nextMon.getDate() + 7)
    const nextSun = new Date(weekRange.end)
    nextSun.setDate(nextSun.getDate() + 7)
    
    const { count: nextWeekCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .gte('deadline', getDateString(nextMon))
      .lte('deadline', getDateString(nextSun))

    return {
      today: todayCount || 0,
      thisWeek: thisWeekCount || 0,
      nextWeek: nextWeekCount || 0,
    }
  } catch (error) {
    console.error('서평단 개수 조회 실패:', error)
    return { today: 0, thisWeek: 0, nextWeek: 0 }
  }
}

// 사용 가능한 기간 목록 조회
export async function getAvailablePeriods(): Promise<string[]> {
  const periods = ['오늘', '이번주', '다음주']
  const available: string[] = []
  
  for (const period of periods) {
    const result = await getReviewsByPeriod(period)
    if (result.reviews.length > 0) {
      available.push(period)
    }
  }
  
  return available
}