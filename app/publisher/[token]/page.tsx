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

interface ParticipantToken {
  id: number;
  token: string;
  email?: string;
  created_at: string;
  assigned_at?: string;
  progress_status: string;
}

export default function PublisherDashboardPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>('')
  const [reviewInfo, setReviewInfo] = useState<ReviewInfo | null>(null)
  const [participantTokens, setParticipantTokens] = useState<ParticipantToken[]>([])
  const [loading, setLoading] = useState(true)
  const [participantCount, setParticipantCount] = useState(10)
  const [generating, setGenerating] = useState(false)

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
      
      if (response.ok && data.review && data.participants) {
        setReviewInfo(data.review)
        setParticipantTokens(data.participants)
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

  const generateParticipantTokens = async () => {
    setGenerating(true)
    try {
      const response = await fetch(`/api/publisher/${token}/generate-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantCount }),
      })

      if (response.ok) {
        alert(`${participantCount}개의 참가자 토큰이 생성되었습니다.`)
        await fetchPublisherData(token) // 새로고침
      } else {
        const error = await response.json()
        alert(error.error || '토큰 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('토큰 생성 오류:', error)
      alert('서버 오류가 발생했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  const copyRegistrationLink = () => {
    if (!reviewInfo) return
    const link = `${window.location.origin}/participant/review/${reviewInfo.id}`
    
    navigator.clipboard.writeText(link).then(() => {
      alert('참가자 등록 링크가 클립보드에 복사되었습니다!')
    }).catch(() => {
      prompt('참가자 등록 링크를 복사하세요:', link)
    })
  }

  const copyParticipantLink = (participantToken: string) => {
    const link = `${window.location.origin}/participant/${participantToken}`
    
    navigator.clipboard.writeText(link).then(() => {
      alert('개별 참가자 링크가 클립보드에 복사되었습니다!')
    }).catch(() => {
      prompt('개별 참가자 링크를 복사하세요:', link)
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
        <Link 
          href="/admin/dashboard" 
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          어드민으로 돌아가기
        </Link>

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

        {/* 공통 참가 링크 */}
        <div className="mb-6 p-4 border border-gray-700 rounded">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">공통 참가 링크</h3>
              <p className="text-gray-400 text-sm">이 링크를 사용자들에게 배포하세요</p>
            </div>
            <button
              onClick={copyRegistrationLink}
              className="px-3 py-2 text-sm font-medium rounded transition-colors"
              style={{ backgroundColor: '#80FD8F', color: 'black' }}
            >
              링크 복사
            </button>
          </div>
        </div>

        {/* 참가자 토큰 생성 */}
        <div className="mb-6 p-4 border border-gray-700 rounded">
          <h3 className="text-lg font-medium text-white mb-4">참가자 토큰 생성</h3>
          <div className="flex items-center gap-4">
            <label className="text-white">
              생성할 토큰 개수:
              <input
                type="number"
                value={participantCount}
                onChange={(e) => setParticipantCount(parseInt(e.target.value) || 1)}
                className="ml-2 px-2 py-1 bg-gray-800 border border-gray-600 text-white rounded w-20"
                min="1"
                max="100"
              />
            </label>
            <button
              onClick={generateParticipantTokens}
              disabled={generating}
              className="px-4 py-2 text-sm font-medium rounded transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#80FD8F', color: 'black' }}
            >
              {generating ? '생성 중...' : '토큰 생성'}
            </button>
          </div>
        </div>

        {/* 참가자 현황 */}
        <div className="p-4 border border-gray-700 rounded">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">
              참가자 현황 <span style={{ color: '#80FD8F' }}>({participantTokens.length}개)</span>
            </h3>
          </div>

          {participantTokens.length > 0 ? (
            <div className="space-y-3">
              {participantTokens.map((participant, index) => (
                <div key={participant.id} className="p-3 bg-gray-800 rounded flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">
                      참가자 #{index + 1}
                      {participant.email && <span className="text-gray-400 ml-2">({participant.email})</span>}
                    </div>
                    <div className="text-gray-400 text-sm">
                      상태: {participant.progress_status === 'registered' ? '등록 완료' : '대기 중'} | 
                      생성: {formatDate(participant.created_at)}
                      {participant.assigned_at && ` | 할당: ${formatDate(participant.assigned_at)}`}
                    </div>
                  </div>
                  <button
                    onClick={() => copyParticipantLink(participant.token)}
                    className="px-3 py-1 text-xs font-medium rounded transition-colors"
                    style={{ backgroundColor: '#80FD8F', color: 'black' }}
                  >
                    개별 링크
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">생성된 참가자 토큰이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}