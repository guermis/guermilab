import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

export function DynamicCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    let scrollTriggered = false;
    let timeTriggered = false;

    const checkShow = () => {
      if (scrollTriggered && timeTriggered) setVisible(true);
    };

    // Show after 15s on page
    const timer = setTimeout(() => {
      timeTriggered = true;
      checkShow();
    }, 15000);

    // Show after 40% scroll
    const handleScroll = () => {
      const depth = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (depth > 0.4) {
        scrollTriggered = true;
        checkShow();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dismissed]);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setDismissed(true);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-sm border border-border bg-secondary/95 backdrop-blur-md px-5 py-3 shadow-2xl"
        >
          <button
            onClick={scrollToContact}
            className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            Vamos conversar?
          </button>
          <button
            onClick={() => { setDismissed(true); setVisible(false); }}
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
