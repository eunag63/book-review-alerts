"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Publisher {
  id: number;
  name: string;
}

const initialForm = {
  title: "",
  publisher: "",
  author: "",
  deadline: "",
  display_date: "",
  url: "",
  genre: "",
  author_gender: "",
  nationality: "",
  category: "",
};

export default function CreateReviewPage() {
  const router = useRouter();
  const publisherRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState(initialForm);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [publisherSearch, setPublisherSearch] = useState("");
  const [isPublisherOpen, setIsPublisherOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publisherLoading, setPublisherLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const response = await fetch("/api/admin/publishers");

        if (!response.ok) {
          throw new Error("출판사 조회에 실패했습니다.");
        }

        const data = await response.json();

        setPublishers(data.publishers || []);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "출판사 조회에 실패했습니다."
        );
      }
    };

    fetchPublishers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        publisherRef.current &&
        !publisherRef.current.contains(event.target as Node)
      ) {
        setIsPublisherOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredPublishers = publishers.filter((publisher) =>
    publisher.name.toLowerCase().includes(publisherSearch.toLowerCase())
  );

  const trimmedPublisherSearch = publisherSearch.trim();

  const isExactMatch = publishers.some(
    (publisher) =>
      publisher.name.toLowerCase() === trimmedPublisherSearch.toLowerCase()
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePublisherChange = (value: string) => {
    setPublisherSearch(value);

    setForm((prev) => ({
      ...prev,
      publisher: value,
    }));

    setIsPublisherOpen(true);
  };

  const handlePublisherSelect = (publisher: Publisher) => {
    setForm((prev) => ({
      ...prev,
      publisher: publisher.name,
    }));

    setPublisherSearch(publisher.name);
    setIsPublisherOpen(false);
  };

  const handlePublisherCreate = async () => {
    const name = publisherSearch.trim();

    if (!name) {
      return;
    }

    try {
      setPublisherLoading(true);
      setError("");

      const response = await fetch("/api/admin/publishers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "출판사 등록에 실패했습니다.");
      }

      const newPublisher = data.publisher as Publisher;

      setPublishers((prev) => [...prev, newPublisher]);

      setForm((prev) => ({
        ...prev,
        publisher: newPublisher.name,
      }));

      setPublisherSearch(newPublisher.name);
      setIsPublisherOpen(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "출판사 등록에 실패했습니다."
      );
    } finally {
      setPublisherLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("책 제목을 입력해주세요.");
      return;
    }

    if (!form.author.trim()) {
      setError("저자를 입력해주세요.");
      return;
    }

    if (!form.publisher.trim()) {
      setError("출판사를 입력해주세요.");
      return;
    }

    if (!form.url.trim()) {
      setError("신청 링크를 입력해주세요.");
      return;
    }

    if (!form.deadline) {
      setError("모집 마감일을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "서평단 저장에 실패했습니다.");
      }

      setSuccess(true);
      setForm(initialForm);
      setPublisherSearch("");

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "서평단 저장에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        {success && (
          <div className="mb-6 rounded-lg border border-[#80FD8F]/30 bg-[#80FD8F]/10 px-4 py-3 text-sm font-medium text-[#80FD8F]">
            서평단이 저장되었습니다.
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold">서평단 저장</h2>
          <p className="mt-2 text-sm text-zinc-500">
            새로운 서평단 정보를 등록합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="mb-6 text-base font-semibold">서평단 정보</h3>

            <div className="space-y-5">
              <Field
                label="신청 링크"
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="모집 마감일"
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                  required
                />

                <Field
                  label="홈페이지 노출 시작일"
                  name="display_date"
                  type="date"
                  value={form.display_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="mb-6 text-base font-semibold">책 정보</h3>

            <div className="space-y-5">
              <Field
                label="책 제목"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="저자"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  required
                />

                <div ref={publisherRef} className="relative">
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    출판사
                    <span className="ml-1 text-[#80FD8F]">*</span>
                  </label>

                  <input
                    type="text"
                    value={publisherSearch}
                    onChange={(e) => handlePublisherChange(e.target.value)}
                    onFocus={() => setIsPublisherOpen(true)}
                    placeholder="출판사 검색"
                    required
                    className="h-11 w-full rounded-lg border border-zinc-800 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#80FD8F]"
                  />

                  {isPublisherOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl">
                      {filteredPublishers.length > 0 &&
                        filteredPublishers.map((publisher) => (
                          <button
                            key={publisher.id}
                            type="button"
                            onClick={() => handlePublisherSelect(publisher)}
                            className={`block w-full px-3 py-2.5 text-left text-sm transition hover:bg-zinc-900 ${
                              form.publisher === publisher.name
                                ? "bg-zinc-900 text-[#80FD8F]"
                                : "text-zinc-300"
                            }`}
                          >
                            {publisher.name}
                          </button>
                        ))}

                      {trimmedPublisherSearch && !isExactMatch && (
                        <button
                          type="button"
                          onClick={handlePublisherCreate}
                          disabled={publisherLoading}
                          className="block w-full border-t border-zinc-800 px-3 py-3 text-left text-sm font-medium text-[#80FD8F] transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {publisherLoading
                            ? "출판사 등록 중..."
                            : `+ ${trimmedPublisherSearch} 등록`}
                        </button>
                      )}

                      {!trimmedPublisherSearch &&
                        filteredPublishers.length === 0 && (
                          <div className="px-3 py-4 text-sm text-zinc-500">
                            출판사를 검색해주세요.
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="mb-6 text-base font-semibold">도서 분류</h3>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="카테고리"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  options={["문학", "비문학"]}
                />

                <Field
                  label="장르"
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                  placeholder="예: 소설, 에세이, 인문"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="저자 국적"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  placeholder="예: 한국, 미국, 일본"
                />

                <SelectField
                  label="저자 성별"
                  name="author_gender"
                  value={form.author_gender}
                  onChange={handleChange}
                  options={["남자", "여자"]}
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard/reviews")}
              className="h-11 rounded-lg border border-zinc-800 px-5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-lg bg-[#80FD8F] px-6 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="ml-1 text-[#80FD8F]">*</span>}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-lg border border-zinc-800 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#80FD8F] [color-scheme:dark]"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-lg border border-zinc-800 bg-black px-3 text-sm text-white outline-none transition focus:border-[#80FD8F]"
      >
        <option value="">선택</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
