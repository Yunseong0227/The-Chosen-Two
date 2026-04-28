'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './join.module.css';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();

  // 1. 상태 관리
  const [decodedInviterName, setDecodedInviterName] = useState(''); // 깨끗한 한글 이름
  const [myUsername, setMyUsername] = useState('');
  const [inviteData, setInviteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('LANDING');

  // 2. 초대자 정보 불러오기 (한글 인코딩 해결 버전)
  useEffect(() => {
    async function fetchInviter() {
      try {
        let rawName = params.username as string;
        if (!rawName) return;

        // [체크 1] 이중 인코딩 해결: % 기호가 없을 때까지 벗겨냅니다.
        let cleanName = rawName;
        try {
          while (cleanName.includes('%')) {
            cleanName = decodeURIComponent(cleanName);
          }
        } catch (e) {
          console.error("이름 디코딩 실패:", e);
        }

        setDecodedInviterName(cleanName);

        // [체크 2] .single() 대신 .maybeSingle()을 사용하여 데이터가 없을 때 406 에러 방지
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', cleanName)
          .maybeSingle();

        if (error) throw error;
        setInviteData(data);
      } catch (err) {
        console.error("초대자 조회 중 오류:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInviter();
  }, [params.username]);

  // 2. 🔥 [핵심] useEffect는 항상 최상단에! 
  // LOADING 단계가 되면 자동으로 2초 후 INVITE로 전환
  useEffect(() => {
    if (step === 'LOADING') {
      const timer = setTimeout(() => setStep('INVITE'), 2000);
      return () => clearTimeout(timer); // 메모리 누수 방지
    }
  }, [step]);
  
  // 3. 가입 처리 함수
  const handleRegister = async () => {
    if (!myUsername.trim()) return alert('사용할 이름을 입력해주세요.');
    if (!inviteData) return alert('유효하지 않은 초대장입니다.');
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUsername: myUsername,
          inviterUsername: decodedInviterName // 깨끗한 한글 이름을 서버로 보냄
        })
      });

      const result = await response.json();

      if (result.success) {
        // [체크 3] 나중에 꺼낼 때를 대비해 원본 한글 이름을 저장
        localStorage.setItem('current_user', myUsername);
        alert('축하합니다! 선택받으셨습니다.');
        router.push('/welcome');
      } else {
        alert(result.error || '가입에 실패했습니다.');
      }
    } catch (err) {
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // 1. 첫 화면 (Landing)
  if (step === 'LANDING') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>당신은 선택받으셨습니까?</h1>
        <button className={styles.enterButton} onClick={() => setStep('LOADING')}>
          비밀의 문 열기
        </button>
      </div>
    );
  }
  // 2. 로딩 화면 (Loading)
  if (step === 'LOADING') {
    return <div className={styles.loading}>초대장을 스캔 중입니다...</div>;
  }

  if (isLoading) return <div className={styles.container}>초대장 확인 중...</div>;

  if (!inviteData) {
    return <div className={styles.container}><div className={styles.card}><h1>존재하지 않는 초대장입니다.</h1></div></div>;
  }
 
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        {/* 깨끗하게 디코딩된 이름을 보여줍니다 */}
        <h1 className={styles.inviterName}>@{decodedInviterName}님의 초대</h1>
        <p className={styles.messageText}>"{inviteData?.invite_message || '당신을 초대합니다.'}"</p>
        
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
          남은 자리: {inviteData?.invite_count ?? 0} / 2
        </div>

        <button 
          className={styles.joinButton} 
          onClick={handleRegister}
          disabled={isSubmitting || (inviteData?.invite_count <= 0)}
        >
          {isSubmitting ? '처리 중...' : 'THE CHOSEN TWO 입장하기'}
        </button>
      </div>
    </main>
  );
}
