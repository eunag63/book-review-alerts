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
  display_date: string | null;
  url: string;
  category: string | null;
  genre: string | null;
  nationality: string | null;
  author_gender: string | null;
}

interface Props {
  reviews: Review[];
  renderedAt: string;
}

interface EditReview {
  title: string;
  author: string;
  publisher: string;
  deadline: string;
  display_date: string;
  url: string;
  category: string;
  genre: string;
  nationality: string;
  author_gender: string;
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

  return parts.filter(Boolean).join("/");
}

export default function ReviewTable({ reviews, renderedAt }: Props) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editedReviews, setEditedReviews] = useState<
    Record<number, EditReview>
  >({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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

  const createEditData = (review: Review): EditReview => ({
    title: review.title,
    author: review.author,
    publisher: review.publisher,
    deadline: review.deadline,
    display_date: review.display_date ?? "",
    url: review.url,
    category: review.category ?? "",
    genre: review.genre ?? "",
    nationality: review.nationality ?? "",
    author_gender: review.author_gender ?? "",
  });

  const handleEditStart = () => {
    const next: Record<number, EditReview> = {};

    reviews.forEach((review) => {
      next[review.id] = createEditData(review);
    });

    setEditedReviews(next);
    setIsEditing(true);
    setSuccess(false);
    setError("");
  };

  const handleChange = (id: number, field: keyof EditReview, value: string) => {
    setEditedReviews((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const changedReviews = reviews.filter((review) => {
        const edited = editedReviews[review.id];

        if (!edited) return false;

        return (
          edited.title !== review.title ||
          edited.author !== review.author ||
          edited.publisher !== review.publisher ||
          edited.deadline !== review.deadline ||
          edited.display_date !== (review.display_date ?? "") ||
          edited.url !== review.url ||
          edited.category !== (review.category ?? "") ||
          edited.genre !== (review.genre ?? "") ||
          edited.nationality !== (review.nationality ?? "") ||
          edited.author_gender !== (review.author_gender ?? "")
        );
      });

      for (const review of changedReviews) {
        const response = await fetch(`/api/admin/reviews/${review.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedReviews[review.id]),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "서평단 수정에 실패했습니다.");
        }
      }

      setIsEditing(false);
      setEditedReviews({});
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "서평단 수정에 실패했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (review: Review) => {
    if (isEditing) return;

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
      <div className="mb-4">
        {success && (
          <div className="mb-3 rounded-lg border border-[#80FD8F]/30 bg-[#80FD8F]/10 px-4 py-3 text-sm font-medium text-[#80FD8F]">
            서평단 정보가 수정되었습니다.
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.refresh()}
              className="rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white active:scale-95"
              aria-label="새로고침"
              title="새로고침"
              disabled={isEditing || saving}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>

            <span className="text-sm text-zinc-400">
              마지막 갱신 {lastUpdated}
            </span>
          </div>

          <button
            onClick={isEditing ? handleSave : handleEditStart}
            disabled={saving}
            className="rounded-lg bg-[#80FD8F] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "저장 중..." : isEditing ? "저장" : "수정"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-[1380px]">
          <thead className="sticky top-0 bg-zinc-950">
            <tr className="border-b border-zinc-800">
              <th className="min-w-[360px] px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                제목
              </th>

              <th className="min-w-[180px] px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                작가
              </th>

              <th className="min-w-[180px] px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                출판사
              </th>

              <th className="min-w-[180px] px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                마감일
              </th>

              {isEditing && (
                <>
                  <th className="min-w-[180px] px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    홈페이지 노출 시작일
                  </th>

                  <th className="min-w-[300px] px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    신청 링크
                  </th>

                  <th className="min-w-[140px] px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    카테고리
                  </th>

                  <th className="min-w-[180px] px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    장르
                  </th>

                  <th className="min-w-[160px] px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    저자 국적
                  </th>

                  <th className="min-w-[140px] px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    저자 성별
                  </th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {reviews.map((review) => {
              const edited = editedReviews[review.id];

              return (
                <tr
                  key={review.id}
                  onClick={() => handleCopy(review)}
                  className={`border-b border-zinc-900 transition-colors ${
                    isEditing
                      ? "cursor-default"
                      : "cursor-pointer hover:bg-zinc-900"
                  }`}
                >
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        value={edited?.title ?? ""}
                        onChange={(e) =>
                          handleChange(review.id, "title", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-10 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-[#80FD8F]"
                      />
                    ) : (
                      <span
                        className={`whitespace-nowrap font-medium transition-colors ${
                          selectedIds.has(review.id)
                            ? "text-[#80FD8F]"
                            : "text-white"
                        }`}
                      >
                        {review.title}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        value={edited?.author ?? ""}
                        onChange={(e) =>
                          handleChange(review.id, "author", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-10 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-[#80FD8F]"
                      />
                    ) : (
                      <span className="whitespace-nowrap text-zinc-400">
                        {review.author}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        value={edited?.publisher ?? ""}
                        onChange={(e) =>
                          handleChange(review.id, "publisher", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-10 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-[#80FD8F]"
                      />
                    ) : (
                      <span className="whitespace-nowrap text-zinc-400">
                        {review.publisher}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="date"
                        value={edited?.deadline ?? ""}
                        onChange={(e) =>
                          handleChange(review.id, "deadline", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-10 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-[#80FD8F] [color-scheme:dark]"
                      />
                    ) : (
                      <span className="whitespace-nowrap text-zinc-400">
                        {formatDeadline(review.deadline)}
                      </span>
                    )}
                  </td>

                  {isEditing && (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="date"
                          value={edited?.display_date ?? ""}
                          onChange={(e) =>
                            handleChange(
                              review.id,
                              "display_date",
                              e.target.value
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="h-10 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-[#80FD8F] [color-scheme:dark]"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <input
                          value={edited?.url ?? ""}
                          onChange={(e) =>
                            handleChange(review.id, "url", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="h-10 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-[#80FD8F]"
                          placeholder="신청 링크"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={edited?.category ?? ""}
                          onChange={(e) =>
                            handleChange(review.id, "category", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="h-10 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-[#80FD8F] [color-scheme:dark]"
                        >
                          <option value="">선택</option>
                          <option value="문학">문학</option>
                          <option value="비문학">비문학</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <input
                          value={edited?.genre ?? ""}
                          onChange={(e) =>
                            handleChange(review.id, "genre", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="h-10 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-[#80FD8F]"
                          placeholder="장르"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <input
                          value={edited?.nationality ?? ""}
                          onChange={(e) =>
                            handleChange(
                              review.id,
                              "nationality",
                              e.target.value
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="h-10 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-[#80FD8F]"
                          placeholder="저자 국적"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={edited?.author_gender ?? ""}
                          onChange={(e) =>
                            handleChange(
                              review.id,
                              "author_gender",
                              e.target.value
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="h-10 w-full rounded-lg border border-zinc-700 bg-black px-3 text-sm text-white outline-none focus:border-[#80FD8F] [color-scheme:dark]"
                        >
                          <option value="">선택</option>
                          <option value="남자">남자</option>
                          <option value="여자">여자</option>
                        </select>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
