import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExternalLink, GripVertical, ImagePlus, Plus, Trash2, Upload } from 'lucide-react';
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

export function LinksManager() {
  const [profile, setProfile] = useState<LinksProfile | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [uploadingIconId, setUploadingIconId] = useState<string | null>(null);

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

  useEffect(() => { fetchAll(); }, [fetchAll]);

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

  const removeIcon = async (link: LinkItem) => {
    const old = extractStoragePath(link.icon_url);
    await updateLink(link.id, { icon_url: null });
    if (old) await supabase.storage.from('media').remove([old]);
    toast.success('Ícone removido');
  };

  const uploadIcon = async (link: LinkItem, file: File) => {
    const ok = ['image/svg+xml', 'image/png', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!ok.includes(file.type) && !/\.(svg|png|ico)$/i.test(file.name)) {
      toast.error('Use .svg, .png ou .ico');
      return;
    }
    setUploadingIconId(link.id);
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
    setUploadingIconId(null);
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

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-xl font-semibold">Página de Links</h2>
        <a
          href="/links"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          <ExternalLink className="h-4 w-4" /> Ver página
        </a>
      </div>

      {/* Profile section */}
      <section className="space-y-5">
        <h3 className="text-foreground text-sm tracking-[0.15em] uppercase">Perfil</h3>
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
        <h3 className="text-foreground text-sm tracking-[0.15em] uppercase">Botões</h3>

        <div className="glass rounded-xl p-4 flex flex-col md:flex-row gap-3">
          <Input placeholder="Título" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-secondary/50 border-border" />
          <Input placeholder="https://..." value={newUrl} onChange={e => setNewUrl(e.target.value)} className="bg-secondary/50 border-border" />
          <Button onClick={addLink} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        <ul className="space-y-3">
          {links.map((link, i) => (
            <li key={link.id} className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-muted-foreground">
                  <button onClick={() => move(i, -1)} className="hover:text-foreground text-xs leading-none" aria-label="Mover para cima">▲</button>
                  <GripVertical className="h-3 w-3 my-0.5" />
                  <button onClick={() => move(i, 1)} className="hover:text-foreground text-xs leading-none" aria-label="Mover para baixo">▼</button>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    value={link.title}
                    onChange={e => setLinks(prev => prev.map(l => l.id === link.id ? { ...l, title: e.target.value } : l))}
                    onBlur={e => e.target.value !== '' && updateLink(link.id, { title: e.target.value })}
                    className="bg-secondary/50 border-border"
                    placeholder="Título"
                  />
                  <Input
                    value={link.url}
                    onChange={e => setLinks(prev => prev.map(l => l.id === link.id ? { ...l, url: e.target.value } : l))}
                    onBlur={e => e.target.value !== '' && updateLink(link.id, { url: e.target.value })}
                    className="bg-secondary/50 border-border"
                    placeholder="https://..."
                  />
                </div>

                <button
                  onClick={() => deleteLink(link)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-2"
                  aria-label="Remover botão"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Ícone — bem visível e em estilo glass */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center overflow-hidden shrink-0">
                  {link.icon_url
                    ? <img src={link.icon_url} alt="" className="w-7 h-7 object-contain" />
                    : <ImagePlus className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs tracking-[0.12em] uppercase text-muted-foreground mb-1">Ícone do botão</p>
                  <p className="text-[11px] text-muted-foreground/70">Aceita .svg, .png ou .ico</p>
                </div>
                <label className="cursor-pointer">
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs tracking-[0.12em] uppercase glass hover:border-accent/50 hover:text-accent transition-colors ${uploadingIconId === link.id ? 'opacity-60 pointer-events-none' : 'text-foreground'}`}>
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingIconId === link.id ? 'Enviando...' : link.icon_url ? 'Substituir' : 'Enviar ícone'}
                  </span>
                  <input
                    type="file"
                    accept=".svg,.png,.ico,image/svg+xml,image/png,image/x-icon"
                    className="hidden"
                    disabled={uploadingIconId === link.id}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadIcon(link, f); e.target.value = ''; }}
                  />
                </label>
                {link.icon_url && (
                  <button
                    onClick={() => removeIcon(link)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-2"
                    aria-label="Remover ícone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
          {links.length === 0 && (
            <li className="text-center text-xs text-muted-foreground py-6">Nenhum botão ainda.</li>
          )}
        </ul>
        <p className="text-[11px] text-muted-foreground">
          Edições em título/URL são salvas ao sair do campo.
        </p>
      </section>
    </div>
  );
}
