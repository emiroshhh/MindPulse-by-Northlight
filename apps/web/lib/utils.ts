import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export { createId as uid } from '@mindpulse/shared';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
