import { ReactNode } from 'react';
import { UserRole } from './types';
import { cls } from './utils';

interface BubbleProps {
  role: UserRole;
  children: ReactNode;
}

export function Bubble({ role, children }: BubbleProps) {
  const isUser = role === 'user';
  
  return (
    <div
      className={cls(
        'rounded-2xl px-4 py-3 shadow-sm break-words',
        isUser ? 'bg-white text-hs-text' : 'bg-indigo-50 text-hs-text'
      )}
    >
      {children}
    </div>
  );
}
