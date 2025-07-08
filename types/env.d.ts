declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // 데이터베이스
      DATABASE_URL: string;
      DATABASE_URL_UNPOOLED: string;
      POSTGRES_PRISMA_URL: string;
      POSTGRES_URL: string;
      POSTGRES_URL_NON_POOLING: string;
      POSTGRES_URL_NO_SSL: string;
      
      // NextAuth
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      
      // OAuth
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      KAKAO_CLIENT_ID: string;
      KAKAO_CLIENT_SECRET: string;
      
      // OpenRouter (AI)
      OPENROUTER_API_KEY: string;
      
      // 선택적 환경변수
      NEXT_PUBLIC_APP_URL?: string;
      NEON_PROJECT_ID?: string;
      NEXT_PUBLIC_STACK_PROJECT_ID?: string;
      NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY?: string;
    }
  }
}

export {}