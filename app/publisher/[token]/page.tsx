'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ReviewInfo {
  id: number;
  title: string;
  author: string;
  publisher: string;
  deadline: string;
}

interface LinkSubmission {
  id: number;
  name: string;
  contact: string;
  review_link: string;
  submitted_at: string;
}

export default function PublisherDashboardPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>('')
  const [reviewInfo, setReviewInfo] = useState<ReviewInfo | null>(null)
  const [submissions, setSubmissions] = useState<LinkSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initializeDashboard() {
      const resolvedParams = await params;
      setToken(resolvedParams.token);
      await fetchPublisherData(resolvedParams.token);
    }
    initializeDashboard();
  }, [params])

  const fetchPublisherData = async (publisherToken: string) => {
    try {
      const response = await fetch(`/api/publisher/${publisherToken}`)
      const data = await response.json()
      
      if (response.ok && data.review) {
        setReviewInfo(data.review)
        setSubmissions(data.submissions || [])
      } else {
        alert('출판사 대시보드를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('출판사 데이터 조회 오류:', error)
      alert('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const copySubmissionLink = () => {
    if (!reviewInfo) return
    const link = `${window.location.origin}/submit/${reviewInfo.id}`
    
    navigator.clipboard.writeText(link).then(() => {
      alert('서평 링크 제출 페이지가 클립보드에 복사되었습니다!')
    }).catch(() => {
      prompt('서평 링크 제출 페이지를 복사하세요:', link)
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <p className="text-white">출판사 대시보드를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold text-white mb-6">
          출판사 대시보드
        </h1>
        
        {/* 서평단 정보 */}
        <div className="mb-6 p-4 border border-gray-700 rounded">
          <h2 className="text-lg font-medium text-white mb-2">{reviewInfo.title}</h2>
          <p className="text-gray-400 text-sm">
            {reviewInfo.author} | {reviewInfo.publisher}
          </p>
          <p className="text-gray-400 text-sm">
            마감일: {new Date(reviewInfo.deadline).toLocaleDateString('ko-KR')}
          </p>
        </div>

        {/* 서평 링크 제출 페이지 */}
        <div className="mb-6 p-4 border border-gray-700 rounded">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">서평 링크 제출 페이지</h3>
              <p className="text-gray-400 text-sm">사용자들이 서평 링크를 제출할 수 있는 페이지입니다</p>
            </div>
            <button
              onClick={copySubmissionLink}
              className="px-3 py-2 text-sm font-medium rounded transition-colors"
              style={{ backgroundColor: '#80FD8F', color: 'black' }}
            >
              링크 복사
            </button>
          </div>
        </div>

        {/* 서평 링크 제출 현황 */}
        <div className="p-4 border border-gray-700 rounded">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">
              서평 링크 제출 현황 <span style={{ color: '#80FD8F' }}>({submissions.length}명)</span>
            </h3>
          </div>

          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div key={submission.id} className="p-3 bg-gray-800 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        {submission.name}
                        <span className="text-gray-400 ml-2 text-sm">({submission.contact})</span>
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        제출일: {formatDate(submission.submitted_at)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <a 
                      href={submission.review_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-point underline text-sm break-all hover:text-white transition-colors"
                    >
                      {submission.review_link}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">아직 제출된 서평 링크가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}