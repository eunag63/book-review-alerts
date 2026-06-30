"use client";

import { useState } from "react";

interface Review {
  id: number;
  title: string;
  author: string;
  publisher: string;
  deadline: string;
  category: string;
  genre: string | null;
}

interface Props {
  reviews: Review[];
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

export default function ReviewTable({ reviews }: Props) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = async (review: Review) => {
    const text = `[${review.category}${
      review.genre ? "/" + formatGenre(review.genre) : ""
    }]

🍀 ${review.title}
🍀 ${review.author}

📚 ${review.publisher}

✅ ${formatDeadline(review.deadline)}
✅ 신청링크
https://freebook.kr/redirect/${review.id}`;

    await navigator.clipboard.writeText(text);

    setCopiedId(review.id);

    setTimeout(() => {
      setCopiedId(null);
    }, 1000);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <table className="w-full table-fixed">
        <thead className="sticky top-0 bg-zinc-950">
          <tr className="border-b border-zinc-800">
            <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
              제목
            </th>
            <th className="w-56 px-6 py-4 text-left text-sm font-semibold text-zinc-400">
              작가
            </th>
            <th className="w-56 px-6 py-4 text-left text-sm font-semibold text-zinc-400">
              출판사
            </th>
            <th className="w-40 px-6 py-4 text-left text-sm font-semibold text-zinc-400">
              마감일
            </th>
          </tr>
        </thead>

        <tbody>
          {reviews.map((review) => (
            <tr
              key={review.id}
              onClick={() => handleCopy(review)}
              className={`cursor-pointer border-b border-zinc-900 transition-all ${
                copiedId === review.id
                  ? "bg-[#80FD8F] text-black"
                  : "hover:bg-zinc-900"
              }`}
            >
              <td className="px-6 py-4 font-medium">{review.title}</td>

              <td className="px-6 py-4 text-zinc-400">{review.author}</td>

              <td className="px-6 py-4 text-zinc-400">{review.publisher}</td>

              <td className="px-6 py-4 text-zinc-400">{review.deadline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
