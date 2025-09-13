'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

interface ReviewInfo {
  id: number;
  title: string;
  author: string;
  publisher: string;
  deadline: string;
}

interface WinnerData {
  name: string;
  contact: string;
  reviewContact: string;
  address: string;
  addressDetail: string;
}

export default function WinnersPage({ params }: { params: Promise<{ reviewId: string }> }) {
  const [reviewId, setReviewId] = useState<string>('')
  const [reviewInfo, setReviewInfo] = useState<ReviewInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [formData, setFormData] = useState<WinnerData>({
    name: '',
    contact: '',
    reviewContact: '',
    address: '',
    addressDetail: ''
  })

  useEffect(() => {
    async function initializeWinners() {
      const resolvedParams = await params;
      setReviewId(resolvedParams.reviewId);
      await fetchReviewInfo(resolvedParams.reviewId);
    }
    initializeWinners();
  }, [params])

  const fetchReviewInfo = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`)
      const data = await response.json()
      
      if (response.ok && data.review) {
        setReviewInfo(data.review)
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

  const searchAddress = () => {
    if (!scriptLoaded) {
      alert('주소 검색 서비스를 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // @ts-ignore
    new window.daum.Postcode({
      oncomplete: function(data: any) {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          fullAddress += (extraAddress !== '' ? ' (' + extraAddress + ')' : '');
        }

        setFormData(prev => ({
          ...prev,
          address: fullAddress
        }));
      }
    }).open();
  };

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

    // 기본 주소 + 상세 주소 합치기
    const fullAddress = formData.addressDetail 
      ? `${formData.address} ${formData.addressDetail}`
      : formData.address;

    try {
      const response = await fetch(`/api/winners/${reviewId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          contact: formData.contact,
          reviewContact: formData.reviewContact,
          address: fullAddress
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        alert('당첨자 정보가 성공적으로 등록되었습니다!')
      } else {
        const error = await response.json()
        alert(error.error || '등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('등록 오류:', error)
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
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-xl font-bold text-white mb-2">등록 완료!</h1>
            <p className="text-gray-400 text-sm">
              당첨자 정보가 성공적으로 등록되었습니다.<br/>
              추후 서평 링크 제출 안내를 받으실 예정입니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        onLoad={() => {
          console.log('Daum Postcode 스크립트 로드 완료');
          setScriptLoaded(true);
        }}
        onError={() => {
          console.error('Daum Postcode 스크립트 로드 실패');
        }}
      />
      <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        {/* 서평단 정보 */}
        <div className="mb-6 p-4 border border-gray-700 rounded">
          <h1 className="text-xl font-bold text-white mb-2">🎉 서평단 당첨자 등록</h1>
          <h2 className="text-lg font-medium text-white mb-1">{reviewInfo.title}</h2>
          <p className="text-gray-400 text-sm">
            {reviewInfo.author} | {reviewInfo.publisher}
          </p>
          <p className="text-gray-400 text-sm">
            마감일: {new Date(reviewInfo.deadline).toLocaleDateString('ko-KR')}
          </p>
        </div>

        <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded">
          <p className="text-green-300 text-sm">
            ✅ 축하드립니다! 서평단에 당첨되셨습니다.<br/>
            아래 정보를 입력해주시면 추후 서평 링크 제출 안내를 받으실 수 있습니다.
          </p>
        </div>
        
        {/* 등록 폼 */}
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
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="010-1234-5678"
              value={formData.contact}
              onChange={handlePhoneChange}
              className="w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
              maxLength={13}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              SNS ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.reviewContact}
              onChange={(e) => setFormData(prev => ({...prev, reviewContact: e.target.value}))}
              className="w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              주소 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="주소 검색 버튼을 클릭해주세요"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                className="flex-1 p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
                readOnly
                required
              />
              <button
                type="button"
                onClick={searchAddress}
                disabled={!scriptLoaded}
                className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm whitespace-nowrap disabled:opacity-50"
              >
                {scriptLoaded ? '주소 검색' : '로딩중...'}
              </button>
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="동/호수, 건물명 등 상세 주소를 입력해주세요"
              value={formData.addressDetail}
              onChange={(e) => setFormData(prev => ({...prev, addressDetail: e.target.value}))}
              className="w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-gray-400 text-xs mt-1">
            도서 배송을 위한 정확한 주소를 입력해주세요
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !formData.name || !formData.contact || !formData.reviewContact || !formData.address}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
            style={{ backgroundColor: '#80FD8F', color: '#000000' }}
          >
            {submitting ? '등록 중...' : '당첨자 정보 등록하기'}
          </button>
        </form>
      </div>
      </div>
    </>
  )
}