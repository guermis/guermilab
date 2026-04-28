import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, GripVertical, LogOut, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

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

const extractStoragePath = (publicUrl: string | null): string | null => {
  if (!publicUrl) return null;
  const marker = '/storage/v1/object/public/media/';
  const idx = publicUrl.indexOf(marker);
  return idx === -1 ? null : publicUrl.substring(idx + marker.length);
};

export default function LinksAdminPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const [profile, setProfile] = useState<LinksProfile | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchAll = useCallback(async () => {
    const [{ data: p }, { data: l }] = await Promise.all([
      supabase.from('links_profile').select('*').limit(1).maybeSingle(),
      supabase.from('links').select('*').order('sort_order'),
    ]);
    const prof = (p as LinksProfile) ?? null;
    setProfile(prof);
    setName(prof?.name ?? '');
    setDescription(prof?.description ?? '');
    setLinks((l as LinkItem[]) ?? []);
  }, []);

  useEffect(() => { if (isLoggedIn) fetchAll(); }, [isLoggedIn, fetchAll]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPass });
    if (error) setLoginError(error.message);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  // Profile
  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      if (profile) {
        const { error } = await supabase
          .from('links_profile')
          .update({ name, description })
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('links_profile').insert({ name, description });
        if (error) throw error;
      }
      toast.success('Perfil salvo');
      await fetchAll();
    } catch (err) {
      toast.error('Erro: ' + (err instanceof Error ? err.message : 'desconhecido'));
    }
    setSavingProfile(false);
  };

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Envie uma imagem.'); return; }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `links/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('media').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);

      if (profile) {
        const { error } = await supabase
          .from('links_profile').update({ avatar_url: publicUrl }).eq('id', profile.id);
        if (error) throw error;
        const old = extractStoragePath(profile.avatar_url);
        if (old) await supabase.storage.from('media').remove([old]);
      } else {
        const { error } = await supabase.from('links_profile').insert({ avatar_url: publicUrl, name, description });
        if (error) throw error;
      }
      toast.success('Foto atualizada');
      await fetchAll();
    } catch (err) {
      toast.error('Erro: ' + (err instanceof Error ? err.message : 'desconhecido'));
    }
    setUploadingAvatar(false);
  };

  // Links
  const addLink = async () => {
    if (!newTitle.trim() || !newUrl.trim()) { toast.error('Preencha título e URL'); return; }
    const { error } = await supabase.from('links').insert({
      title: newTitle.trim(),
      url: newUrl.trim(),
      sort_order: links.length,
    });
    if (error) { toast.error('Erro: ' + error.message); return; }
    setNewTitle(''); setNewUrl('');
    toast.success('Botão adicionado');
    fetchAll();
  };

  const updateLink = async (id: string, patch: Partial<LinkItem>) => {
    const { error } = await supabase.from('links').update(patch).eq('id', id);
    if (error) { toast.error('Erro: ' + error.message); return; }
    fetchAll();
  };

  const deleteLink = async (link: LinkItem) => {
    const { error } = await supabase.from('links').delete().eq('id', link.id);
    if (error) { toast.error('Erro: ' + error.message); return; }
    const old = extractStoragePath(link.icon_url);
    if (old) await supabase.storage.from('media').remove([old]);
    toast.success('Botão removido');
    fetchAll();
  };

  const uploadIcon = async (link: LinkItem, file: File) => {
    const ok = ['image/svg+xml', 'image/png', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!ok.includes(file.type) && !/\.(svg|png|ico)$/i.test(file.name)) {
      toast.error('Use .svg, .png ou .ico');
      return;
    }
    try {
      const ext = file.name.split('.').pop();
      const path = `links/icons/${link.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('media').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || 'image/png' });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      const old = extractStoragePath(link.icon_url);
      await updateLink(link.id, { icon_url: publicUrl });
      if (old) await supabase.storage.from('media').remove([old]);
      toast.success('Ícone atualizado');
    } catch (err) {
      toast.error('Erro: ' + (err instanceof Error ? err.message : 'desconhecido'));
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= links.length) return;
    const a = links[index]; const b = links[target];
    await Promise.all([
      supabase.from('links').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('links').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    fetchAll();
  };

  if (isLoading) {
    return <main className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></main>;
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="glass rounded-2xl p-8 w-full max-w-sm glass-glow">
          <h1 className="text-foreground text-xl font-semibold mb-6 text-center">Links Admin</h1>
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
          <span className="font-display text-sm tracking-widest text-foreground uppercase">Links Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/links" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="h-4 w-4" /> Ver página
          </a>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </header>

      <div className="px-6 py-8 md:px-16 max-w-3xl space-y-10">
        {/* Profile section */}
        <section className="space-y-5">
          <h2 className="text-foreground text-xl font-semibold">Perfil</h2>
          <div className="flex items-start gap-5">
            <div className="w-24 h-24 rounded-full overflow-hidden glass shrink-0 flex items-center justify-center">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-secondary" />}
            </div>
            <label className="cursor-pointer flex-1">
              <div className="glass rounded-xl p-5 border-2 border-dashed border-border flex items-center justify-center hover:border-accent/50 transition-colors">
                <div className="text-center">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploadingAvatar ? 'Enviando...' : profile?.avatar_url ? 'Substituir foto' : 'Enviar foto'}
                  </p>
                </div>
              </div>
              <input
                type="file" accept="image/*" className="hidden" disabled={uploadingAvatar}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ''; }}
              />
            </label>
          </div>

          <div className="space-y-3">
            <Input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} className="bg-secondary/50 border-border" />
            <textarea
              placeholder="Descrição"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <Button onClick={saveProfile} disabled={savingProfile} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              {savingProfile ? 'Salvando...' : 'Salvar perfil'}
            </Button>
          </div>
        </section>

        {/* Links section */}
        <section className="space-y-5">
          <h2 className="text-foreground text-xl font-semibold">Botões</h2>

          <div className="glass rounded-xl p-4 flex flex-col md:flex-row gap-3">
            <Input placeholder="Título" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-secondary/50 border-border" />
            <Input placeholder="https://..." value={newUrl} onChange={e => setNewUrl(e.target.value)} className="bg-secondary/50 border-border" />
            <Button onClick={addLink} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>

          <ul className="space-y-3">
            {links.map((link, i) => (
              <li key={link.id} className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="flex flex-col text-muted-foreground">
                  <button onClick={() => move(i, -1)} className="hover:text-foreground text-xs leading-none">▲</button>
                  <GripVertical className="h-3 w-3 my-0.5" />
                  <button onClick={() => move(i, 1)} className="hover:text-foreground text-xs leading-none">▼</button>
                </div>

                <label className="w-12 h-12 rounded-lg bg-secondary/60 shrink-0 flex items-center justify-center cursor-pointer overflow-hidden hover:ring-2 hover:ring-accent/40 transition">
                  {link.icon_url
                    ? <img src={link.icon_url} alt="" className="w-7 h-7 object-contain" />
                    : <Upload className="h-4 w-4 text-muted-foreground" />}
                  <input
                    type="file" accept=".svg,.png,.ico,image/svg+xml,image/png,image/x-icon" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadIcon(link, f); e.target.value = ''; }}
                  />
                </label>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    value={link.title}
                    onChange={e => setLinks(prev => prev.map(l => l.id === link.id ? { ...l, title: e.target.value } : l))}
                    onBlur={e => e.target.value !== '' && updateLink(link.id, { title: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                  <Input
                    value={link.url}
                    onChange={e => setLinks(prev => prev.map(l => l.id === link.id ? { ...l, url: e.target.value } : l))}
                    onBlur={e => e.target.value !== '' && updateLink(link.id, { url: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>

                <button
                  onClick={() => deleteLink(link)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-2"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            {links.length === 0 && (
              <li className="text-center text-xs text-muted-foreground py-6">Nenhum botão ainda.</li>
            )}
          </ul>
          <p className="text-[11px] text-muted-foreground">
            Ícones aceitos: .svg, .png ou .ico. Edições em título/URL são salvas ao sair do campo.
          </p>
        </section>
      </div>
    </main>
  );
}
