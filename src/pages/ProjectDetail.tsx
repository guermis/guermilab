import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react';
import { getProjectBySlug } from '@/data/projects';
import { ContentBlockRenderer } from '@/components/portfolio/ContentBlockRenderer';
import { useInView } from '@/hooks/useInView';
import { useEffect } from 'react';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const project = getProjectBySlug(slug || '');
  const { ref: metaRef, isInView: metaVisible } = useInView();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl text-foreground">Projeto não encontrado</h1>
          <button onClick={() => navigate('/')} className="mt-4 text-sm text-primary hover:underline font-body">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const sortedBlocks = [...project.blocks].sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[70vh] w-full overflow-hidden film-grain">
        <img
          src={project.heroImage}
          alt={project.title}
          className="h-full w-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 hero-overlay" />

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 md:left-16 z-20 flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-body"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </motion.button>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-12 md:px-16 lg:px-24">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '3rem' }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="h-[1px] bg-primary mb-4"
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[10px] tracking-[0.3em] uppercase text-primary font-body"
          >
            {project.category}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-2 font-display text-3xl md:text-5xl lg:text-6xl text-foreground max-w-3xl"
          >
            {project.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="mt-4 max-w-xl text-sm md:text-base text-muted-foreground font-body leading-relaxed"
          >
            {project.shortDescription}
          </motion.p>
        </div>
      </section>

      {/* Meta info */}
      <section className="border-b border-border px-6 py-8 md:px-16 lg:px-24">
        <div
          ref={metaRef}
          className={`mx-auto flex max-w-5xl flex-wrap gap-8 md:gap-12 ${metaVisible ? 'animate-fade-in' : 'opacity-0'}`}
        >
          {project.client && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <div>
                <span className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">Cliente</span>
                <span className="text-sm text-foreground font-body">{project.client}</span>
              </div>
            </div>
          )}
          {project.role && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <div>
                <span className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">Função</span>
                <span className="text-sm text-foreground font-body">{project.role}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">Ano</span>
              <span className="text-sm text-foreground font-body">{project.year}</span>
            </div>
          </div>
          {project.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <span className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">Duração</span>
                <span className="text-sm text-foreground font-body">{project.duration}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tags */}
      <section className="px-6 py-6 md:px-16 lg:px-24 border-b border-border">
        <div className="mx-auto max-w-5xl flex flex-wrap gap-2">
          {project.tags.map(tag => (
            <span
              key={tag}
              className="rounded-sm bg-secondary px-3 py-1 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Content blocks */}
      <section className="px-6 py-16 md:px-16 lg:px-24">
        <div className="mx-auto max-w-5xl">
          {sortedBlocks.map((block, i) => (
            <ContentBlockRenderer key={block.id} block={block} index={i} />
          ))}
        </div>
      </section>

      {/* Footer nav */}
      <section className="border-t border-border px-6 py-12 md:px-16 lg:px-24">
        <div className="mx-auto max-w-5xl flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-body"
          >
            <ArrowLeft className="h-4 w-4" />
            Todos os projetos
          </button>
          <span className="font-display text-sm tracking-widest text-muted-foreground uppercase">
            Filmmaker
          </span>
        </div>
      </section>
    </main>
  );
}
