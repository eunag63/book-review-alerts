import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

// 참가자 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // 참가자 정보 조회
    const { data: participant, error } = await supabase
      .from('review_participants')
      .select(`
        *,
        reviews (
          title, author, publisher, deadline
        )
      `)
      .eq('token', token)
      .single();

    if (error || !participant) {
      return NextResponse.json(
        { error: '참가자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      participant: {
        ...participant,
        review_info: participant.reviews
      }
    });

  } catch (error) {
    console.error('참가자 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 참가자 정보 저장/업데이트
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { email, gender, age, address, phone } = await request.json();

    // 필수 필드 검증
    if (!email || !gender || !age || !address || !phone) {
      return NextResponse.json(
        { error: '모든 필수 정보를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 기존 참가자 확인
    const { data: existingParticipant } = await supabase
      .from('review_participants')
      .select('id')
      .eq('token', token)
      .single();

    let participantData;

    if (existingParticipant) {
      // 기존 참가자 정보 업데이트
      const { data, error } = await supabase
        .from('review_participants')
        .update({
          email,
          gender,
          age,
          address,
          phone,
          updated_at: new Date().toISOString()
        })
        .eq('token', token)
        .select(`
          *,
          reviews (
            title, author, publisher, deadline
          )
        `)
        .single();

      if (error) throw error;
      participantData = data;
    } else {
      // 새 참가자 정보 저장 (review_id는 별도로 설정 필요)
      const { data, error } = await supabase
        .from('review_participants')
        .insert({
          token,
          email,
          gender,
          age,
          address,
          phone,
          progress_status: 'registered',
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          reviews (
            title, author, publisher, deadline
          )
        `)
        .single();

      if (error) throw error;
      participantData = data;
    }

    return NextResponse.json({
      participant: {
        ...participantData,
        review_info: participantData.reviews
      }
    });

  } catch (error) {
    console.error('참가자 정보 저장 오류:', error);
    return NextResponse.json(
      { error: '정보 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}