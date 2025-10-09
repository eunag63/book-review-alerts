'use client'

import { useState, useEffect } from 'react'
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

  const toggleSubmissionStatus = async (deadlineId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'submitted' : 'pending'

    try {
      const response = await fetch(`/api/user/deadlines/${deadlineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_status: newStatus
        })
      })

      const result = await response.json()

      if (result.success) {
        fetchDeadlines()
      } else {
        alert('상태 변경 실패: ' + result.error)
      }
    } catch (error) {
      console.error('상태 변경 오류:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  const deleteDeadline = async (deadlineId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/user/deadlines/${deadlineId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        fetchDeadlines()
      } else {
        alert('삭제 실패: ' + result.error)
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
      const dateString = currentDate.toISOString().split('T')[0]
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
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">내 서평단 마감일</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#80FD8F] text-black px-4 py-2 rounded font-medium hover:bg-green-400 transition-colors"
        >
          {showAddForm ? '취소' : '마감일 추가'}
        </button>
      </div>

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
      <div className="mb-8">
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
          {calendar.map((day, index) => (
            <div
              key={index}
              onClick={() => setSelectedDate(day.date)}
              className={`
                min-h-[80px] p-2 border rounded cursor-pointer relative
                ${day.isCurrentMonth ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-gray-700'}
                ${isToday(day.date) ? 'ring-2 ring-[#80FD8F]' : ''}
                ${selectedDate?.toDateString() === day.date.toDateString() ? 'bg-gray-700' : ''}
                hover:bg-gray-700 transition-colors
              `}
            >
              <div className={`text-sm ${day.isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
                {day.date.getDate()}
              </div>
              
              {/* 마감일 표시 */}
              {day.deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className={`
                    text-xs mt-1 px-1 py-0.5 rounded truncate
                    ${deadline.submission_status === 'submitted' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                    }
                  `}
                  title={deadline.book_title}
                >
                  {deadline.book_title.length > 8 
                    ? deadline.book_title.substring(0, 8) + '...' 
                    : deadline.book_title
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">새 마감일 추가</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">책 제목 *</label>
              <input
                type="text"
                value={formData.book_title}
                onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
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
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="작가명 (선택사항)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">출판사</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="출판사명 (선택사항)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">마감일 *</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="bg-[#80FD8F] text-black px-4 py-2 rounded font-medium hover:bg-green-400 transition-colors"
            >
              등록
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded font-medium hover:bg-gray-500 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 선택된 날짜의 상세 정보 */}
      {selectedDate && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDate.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} 마감일
          </h3>
          
          {(() => {
            const dayDeadlines = deadlines.filter(d => 
              new Date(d.deadline).toDateString() === selectedDate.toDateString()
            )
            
            if (dayDeadlines.length === 0) {
              return (
                <p className="text-gray-500">이 날짜에 마감일이 없습니다.</p>
              )
            }

            return (
              <div className="space-y-3">
                {dayDeadlines.map((deadline) => (
                  <div key={deadline.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{deadline.book_title}</h4>
                        {deadline.author && (
                          <p className="text-gray-400 text-sm">작가: {deadline.author}</p>
                        )}
                        {deadline.publisher && (
                          <p className="text-gray-400 text-sm">출판사: {deadline.publisher}</p>
                        )}
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                          getDaysRemaining(deadline.deadline) === '마감' 
                            ? 'bg-red-600 text-white'
                            : getDaysRemaining(deadline.deadline) === 'D-day'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {getDaysRemaining(deadline.deadline)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSubmissionStatus(deadline.id, deadline.submission_status)}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            deadline.submission_status === 'submitted'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-600 text-white hover:bg-gray-500'
                          }`}
                        >
                          {deadline.submission_status === 'submitted' ? '제출완료' : '미제출'}
                        </button>
                        
                        <button
                          onClick={() => deleteDeadline(deadline.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-500"
                        >
                          삭제
                        </button>
                      </div>
                    </div>

                    {deadline.submission_status === 'submitted' && deadline.submitted_at && (
                      <p className="text-green-400 text-sm mt-2">
                        제출일: {formatDate(deadline.submitted_at)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {/* 전체 마감일이 없을 때 */}
      {deadlines.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">등록된 마감일이 없습니다.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#80FD8F] text-black px-4 py-2 rounded font-medium hover:bg-green-400 transition-colors"
          >
            첫 마감일 추가하기
          </button>
        </div>
      )}
    </div>
  )
}