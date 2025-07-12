#!/bin/bash

# DevMatch 자동 커밋 훅
# 작업 완료 시 자동으로 Git 커밋 및 진행 상황 업데이트

# 사용법: ./hooks/auto-commit.sh "작업명" "상세설명"
# 예시: ./hooks/auto-commit.sh "프로젝트 생성 API" "사용자가 새 프로젝트를 생성할 수 있는 API 엔드포인트 구현"

if [ $# -eq 0 ]; then
    echo "❌ 사용법: ./hooks/auto-commit.sh \"작업명\" \"상세설명\""
    echo "예시: ./hooks/auto-commit.sh \"프로젝트 생성 API\" \"API 엔드포인트 구현 완료\""
    exit 1
fi

TASK_NAME="$1"
TASK_DESCRIPTION="${2:-}"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "🚀 자동 커밋 프로세스 시작..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. 코드 품질 검사
echo "📋 1. 코드 품질 검사..."
if ! pnpm lint; then
    echo "❌ ESLint 검사 실패 - 수정 후 다시 시도하세요."
    exit 1
fi

if ! pnpm typecheck; then
    echo "❌ TypeScript 검사 실패 - 타입 오류를 수정하세요."
    exit 1
fi

echo "✅ 코드 품질 검사 통과"

# 2. Git 상태 확인
echo "📋 2. Git 상태 확인..."
if [ -n "$(git status --porcelain)" ]; then
    echo "✅ 변경사항 발견됨"
else
    echo "❌ 커밋할 변경사항이 없습니다."
    exit 1
fi

# 3. 개발 로그 업데이트
echo "📋 3. 개발 로그 업데이트..."

# DEVELOPMENT_LOG.md에 새 작업 기록 추가
cat >> DEVELOPMENT_LOG.md << EOF

### 📅 ${TIMESTAMP} - ${TASK_NAME}
**작업 내용**: ${TASK_DESCRIPTION}
**상태**: ✅ 완료
**커밋 해시**: (자동 생성됨)

EOF

echo "✅ 개발 로그 업데이트 완료"

# 4. Git 커밋
echo "📋 4. Git 커밋 진행..."

# 모든 변경사항 스테이징
git add .

# 커밋 메시지 생성
COMMIT_MESSAGE="$(cat <<EOF
feat: ${TASK_NAME}

${TASK_DESCRIPTION}

📋 체크리스트:
- ✅ ESLint 통과
- ✅ TypeScript 검사 통과
- ✅ 개발 로그 업데이트

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 커밋 실행
if git commit -m "$COMMIT_MESSAGE"; then
    COMMIT_HASH=$(git rev-parse --short HEAD)
    echo "✅ 커밋 성공 (${COMMIT_HASH})"
    
    # 개발 로그에 커밋 해시 업데이트
    sed -i "s/(자동 생성됨)/${COMMIT_HASH}/g" DEVELOPMENT_LOG.md
    
    # 커밋 해시 업데이트를 위한 추가 커밋
    git add DEVELOPMENT_LOG.md
    git commit --amend --no-edit
    
else
    echo "❌ 커밋 실패"
    exit 1
fi

# 5. 상태 보고
echo "📋 5. 상태 보고..."
echo ""
echo "🎉 작업 완료 및 커밋 성공!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 작업명: ${TASK_NAME}"
echo "📄 설명: ${TASK_DESCRIPTION}"
echo "🔗 커밋: ${COMMIT_HASH}"
echo "⏰ 시간: ${TIMESTAMP}"
echo ""
echo "📊 다음 작업을 위한 준비:"
echo "   - 현재 브랜치: $(git branch --show-current)"
echo "   - 총 커밋 수: $(git rev-list --count HEAD)"
echo "   - 개발 로그: DEVELOPMENT_LOG.md 업데이트됨"
echo ""
echo "🔧 다음 명령어:"
echo "   pnpm dev              # 개발 서버 시작"
echo "   pnpm dev-check        # 빠른 상태 확인"
echo "   git log --oneline -5  # 최근 커밋 확인"
echo ""