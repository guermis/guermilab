import { useInView } from '@/hooks/useInView';
import { Mail, Instagram, ArrowUpRight } from 'lucide-react';

export function ContactSection() {
  const { ref, isInView } = useInView();

  return (
    <section id="contact" className="relative px-6 py-24 md:px-16 lg:px-24 border-t border-border">
      <div ref={ref} className={`mx-auto max-w-3xl text-center ${isInView ? 'animate-fade-in' : 'opacity-0'}`}>
        <span className="text-[10px] tracking-[0.3em] uppercase text-primary font-body">
          Contato
        </span>
        <h2 className="mt-2 font-display text-3xl md:text-5xl text-foreground">
          Vamos criar algo
          <br />
          <span className="text-primary">extraordinário.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground font-body">
          Interessado em colaborar? Entre em contato para discutir
          seu próximo projeto.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="mailto:contato@filmmaker.com"
            className="group flex items-center gap-2 rounded-sm border border-border bg-secondary px-6 py-3 text-xs tracking-[0.15em] uppercase text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all duration-300"
          >
            <Mail className="h-4 w-4 text-primary" />
            Email
            <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-sm border border-border bg-secondary px-6 py-3 text-xs tracking-[0.15em] uppercase text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all duration-300"
          >
            <Instagram className="h-4 w-4 text-primary" />
            Instagram
            <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto mt-24 max-w-5xl border-t border-border pt-8 flex items-center justify-between">
        <span className="font-display text-sm tracking-widest text-muted-foreground uppercase">
          Filmmaker
        </span>
        <span className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()}. Todos os direitos reservados.
        </span>
      </div>
    </section>
  );
}
