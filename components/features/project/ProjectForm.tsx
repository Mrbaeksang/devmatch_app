"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// 타입 정의
interface ProjectFormData {
  name: string;
  goal: string;
}

interface ProjectResponse {
  id: string;
  name: string;
  goal: string;
  ownerId: string;
}

// 폼 검증 함수
const validateForm = (data: ProjectFormData): string | null => {
  if (!data.name.trim()) {
    return "프로젝트 이름을 입력해주세요.";
  }
  if (data.name.trim().length < 2) {
    return "프로젝트 이름은 2자 이상이어야 합니다.";
  }
  if (!data.goal.trim()) {
    return "프로젝트 목표를 입력해주세요.";
  }
  if (data.goal.trim().length < 10) {
    return "프로젝트 목표는 10자 이상 입력해주세요.";
  }
  return null;
};

// API 호출 함수
const createProject = async (data: ProjectFormData): Promise<ProjectResponse> => {
  console.log('클라이언트: createProject 함수 호출됨.'); // 함수 진입점
  console.log('클라이언트: 전송할 프로젝트 데이터:', data); // 전송될 데이터 확인
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // NextAuth 쿠키 포함 (필수!)
      body: JSON.stringify(data),
    });

    console.log('클라이언트: API 응답 상태 코드:', response.status); // 응답 상태 코드 확인
    console.log('클라이언트: API 응답 OK 여부:', response.ok); // 응답 성공 여부 확인

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('클라이언트: API 오류 응답 본문 (errorData):', errorData); // 오류 응답 본문 확인
      console.error('클라이언트: API 호출 실패! 에러 메시지:', errorData.message || "서버에서 프로젝트 생성 실패"); // 최종 에러 메시지
      throw new Error(errorData.message || "서버에서 프로젝트 생성 실패");
    }

    const responseJson = await response.json(); // 성공 시 응답 본문 파싱
    console.log('클라이언트: API 성공 응답 본문 (JSON):', responseJson); // 성공 응답 본문 확인

    return responseJson;
  } catch (error) {
    console.error('클라이언트: createProject 최종 catch 블록 에러:', error); // fetch 또는 .json() 파싱 중 발생한 에러
    // 여기서 error.message를 사용자에게 보여줄 수 있습니다.
    throw error;
  }
};


// 메인 컴포넌트
export function ProjectForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    goal: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 입력값 변경 핸들러
  const handleInputChange = (
    field: keyof ProjectFormData,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 폼 제출 핸들러
  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 폼 검증
    const validationError = validateForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("프로젝트를 생성 중입니다...");

    try {
      // 1. 프로젝트 생성 API 호출
      const newProject = await createProject(formData);
      toast.success("프로젝트가 성공적으로 생성되었습니다!", { id: toastId });
      
      // 2. AI 역할 추천 API 호출
      toast.loading("AI가 프로젝트에 필요한 역할을 분석 중입니다...", { id: toastId });
      
      const rolesResponse = await fetch('/api/projects/ai/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectGoal: newProject.goal })
      });

      if (!rolesResponse.ok) {
        throw new Error("AI 역할 분석에 실패했습니다.");
      }

      const rolesData = await rolesResponse.json();
      console.log("AI 추천 역할:", rolesData.roles);

      // 3. 역할 저장 API 호출 (이 부분은 다음 단계에서 구현 예정)
      // await saveRoles(newProject.id, rolesData.roles);

      toast.success("AI 역할 분석 및 저장이 완료되었습니다.", { id: toastId });

      // 4. 모든 과정 완료 후 상세 페이지로 이동
      router.push(`/projects/${newProject.id}`);

    } catch (error) {
      console.error("프로젝트 생성 또는 AI 역할 분석 오류:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "작업에 실패했습니다.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4">
      {/* 프로젝트명 입력 */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right font-medium">
          프로젝트명
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="col-span-3"
          disabled={isSubmitting}
          placeholder="프로젝트 이름을 입력하세요"
          maxLength={50}
        />
      </div>

      {/* 프로젝트 목표 입력 */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="goal" className="text-right font-medium pt-2">
          프로젝트 목표
        </Label>
        <Textarea
          id="goal"
          value={formData.goal}
          onChange={(e) => handleInputChange("goal", e.target.value)}
          className="col-span-3 min-h-[100px] resize-none"
          disabled={isSubmitting}
          placeholder="프로젝트의 목표와 설명을 입력하세요"
          maxLength={500}
        />
      </div>

      {/* 글자 수 표시 */}
      <div className="grid grid-cols-4 gap-4">
        <div></div>
        <div className="col-span-3 text-sm text-gray-500">
          {formData.goal.length}/500 자
        </div>
      </div>

      {/* 제출 버튼 */}
      <DialogFooter>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            "생성하기"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}