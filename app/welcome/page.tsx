'use client';

import styles from './welcome.module.css';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>WELCOME TO THE CHOSEN TWO</h1>
      <p className={styles.description}>
        당신은 선택받은 소수 중 한 명입니다. <br />
        이제 특별한 커뮤니티의 일원이 되었습니다.
      </p>
      
      <div className={styles.contentCard}>
        <h3>당신을 위한 독점 혜택</h3>
        <ul>
          <li>전용 가이드북 다운로드</li>
          <li>비공개 커뮤니티 입장권</li>
          <li>1:1 매칭 시스템 우선권</li>
        </ul>
      </div>

      <Link href="/" className={styles.backButton}>
        처음으로 돌아가기
      </Link>
    </main>
  );
}