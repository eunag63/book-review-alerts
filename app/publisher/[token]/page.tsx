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

interface Winner {
  id: number;
  name: string;
  contact: string;
  review_contact: string;
  registered_at: string;
}

export default function PublisherDashboardPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>('')
  const [reviewInfo, setReviewInfo] = useState<ReviewInfo | null>(null)
  const [submissions, setSubmissions] = useState<LinkSubmission[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
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
        setWinners(data.winners || [])
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

  const copyWinnerLink = () => {
    if (!reviewInfo) return
    const link = `${window.location.origin}/winners/${reviewInfo.id}`
    
    navigator.clipboard.writeText(link).then(() => {
      alert('당첨자 정보 수집 페이지가 클립보드에 복사되었습니다!')
    }).catch(() => {
      prompt('당첨자 정보 수집 페이지를 복사하세요:', link)
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


        {/* 당첨자 정보 수집 페이지 */}
        <div className="mb-6 p-4 border border-gray-700 rounded">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">당첨자 정보 수집 페이지</h3>
              <p className="text-gray-400 text-sm">당첨자들이 개인정보를 등록할 수 있는 페이지입니다</p>
            </div>
            <button
              onClick={copyWinnerLink}
              className="px-3 py-2 text-sm font-medium rounded transition-colors"
              style={{ backgroundColor: '#80FD8F', color: 'black' }}
            >
              링크 복사
            </button>
          </div>
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

        {/* 서평단 진행 현황 및 제출 상세 */}
        <div className="p-4 border border-gray-700 rounded">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-white">서평단 진행 현황</h3>
          </div>
          
          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div>
              <div className="text-2xl font-bold text-white">{winners.length}</div>
              <div className="text-sm text-gray-400">당첨자</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#80FD8F' }}>
                {winners.filter(winner => 
                  submissions.some(submission => submission.contact === winner.review_contact)
                ).length}
              </div>
              <div className="text-sm text-gray-400">서평 제출</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {winners.filter(winner => 
                  !submissions.some(submission => submission.contact === winner.review_contact)
                ).length}
              </div>
              <div className="text-sm text-gray-400">미제출</div>
            </div>
          </div>

          {/* 제출 상세 목록 */}
          <div>
            <h4 className="text-md font-medium text-white mb-3">
              서평 제출 상세 <span style={{ color: '#80FD8F' }}>({submissions.length}명)</span>
            </h4>
            
            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.map((submission) => {
                  const isWinner = winners.some(winner => winner.review_contact === submission.contact);
                  return (
                    <div key={submission.id} className="p-3 bg-gray-800 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-white font-medium flex items-center gap-2">
                            {submission.name}
                            <span className="text-gray-400 text-sm">({submission.contact})</span>
                            {isWinner && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-green-900/30 text-green-300 border border-green-500">
                                당첨자
                              </span>
                            )}
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
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">아직 제출된 서평 링크가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}