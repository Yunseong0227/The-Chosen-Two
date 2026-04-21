'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // 설정한 supabase 불러오기
import styles from './join.module.css';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username;

  const [inviteData, setInviteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInviter() {
      // 1. DB에서 해당 username을 가진 유저 정보 가져오기
      const { data, error } = await supabase
        .from('profiles')
        .select('username, invite_count, invite_message, is_active')
        .eq('username', username)
        .single();

      if (error || !data) {
        setInviteData({ isValid: false });
      } else {
        setInviteData({
          message: data.invite_message,
          remaining: data.invite_count,
          isActive: data.is_active,
          isValid: true,
        });
      }
      setIsLoading(false);
    }

    if (username) fetchInviter();
  }, [username]);

  const handleJoin = async () => {
    // 가입 로직 (추후 구현: 여기서는 성공 가정)
    alert('환영합니다!');
    router.push('/welcome');
  };

  if (isLoading) return <main className={styles.container}><div className={styles.loader}>초대장 확인 중...</div></main>;

  if (!inviteData?.isValid || !inviteData?.isActive || inviteData?.remaining === 0) {
    return (
      <main className={styles.container}>
        <h1 className={styles.errorTitle}>ACCESS DENIED</h1>
        <p className={styles.errorText}>이 초대장은 더 이상 유효하지 않거나 존재하지 않습니다.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>INVITATION FROM</span>
          <h1 className={styles.inviterName}>@{username}</h1>
        </div>

        <div className={styles.messageBox}>
          <p className={styles.messageText}>"{inviteData.message}"</p>
        </div>

        <div className={styles.statusBox}>
          <div className={styles.pulse}></div>
          <p>현재 남은 자리: <span className={styles.highlight}>{inviteData.remaining}</span> / 2</p>
        </div>

        <button className={styles.joinButton} onClick={handleJoin}>
          초대 수락 및 입장하기
        </button>
      </div>
    </main>
  );
}