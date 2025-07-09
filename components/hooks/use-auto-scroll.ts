import { useState, useRef, useEffect, useCallback } from "react";

interface UseAutoScrollOptions {
  smooth?: boolean;
  content?: React.ReactNode;
}

export function useAutoScroll({ smooth = false, content }: UseAutoScrollOptions = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, [smooth]);

  const disableAutoScroll = useCallback(() => {
    setAutoScrollEnabled(false);
  }, []);

  const enableAutoScroll = useCallback(() => {
    setAutoScrollEnabled(true);
  }, []);

  const checkIsAtBottom = useCallback(() => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const threshold = 50; // 50px threshold
    const atBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    
    setIsAtBottom(atBottom);
    if (atBottom) {
      setAutoScrollEnabled(true);
    }
  }, []);

  // Auto-scroll when content changes
  useEffect(() => {
    if (autoScrollEnabled && isAtBottom) {
      scrollToBottom();
    }
  }, [content, autoScrollEnabled, isAtBottom, scrollToBottom]);

  // Monitor scroll position
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      checkIsAtBottom();
    };

    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  }, [checkIsAtBottom]);

  return {
    scrollRef,
    isAtBottom,
    autoScrollEnabled,
    scrollToBottom,
    disableAutoScroll,
    enableAutoScroll,
  };
}