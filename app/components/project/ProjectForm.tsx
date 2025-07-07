"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Textarea 추가
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react"; // 로딩 아이콘 추가

// named export 방식으로 변경
export function ProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // 로딩 상태 추가

  // API 호출 기능으로 handleSubmit 강화
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !goal) {
      toast.error("프로젝트 이름과 목표를 모두 입력해주세요.");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, goal }),
      });

      if (!response.ok) throw new Error("서버에서 프로젝트 생성 실패");

      const newProject = await response.json();
      toast.success("프로젝트가 성공적으로 생성되었습니다!");
      router.push(`/projects/${newProject.id}`); // 성공 시 상세 페이지로 이동
    } catch (error) {
      console.error(error);
      toast.error("프로젝트 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // div를 form 태그로 변경
  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          프로젝트명
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          className="col-span-3"
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="goal" className="text-right">
          프로젝트 목표
        </Label>
        {/* Input을 Textarea로 교체 */}
        <Textarea
          id="goal"
          value={goal}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGoal(e.target.value)}
          className="col-span-3"
          disabled={isSubmitting}
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
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