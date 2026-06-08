import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink/80">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5',
          'text-ink placeholder:text-ink/30',
          'focus:border-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-200',
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
