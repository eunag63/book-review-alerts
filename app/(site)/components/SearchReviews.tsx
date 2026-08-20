"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { Review } from "../../../lib/types";
import type { ReviewWithBadge } from "../../../lib/clickAnalytics";
import { isCreatedToday, isDeadlineValid } from "../../../lib/reviewUtils";
import { assignBadgesToReviews } from "../../../lib/clickAnalytics";
import KeywordFilter from "./KeywordFilter";
import DescriptionBubble from "./DescriptionBubble";

export default function SearchReviews() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReviewWithBadge[]>([]);
  const [allReviews, setAllReviews] = useState<ReviewWithBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortOrder, setSortOrder] = useState<"latest" | "deadline">("latest");

  const [filters, setFilters] = useState<{
    genre?: string;
    authorGender?: string;
    nationality?: string;
  }>({});

  // 전체 리뷰를 불러오는 함수
  const loadAllReviews = useCallback(async () => {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Seoul",
    });

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .gte("deadline", today)
      .or(`display_date.is.null,display_date.lte.${today}`)
      .order("deadline", { ascending: true })
      .limit(100);

    if (!error && data) {
      const list = (data as Review[]).filter(isDeadlineValid);

      // 배지 할당
      const listWithBadges = await assignBadgesToReviews(list);
      setAllReviews(listWithBadges);
    }
  }, []);

  // 컴포넌트 마운트시 전체 리스트 로드
  useEffect(() => {
    loadAllReviews();
  }, [loadAllReviews]);

  const calcDDay = (deadline: string) => {
    const today = new Date();
    const target = new Date(deadline);
    const diff = Math.ceil(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff <= 0 ? "D-day" : `D-${diff}`;
  };

  const handleClick = (reviewId: number, source: string = "website") => {
    // RedirectClient에서 기록하므로 여기서는 리다이렉트만
    window.location.href = `/redirect/${reviewId}?source=${source}`;
  };

  useEffect(() => {
    let list = [...allReviews];

    // 1. 검색
    if (query.trim()) {
      const keyword = query.toLowerCase();

      list = list.filter(
        (review) =>
          review.title.toLowerCase().includes(keyword) ||
          review.author.toLowerCase().includes(keyword) ||
          review.publisher.toLowerCase().includes(keyword)
      );
    }

    // 2. 장르
    if (filters.genre) {
      list = list.filter((r) => r.category === filters.genre);
    }

    // 3. 작가 성별
    if (filters.authorGender) {
      const gender = filters.authorGender === "여성 작가" ? "여자" : "남자";

      list = list.filter((r) => r.author_gender === gender);
    }

    // 4. 국가
    if (filters.nationality) {
      list = list.filter((r) => r.nationality === filters.nationality);
    }

    // 5. 정렬
    list.sort((a, b) => {
      if (sortOrder === "latest") {
        return b.id - a.id;
      }

      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    setResults(list);
    setCurrentPage(1);
  }, [allReviews, query, filters, sortOrder]);

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage);

  const availableNationalities = Array.from(
    new Set(
      allReviews
        .map((review) => review.nationality)
        .filter((nationality): nationality is string => Boolean(nationality))
    )
  ).sort();

  return (
    <div className="mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색어를 입력해주세요"
        className="w-full border-b border-gray-300 pb-1 focus:border-point focus:outline-none mb-4"
      />

      <KeywordFilter
        availableNationalities={availableNationalities}
        onFilter={setFilters}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {loading && <p className="text-sm text-gray-500 mt-2">검색 중...</p>}

      {!loading && query !== "" && results.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">검색 결과가 없습니다.</p>
      )}

      {!loading && results.length > 0 && (
        <>
          <ul className="mt-4 space-y-2">
            {paginatedResults.map((r) => {
              return (
                <li key={r.id} className="p-4 border rounded relative">
                  {/* NEW 배지 */}
                  {isCreatedToday(r) && (
                    <span
                      className="absolute top-4 right-3 text-xs font-bold px-1 py-0.5 rounded text-black"
                      style={{ backgroundColor: "#80FD8F", fontSize: "10px" }}
                    >
                      NEW
                    </span>
                  )}
                  <p className="font-medium pr-12">{r.title}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    {[r.publisher, r.author, r.genre]
                      .filter(Boolean)
                      .join(" | ")}
                  </p>
                  <p className="text-sm text-point mb-1">
                    {calcDDay(r.deadline)}
                  </p>
                  <div className="flex justify-between items-center">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleClick(r.id, "website");
                      }}
                      className="text-point underline text-sm mt-1 inline-block"
                    >
                      신청하러 가기
                    </a>
                    {/* 배지를 오른쪽 아래에 작은 글자로 */}
                    {r.badge && (
                      <span
                        className="text-xs mt-1 font-medium"
                        style={{ color: "#80FD8F" }}
                      >
                        {r.badge}
                      </span>
                    )}
                  </div>

                  {r.source === "registration" && r.registration_id ? (
                    <DescriptionBubble registrationId={r.registration_id} />
                  ) : null}
                </li>
              );
            })}
          </ul>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4 mt-4">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm rounded ${
                      currentPage === page
                        ? "text-white font-semibold"
                        : "text-gray-500 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
