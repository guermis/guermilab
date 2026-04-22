import { useState, useRef } from 'react';
import { Play, Clock, Image as ImageIcon } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface StreamingCardProps {
  slug: string;
  title: string;
  category: string;
  client?: string;
  thumbnail: string;
  duration?: string;
  videoUrl?: string;
  aspect?: '16:9' | '9:16' | '3:4';
  index: number;
  isPhotography?: boolean;
  onCardClick?: () => void;
}

const ASPECT_STYLES: Record<string, { width: string; ratio: string }> = {
  '16:9': { width: 'w-[300px] md:w-[340px]', ratio: 'aspect-video' },
  '9:16': { width: 'w-[180px] md:w-[210px]', ratio: 'aspect-[9/16]' },
  '3:4':  { width: 'w-[220px] md:w-[260px]', ratio: 'aspect-[3/4]' },
};

export function StreamingCard({ slug, title, category, client, thumbnail, duration, videoUrl, aspect = '16:9', index, isPhotography = false, onCardClick }: StreamingCardProps) {
  const { ref, isInView } = useInView();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { width, ratio } = ASPECT_STYLES[aspect] || ASPECT_STYLES['16:9'];

  const handleClick = () => {
    if (onCardClick) {
      onCardClick();
    }
  };

  return (
    <div
      ref={ref}
      className={`snap-start shrink-0 ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        ref={cardRef}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative cursor-pointer group ${width}`}
      >
        {/* Thumbnail container — only the image zooms on hover */}
        <div className={`relative overflow-hidden rounded-2xl ${ratio}`}>
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[700ms] ease-out"
            style={{ transform: isHovered ? 'scale(1.04)' : 'scale(1)' }}
          />

          {/* Subtle bottom gradient for badge legibility */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsla(0,0%,0%,0.35)] via-transparent to-transparent" />

          {/* Border refinement on hover */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-shadow duration-[500ms] ease-out"
            style={{
              boxShadow: isHovered
                ? 'inset 0 0 0 1px hsla(0, 0%, 100%, 0.14), 0 12px 32px -10px hsla(0, 0%, 0%, 0.55)'
                : 'inset 0 0 0 1px hsla(0, 0%, 100%, 0.04), 0 4px 14px -6px hsla(0, 0%, 0%, 0.3)',
            }}
          />

          {/* Center play / album icon (no title overlay) */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-[500ms] ease-out pointer-events-none"
            style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'scale(1)' : 'scale(0.85)' }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsla(0,0%,100%,0.15)] backdrop-blur-xl border border-[hsla(0,0%,100%,0.15)]">
              {isPhotography ? (
                <ImageIcon className="h-5 w-5 text-foreground" />
              ) : (
                <Play className="h-5 w-5 text-foreground ml-0.5" fill="currentColor" />
              )}
            </div>
          </div>

          {/* Duration badge (video only) */}
          {duration && !isPhotography && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[hsla(0,0%,0%,0.55)] backdrop-blur-lg rounded-lg px-2.5 py-1 border border-[hsla(0,0%,100%,0.06)]">
              <Clock className="h-3 w-3 text-foreground/60" />
              <span className="text-[10px] text-foreground/60 font-medium">{duration}</span>
            </div>
          )}
        </div>

        {/* Title — ALWAYS below the card, never overlays the thumbnail */}
        <div className="mt-3 px-1">
          <h3 className="text-[13px] font-medium text-foreground/90 truncate tracking-tight">{title}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            {client && (
              <span className="text-[11px] text-muted-foreground font-normal truncate">{client}</span>
            )}
            {isPhotography && (
              <span className="text-[11px] text-accent/80 font-normal">· Ver álbum</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
