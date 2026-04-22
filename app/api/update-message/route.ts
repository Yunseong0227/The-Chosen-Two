export const runtime = 'edge';

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, message } = await request.json();

    if (!username) {
      return NextResponse.json({ error: '사용자 정보가 없습니다.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ invite_message: message })
      .eq('username', username);

    if (error) {
      return NextResponse.json({ error: 'DB 업데이트 실패' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}