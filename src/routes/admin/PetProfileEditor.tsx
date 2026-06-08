import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { adminFetchPet, adminUpdatePet } from '../../lib/api';
import type { PetProfile } from '../../lib/types';

export function PetProfileEditor() {
  const [form, setForm] = useState<Partial<PetProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminFetchPet()
      .then(setForm)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function update(field: keyof PetProfile, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const updated = await adminUpdatePet(form);
      setForm(updated);
      setMessage('保存成功');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-ink/40">加载中...</p>;

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-ink">编辑狗狗信息</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="名字"
          value={form.name || ''}
          onChange={(e) => update('name', e.target.value)}
          required
        />
        <Input
          label="头像 URL"
          value={form.avatar_url || ''}
          onChange={(e) => update('avatar_url', e.target.value)}
          placeholder="https://..."
        />
        <Input
          label="生日"
          type="date"
          value={form.birthday || ''}
          onChange={(e) => update('birthday', e.target.value)}
        />
        <Input
          label="到家日期"
          type="date"
          value={form.home_date || ''}
          onChange={(e) => update('home_date', e.target.value)}
        />
        <Input
          label="品种"
          value={form.breed || ''}
          onChange={(e) => update('breed', e.target.value)}
        />
        <Input
          label="性别"
          value={form.gender || ''}
          onChange={(e) => update('gender', e.target.value)}
          placeholder="男孩 / 女孩"
        />
        <Textarea
          label="简介"
          value={form.description || ''}
          onChange={(e) => update('description', e.target.value)}
        />

        {message && (
          <p className={`text-sm ${message === '保存成功' ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </form>
    </div>
  );
}
