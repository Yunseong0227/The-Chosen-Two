export const runtime = 'edge'; // 속도 개선

import { supabase } from '@/lib/supabase'; // 공용 클라이언트로 교체
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || code.trim() === "") {
      return NextResponse.json({ error: '코드를 입력해 주세요.' }, { status: 400 });
    }
    
    // DB 연결 확인 (방어 로직)
    if (!supabase) {
      return NextResponse.json({ error: 'DB 연결 설정이 누락되었습니다.' }, { status: 500 });
    }

    console.log("찾으려는 코드:", code);

    // 1. Supabase에서 코드를 찾을 때 'count' 컬럼도 같이 가져옵니다.
    const { data: invite, error } = await supabase
      .from('invites')
      .select('code, count') 
      .eq('code', code)
      .single();

    if (error || !invite) {
      return NextResponse.json({ error: '존재하지 않는 코드입니다.' }, { status: 404 });
    }

    // 2. 남은 횟수(count) 확인
    if (invite.count <= 0) {
      return NextResponse.json({ error: '사용 횟수가 초과된 코드입니다.' }, { status: 400 });
    }

    // 3. 횟수(count) 1 차감 업데이트
    const { data: updated, error: updateError } = await supabase
      .from('invites')
      .update({ count: invite.count - 1 })
      .eq('code', code)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: '데이터 업데이트 실패' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      remaining: updated.count 
    });

  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: '서버 통신 오류' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "API 서버가 정상 작동 중입니다!",
    method: "GET 요청을 확인했습니다. 실제 코드는 POST로 보내주세요." 
  });
}