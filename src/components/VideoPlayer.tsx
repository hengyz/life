interface VideoPlayerProps {
  src: string;
  poster?: string;
  caption?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, caption, className = '' }: VideoPlayerProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <video
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-xl bg-black/5"
      />
      {caption && <p className="text-center text-xs text-ink/50">{caption}</p>}
    </div>
  );
}
