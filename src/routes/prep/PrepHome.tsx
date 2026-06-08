import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ModuleEntryCard } from '../../components/ModuleEntryCard';
import { PageStatus } from '../../components/PageStatus';
import { fetchPrepOverview } from '../../lib/api';
import { isLoggedIn } from '../../lib/auth';
import { daysUntil, formatMoney } from '../../lib/prep';
import type { PrepOverview } from '../../lib/types';
import { formatDate } from '../../lib/date';

export function PrepHome() {
  const [data, setData] = useState<PrepOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrepOverview()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageStatus message="加载中..." />;

  if (error || !data) {
    return (
      <div className="page-container min-h-dvh">
        <Link to="/" className="mb-4 inline-block text-sm text-warm-600">
          ← 返回首页
        </Link>
        <PageStatus message={error || '暂无备婚数据'} />
      </div>
    );
  }

  const { profile, budget, checklist } = data;
  const countdown = daysUntil(profile.wedding_date);
  const budgetProgress =
    profile.total_budget > 0
      ? Math.min(100, Math.round((budget.estimated / profile.total_budget) * 100))
      : 0;
  const checklistProgress =
    checklist.total > 0 ? Math.round((checklist.completed / checklist.total) * 100) : 0;

  return (
    <div className="page-container min-h-dvh">
      <Link to="/" className="mb-4 inline-block text-sm text-warm-600">
        ← 返回首页
      </Link>

      {isLoggedIn() && (
        <div className="mb-4 flex justify-end">
          <Link
            to="/gy-admin/prep"
            className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-600 transition-colors hover:bg-rose-100"
          >
            管理后台
          </Link>
        </div>
      )}

      <header className="mb-6 text-center">
        <div className="text-4xl">💍</div>
        <h1 className="mt-2 text-2xl font-bold text-ink">{profile.title}</h1>
        <p className="mt-1 text-sm text-ink/50">
          {profile.description || '婚礼前的计划安排与预算管理'}
        </p>
      </header>

      {profile.wedding_date && (
        <div className="mb-6 rounded-2xl bg-white p-5 text-center shadow-card">
          <p className="text-xs text-ink/40">婚礼日期</p>
          <p className="mt-1 text-lg font-semibold text-ink">
            {formatDate(profile.wedding_date)}
          </p>
          {countdown !== null && (
            <p className="mt-2 text-sm text-warm-600">
              {countdown > 0
                ? `还有 ${countdown} 天`
                : countdown === 0
                  ? '就是今天！'
                  : `已过 ${Math.abs(countdown)} 天`}
            </p>
          )}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard
          label="预算预估"
          value={formatMoney(budget.estimated)}
          sub={
            profile.total_budget > 0
              ? `总预算 ${formatMoney(profile.total_budget)}`
              : undefined
          }
          progress={budgetProgress}
        />
        <StatCard
          label="计划进度"
          value={`${checklist.completed}/${checklist.total}`}
          sub={checklist.total > 0 ? `${checklistProgress}% 已完成` : '暂无计划'}
          progress={checklistProgress}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">备婚工具</h2>
        <ModuleEntryCard
          icon="💰"
          title="预算规划"
          description="分项记录预估与实际支出"
          to="/prep/budget"
        />
        <ModuleEntryCard
          icon="📋"
          title="计划清单"
          description="备婚事项与时间节点"
          to="/prep/checklist"
        />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  progress,
}: {
  label: string;
  value: string;
  sub?: string;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <p className="text-xs text-ink/40">{label}</p>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink/50">{sub}</p>}
      {progress !== undefined && progress > 0 && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-warm-100">
          <div
            className="h-full rounded-full bg-warm-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
