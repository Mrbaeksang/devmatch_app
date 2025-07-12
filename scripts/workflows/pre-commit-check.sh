#!/bin/bash

# Git 커밋 전 최종 검증

echo "🔍 커밋 전 최종 검증 시작..."

# 1. 린트 체크
echo "📋 ESLint 검사..."
if ! pnpm lint --quiet; then
    echo "❌ ESLint 오류가 있습니다. 수정 후 커밋하세요."
    exit 1
fi

# 2. 타입 체크
echo "📋 TypeScript 검사..."
if ! pnpm typecheck; then
    echo "❌ TypeScript 오류가 있습니다. 수정 후 커밋하세요."
    exit 1
fi

# 3. 중요 파일 체크
IMPORTANT_FILES=("package.json" "tsconfig.json" "prisma/schema.prisma" ".env.local")
for file in "${IMPORTANT_FILES[@]}"; do
    if git diff --cached --name-only | grep -q "^$file$"; then
        echo "⚠️ 중요 파일 변경 감지: $file"
        echo "   변경사항을 신중히 검토했는지 확인하세요."
    fi
done

# 4. 대용량 파일 체크
LARGE_FILES=$(git diff --cached --name-only | xargs -I {} sh -c 'if [ -f "{}" ] && [ $(stat -c%s "{}") -gt 1048576 ]; then echo "{}"; fi' 2>/dev/null)
if [ -n "$LARGE_FILES" ]; then
    echo "⚠️ 대용량 파일 감지 (>1MB):"
    echo "$LARGE_FILES"
    echo "   정말 커밋하시겠습니까? (파일이 필요한지 검토하세요)"
fi

# 5. 환경변수 파일 체크
if git diff --cached --name-only | grep -E "\.(env|key|secret)" > /dev/null; then
    echo "❌ 환경변수 파일이 커밋에 포함되어 있습니다!"
    echo "   보안을 위해 .gitignore에 추가하고 커밋에서 제외하세요."
    exit 1
fi

echo "✅ 커밋 전 검증 완료"