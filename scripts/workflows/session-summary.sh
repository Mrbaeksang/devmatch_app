#!/bin/bash

# Claude 세션 종료 시 요약 생성

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
SESSION_LOG="scripts/sessions/session-$(date '+%Y%m%d-%H%M%S').md"

# 세션 디렉토리 생성
mkdir -p scripts/sessions

echo "📊 Claude 세션 요약 생성 중..."

# 현재 세션 동안의 변경사항 확인
CHANGED_FILES=$(git status --porcelain 2>/dev/null | wc -l)
RECENT_COMMITS=$(git log --oneline --since="1 hour ago" 2>/dev/null | wc -l)

# 세션 요약 생성
cat > "$SESSION_LOG" << EOF
# Claude 개발 세션 요약

**세션 종료**: $TIMESTAMP  
**프로젝트**: DevMatch  

## 📊 세션 통계
- 변경된 파일: ${CHANGED_FILES}개
- 최근 커밋: ${RECENT_COMMITS}개
- 현재 브랜치: $(git branch --show-current 2>/dev/null || echo "main")

## 📝 최근 활동
EOF

# 최근 Claude 활동 로그 추가 (있다면)
if [ -f "scripts/claude-activity.log" ]; then
    echo "### Claude 활동 로그 (최근 10개)" >> "$SESSION_LOG"
    echo '```' >> "$SESSION_LOG"
    tail -10 scripts/claude-activity.log >> "$SESSION_LOG" 2>/dev/null || echo "활동 로그 없음" >> "$SESSION_LOG"
    echo '```' >> "$SESSION_LOG"
fi

# 최근 커밋 추가
echo "" >> "$SESSION_LOG"
echo "### 최근 Git 커밋" >> "$SESSION_LOG"
echo '```' >> "$SESSION_LOG"
git log --oneline -5 2>/dev/null >> "$SESSION_LOG" || echo "커밋 없음" >> "$SESSION_LOG"
echo '```' >> "$SESSION_LOG"

# 현재 상태
echo "" >> "$SESSION_LOG"
echo "### 현재 프로젝트 상태" >> "$SESSION_LOG"
if [ "$CHANGED_FILES" -gt 0 ]; then
    echo "⚠️ **미커밋 변경사항이 있습니다!**" >> "$SESSION_LOG"
    echo '```' >> "$SESSION_LOG"
    git status --porcelain 2>/dev/null >> "$SESSION_LOG"
    echo '```' >> "$SESSION_LOG"
else
    echo "✅ 모든 변경사항이 커밋되었습니다." >> "$SESSION_LOG"
fi

echo "✅ 세션 요약 저장: $SESSION_LOG"