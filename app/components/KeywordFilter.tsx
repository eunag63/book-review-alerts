'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { isDeadlineValid } from '../../lib/reviewUtils'
import type { Review } from '../../lib/types'

interface KeywordFilterProps {
  onFilter: (filters: { genre?: string; authorGender?: string; nationality?: string }) => void
}

export default function KeywordFilter({ onFilter }: KeywordFilterProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [selectedAuthorGender, setSelectedAuthorGender] = useState<string>('')
  const [selectedNationality, setSelectedNationality] = useState<string>('')
  const [availableNationalities, setAvailableNationalities] = useState<string[]>([])

  // 유효한 리뷰(마감일 지나지 않은)에서 사용 가능한 국가 목록 조회
  const loadAvailableNationalities = async () => {
    try {
      const { data, error } = await supabase.from('reviews').select('*')
      if (!error && data) {
        const validReviews = (data as Review[]).filter(isDeadlineValid)
        const uniqueNationalities = Array.from(
          new Set(
            validReviews
              .map(r => r.nationality)
              .filter(Boolean) // null, undefined, 빈 문자열 제거
          )
        )
        setAvailableNationalities(uniqueNationalities)
      }
    } catch (error) {
      console.error('국가 목록 조회 실패:', error)
      setAvailableNationalities(['한국', '일본', '미국', '영국', '중국']) // 기본값
    }
  }

  // 컴포넌트가 마운트되면 국가 목록 로드 후 전체 리스트를 로드
  useEffect(() => {
    loadAvailableNationalities().then(() => {
      onFilter({})
    })
  }, [onFilter])

  const genres = ['문학', '비문학']
  const authorGenders = ['여성 작가', '남성 작가']

  const handleGenreClick = (genre: string) => {
    const newGenre = selectedGenre === genre ? '' : genre
    setSelectedGenre(newGenre)
    applyFilters({ genre: newGenre })
  }

  const handleAuthorGenderClick = (gender: string) => {
    const newGender = selectedAuthorGender === gender ? '' : gender
    setSelectedAuthorGender(newGender)
    applyFilters({ authorGender: newGender })
  }

  const handleNationalityClick = (nationality: string) => {
    const newNationality = selectedNationality === nationality ? '' : nationality
    setSelectedNationality(newNationality)
    applyFilters({ nationality: newNationality })
  }

  const applyFilters = (newFilter: { genre?: string; authorGender?: string; nationality?: string }) => {
    const filters = {
      genre: newFilter.genre !== undefined ? newFilter.genre : selectedGenre,
      authorGender: newFilter.authorGender !== undefined ? newFilter.authorGender : selectedAuthorGender,
      nationality: newFilter.nationality !== undefined ? newFilter.nationality : selectedNationality,
    }
    
    // 빈 문자열은 제거
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '')
    )
    
    onFilter(cleanFilters)
  }

  const clearAll = () => {
    setSelectedGenre('')
    setSelectedAuthorGender('')
    setSelectedNationality('')
    onFilter({})
  }

  const hasActiveFilters = selectedGenre || selectedAuthorGender || selectedNationality

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold">🍀 키워드 필터</h3>
      </div>
      
      {/* 첫 번째 줄: 장르 */}
      <div className="mb-2">
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className={`px-3 py-1 border rounded-full text-sm ${
                selectedGenre === genre
                  ? 'bg-white text-black border-black'
                  : 'bg-black text-white border-gray-400 hover:bg-gray-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* 두 번째 줄: 작가 성별 */}
      <div className="mb-2">
        <div className="flex flex-wrap gap-2">
          {authorGenders.map((gender) => (
            <button
              key={gender}
              onClick={() => handleAuthorGenderClick(gender)}
              className={`px-3 py-1 border rounded-full text-sm ${
                selectedAuthorGender === gender
                  ? 'bg-white text-black border-black'
                  : 'bg-black text-white border-gray-400 hover:bg-gray-800'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {/* 세 번째 줄: 국가 */}
      {availableNationalities.length > 0 && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-2">
            {availableNationalities.map((nationality) => (
              <button
                key={nationality}
                onClick={() => handleNationalityClick(nationality)}
                className={`px-3 py-1 border rounded-full text-sm ${
                  selectedNationality === nationality
                    ? 'bg-white text-black border-black'
                    : 'bg-black text-white border-gray-400 hover:bg-gray-800'
                }`}
              >
                {nationality}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}