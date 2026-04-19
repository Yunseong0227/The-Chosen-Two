import { NextResponse } from 'next/server';

// 반드시 'POST' 대문자여야 합니다!
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    console.log("받은 코드:", code);

    // 우선 테스트를 위해 무조건 성공을 반환해봅시다.
    return NextResponse.json({ 
      success: true, 
      remaining: 1 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}