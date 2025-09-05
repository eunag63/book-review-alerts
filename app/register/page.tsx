'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    link: '',
    deadline: '',
    genre: '',
    authorGender: '',
    email: '',
    description: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // 입력 시 에러 메시지 제거
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '등록에 실패했습니다.');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen p-6 max-w-md mx-auto flex flex-col justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-[#80FD8F] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">등록 신청 완료되었습니다</h1>
            <p className="text-gray-400 mb-8">
              최종 등록까지 시간이 소요될 수 있습니다
            </p>
          </div>
          <Link 
            href="/"
            className="inline-block px-6 py-2 bg-[#80FD8F] text-black font-medium rounded-md hover:bg-[#70ED7F] transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          돌아가기
        </Link>
        <h1 className="text-2xl font-bold mb-4">서평단 등록하기</h1>
        <p className="text-[#80FD8F] mb-2 text-sm font-medium">더 많은 독자들에게 여러분의 책을 알려보세요 🍀</p>
        <p className="text-gray-400 text-sm">
          문의 사항이 있으신 경우 admin@freebook.kr 이용해주세요
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-md p-3 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 필수 필드들 */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            제목 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white placeholder-gray-500"
            placeholder="책 제목을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            작가 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white placeholder-gray-500"
            placeholder="작가명을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            출판사 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="publisher"
            value={formData.publisher}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white placeholder-gray-500"
            placeholder="출판사명을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            링크 <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white placeholder-gray-500"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            마감 날짜 <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        {/* 선택 필드들 */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            카테고리
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, genre: '문학' }))}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                formData.genre === '문학' 
                  ? 'bg-[#80FD8F] text-black' 
                  : 'border border-white text-white hover:bg-gray-800'
              }`}
            >
              문학
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, genre: '비문학' }))}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                formData.genre === '비문학' 
                  ? 'bg-[#80FD8F] text-black' 
                  : 'border border-white text-white hover:bg-gray-800'
              }`}
            >
              비문학
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-3">
            작가 성별
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, authorGender: '여성' }))}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                formData.authorGender === '여성' 
                  ? 'bg-[#80FD8F] text-black' 
                  : 'border border-white text-white hover:bg-gray-800'
              }`}
            >
              여성
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, authorGender: '남성' }))}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                formData.authorGender === '남성' 
                  ? 'bg-[#80FD8F] text-black' 
                  : 'border border-white text-white hover:bg-gray-800'
              }`}
            >
              남성
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            이메일 주소 <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white placeholder-gray-500"
            placeholder="your@email.com"
          />
          <p className="text-xs text-gray-400 mt-2">
            출판사 이름과 메일 도메인 주소가 다르다면 등록이 거부될 수 있습니다
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            한 줄 소개 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white placeholder-gray-500"
            placeholder="책에 대한 간단한 소개를 작성해주세요"
          />
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-6 py-3 font-medium rounded-md transition-colors ${
              isLoading 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-[#80FD8F] text-black hover:bg-[#70ED7F]'
            }`}
          >
            {isLoading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </main>
  );
}