'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { calcDDay } from '../../../lib/reviewUtils'

interface ReviewData {
  id: number;
  title: string;
  author: string;
  publisher: string;
  url: string;
  deadline: string;
  genre?: string;
  description?: string;
}

export default function AddInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [reviewId, setReviewId] = useState<number | null>(null)
  
  const [data, setData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    description: '',
    email: ''
  })

  useEffect(() => {
    async function initializeParams() {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      setReviewId(id);
      
      if (!token || isNaN(id)) {
        setError('잘못된 접근입니다.')
        setLoading(false)
        return
      }

      await fetchData(id);
    }

    async function fetchData(id: number) {
      try {
        const response = await fetch(`/api/add-info/${id}?token=${token}`)
        const result = await response.json()
        
        if (!response.ok) {
          setError(result.error || '데이터를 불러올 수 없습니다.')
          return
        }
        
        setData(result.review)
        setFormData({
          description: '',
          email: ''
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
    
    if (!reviewId || !formData.description.trim() || !formData.email.trim()) {
      setError('모든 필드를 입력해주세요.')
      return
    }
    
    setSubmitting(true)

    try {
      const response = await fetch(`/api/add-info/${reviewId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          description: formData.description,
          email: formData.email
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        alert('정보가 성공적으로 등록되었습니다! 검토 후 연락드리겠습니다.')
        router.push('/')
      } else {
        setError(result.error || '등록 중 오류가 발생했습니다.')
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
      <h1 className="text-xl font-semibold mb-6">서평단 정보 추가</h1>
      
      {/* 기존 서평단 정보 카드 */}
      <div className="mb-6 p-4 border rounded relative">
        <p className="font-medium pr-12">{data.title}</p>
        <p className="text-sm text-gray-600 mb-1">
          {[data.publisher, data.author, data.genre].filter(Boolean).join(' | ')}
        </p>
        {(() => {
          const dday = calcDDay(data.deadline)
          return <p className="text-sm text-point mb-1">{dday}</p>
        })()}
        <div className="flex justify-between items-center">
          <a
            href={data.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-point underline text-sm mt-1 inline-block"
          >
            신청하러 가기
          </a>
        </div>

        {/* 실시간 미리보기 말풍선 */}
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

      <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded-md">
        <p className="text-green-400 text-sm">
          이 서평단에 출판사 정보를 추가해주세요! 한 줄 소개를 작성하면 위 카드에서 미리보기할 수 있습니다.
        </p>
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
            placeholder="이 책에 대한 한 줄 소개를 입력해주세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            연락처 이메일 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
            className="w-full p-3 border rounded-md"
            required
            placeholder="example@publisher.com"
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
            {submitting ? '등록 중...' : '정보 등록'}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            정보 등록 후 검토를 거쳐 서평단에 반영됩니다
          </p>
        </div>
      </form>
    </main>
  )
}