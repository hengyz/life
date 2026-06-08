import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageStatus } from '../../components/PageStatus';
import { fetchPrepBudget, fetchPrepOverview } from '../../lib/api';
import { BUDGET_STATUS_LABELS, formatMoney, groupByCategory } from '../../lib/prep';
import type { PrepBudgetItem } from '../../lib/types';

export function PrepBudget() {
  const [items, setItems] = useState<PrepBudgetItem[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchPrepBudget(), fetchPrepOverview()])
      .then(([budgetData, overview]) => {
        setItems(budgetData.items);
        setTotalBudget(overview.profile.total_budget);
      })
      .catch((err) => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageStatus message="加载中..." />;

  const active = items.filter((i) => i.status !== 'cancelled');
  const estimated = active.reduce((sum, i) => sum + i.estimated_amount, 0);
  const actual = active.reduce((sum, i) => sum + i.actual_amount, 0);
  const grouped = groupByCategory(active);

  return (
    <div className="page-container min-h-dvh">
      <Link to="/prep" className="mb-4 inline-block text-sm text-warm-600">
        ← 返回备婚
      </Link>

      <h1 className="mb-4 text-xl font-bold text-ink">预算规划</h1>

      {error && (
        <p className="mb-4 rounded-xl bg-warm-100 px-4 py-3 text-sm text-warm-800">{error}</p>
      )}

      <div className="mb-6 grid grid-cols-3 gap-2">
        <SummaryItem label="总预算" value={totalBudget > 0 ? formatMoney(totalBudget) : '未设置'} />
        <SummaryItem label="预估合计" value={formatMoney(estimated)} />
        <SummaryItem label="实际支出" value={formatMoney(actual)} />
      </div>

      {active.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink/40 shadow-card">
          暂无预算项，可在管理后台添加
        </p>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([category, categoryItems]) => {
            const catEstimated = categoryItems.reduce((s, i) => s + i.estimated_amount, 0);
            const catActual = categoryItems.reduce((s, i) => s + i.actual_amount, 0);

            return (
              <section key={category}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="font-semibold text-ink">{category}</h2>
                  <span className="text-xs text-ink/40">
                    {formatMoney(catEstimated)} / {formatMoney(catActual)}
                  </span>
                </div>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="rounded-xl bg-white p-4 shadow-card">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-ink">{item.name}</p>
                          {item.notes && (
                            <p className="mt-0.5 text-xs text-ink/50">{item.notes}</p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                            item.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'cancelled'
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-warm-100 text-warm-700'
                          }`}
                        >
                          {BUDGET_STATUS_LABELS[item.status]}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-4 text-sm text-ink/60">
                        <span>预估 {formatMoney(item.estimated_amount)}</span>
                        <span>实际 {formatMoney(item.actual_amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-3 text-center shadow-card">
      <p className="text-xs text-ink/40">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
