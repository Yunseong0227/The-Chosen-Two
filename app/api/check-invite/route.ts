import { createClient } from '@supabase/supabase-js';

// 환경변수에서 정보를 가져와 Supabase와 연결합니다.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { inviteCode } = await req.json();
  console.log("뭐라노");
  // 1. 데이터베이스에서 코드가 일치하는 행을 찾습니다.
  const { data, error } = await supabase
    .from('invites')
    .select('count')
    .eq('code', inviteCode)
    .single();

  if (!data || error) {
    return Response.json({ message: "유효하지 않은 티켓입니다." }, { status: 404 });
  }

  // 2. 이미 2명이 사용했는지 확인합니다.
  if (data.count >= 2) {
    return Response.json({ allowed: false, message: "이미 마감된 티켓입니다." });
  }

  // 3. 사용 가능한 티켓이라면 카운트를 1 올립니다.
  await supabase
    .from('invites')
    .update({ count: data.count + 1 })
    .eq('code', inviteCode);

  return Response.json({ allowed: true });
}