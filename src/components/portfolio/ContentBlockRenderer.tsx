import type { ContentBlock } from '@/types/project';
import { useInView } from '@/hooks/useInView';

interface ContentBlockRendererProps {
  block: ContentBlock;
  index: number;
}

function TextBlock({ block, index }: ContentBlockRendererProps) {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={`max-w-2xl ${index > 0 ? 'mt-16' : ''} ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {block.heading && (
        <h3 className="font-display text-xl md:text-2xl text-foreground mb-4">
          {block.heading}
        </h3>
      )}
      {block.body && (
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground font-body">
          {block.body}
        </p>
      )}
    </div>
  );
}

function ImageBlock({ block, index }: ContentBlockRendererProps) {
  const { ref, isInView } = useInView();
  return (
    <figure
      ref={ref}
      className={`mt-16 ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="overflow-hidden rounded-sm">
        <img
          src={block.src}
          alt={block.alt || block.caption || ''}
          loading="lazy"
          className="w-full h-auto object-cover transition-transform duration-700 hover:scale-[1.02]"
        />
      </div>
      {block.caption && (
        <figcaption className="mt-3 text-xs text-muted-foreground font-body tracking-wide">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function QuoteBlock({ block, index }: ContentBlockRendererProps) {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={`mt-16 border-l-2 border-primary/40 pl-6 py-2 max-w-xl ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <p className="font-display text-lg md:text-xl text-foreground italic leading-relaxed">
        "{block.quote}"
      </p>
      {block.author && (
        <cite className="mt-3 block text-xs text-muted-foreground font-body not-italic tracking-wide">
          — {block.author}
        </cite>
      )}
    </div>
  );
}

function VideoBlock({ block, index }: ContentBlockRendererProps) {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={`mt-16 ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-video overflow-hidden rounded-sm bg-secondary">
        <video
          src={block.src}
          controls
          className="w-full h-full object-cover"
          poster={block.alt}
        />
      </div>
      {block.caption && (
        <p className="mt-3 text-xs text-muted-foreground font-body tracking-wide">
          {block.caption}
        </p>
      )}
    </div>
  );
}

export function ContentBlockRenderer({ block, index }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} index={index} />;
    case 'image':
      return <ImageBlock block={block} index={index} />;
    case 'quote':
      return <QuoteBlock block={block} index={index} />;
    case 'video':
      return <VideoBlock block={block} index={index} />;
    default:
      return null;
  }
}
