import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = Number(id);

    if (!Number.isInteger(reviewId)) {
      return NextResponse.json(
        { error: "잘못된 서평단 ID입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      title,
      author,
      publisher,
      deadline,
      url,
      category,
      genre,
      nationality,
      author_gender,
    } = body;

    if (
      !title?.trim() ||
      !author?.trim() ||
      !publisher?.trim() ||
      !url?.trim() ||
      !deadline
    ) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .update({
        title: title.trim(),
        author: author.trim(),
        publisher: publisher.trim(),
        deadline,
        url: url.trim(),
        category: category || null,
        genre: genre?.trim() || null,
        nationality: nationality?.trim() || null,
        author_gender: author_gender || null,
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (error) {
      console.error("서평단 수정 오류:", error);

      return NextResponse.json(
        { error: "서평단 수정에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "서평단 정보가 수정되었습니다.",
      review: data,
    });
  } catch (error) {
    console.error("API 오류:", error);

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
