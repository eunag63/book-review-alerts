import { createClient } from "@/lib/supabase/server";
import AnalyticsChart from "@/app/admin/AnalyticsChart";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [
    { data: chartData, error: chartError },
    { data: tableData, error: tableError },
  ] = await Promise.all([
    supabase
      .from("click_stats_24h")
      .select("*")
      .order("hour", { ascending: true }),

    supabase
      .from("review_stats")
      .select("*")
      .order("click_count", { ascending: false }),
  ]);

  if (chartError) {
    return <div className="p-8 text-red-400">{chartError.message}</div>;
  }

  if (tableError) {
    return <div className="p-8 text-red-400">{tableError.message}</div>;
  }

  const graph =
    chartData?.map((item) => ({
      hour: `${new Date(item.hour).getHours()}시`,
      clicks: Number(item.clicks),
    })) ?? [];

  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold text-white">통계</h1>

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="mb-6 text-lg font-semibold text-white">
          최근 24시간 클릭 추이
        </h2>

        <AnalyticsChart data={graph} />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full">
          <thead className="bg-zinc-950">
            <tr className="border-b border-zinc-800">
              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                제목
              </th>

              <th className="w-40 px-6 py-4 text-right text-sm font-semibold text-zinc-400">
                클릭수
              </th>
            </tr>
          </thead>

          <tbody>
            {tableData?.map((review) => (
              <tr
                key={review.id}
                className="border-b border-zinc-900 hover:bg-zinc-900"
              >
                <td className="px-6 py-4 text-white">{review.title}</td>

                <td className="px-6 py-4 text-right text-zinc-300">
                  {review.click_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
