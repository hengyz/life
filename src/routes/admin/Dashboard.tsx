import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { adminFetchPet, adminFetchTimeline } from '../../lib/api';
import type { PetProfile, TimelineNode } from '../../lib/types';

export function AdminDashboard() {
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [nodes, setNodes] = useState<TimelineNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminFetchPet(), adminFetchTimeline()])
      .then(([petData, timelineData]) => {
        setPet(petData);
        setNodes(timelineData.nodes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-ink/40">加载中...</p>;
  }

  const publicCount = nodes.filter((n) => n.visibility === 'public').length;
  const privateCount = nodes.filter((n) => n.visibility === 'private').length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink">管理概览</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="总记录" value={String(nodes.length)} />
        <StatCard label="公开" value={String(publicCount)} />
        <StatCard label="私密" value={String(privateCount)} />
        <StatCard label="狗狗" value={pet?.name || '-'} />
      </div>

      <div className="space-y-3">
        <Link to="/gy-admin/timeline/new">
          <Button fullWidth>新增时间节点</Button>
        </Link>
        <Link to="/gy-admin/pet">
          <Button variant="secondary" fullWidth>
            编辑狗狗信息
          </Button>
        </Link>
        <Link to="/gy-admin/timeline">
          <Button variant="ghost" fullWidth>
            管理时间轴
          </Button>
        </Link>
        <Link to="/gy-admin/prep">
          <Button variant="secondary" fullWidth>
            管理备婚规划
          </Button>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <p className="text-xs text-ink/40">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
