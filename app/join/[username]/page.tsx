'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './join.module.css';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const inviterUsername = params.username as string;

  const [myUsername, setMyUsername] = useState('');
  const [inviteData, setInviteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchInviter() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', inviterUsername)
        .single();
      
      setInviteData(data);
      setIsLoading(false);
    }
    fetchInviter();
  }, [inviterUsername]);

  const handleRegister = async () => {
    if (!myUsername.trim()) return alert('사용할 이름을 입력해주세요.');
    
    setIsSubmitting(true);
    const response = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        newUsername: myUsername,
        inviterUsername: inviterUsername
      })
    });

    const result = await response.json();

    if (result.success) {
      alert('축하합니다! 선택받으셨습니다.');
      router.push('/welcome'); // 본인의 초대 링크를 확인할 수 있는 페이지로 이동
    } else {
      alert(result.error || '가입에 실패했습니다.');
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className={styles.container}>초대장 확인 중...</div>;

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.inviterName}>@{inviterUsername}님의 초대</h1>
        <p className={styles.messageText}>"{inviteData?.invite_message}"</p>
        
        <div className={styles.inputGroup}>
          <input 
            type="text" 
            placeholder="사용할 이름을 입력하세요"
            className={styles.input}
            value={myUsername}
            onChange={(e) => setMyUsername(e.target.value)}
          />
        </div>

        <div className={styles.statusBox}>
          남은 자리: {inviteData?.invite_count} / 2
        </div>

        <button 
          className={styles.joinButton} 
          onClick={handleRegister}
          disabled={isSubmitting || inviteData?.invite_count <= 0}
        >
          {isSubmitting ? '처리 중...' : 'THE CHOSEN TWO 입장하기'}
        </button>
      </div>
    </main>
  );
}