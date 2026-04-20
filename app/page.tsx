'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 1. 라우터 불러오기
import styles from './Home.module.css'; // CSS 모듈 불러오기

export default function Home() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // 2. 라우터 초기화   
  
  const checkInvite = async () => {
    if (!code.trim()) return alert('코드를 입력해주세요!');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/check-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✨ 인증 성공! 잠시 후 입장합니다...`);
        setTimeout(() => {
          router.push('/welcome'); 
        }, 1500);
      } else {
        setMessage(`🚫 ${data.error}`);
      }
    } catch (err) {
      setMessage('⚠️ 서버와 연결할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkInvite();
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>THE CHOSEN TWO</h1>
      
      <div className={styles.inputGroup}>
        <input 
          className={styles.input}
          type="text" 
          value={code} 
          onChange={(e) => setCode(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder="초대 코드를 입력하세요"
          disabled={isLoading}
        />
        <button 
          className={styles.button}
          onClick={checkInvite} 
          disabled={isLoading}
        >
          {isLoading ? '확인 중...' : 'ENTER'}
        </button>
      </div>
      
      <p className={`${styles.message} ${message.includes('✨') ? styles.success : styles.error}`}>
        {message}
      </p>
    </main>
  );
}