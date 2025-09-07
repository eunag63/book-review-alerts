'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { calcDDay, isCreatedToday } from '../../../lib/reviewUtils'

interface RegistrationData {
  id: number;
  title: string;
  author: string;
  publisher: string;
  category: string;
  description: string;
  deadline: string;
  email: string;
  existing_review_id: number | null;
  genre?: string;
  url?: string;
}

export default function EditRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [registrationId, setRegistrationId] = useState<number | null>(null)
  
  const [data, setData] = useState<RegistrationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    description: '',
    deadline: '',
    link: ''
  })

  useEffect(() => {
    async function initializeParams() {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      setRegistrationId(id);
      
      if (!token || isNaN(id)) {
        setError('잘못된 접근입니다.')
        setLoading(false)
        return
      }

      await fetchData(id);
    }

    async function fetchData(id: number) {
      try {
        const response = await fetch(`/api/edit-registration/${id}?token=${token}`)
        const result = await response.json()
        
        if (!response.ok) {
          setError(result.error || '데이터를 불러올 수 없습니다.')
          return
        }
        
        setData(result.registration)
        setFormData({
          description: result.registration.description || '',
          deadline: result.registration.deadline || '',
          link: result.registration.link || result.registration.url || ''
        })
      } catch {
        setError('서버 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    initializeParams()
  }, [token, params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!registrationId) {
      setError('잘못된 접근입니다.')
      return
    }
    
    setSubmitting(true)

    try {
      const response = await fetch(`/api/edit-registration/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          description: formData.description,
          deadline: formData.deadline,
          link: formData.link
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        alert('수정이 완료되었습니다!')
        router.push('/')
      } else {
        setError(result.error || '수정 중 오류가 발생했습니다.')
      }
    } catch {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-6 max-w-md mx-auto">
        <p className="text-center text-gray-500">로딩 중...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen p-6 max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-4">오류</h1>
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 text-point underline"
        >
          홈으로 돌아가기
        </button>
      </main>
    )
  }

  if (!data) return null

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-6">서평단 정보 수정</h1>
      
      {/* 홈화면과 동일한 카드 디자인 */}
      <div className="mb-6 p-4 border rounded relative">
        {/* NEW 배지 (생성된 날짜 기준) */}
        {isCreatedToday({ created_at: new Date().toISOString() } as { created_at: string }) && (
          <span 
            className="absolute top-4 right-3 text-xs font-bold px-1 py-0.5 rounded text-black"
            style={{ backgroundColor: '#80FD8F', fontSize: '10px' }}
          >
            NEW
          </span>
        )}
        <p className="font-medium pr-12">{data.title}</p>
        <p className="text-sm text-gray-600 mb-1">
          {[data.publisher, data.author, data.genre].filter(Boolean).join(' | ')}
        </p>
        {(() => {
          const deadline = formData.deadline || data.deadline
          if (!deadline) return null
          const dday = calcDDay(deadline)
          return <p className="text-sm text-point mb-1">{dday}</p>
        })()}
        <div className="flex justify-between items-center">
          <a
            href={data.url || formData.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-point underline text-sm mt-1 inline-block"
          >
            신청하러 가기
          </a>
        </div>

        {/* 말풍선 - 실시간 미리보기 */}
        {formData.description && (
          <div 
            className="relative mt-6 px-3 py-2 rounded-2xl font-bold"
            style={{ backgroundColor: '#80FD8F', color: 'black', fontSize: '14px' }}
          >
            <div 
              className="absolute w-0 h-0"
              style={{
                top: '-10px',
                left: '30px',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '10px solid #80FD8F'
              }}
            />
            {formData.description}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            한 줄 소개 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
            className="w-full p-3 border rounded-md"
            rows={3}
            required
            placeholder="책에 대한 한 줄 소개를 입력해주세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            마감 날짜 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({...prev, deadline: e.target.value}))}
            className="w-full p-3 border rounded-md cursor-pointer"
            required
            min={new Date().toISOString().split('T')[0]}
            onFocus={(e) => e.target.showPicker?.()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            신청 링크 <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData(prev => ({...prev, link: e.target.value}))}
            className="w-full p-3 border rounded-md"
            required
            placeholder="https://example.com"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: submitting ? '#cccccc' : '#80FD8F', 
              color: '#000000',
              border: 'none'
            }}
          >
            {submitting ? '수정 중...' : '수정 완료'}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            삭제를 원하실 경우 <a href="mailto:hello@freebook.kr" className="text-point underline">hello@freebook.kr</a>로 문의해주세요
          </p>
        </div>
      </form>
    </main>
  )
}