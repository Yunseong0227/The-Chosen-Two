import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || code.trim() === "") {
      return NextResponse.json({ error: '코드를 입력해 주세요.' }, { status: 400 });
    }
    console.log("찾으려는 코드:", code); // 추가

    // 1. Supabase에서 코드를 찾을 때 'count' 컬럼도 같이 가져옵니다.
    const { data: invite, error } = await supabase
      .from('invites')
      .select('code, count') // 'remaining' 대신 'count' 사용
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
      .update({ count: invite.count - 1 }) // 'count'를 하나 줄임
      .eq('code', code)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: '데이터 업데이트 실패' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      remaining: updated.count // 화면에는 줄어든 count를 보여줌
    });

  } catch (err) {
    return NextResponse.json({ error: '서버 통신 오류' }, { status: 500 });
  }
}

// 기존 POST 함수 아래에 추가
export async function GET() {
  return NextResponse.json({ 
    message: "API 서버가 정상 작동 중입니다!",
    method: "GET 요청을 확인했습니다. 실제 코드는 POST로 보내주세요." 
  });
}