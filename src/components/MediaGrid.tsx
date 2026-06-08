import { useState } from 'react';
import type { TimelineMedia } from '../lib/types';
import { VideoPlayer } from './VideoPlayer';

interface MediaGridProps {
  media: TimelineMedia[];
  compact?: boolean;
}

export function MediaGrid({ media, compact }: MediaGridProps) {
  const [preview, setPreview] = useState<string | null>(null);

  if (!media.length) return null;

  const images = media.filter((m) => m.type === 'image');
  const videos = media.filter((m) => m.type === 'video');

  const gridClass = compact
    ? 'grid grid-cols-3 gap-1.5'
    : images.length === 1
      ? 'grid grid-cols-1'
      : images.length === 2
        ? 'grid grid-cols-2 gap-2'
        : 'grid grid-cols-3 gap-2';

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className={gridClass}>
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setPreview(img.url)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-warm-100"
            >
              <img
                src={img.url}
                alt={img.caption || ''}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {videos.map((vid) => (
        <VideoPlayer
          key={vid.id}
          src={vid.url}
          poster={vid.thumbnail_url || undefined}
          caption={vid.caption || undefined}
        />
      ))}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreview(null)}
        >
          <img
            src={preview}
            alt="预览"
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-white"
            onClick={() => setPreview(null)}
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
