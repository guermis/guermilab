import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Edit2, GripVertical, Trash2, Upload, X } from 'lucide-react';
import type { VideoItem } from '@/types/models';

interface Props {
  type: 'vertical' | 'horizontal';
}

const EMPTY_FORM = { title: '', client: '', duration: '', video_url: '', thumbnail_url: '' };

export function VideoManager({ type }: Props) {
  const qc = useQueryClient();
  const table = type === 'vertical' ? 'videos_vertical' : 'videos_horizontal';
  const [items, setItems] = useState<VideoItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from(table).select('*').order('sort_order');
    if (data) setItems(data as VideoItem[]);
    qc.invalidateQueries({ queryKey: ['videos', type] });
  }, [table, qc, type]);

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
    try {
      const payload = {
        title: form.title,
        client: form.client || null,
        duration: form.duration || null,
        video_url: form.video_url || null,
        thumbnail_url: form.thumbnail_url || null,
      };
      if (editId) {
        const { error } = await supabase.from(table).update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('Vídeo atualizado');
      } else {
        const { error } = await supabase
          .from(table)
          .insert({ ...payload, sort_order: items.length });
        if (error) throw error;
        toast.success('Vídeo adicionado');
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      fetchItems();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro: ' + msg);
    }
    setUploading(false);
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
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { toast.error('Erro ao deletar: ' + error.message); return; }
    toast.success('Vídeo removido');
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
      <h2 className="text-foreground text-xl font-semibold">
        Vídeos {type === 'vertical' ? 'Verticais (9:16)' : 'Horizontais (16:9)'}
      </h2>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <button
              onClick={() => moveItem(i, -1)}
              disabled={i === 0}
              className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            {item.thumbnail_url && (
              <img src={item.thumbnail_url} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.client || 'Sem cliente'} · {item.duration || 'Sem duração'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(item)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Edit2 className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
            <Button variant="outline" onClick={() => { setEditId(null); setForm(EMPTY_FORM); }} className="rounded-full">
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
