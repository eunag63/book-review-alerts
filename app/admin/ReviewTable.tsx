"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface Review {
  id: number;
  title: string;
  author: string;
  publisher: string;
  deadline: string;
  category: string;
  genre: string | null;
  nationality: string | null;
}

interface Props {
  reviews: Review[];
  renderedAt: string;
}

const weekdays = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];

function formatDeadline(deadline: string) {
  const date = new Date(deadline);

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}월 ${day}일 ${weekdays[date.getDay()]}까지`;
}

function formatGenre(genre: string | null) {
  if (!genre) return "";

  return genre
    .split(",")
    .map((v) => v.trim())
    .join("/");
}

function formatCategory(review: Review) {
  const parts = [review.category];

  const genres = review.genre ? formatGenre(review.genre).split("/") : [];

  const isLiterature = review.category === "문학";

  if (genres.includes("청소년")) {
    parts.push("청소년소설");
  } else if (genres.includes("그림책")) {
    parts.push("그림책");
  } else if (review.nationality && genres.includes("에세이")) {
    parts.push(`${review.nationality}에세이`);
  } else if (review.nationality && isLiterature) {
    parts.push(`${review.nationality}소설`);
  }

  const displayGenres = genres.filter(
    (genre) => genre !== "청소년" && genre !== "그림책" && genre !== "에세이"
  );

  parts.push(...displayGenres);

  return parts.join("/");
}

export default function ReviewTable({ reviews, renderedAt }: Props) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const lastUpdated = useMemo(() => {
    return new Date(renderedAt).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }, [renderedAt]);

  useEffect(() => {
    const saved = localStorage.getItem("posted-reviews");

    if (!saved) return;

    setSelectedIds(new Set(JSON.parse(saved)));
  }, []);

  const handleCopy = async (review: Review) => {
    const text = `[${formatCategory(review)}]
  
🍀 ${review.title}
🍀 ${review.author}
  
📚 ${review.publisher}
  
✅ ${formatDeadline(review.deadline)}
✅ 신청링크
https://freebook.kr/redirect/${review.id}`;

    await navigator.clipboard.writeText(text);

    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(review.id)) {
        next.delete(review.id);
      } else {
        next.add(review.id);
      }

      localStorage.setItem("posted-reviews", JSON.stringify(Array.from(next)));

      return next;
    });
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => router.refresh()}
          className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white active:scale-95"
          aria-label="새로고침"
          title="새로고침"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>

        <span className="text-sm text-zinc-400">마지막 갱신 {lastUpdated}</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-[1200px]">
          <thead className="sticky top-0 bg-zinc-950">
            <tr className="border-b border-zinc-800">
              <th className="min-w-[520px] px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                제목
              </th>

              <th className="w-52 px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                작가
              </th>

              <th className="w-56 px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                출판사
              </th>

              <th className="w-56 px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                마감일
              </th>
            </tr>
          </thead>

          <tbody>
            {reviews.map((review) => (
              <tr
                key={review.id}
                onClick={() => handleCopy(review)}
                className="cursor-pointer border-b border-zinc-900 transition-colors hover:bg-zinc-900"
              >
                <td
                  className={`whitespace-nowrap px-6 py-4 font-medium transition-colors ${
                    selectedIds.has(review.id) ? "text-[#80FD8F]" : "text-white"
                  }`}
                >
                  {review.title}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-zinc-400">
                  {review.author}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-zinc-400">
                  {review.publisher}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-zinc-400">
                  {formatDeadline(review.deadline)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
