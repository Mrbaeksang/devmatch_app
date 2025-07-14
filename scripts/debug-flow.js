// DevMatch 전체 데이터 플로우 디버깅 시스템
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 🔍 전체 데이터 플로우 검증 시스템
class DevMatchDebugger {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  // 🎯 1단계: AI 상담 결과 검증
  async validateConsultationData(projectId) {
    console.log('\n🎯 **1단계: AI 상담 결과 검증**');
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      this.errors.push('프로젝트를 찾을 수 없습니다.');
      return false;
    }

    // Blueprint 존재 확인
    if (!project.blueprint) {
      this.errors.push('프로젝트 blueprint가 없습니다.');
      return false;
    }

    const blueprint = project.blueprint;
    
    // TechStack 구조 검증
    if (!blueprint.techStack) {
      this.errors.push('techStack이 blueprint에 없습니다.');
      return false;
    }

    console.log('✅ Blueprint 기본 구조: 통과');

    // 3-category 구조 검증
    const techStack = blueprint.techStack;
    const hasFrontend = techStack.frontend && (
      (techStack.frontend.languages && techStack.frontend.languages.length > 0) ||
      (techStack.frontend.frameworks && techStack.frontend.frameworks.length > 0) ||
      (techStack.frontend.tools && techStack.frontend.tools.length > 0)
    );
    
    const hasBackend = techStack.backend && (
      (techStack.backend.languages && techStack.backend.languages.length > 0) ||
      (techStack.backend.frameworks && techStack.backend.frameworks.length > 0) ||
      (techStack.backend.tools && techStack.backend.tools.length > 0)
    );

    console.log(`Frontend 기술 존재: ${hasFrontend ? '✅' : '❌'}`);
    console.log(`Backend 기술 존재: ${hasBackend ? '✅' : '❌'}`);

    // TeamComposition 검증
    if (!blueprint.teamComposition) {
      this.errors.push('teamComposition이 blueprint에 없습니다.');
      return false;
    }

    const composition = blueprint.teamComposition;
    
    // 🚨 핵심 로직 검증: Frontend 기술이 있는데 frontend: 0인지 확인
    if (hasFrontend && composition.roleRequirements.frontend === 0) {
      this.errors.push(`🚨 논리 오류: Frontend 기술이 있는데 frontend: ${composition.roleRequirements.frontend}로 설정됨`);
      console.log('Frontend 기술들:', {
        languages: techStack.frontend?.languages || [],
        frameworks: techStack.frontend?.frameworks || [],
        tools: techStack.frontend?.tools || []
      });
    } else if (hasFrontend && composition.roleRequirements.frontend > 0) {
      this.passed.push(`✅ Frontend 기술 ↔ 역할 분배 일치 (${composition.roleRequirements.frontend}명)`);
    }

    if (hasBackend && composition.roleRequirements.backend === 0) {
      this.errors.push(`🚨 논리 오류: Backend 기술이 있는데 backend: ${composition.roleRequirements.backend}로 설정됨`);
    } else if (hasBackend && composition.roleRequirements.backend > 0) {
      this.passed.push(`✅ Backend 기술 ↔ 역할 분배 일치 (${composition.roleRequirements.backend}명)`);
    }

    // 총 인원 검증
    const totalAssigned = composition.roleRequirements.frontend + 
                          composition.roleRequirements.backend + 
                          (composition.roleRequirements.fullstack || 0);
    
    if (totalAssigned !== composition.totalMembers) {
      this.errors.push(`인원 배정 오류: 총 ${composition.totalMembers}명인데 배정된 인원 ${totalAssigned}명`);
    } else {
      this.passed.push(`✅ 총 인원 배정 정확 (${totalAssigned}명)`);
    }

