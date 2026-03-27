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
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        ref={cardRef}
        onClick={() => navigate(`/projeto/${slug}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative cursor-pointer group w-[280px] md:w-[320px]"
      >
        {/* Thumbnail container */}
        <div className="relative overflow-hidden rounded-2xl aspect-video">
          {/* Image */}
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-all duration-[800ms] ease-out"
            style={{
              transform: isHovered ? 'scale(1.06)' : 'scale(1)',
              filter: isHovered ? 'brightness(1.2) contrast(1.05)' : 'brightness(0.8)',
            }}
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 transition-all duration-[600ms] ease-out pointer-events-none"
            style={{
              background: isHovered
                ? 'linear-gradient(180deg, transparent 40%, hsla(225, 12%, 5%, 0.9) 100%)'
                : 'linear-gradient(180deg, transparent 60%, hsla(225, 12%, 5%, 0.5) 100%)',
            }}
          />

          {/* Border glow on hover */}
          <div
            className="absolute inset-0 rounded-2xl transition-all duration-[600ms] ease-out pointer-events-none"
            style={{
              boxShadow: isHovered
                ? 'inset 0 0 0 1px hsla(0, 0%, 100%, 0.15), 0 12px 40px -8px hsla(0, 0%, 0%, 0.5)'
                : 'inset 0 0 0 1px hsla(0, 0%, 100%, 0.04), 0 4px 16px -4px hsla(0, 0%, 0%, 0.3)',
            }}
          />

          {/* Play button */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-[600ms] ease-out"
            style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'scale(1)' : 'scale(0.85)' }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsla(0,0%,100%,0.15)] backdrop-blur-xl border border-[hsla(0,0%,100%,0.12)]">
              <Play className="h-5 w-5 text-foreground ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* Duration badge */}
          {duration && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[hsla(0,0%,0%,0.5)] backdrop-blur-lg rounded-lg px-2.5 py-1 border border-[hsla(0,0%,100%,0.06)]">
              <Clock className="h-3 w-3 text-foreground/60" />
              <span className="text-[10px] text-foreground/60 font-medium">{duration}</span>
            </div>
          )}

          {/* Bottom info on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-[600ms] ease-out"
            style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateY(0)' : 'translateY(6px)' }}
          >
            <h3 className="text-[15px] font-semibold text-foreground leading-tight tracking-tight">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-foreground/40 font-medium">{year}</span>
              <span className="text-[11px] text-foreground/20">·</span>
              <span className="text-[11px] text-foreground/40 font-medium">{category}</span>
            </div>
          </div>
        </div>

        {/* Title below — visible when NOT hovered */}
        <div
          className="mt-3 px-1 transition-all duration-[500ms] ease-out"
          style={{ opacity: isHovered ? 0 : 1 }}
        >
          <h3 className="text-[13px] font-medium text-foreground/80 truncate tracking-tight">{title}</h3>
          <span className="text-[11px] text-muted-foreground font-normal">{year}</span>
        </div>
      </div>
    </div>
  );
}
