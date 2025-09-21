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
  store_url: string;
}

export default function SubmitPage({ params }: { params: Promise<{ reviewId: string }> }) {
  const [reviewId, setReviewId] = useState<string>('')
  const [reviewInfo, setReviewInfo] = useState<ReviewInfo | null>(null)
  const [guidelines, setGuidelines] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<SubmissionData>({
    name: '',
    contact: '',
    review_link: '',
    store_url: ''
  })
  const [isDeadlineExpired, setIsDeadlineExpired] = useState(false)
  const [requiredChecked, setRequiredChecked] = useState(false)
  const [guidelineChecks, setGuidelineChecks] = useState<{[key: number]: boolean}>({})

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
        setGuidelines(data.guidelines || '')
        
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

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({...prev, contact: formatted}));
  };

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
      <div className="min-h-screen flex justify-center p-6" style={{ alignItems: 'flex-start', paddingTop: '25vh' }}>
        <div className="max-w-md mx-auto">
          <div className="p-4 text-center">
            <div className="text-4xl mb-4">🍀</div>
            <h1 className="text-xl font-bold text-white mb-3">제출 완료!</h1>
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
        {reviewInfo.review_deadline && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-400/50 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🍀</div>
                <h3 className="text-lg font-semibold text-green-200">서평 링크를 제출해주세요!</h3>
              </div>
              <p className="text-green-300 text-sm leading-relaxed">
                {new Date(reviewInfo.review_deadline).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}까지 서평 링크를 제출해주세요.<br/>
                마감일 이후에는 서평 링크를 제출할 수 없습니다.
              </p>
            </div>
          </div>
        )}

        {/* 서평단 정보 */}
        <div className="mb-6 p-4 border border-gray-700 rounded">
          <h2 className="text-lg font-medium text-white mb-1">{reviewInfo.title}</h2>
          <p className="text-gray-400 text-sm">
            {reviewInfo.author} | {reviewInfo.publisher}
          </p>
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
              className="w-full p-3 border rounded-md border-gray-600 text-white bg-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="010-1234-5678"
              value={formData.contact}
              onChange={handlePhoneChange}
              className="w-full p-3 border rounded-md border-gray-600 text-white bg-transparent"
              maxLength={13}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              서평 링크 <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://로 시작하는 주소를 입력해주세요"
              value={formData.review_link}
              onChange={(e) => setFormData(prev => ({...prev, review_link: e.target.value}))}
              className="w-full p-3 border rounded-md border-gray-600 text-white bg-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              온라인 서점 URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="https://로 시작하는 주소를 입력해주세요"
              value={formData.store_url}
              onChange={(e) => setFormData(prev => ({...prev, store_url: e.target.value}))}
              className="w-full p-3 border rounded-md border-gray-600 text-white bg-transparent"
              required
            />
            <p className="text-gray-400 text-xs mt-1">
              교보문고일 경우 아이디를 입력해주세요
            </p>
          </div>

          {/* 서평 작성 가이드라인 확인 */}
          <div className="p-4 border rounded-md border-gray-600">
            <h3 className="text-lg font-medium text-white mb-4">서평 작성 확인사항</h3>
            
            {/* 필수 사항 */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiredChecked}
                  onChange={(e) => setRequiredChecked(e.target.checked)}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-green-500 accent-green-500 mt-0.5"
                />
                <div className="flex-1">
                  <span className="text-white text-sm font-medium block">
                    도서제공 표시 포함
                  </span>
                  <span className="text-gray-400 text-xs">
                    #도서제공 해시태그 또는 &quot;출판사로부터 도서를 제공받아 작성한 리뷰입니다&quot; 문구 포함
                  </span>
                </div>
              </label>
              
              {/* 추가 가이드라인 */}
              {guidelines && guidelines.split('\n').filter(line => line.trim()).map((guideline, index) => (
                <label key={index} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(guidelineChecks[index])}
                    onChange={(e) => setGuidelineChecks(prev => ({
                      ...prev,
                      [index]: e.target.checked
                    }))}
                    className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-green-500 accent-green-500 mt-0.5"
                  />
                  <span className="text-white text-sm flex-1">
                    {guideline.trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={Boolean(
              submitting || 
              !formData.name || 
              !formData.contact || 
              !formData.review_link || 
              !formData.store_url || 
              !requiredChecked || 
              (guidelines && guidelines.split('\n').filter(line => line.trim()).some((_, index) => !guidelineChecks[index]))
            )}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:bg-gray-600"
            style={
              submitting || 
              !formData.name || 
              !formData.contact || 
              !formData.review_link || 
              !formData.store_url || 
              !requiredChecked || 
              (guidelines && guidelines.split('\n').filter(line => line.trim()).some((_, index) => !guidelineChecks[index]))
                ? { backgroundColor: '#4b5563', color: '#9ca3af' } 
                : { backgroundColor: '#80FD8F', color: '#000000' }
            }
          >
            {submitting ? '제출 중...' : '서평 링크 제출하기'}
          </button>
        </form>
      </div>
    </div>
  )
}