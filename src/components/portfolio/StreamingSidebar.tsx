import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Camera, Clapperboard, TreePine, Eye, Home, User, Mail, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface StreamingSidebarProps {
  activeCategory: string | null;
  categories: string[];
  onCategoryClick: (cat: string | null) => void;
  onNavClick: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Documentário': Film,
  'Curta-metragem': Clapperboard,
  'Drama': Camera,
  'Natureza': TreePine,
  'Behind the Scenes': Eye,
};

const NAV_ITEMS = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'about', label: 'Sobre', icon: User },
  { id: 'contact', label: 'Contato', icon: Mail },
];

export function StreamingSidebar({ activeCategory, categories, onCategoryClick, onNavClick }: StreamingSidebarProps) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full py-6">
      {/* Logo */}
      <div className="px-5 mb-8">
        <button
          onClick={() => { onCategoryClick(null); setMobileOpen(false); }}
          className="font-display text-lg tracking-[0.15em] text-foreground uppercase"
        >
          Filmmaker
        </button>
      </div>

      {/* Navigation */}
      <div className="px-3 mb-6">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => { onNavClick(item.id); setMobileOpen(false); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-body text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-300"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-border/50 mb-6" />

      {/* Categories */}
      <div className="px-3 flex-1">
        <p className="px-3 mb-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
          Categorias
        </p>
        <button
          onClick={() => { onCategoryClick(null); setMobileOpen(false); }}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-300 ${
            activeCategory === null
              ? 'bg-primary/15 text-foreground glass-glow'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <Film className="h-4 w-4" />
          <span>Todos</span>
        </button>
        {categories.map(cat => {
          const Icon = CATEGORY_ICONS[cat] || Film;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { onCategoryClick(cat); setMobileOpen(false); }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-300 ${
                isActive
                  ? 'bg-primary/15 text-foreground glass-glow'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{cat}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-[100] glass rounded-xl p-2.5 glass-glow"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 z-[101] w-[260px] glass glass-glow overflow-y-auto"
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <aside className="fixed top-0 left-0 bottom-0 z-[90] w-[220px] glass glass-glow overflow-y-auto">
      {sidebarContent}
    </aside>
  );
}
