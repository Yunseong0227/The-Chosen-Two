'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './welcome.module.css';

export default function WelcomePage() {
  const [userData, setUserData] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 로컬 스토리지나 세션에서 현재 가입한 유저 이름을 가져온다고 가정합니다.
  // (실제로는 Auth 세션을 사용하거나 가입 성공 시 state로 넘겨받아야 합니다.)
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('current_user'); // 가입 시 저장했다고 가정
    if (savedName) setUsername(savedName);
  }, []);

  useEffect(() => {
    if (!username) return;

    async function fetchUserData() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (data) {
        setUserData(data);
        setNewMessage(data.invite_message || '');
      }
      setLoading(false);
    }
    fetchUserData();
  }, [username]);

  const inviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join/${username}` 
    : '';

  // 1. 링크 복사 기능
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      alert('초대 링크가 클립보드에 복사되었습니다!');
    } catch (err) {
      alert('복사에 실패했습니다.');
    }
  };

  // 2. 시스템 공유 기능 (인스타, 카톡 등)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'THE CHOSEN TWO',
          text: '당신을 비밀스러운 공간으로 초대합니다.',
          url: inviteUrl,
        });
      } catch (err) {
        console.log('공유 취소 또는 실패');
      }
    } else {
      handleCopy(); // 지원하지 않는 브라우저일 경우 복사로 대체
    }
  };

  // 3. 메시지 저장 기능
  const saveMessage = async () => {
    setIsSaving(true);
    const response = await fetch('/api/update-message', {
      method: 'POST',
      body: JSON.stringify({ username, message: newMessage }),
    });
    
    if (response.ok) {
      alert('초대 메시지가 저장되었습니다.');
      setUserData({ ...userData, invite_message: newMessage });
    } else {
      alert('저장 중 오류가 발생했습니다.');
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