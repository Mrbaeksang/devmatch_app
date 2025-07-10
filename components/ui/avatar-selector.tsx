"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Shuffle } from "lucide-react";
import Image from "next/image";

import { 
  AVATAR_STYLES, 
  generateAvatarDataUrl, 
  generateAvatarPreviews,
  type AvatarConfig,
  type AvatarStyleId 
} from "@/lib/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AvatarSelectorProps {
  value: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
  seed?: string;
  className?: string;
}

export function AvatarSelector({ 
  value, 
  onChange, 
  seed = "default",
  className = ""
}: AvatarSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyleId>(value.style);
  const [previews, setPreviews] = useState<AvatarConfig[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 초기 프리뷰 생성
  useEffect(() => {
    const initialPreviews = generateAvatarPreviews(seed, 6);
    setPreviews(initialPreviews);
  }, [seed]);

  // 스타일 변경 시 새로운 프리뷰 생성
  useEffect(() => {
    if (selectedStyle) {
      const newConfig: AvatarConfig = {
        style: selectedStyle,
        seed: seed,
        options: {
          backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
          backgroundType: ['solid']
        }
      };
      onChange(newConfig);
    }
  }, [selectedStyle, seed]); // onChange 제거

  // 랜덤 프리뷰 재생성
  const generateNewPreviews = () => {
    setIsGenerating(true);
    const randomSeed = Math.random().toString(36).substring(7);
    const newPreviews = generateAvatarPreviews(randomSeed, 6);
    setPreviews(newPreviews);
    setTimeout(() => setIsGenerating(false), 300);
  };

  // 프리뷰 선택
  const handlePreviewSelect = (config: AvatarConfig) => {
    setSelectedStyle(config.style);
    onChange(config);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 현재 선택된 아바타 */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <motion.div
            key={`${value.style}-${value.seed}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-700 shadow-lg"
          >
            <Image
              src={generateAvatarDataUrl(value)}
              alt="Selected avatar"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <Badge 
            variant="secondary" 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs"
          >
            {AVATAR_STYLES.find(s => s.id === value.style)?.name}
          </Badge>
        </div>
      </div>

      {/* 스타일 선택 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">아바타 스타일</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateNewPreviews}
            disabled={isGenerating}
            className="h-8 px-3 text-xs"
          >
            <Shuffle className="h-3 w-3 mr-1" />
            새로고침
          </Button>
        </div>

        {/* 스타일 그리드 */}
        <div className="grid grid-cols-3 gap-2">
          {AVATAR_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setSelectedStyle(style.id)}
              className={`relative p-2 rounded-lg border transition-all text-left hover:bg-zinc-800/50 ${
                selectedStyle === style.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <div className="text-xs font-medium text-white truncate">
                {style.name}
              </div>
              <div className="text-xs text-zinc-400 truncate">
                {style.description}
              </div>
              {selectedStyle === style.id && (
                <div className="absolute top-1 right-1">
                  <Check className="h-3 w-3 text-blue-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 프리뷰 선택 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white">프리뷰에서 선택</h4>
        <AnimatePresence mode="wait">
          <motion.div
            key={isGenerating ? 'generating' : 'generated'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-6 gap-2"
          >
            {previews.map((config, index) => (
              <motion.button
                key={`${config.style}-${config.seed}-${index}`}
                type="button"
                onClick={() => handlePreviewSelect(config)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                  value.style === config.style && value.seed === config.seed
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <Image
                  src={generateAvatarDataUrl(config)}
                  alt={`Preview ${index + 1}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
                {value.style === config.style && value.seed === config.seed && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}