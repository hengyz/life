import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageStatus } from '../../components/PageStatus';
import { fetchPrepChecklist } from '../../lib/api';
import { formatDate } from '../../lib/date';
import { groupByCategory } from '../../lib/prep';
import type { PrepChecklistItem } from '../../lib/types';

export function PrepChecklist() {
  const [items, setItems] = useState<PrepChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrepChecklist()
      .then((data) => setItems(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageStatus message="加载中..." />;

  const completed = items.filter((i) => i.completed).length;
  const grouped = groupByCategory(items);

  return (
    <div className="page-container min-h-dvh">
      <Link to="/prep" className="mb-4 inline-block text-sm text-warm-600">
        ← 返回备婚
      </Link>

      <h1 className="mb-2 text-xl font-bold text-ink">计划清单</h1>
      <p className="mb-4 text-sm text-ink/50">
        已完成 {completed} / {items.length} 项
      </p>

      {error && (
        <p className="mb-4 rounded-xl bg-warm-100 px-4 py-3 text-sm text-warm-800">{error}</p>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink/40 shadow-card">
          暂无计划项，可在管理后台添加
        </p>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([category, categoryItems]) => (
            <section key={category}>
              <h2 className="mb-2 font-semibold text-ink">{category}</h2>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 rounded-xl bg-white p-4 shadow-card ${
                      item.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                        item.completed
                          ? 'bg-warm-500 text-white'
                          : 'border-2 border-warm-300 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-medium text-ink ${
                          item.completed ? 'line-through' : ''
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.due_date && (
                        <p className="mt-0.5 text-xs text-ink/40">
                          截止 {formatDate(item.due_date)}
                        </p>
                      )}
                      {item.notes && (
                        <p className="mt-0.5 text-xs text-ink/50">{item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
