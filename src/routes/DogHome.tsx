import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { PageStatus } from '../components/PageStatus';
import { Timeline } from '../components/Timeline';
import { fetchPet, fetchTimeline } from '../lib/api';
import { calcAge, daysBetween, formatDate } from '../lib/date';
import type { PetProfile, TimelineNode } from '../lib/types';

export function DogHome() {
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [nodes, setNodes] = useState<TimelineNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchPet(), fetchTimeline({ order: 'desc', limit: 5 })])
      .then(([petData, timelineData]) => {
        setPet(petData);
        setNodes(timelineData.nodes);
      })
      .catch((err) => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <PageStatus message="加载中..." />;
  }

  if (!pet) {
    return (
      <div className="page-container min-h-dvh">
        <Link to="/" className="mb-4 inline-block text-sm text-warm-600">
          ← 返回首页
        </Link>
        <PageStatus
          message={error || '暂无狗狗信息'}
          hint="请确认开发服务已启动，并执行 npm run db:migrate:local"
        />
      </div>
    );
  }

  const age = calcAge(pet.birthday);
  const companionDays = daysBetween(pet.home_date);

  return (
    <div className="page-container min-h-dvh">
      <Link to="/" className="mb-4 inline-block text-sm text-warm-600">
        ← 返回首页
      </Link>

      <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="flex flex-col items-center p-6">
          {pet.avatar_url ? (
            <img
              src={pet.avatar_url}
              alt={pet.name}
              className="h-28 w-28 rounded-full object-cover ring-4 ring-warm-100"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-warm-100 text-5xl">
              🐾
            </div>
          )}
          <h1 className="mt-4 text-2xl font-bold text-ink">{pet.name}</h1>
          <div className="mt-1 flex gap-2 text-sm text-ink/50">
            {pet.breed && <span>{pet.breed}</span>}
            {pet.gender && <span>· {pet.gender}</span>}
          </div>
          {pet.description && (
            <p className="mt-3 text-center text-sm text-ink/60">{pet.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-px bg-warm-100">
          <StatItem label="出生日期" value={pet.birthday ? formatDate(pet.birthday) : '未设置'} />
          <StatItem label="到家日期" value={pet.home_date ? formatDate(pet.home_date) : '未设置'} />
          <StatItem label="当前年龄" value={age} />
          <StatItem
            label="陪伴天数"
            value={companionDays !== null ? `${companionDays} 天` : '未设置'}
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">成长时间轴</h2>
        <Link to="/dog/timeline">
          <Button variant="ghost" size="sm">
            查看全部 →
          </Button>
        </Link>
      </div>

      <Timeline nodes={nodes} />
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-4 py-3 text-center">
      <p className="text-xs text-ink/40">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
