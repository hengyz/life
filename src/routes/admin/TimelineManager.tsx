import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { adminDeleteNode, adminFetchTimeline } from '../../lib/api';
import { formatShortDate } from '../../lib/date';
import type { TimelineNode } from '../../lib/types';

export function TimelineManager() {
  const [nodes, setNodes] = useState<TimelineNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetchTimeline()
      .then((data) => setNodes(data.nodes))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('确定删除这条记录吗？')) return;
    try {
      await adminDeleteNode(id);
      setNodes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  }

  if (loading) return <p className="text-ink/40">加载中...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">时间轴管理</h1>
        <Link to="/admin/timeline/new">
          <Button size="sm">新增</Button>
        </Link>
      </div>

      {nodes.length === 0 ? (
        <p className="text-center text-ink/40">暂无记录</p>
      ) : (
        <div className="space-y-3">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <time className="text-xs text-warm-600">
                    {formatShortDate(node.event_date)}
                  </time>
                  {node.visibility === 'private' && (
                    <span className="rounded bg-warm-100 px-1.5 py-0.5 text-xs text-warm-600">
                      私密
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate font-medium text-ink">{node.title}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link to={`/admin/timeline/${node.id}`}>
                  <Button variant="secondary" size="sm">
                    编辑
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => handleDelete(node.id)}>
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
