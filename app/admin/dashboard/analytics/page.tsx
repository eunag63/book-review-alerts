import { createClient } from "@/lib/supabase/server";
import AnalyticsChart, { ChartRow } from "@/app/admin/AnalyticsChart";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("click_stats_24h")
    .select("*")
    .order("hour", { ascending: true });

  if (error) {
    return <div className="p-8 text-red-400">{error.message}</div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeRows =
    data?.filter((row) => {
      const deadline = new Date(row.deadline);
      deadline.setHours(0, 0, 0, 0);

      return deadline >= today;
    }) ?? [];

  const totalClicks = new Map<
    number,
    {
      title: string;
      total: number;
    }
  >();

  activeRows.forEach((row) => {
    const current = totalClicks.get(row.review_id);

    if (current) {
      current.total += Number(row.clicks);
    } else {
      totalClicks.set(row.review_id, {
        title: row.title,
        total: Number(row.clicks),
      });
    }
  });

  const topBooks = [...totalClicks.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const selectedIds = new Set(topBooks.map(([id]) => id));

  const books = topBooks.map(([id, value]) => ({
    id,
    title: value.title,
  }));

  const hourMap = new Map<string, Record<string, number>>();

  activeRows.forEach((row) => {
    if (!selectedIds.has(row.review_id)) {
      return;
    }

    const hour = new Date(row.hour).getHours();
    const label = `${hour}시`;

    if (!hourMap.has(label)) {
      hourMap.set(label, {});
    }

    hourMap.get(label)![String(row.review_id)] = Number(row.clicks);
  });

  const chartData: ChartRow[] = [...hourMap.entries()]
    .sort((a, b) => {
      return Number(a[0].replace("시", "")) - Number(b[0].replace("시", ""));
    })
    .map(([hour, values]) => {
      const row: ChartRow = {
        hour,
      };

      books.forEach((book) => {
        row[String(book.id)] = values[String(book.id)] ?? 0;
      });

      return row;
    });
  return (
    <div className="space-y-10 p-8">
      <h1 className="text-3xl font-bold text-white">통계</h1>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="mb-6 text-lg font-semibold text-white">
          최근 24시간 인기 TOP5
        </h2>

        <AnalyticsChart data={chartData} books={books} />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full">
          <thead className="bg-zinc-950">
            <tr className="border-b border-zinc-800">
              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                제목
              </th>

              <th className="w-40 px-6 py-4 text-right text-sm font-semibold text-zinc-400">
                최근 24시간 클릭
              </th>
            </tr>
          </thead>

          <tbody>
            {topBooks.map(([id, value]) => (
              <tr
                key={id}
                className="border-b border-zinc-900 hover:bg-zinc-900"
              >
                <td className="px-6 py-4 text-white">{value.title}</td>

                <td className="px-6 py-4 text-right text-zinc-300">
                  {value.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
