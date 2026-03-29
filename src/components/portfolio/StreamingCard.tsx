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
        {/* Thumbnail container */}
        <div className={`relative overflow-hidden rounded-2xl ${ratio}`}>
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-all duration-[800ms] ease-out"
            style={{
              transform: isHovered ? 'scale(1.06)' : 'scale(1)',
              filter: isHovered ? 'brightness(1.25) contrast(1.05)' : 'brightness(0.75)',
            }}
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 transition-all duration-[600ms] ease-out pointer-events-none"
            style={{
              background: isHovered
                ? 'linear-gradient(180deg, transparent 30%, hsla(0, 0%, 4%, 0.95) 100%)'
                : 'linear-gradient(180deg, transparent 50%, hsla(0, 0%, 4%, 0.6) 100%)',
            }}
          />

          {/* Border glow on hover */}
          <div
            className="absolute inset-0 rounded-2xl transition-all duration-[600ms] ease-out pointer-events-none"
            style={{
              boxShadow: isHovered
                ? 'inset 0 0 0 1px hsla(0, 0%, 100%, 0.18), 0 16px 48px -8px hsla(0, 0%, 0%, 0.6)'
                : 'inset 0 0 0 1px hsla(0, 0%, 100%, 0.04), 0 4px 16px -4px hsla(0, 0%, 0%, 0.3)',
            }}
          />

          {/* Center icon */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-[600ms] ease-out"
            style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'scale(1)' : 'scale(0.8)' }}
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

          {/* Bottom info on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-[600ms] ease-out"
            style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateY(0)' : 'translateY(8px)' }}
          >
            <h3 className="text-[14px] font-semibold text-foreground leading-tight tracking-tight">{title}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              {client && (
                <>
                  <span className="text-[11px] text-foreground/40 font-medium">{client}</span>
                  {duration && !isPhotography && <span className="text-[11px] text-foreground/15">·</span>}
                </>
              )}
              {duration && !isPhotography && (
                <span className="text-[11px] text-foreground/40 font-medium">{duration}</span>
              )}
              {isPhotography && (
                <span className="text-[11px] text-accent font-medium">Ver álbum</span>
              )}
            </div>
          </div>
        </div>

        {/* Title below — visible when NOT hovered */}
        <div
          className="mt-3 px-1 transition-all duration-[500ms] ease-out"
          style={{ opacity: isHovered ? 0 : 1 }}
        >
          <h3 className="text-[13px] font-medium text-foreground/80 truncate tracking-tight">{title}</h3>
          {client && <span className="text-[11px] text-muted-foreground font-normal">{client}</span>}
          {isPhotography && <span className="text-[11px] text-accent/70 font-normal ml-1">· Ver álbum</span>}
        </div>
      </div>
    </div>
  );
}
