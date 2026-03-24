import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';

interface PasswordGateProps {
  onUnlock: () => void;
  projectTitle: string;
}

export function PasswordGate({ onUnlock, projectTitle }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(false);

    // Check password via edge function or simple comparison
    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await supabase
      .from('projects')
      .select('access_password')
      .eq('title', projectTitle)
      .single();

    if (data?.access_password === password) {
      sessionStorage.setItem(`unlock_${projectTitle}`, 'true');
      onUnlock();
    } else {
      setError(true);
    }
    setChecking(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h2 className="font-display text-2xl text-foreground">Conteúdo Privado</h2>
        <p className="mt-2 text-sm text-muted-foreground font-body">
          Este projeto requer uma senha para visualização.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            placeholder="Digite a senha"
            className="w-full rounded-sm border border-border bg-secondary px-4 py-3 text-sm text-foreground font-body placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
          {error && (
            <p className="text-xs text-destructive font-body">Senha incorreta. Tente novamente.</p>
          )}
          <button
            type="submit"
            disabled={checking || !password}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 text-sm font-body text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {checking ? 'Verificando...' : 'Acessar'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
