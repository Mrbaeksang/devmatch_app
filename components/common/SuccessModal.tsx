// components/common/SuccessModal.tsx
// 프로젝트 생성 성공 모달 컴포넌트

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SuccessModalProps {
  isOpen: boolean;
  projectData: {
    inviteCode: string;
    [key: string]: unknown;
  };
  onNavigate: () => void;
}

/**
 * 프로젝트 생성 성공 모달
 * AI 상담 완료 후 초대 코드와 함께 표시되는 성공 모달
 * 
 * @param isOpen - 모달 표시 여부
 * @param projectData - 생성된 프로젝트 정보
 * @param onNavigate - 프로젝트로 이동하는 함수
 */
export function SuccessModal({ isOpen, projectData, onNavigate }: SuccessModalProps) {
  if (!isOpen) return null;
  
  /**
   * 초대 코드 복사
   */
  const copyInviteCode = () => {
    navigator.clipboard.writeText(projectData.inviteCode);
    toast.success('초대 코드가 복사되었습니다!');
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full mx-4"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-500/20 rounded-full"
          >
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            프로젝트가 생성되었습니다!
          </h3>
          
          <p className="text-zinc-400 mb-6">
            팀원들과 공유할 초대 코드입니다
          </p>
          
          <div className="bg-zinc-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-zinc-500 mb-2">초대 코드</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-white">
                {projectData.inviteCode}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyInviteCode}
                className="text-zinc-400 hover:text-white"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={onNavigate}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              프로젝트로 이동
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}