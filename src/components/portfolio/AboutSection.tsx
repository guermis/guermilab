import { useInView } from '@/hooks/useInView';
import { Camera, Film, Award } from 'lucide-react';

const STATS = [
  { icon: Film, label: 'Projetos', value: '40+' },
  { icon: Camera, label: 'Anos de Experiência', value: '12' },
  { icon: Award, label: 'Prêmios', value: '8' },
];

export function AboutSection() {
  const { ref, isInView } = useInView();

  return (
    <section id="about" className="relative py-20 mt-8">
      <div ref={ref} className="mx-auto max-w-5xl">
        <div className={`grid gap-12 md:grid-cols-2 ${isInView ? 'animate-fade-in' : 'opacity-0'}`}>
          {/* Text */}
          <div className="glass rounded-2xl p-8 glass-glow">
            <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-body">
              Sobre
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl text-foreground">
              Guermi Lab
            </h2>
            <div className="mt-4 h-[1px] w-16 bg-accent/40" />
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground font-body">
              Com mais de uma década de experiência em produção audiovisual,
              especializo-me em criar narrativas visuais que transcendem o
              ordinário. Do documentário ao filme publicitário, cada projeto é
              uma oportunidade de contar uma história única.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground font-body">
              Minha abordagem combina técnica cinematográfica com sensibilidade
              artística, resultando em imagens que emocionam e inspiram.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-col justify-center gap-6">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`glass rounded-xl p-5 flex items-center gap-5 glass-glow ${isInView ? 'animate-slide-up' : 'opacity-0'}`}
                style={{ animationDelay: `${400 + i * 200}ms` }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <stat.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-display text-2xl text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-body tracking-wide">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
