#!/bin/bash

# DevMatch 작업 완료 훅
# 특정 작업 완료 시 자동으로 진행 상황 업데이트 및 커밋

# 사용법: ./hooks/task-complete.sh [task-type] "작업명" "상세설명"
# task-type: feature, bugfix, refactor, docs, test, style

TASK_TYPE="${1:-feature}"
TASK_NAME="$2"
TASK_DESCRIPTION="${3:-}"

if [ -z "$TASK_NAME" ]; then
    echo "❌ 사용법: ./hooks/task-complete.sh [task-type] \"작업명\" \"상세설명\""
    echo ""
    echo "📋 task-type 옵션:"
    echo "   feature  - 새 기능 구현 (기본값)"
    echo "   bugfix   - 버그 수정"
    echo "   refactor - 코드 리팩토링"
    echo "   docs     - 문서 업데이트"
    echo "   test     - 테스트 추가/수정"
    echo "   style    - 코드 스타일 개선"
    echo ""
    echo "예시:"
    echo "   ./hooks/task-complete.sh feature \"프로젝트 생성 API\" \"사용자 프로젝트 생성 기능 구현\""
    echo "   ./hooks/task-complete.sh bugfix \"로그인 오류 수정\" \"OAuth 리다이렉트 URL 문제 해결\""
    exit 1
fi

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 작업 타입별 이모지 및 접두사
case $TASK_TYPE in
    "feature")
        EMOJI="✨"
        PREFIX="feat"
        ;;
    "bugfix")
        EMOJI="🐛"
        PREFIX="fix"
        ;;
    "refactor")
        EMOJI="♻️"
        PREFIX="refactor"
        ;;
    "docs")
        EMOJI="📚"
        PREFIX="docs"
        ;;
    "test")
        EMOJI="🧪"
        PREFIX="test"
        ;;
    "style")
        EMOJI="💄"
        PREFIX="style"
        ;;
    *)
        EMOJI="🔧"
        PREFIX="chore"
        ;;
esac

echo "${EMOJI} ${TASK_TYPE^^} 작업 완료 처리 중..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 개발 로그 업데이트
echo "📋 개발 로그 업데이트 중..."

# 현재 상태 섹션 업데이트
sed -i "s/마지막 업데이트: .*/마지막 업데이트: ${TIMESTAMP}/" DEVELOPMENT_LOG.md

# 새 작업 기록 추가
cat >> DEVELOPMENT_LOG.md << EOF

### ${EMOJI} ${TIMESTAMP} - ${TASK_NAME} (${TASK_TYPE})
**설명**: ${TASK_DESCRIPTION}
**타입**: ${TASK_TYPE}
**상태**: ✅ 완료

EOF

echo "✅ 개발 로그 업데이트 완료"

# 자동 커밋 실행
echo "📋 자동 커밋 실행 중..."
./hooks/auto-commit.sh "${TASK_NAME}" "${TASK_DESCRIPTION}"

echo ""
echo "🎉 ${TASK_TYPE^^} 작업 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 ${EMOJI} ${TASK_NAME}"
echo "📄 ${TASK_DESCRIPTION}"
echo "⏰ ${TIMESTAMP}"
echo ""

# 개발 상태 요약
echo "📊 현재 개발 상태:"
echo "   • 마지막 커밋: $(git log -1 --format="%h - %s")"
echo "   • 브랜치: $(git branch --show-current)"
echo "   • 변경된 파일: $(git show --name-only --format="" HEAD | wc -l)개"
echo ""
echo "🔍 진행 상황 확인: cat DEVELOPMENT_LOG.md"
echo ""