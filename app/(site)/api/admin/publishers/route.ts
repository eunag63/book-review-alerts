import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";

    let query = supabase
      .from("publishers")
      .select("id, name")
      .order("name", { ascending: true });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("출판사 조회 오류:", error);

      return NextResponse.json(
        { error: "출판사 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      publishers: data ?? [],
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
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "출판사명을 입력해주세요." },
        { status: 400 }
      );
    }

    const { data: existingPublisher, error: existingError } = await supabase
      .from("publishers")
      .select("id, name")
      .eq("name", name)
      .maybeSingle();

    if (existingError) {
      console.error("기존 출판사 조회 오류:", existingError);

      return NextResponse.json(
        { error: "출판사 확인에 실패했습니다." },
        { status: 500 }
      );
    }

    if (existingPublisher) {
      return NextResponse.json({
        publisher: existingPublisher,
        existing: true,
      });
    }

    const { data, error } = await supabase
      .from("publishers")
      .insert({
        name,
      })
      .select("id, name")
      .single();

    if (error) {
      console.error("출판사 저장 오류:", error);

      return NextResponse.json(
        { error: "출판사 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        publisher: data,
        existing: false,
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
