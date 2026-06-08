import type { TimelineNode } from '../lib/types';
import { TimelineNodeCard } from './TimelineNodeCard';

interface TimelineProps {
  nodes: TimelineNode[];
  showFull?: boolean;
}

export function Timeline({ nodes, showFull }: TimelineProps) {
  if (nodes.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-card">
        <p className="text-4xl">🐕</p>
        <p className="mt-3 text-ink/50">还没有记录，快去添加第一个成长瞬间吧</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {nodes.map((node, index) => (
        <TimelineNodeCard
          key={node.id}
          node={node}
          showFull={showFull}
          isLast={index === nodes.length - 1}
        />
      ))}
    </div>
  );
}
