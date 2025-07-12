#!/bin/bash

# Claude CLI 훅: 작업 후 로깅
# 파일 수정/생성 후에 자동으로 실행됨

TOOL_NAME="$1"
ACTION="$2"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 작업 로그 파일
LOG_FILE="scripts/claude-activity.log"

# 중요한 작업만 로깅
case "$TOOL_NAME" in
    "Edit"|"Write"|"MultiEdit"|"Bash")
        echo "📝 [Claude Hook] 작업 후 로깅..."
        
        # 로그 디렉토리 생성
        mkdir -p scripts
        
        # 활동 로그 기록
        echo "[$TIMESTAMP] $TOOL_NAME: $ACTION" >> "$LOG_FILE"
        
        # Git 상태 확인
        CHANGED_FILES=$(git status --porcelain 2>/dev/null | wc -l)
        if [ "$CHANGED_FILES" -gt 0 ]; then
            echo "[$TIMESTAMP] Git Status: $CHANGED_FILES files changed" >> "$LOG_FILE"
        fi
        
        echo "✅ 작업 로그 기록 완료"
        ;;
    *)
        # 다른 도구들은 무시
        exit 0
        ;;
esac