import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/Button';
import {
  adminFetchPrep,
  adminFetchPrepBudget,
  adminFetchPrepChecklist,
} from '../../../lib/api';
import { daysUntil, formatMoney } from '../../../lib/prep';
import { formatDate } from '../../../lib/date';
import type { PrepBudgetItem, PrepChecklistItem, PrepProfile } from '../../../lib/types';

export function PrepDashboard() {
  const [profile, setProfile] = useState<PrepProfile | null>(null);
  const [budgetItems, setBudgetItems] = useState<PrepBudgetItem[]>([]);
  const [checklistItems, setChecklistItems] = useState<PrepChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminFetchPrep(), adminFetchPrepBudget(), adminFetchPrepChecklist()])
      .then(([p, b, c]) => {
        setProfile(p);
        setBudgetItems(b.items);
        setChecklistItems(c.items);
      })
      .catch((err) => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ink/40">加载中...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!profile) return null;

  const activeBudget = budgetItems.filter((i) => i.status !== 'cancelled');
  const estimated = activeBudget.reduce((s, i) => s + i.estimated_amount, 0);
  const actual = activeBudget.reduce((s, i) => s + i.actual_amount, 0);
  const completed = checklistItems.filter((i) => i.completed).length;
  const countdown = daysUntil(profile.wedding_date);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-ink">{profile.title}</h2>
        {profile.wedding_date ? (
          <p className="mt-1 text-sm text-ink/60">
            婚礼 {formatDate(profile.wedding_date)}
            {countdown !== null && (
              <span className="ml-2 text-rose-600">
                {countdown > 0 ? `还有 ${countdown} 天` : countdown === 0 ? '就是今天' : '已过'}
              </span>
            )}
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink/40">尚未设置婚礼日期</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="预算项" value={String(activeBudget.length)} />
        <StatCard label="计划项" value={String(checklistItems.length)} />
        <StatCard label="预估合计" value={formatMoney(estimated)} />
        <StatCard label="实际支出" value={formatMoney(actual)} />
        <StatCard
          label="计划完成"
          value={`${completed}/${checklistItems.length}`}
          className="col-span-2"
        />
      </div>

      <div className="space-y-2">
        <Link to="/admin/prep/profile">
          <Button variant="secondary" fullWidth>
            编辑基本信息
          </Button>
        </Link>
        <Link to="/admin/prep/budget">
          <Button variant="secondary" fullWidth>
            管理预算
          </Button>
        </Link>
        <Link to="/admin/prep/checklist">
          <Button fullWidth>管理计划清单</Button>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-card ${className}`}>
      <p className="text-xs text-ink/40">{label}</p>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}
