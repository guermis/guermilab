import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface LinksProfile {
  id: string;
  avatar_url: string | null;
  name: string;
  description: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon_url: string | null;
  sort_order: number;
}

export default function LinksPage() {
  const [profile, setProfile] = useState<LinksProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = profile?.name
      ? `${profile.name} — Links`
      : 'Links';
  }, [profile?.name]);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: l }] = await Promise.all([
        supabase.from('links_profile').select('*').limit(1).maybeSingle(),
        supabase.from('links').select('*').order('sort_order'),
      ]);
      setProfile((p as LinksProfile) ?? null);
      setLinks((l as LinkItem[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-background bg-ambient film-grain flex items-start justify-center px-5 py-16 md:py-24 relative">
      <div className="w-full max-w-md relative z-10">
        {/* Profile */}
        <header className="flex flex-col items-center text-center mb-10">
          <div className="w-28 h-28 rounded-full overflow-hidden glass glass-glow mb-5 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || 'Avatar'}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full bg-secondary" />
            )}
          </div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground tracking-tight mb-2">
            {profile?.name || (loading ? '' : 'Sem nome')}
          </h1>
          {profile?.description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {profile.description}
            </p>
          )}
        </header>

        {/* Links */}
        <ul className="space-y-3">
          {links.map(link => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass glass-glow rounded-2xl px-4 py-4 flex items-center gap-4 transition-all duration-300 hover:border-accent/40 hover:-translate-y-0.5 group"
              >
                <span className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center shrink-0 overflow-hidden">
                  {link.icon_url ? (
                    <img
                      src={link.icon_url}
                      alt=""
                      className="w-6 h-6 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-accent text-sm font-display">↗</span>
                  )}
                </span>
                <span className="flex-1 text-center font-body text-sm tracking-wide text-foreground group-hover:text-accent transition-colors">
                  {link.title}
                </span>
                <span className="w-6 shrink-0" aria-hidden />
              </a>
            </li>
          ))}
          {!loading && links.length === 0 && (
            <li className="text-center text-xs text-muted-foreground py-8">
              Nenhum link cadastrado.
            </li>
          )}
        </ul>

        <footer className="mt-12 text-center">
          <Link
            to="/"
            className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60 hover:text-accent transition-colors"
          >
            Guermi Lab
          </Link>
        </footer>
      </div>
    </main>
  );
}
