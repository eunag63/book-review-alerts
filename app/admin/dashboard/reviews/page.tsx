import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ReviewTable from "@/app/admin/ReviewTable";

const PAGE_SIZE = 100;

interface Props {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ReviewPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const currentPage = Math.max(Number(page ?? "1"), 1);

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const {
    data: reviews,
    count,
    error,
  } = await supabase
    .from("reviews")
    .select(
      `
        id,
        title,
        author,
        publisher,
        deadline,
        category,
        genre,
        created_at
      `,
      {
        count: "exact",
      }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return <div className="p-8 text-red-400">{error.message}</div>;
  }

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const maxVisiblePages = 10;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));

  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold text-white">서평단</h1>

      <ReviewTable reviews={reviews ?? []} />

      <div className="mt-8 flex justify-center">
        <div className="flex gap-2">
          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((page) => (
            <Link
              key={page}
              href={`/admin/dashboard/reviews?page=${page}`}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
                page === currentPage
                  ? "bg-[#80FD8F] text-black"
                  : "border border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
