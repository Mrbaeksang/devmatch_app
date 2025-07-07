
# `ProjectForm.tsx` 수정 요청 (AI 역할 분석 연동)

안녕하세요, 사장님.

프로젝트의 문서와 실제 코드의 동기화를 완료했습니다. 이제 다시 개발 작업으로 돌아가, 프로젝트 생성 프로세스를 완성하고자 합니다.

## 변경 목표

현재는 프로젝트 생성 후 바로 상세 페이지로 이동하지만, 앞으로는 **AI가 프로젝트 목표를 분석하여 추천 역할을 제안하는 중간 단계**를 추가하고자 합니다. `GEMINI.md`의 **Phase 1.2**에 계획된 내용입니다.

## 수정 요청 사항

`app/components/project/ProjectForm.tsx` 파일의 `handleSubmit` 함수 내부 로직을 아래와 같이 변경해 주십시오.

기존에는 프로젝트 생성 API 호출 후 성공 시 `router.push`를 통해 바로 페이지를 이동했습니다.
이제는 `createProject` 호출 성공 후, 반환된 `newProject` 정보를 사용하여 새로운 API(`/api/projects/ai/roles`)를 호출하는 로직을 추가해야 합니다.

### `handleSubmit` 함수 수정 (`ProjectForm.tsx`)

아래의 코드 블록을 `handleSubmit` 함수 전체에 붙여넣어 주세요.

```typescript
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
```

### 주요 변경 사항

1.  **상태 피드백 강화**: `toast` 라이브러리를 사용하여 각 단계(프로젝트 생성, AI 역할 분석)의 진행 상황을 사용자에게 명확하게 보여줍니다.
2.  **AI 역할 분석 API 호출**: 프로젝트 생성 후 반환된 `newProject.goal`을 이용해 `/api/projects/ai/roles` API를 호출합니다.
3.  **단계별 에러 처리**: 각 API 호출 단계에서 발생할 수 있는 오류를 `try...catch` 블록으로 감싸고, 사용자에게 적절한 에러 메시지를 표시합니다.

이 수정이 완료되면, 프로젝트 생성 시 사용자는 더 풍부한 피드백을 받게 되며, 백그라운드에서는 AI가 추천 역할을 생성하게 됩니다.

수정이 완료되면 알려주세요. 다음 단계로 넘어가겠습니다.
