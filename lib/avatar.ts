import { createAvatar } from '@dicebear/core';
import { 
  adventurer,
  avataaars,
  bigEars,
  micah,
  pixelArt,
  thumbs
} from '@dicebear/collection';

// 개발자 친화적 6가지 아바타 스타일 정의
export const AVATAR_STYLES = [
  {
    id: 'avataaars',
    name: '아바타스',
    style: avataaars,
    description: '픽사 스타일 (기본 추천)',
    category: 'classic'
  },
  {
    id: 'pixelArt',
    name: '픽셀 아트',
    style: pixelArt,
    description: '픽셀 아트 (개발자 감성)',
    category: 'retro'
  },
  {
    id: 'adventurer',
    name: '어드벤처',
    style: adventurer,
    description: '일러스트 스타일 (모던)',
    category: 'modern'
  },
  {
    id: 'bigEars',
    name: '빅 이어스',
    style: bigEars,
    description: '귀여운 스타일 (친근함)',
    category: 'friendly'
  },
  {
    id: 'thumbs',
    name: '썸스',
    style: thumbs,
    description: '심플한 스타일 (미니멀)',
    category: 'minimal'
  },
  {
    id: 'micah',
    name: '미카',
    style: micah,
    description: '3D 스타일 (입체감)',
    category: 'premium'
  }
] as const;

// 아바타 스타일 타입
export type AvatarStyleId = typeof AVATAR_STYLES[number]['id'];

// 아바타 설정 인터페이스
export interface AvatarConfig {
  style: AvatarStyleId;
  seed: string;
  options?: Record<string, unknown>;
}

// 아바타 SVG 생성
export function generateAvatarSvg(config: AvatarConfig): string {
  const styleInfo = AVATAR_STYLES.find(s => s.id === config.style);
  
  if (!styleInfo) {
    throw new Error(`Unknown avatar style: ${config.style}`);
  }

  const avatar = createAvatar(styleInfo.style as never, {
    seed: config.seed,
    ...config.options
  });

  return avatar.toString();
}

// 아바타 데이터 URL 생성 (img src용)
export function generateAvatarDataUrl(config: AvatarConfig): string {
  const svg = generateAvatarSvg(config);
  
  // URL 인코딩 방식 사용 (base64보다 안전)
  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml,${encodedSvg}`;
}

// 닉네임 기반 기본 아바타 생성
export function generateDefaultAvatar(nickname: string, styleId: AvatarStyleId = 'avataaars'): AvatarConfig {
  return {
    style: styleId,
    seed: nickname || 'default',
    options: {
      // 기본 옵션들
      backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
      backgroundType: ['solid', 'gradientLinear']
    }
  };
}

// 아바타 프리뷰 생성 (선택 UI용)
export function generateAvatarPreviews(seed: string, count: number = 6): AvatarConfig[] {
  const previewStyles: AvatarStyleId[] = ['avataaars', 'pixelArt', 'adventurer', 'bigEars', 'thumbs', 'micah'];
  
  return previewStyles.slice(0, count).map(style => ({
    style,
    seed: seed || 'preview',
    options: {
      backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
      backgroundType: ['solid']
    }
  }));
}

// 데이터베이스 저장용 아바타 설정 직렬화
export function serializeAvatarConfig(config: AvatarConfig): string {
  return JSON.stringify(config);
}

// 데이터베이스에서 아바타 설정 복원
export function deserializeAvatarConfig(data: string): AvatarConfig {
  try {
    const parsed = JSON.parse(data);
    if (!parsed.style || !parsed.seed) {
      throw new Error('Invalid avatar config');
    }
    return parsed;
  } catch {
    // 기본값 반환
    return generateDefaultAvatar('default');
  }
}