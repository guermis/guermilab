import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, FileText, Image, LogOut, Monitor, Smartphone } from 'lucide-react';
import type { AdminTab } from '@/types/models';
import { HeroManager } from '@/components/admin/HeroManager';
import { VideoManager } from '@/components/admin/VideoManager';
import { AlbumManager } from '@/components/admin/AlbumManager';
import { AboutManager } from '@/components/admin/AboutManager';

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'hero', label: 'Hero', icon: <Image className="h-3.5 w-3.5" /> },
  { id: 'vertical', label: 'Vertical', icon: <Smartphone className="h-3.5 w-3.5" /> },
  { id: 'horizontal', label: 'Horizontal', icon: <Monitor className="h-3.5 w-3.5" /> },
  { id: 'fotografia', label: 'Fotografia', icon: <Camera className="h-3.5 w-3.5" /> },
  { id: 'sobre', label: 'Sobre', icon: <FileText className="h-3.5 w-3.5" /> },
];

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('hero');
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPass,
    });
    if (error) setLoginError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass rounded-2xl p-8 w-full max-w-sm glass-glow">
          <h1 className="text-foreground text-xl font-semibold mb-6 text-center">Guermi Lab Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input placeholder="E-mail" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="bg-secondary/50 border-border" />
            <Input type="password" placeholder="Senha" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="bg-secondary/50 border-border" />
            {loginError && <p className="text-destructive text-xs">{loginError}</p>}
            <Button type="submit" className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90">Entrar</Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 md:px-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-body">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <span className="text-muted-foreground/30">|</span>
          <span className="font-display text-sm tracking-widest text-foreground uppercase">Guermi Lab Admin</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </header>

      <div className="border-b border-border px-6 md:px-16">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs tracking-[0.15em] uppercase font-body flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8 md:px-16 max-w-4xl">
        {activeTab === 'hero' && <HeroManager />}
        {activeTab === 'vertical' && <VideoManager type="vertical" />}
        {activeTab === 'horizontal' && <VideoManager type="horizontal" />}
        {activeTab === 'fotografia' && <AlbumManager />}
        {activeTab === 'sobre' && <AboutManager />}
      </div>
    </main>
  );
}
