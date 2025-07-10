// 1. lib/auth.ts 파일 수정 (가장 중요!)
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database", // JWT → database로 변경
  },
  pages: {
    signIn: "/", // 홈페이지로 변경
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // database strategy에서는 user 객체를 직접 사용
      if (user && session.user) {
        session.user.id = user.id;
        session.user.name = user.name;
        session.user.email = user.email;
        session.user.image = user.image;
        // 프로필 완성 여부 추가
        session.user.isCompleted = (user as {isCompleted?: boolean}).isCompleted || false;
        // 아바타 추가
        session.user.avatar = (user as {avatar?: string}).avatar || undefined;
      }
      return session;
    },
    async signIn() {
      // 로그인 허용
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("==============================================");
      console.log("Redirect 콜백 호출됨!");
      console.log("전달된 URL (url):", url);
      console.log("기본 URL (baseUrl):", baseUrl);
      console.log("==============================================");

      // 특정 페이지로의 리다이렉트인 경우 그대로 허용
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // 로그인 후 기본 리다이렉트는 중간 페이지로
      return baseUrl + '/auth/redirect';
    },
  },
  // 쿠키 설정 추가 (중요!)
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};