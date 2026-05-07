'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface ExistingReview {
  id: number;
  title: string;
  author: string;
  publisher: string;
  url: string;
  deadline: string;
  genre: string;
  author_gender: string;
  category: string;
}

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
  
  // 검색 관련 상태
  const [searchResults, setSearchResults] = useState<ExistingReview[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedExistingReview, setSelectedExistingReview] = useState<ExistingReview | null>(null);
  const [isExistingBook, setIsExistingBook] = useState(false);
  const [forceNewBook, setForceNewBook] = useState(false); // 새 책으로 강제 등록

  // 제목 검색 함수
  const searchBooks = useCallback(async (title: string) => {
    if (title.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search-reviews?title=${encodeURIComponent(title)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        setShowSearchResults(data.results.length > 0);
      }
    } catch (error) {
      console.error('검색 오류:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // debounce를 위한 effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (formData.title && !isExistingBook && !forceNewBook) {
        searchBooks(formData.title);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [formData.title, searchBooks, isExistingBook, forceNewBook]);

  // 기존 책 선택 처리
  const selectExistingBook = (review: ExistingReview) => {
    setSelectedExistingReview(review);
    setIsExistingBook(true);
    setFormData(prev => ({
      ...prev,
      title: review.title,
      author: review.author,
      publisher: review.publisher,
      link: review.url,
      deadline: review.deadline,
      genre: review.category || review.genre,
      authorGender: review.author_gender === '여자' ? '여성' : review.author_gender === '남자' ? '남성' : review.author_gender
    }));
    setShowSearchResults(false);
  };

  // 새 책으로 등록
  const registerAsNewBook = () => {
    const currentTitle = formData.title;
    setSelectedExistingReview(null);
    setIsExistingBook(false);
    setShowSearchResults(false);
    setForceNewBook(true); // 새 책으로 강제 등록 상태로 설정
    
    // 제목만 남기고 나머지 필드 초기화
    setFormData({
      title: currentTitle,
      author: '',
      publisher: '',
      link: '',
      deadline: '',
      genre: '',
      authorGender: '',
      email: '',
      description: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 제목이 변경되면 기존 책 선택 상태 초기화
    if (name === 'title' && isExistingBook) {
      setIsExistingBook(false);
      setSelectedExistingReview(null);
    }
    
    // 제목이 변경되고 새 책으로 강제 등록 상태가 아니면 검색 가능하도록 설정
    if (name === 'title' && forceNewBook && value !== formData.title) {
      setForceNewBook(false);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // 입력 시 에러 메시지 제거
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 기존 책인 경우 추가 데이터 포함
      const submitData = {
        ...formData,
        ...(isExistingBook && selectedExistingReview ? {
          existingReviewId: selectedExistingReview.id,
          isExistingBook: true
        } : {
          isExistingBook: false
        })
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
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
      <div className="min-h-screen flex flex-col justify-center">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
          문의 사항이 있으신 경우 hello@freebook.kr 이용해주세요
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-md p-3 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 필수 필드들 */}
        <div className="relative">
          <label className="block text-sm font-medium text-white mb-2">
            제목 <span className="text-red-400">*</span>
            {isExistingBook && (
              <span className="ml-2 text-xs text-[#80FD8F]">✓ 기존 등록된 책</span>
            )}
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white placeholder-gray-500"
            placeholder="책 제목을 입력하세요"
            onFocus={() => {
              if (searchResults.length > 0 && !isExistingBook && !forceNewBook) {
                setShowSearchResults(true);
              }
            }}
          />
          
          {isSearching && (
            <div className="absolute right-0 top-8 text-gray-400 text-sm">
              검색 중...
            </div>
          )}
          
          {/* 검색 결과 드롭다운 */}
          {showSearchResults && searchResults.length > 0 && !forceNewBook && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="p-3 text-xs text-gray-300 border-b border-gray-600">
                <div className="font-medium mb-1">기존에 등록된 책을 찾았습니다!</div>
                <div className="text-gray-400">한 줄 소개를 추가하고 싶으시다면 제목을 눌러주세요</div>
              </div>
              {searchResults.map((review) => (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => selectExistingBook(review)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
                >
                  <div className="text-white font-medium">{review.title}</div>
                  <div className="text-xs text-gray-400">
                    {review.author} · {review.publisher}
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={registerAsNewBook}
                className="w-full px-3 py-2 text-left hover:bg-gray-700 text-[#80FD8F] text-sm font-medium"
              >
                새로운 책으로 등록하기
              </button>
            </div>
          )}
          
          {/* 기존 책 선택 시 안내 */}
          {isExistingBook && selectedExistingReview && (
            <div className="mt-2 p-3 bg-green-900/20 border border-green-500 rounded-md">
              <p className="text-green-400 text-sm font-medium mb-1">
                기존 등록된 책을 선택했습니다
              </p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={registerAsNewBook}
                  className="flex items-center text-xs text-[#80FD8F] hover:text-green-200"
                >
                  <span className="mr-1">▷</span>
                  <span className="underline">새로운 책으로 등록하기</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            작가 <span className="text-red-400">*</span>
            {isExistingBook && <span className="ml-2 text-xs text-gray-400">자동 입력됨</span>}
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            required
            readOnly={isExistingBook}
            className={`w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white placeholder-gray-500 ${
              isExistingBook ? 'text-gray-300 cursor-not-allowed' : ''
            }`}
            placeholder="작가명을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            출판사 <span className="text-red-400">*</span>
            {isExistingBook && <span className="ml-2 text-xs text-gray-400">자동 입력됨</span>}
          </label>
          <input
            type="text"
            name="publisher"
            value={formData.publisher}
            onChange={handleInputChange}
            required
            readOnly={isExistingBook}
            className={`w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white placeholder-gray-500 ${
              isExistingBook ? 'text-gray-300 cursor-not-allowed' : ''
            }`}
            placeholder="출판사명을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            서평단 신청 링크 <span className="text-red-400">*</span>
            {isExistingBook && <span className="ml-2 text-xs text-gray-400">자동 입력됨</span>}
          </label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            required
            readOnly={isExistingBook}
            className={`w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white placeholder-gray-500 ${
              isExistingBook ? 'text-gray-300 cursor-not-allowed' : ''
            }`}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            마감 날짜 <span className="text-red-400">*</span>
            {isExistingBook && <span className="ml-2 text-xs text-gray-400">자동 입력됨</span>}
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            required
            readOnly={isExistingBook}
            className={`w-full px-0 py-3 border-0 border-b border-gray-600 bg-transparent text-white focus:outline-none focus:border-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert ${
              isExistingBook ? 'text-gray-300 cursor-not-allowed' : ''
            }`}
          />
        </div>

        {/* 선택 필드들 */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            카테고리
            {isExistingBook && <span className="ml-2 text-xs text-gray-400">자동 선택됨</span>}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => !isExistingBook && setFormData(prev => ({ ...prev, genre: '문학' }))}
              disabled={isExistingBook}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                formData.genre === '문학' 
                  ? 'bg-[#80FD8F] text-black' 
                  : isExistingBook
                    ? 'border border-gray-500 text-gray-400 cursor-not-allowed'
                    : 'border border-white text-white hover:bg-gray-800'
              }`}
            >
              문학
            </button>
            <button
              type="button"
              onClick={() => !isExistingBook && setFormData(prev => ({ ...prev, genre: '비문학' }))}
              disabled={isExistingBook}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                formData.genre === '비문학' 
                  ? 'bg-[#80FD8F] text-black' 
                  : isExistingBook
                    ? 'border border-gray-500 text-gray-400 cursor-not-allowed'
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
            {isExistingBook && <span className="ml-2 text-xs text-gray-400">자동 선택됨</span>}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => !isExistingBook && setFormData(prev => ({ ...prev, authorGender: '여성' }))}
              disabled={isExistingBook}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                formData.authorGender === '여성' 
                  ? 'bg-[#80FD8F] text-black' 
                  : isExistingBook
                    ? 'border border-gray-500 text-gray-400 cursor-not-allowed'
                    : 'border border-white text-white hover:bg-gray-800'
              }`}
            >
              여성
            </button>
            <button
              type="button"
              onClick={() => !isExistingBook && setFormData(prev => ({ ...prev, authorGender: '남성' }))}
              disabled={isExistingBook}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                formData.authorGender === '남성' 
                  ? 'bg-[#80FD8F] text-black' 
                  : isExistingBook
                    ? 'border border-gray-500 text-gray-400 cursor-not-allowed'
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
    </div>
  );
}