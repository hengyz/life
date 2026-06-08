import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id || label;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink/80">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={[
          'w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5',
          'text-ink placeholder:text-ink/30',
          'focus:border-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-200',
          'min-h-[100px] resize-y',
          error ? 'border-red-400' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
