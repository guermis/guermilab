import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Tag, Presentation, MessageCircle } from 'lucide-react';
import { getProjectBySlug } from '@/data/projects';
import { ContentBlockRenderer } from '@/components/portfolio/ContentBlockRenderer';
import { DirectorCommentary } from '@/components/portfolio/DirectorCommentary';
import { PresentationMode } from '@/components/portfolio/PresentationMode';
import { PasswordGate } from '@/components/portfolio/PasswordGate';
import { useInView } from '@/hooks/useInView';
import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';

interface DirectorNote {
  blockId: string;
  note: string;
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const project = getProjectBySlug(slug || '');
  const { trackClick } = useAnalytics(slug);
  const { ref: metaRef, isInView: metaVisible } = useInView();

  const [presentationMode, setPresentationMode] = useState(false);
  const [directorMode, setDirectorMode] = useState(false);
  const [directorNotes, setDirectorNotes] = useState<DirectorNote[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Check if project is private and load director notes from DB
  useEffect(() => {
    if (!project) return;

    const checkPrivacy = async () => {
      const { data } = await supabase
        .from('projects')
        .select('is_private, director_notes')
        .eq('slug', project.slug)
        .single();

      if (data) {
        setIsPrivate(data.is_private);
        if (data.director_notes && Array.isArray(data.director_notes)) {
          setDirectorNotes(data.director_notes as unknown as DirectorNote[]);
        }
        // Check session storage for previously unlocked
        if (data.is_private && sessionStorage.getItem(`unlock_${project.title}`)) {
          setUnlocked(true);
        }
      }
    };
    checkPrivacy();
  }, [project]);

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

  // Password gate for private projects
  if (isPrivate && !unlocked) {
    return <PasswordGate projectTitle={project.title} onUnlock={() => setUnlocked(true)} />;
  }

  const sortedBlocks = [...project.blocks].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Presentation mode overlay */}
      <AnimatePresence>
        {presentationMode && (
          <PresentationMode
            blocks={sortedBlocks}
            projectTitle={project.title}
            onClose={() => setPresentationMode(false)}
          />
        )}
      </AnimatePresence>

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

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-6 right-6 md:right-16 z-20 flex items-center gap-3"
          >
            {directorNotes.length > 0 && (
              <button
                onClick={() => setDirectorMode(!directorMode)}
                className={`flex items-center gap-2 rounded-sm px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-body transition-all duration-300 border ${
                  directorMode
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                <MessageCircle className="h-3 w-3" />
                Diretor
              </button>
            )}
            <button
              onClick={() => setPresentationMode(true)}
              className="flex items-center gap-2 rounded-sm border border-border bg-background/60 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground hover:border-primary/40 font-body transition-all duration-300"
            >
              <Presentation className="h-3 w-3" />
              Apresentação
            </button>
          </motion.div>

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
              <div key={block.id}>
                <ContentBlockRenderer block={block} index={i} />
                {directorMode && (
                  <DirectorCommentary notes={directorNotes} currentBlockId={block.id} />
                )}
              </div>
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
    </>
  );
}
