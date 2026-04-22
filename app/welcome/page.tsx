'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import styles from './welcome.module.css';

export default function WelcomePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 데이터 가져오기 로직 (useCallback으로 최적화)
  const fetchUserData = useCallback(async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', name)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserData(data);
        setNewMessage(data.invite_message || '');
      }
    } catch (error) {
      console.error("데이터 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 페이지 진입 시 단 한 번만 실행
useEffect(() => {
  let savedName = localStorage.getItem('current_user');
  
  if (!savedName) {
    alert("로그인 정보가 없습니다.");
    router.push('/');
    return;
  }

  // 🔥 [핵심] 이중, 삼중 인코딩된 이름을 순수 한글로 정화합니다.
  // 예: %25EC%259D%2580 -> %EC%9D%80 -> 은
  try {
    let decodedName = savedName;
    while (decodedName.includes('%')) {
      decodedName = decodeURIComponent(decodedName);
    }
    
    // 정화된 이름을 다시 세팅
    setUsername(decodedName);
    fetchUserData(decodedName);

    // [선택] 깨끗해진 이름을 다시 저장해서 다음번에 에러가 안 나게 합니다.
    localStorage.setItem('current_user', decodedName);
    
  } catch (e) {
    console.error("이름 디코딩 중 오류 발생:", e);
    // 에러 발생 시 원래 값이라도 시도
    setUsername(savedName);
    fetchUserData(savedName);
  }
}, [router, fetchUserData]);

  const inviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join/${username}` 
    : '';

  // [기능: 링크 복사, 공유, 메시지 저장 등 기존 로직 그대로 유지]
  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    alert('링크가 복사되었습니다!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'THE CHOSEN TWO', url: inviteUrl });
    } else {
      handleCopy();
    }
  };

  const saveMessage = async () => {
    setIsSaving(true);
    const response = await fetch('/api/update-message', {
      method: 'POST',
      body: JSON.stringify({ username, message: newMessage }),
    });
    
    if (response.ok) {
      alert('저장되었습니다.');
      setUserData({ ...userData, invite_message: newMessage });
    }
    setIsSaving(false);
  };

  if (loading) return <div className={styles.container}>데이터 로드 중...</div>;

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.badge}>MEMBER OF THE CHOSEN TWO</div>
        <h1 className={styles.title}>환영합니다, @{username}님</h1>
        
        <section className={styles.statsSection}>
          <p className={styles.statLabel}>당신에게 부여된 초대권</p>
          <div className={styles.inviteCount}>{userData?.invite_count}<span> / 2</span></div>
        </section>

        <section className={styles.shareSection}>
          <label className={styles.label}>나의 고유 초대 링크</label>
          <div className={styles.urlBox}>
            <code className={styles.urlText}>{inviteUrl}</code>
            <div className={styles.buttonGroup}>
              <button onClick={handleCopy} className={styles.iconButton}>복사</button>
              <button onClick={handleShare} className={styles.primaryButton}>공유하기</button>
            </div>
          </div>
        </section>

        <section className={styles.messageSection}>
          <label className={styles.label}>초대받는 사람이 보게 될 문구</label>
          <textarea 
            className={styles.textarea}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="친구에게 보여줄 메시지를 입력하세요..."
          />
          <button 
            onClick={saveMessage} 
            className={styles.saveButton}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '메시지 저장하기'}
          </button>
        </section>

        <div className={styles.previewBox}>
          <p className={styles.previewLabel}>미리보기</p>
          <div className={styles.bubble}>"{newMessage || '당신을 초대합니다.'}"</div>
        </div>
      </div>
    </main>
  );
}