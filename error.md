# 📋 **DevMatch 최종 재설계 계획서 (사장 의견 반영)**

## 🎯 **핵심 설계 원칙**
1. **단계별 명확성**: 각 단계마다 명확한 목표와 결과물
2. **데이터 일관성**: 모든 페이지에서 동일한 데이터 구조 사용
3. **진행률 추적**: 사용자가 현재 위치를 항상 알 수 있음
4. **AI 역할 명확화**: 언제, 어떤 정보를 수집하고 분석할지 체계화
5. **유연한 플로우**: 팀원 모집 완료 전에도 개별 면담 가능

---

## 📊 **전체 플로우 재설계 (수정됨)**

### **🔄 Phase 1: 프로젝트 초기 설계 (대표자)**
```
/projects/new → AI 상담 → 역할 제안 승인 → 프로젝트 생성 → 초대링크 공유
```

### **🔄 Phase 2: 팀원 모집 & 개별 면담 (병렬 진행)**
```
/projects/join/[inviteCode] → 팀원 입장 → 개별 면담 → 대기실 복귀
```

### **🔄 Phase 3: AI 종합 분석**
```
/projects/[projectId]/analysis → AI 역할 배분 → 최종 팀 구성
```

### **🔄 Phase 4: 프로젝트 진행**
```
/projects/[projectId] → 팀 채팅 + 작업 관리
```

---

## 📁 **페이지별 상세 설계 (수정됨)**

### **1️⃣ `/projects/new/page.tsx` - 프로젝트 초기 설계**

#### **🎯 목표:** 
완전한 프로젝트 청사진 생성 + AI 역할 제안 승인

#### **📋 AI 수집 정보 (사장 의견 반영):**
```typescript
interface ProjectBlueprint {
  // 기본 정보
  creatorName: string;           // 생성자 이름
  projectName: string;           // 프로젝트명
  projectDescription: string;    // 상세 설명

  // 기술 정보
  techStack: string[];          // 기술 스택 배열
  projectType: string;          // 프로젝트 유형 (웹앱, 모바일 등)
  complexity: 'beginner' | 'intermediate' | 'advanced';

  // 일정 정보
  duration: string;             // "2주", "1개월" 등

  // 추가 정보
  requirements: string[];       // 특별 요구사항
  goals: string[];             // 세부 목표들

  // 팀 정보
  teamSize: number;             // 팀원 수
  preferredRoles: string[];     // 필요한 역할들
  
  // AI 제안 역할 (새로 추가)
  aiSuggestedRoles: RoleSuggestion[];
}

interface RoleSuggestion {
  roleName: string;             // 역할명
  count: number;                // 필요 인원
  description: string;          // 역할 설명
  requirements: string[];       // 필요 스킬
  isLeader: boolean;           // 팀장 여부
}
```

#### **🔄 새로운 상담 플로우:**
1. **기본 정보 수집** (6단계)
2. **AI 역할 분석** - 수집된 정보 기반으로 역할 제안
3. **역할 제안 승인/수정** - 사용자가 확인 후 승인
4. **최종 프로젝트 생성**

#### **🎨 역할 제안 승인 모달:**
```
홍길동님의 프로젝트는 소규모 기본 CRUD 게시판 구현임을 고려했을 때 
필요한 역할은 다음과 같습니다:

📋 제안 역할:
- 백엔드 개발자: 3명 (Spring Boot, JPA)
- 풀스택 개발자: 1명 (프론트엔드 + 백엔드)
- 팀장: 1명 (기술 리더십)

✅ 이대로 프로젝트를 생성하시겠습니까?
❌ 수정하시겠습니까?
```

#### **🔧 수정 가능한 정보:**
- 역할별 필요 인원 수
- 역할 설명 및 요구사항
- 팀 규모 조정
- 기술 스택 수정

**여기서 직접 정해서 말해달라고해 위에서 수정하기를클릭했으면**
#### **🔄 진행률 계산 (8단계):**
```typescript
const calculateProgress = (data: ProjectBlueprint): number => {
  const steps = [
    data.creatorName,
    data.projectName,
    data.projectDescription,
    data.techStack?.length > 0,
    data.duration,
    data.teamSize,
    data.requirements?.length > 0,
    data.aiSuggestedRoles?.length > 0    // 역할 제안 완료
  ];
  
  const completed = steps.filter(Boolean).length;
  return (completed / 8) * 100;
};
```

---

### **2️⃣ `/projects/join/[inviteCode]/page.tsx` - 팀 대기실 (수정됨)**

#### **🎯 목표:** 
팀원 입장 → 개별 면담 → 대기실 복귀 (유연한 플로우)

#### **📋 상태 관리:**
```typescript
interface TeamWaitingRoom {
  project: ProjectBlueprint;
  members: TeamMember[];
  inviteCode: string;
  status: 'RECRUITING' | 'INTERVIEWING' | 'READY_FOR_ANALYSIS';
  canStartInterview: boolean;     // 면담 시작 가능 여부
}

interface TeamMember {
  id: string;
  name: string;
  joinedAt: Date;
  interviewStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  canStartInterview: boolean;     // 개별 면담 가능 여부
}
```

#### **🔄 새로운 플로우:**
1. **팀원 입장** → 대기실 진입
2. **개별 면담 시작** → `/projects/[projectId]/interview`
3. **면담 완료** → 대기실 복귀
4. **모든 면담 완료** → 분석 단계 진행

#### **🎨 UI 개선:**
- 각 팀원별 면담 상태 표시
- "면담 시작하기" 버튼 (개별)
- 실시간 면담 진행 상황 표시
- 팀 구성 진행률 표시

---

### **3️⃣ `/projects/[projectId]/interview/page.tsx` - 개별 면담 (신규)**

