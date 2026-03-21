import { useInView } from '@/hooks/useInView';
import { ProjectCard } from './ProjectCard';

const PROJECTS = [
  { title: 'Horizonte Perdido', category: 'Documentário', year: '2025', image: '/images/project-1.jpg' },
  { title: 'Neon Noir', category: 'Curta-metragem', year: '2024', image: '/images/project-2.jpg' },
  { title: 'Abismo Azul', category: 'Documentário', year: '2024', image: '/images/project-3.jpg' },
  { title: 'Luz Interior', category: 'Drama', year: '2023', image: '/images/project-4.jpg' },
  { title: 'Aurora Boreal', category: 'Natureza', year: '2023', image: '/images/project-5.jpg' },
  { title: 'Making Of: Centelha', category: 'Behind the Scenes', year: '2022', image: '/images/project-6.jpg' },
];

export function ProjectGrid() {
  const { ref: headerRef, isInView: headerVisible } = useInView();

  return (
    <section id="work" className="relative px-6 py-24 md:px-16 lg:px-24">
      {/* Section header */}
      <div ref={headerRef} className={`mb-16 ${headerVisible ? 'animate-fade-in' : 'opacity-0'}`}>
        <span className="text-[10px] tracking-[0.3em] uppercase text-primary font-body">
          Portfolio
        </span>
        <h2 className="mt-2 font-display text-3xl md:text-5xl text-foreground">
          Trabalhos Selecionados
        </h2>
        <div className={`mt-4 h-[1px] bg-primary/40 ${headerVisible ? 'animate-reveal-line' : 'w-0'}`}
          style={{ maxWidth: '6rem' }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project, i) => (
          <ProjectCard
            key={project.title}
            {...project}
            index={i}
            aspectRatio={i === 0 || i === 3 ? 'landscape' : i === 2 ? 'portrait' : 'landscape'}
          />
        ))}
      </div>
    </section>
  );
}
