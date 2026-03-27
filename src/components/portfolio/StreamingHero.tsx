import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PROJECTS } from '@/data/projects';

export function StreamingHero() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  const featured = PROJECTS[0];

  useEffect(() => {
    const img = new Image();
    img.src = featured.heroImage;
    img.onload = () => setLoaded(true);
  }, [featured.heroImage]);

  return (
    <section className="relative w-full h-[75vh] md:h-[80vh] overflow-hidden rounded-3xl mb-12">
      {/* Background image — full bleed */}
      <img
        src={featured.heroImage}
        alt={featured.title}
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-[2s] ease-out ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
      />

      {/* Gradient layers for depth */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, hsla(225, 12%, 5%, 0) 0%, hsla(225, 12%, 5%, 0.15) 35%, hsla(225, 12%, 5%, 0.7) 65%, hsla(225, 12%, 5%, 1) 100%)'
      }} />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(90deg, hsla(225, 12%, 5%, 0.6) 0%, transparent 55%)'
      }} />

      {/* Subtle vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, hsla(225, 12%, 5%, 0.4) 100%)'
      }} />

      {/* Content — floating over layers */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="inline-block rounded-lg px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium mb-5 bg-[hsla(0,0%,100%,0.06)] backdrop-blur-sm border border-[hsla(0,0%,100%,0.05)]">
            Em destaque
          </span>

          <h1 className="text-3xl md:text-5xl lg:text-[3.5rem] text-foreground leading-[1.08] max-w-xl font-semibold tracking-tight">
            {featured.title}
          </h1>

          <p className="mt-5 max-w-md text-sm md:text-[15px] text-foreground/60 leading-relaxed font-normal">
            {featured.shortDescription}
          </p>

          <div className="mt-8 flex items-center gap-3">
            {/* Solid primary button — Apple TV style */}
            <button
              onClick={() => navigate(`/projeto/${featured.slug}`)}
              className="flex items-center gap-2.5 rounded-2xl bg-foreground text-background px-7 py-3.5 text-[13px] font-semibold hover:bg-foreground/90 transition-all duration-500 ease-out shadow-[0_4px_20px_hsla(0,0%,0%,0.3)]"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Assistir
            </button>
            {/* Glass secondary button */}
            <button
              onClick={() => navigate(`/projeto/${featured.slug}`)}
              className="flex items-center gap-2.5 glass rounded-2xl px-7 py-3.5 text-[13px] font-medium text-foreground hover:bg-[hsla(0,0%,100%,0.12)] transition-all duration-500 ease-out"
            >
              <Info className="h-4 w-4 opacity-70" />
              Mais Detalhes
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