#### **🎯 목표:** 
각 팀원의 역할 적합성 분석 + 대기실 복귀

#### **📋 AI 수집 정보 (간소화):**
```typescript
interface MemberProfile {
  // 기본 정보
  memberId: string;
  memberName: string;

  // 기술 역량
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  strongSkills: string[];      // 자신있는 기술
  learningGoals: string[];     // 배우고 싶은 것

  // 역할 선호도
  preferredRole: 'frontend' | 'backend' | 'fullstack' | 'leader';
  leadershipInterest: boolean; // 팀장 관심도

  // 협업 스타일
  workStyle: 'individual' | 'collaborative' | 'mixed';

  // 프로젝트 관련
  projectMotivation: string;   // 참여 동기
  contributions: string[];     // 기여하고 싶은 부분
}
```

**팀장 관심도가 단순 불리언이면 개별면담후 종합결정할때 팀장 하고싶다는사람 여러명이면 어떻게할거임?**

#### **🔄 면담 후 플로우:**
1. **면담 완료** → 데이터 저장
2. **자동 리다이렉트** → `/projects/join/[inviteCode]` (대기실)
3. **상태 업데이트** → 면담 완료 표시

---

### **4️⃣ `/projects/[projectId]/analysis/page.tsx` - AI 종합 분석 (간소화)**

#### **🎯 목표:** 
최적의 팀 구성 및 역할 배분 (복잡도 조정)

#### **📋 AI 분석 결과 (간소화):**
```typescript
interface TeamAnalysis {
  projectInfo: ProjectBlueprint;
  teamMembers: MemberProfile[];
  
  // AI 분석 결과 (간소화)
  roleAssignments: RoleAssignment[];
  teamLeader: string;          // 팀장 추천
  recommendations: string[];   // AI 추천사항
  compatibilityScore: number;  // 팀 호환성 점수
}

interface RoleAssignment {
  memberId: string;
  memberName: string;
  primaryRole: string;        // 주 역할
  responsibilities: string[]; // 세부 책임
  reasonings: string[];      // 배정 이유
}
```

#### **🎨 UI 설계 (간소화):**
- **팀 구성 카드**: 각 멤버 역할 표시
- **역할 배정 이유**: AI 추천 근거 표시
- **승인 버튼**: 팀 구성 확정

---

### **5️⃣ `/projects/[projectId]/page.tsx` - 프로젝트 진행 (기존 유지)**

#### **🎯 목표:** 
실제 프로젝트 작업 관리 (기존 계획 유지)

---

## 🗂️ **데이터베이스 스키마 확장**

```prisma
model Project {
  // 기존 필드들...
  
  // 새로운 필드들
  blueprint         Json?        // ProjectBlueprint 저장
  teamAnalysis      Json?        // TeamAnalysis 저장
  
  // 상태 관리
  status            ProjectStatus @default(RECRUITING)
  interviewPhase    InterviewPhase @default(PENDING)
}

enum ProjectStatus {
  RECRUITING        // 팀원 모집 중
  INTERVIEWING      // 면담 진행 중
  ANALYZING         // AI 분석 중
  ACTIVE            // 프로젝트 진행 중
  COMPLETED
  PAUSED
}

enum InterviewPhase {
  PENDING           // 면담 대기
  IN_PROGRESS       // 면담 진행 중
  COMPLETED         // 면담 완료
}

model ProjectMember {
  // 기존 필드들...
  
  // 면담 관련
  memberProfile     Json?        // MemberProfile 저장
  interviewStatus   InterviewStatus @default(PENDING)
  roleAssignment    Json?        // RoleAssignment 저장
}

enum InterviewStatus {
  PENDING           // 면담 대기
  IN_PROGRESS       // 면담 진행 중
  COMPLETED         // 면담 완료
}
```

---

## 🚀 **구현 우선순위 & 타임라인 (수정됨)**

### **🎯 Phase A: 핵심 기능 구현 (3-4시간)**
1. `/projects/new` AI 역할 제안 및 승인 시스템
2. 진행률 바 8단계 구현
3. 데이터베이스 스키마 확장

### **🎯 Phase B: 면담 시스템 (2-3시간)**
1. `/projects/[projectId]/interview` 개별 면담 페이지
2. 대기실 ↔ 면담 페이지 연결
3. 면담 상태 실시간 업데이트

### **🎯 Phase C: 분석 시스템 (2-3시간)**
1. `/projects/[projectId]/analysis` AI 분석 페이지
2. 역할 배정 및 승인 시스템
3. 전체 플로우 연결

### **🎯 Phase D: 최종 테스트 & 폴리싱 (1-2시간)**
1. 전체 플로우 테스트
2. 에러 처리 및 예외 상황 대응
3. UI/UX 최종 개선

---

## 💡 **사장 의견 반영사항**

### **✅ 주요 변경사항:**
1. **AI 역할 제안**: new 페이지에서 AI가 역할 제안 → 사용자 승인
2. **유연한 플로우**: 팀원 모집 완료 전에도 개별 면담 가능
3. **간소화된 수집**: 복잡한 정보 수집 최소화
4. **직관적인 UI**: 각 단계별 명확한 안내

### **✅ 해결되는 문제들:**
1. **진행률 바**: 8단계 명확한 진행 상황
2. **역할 명확화**: AI가 프로젝트 특성에 맞는 역할 제안
3. **플로우 유연성**: 팀원들이 원할 때 면담 가능
4. **사용자 경험**: 예측 가능하고 직관적인 플로우

---

## 🤔 **최종 확인**

**이 수정된 계획이 모든 요구사항을 만족한다고 판단됩니다.**

**Phase A부터 바로 구현을 시작하시겠습니까?**