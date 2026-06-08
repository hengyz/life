import { useEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Textarea } from '../../../components/Textarea';
import { adminFetchPrep, adminUpdatePrep } from '../../../lib/api';
import type { PrepProfile } from '../../../lib/types';

export function PrepProfileEditor() {
  const [form, setForm] = useState<Partial<PrepProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminFetchPrep()
      .then(setForm)
      .catch((err) => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updated = await adminUpdatePrep({
        title: form.title,
        wedding_date: form.wedding_date,
        total_budget: form.total_budget,
        description: form.description,
      });
      setForm(updated);
      setMessage('保存成功');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-ink/40">加载中...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-4 shadow-card">
      <h2 className="font-semibold text-ink">基本信息</h2>

      {message && (
        <p className="rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700">{message}</p>
      )}
      {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <Input
        label="标题"
        value={form.title || ''}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        placeholder="备婚规划"
      />
      <Input
        label="婚礼日期"
        type="date"
        value={form.wedding_date || ''}
        onChange={(e) => setForm((f) => ({ ...f, wedding_date: e.target.value }))}
      />
      <Input
        label="总预算（元）"
        type="number"
        min="0"
        step="100"
        value={form.total_budget ?? ''}
        onChange={(e) =>
          setForm((f) => ({ ...f, total_budget: parseFloat(e.target.value) || 0 }))
        }
        placeholder="例如 100000"
      />
      <Textarea
        label="简介"
        value={form.description || ''}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="婚礼前的计划安排与预算管理"
      />
      <Button type="submit" fullWidth disabled={saving}>
        {saving ? '保存中...' : '保存'}
      </Button>
    </form>
  );
}
