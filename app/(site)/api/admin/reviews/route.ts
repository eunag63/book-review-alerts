import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        "id, title, author, publisher, publisher_id, url, deadline, source, created_at"
      )
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
      create_publisher = false,
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

    const publisherName = publisher.trim();

    let publisherData = null;

    const { data: existingPublisher, error: publisherLookupError } =
      await supabase
        .from("publishers")
        .select("id, name")
        .ilike("name", publisherName)
        .maybeSingle();

    if (publisherLookupError) {
      console.error("출판사 조회 오류:", publisherLookupError);

      return NextResponse.json(
        { error: "출판사 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    if (existingPublisher) {
      publisherData = existingPublisher;
    } else {
      if (!create_publisher) {
        return NextResponse.json(
          {
            error:
              "등록되지 않은 출판사입니다. 새로운 출판사로 등록할지 확인해주세요.",
          },
          { status: 400 }
        );
      }

      const { data: newPublisher, error: publisherInsertError } = await supabase
        .from("publishers")
        .insert({
          name: publisherName,
        })
        .select("id, name")
        .single();

      if (publisherInsertError) {
        console.error("출판사 저장 오류:", publisherInsertError);

        if (publisherInsertError.code === "23505") {
          const { data: duplicatedPublisher } = await supabase
            .from("publishers")
            .select("id, name")
            .ilike("name", publisherName)
            .maybeSingle();

          if (duplicatedPublisher) {
            publisherData = duplicatedPublisher;
          } else {
            return NextResponse.json(
              { error: "출판사 저장에 실패했습니다." },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { error: "출판사 저장에 실패했습니다." },
            { status: 500 }
          );
        }
      } else {
        publisherData = newPublisher;
      }
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          title: title.trim(),
          publisher: publisherName,
          publisher_id: publisherData.id,
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
        publisher: publisherData,
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
