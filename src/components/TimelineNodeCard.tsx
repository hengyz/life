import { Link } from 'react-router-dom';
import { formatDate, formatShortDate } from '../lib/date';
import type { TimelineNode } from '../lib/types';
import { MediaGrid } from './MediaGrid';

interface TimelineNodeCardProps {
  node: TimelineNode;
  showFull?: boolean;
  isLast?: boolean;
}

export function TimelineNodeCard({ node, showFull, isLast }: TimelineNodeCardProps) {
  const images = node.media?.filter((m) => m.type === 'image') || [];
  const previewImage = node.cover_url || images[0]?.url;

  const card = (
    <div className="relative ml-10 pb-8">
      <div className="timeline-dot" />
      {!isLast && <div className="timeline-line" style={{ top: '1.5rem', height: 'calc(100% - 1.5rem)' }} />}

      <div className="rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-soft">
        <div className="mb-2 flex items-start justify-between gap-2">
          <time className="text-sm font-medium text-warm-600">
            {showFull ? formatDate(node.event_date) : formatShortDate(node.event_date)}
          </time>
          {node.visibility === 'private' && (
            <span className="rounded-full bg-warm-100 px-2 py-0.5 text-xs text-warm-600">
              私密
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-ink">{node.title}</h3>

        {node.location && (
          <p className="mt-1 text-sm text-ink/50">📍 {node.location}</p>
        )}

        {node.content && (
          <p
            className={`mt-2 text-sm leading-relaxed text-ink/70 ${
              showFull ? '' : 'line-clamp-3'
            }`}
          >
            {node.content}
          </p>
        )}

        {node.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-warm-50 px-2.5 py-0.5 text-xs text-warm-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {previewImage && !showFull && (
          <div className="mt-3 overflow-hidden rounded-xl">
            <img
              src={previewImage}
              alt=""
              className="h-36 w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {showFull && node.media && node.media.length > 0 && (
          <div className="mt-3">
            <MediaGrid media={node.media} />
          </div>
        )}
      </div>
    </div>
  );

  if (showFull) return card;

  return <Link to={`/dog/timeline/${node.id}`}>{card}</Link>;
}
