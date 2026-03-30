import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, LogOut, Image, Smartphone, Monitor, Camera,
  Upload, Plus, Trash2, GripVertical, Edit2, Check, X, FileText
} from 'lucide-react';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'guermilab2024';

type Tab = 'hero' | 'vertical' | 'horizontal' | 'fotografia' | 'sobre';

interface VideoItem {
  id: string;
  title: string;
  client: string | null;
  duration: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  sort_order: number;
}

interface AlbumItem {
  id: string;
  title: string;
  cover_image_url: string | null;
  sort_order: number;
}

interface PhotoItem {
  id: string;
  album_id: string;
  image_url: string;
  sort_order: number;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Credenciais inválidas');
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass rounded-2xl p-8 w-full max-w-sm glass-glow">
          <h1 className="text-foreground text-xl font-semibold mb-6 text-center">Guermi Lab Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input placeholder="Usuário" value={loginUser} onChange={e => setLoginUser(e.target.value)} className="bg-secondary/50 border-border" />
            <Input type="password" placeholder="Senha" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="bg-secondary/50 border-border" />
            {loginError && <p className="text-destructive text-xs">{loginError}</p>}
            <Button type="submit" className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90">Entrar</Button>
          </form>
        </div>
      </main>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'hero', label: 'Hero', icon: <Image className="h-3.5 w-3.5" /> },
    { id: 'vertical', label: 'Vertical', icon: <Smartphone className="h-3.5 w-3.5" /> },
    { id: 'horizontal', label: 'Horizontal', icon: <Monitor className="h-3.5 w-3.5" /> },
    { id: 'fotografia', label: 'Fotografia', icon: <Camera className="h-3.5 w-3.5" /> },
    { id: 'sobre', label: 'Sobre', icon: <FileText className="h-3.5 w-3.5" /> },
  ];

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
        <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </header>

      <div className="border-b border-border px-6 md:px-16">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map(tab => (
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

// ─── HERO MANAGER ───
function HeroManager() {
  const [images, setImages] = useState<{ id: string; image_url: string; sort_order: number }[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    const { data } = await supabase.from('hero_images').select('*').order('sort_order');
    if (data) setImages(data);
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `hero/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(path, file);
    if (uploadError) { setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
    await supabase.from('hero_images').insert({ image_url: publicUrl, sort_order: images.length });
    setUploading(false);
    fetchImages();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('hero_images').delete().eq('id', id);
    fetchImages();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold mb-1">Imagem Hero</h2>
        <p className="text-xs text-muted-foreground">Imagem principal do topo do site.</p>
      </div>

      {images.map(img => (
        <div key={img.id} className="glass rounded-xl p-4 relative">
          <img src={img.image_url} alt="hero" className="w-full rounded-xl aspect-[21/9] object-cover" />
          <button onClick={() => handleDelete(img.id)} className="absolute top-6 right-6 glass rounded-full p-2 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <label className="cursor-pointer block">
        <div className="glass rounded-xl p-6 border-2 border-dashed border-border flex items-center justify-center hover:border-accent/50 transition-colors">
          <div className="text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{uploading ? 'Enviando...' : 'Clique para fazer upload'}</p>
          </div>
        </div>
        <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
      </label>
    </div>
  );
}

// ─── VIDEO MANAGER ───
function VideoManager({ type }: { type: 'vertical' | 'horizontal' }) {
  const table = type === 'vertical' ? 'videos_vertical' : 'videos_horizontal';
  const [items, setItems] = useState<VideoItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', client: '', duration: '', video_url: '', thumbnail_url: '' });
  const [uploading, setUploading] = useState(false);

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from(table).select('*').order('sort_order');
    if (data) setItems(data as VideoItem[]);
  }, [table]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleThumbnailUpload = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${type}/${Date.now()}.${ext}`;
    await supabase.storage.from('media').upload(path, file);
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
    return publicUrl;
  };

  const handleSave = async () => {
    setUploading(true);
    if (editId) {
      await supabase.from(table).update({
        title: form.title,
        client: form.client || null,
        duration: form.duration || null,
        video_url: form.video_url || null,
        thumbnail_url: form.thumbnail_url || null,
      }).eq('id', editId);
    } else {
      await supabase.from(table).insert({
        title: form.title,
        client: form.client || null,
        duration: form.duration || null,
        video_url: form.video_url || null,
        thumbnail_url: form.thumbnail_url || null,
        sort_order: items.length,
      });
    }
    setForm({ title: '', client: '', duration: '', video_url: '', thumbnail_url: '' });
    setEditId(null);
    setUploading(false);
    fetchItems();
  };

  const handleEdit = (item: VideoItem) => {
    setEditId(item.id);
    setForm({
      title: item.title,
      client: item.client || '',
      duration: item.duration || '',
      video_url: item.video_url || '',
      thumbnail_url: item.thumbnail_url || '',
    });
  };

  const handleDelete = async (id: string) => {
    await supabase.from(table).delete().eq('id', id);
    fetchItems();
  };

  const moveItem = async (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= items.length) return;
    const updated = [...items];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    for (let i = 0; i < updated.length; i++) {
      await supabase.from(table).update({ sort_order: i }).eq('id', updated[i].id);
    }
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-foreground text-xl font-semibold">Vídeos {type === 'vertical' ? 'Verticais (9:16)' : 'Horizontais (16:9)'}</h2>

      {/* Item list */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                <GripVertical className="h-4 w-4" />
              </button>
            </div>
            {item.thumbnail_url && <img src={item.thumbnail_url} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.client || 'Sem cliente'} · {item.duration || 'Sem duração'}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(item)} className="text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="text-sm text-foreground font-medium">{editId ? 'Editar vídeo' : 'Adicionar vídeo'}</h3>
        <Input placeholder="Título" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="bg-secondary/50 border-border" />
        <Input placeholder="Cliente / Empresa" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} className="bg-secondary/50 border-border" />
        <Input placeholder="Duração (ex: 2:30)" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} className="bg-secondary/50 border-border" />
        <Input placeholder="Link do vídeo (YouTube, Vimeo...)" value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} className="bg-secondary/50 border-border" />

        <div>
          <label className="text-xs text-muted-foreground block mb-1">Thumbnail</label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer glass rounded-lg px-4 py-2 text-xs text-foreground/70 hover:text-foreground transition-colors flex items-center gap-2">
              <Upload className="h-3.5 w-3.5" /> Escolher imagem
              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                const f = e.target.files?.[0];
                if (f) {
                  const url = await handleThumbnailUpload(f);
                  setForm(p => ({ ...p, thumbnail_url: url }));
                }
              }} />
            </label>
            {form.thumbnail_url && <img src={form.thumbnail_url} alt="preview" className="h-10 w-10 rounded-lg object-cover" />}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!form.title || uploading} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Check className="h-4 w-4 mr-1" /> {editId ? 'Salvar' : 'Adicionar'}
          </Button>
          {editId && (
            <Button variant="outline" onClick={() => { setEditId(null); setForm({ title: '', client: '', duration: '', video_url: '', thumbnail_url: '' }); }} className="rounded-full">
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ALBUM MANAGER ───
function AlbumManager() {
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumItem | null>(null);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [editAlbumId, setEditAlbumId] = useState<string | null>(null);
  const [editAlbumTitle, setEditAlbumTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchAlbums = useCallback(async () => {
    const { data } = await supabase.from('photography_albums').select('*').order('sort_order');
    if (data) setAlbums(data);
  }, []);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  const createAlbum = async () => {
    if (!newAlbumTitle.trim()) return;
    await supabase.from('photography_albums').insert({ title: newAlbumTitle.trim(), sort_order: albums.length });
    setNewAlbumTitle('');
    fetchAlbums();
  };

  const updateAlbumTitle = async (id: string) => {
    await supabase.from('photography_albums').update({ title: editAlbumTitle }).eq('id', id);
    setEditAlbumId(null);
    fetchAlbums();
  };

  const deleteAlbum = async (id: string) => {
    await supabase.from('photography_albums').delete().eq('id', id);
    if (selectedAlbum?.id === id) setSelectedAlbum(null);
    fetchAlbums();
  };

  const uploadCover = async (albumId: string, file: File) => {
    const ext = file.name.split('.').pop();
    const path = `albums/${albumId}/cover.${ext}`;
    await supabase.storage.from('media').upload(path, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
    await supabase.from('photography_albums').update({ cover_image_url: publicUrl }).eq('id', albumId);
    fetchAlbums();
  };

  if (selectedAlbum) {
    return <PhotoManager album={selectedAlbum} onBack={() => { setSelectedAlbum(null); fetchAlbums(); }} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-foreground text-xl font-semibold">Álbuns de Fotografia</h2>

      <div className="space-y-3">
        {albums.map((album) => (
          <div key={album.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0 bg-secondary">
              {album.cover_image_url ? (
                <img src={album.cover_image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center"><Camera className="h-5 w-5 text-muted-foreground" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {editAlbumId === album.id ? (
                <div className="flex gap-2">
                  <Input value={editAlbumTitle} onChange={e => setEditAlbumTitle(e.target.value)} className="bg-secondary/50 border-border h-8 text-sm" />
                  <button onClick={() => updateAlbumTitle(album.id)} className="text-accent"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditAlbumId(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <p className="text-sm text-foreground font-medium truncate">{album.title}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <label className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <Upload className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(album.id, f); }} />
              </label>
              <button onClick={() => setSelectedAlbum(album)} className="text-accent hover:text-accent/80 transition-colors"><Camera className="h-4 w-4" /></button>
              <button onClick={() => { setEditAlbumId(album.id); setEditAlbumTitle(album.title); }} className="text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="h-4 w-4" /></button>
              <button onClick={() => deleteAlbum(album.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input placeholder="Nome do álbum" value={newAlbumTitle} onChange={e => setNewAlbumTitle(e.target.value)} className="bg-secondary/50 border-border" />
        <Button onClick={createAlbum} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── PHOTO MANAGER ───
function PhotoManager({ album, onBack }: { album: AlbumItem; onBack: () => void }) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchPhotos = useCallback(async () => {
    const { data } = await supabase.from('photography_photos').select('*').eq('album_id', album.id).order('sort_order');
    if (data) setPhotos(data);
  }, [album.id]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const uploadPhotos = async (files: File[]) => {
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const path = `albums/${album.id}/${Date.now()}-${i}.${ext}`;
      await supabase.storage.from('media').upload(path, file);
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      await supabase.from('photography_photos').insert({
        album_id: album.id,
        image_url: publicUrl,
        sort_order: photos.length + i,
      });
    }
    setUploading(false);
    fetchPhotos();
  };

  const deletePhoto = async (id: string) => {
    await supabase.from('photography_photos').delete().eq('id', id);
    fetchPhotos();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h2 className="text-foreground text-xl font-semibold">{album.title} — Fotos</h2>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {photos.map(photo => (
          <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-[3/4]">
            <img src={photo.image_url} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => deletePhoto(photo.id)}
              className="absolute top-2 right-2 glass rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <label className="cursor-pointer block">
        <div className="glass rounded-xl p-6 border-2 border-dashed border-border flex items-center justify-center hover:border-accent/50 transition-colors">
          <div className="text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{uploading ? 'Enviando...' : 'Upload múltiplo de fotos'}</p>
          </div>
        </div>
        <input type="file" accept="image/*" multiple className="hidden" disabled={uploading}
          onChange={e => { const files = Array.from(e.target.files || []); if (files.length) uploadPhotos(files); }}
        />
      </label>
    </div>
  );
}

// ─── ABOUT MANAGER ───
function AboutManager() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [id, setId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('about_content').select('*').limit(1).maybeSingle();
      if (data) {
        setId(data.id);
        setTitle(data.title);
        setDescription(data.description);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    if (id) {
      await supabase.from('about_content').update({ title, description }).eq('id', id);
    } else {
      const { data } = await supabase.from('about_content').insert({ title, description }).select('id').single();
      if (data) setId(data.id);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-foreground text-xl font-semibold">Seção Sobre</h2>
      <div className="glass rounded-xl p-5 space-y-4">
        <Input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary/50 border-border" />
        <Textarea placeholder="Descrição..." value={description} onChange={e => setDescription(e.target.value)} rows={6} className="bg-secondary/50 border-border resize-none" />
        <Button onClick={handleSave} disabled={saving} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
          <Check className="h-4 w-4 mr-1" /> {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}
