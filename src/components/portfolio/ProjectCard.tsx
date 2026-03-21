import { useState, useRef } from 'react';
import { useInView } from '@/hooks/useInView';
import { Play } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  category: string;
  year: string;
  image: string;
  index: number;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

export function ProjectCard({ title, category, year, image, index, aspectRatio = 'landscape' }: ProjectCardProps) {
  const { ref, isInView } = useInView();
  const [isHovered, setIsHovered] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const aspectClasses = {
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
    square: 'aspect-square',
  };

  return (
    <div
      ref={ref}
      className={`group cursor-pointer ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 150}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative overflow-hidden rounded-sm ${aspectClasses[aspectRatio]}`}>
        {/* Image */}
        <img
          ref={imgRef}
          src={image}
          alt={title}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-background/60 flex items-center justify-center transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/50 bg-primary/20">
            <Play className="h-5 w-5 text-primary ml-0.5" />
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="rounded-sm bg-background/80 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body">
            {category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="font-display text-base md:text-lg text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground font-body">{year}</span>
      </div>
    </div>
  );
}
