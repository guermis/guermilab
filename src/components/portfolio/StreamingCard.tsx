import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface StreamingCardProps {
  slug: string;
  title: string;
  category: string;
  year: string;
  thumbnail: string;
  duration?: string;
  index: number;
}

export function StreamingCard({ slug, title, category, year, thumbnail, duration, index }: StreamingCardProps) {
  const navigate = useNavigate();
  const { ref, isInView } = useInView();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={`snap-start shrink-0 ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        ref={cardRef}
        onClick={() => navigate(`/projeto/${slug}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative cursor-pointer group w-[280px] md:w-[320px]"
      >
        {/* Thumbnail container */}
        <div className="relative overflow-hidden rounded-xl aspect-video">
          {/* Image */}
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-all duration-700 ease-out"
            style={{
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              filter: isHovered ? 'brightness(1.15) contrast(1.1)' : 'brightness(0.85)',
            }}
          />

          {/* Glass overlay on hover */}
          <div
            className="absolute inset-0 transition-all duration-500 pointer-events-none"
            style={{
              background: isHovered
                ? 'linear-gradient(180deg, transparent 30%, hsla(220, 20%, 6%, 0.85) 100%)'
                : 'linear-gradient(180deg, transparent 50%, hsla(220, 20%, 6%, 0.6) 100%)',
            }}
          />

          {/* Inner glow border */}
          <div
            className="absolute inset-0 rounded-xl transition-all duration-500 pointer-events-none"
            style={{
              boxShadow: isHovered
                ? 'inset 0 0 0 1px hsla(220, 60%, 60%, 0.3), 0 8px 32px -8px hsla(220, 60%, 60%, 0.2)'
                : 'inset 0 0 0 1px hsla(220, 20%, 30%, 0.15)',
            }}
          />

          {/* Play button */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-500"
            style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'scale(1)' : 'scale(0.8)' }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full glass glass-glow">
              <Play className="h-4 w-4 text-foreground ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* Duration badge */}
          {duration && (
            <div className="absolute top-3 right-3 flex items-center gap-1 glass rounded-md px-2 py-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-body">{duration}</span>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="glass rounded-md px-2 py-1 text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-body">
              {category}
            </span>
          </div>

          {/* Bottom info (visible on hover) */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-500"
            style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateY(0)' : 'translateY(8px)' }}
          >
            <h3 className="font-display text-base text-foreground leading-tight">{title}</h3>
            <span className="text-[11px] text-muted-foreground font-body">{year}</span>
          </div>
        </div>

        {/* Title below (visible when not hovered) */}
        <div
          className="mt-2.5 px-1 transition-opacity duration-300"
          style={{ opacity: isHovered ? 0 : 1 }}
        >
          <h3 className="font-body text-sm text-foreground/90 truncate">{title}</h3>
          <span className="text-[11px] text-muted-foreground font-body">{year}</span>
        </div>
      </div>
    </div>
  );
}
