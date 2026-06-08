import { Link } from 'react-router-dom';

type Accent = 'rose' | 'amber' | 'default';

interface ModuleEntryCardProps {
  icon: string;
  title: string;
  description: string;
  to?: string;
  href?: string;
  accent?: Accent;
  large?: boolean;
}

const accentStyles: Record<Accent, { card: string; icon: string; arrow: string }> = {
  rose: {
    card: 'from-rose-50/90 to-white border-rose-100/80 hover:border-rose-200',
    icon: 'bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600/90',
    arrow: 'text-rose-500',
  },
  amber: {
    card: 'from-warm-50/90 to-white border-warm-200/80 hover:border-warm-300',
    icon: 'bg-gradient-to-br from-warm-100 to-warm-50 text-warm-600',
    arrow: 'text-warm-500',
  },
  default: {
    card: 'from-white to-white border-warm-100 hover:border-warm-200',
    icon: 'bg-warm-100 text-warm-600',
    arrow: 'text-warm-600',
  },
};

export function ModuleEntryCard({
  icon,
  title,
  description,
  to,
  href,
  accent = 'default',
  large = false,
}: ModuleEntryCardProps) {
  const styles = accentStyles[accent];

  const content = (
    <div
      className={[
        'group relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-card',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft',
        styles.card,
        large ? 'p-5' : 'p-4',
      ].join(' ')}
    >
      <div className="flex items-center gap-4">
        <div
          className={[
            'flex shrink-0 items-center justify-center rounded-2xl shadow-sm',
            styles.icon,
            large ? 'h-16 w-16 text-3xl' : 'h-14 w-14 text-2xl',
          ].join(' ')}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className={`font-semibold text-ink ${large ? 'text-xl' : 'text-lg'}`}>{title}</h2>
          <p className={`mt-1 text-ink/50 ${large ? 'text-sm leading-relaxed' : 'text-sm'}`}>
            {description}
          </p>
        </div>
        <span
          className={[
            'shrink-0 text-lg transition-transform duration-300 group-hover:translate-x-0.5',
            styles.arrow,
          ].join(' ')}
        >
          →
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
