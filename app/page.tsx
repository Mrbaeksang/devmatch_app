import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {

  const session = await getServerSession(authOptions);

  // 2. 로그인 상태에 따른 분기 처리
  if (session) {
    // 만약 세션이 존재한다면 (이미 로그인했다면),
    // 이 페이지를 보여주지 않고 즉시 /projects 페이지로 보냅니다.
    redirect("/projects");
  }

  // 3. 로그인하지 않은 사용자에게 보여줄 화면
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">AI 팀 빌딩 매니저</h1>
      <p className="text-xl text-gray-600 mb-8">
        최적의 팀을 구성하고, 프로젝트를 성공으로 이끄세요.
      </p>
      <Link href="/auth">
        <Button size="lg">시작하기 (로그인)</Button>
      </Link>
    </div>
  );
}