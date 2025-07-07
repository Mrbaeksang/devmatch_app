'use client';

import { useSession } from 'next-auth/react';

export default function SessionDebug() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>로딩 중...</div>;
  
  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold">세션 디버그</h3>
      <p>상태: {status}</p>
      <p>사용자 ID: {session?.user?.id || '없음'}</p>
      <p>이메일: {session?.user?.email || '없음'}</p>
      <pre className="text-xs bg-gray-100 p-2 mt-2 rounded">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}