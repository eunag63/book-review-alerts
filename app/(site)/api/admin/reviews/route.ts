import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, title, author, publisher, url, deadline, source, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("리뷰 데이터 조회 오류:", error);
      return NextResponse.json(
        { error: "데이터 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reviews: data || [],
    });
  } catch (error) {
    console.error("API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      publisher,
      author,
      deadline,
      url,
      genre,
      author_gender,
      nationality,
      category,
      display_date,
    } = body;

    if (!title?.trim() || !publisher?.trim() || !author?.trim()) {
      return NextResponse.json(
        { error: "책 제목, 저자, 출판사는 필수입니다." },
        { status: 400 }
      );
    }

    if (!url?.trim() || !deadline) {
      return NextResponse.json(
        { error: "신청 링크와 모집 마감일은 필수입니다." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          title: title.trim(),
          publisher: publisher.trim(),
          author: author.trim(),
          deadline,
          url: url.trim(),
          genre: genre?.trim() || null,
          author_gender: author_gender || null,
          nationality: nationality?.trim() || null,
          category: category || null,
          display_date: display_date || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("서평단 저장 오류:", error);

      return NextResponse.json(
        { error: "서평단 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "서평단이 저장되었습니다.",
        review: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API 오류:", error);

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
