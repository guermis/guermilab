import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronDown } from 'lucide-react';

export function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/images/hero-bg.jpg';
    img.onload = () => setLoaded(true);
  }, []);

  const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden film-grain letterbox">
      {/* Background image with Ken Burns */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className={`h-full w-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'} animate-ken-burns`}
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex h-full flex-col justify-end px-6 pb-24 md:px-16 lg:px-24">
        {/* Top nav */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-6 md:px-16 lg:px-24"
        >
          <span className="font-display text-lg tracking-widest text-foreground uppercase">
            Filmmaker
          </span>
          <div className="flex items-center gap-8">
            <button
              onClick={scrollToWork}
              className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Trabalhos
            </button>
            <a
              href="#about"
              className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Sobre
            </a>
            <a
              href="#contact"
              className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Contato
            </a>
          </div>
        </motion.nav>

        {/* Hero text */}
        <div className="max-w-4xl">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '4rem' }}
            transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
            className="h-[1px] bg-primary mb-6"
          />

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight text-foreground"
          >
            Cada frame conta
            <br />
            <span className="text-primary">uma história.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8, ease: 'easeOut' }}
            className="mt-6 max-w-lg text-sm md:text-base leading-relaxed text-muted-foreground font-body"
          >
            Direção de fotografia e produção audiovisual com foco em narrativas
            visuais que emocionam e conectam.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8, ease: 'easeOut' }}
            onClick={scrollToWork}
            className="mt-8 flex items-center gap-3 group"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
              <Play className="h-4 w-4 text-primary ml-0.5" />
            </span>
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              Ver showreel
            </span>
          </motion.button>
        </div>

        {/* Scroll indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          onClick={scrollToWork}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.button>
      </div>
    </section>
  );
}
