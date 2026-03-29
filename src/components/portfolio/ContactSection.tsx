import { useInView } from '@/hooks/useInView';
import { ContactForm } from './ContactForm';

export function ContactSection() {
  const { ref, isInView } = useInView();

  return (
    <section id="contact" className="relative py-20 mt-8">
      <div ref={ref} className={`mx-auto max-w-3xl text-center ${isInView ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="glass rounded-2xl p-8 md:p-12 glass-glow">
          <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-body">
            Contato
          </span>
          <h2 className="mt-2 font-display text-3xl md:text-5xl text-foreground">
            Vamos criar algo
            <br />
            <span className="text-accent">extraordinário.</span>
          </h2>

          <div className="mt-10">
            <ContactForm />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 flex items-center justify-between text-muted-foreground">
          <span className="font-display text-sm tracking-widest uppercase">
            Guermi Lab
          </span>
          <span className="text-xs font-body">
            © {new Date().getFullYear()}. Todos os direitos reservados.
          </span>
        </div>
      </div>
    </section>
  );
}
