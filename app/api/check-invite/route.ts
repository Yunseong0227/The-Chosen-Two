import { NextResponse } from 'next/server';

// Next.js App Router의 표준 규격입니다.
export const runtime = 'nodejs'; // 런타임 명시

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("들어온 데이터:", data);

    return NextResponse.json({ 
      message: "API 연결 성공!", 
      remaining: 99 
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

// 404 방지용: GET 요청이 와도 응답하도록 추가
export async function GET() {
  return NextResponse.json({ message: "API 주소는 살아있습니다!" });
}