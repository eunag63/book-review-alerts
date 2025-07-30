// app/page.tsx
import SearchReviews from './components/SearchReviews'
import { supabase } from '../lib/supabaseClient'
import type { Review } from '../lib/types'

export default async function HomePage() {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('reviews')           
    .select('*')
    .eq('deadline', today)

  if (error) {
    console.error(error)
    return <p className="p-6 text-red-500">
      데이터 로드 중 오류가 발생했습니다: {error.message}
    </p>
  }

  const reviews = (data as Review[]) || []

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          오늘 마감되는 서평단 <span className="text-point">{reviews.length}개</span>
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

      <SearchReviews />
    </main>
  )
}
