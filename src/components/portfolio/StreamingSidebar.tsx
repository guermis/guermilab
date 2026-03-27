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
    <div className="flex flex-col h-full py-8">
      {/* Logo */}
      <div className="px-6 mb-10">
        <button
          onClick={() => { onCategoryClick(null); setMobileOpen(false); }}
          className="text-foreground text-lg font-semibold tracking-tight"
        >
          Filmmaker
        </button>
      </div>

      {/* Navigation */}
      <div className="px-4 mb-8">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => { onNavClick(item.id); setMobileOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-[hsla(0,0%,100%,0.06)] transition-all duration-500 ease-out"
          >
            <item.icon className="h-[18px] w-[18px] opacity-70" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-[hsla(0,0%,100%,0.06)] mb-8" />

      {/* Categories */}
      <div className="px-4 flex-1">
        <p className="px-4 mb-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 font-medium">
          Categorias
        </p>
        <button
          onClick={() => { onCategoryClick(null); setMobileOpen(false); }}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[13px] font-medium transition-all duration-500 ease-out ${
            activeCategory === null
              ? 'bg-[hsla(0,0%,100%,0.1)] text-foreground shadow-[inset_0_1px_0_hsla(0,0%,100%,0.08)]'
              : 'text-muted-foreground hover:text-foreground hover:bg-[hsla(0,0%,100%,0.06)]'
          }`}
        >
          <Film className="h-[18px] w-[18px] opacity-70" />
          <span>Todos</span>
        </button>
        {categories.map(cat => {
          const Icon = CATEGORY_ICONS[cat] || Film;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => { onCategoryClick(cat); setMobileOpen(false); }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[13px] font-medium transition-all duration-500 ease-out ${
                isActive
                  ? 'bg-[hsla(0,0%,100%,0.1)] text-foreground shadow-[inset_0_1px_0_hsla(0,0%,100%,0.08)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-[hsla(0,0%,100%,0.06)]'
              }`}
            >
              <Icon className="h-[18px] w-[18px] opacity-70" />
              <span>{cat}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-[100] glass rounded-2xl p-3"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 z-[100] bg-[hsla(225,12%,5%,0.6)] backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', damping: 35, stiffness: 250 }}
                className="fixed top-4 left-4 bottom-4 z-[101] w-[270px] glass rounded-3xl overflow-y-auto"
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors duration-300"
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
    <aside className="fixed top-4 left-4 bottom-4 z-[90] w-[230px] glass rounded-3xl overflow-y-auto">
      {sidebarContent}
    </aside>
  );
}
