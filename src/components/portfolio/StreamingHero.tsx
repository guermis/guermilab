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
    <section className="relative w-full h-[80vh] md:h-[85vh] -mt-6 -mx-10 mb-14" style={{ width: 'calc(100% + 5rem)' }}>
      {/* Background image — true full bleed, no container */}
      <img
        src={featured.heroImage}
        alt={featured.title}
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-[2s] ease-out ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
      />

      {/* Gradient: left-to-right for text readability */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(90deg, hsla(225, 12%, 5%, 0.85) 0%, hsla(225, 12%, 5%, 0.4) 40%, transparent 70%)'
      }} />

      {/* Gradient: bottom fade to page background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, transparent 0%, transparent 50%, hsla(225, 12%, 5%, 0.6) 75%, hsla(225, 12%, 5%, 1) 100%)'
      }} />

      {/* Subtle vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, hsla(225, 12%, 5%, 0.5) 100%)'
      }} />

      {/* Content — floating freely over the scene */}
      <div className="absolute bottom-0 left-0 right-0 p-10 md:p-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="inline-block rounded-lg px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase text-foreground/60 font-medium mb-5 bg-[hsla(0,0%,100%,0.06)] backdrop-blur-sm border border-[hsla(0,0%,100%,0.06)]">
            Em destaque
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-[3.8rem] text-foreground leading-[1.06] max-w-xl font-semibold tracking-tight">
            {featured.title}
          </h1>

          <p className="mt-5 max-w-md text-sm md:text-[15px] text-foreground/50 leading-relaxed font-normal">
            {featured.shortDescription}
          </p>

          <div className="mt-9 flex items-center gap-3">
            {/* Primary solid pill button */}
            <button
              onClick={() => navigate(`/projeto/${featured.slug}`)}
              className="flex items-center gap-2.5 rounded-full bg-foreground text-background px-8 py-3.5 text-[13px] font-semibold hover:bg-foreground/90 transition-all duration-500 ease-out shadow-[0_4px_24px_hsla(0,0%,0%,0.4)]"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Assistir
            </button>
            {/* Glass secondary pill button */}
            <button
              onClick={() => navigate(`/projeto/${featured.slug}`)}
              className="flex items-center gap-2.5 rounded-full px-8 py-3.5 text-[13px] font-medium text-foreground/90 transition-all duration-500 ease-out"
              style={{
                background: 'hsla(0, 0%, 100%, 0.08)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid hsla(0, 0%, 100%, 0.1)',
              }}
            >
              <Info className="h-4 w-4 opacity-60" />
              Mais Detalhes
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
