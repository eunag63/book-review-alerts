'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { calcDDay } from '../../../lib/reviewUtils';
import { generateSalesToken } from '../../../lib/tokenUtils';

interface RegistrationData {
  id: number;
  title: string;
  author: string;
  publisher: string;
  link: string;
  deadline: string;
  category: string;
  author_gender: string;
  email: string;
  description: string;
  status: string;
  created_at: string;
  existing_review_id?: number;
}

interface ReviewData {
  id: number;
  title: string;
  author: string;
  publisher: string;
  url: string;
  deadline: string;
  source: string;
  created_at: string;
}

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState('');
  const [additionalData, setAdditionalData] = useState<{[key: number]: {genre?: string, nationality?: string, type?: string}}>({});
  const [activeTab, setActiveTab] = useState<'registrations' | 'reviews'>('registrations');

  useEffect(() => {
    fetchPendingRegistrations();
    fetchReviews();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/registrations');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '데이터 로딩 실패');
      }
      
      setRegistrations(data.registrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      console.log('Reviews 데이터 요청 시작...');
      const response = await fetch('/api/admin/reviews');
      console.log('Reviews API 응답 상태:', response.status);
      
      const data = await response.json();
      console.log('Reviews 데이터:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Reviews 데이터 로딩 실패');
      }
      
      setReviews(data.reviews);
    } catch (err) {
      console.error('Reviews 로딩 오류:', err);
      setError(`Reviews 로딩 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setReviewsLoading(false);
    }
  };

  const generateSalesLink = (reviewId: number) => {
    const token = generateSalesToken(reviewId);
    const link = `${window.location.origin}/add-info/${reviewId}?token=${token}`;
    
    navigator.clipboard.writeText(link).then(() => {
      alert('영업용 링크가 클립보드에 복사되었습니다!');
    }).catch(() => {
      prompt('영업용 링크를 복사하세요:', link);
    });
  };

  const handleAdditionalDataChange = (id: number, field: string, value: string) => {
    setAdditionalData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleApproval = async (id: number, action: 'approve' | 'reject') => {
    try {
      const additional = additionalData[id] || {};
      const response = await fetch('/api/admin/registrations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id, 
          action,
          additionalData: action === 'approve' ? additional : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '처리 실패');
      }

      // 목록에서 해당 항목 제거
      setRegistrations(prev => prev.filter(reg => reg.id !== id));
      
      alert(action === 'approve' ? '승인되었습니다.' : '거부되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '처리 실패');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeadline = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6 max-w-4xl mx-auto">
        <p className="text-center text-gray-500">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <section className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          홈으로 돌아가기
        </Link>
        {/* 탭 네비게이션 */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'registrations'
                ? 'text-point border-b-2 border-point'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            등록 승인 ({registrations.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'text-point border-b-2 border-point'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            영업용 링크 ({reviews.length})
          </button>
        </div>

        {activeTab === 'registrations' && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">
                대기 중인 등록 <span style={{ color: '#80FD8F' }}>{registrations.length}개</span>
              </h2>
            </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {registrations.length > 0 ? (
          <>
            <ul className="mt-4 space-y-2">
              {registrations.map((reg) => (
                <li key={reg.id} className="p-4 border rounded relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{reg.title}</p>
                    {reg.existing_review_id ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-300 border border-blue-500">
                        기존 서평단 업데이트
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-300 border border-green-500">
                        새 책 등록
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {[reg.publisher, reg.author].filter(Boolean).join(' | ')}
                  </p>
                  
                  {(() => {
                    const dday = calcDDay(reg.deadline)
                    return dday !== 'D-day' ? <p className="text-sm text-point mb-1">{dday}</p> : null
                  })()}
                  <div className="flex justify-between items-center">
                    <a
                      href={reg.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-point underline text-sm mt-1 inline-block"
                    >
                      신청하러 가기
                    </a>
                  </div>

                  {reg.description && (
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
                      {reg.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">등록 상세 정보</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproval(registrations[0]?.id, 'approve')}
                    className="px-2 py-1 text-xs font-medium rounded transition-colors"
                    style={{ backgroundColor: '#80FD8F', color: 'black' }}
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleApproval(registrations[0]?.id, 'reject')}
                    className="px-2 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
                  >
                    거부
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {registrations.map((reg) => (
                  <div key={reg.id} className="p-4 border border-gray-700 rounded text-sm">
                    <div className="grid grid-cols-1 gap-2">
                      {reg.existing_review_id ? (
                        // 기존 서평단 업데이트인 경우 - 필수 정보만 표시
                        <>
                          <div><span className="text-gray-400">이메일:</span> {reg.email}</div>
                          <div><span className="text-gray-400">한 줄 소개:</span> {reg.description}</div>
                          <div><span className="text-gray-400">등록일:</span> {formatDate(reg.created_at)}</div>
                        </>
                      ) : (
                        // 새 책 등록인 경우 - 모든 정보 표시
                        <>
                          <div><span style={{ color: '#80FD8F' }}>✓ 제목:</span> {reg.title}</div>
                          <div><span style={{ color: '#80FD8F' }}>✓ 작가:</span> {reg.author}</div>
                          <div><span style={{ color: '#80FD8F' }}>✓ 출판사:</span> {reg.publisher}</div>
                          <div><span style={{ color: '#80FD8F' }}>✓ 링크:</span> <a href={reg.link} target="_blank" rel="noopener noreferrer" className="text-point underline break-all">{reg.link}</a></div>
                          <div><span style={{ color: '#80FD8F' }}>✓ 마감일:</span> {formatDeadline(reg.deadline)}</div>
                          <div className="flex items-center gap-2">
                            <span style={{ color: '#80FD8F' }}>✓ 장르:</span> 
                            <input
                              type="text"
                              value={additionalData[reg.id]?.genre || ''}
                              onChange={(e) => handleAdditionalDataChange(reg.id, 'genre', e.target.value)}
                              className="bg-transparent border-b border-gray-600 text-sm px-1 py-0.5 focus:outline-none focus:border-point"
                            />
                          </div>
                          <div><span style={{ color: '#80FD8F' }}>✓ 작가 성별:</span> {reg.author_gender || '-'}</div>
                          <div><span style={{ color: '#80FD8F' }}>✓ 카테고리:</span> {reg.category || '-'}</div>
                          <div className="flex items-center gap-2">
                            <span style={{ color: '#80FD8F' }}>✓ 국적:</span>
                            <input
                              type="text"
                              value={additionalData[reg.id]?.nationality || ''}
                              onChange={(e) => handleAdditionalDataChange(reg.id, 'nationality', e.target.value)}
                              className="bg-transparent border-b border-gray-600 text-sm px-1 py-0.5 focus:outline-none focus:border-point"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ color: '#80FD8F' }}>✓ 타입:</span>
                            <input
                              type="text"
                              value={additionalData[reg.id]?.type || ''}
                              onChange={(e) => handleAdditionalDataChange(reg.id, 'type', e.target.value)}
                              className="bg-transparent border-b border-gray-600 text-sm px-1 py-0.5 focus:outline-none focus:border-point"
                            />
                          </div>
                          <div><span className="text-gray-400">이메일:</span> {reg.email}</div>
                          <div><span className="text-gray-400">설명:</span> {reg.description}</div>
                          <div><span className="text-gray-400">등록일:</span> {formatDate(reg.created_at)}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
          ) : (
            <p className="text-gray-500 text-center py-8">대기 중인 등록이 없습니다.</p>
          )}
          </>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                영업용 링크 생성 <span style={{ color: '#80FD8F' }}>{reviews.length}개</span>
              </h2>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded p-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {reviewsLoading ? (
              <p className="text-center text-gray-500 py-8">로딩 중...</p>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 border border-gray-700 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{review.title}</h3>
                        <p className="text-sm text-gray-400">
                          {[review.publisher, review.author].filter(Boolean).join(' | ')}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          마감: {formatDeadline(review.deadline)} | 
                          등록일: {formatDate(review.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => generateSalesLink(review.id)}
                        className="ml-4 px-3 py-1 text-xs font-medium rounded transition-colors"
                        style={{ backgroundColor: '#80FD8F', color: 'black' }}
                      >
                        링크 복사
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      출처: {review.source === 'registration' ? '등록 신청' : '직접 등록'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">등록된 서평단이 없습니다.</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}