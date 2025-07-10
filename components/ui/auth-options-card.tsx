"use client";

import React from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Kakao Icon SVG Component
const KakaoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 3C7.037 3 3 6.403 3 10.5c0 2.66 1.756 5.015 4.414 6.43l-.859 3.13c-.08.296.247.523.497.346l3.734-2.374c.733.1 1.48.151 2.214.151 4.963 0 9-3.403 9-7.5S16.963 3 12 3z" fill="currentColor"/>
  </svg>
);

export const AuthOptionsCard = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 w-full">
      {/* Google Sign-in Button */}
      <motion.button
        onClick={() => signIn("google", { callbackUrl: "/projects" })}
        className="flex items-center gap-2 rounded-full border border-zinc-800 px-7 py-3 text-base font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 bg-zinc-50 text-zinc-900 bg-opacity-80"
        style={{ minWidth: 140, minHeight: 56 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
      >
        <GoogleIcon />
        <span>Google</span>
      </motion.button>

      {/* Kakao Sign-in Button */}
      <motion.button
        onClick={() => signIn("kakao", { callbackUrl: "/projects" })}
        className="flex items-center gap-2 rounded-full border border-zinc-800 px-7 py-3 text-base font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-[#FEE500] text-zinc-900 bg-opacity-80"
        style={{ minWidth: 140, minHeight: 56 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
      >
        <KakaoIcon />
        <span>Kakao</span>
      </motion.button>
    </div>
  );
};