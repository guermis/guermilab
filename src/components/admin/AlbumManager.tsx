import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Check, Edit2, Plus, Trash2, Upload, X } from 'lucide-react';
import type { AlbumItem, PhotoItem } from '@/types/models';

export function AlbumManager() {
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumItem | null>(null);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [editAlbumId, setEditAlbumId] = useState<string | null>(null);
  const [editAlbumTitle, setEditAlbumTitle] = useState('');

  const fetchAlbums = useCallback(async () => {
    const { data } = await supabase.from('photography_albums').select('*').order('sort_order');
    if (data) setAlbums(data);
  }, []);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  const createAlbum = async () => {
    if (!newAlbumTitle.trim()) return;
    const { error } = await supabase
      .from('photography_albums')
      .insert({ title: newAlbumTitle.trim(), sort_order: albums.length });
    if (error) { toast.error('Erro ao criar álbum: ' + error.message); return; }
    toast.success('Álbum criado');
    setNewAlbumTitle('');
    fetchAlbums();
  };

  const updateAlbumTitle = async (id: string) => {
    const { error } = await supabase.from('photography_albums').update({ title: editAlbumTitle }).eq('id', id);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Álbum renomeado');
    setEditAlbumId(null);
    fetchAlbums();
  };

  const deleteAlbum = async (id: string) => {
    const { error } = await supabase.from('photography_albums').delete().eq('id', id);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Álbum removido');
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
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const path = `albums/${album.id}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from('media').upload(path, file);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
        const { error: insErr } = await supabase.from('photography_photos').insert({
          album_id: album.id,
          image_url: publicUrl,
          sort_order: photos.length + i,
        });
        if (insErr) throw insErr;
      }
      toast.success(`${files.length} foto(s) enviada(s)`);
      fetchPhotos();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao enviar fotos: ' + msg);
    }
    setUploading(false);
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
        <input
          type="file" accept="image/*" multiple className="hidden" disabled={uploading}
          onChange={e => { const files = Array.from(e.target.files || []); if (files.length) uploadPhotos(files); }}
        />
      </label>
    </div>
  );
}
