import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MediaGrid } from '../components/MediaGrid';
import { fetchTimelineNode } from '../lib/api';
import { formatDate } from '../lib/date';
import type { TimelineNode } from '../lib/types';

export function TimelineDetail() {
  const { id } = useParams<{ id: string }>();
  const [node, setNode] = useState<TimelineNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchTimelineNode(parseInt(id, 10))
      .then(setNode)
      .catch((err) => setError(err.message || '加载失败'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container flex min-h-dvh items-center justify-center">
        <p className="text-ink/40">加载中...</p>
      </div>
    );
  }

  if (error || !node) {
    return (
      <div className="page-container min-h-dvh">
        <Link to="/dog/timeline" className="text-sm text-warm-600">
          ← 返回时间轴
        </Link>
        <p className="mt-8 text-center text-ink/50">{error || '记录不存在'}</p>
      </div>
    );
  }

  return (
    <div className="page-container min-h-dvh">
      <Link to="/dog/timeline" className="mb-6 inline-block text-sm text-warm-600">
        ← 返回时间轴
      </Link>

      <article className="overflow-hidden rounded-2xl bg-white shadow-card">
        {node.cover_url && (
          <img
            src={node.cover_url}
            alt=""
            className="h-48 w-full object-cover"
          />
        )}

        <div className="p-5">
          <time className="text-sm font-medium text-warm-600">
            {formatDate(node.event_date)}
          </time>
          <h1 className="mt-2 text-2xl font-bold text-ink">{node.title}</h1>

          {node.location && (
            <p className="mt-2 text-sm text-ink/50">📍 {node.location}</p>
          )}

          {node.content && (
            <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-ink/80">
              {node.content}
            </p>
          )}

          {node.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {node.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-warm-50 px-3 py-1 text-sm text-warm-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {node.media && node.media.length > 0 && (
            <div className="mt-6">
              <MediaGrid media={node.media} />
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
