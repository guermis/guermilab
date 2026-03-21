import { useRef, useState, useCallback } from 'react';
import { useInView } from '@/hooks/useInView';

interface VideoScrubberProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoScrubber({ src, poster, className = '' }: VideoScrubberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const { ref: viewRef, isInView } = useInView();

  const scrub = useCallback((clientX: number) => {
    if (!containerRef.current || !videoRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setProgress(pct);
    videoRef.current.currentTime = pct * videoRef.current.duration;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsScrubbing(true);
    scrub(e.clientX);
  }, [scrub]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isScrubbing) scrub(e.clientX);
  }, [isScrubbing, scrub]);

  const handleMouseUp = useCallback(() => {
    setIsScrubbing(false);
  }, []);

  return (
    <div ref={viewRef}>
      <div
        ref={containerRef}
        data-cursor="scrub"
        data-cursor-label="Scrub"
        className={`relative overflow-hidden rounded-sm select-none ${className}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          playsInline
          preload={isInView ? 'metadata' : 'none'}
          onLoadedMetadata={() => setIsReady(true)}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* Scrub progress bar */}
        {isReady && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30">
            <div
              className="h-full bg-primary transition-[width] duration-75"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {/* Timecode */}
        {isReady && isScrubbing && videoRef.current && (
          <div className="absolute top-3 right-3 bg-background/80 rounded-sm px-2 py-1">
            <span className="text-[10px] font-mono text-primary tracking-wider">
              {formatTime(videoRef.current.currentTime)} / {formatTime(videoRef.current.duration)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
