// components/common/LoadingSpinner.tsx

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />;
}