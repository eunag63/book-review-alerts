"use client";

interface ReviewStats {
  id: number;
  title: string;
  click_count: number;
  today: number;
  last_hour: number;
}

interface Props {
  reviews: ReviewStats[];
}

export default function AnalyticsTable({ reviews }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="min-w-[900px]">
        <thead className="bg-zinc-950">
          <tr className="border-b border-zinc-800">
            <th className="px-6 py-4 text-left text-sm text-zinc-400">제목</th>

            <th className="w-40 px-6 py-4 text-right text-sm text-zinc-400">
              총 클릭
            </th>

            <th className="w-40 px-6 py-4 text-right text-sm text-zinc-400">
              24시간
            </th>

            <th className="w-40 px-6 py-4 text-right text-sm text-zinc-400">
              최근 1시간
            </th>
          </tr>
        </thead>

        <tbody>
          {reviews.map((review) => (
            <tr
              key={review.id}
              className="border-b border-zinc-900 hover:bg-zinc-900"
            >
              <td className="px-6 py-4 font-medium">{review.title}</td>

              <td className="px-6 py-4 text-right">{review.click_count}</td>

              <td className="px-6 py-4 text-right">{review.today}</td>

              <td className="px-6 py-4 text-right">{review.last_hour}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
