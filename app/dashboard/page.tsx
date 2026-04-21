// app/dashboard/page.tsx

'use client'; // 클라이언트 컴포넌트라면 꼭 필요합니다.

import styles from './dashboard.module.css';

// 반드시 'export default'가 붙어 있어야 합니다!
export default function Dashboard() {
  return (
    <main className={styles.container}>
      <h1>MY DASHBOARD</h1>
      {/* 내용... */}
    </main>
  );
}