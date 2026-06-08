import { useEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import {
  adminCreateChecklistItem,
  adminDeleteChecklistItem,
  adminFetchPrepChecklist,
  adminUpdateChecklistItem,
} from '../../../lib/api';
import { formatShortDate } from '../../../lib/date';
import type { PrepChecklistItem } from '../../../lib/types';

const QUICK_CATEGORIES = ['场地', '人员', '物品', '流程', '其他'];

export function PrepChecklistManager() {
  const [items, setItems] = useState<PrepChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    adminFetchPrepChecklist()
      .then((data) => setItems(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  async function addItem(category = '未分类') {
    try {
      const item = await adminCreateChecklistItem({
        category,
        title: '新计划项',
        completed: false,
      });
      setItems((prev) => [...prev, item]);
      setEditingId(item.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : '添加失败');
    }
  }

  async function toggleComplete(item: PrepChecklistItem) {
    try {
      const updated = await adminUpdateChecklistItem(item.id, {
        completed: !item.completed,
      });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新失败');
    }
  }

  async function removeItem(id: number) {
    if (!confirm('确定删除此项？')) return;
    try {
      await adminDeleteChecklistItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  }

  if (loading) return <p className="text-ink/40">加载中...</p>;

  const completed = items.filter((i) => i.completed).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white px-4 py-3 shadow-card">
        <p className="text-xs text-ink/40">完成进度</p>
        <p className="font-semibold text-ink">
          {completed} / {items.length} 项
          {items.length > 0 && (
            <span className="ml-2 text-sm font-normal text-rose-600">
              {Math.round((completed / items.length) * 100)}%
            </span>
          )}
        </p>
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
        添加计划项
      </Button>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/40">暂无计划项，点击上方快速添加</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) =>
            editingId === item.id ? (
              <ChecklistEditor
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
                className={`flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ${
                  item.completed ? 'opacity-70' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleComplete(item)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs transition-colors ${
                    item.completed
                      ? 'bg-rose-500 text-white'
                      : 'border-2 border-rose-200 text-transparent hover:border-rose-400'
                  }`}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-600">
                      {item.category || '未分类'}
                    </span>
                    {item.due_date && (
                      <span className="text-xs text-ink/40">{formatShortDate(item.due_date)}</span>
                    )}
                  </div>
                  <p
                    className={`mt-1 font-medium text-ink ${item.completed ? 'line-through' : ''}`}
                  >
                    {item.title}
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

function ChecklistEditor({
  item,
  onSave,
  onCancel,
  onDelete,
}: {
  item: PrepChecklistItem;
  onSave: (item: PrepChecklistItem) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated = await adminUpdateChecklistItem(item.id, form);
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
        label="事项"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
      />
      <Input
        label="截止日期"
        type="date"
        value={form.due_date}
        onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
      />
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={form.completed}
          onChange={(e) => setForm((f) => ({ ...f, completed: e.target.checked }))}
        />
        已完成
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
