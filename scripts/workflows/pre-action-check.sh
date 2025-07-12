#!/bin/bash

# Claude CLI 훅: 작업 전 검사
# 파일 수정/생성 전에 자동으로 실행됨

TOOL_NAME="$1"
ACTION="$2"

# 중요한 파일 수정 시에만 체크
case "$TOOL_NAME" in
    "Edit"|"Write"|"MultiEdit")
        echo "🔍 [Claude Hook] 코드 수정 전 검사..."
        
        # 현재 브랜치 확인
        CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
        if [ "$CURRENT_BRANCH" != "main" ]; then
            echo "⚠️  현재 브랜치: $CURRENT_BRANCH (main이 아님)"
        fi
        
        # 스테이징된 변경사항 확인
        if [ -n "$(git status --porcelain --cached 2>/dev/null)" ]; then
            echo "⚠️  스테이징된 변경사항이 있습니다. 먼저 커밋을 고려해보세요."
        fi
        
        echo "✅ 사전 검사 완료"
        ;;
    *)
        # 다른 도구들은 무시
        exit 0
        ;;
esac