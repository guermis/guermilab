import { useEffect, useState } from 'react';
import { PROJECTS } from '@/data/projects';

export function StreamingHero() {
  const [loaded, setLoaded] = useState(false);
  const featured = PROJECTS[0];

  useEffect(() => {
    const img = new window.Image();
    img.src = featured.heroImage;
    img.onload = () => setLoaded(true);
  }, [featured.heroImage]);

  return (
    <section className="relative w-full mb-14">
      <div className={`relative overflow-hidden rounded-3xl aspect-[21/9] transition-all duration-[2s] ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <img
          src={featured.heroImage}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Subtle vignette overlay */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, hsla(0, 0%, 6%, 0.4) 100%)'
        }} />
      </div>
    </section>
  );
}
