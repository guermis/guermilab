import { useInView } from '@/hooks/useInView';
import { useAboutContent, useAboutStats } from '@/hooks/useSupabaseData';
import { Camera, Film, Award, Star, Heart, Users, Globe, Zap, type LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Film, Camera, Award, Star, Heart, Users, Globe, Zap,
};

export function AboutSection() {
  const { ref, isInView } = useInView();
  const { data: about } = useAboutContent();
  const { data: stats } = useAboutStats();

  const title = about?.title || 'Guermi Lab';
  const description = about?.description || 'Com mais de uma década de experiência em produção audiovisual, especializo-me em criar narrativas visuais que transcendem o ordinário.';

  return (
    <section id="about" className="relative py-20 mt-8">
      <div ref={ref} className="mx-auto max-w-5xl">
        <div className={`grid gap-12 md:grid-cols-2 ${isInView ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="glass rounded-2xl p-8 glass-glow">
            <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-body">Sobre</span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl text-foreground">{title}</h2>
            <div className="mt-4 h-[1px] w-16 bg-accent/40" />
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground font-body whitespace-pre-line">
              {description}
            </p>
          </div>
          <div className="flex flex-col justify-center gap-6">
            {stats.map((stat, i) => {
              const IconComp = ICON_MAP[stat.icon] || Film;
              return (
                <div
                  key={stat.id}
                  className={`glass rounded-xl p-5 flex items-center gap-5 glass-glow ${isInView ? 'animate-slide-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${400 + i * 200}ms` }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <IconComp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-display text-2xl text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground font-body tracking-wide">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
