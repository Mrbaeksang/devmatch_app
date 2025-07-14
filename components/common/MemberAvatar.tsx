// components/common/MemberAvatar.tsx
// 멤버 아바타를 표시하는 공통 컴포넌트

import Image from "next/image";
import { generateAvatarDataUrl, deserializeAvatarConfig } from "@/lib/avatar";

interface MemberAvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
  borderColor?: string;
}

/**
 * 멤버 아바타 공통 컴포넌트
 * 아바타 이미지가 있으면 표시하고, 없으면 이름의 첫 글자를 표시
 * 
 * @param name - 멤버 이름
 * @param avatar - 아바타 데이터 (직렬화된 문자열)
 * @param size - 아바타 크기 (기본값: 'md')
 * @param className - 추가 클래스명
 * @param showBorder - 테두리 표시 여부
 * @param borderColor - 테두리 색상
 */
export function MemberAvatar({
  name,
  avatar,
  size = 'md',
  className = '',
  showBorder = false,
  borderColor = 'border-white'
}: MemberAvatarProps) {
  // 크기별 스타일 정의
  const sizeStyles = {
    sm: { container: 'w-8 h-8', text: 'text-sm', image: 32 },
    md: { container: 'w-10 h-10', text: 'text-base', image: 40 },
    lg: { container: 'w-12 h-12', text: 'text-lg', image: 48 },
    xl: { container: 'w-16 h-16', text: 'text-xl', image: 64 }
  };

  const { container, text, image: imageSize } = sizeStyles[size];
  const borderStyle = showBorder ? `ring-2 ${borderColor}` : '';

  // 아바타가 있는 경우
  if (avatar) {
    try {
      const avatarUrl = generateAvatarDataUrl(deserializeAvatarConfig(avatar));
      return (
        <Image 
          src={avatarUrl}
          alt={name}
          width={imageSize}
          height={imageSize}
          className={`rounded-full ${borderStyle} ${className}`}
        />
      );
    } catch (error) {
      console.error('아바타 생성 오류:', error);
      // 에러 발생 시 기본 아바타로 폴백
    }
  }

  // 기본 아바타 (이름 첫 글자)
  const initial = name[0]?.toUpperCase() || '?';
  const bgColor = getColorFromName(name);

  return (
    <div 
      className={`${container} ${bgColor} rounded-full flex items-center justify-center text-white font-medium ${borderStyle} ${className}`}
    >
      <span className={text}>{initial}</span>
    </div>
  );
}

/**
 * 이름을 기반으로 일관된 색상 생성
 * 같은 이름은 항상 같은 색상을 반환
 */
function getColorFromName(name: string): string {
  const colors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500'
  ];
  
  // 이름의 문자 코드 합을 계산하여 색상 인덱스 결정
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const colorIndex = charSum % colors.length;
  
  return colors[colorIndex];
}