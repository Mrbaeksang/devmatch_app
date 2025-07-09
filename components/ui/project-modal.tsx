"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface InfoCard {
  icon: string;
  label: string;
  value: string;
}

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "destructive";
  loading?: boolean;
}

interface ProjectModalProps {
  title: string;
  description?: string;
  infoCards?: InfoCard[];
  primaryAction: ActionButton;
  secondaryAction?: ActionButton;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({
  title,
  description,
  infoCards,
  primaryAction,
  secondaryAction,
  isOpen,
  onClose,
}: ProjectModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-2xl text-white font-bold text-center mb-4">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-zinc-300 text-center">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {infoCards && (
          <div className="flex justify-center items-center gap-4 my-6">
            {infoCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-800/50 backdrop-blur rounded-lg p-4 border border-zinc-700/50 text-center min-w-[100px]"
              >
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="text-xs text-zinc-400 mb-1">{card.label}</div>
                <div className="text-sm text-white font-medium">{card.value}</div>
              </motion.div>
            ))}
          </div>
        )}

        <DialogFooter className="gap-4 flex-row justify-center">
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "secondary"}
              onClick={() => {
                secondaryAction.onClick();
                onClose();
              }}
              className="bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600"
            >
              {secondaryAction.label}
            </Button>
          )}
          <Button
            variant={primaryAction.variant || "default"}
            onClick={() => {
              primaryAction.onClick();
              if (!primaryAction.loading) onClose();
            }}
            disabled={primaryAction.loading}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {primaryAction.loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {primaryAction.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 간편 사용을 위한 Hook
export function useProjectModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return { isOpen, openModal, closeModal };
}