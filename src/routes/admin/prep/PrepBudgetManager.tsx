import { useEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import {
  adminCreateBudgetItem,
  adminDeleteBudgetItem,
  adminFetchPrepBudget,
  adminUpdateBudgetItem,
} from '../../../lib/api';
import { BUDGET_STATUS_LABELS, formatMoney } from '../../../lib/prep';
import type { PrepBudgetItem } from '../../../lib/types';

const QUICK_CATEGORIES = ['婚宴', '摄影摄像', '婚纱礼服', '婚庆布置', '首饰', '其他'];

export function PrepBudgetManager() {
  const [items, setItems] = useState<PrepBudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await adminFetchPrepBudget();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function addItem(category = '未分类') {
    try {
      const item = await adminCreateBudgetItem({
        category,
        name: '新预算项',
        estimated_amount: 0,
        actual_amount: 0,
        status: 'planned',
      });
      setItems((prev) => [...prev, item]);
      setEditingId(item.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : '添加失败');
    }
  }

  async function removeItem(id: number) {
    if (!confirm('确定删除此项？')) return;
    try {
      await adminDeleteBudgetItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  }

  if (loading) return <p className="text-ink/40">加载中...</p>;

  const active = items.filter((i) => i.status !== 'cancelled');
  const estimated = active.reduce((s, i) => s + i.estimated_amount, 0);
  const actual = active.reduce((s, i) => s + i.actual_amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white px-4 py-3 shadow-card">
          <p className="text-xs text-ink/40">预估合计</p>
          <p className="font-semibold text-ink">{formatMoney(estimated)}</p>
        </div>
        <div className="rounded-xl bg-white px-4 py-3 shadow-card">
          <p className="text-xs text-ink/40">实际支出</p>
          <p className="font-semibold text-ink">{formatMoney(actual)}</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {QUICK_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => addItem(cat)}
            className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-600 transition-colors hover:bg-rose-100"
          >
            + {cat}
          </button>
        ))}
      </div>

      <Button size="sm" onClick={() => addItem()}>
        添加预算项
      </Button>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/40">暂无预算项，点击上方快速添加</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) =>
            editingId === item.id ? (
              <BudgetEditor
                key={item.id}
                item={item}
                onSave={(updated) => {
                  setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
                onDelete={() => removeItem(item.id)}
              />
            ) : (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-600">
                      {item.category || '未分类'}
                    </span>
                    <span className="text-xs text-ink/40">
                      {BUDGET_STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-ink">{item.name}</p>
                  <p className="mt-0.5 text-xs text-ink/50">
                    预估 {formatMoney(item.estimated_amount)} · 实际{' '}
                    {formatMoney(item.actual_amount)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setEditingId(item.id)}>
                    编辑
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => removeItem(item.id)}>
                    删
                  </Button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function BudgetEditor({
  item,
  onSave,
  onCancel,
  onDelete,
}: {
  item: PrepBudgetItem;
  onSave: (item: PrepBudgetItem) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated = await adminUpdateBudgetItem(item.id, form);
      onSave(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border-2 border-rose-200 bg-white p-4 shadow-card">
      <Input
        label="分类"
        value={form.category}
        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
      />
      <Input
        label="名称"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="预估（元）"
          type="number"
          min="0"
          value={form.estimated_amount}
          onChange={(e) =>
            setForm((f) => ({ ...f, estimated_amount: parseFloat(e.target.value) || 0 }))
          }
        />
        <Input
          label="实际（元）"
          type="number"
          min="0"
          value={form.actual_amount}
          onChange={(e) =>
            setForm((f) => ({ ...f, actual_amount: parseFloat(e.target.value) || 0 }))
          }
        />
      </div>
      <label className="block text-sm text-ink/60">
        状态
        <select
          className="mt-1 w-full rounded-xl border border-warm-200 bg-white px-3 py-2"
          value={form.status}
          onChange={(e) =>
            setForm((f) => ({ ...f, status: e.target.value as PrepBudgetItem['status'] }))
          }
        >
          {Object.entries(BUDGET_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          取消
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>
          删除
        </Button>
      </div>
    </div>
  );
}
