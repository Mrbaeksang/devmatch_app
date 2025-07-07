// 1. lib/auth.ts 파일 수정 (가장 중요!)
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
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
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.sub as string; // 핵심 변경: token.id → token.sub
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id; // 핵심 변경: user.id를 token.sub에 저장
      }
      return token;
    },
     async redirect({ url, baseUrl }) {
      console.log("==============================================");
      console.log("Redirect 콜백 호출됨!");
      console.log("전달된 URL (url):", url);
      console.log("기본 URL (baseUrl):", baseUrl);
      console.log("==============================================");

      // NextAuth.js의 표준 리다이렉트 로직을 따릅니다.
      // 만약 url이 baseUrl로 시작한다면 그 url로 이동 (보안상 안전한 내부 리다이렉트)
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // 그 외의 경우 (외부 URL이거나, 특별한 callbackUrl이 없는 경우)
      // 무조건 기본 로그인 후 페이지인 /projects로 리다이렉트합니다.
      return baseUrl + '/projects'; // 명시적으로 경로를 붙여줍니다.
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