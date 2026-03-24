import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { ContentBlock } from '@/types/project';

interface PresentationModeProps {
  blocks: ContentBlock[];
  projectTitle: string;
  onClose: () => void;
}

export function PresentationMode({ blocks, projectTitle, onClose }: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visualBlocks = blocks.filter(b => b.type === 'image' || b.type === 'video');

  const next = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, visualBlocks.length - 1));
  }, [visualBlocks.length]);

  const prev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, next, prev]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (visualBlocks.length === 0) return null;
  const block = visualBlocks[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Maximize2 className="h-4 w-4 text-primary" />
          <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-body">
            Apresentação
          </span>
          <span className="text-xs text-muted-foreground font-body">—</span>
          <span className="text-sm font-display text-foreground">{projectTitle}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground font-body">
            {currentIndex + 1} / {visualBlocks.length}
          </span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="max-h-full max-w-full"
          >
            {block.type === 'image' ? (
              <img src={block.src} alt={block.alt || ''} className="max-h-[70vh] w-auto rounded-sm object-contain" />
            ) : (
              <video src={block.src} controls autoPlay className="max-h-[70vh] w-auto rounded-sm" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        {currentIndex > 0 && (
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-secondary/80 text-foreground hover:bg-secondary transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {currentIndex < visualBlocks.length - 1 && (
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-secondary/80 text-foreground hover:bg-secondary transition-colors">
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Caption */}
      {block.caption && (
        <div className="px-6 py-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground font-body">{block.caption}</p>
        </div>
      )}
    </motion.div>
  );
}
