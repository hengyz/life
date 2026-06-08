interface PageStatusProps {
  message: string;
  hint?: string;
}

export function PageStatus({ message, hint }: PageStatusProps) {
  return (
    <div className="page-container flex min-h-dvh flex-col items-center justify-center text-center">
      <p className="text-ink/60">{message}</p>
      {hint && <p className="mt-2 text-sm text-ink/40">{hint}</p>}
    </div>
  );
}
