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
  address: string;
  registered_at: string;
}

interface LinkPreview {
  title: string;
  description: string;
  image: string;
  domain: string;
}

export default function PublisherDashboardPage({ params }: { params: Promise<{ token: string }> }) {
  const [, setToken] = useState<string>('')
  const [reviewInfo, setReviewInfo] = useState<ReviewInfo | null>(null)
  const [submissions, setSubmissions] = useState<LinkSubmission[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditingDeadline, setIsEditingDeadline] = useState(false)
  const [tempDeadline, setTempDeadline] = useState('')
  const [linkPreviews, setLinkPreviews] = useState<Record<string, LinkPreview>>({})

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

  const updateDeadline = async (newDeadline: string) => {
    if (!reviewInfo) return;

    try {
      const response = await fetch(`/api/reviews/${reviewInfo.id}/deadline`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review_deadline: newDeadline }),
      });

      if (response.ok) {
        setReviewInfo({ ...reviewInfo, review_deadline: newDeadline });
        alert('서평 제출 마감일이 설정되었습니다.');
      } else {
        alert('마감일 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('마감일 설정 오류:', error);
      alert('마감일 설정에 실패했습니다.');
    }
  };

  const handleDeadlineSubmit = () => {
    if (tempDeadline) {
      updateDeadline(tempDeadline);
      setIsEditingDeadline(false);
      setTempDeadline('');
    }
  };

  const handleDeadlineCancel = () => {
    setIsEditingDeadline(false);
    setTempDeadline('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const copyWinnerInfo = async (winner: Winner) => {
    if (!reviewInfo) return
    
    const info = `[${reviewInfo.title} 서평단 당첨자 정보]
이름: ${winner.name}
연락처: ${winner.contact}
서평용 연락처: ${winner.review_contact}
주소: ${winner.address}`
    
    try {
      await navigator.clipboard.writeText(info)
      alert('당첨자 정보가 복사되었습니다!')
    } catch (err) {
      console.error('복사 실패:', err)
      alert('복사에 실패했습니다.')
    }
  }

  const fetchLinkPreview = async (url: string) => {
    try {
      const response = await fetch('/api/link-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      
      if (response.ok) {
        const preview = await response.json()
        setLinkPreviews(prev => ({
          ...prev,
          [url]: preview
        }))
      }
    } catch (error) {
      console.error('링크 미리보기 오류:', error)
    }
  }

  useEffect(() => {
    submissions.forEach(submission => {
      if (!linkPreviews[submission.review_link]) {
        fetchLinkPreview(submission.review_link)
      }
    })
  }, [submissions, linkPreviews])

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


        {/* 서평 제출 마감일 설정 */}
        <div className="mb-6 p-4 border border-gray-700 rounded">
          <h3 className="text-lg font-medium text-white mb-4">서평 제출 마감일</h3>
          {reviewInfo.review_deadline ? (
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">설정된 마감일: {formatDateTime(reviewInfo.review_deadline)}</div>
              </div>
              <button
                onClick={() => {
                  setIsEditingDeadline(true);
                  setTempDeadline(reviewInfo.review_deadline?.split('T')[0] || '');
                }}
                className="px-3 py-1.5 text-sm font-medium rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              >
                수정
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <div className="text-gray-400 font-medium">아직 서평 제출 마감일이 설정되지 않았습니다</div>
              </div>
              <button
                onClick={() => setIsEditingDeadline(true)}
                className="px-3 py-1.5 text-sm font-medium rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              >
                설정
              </button>
            </div>
          )}

          {isEditingDeadline && (
            <div className="mt-4 p-4 bg-gray-800 rounded">
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={tempDeadline}
                  onChange={(e) => setTempDeadline(e.target.value)}
                  className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                />
                <button
                  onClick={handleDeadlineSubmit}
                  className="px-3 py-1.5 text-sm font-medium rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                >
                  확인
                </button>
                <button
                  onClick={handleDeadlineCancel}
                  className="px-3 py-1.5 text-sm font-medium rounded bg-gray-600 text-white hover:bg-gray-500 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 통합된 관리 섹션 */}
        <div className="mb-6 p-4 border border-gray-700 rounded">
          <h3 className="text-lg font-medium text-white mb-4">페이지 링크</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">당첨자 정보 수집</div>
                <div className="text-gray-400 text-sm">당첨자들이 개인정보를 등록할 수 있는 페이지</div>
              </div>
              <button
                onClick={copyWinnerLink}
                className="px-3 py-1.5 text-sm font-medium rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              >
                복사
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">서평 링크 제출</div>
                <div className="text-gray-400 text-sm">사용자들이 서평 링크를 제출할 수 있는 페이지</div>
              </div>
              {reviewInfo.review_deadline ? (
                <button
                  onClick={copySubmissionLink}
                  className="px-3 py-1.5 text-sm font-medium rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                >
                  복사
                </button>
              ) : (
                <button
                  disabled
                  className="px-3 py-1.5 text-sm font-medium rounded bg-gray-600 text-gray-400 cursor-not-allowed"
                >
                  복사
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 서평단 진행 현황 */}
        <div className="p-4 border border-gray-700 rounded">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-white">서평단 진행 현황 ({winners.length}명)</h3>
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
                  submissions.some(submission => submission.contact === winner.contact)
                ).length}
              </div>
              <div className="text-sm text-gray-400">서평 제출</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {winners.filter(winner => 
                  !submissions.some(submission => submission.contact === winner.contact)
                ).length}
              </div>
              <div className="text-sm text-gray-400">미제출</div>
            </div>
          </div>

          {/* 제출자 목록 */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-white mb-3">
              제출자 목록 <span style={{ color: '#80FD8F' }}>({winners.filter(winner => submissions.some(submission => submission.contact === winner.contact)).length}명)</span>
            </h4>
            {winners.filter(winner => submissions.some(submission => submission.contact === winner.contact)).length > 0 ? (
              <div className="space-y-3">
                {winners.filter(winner => submissions.some(submission => submission.contact === winner.contact)).map((winner) => {
                  const submission = submissions.find(submission => submission.contact === winner.contact);
                  return (
                    <div key={winner.id} className="p-3 bg-gray-800 rounded">
                      <div className="mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-4">
                            <div className="text-white font-medium">{winner.name}</div>
                            <div className="text-gray-400">{winner.review_contact}</div>
                          </div>
                          <div className="text-gray-400 text-sm">
                            제출일: {formatDate(submission!.submitted_at)}
                          </div>
                        </div>
                      </div>
                      
                      {/* 서평 링크 미리보기 */}
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        {linkPreviews[submission!.review_link] ? (
                          <a
                            href={submission!.review_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-gray-900 rounded border border-gray-600 hover:border-gray-500 transition-colors"
                          >
                            <div className="flex gap-3">
                              {linkPreviews[submission!.review_link].image && (
                                <img 
                                  src={linkPreviews[submission!.review_link].image} 
                                  alt=""
                                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white text-sm line-clamp-2">
                                  {linkPreviews[submission!.review_link].title}
                                </h4>
                                <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                                  {linkPreviews[submission!.review_link].description}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {linkPreviews[submission!.review_link].domain}
                                </p>
                              </div>
                            </div>
                          </a>
                        ) : (
                          <a 
                            href={submission!.review_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-point underline text-sm break-all hover:text-white transition-colors block"
                          >
                            {submission!.review_link}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">아직 제출한 당첨자가 없습니다.</p>
            )}
          </div>

          {/* 미제출자 목록 */}
          <div>
            <h4 className="text-md font-medium text-white mb-3">
              미제출자 목록 <span className="text-red-400">({winners.filter(winner => !submissions.some(submission => submission.contact === winner.contact)).length}명)</span>
            </h4>
            {winners.filter(winner => !submissions.some(submission => submission.contact === winner.contact)).length > 0 ? (
              <div className="space-y-3">
                {winners.filter(winner => !submissions.some(submission => submission.contact === winner.contact)).map((winner) => (
                  <div key={winner.id} className="p-3 bg-gray-800 rounded">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-4">
                          <div className="text-white font-medium">{winner.name}</div>
                          <div className="text-gray-400">{winner.review_contact}</div>
                        </div>
                        <div className="text-gray-300 text-sm">연락처: {winner.contact}</div>
                        <div className="text-gray-300 text-sm">주소: {winner.address}</div>
                      </div>
                      <button
                        onClick={() => copyWinnerInfo(winner)}
                        className="px-3 py-1.5 text-sm font-medium rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors ml-4"
                      >
                        복사
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">모든 당첨자가 서평을 제출했습니다!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}