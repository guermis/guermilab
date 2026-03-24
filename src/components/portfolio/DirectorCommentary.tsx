import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

interface DirectorNote {
  blockId: string;
  note: string;
  timestamp?: string;
}

interface DirectorCommentaryProps {
  notes: DirectorNote[];
  currentBlockId: string;
}

export function DirectorCommentary({ notes, currentBlockId }: DirectorCommentaryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const note = notes.find(n => n.blockId === currentBlockId);

  if (!note) return null;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="relative mt-4 rounded-sm border border-primary/20 bg-primary/5 p-4"
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="flex items-start gap-3">
            <MessageCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-primary font-body block mb-1">
                Nota do diretor
              </span>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">
                {note.note}
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="mt-4 flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-primary/60 hover:text-primary transition-colors font-body"
        >
          <MessageCircle className="h-3 w-3" />
          Ver nota do diretor
        </motion.button>
      )}
    </AnimatePresence>
  );
}
