'use client';
import { useState } from 'react';

export default function Home() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');

  const checkTicket = async () => {
    setStatus('확인 중...');
    const res = await fetch('/api/check-invite', {
      method: 'POST',
      body: JSON.stringify({ inviteCode: code }),
    });
    
    const result = await res.json();
    
    if (result.allowed) {
      alert("🎟 입장 성공! THE CHOSEN TWO에 오신 것을 환영합니다.");
      setStatus('입장 성공');
    } else {
      setStatus(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-yellow-500 flex flex-col items-center justify-center p-4">
      <div className="border-2 border-yellow-500 p-12 text-center rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.3)]">
        <h1 className="text-5xl font-black mb-8 tracking-tighter">THE CHOSEN TWO</h1>
        <p className="mb-8 text-yellow-200/60 uppercase tracking-widest text-sm">Limited to two per ticket</p>
        
        <input 
          className="bg-zinc-900 border border-yellow-500/50 p-4 text-center text-xl w-full focus:outline-none focus:border-yellow-500"
          value={code} 
          onChange={(e) => setCode(e.target.value.toUpperCase())} 
          placeholder="ENTER YOUR CODE" 
        />
        
        <button 
          className="mt-6 w-full bg-yellow-500 text-black py-4 font-bold text-lg hover:bg-yellow-400 transition-colors"
          onClick={checkTicket}
        >
          티켓 확인하기
        </button>
        
        {status && <p className="mt-6 text-sm font-medium">{status}</p>}
      </div>
    </div>
  );
}