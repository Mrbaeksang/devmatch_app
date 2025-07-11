// types/next-auth.d.ts

import type { Session, User } from 'next-auth'

// 이 파일의 목적은 단 하나, 
// Next-Auth의 기본 Session 타입에 'id'를 추가하는 것입니다.
declare module 'next-auth' {
  interface Session {
    user: User & {
      id: string
      isCompleted: boolean
      avatar?: string
      nickname?: string
    }
  }
}