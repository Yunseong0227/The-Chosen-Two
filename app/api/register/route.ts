export const runtime = 'edge';

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { newUsername, inviterUsername } = await request.json();

    // 1. 필수 값 체크
    if (!newUsername || !inviterUsername) {
      return NextResponse.json({ error: '정보가 누락되었습니다.' }, { status: 400 });
    }

    // 2. 중복 아이디 체크
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', newUsername)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: '이미 존재하는 이름입니다.' }, { status: 400 });
    }

    // 3. 초대자 상태 확인 (남은 횟수가 있는지)
    const { data: inviter, error: inviterError } = await supabase
      .from('profiles')
      .select('invite_count')
      .eq('username', inviterUsername)
      .single();

    if (inviterError || !inviter || inviter.invite_count <= 0) {
      return NextResponse.json({ error: '사용할 수 없는 초대 링크입니다.' }, { status: 400 });
    }

    // 4. 새로운 유저 생성
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        username: newUsername,
        invited_by: inviterUsername,
        invite_count: 2 // 새로운 멤버에게도 2개의 초대권 부여
      });

    if (createError) {
      return NextResponse.json({ error: '가입 처리 중 오류 발생' }, { status: 500 });
    }

    // 5. 초대자의 초대 횟수 차감
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ invite_count: inviter.invite_count - 1 })
      .eq('username', inviterUsername);

    if (updateError) {
      // 주의: 실제 운영 환경에서는 가입된 유저를 롤백하거나 더 안전한 RPC(Stored Procedure)를 쓰는 것이 좋습니다.
      return NextResponse.json({ error: '초대 횟수 업데이트 실패' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: '서버 통신 오류' }, { status: 500 });
  }
}