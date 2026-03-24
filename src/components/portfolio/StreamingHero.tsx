import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PROJECTS } from '@/data/projects';

export function StreamingHero() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  // Feature the first project
  const featured = PROJECTS[0];

  useEffect(() => {
    const img = new Image();
    img.src = featured.heroImage;
    img.onload = () => setLoaded(true);
  }, [featured.heroImage]);

  return (
    <section className="relative w-full h-[65vh] md:h-[70vh] overflow-hidden rounded-2xl mb-10">
      {/* Background */}
      <img
        src={featured.heroImage}
        alt={featured.title}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ filter: 'brightness(0.6)' }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, hsla(220, 20%, 6%, 0.1) 0%, hsla(220, 20%, 6%, 0.4) 50%, hsla(220, 20%, 6%, 0.95) 100%)'
      }} />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(90deg, hsla(220, 20%, 6%, 0.7) 0%, transparent 60%)'
      }} />

      {/* Glass inner glow */}
      <div className="absolute inset-0 rounded-2xl" style={{
        boxShadow: 'inset 0 0 0 1px hsla(220, 20%, 30%, 0.15)'
      }} />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <span className="glass inline-block rounded-md px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-4">
            Em destaque
          </span>

          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] max-w-2xl">
            {featured.title}
          </h1>

          <p className="mt-4 max-w-lg text-sm md:text-base text-foreground/70 font-body leading-relaxed">
            {featured.shortDescription}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => navigate(`/projeto/${featured.slug}`)}
              className="flex items-center gap-2 rounded-xl bg-foreground text-background px-6 py-3 text-sm font-body font-medium hover:bg-foreground/90 transition-colors duration-300"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Assistir
            </button>
            <button
              onClick={() => navigate(`/projeto/${featured.slug}`)}
              className="flex items-center gap-2 glass glass-glow rounded-xl px-6 py-3 text-sm font-body text-foreground hover:bg-muted/30 transition-all duration-300"
            >
              <Info className="h-4 w-4" />
              Mais Detalhes
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
