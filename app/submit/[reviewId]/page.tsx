'use client'

import { useState, useEffect } from 'react'

interface ReviewInfo {
  id: number;
  title: string;
  author: string;
  publisher: string;
  deadline: string;
  review_deadline?: string;
}

interface SubmissionData {
  name: string;
  contact: string;
  review_link: string;
}

export default function SubmitPage({ params }: { params: Promise<{ reviewId: string }> }) {
  const [reviewId, setReviewId] = useState<string>('')
  const [reviewInfo, setReviewInfo] = useState<ReviewInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<SubmissionData>({
    name: '',
    contact: '',
    review_link: ''
  })
  const [isDeadlineExpired, setIsDeadlineExpired] = useState(false)

  useEffect(() => {
    async function initializeSubmission() {
      const resolvedParams = await params;
      setReviewId(resolvedParams.reviewId);
      await fetchReviewInfo(resolvedParams.reviewId);
    }
    initializeSubmission();
  }, [params])

  const fetchReviewInfo = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`)
      const data = await response.json()
      
      if (response.ok && data.review) {
        setReviewInfo(data.review)
        
        // 마감일 체크
        if (data.review.review_deadline) {
          const deadline = new Date(data.review.review_deadline)
          const now = new Date()
          setIsDeadlineExpired(deadline < now)
        }
      } else {
        alert('서평단 정보를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('서평단 정보 조회 오류:', error)
      alert('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/submit/${reviewId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        alert('서평 링크가 성공적으로 제출되었습니다!')
      } else {
        const error = await response.json()
        alert(error.error || '제출에 실패했습니다.')
      }
    } catch (error) {
      console.error('제출 오류:', error)
      alert('서버 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">로딩 중...</p>
      </div>
    )
  }

  if (!reviewInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">서평단 정보를 찾을 수 없습니다.</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="p-8 border border-gray-700 rounded">
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-white mb-2">제출 완료!</h1>
            <p className="text-gray-400 text-sm">
              서평 링크가 성공적으로 제출되었습니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 마감일이 설정되지 않았거나 마감일이 지난 경우
  if (!reviewInfo?.review_deadline || isDeadlineExpired) {
    const isExpired = reviewInfo?.review_deadline && isDeadlineExpired;
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className={`p-8 border rounded ${isExpired ? 'border-red-600 bg-red-900/10' : 'border-gray-600'}`}>
            <div className="text-4xl mb-4">{isExpired ? '⏰' : '📝'}</div>
            <h1 className="text-xl font-bold text-white mb-2">
              {isExpired ? '제출 마감' : '제출 준비 중'}
            </h1>
            <h2 className="text-lg font-medium text-white mb-4">{reviewInfo.title}</h2>
            <p className="text-gray-400 text-sm mb-2">
              {reviewInfo.author} | {reviewInfo.publisher}
            </p>
            {isExpired ? (
              <>
                <p className="text-red-400 text-sm mb-4">
                  서평 제출 마감일: {new Date(reviewInfo.review_deadline!).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-gray-300 text-sm">
                  죄송합니다. 서평 링크 제출 기간이 마감되었습니다.<br />
                  다음 기회를 이용해 주세요.
                </p>
              </>
            ) : (
              <p className="text-gray-300 text-sm">
                아직 서평 제출 기간이 설정되지 않았습니다.<br />
                출판사에서 마감일을 설정하면 제출할 수 있습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        {/* 서평단 정보 */}
        <div className="mb-6 p-4 border border-gray-700 rounded">
          <h1 className="text-xl font-bold text-white mb-2">서평 링크 제출</h1>
          <h2 className="text-lg font-medium text-white mb-1">{reviewInfo.title}</h2>
          <p className="text-gray-400 text-sm">
            {reviewInfo.author} | {reviewInfo.publisher}
          </p>
          <p className="text-gray-400 text-sm">
            당첨자 모집 마감일: {new Date(reviewInfo.deadline).toLocaleDateString('ko-KR')}
          </p>
          {reviewInfo.review_deadline && (
            <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
              <p className="text-blue-400 text-sm font-medium">
                📝 서평 제출 마감일: {new Date(reviewInfo.review_deadline).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-blue-300 text-xs mt-1">
                마감일 이후에는 서평 링크를 제출할 수 없습니다.
              </p>
            </div>
          )}
        </div>
        
        {/* 제출 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              className="w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              연락처 (이메일 또는 SNS ID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="example@email.com 또는 @sns_id"
              value={formData.contact}
              onChange={(e) => setFormData(prev => ({...prev, contact: e.target.value}))}
              className="w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              서평 링크 <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://blog.naver.com/..."
              value={formData.review_link}
              onChange={(e) => setFormData(prev => ({...prev, review_link: e.target.value}))}
              className="w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
              required
            />
            <p className="text-gray-400 text-xs mt-1">
              블로그, 인스타그램, 유튜브 등 서평이 올라간 링크를 입력해주세요
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
            style={{ backgroundColor: '#80FD8F', color: '#000000' }}
          >
            {submitting ? '제출 중...' : '서평 링크 제출하기'}
          </button>
        </form>
      </div>
    </div>
  )
}