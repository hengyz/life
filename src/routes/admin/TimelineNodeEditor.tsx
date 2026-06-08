import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import {
  adminCreateNode,
  adminFetchTimeline,
  adminUpdateNode,
} from '../../lib/api';
import type { MediaInput, TimelineNode } from '../../lib/types';

interface MediaFormItem {
  type: 'image' | 'video';
  url: string;
  caption: string;
}

export function TimelineNodeEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [sortOrder, setSortOrder] = useState(0);
  const [media, setMedia] = useState<MediaFormItem[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;

    adminFetchTimeline()
      .then((data) => {
        const node = data.nodes.find((n) => n.id === parseInt(id!, 10));
        if (!node) {
          setError('记录不存在');
          return;
        }
        fillForm(node);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function fillForm(node: TimelineNode) {
    setTitle(node.title);
    setContent(node.content);
    setEventDate(node.event_date);
    setLocation(node.location);
    setTags(node.tags.join(', '));
    setCoverUrl(node.cover_url);
    setVisibility(node.visibility);
    setSortOrder(node.sort_order);
    setMedia(
      (node.media || []).map((m) => ({
        type: m.type,
        url: m.url,
        caption: m.caption,
      })),
    );
  }

  function addMedia(type: 'image' | 'video') {
    setMedia((prev) => [...prev, { type, url: '', caption: '' }]);
  }

  function updateMedia(index: number, field: keyof MediaFormItem, value: string) {
    setMedia((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function removeMedia(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eventDate || !title) {
      setError('请填写日期和标题');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title,
      content,
      event_date: eventDate,
      location,
      tags: tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean),
      cover_url: coverUrl,
      visibility,
      sort_order: sortOrder,
      media: media
        .filter((m) => m.url.trim())
        .map(
          (m, i): MediaInput => ({
            type: m.type,
            url: m.url.trim(),
            caption: m.caption,
            sort_order: i,
          }),
        ),
    };

    try {
      if (isNew) {
        await adminCreateNode(payload);
      } else {
        await adminUpdateNode(parseInt(id!, 10), payload);
      }
      navigate('/gy-admin/timeline');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-ink/40">加载中...</p>;

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-ink">
        {isNew ? '新增时间节点' : '编辑时间节点'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="日期"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />
        <Input
          label="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          label="正文"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Input
          label="地点"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Input
          label="标签"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="用逗号分隔，如：第一次洗澡,疫苗"
        />
        <Input
          label="封面图 URL"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://..."
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">可见性</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
              />
              公开
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
              />
              私密
            </label>
          </div>
        </div>

        <Input
          label="排序权重"
          type="number"
          value={String(sortOrder)}
          onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-ink/80">媒体</label>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => addMedia('image')}>
                + 图片
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => addMedia('video')}>
                + 视频
              </Button>
            </div>
          </div>

          {media.map((item, index) => (
            <div key={index} className="mb-3 rounded-xl border border-warm-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-ink/50">
                  {item.type === 'image' ? '图片' : '视频'} #{index + 1}
                </span>
                <button
                  type="button"
                  className="text-xs text-red-500"
                  onClick={() => removeMedia(index)}
                >
                  移除
                </button>
              </div>
              <Input
                label="URL"
                value={item.url}
                onChange={(e) => updateMedia(index, 'url', e.target.value)}
                placeholder="https://..."
              />
              <div className="mt-2">
                <Input
                  label="说明"
                  value={item.caption}
                  onChange={(e) => updateMedia(index, 'caption', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" fullWidth disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/gy-admin/timeline')}
          >
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}
