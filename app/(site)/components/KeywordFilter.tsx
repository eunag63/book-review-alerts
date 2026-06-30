"use client";

import { useState } from "react";

interface KeywordFilterProps {
  availableNationalities: string[];

  onFilter: (filters: {
    genre?: string;
    authorGender?: string;
    nationality?: string;
  }) => void;

  sortOrder: "latest" | "deadline";
  onSortChange: (sort: "latest" | "deadline") => void;
}

export default function KeywordFilter({
  availableNationalities,
  onFilter,
  sortOrder,
  onSortChange,
}: KeywordFilterProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedAuthorGender, setSelectedAuthorGender] = useState<string>("");
  const [selectedNationality, setSelectedNationality] = useState<string>("");

  const genres = ["문학", "비문학"];
  const authorGenders = ["여성 작가", "남성 작가"];

  const handleGenreClick = (genre: string) => {
    const newGenre = selectedGenre === genre ? "" : genre;
    setSelectedGenre(newGenre);
    applyFilters({ genre: newGenre });
  };

  const handleAuthorGenderClick = (gender: string) => {
    const newGender = selectedAuthorGender === gender ? "" : gender;
    setSelectedAuthorGender(newGender);
    applyFilters({ authorGender: newGender });
  };

  const handleNationalityClick = (nationality: string) => {
    const newNationality =
      selectedNationality === nationality ? "" : nationality;
    setSelectedNationality(newNationality);
    applyFilters({ nationality: newNationality });
  };

  const applyFilters = (newFilter: {
    genre?: string;
    authorGender?: string;
    nationality?: string;
  }) => {
    const filters = {
      genre: newFilter.genre !== undefined ? newFilter.genre : selectedGenre,
      authorGender:
        newFilter.authorGender !== undefined
          ? newFilter.authorGender
          : selectedAuthorGender,
      nationality:
        newFilter.nationality !== undefined
          ? newFilter.nationality
          : selectedNationality,
    };

    // 빈 문자열은 제거
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "")
    );

    onFilter(cleanFilters);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold">🍀 키워드 필터</h3>
        <button
          onClick={() => onSortChange("latest")}
          className={`ml-auto text-sm ${
            sortOrder === "latest"
              ? "font-semibold text-white"
              : "text-gray-400"
          }`}
        >
          등록순
        </button>

        <button
          onClick={() => onSortChange("deadline")}
          className={`text-sm ${
            sortOrder === "deadline"
              ? "font-semibold text-white"
              : "text-gray-400"
          }`}
        >
          마감순
        </button>
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
                  ? "bg-white text-black border-black"
                  : "bg-black text-white border-gray-400 hover:bg-gray-800"
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
                  ? "bg-white text-black border-black"
                  : "bg-black text-white border-gray-400 hover:bg-gray-800"
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
                    ? "bg-white text-black border-black"
                    : "bg-black text-white border-gray-400 hover:bg-gray-800"
                }`}
              >
                {nationality}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
