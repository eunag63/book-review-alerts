"use client";

const data = [
  {
    id: 1,
    title: "매스커레이드 라이프",
    author: "히가시노 게이고",
    publisher: "현대문학",
    deadline: "2026-07-12",
  },
  {
    id: 2,
    title: "감정의 혼란",
    author: "슈테판 츠바이크",
    publisher: "민음사",
    deadline: "2026-07-15",
  },
];

export default function ReviewsPage() {
  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">서평단</h1>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full table-fixed">
          <thead className="bg-zinc-950">
            <tr className="border-b border-zinc-800">
              <th className="w-2/4 px-6 py-4 text-left text-sm font-medium text-zinc-400">
                타이틀
              </th>

              <th className="w-1/6 px-6 py-4 text-left text-sm font-medium text-zinc-400">
                작가
              </th>

              <th className="w-1/6 px-6 py-4 text-left text-sm font-medium text-zinc-400">
                출판사
              </th>

              <th className="w-1/6 px-6 py-4 text-left text-sm font-medium text-zinc-400">
                데드라인
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((review) => (
              <tr
                key={review.id}
                className="cursor-pointer border-b border-zinc-900 transition hover:bg-zinc-900"
              >
                <td className="truncate px-6 py-4">{review.title}</td>

                <td className="px-6 py-4">{review.author}</td>

                <td className="px-6 py-4">{review.publisher}</td>

                <td className="px-6 py-4">{review.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
