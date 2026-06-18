"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Review } from "../../lib/types";
import type { ReviewWithBadge } from "../../lib/clickAnalytics";
import { isCreatedToday, isDeadlineValid } from "../../lib/reviewUtils";
import { assignBadgesToReviews } from "../../lib/clickAnalytics";
import KeywordFilter from "./KeywordFilter";
import DescriptionBubble from "./DescriptionBubble";

export default function SearchReviews() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReviewWithBadge[]>([]);
  const [allReviews, setAllReviews] = useState<ReviewWithBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [sortOrder, setSortOrder] = useState<"latest" | "deadline">("latest");

  const [filters, setFilters] = useState<{
    genre?: string;
    authorGender?: string;
    nationality?: string;
  }>({});

  // 전체 리뷰를 불러오는 함수
  const loadAllReviews = useCallback(async () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .gte("deadline", now.toISOString())
      .order("deadline", { ascending: true })
      .limit(100);

    if (!error && data) {
      const list = data as Review[];

      // 배지 할당
      const listWithBadges = await assignBadgesToReviews(list);
      setAllReviews(listWithBadges);
      setDisplayCount(5); // 초기화
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
      if (a.source === "registration" && b.source !== "registration") return -1;
      if (a.source !== "registration" && b.source === "registration") return 1;

      if (sortOrder === "latest") {
        return b.id - a.id;
      }

      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    setResults(list);
    setDisplayCount(5);
  }, [allReviews, query, filters, sortOrder]);

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
            {results.slice(0, displayCount).map((r) => {
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
          {displayCount < results.length && (
            <div className="pt-3 mt-3">
              <button
                onClick={() => setDisplayCount((prev) => prev + 5)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ▽ 더보기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
