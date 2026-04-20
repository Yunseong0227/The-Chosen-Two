'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './join.module.css';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const inviterName = params.username; // URL에서 [username] 부분을 가져옵니다.

  // 나중에 Supabase에서 진짜로 가져올 가상의 데이터 상태
  const [inviteData, setInviteData] = useState({
    message: '',
    remaining: 0,
    isValid: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  // 페이지 접속 시 (가상) DB에서 정보 불러오기
  useEffect(() => {
    // 실제로는 여기서 fetch('/api/get-invite-info') 처럼 서버에 요청합니다.
    setTimeout(() => {
      setInviteData({
        message: '야, 이거 진짜 아무나 안 주는 코드인데 너 생각나서 보낸다. 딱 두 명만 들어올 수 있으니까 빨리 가입해!',
        remaining: 1, // 1자리 남았다고 가정! (긴장감 유발)
        isValid: true,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleJoin = () => {
    setIsJoining(true);
    // 여기서 가입 처리(DB 업데이트)를 진행합니다.
    setTimeout(() => {
      alert('환영합니다! 선택받으셨습니다.');
      router.push('/welcome'); // 가입 성공 후 웰컴 페이지로 이동
    }, 1500);
  };

  if (isLoading) {
    return <main className={styles.container}><div className={styles.loader}>초대장 확인 중...</div></main>;
  }

  if (!inviteData.isValid || inviteData.remaining === 0) {
    return (
      <main className={styles.container}>
        <h1 className={styles.errorTitle}>ACCESS DENIED</h1>
        <p className={styles.errorText}>이 초대장은 만료되었거나 유효하지 않습니다.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>INVITATION FROM</span>
          <h1 className={styles.inviterName}>@{inviterName}</h1>
        </div>

        <div className={styles.messageBox}>
          <p className={styles.messageText}>"{inviteData.message}"</p>
        </div>

        <div className={styles.statusBox}>
          <div className={styles.pulse}></div>
          <p>현재 남은 자리: <span className={styles.highlight}>{inviteData.remaining}</span> / 2</p>
        </div>

        <button 
          className={styles.joinButton} 
          onClick={handleJoin}
          disabled={isJoining}
        >
          {isJoining ? '입장 절차 진행 중...' : '초대 수락 및 입장하기'}
        </button>
      </div>
    </main>
  );
}