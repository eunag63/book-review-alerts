import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("publishers")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("출판사 데이터 조회 오류:", error);

      return NextResponse.json(
        { error: "출판사 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      publishers: data || [],
    });
  } catch (error) {
    console.error("API 오류:", error);

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
