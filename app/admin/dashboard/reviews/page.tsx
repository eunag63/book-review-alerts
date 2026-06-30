import { createClient } from "@/lib/supabase/server";
import ReviewTable from "@/app/admin/ReviewTable";

export default async function ReviewPage() {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
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
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return <div className="p-8 text-red-400">{error.message}</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">서평단</h1>
      </div>

      <ReviewTable reviews={reviews ?? []} />
    </div>
  );
}
