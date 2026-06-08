import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Timeline } from '../components/Timeline';
import { fetchTimeline } from '../lib/api';
import type { TimelineNode } from '../lib/types';

export function DogTimeline() {
  const [nodes, setNodes] = useState<TimelineNode[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadTimeline = useCallback(async (reset = false, currentCursor?: string | null) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await fetchTimeline({
        order,
        limit: 20,
        cursor: reset ? undefined : currentCursor || undefined,
      });

      setNodes((prev) => (reset ? data.nodes : [...prev, ...data.nodes]));
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [order]);

  useEffect(() => {
    setCursor(null);
    loadTimeline(true);
  }, [order, loadTimeline]);

  function toggleOrder() {
    setOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
  }

  if (loading) {
    return (
      <div className="page-container flex min-h-dvh items-center justify-center">
        <p className="text-ink/40">加载中...</p>
      </div>
    );
  }

  return (
    <div className="page-container min-h-dvh">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/dog" className="text-sm text-warm-600">
          ← 返回
        </Link>
        <Button variant="secondary" size="sm" onClick={toggleOrder}>
          {order === 'desc' ? '最新在前' : '最早在前'}
        </Button>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-ink">成长时间轴</h1>

      <Timeline nodes={nodes} />

      {hasMore && (
        <div className="mt-4 text-center">
          <Button
            variant="secondary"
            onClick={() => loadTimeline(false, cursor)}
            disabled={loadingMore}
          >
            {loadingMore ? '加载中...' : '加载更多'}
          </Button>
        </div>
      )}
    </div>
  );
}
