// app/page.tsx
import { supabase } from '../lib/supabaseClient';

interface Review {
  id: number;
  title: string;
  publisher: string;
  author: string;
  deadline: string;
  url: string;
}

export default async function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('deadline', today);

  if (error) {
    console.error('Supabase error 👉', error);
    return <p className="p-6 text-red-500">오류 발생: {error.message}</p>;
  }

  const reviews = data as Review[];

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📚 책 서평단 알림</h1>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          오늘 마감되는 서평단{' '}
          <span className="text-green-500">{reviews.length}개</span>
        </h2>

        {reviews.length > 0 ? (
          reviews.map((r) => (
            <article key={r.id} className="mb-4 p-4 border rounded-lg">
              <p className="font-medium">{r.title}</p>
              <p className="text-sm text-gray-600 mb-2">
                {r.publisher} | {r.author}
              </p>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-point underline text-sm"
              >
                자세히 보기
              </a>
            </article>
          ))
        ) : (
          <p className="text-gray-500">오늘 마감되는 서평단이 없습니다.</p>
        )}
      </section>
    </main>
  );
}
