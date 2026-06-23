import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '../lib/utils';

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  }
>(function Button(
  { className, variant = 'primary', size = 'md', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-sage text-canvas hover:bg-ink',
        variant === 'secondary' &&
          'bg-sage-soft text-ink hover:bg-sage-soft/70',
        variant === 'quiet' &&
          'bg-transparent text-muted hover:bg-sage-soft/60 hover:text-ink',
        variant === 'danger' && 'bg-red-100 text-danger hover:bg-red-200',
        size === 'sm' && 'px-3 py-2 text-sm',
        size === 'md' && 'px-5 py-3 text-sm',
        size === 'lg' && 'px-7 py-4 text-base',
        className,
      )}
      {...props}
    />
  );
});

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-mp border border-ink/5 bg-surface shadow-soft',
        className,
      )}
      {...props}
    />
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-ink outline-none placeholder:text-muted/70 focus:border-sage focus:ring-2 focus:ring-sage/20 dark:bg-white/5',
        className,
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full resize-none rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-ink outline-none placeholder:text-muted/70 focus:border-sage focus:ring-2 focus:ring-sage/20 dark:bg-white/5',
        className,
      )}
      {...props}
    />
  );
});

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-sage-soft px-3 py-1 text-xs font-semibold text-sage',
        className,
      )}
      {...props}
    />
  );
}
