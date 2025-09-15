'use client'

import { useState, useEffect } from 'react'

interface ParticipantData {
  id?: number;
  contact: string; // 이메일 또는 SNS ID
  gender: string;
  age: number;
  address: string;
  phone: string;
  review_info?: {
    title: string;
    author: string;
    publisher: string;
    deadline: string;
  };
  progress_status?: string;
}

export default function ParticipantPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isNewUser, setIsNewUser] = useState(true)
  const [formData, setFormData] = useState<ParticipantData>({
    contact: '',
    gender: '',
    age: 0,
    address: '',
    phone: ''
  })

  useEffect(() => {
    async function initializeToken() {
      const resolvedParams = await params;
      setToken(resolvedParams.token);
      await checkExistingUser(resolvedParams.token);
    }
    initializeToken();
  }, [params])

  const checkExistingUser = async (userToken: string) => {
    try {
      const response = await fetch(`/api/participant/${userToken}`)
      const data = await response.json()
      
      if (response.ok && data.participant) {
        // 기존 사용자 - 대시보드로 이동
        setIsNewUser(false)
        setFormData(data.participant)
      } else {
        // 신규 사용자 - 정보 입력 폼 표시
        setIsNewUser(true)
      }
    } catch (error) {
      console.error('사용자 확인 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/participant/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // 정보 저장 성공 - 대시보드로 이동
        setIsNewUser(false)
        const data = await response.json()
        setFormData(data.participant)
      } else {
        const error = await response.json()
        alert(error.message || '정보 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('정보 저장 오류:', error)
      alert('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">로딩 중...</p>
      </div>
    )
  }

  if (isNewUser) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            서평단 참가자 정보 등록
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
                성별 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({...prev, gender: e.target.value}))}
                className="w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
                required
              >
                <option value="">선택해주세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                나이 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData(prev => ({...prev, age: parseInt(e.target.value) || 0}))}
                className="w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
                min="1"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                className="w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                className="w-full p-3 border rounded-md bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
              style={{ backgroundColor: '#80FD8F', color: '#000000' }}
            >
              {loading ? '저장 중...' : '정보 저장하고 시작하기'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 대시보드 화면
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          서평단 참가자 대시보드
        </h1>
        
        {formData.review_info && (
          <div className="mb-6 p-4 border border-gray-700 rounded">
            <h2 className="text-lg font-medium text-white mb-2">참가 중인 서평단</h2>
            <p className="text-white font-medium">{formData.review_info.title}</p>
            <p className="text-gray-400 text-sm">
              {formData.review_info.author} | {formData.review_info.publisher}
            </p>
            <p className="text-gray-400 text-sm">
              마감일: {formData.review_info.deadline}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-700 rounded">
            <h3 className="text-lg font-medium text-white mb-4">진도 현황</h3>
            <p className="text-gray-400">진도 관리 기능 구현 예정</p>
          </div>

          <div className="p-4 border border-gray-700 rounded">
            <h3 className="text-lg font-medium text-white mb-4">서평 제출</h3>
            <p className="text-gray-400">서평 링크 제출 기능 구현 예정</p>
          </div>
        </div>
      </div>
    </div>
  )
}