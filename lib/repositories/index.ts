// lib/repositories/index.ts
// Repository 패턴 통합 export

export * from './base.repository';
export * from './project.repository';

// 편의성 exports
export { BaseRepository } from './base.repository';
export { ProjectRepository, projectRepository } from './project.repository';