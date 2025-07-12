// 데이터 일관성 모니터링 시스템 - 실시간 데이터 무결성 검사
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 📊 데이터 일관성 모니터링 시스템
class DataConsistencyMonitor {
  constructor() {
    this.inconsistencies = [];
    this.checks = [];
  }

  // 🔍 1. 프로젝트-멤버 일관성 검사
  async checkProjectMemberConsistency() {
    console.log('\n🔍 **프로젝트-멤버 일관성 검사**');
    
    const projects = await prisma.project.findMany({
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    for (const project of projects) {
      // 팀 크기 vs 실제 멤버 수 검사
      const actualMembers = project.members.length;
      const targetSize = project.teamSize;
      
      if (project.status === 'ACTIVE' && actualMembers !== targetSize) {
        this.inconsistencies.push({
          type: 'TEAM_SIZE_MISMATCH',
          project: project.name,
          issue: `활성 프로젝트인데 팀 크기 불일치: 목표 ${targetSize}명, 실제 ${actualMembers}명`
        });
      }

      // 멤버 상태 vs 프로젝트 상태 검사
      if (project.status === 'ANALYZING') {
        const pendingInterviews = project.members.filter(m => m.interviewStatus !== 'COMPLETED').length;
        if (pendingInterviews > 0) {
          this.inconsistencies.push({
            type: 'INVALID_ANALYSIS_STATE',
            project: project.name,
            issue: `분석 중인데 ${pendingInterviews}명의 면담이 미완료`
          });
        }
      }

      // 면담 완료 but 프로필 없음
      const completedWithoutProfile = project.members.filter(m => 
        m.interviewStatus === 'COMPLETED' && !m.memberProfile
      );
      
      if (completedWithoutProfile.length > 0) {
        this.inconsistencies.push({
          type: 'MISSING_PROFILE',
          project: project.name,
          issue: `면담 완료했지만 프로필 없는 멤버 ${completedWithoutProfile.length}명`
        });
      }

      this.checks.push(`✅ 프로젝트 "${project.name}" 기본 일관성 검사 완료`);
    }
  }

  // 🎯 2. 기술스택-면담 일관성 검사
  async checkTechStackInterviewConsistency() {
    console.log('\n🎯 **기술스택-면담 일관성 검사**');
    
    const projects = await prisma.project.findMany({
      include: {
        members: {
          where: { interviewStatus: 'COMPLETED' },
          include: { user: true }
        }
      }
    });

    for (const project of projects) {
      if (!project.blueprint || !project.blueprint.techStack) continue;

      const allProjectTechs = this.extractAllTechnologies(project.blueprint.techStack);
      
      for (const member of project.members) {
        if (!member.memberProfile || !member.memberProfile.skillScores) continue;

        const evaluatedTechs = Object.keys(member.memberProfile.skillScores);
        const missingTechs = allProjectTechs.filter(tech => !evaluatedTechs.includes(tech));
        const extraTechs = evaluatedTechs.filter(tech => !allProjectTechs.includes(tech));

        if (missingTechs.length > 0) {
          this.inconsistencies.push({
            type: 'MISSING_TECH_EVALUATION',
            project: project.name,
            member: member.user.nickname || member.user.name,
            issue: `프로젝트 기술 중 평가 누락: ${missingTechs.join(', ')}`
          });
        }

        if (extraTechs.length > 0) {
          this.inconsistencies.push({
            type: 'EXTRA_TECH_EVALUATION',
            project: project.name,
            member: member.user.nickname || member.user.name,
            issue: `프로젝트와 무관한 기술 평가: ${extraTechs.join(', ')}`
          });
        }
      }

      this.checks.push(`✅ 프로젝트 "${project.name}" 기술스택-면담 일관성 검사 완료`);
    }
  }

  // 🤖 3. AI 로직 결과 일관성 검사
  async checkAILogicConsistency() {
    console.log('\n🤖 **AI 로직 결과 일관성 검사**');
    
    const projects = await prisma.project.findMany({
      where: { 
        blueprint: { not: null }
      }
    });

    for (const project of projects) {
      const blueprint = project.blueprint;
      
      if (!blueprint.techStack || !blueprint.teamComposition) continue;

      const techStack = blueprint.techStack;
      const composition = blueprint.teamComposition;

      // Frontend 기술 vs Frontend 역할 검사
      const hasFrontend = this.hasTechnologies(techStack.frontend);
      const frontendRoles = composition.roleRequirements?.frontend || 0;

      if (hasFrontend && frontendRoles === 0) {
        this.inconsistencies.push({
          type: 'AI_LOGIC_ERROR',
          project: project.name,
          issue: '🚨 Frontend 기술이 있는데 Frontend 역할 0명으로 설정됨',
          severity: 'CRITICAL'
        });
      }

      // Backend 기술 vs Backend 역할 검사
      const hasBackend = this.hasTechnologies(techStack.backend);
      const backendRoles = composition.roleRequirements?.backend || 0;

      if (hasBackend && backendRoles === 0) {
        this.inconsistencies.push({
          type: 'AI_LOGIC_ERROR',
          project: project.name,
          issue: '🚨 Backend 기술이 있는데 Backend 역할 0명으로 설정됨',
          severity: 'CRITICAL'
        });
      }

      // 총 역할 배정 vs 팀 크기 검사
      const totalRoles = (composition.roleRequirements?.frontend || 0) + 
                        (composition.roleRequirements?.backend || 0) + 
                        (composition.roleRequirements?.fullstack || 0);
      
      if (totalRoles !== composition.totalMembers) {
        this.inconsistencies.push({
          type: 'ROLE_ASSIGNMENT_ERROR',
          project: project.name,
          issue: `역할 배정 합계 오류: 총 ${composition.totalMembers}명인데 배정 ${totalRoles}명`
        });
      }

      this.checks.push(`✅ 프로젝트 "${project.name}" AI 로직 일관성 검사 완료`);
    }
  }

  // 🔄 4. 상태 전이 유효성 검사
  async checkStateTransitionValidity() {
    console.log('\n🔄 **상태 전이 유효성 검사**');
    
    const projects = await prisma.project.findMany({
      include: {
        members: true
      }
    });

    for (const project of projects) {
      // RECRUITING -> ANALYZING 전이 조건 검사
      if (project.status === 'ANALYZING') {
        const allInterviewsComplete = project.members.every(m => m.interviewStatus === 'COMPLETED');
        const hasRequiredMembers = project.members.length === project.teamSize;
        
        if (!allInterviewsComplete) {
          this.inconsistencies.push({
            type: 'INVALID_STATE_TRANSITION',
            project: project.name,
            issue: '모든 면담이 완료되지 않았는데 ANALYZING 상태로 전이됨'
          });
        }
        
        if (!hasRequiredMembers) {
          this.inconsistencies.push({
            type: 'INVALID_STATE_TRANSITION',
            project: project.name,
            issue: '팀원이 부족한데 ANALYZING 상태로 전이됨'
          });
        }
      }

      // ANALYZING -> ACTIVE 전이 조건 검사
      if (project.status === 'ACTIVE') {
        if (!project.teamAnalysis) {
          this.inconsistencies.push({
            type: 'INVALID_STATE_TRANSITION',
            project: project.name,
            issue: '팀 분석 결과가 없는데 ACTIVE 상태로 전이됨'
          });
        }
      }

      this.checks.push(`✅ 프로젝트 "${project.name}" 상태 전이 검사 완료`);
    }
  }

  // 🛠️ 헬퍼 함수들
  hasTechnologies(techCategory) {
    if (!techCategory) return false;
    
    const hasLanguages = techCategory.languages && techCategory.languages.length > 0;
    const hasFrameworks = techCategory.frameworks && techCategory.frameworks.length > 0;
    const hasTools = techCategory.tools && techCategory.tools.length > 0;
    
    return hasLanguages || hasFrameworks || hasTools;
  }

  extractAllTechnologies(techStack) {
    const allTechs = [];
    
    ['frontend', 'backend', 'collaboration'].forEach(category => {
      if (techStack[category]) {
        ['languages', 'frameworks', 'tools', 'git'].forEach(subCategory => {
          if (techStack[category][subCategory]) {
            allTechs.push(...techStack[category][subCategory]);
          }
        });
      }
    });
    
    return [...new Set(allTechs)]; // 중복 제거
  }

  // 📊 모니터링 결과 출력
  printMonitoringReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 **DevMatch 데이터 일관성 모니터링 리포트**');
    console.log('='.repeat(70));

    // 심각도별 분류
    const critical = this.inconsistencies.filter(i => i.severity === 'CRITICAL');
    const errors = this.inconsistencies.filter(i => !i.severity || i.severity === 'ERROR');
    const warnings = this.inconsistencies.filter(i => i.severity === 'WARNING');

    console.log(`\n📋 **검사 완료**: ${this.checks.length}개 항목`);
    console.log(`🚨 **발견된 문제**: ${this.inconsistencies.length}개`);
    
    if (critical.length > 0) {
      console.log(`  ⚠️ 심각: ${critical.length}개 (즉시 수정 필요)`);
    }
    if (errors.length > 0) {
      console.log(`  ❌ 오류: ${errors.length}개`);
    }
    if (warnings.length > 0) {
      console.log(`  ⚠️ 경고: ${warnings.length}개`);
    }

    // 심각한 문제부터 출력
    if (critical.length > 0) {
      console.log('\n🚨 **즉시 수정 필요한 문제들**:');
      critical.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.project}] ${issue.issue}`);
      });
    }

    // 일반 문제들 출력
    if (errors.length > 0) {
      console.log('\n❌ **발견된 문제들**:');
      errors.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.type}] ${issue.project}: ${issue.issue}`);
        if (issue.member) console.log(`      멤버: ${issue.member}`);
      });
    }

    // 상태 평가
    const healthScore = Math.max(0, 100 - (critical.length * 20 + errors.length * 10 + warnings.length * 5));
    console.log(`\n💊 **시스템 건강도**: ${healthScore}/100`);
    
    if (healthScore >= 90) {
      console.log('✅ 시스템이 매우 건강합니다!');
    } else if (healthScore >= 70) {
      console.log('⚠️ 일부 문제가 있지만 전반적으로 안정적입니다.');
    } else {
      console.log('🚨 시스템에 심각한 문제가 있습니다. 즉시 수정이 필요합니다!');
    }

    console.log('='.repeat(70));
    
    return critical.length === 0 && errors.length === 0;
  }

  // 🚀 전체 모니터링 실행
  async runMonitoring() {
    console.log('🚀 DevMatch 데이터 일관성 모니터링 시작');
    
    try {
      await this.checkProjectMemberConsistency();
      await this.checkTechStackInterviewConsistency();
      await this.checkAILogicConsistency();
      await this.checkStateTransitionValidity();
      
      return this.printMonitoringReport();
      
    } catch (error) {
      console.error('❌ 모니터링 중 오류 발생:', error);
      return false;
    } finally {
      await prisma.$disconnect();
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const monitor = new DataConsistencyMonitor();
  monitor.runMonitoring().catch(console.error);
}

module.exports = { DataConsistencyMonitor };