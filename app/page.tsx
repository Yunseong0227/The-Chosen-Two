'use client';

import { useState } from 'react';

export default function Home() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const checkInvite = async () => {
    setMessage('확인 중...');
    
    try {
      // 바로 이 부분이 API를 호출하는(fetch) 핵심 코드입니다!
      const res = await fetch('/api/check-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ 입장 성공! 남은 횟수: ${data.remaining}`);
      } else {
        setMessage(`❌ 에러: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (err) {
      setMessage('❌ 서버 연결에 실패했습니다.');
    }
  };

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>THE CHOSEN TWO</h1>
      <input 
        type="text" 
        value={code} 
        onChange={(e) => setCode(e.target.value)} 
        placeholder="초대 코드를 입력하세요"
        style={{ padding: '0.5rem', color: 'black' }}
      />
      <button onClick={checkInvite} style={{ marginLeft: '0.5rem', padding: '0.5rem' }}>
        입장하기
      </button>
      <p style={{ marginTop: '1rem' }}>{message}</p>
    </main>
  );
}