#!/bin/bash

# DevMatch 개발 상태 빠른 점검 스크립트
# 개발 중 언제든 실행 가능한 가벼운 검사

echo "⚡ DevMatch 개발 상태 빠른 점검..."

# 1. 서버 실행 상태 확인
echo "🔍 서버 상태 확인..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ 개발 서버 실행 중 (포트 3000)"
else
    echo "❌ 개발 서버가 실행되지 않았습니다. 'pnpm dev'로 시작하세요."
fi

# 2. 데이터베이스 연결 상태 (간단 확인)
echo "🔍 데이터베이스 설정 확인..."
if [ -f ".env" ] && grep -q "DATABASE_URL" .env; then
    echo "✅ 데이터베이스 URL 설정됨"
elif [ -f ".env.local" ] && grep -q "DATABASE_URL" .env.local; then
    echo "✅ 데이터베이스 URL 설정됨"
else
    echo "❌ DATABASE_URL이 설정되지 않았습니다."
fi

# 3. 타입 체크 (빠른 검사)
echo "🔍 타입 체크 (간단)..."
if tsc --noEmit --incremental; then
    echo "✅ 타입 체크 통과"
else
    echo "❌ 타입 오류 발견"
fi

# 4. 최근 변경된 파일 확인
echo "🔍 최근 변경 파일..."
echo "$(find . -name "*.tsx" -o -name "*.ts" -not -path "./node_modules/*" -not -path "./.next/*" | head -5 | while read file; do echo "   📄 $file"; done)"

# 5. 개발 팁 표시
echo ""
echo "💡 개발 팁:"
echo "   🚀 완전 검사: ./.claudehook"
echo "   🔧 개발 서버: pnpm dev"
echo "   📊 DB 관리: pnpm prisma studio"
echo "   🐛 디버깅: node scripts/debug-all.js <프로젝트ID>"

echo ""
echo "📋 CLAUDE.md 체크리스트 기억하세요:"
echo "   • 모든 코드에 상세한 주석"
echo "   • any 타입 사용 금지"
echo "   • 컴포넌트 재사용 우선"
echo ""