    return this.errors.length === 0;
  }

  // 🎤 2단계: 면담 결과 검증
  async validateInterviewData(projectId) {
    console.log('\n🎤 **2단계: 면담 결과 검증**');
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    const blueprint = project.blueprint;
    const allTechs = this.extractAllTechnologies(blueprint.techStack);
    console.log(`프로젝트 기술 스택 (총 ${allTechs.length}개):`, allTechs);

    let completedInterviews = 0;
    
    for (const member of project.members) {
      console.log(`\n팀원: ${member.user.nickname || member.user.name}`);
      console.log(`면담 상태: ${member.interviewStatus}`);
      
      if (member.interviewStatus === 'COMPLETED') {
        completedInterviews++;
        
        if (!member.memberProfile) {
          this.errors.push(`${member.user.name}: 면담 완료했지만 memberProfile이 없음`);
          continue;
        }

        const profile = member.memberProfile;
        
        // skillScores 검증
        if (!profile.skillScores) {
          this.errors.push(`${member.user.name}: skillScores가 없음`);
        } else {
          const evaluatedTechs = Object.keys(profile.skillScores);
          console.log(`평가받은 기술 (${evaluatedTechs.length}개):`, evaluatedTechs);
          
          // 모든 기술에 대해 평가받았는지 확인
          const missingTechs = allTechs.filter(tech => !evaluatedTechs.includes(tech));
          if (missingTechs.length > 0) {
            this.warnings.push(`${member.user.name}: 평가 누락 기술 - ${missingTechs.join(', ')}`);
          } else {
            this.passed.push(`✅ ${member.user.name}: 모든 기술 평가 완료`);
          }
        }

        // workStyles 검증 (1개만 있으면 됨)
        if (!profile.workStyles || profile.workStyles.length < 1) {
          this.errors.push(`${member.user.name}: workStyles가 없음`);
        } else {
          this.passed.push(`✅ ${member.user.name}: workStyles 있음 (${profile.workStyles.length}개)`);
        }
      }
    }

    console.log(`\n면담 완료: ${completedInterviews}/${project.members.length}명`);
    return completedInterviews === project.members.length;
  }

  // 📊 3단계: 팀 분석 결과 검증
  async validateAnalysisData(projectId) {
    console.log('\n📊 **3단계: 팀 분석 결과 검증**');
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    if (!project.teamAnalysis) {
      this.warnings.push('팀 분석이 아직 완료되지 않음');
      return false;
    }

    const analysis = project.teamAnalysis;
    
    // 역할 배정 검증
    if (!analysis.roleAssignments) {
      this.errors.push('역할 배정 결과가 없음');
      return false;
    }

    const assignments = analysis.roleAssignments;
    console.log('역할 배정 결과:', assignments);
    
    // 모든 팀원이 역할을 배정받았는지 확인
    const assignedMembers = Object.keys(assignments);
    const totalMembers = project.members.length;
    
    if (assignedMembers.length !== totalMembers) {
      this.errors.push(`역할 배정 누락: ${totalMembers}명 중 ${assignedMembers.length}명만 배정됨`);
    } else {
      this.passed.push(`✅ 모든 팀원 역할 배정 완료`);
    }

    // 리더 선정 검증
    if (analysis.teamLead) {
      this.passed.push(`✅ 팀장 선정: ${analysis.teamLead.name}`);
    } else if (project.blueprint.teamComposition.hasTeamLead) {
      this.errors.push('팀장이 필요하다고 설정되었지만 선정되지 않음');
    }

    return this.errors.length === 0;
  }

  // 🛠️ 기술 스택 추출 헬퍼
  extractAllTechnologies(techStack) {
    const allTechs = [];
    
    if (techStack.frontend) {
      if (techStack.frontend.languages) allTechs.push(...techStack.frontend.languages);
      if (techStack.frontend.frameworks) allTechs.push(...techStack.frontend.frameworks);
      if (techStack.frontend.tools) allTechs.push(...techStack.frontend.tools);
    }
    
    if (techStack.backend) {
      if (techStack.backend.languages) allTechs.push(...techStack.backend.languages);
      if (techStack.backend.frameworks) allTechs.push(...techStack.backend.frameworks);
      if (techStack.backend.tools) allTechs.push(...techStack.backend.tools);
    }
    
    if (techStack.collaboration) {
      if (techStack.collaboration.git) allTechs.push(...techStack.collaboration.git);
      if (techStack.collaboration.tools) allTechs.push(...techStack.collaboration.tools);
    }
    
    return allTechs;
  }

  // 📋 전체 결과 요약
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 **DevMatch 데이터 플로우 검증 결과**');
    console.log('='.repeat(60));
    
    if (this.passed.length > 0) {
      console.log('\n✅ **통과한 검증**:');
      this.passed.forEach(msg => console.log(`  ${msg}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ **경고**:');
      this.warnings.forEach(msg => console.log(`  ${msg}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n🚨 **오류 (즉시 수정 필요)**:');
      this.errors.forEach(msg => console.log(`  ${msg}`));
    }
    
    console.log(`\n📊 **종합 평가**: ${this.errors.length === 0 ? '✅ 모든 검증 통과' : `❌ ${this.errors.length}개 오류 발견`}`);
    console.log('='.repeat(60));
  }

  // 🚀 전체 플로우 검증 실행
  async runFullValidation(projectId) {
    console.log(`🚀 DevMatch 프로젝트 [${projectId}] 전체 플로우 검증 시작`);
    
    try {
      await this.validateConsultationData(projectId);
      await this.validateInterviewData(projectId);
      await this.validateAnalysisData(projectId);
      
      this.printSummary();
      
      return this.errors.length === 0;
      
    } catch (error) {
      console.error('❌ 검증 중 오류 발생:', error);
      return false;
    } finally {
      await prisma.$disconnect();
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const projectId = process.argv[2];
  
  if (!projectId) {
    console.log('사용법: node debug-flow.js <프로젝트ID>');
    console.log('예시: node debug-flow.js cmcyf4j700005u8k0v765o8v8');
    process.exit(1);
  }
  
  const debugTool = new DevMatchDebugger();
  debugTool.runFullValidation(projectId).catch(console.error);
}

module.exports = { DevMatchDebugger };