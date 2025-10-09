'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../lib/authContext'
import { useRouter } from 'next/navigation'

interface UserDeadline {
  id: number
  book_title: string
  author?: string
  publisher?: string
  deadline: string
  submission_status: 'pending' | 'submitted'
  submitted_at?: string
  created_at: string
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  deadlines: UserDeadline[]
}

export default function MyDeadlinesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [deadlines, setDeadlines] = useState<UserDeadline[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // 폼 상태
  const [formData, setFormData] = useState({
    book_title: '',
    author: '',
    publisher: '',
    deadline: ''
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
      return
    }
    if (user) {
      fetchDeadlines()
    }
  }, [user, isLoading, router])

  const fetchDeadlines = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/deadlines?user_id=${user.id}`)
      const result = await response.json()

      if (result.success) {
        setDeadlines(result.deadlines)
      } else {
        console.error('마감일 조회 실패:', result.error)
      }
    } catch (error) {
      console.error('마감일 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !formData.book_title || !formData.deadline) {
      alert('필수 항목을 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/user/deadlines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData
        })
      })

      const result = await response.json()

      if (result.success) {
        setFormData({ book_title: '', author: '', publisher: '', deadline: '' })
        setShowAddForm(false)
        fetchDeadlines()
      } else {
        alert('등록 실패: ' + result.error)
      }
    } catch (error) {
      console.error('등록 오류:', error)
      alert('등록 중 오류가 발생했습니다.')
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

  // 캘린더 생성 함수
  const generateCalendar = (year: number, month: number): CalendarDay[] => {
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // 주의 시작을 일요일로

    const calendar: CalendarDay[] = []
    const currentDate = new Date(startDate)

    // 6주 표시 (42일)
    for (let i = 0; i < 42; i++) {
      const dateString = currentDate.getFullYear() + '-' + 
        String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(currentDate.getDate()).padStart(2, '0')
      const dayDeadlines = deadlines.filter(d => d.deadline === dateString)
      
      calendar.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        deadlines: dayDeadlines
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return calendar
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const calendar = generateCalendar(currentMonth.getFullYear(), currentMonth.getMonth())

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen relative">
      {/* 플로팅 마감일 추가 버튼 */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="fixed bottom-6 right-6 bg-[#80FD8F] text-black px-6 py-3 rounded-full shadow-lg font-medium hover:scale-105 transition-transform z-10 flex items-center gap-2"
      >
        <span className="text-lg">{showAddForm ? '✕' : '+'}</span>
        <span className="hidden sm:inline">{showAddForm ? '취소' : '마감일 추가'}</span>
      </button>

      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => changeMonth('prev')}
          className="text-white hover:text-gray-300 text-xl"
        >
          ◁
        </button>
        <h2 className="text-xl font-semibold">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h2>
        <button
          onClick={() => changeMonth('next')}
          className="text-white hover:text-gray-300 text-xl"
        >
          ▷
        </button>
      </div>

      {/* 캘린더 */}
      <div className="mb-6">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="text-center text-gray-400 py-2 text-sm font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* 캘린더 날짜들 */}
        <div className="grid grid-cols-7 gap-1">
          {calendar.map((day, index) => {
            const isSelected = selectedDate?.toDateString() === day.date.toDateString()
            const isEndOfWeek = index % 7 === 6 // 토요일
            const selectedIndex = selectedDate ? calendar.findIndex(d => selectedDate?.toDateString() === d.date.toDateString()) : -1
            
            return (
              <React.Fragment key={index}>
                <div
                  onClick={() => setSelectedDate(selectedDate?.toDateString() === day.date.toDateString() ? null : day.date)}
                  className={`
                    min-h-[80px] p-2 rounded cursor-pointer relative bg-black
                    ${isToday(day.date) || isSelected ? 'border-2 border-[#80FD8F]' : 
                      day.isCurrentMonth ? 'border border-white' : 'border border-gray-500'}
                    hover:bg-gray-900 transition-colors
                  `}
                >
                  <div className={`text-sm ${day.isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* 마감일 표시 */}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {day.deadlines.map((deadline) => {
                      const totalCount = day.deadlines.length
                      let sizeClass = 'text-sm'
                      
                      if (totalCount === 1) {
                        sizeClass = 'text-4xl'
                      } else if (totalCount === 2) {
                        sizeClass = 'text-xl'
                      } else if (totalCount >= 3) {
                        sizeClass = 'text-sm'
                      }
                      
                      return (
                        <span
                          key={deadline.id}
                          className={`
                            ${sizeClass}
                            ${deadline.submission_status === 'submitted' 
                              ? 'text-[#80FD8F]' 
                              : 'text-white'
                            }
                          `}
                        >
                          🍀
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* 각 주의 끝(토요일)에 선택된 날짜가 그 주에 있으면 정보 표시 */}
                {isEndOfWeek && selectedDate && selectedIndex >= Math.floor(index / 7) * 7 && selectedIndex <= index && (() => {
                  const selectedDateString = selectedDate.getFullYear() + '-' + 
                    String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(selectedDate.getDate()).padStart(2, '0')
                  const dayDeadlines = deadlines.filter(d => d.deadline === selectedDateString)
                  
                  if (dayDeadlines.length === 0) {
                    return null
                  }

                  return (
                    <div className="col-span-7 bg-[#80FD8F] text-black p-3 rounded mt-1 mb-1">
                      <div className="space-y-1">
                        {dayDeadlines.map((deadline) => (
                          <div key={deadline.id} className="flex items-center justify-between text-xs">
                            <span className="text-black">{deadline.book_title}</span>
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              getDaysRemaining(deadline.deadline) === '마감' 
                                ? 'bg-black text-white'
                                : getDaysRemaining(deadline.deadline) === 'D-day'
                                ? 'bg-white text-black'
                                : 'bg-black text-white'
                            }`}>
                              {getDaysRemaining(deadline.deadline)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </React.Fragment>
            )
          })}
        </div>
      </div>


      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-black border border-white rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-center">
            <span className="text-[#80FD8F]">🍀</span> 새 마감일 추가 <span className="text-[#80FD8F]">🍀</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">책 제목 *</label>
              <input
                type="text"
                value={formData.book_title}
                onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
                className="w-full p-3 bg-black border border-white rounded text-white focus:border-[#80FD8F] focus:outline-none transition-colors"
                placeholder="당첨된 서평단 책 제목을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">작가</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full p-3 bg-black border border-white rounded text-white focus:border-[#80FD8F] focus:outline-none transition-colors"
                placeholder="작가명 (선택사항)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">출판사</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full p-3 bg-black border border-white rounded text-white focus:border-[#80FD8F] focus:outline-none transition-colors"
                placeholder="출판사명 (선택사항)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">마감일 *</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full p-3 bg-black border border-white rounded text-white focus:border-[#80FD8F] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="bg-[#80FD8F] text-black px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform flex-1"
            >
              ✓ 등록
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-black border border-white text-white px-6 py-3 rounded-full font-medium hover:bg-white hover:text-black transition-all flex-1"
            >
              ✕ 취소
            </button>
          </div>
        </form>
      )}

      {/* 전체 마감일이 없을 때 */}
      {deadlines.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">등록된 마감일이 없습니다.</p>
        </div>
      )}
    </div>
  )
}