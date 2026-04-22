import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Upload } from 'lucide-react';
import type { HeroImageItem } from '@/types/models';

/**
 * Hero singleton manager: only ONE hero image exists at a time.
 * Uploading a new one atomically replaces the previous (DB row + storage object).
 */
export function HeroManager() {
  const qc = useQueryClient();
  const [current, setCurrent] = useState<HeroImageItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchCurrent = useCallback(async () => {
    const { data } = await supabase
      .from('hero_images')
      .select('*')
      .order('sort_order')
      .limit(1)
      .maybeSingle();
    setCurrent(data ?? null);
  }, []);

  useEffect(() => { fetchCurrent(); }, [fetchCurrent]);

  const extractStoragePath = (publicUrl: string): string | null => {
    const marker = '/storage/v1/object/public/media/';
    const idx = publicUrl.indexOf(marker);
    return idx === -1 ? null : publicUrl.substring(idx + marker.length);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `hero/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);

      // Snapshot of previous state to delete after the new one is committed
      const previous = current;

      if (previous) {
        // Atomically swap by updating the existing row (no flicker)
        const { error: updateError } = await supabase
          .from('hero_images')
          .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
          .eq('id', previous.id);
        if (updateError) throw updateError;

        const oldPath = extractStoragePath(previous.image_url);
        if (oldPath) await supabase.storage.from('media').remove([oldPath]);
      } else {
        const { error: insertError } = await supabase
          .from('hero_images')
          .insert({ image_url: publicUrl, sort_order: 0 });
        if (insertError) throw insertError;
      }

      toast.success('Imagem hero atualizada');
      await fetchCurrent();
      qc.invalidateQueries({ queryKey: ['hero_images'] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao enviar imagem: ' + msg);
    }
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!current) return;
    const oldPath = extractStoragePath(current.image_url);
    const { error } = await supabase.from('hero_images').delete().eq('id', current.id);
    if (error) { toast.error('Erro ao deletar: ' + error.message); return; }
    if (oldPath) await supabase.storage.from('media').remove([oldPath]);
    toast.success('Imagem removida');
    await fetchCurrent();
    qc.invalidateQueries({ queryKey: ['hero_images'] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold mb-1">Imagem Hero</h2>
        <p className="text-xs text-muted-foreground">Apenas uma imagem por vez. O upload substitui a atual automaticamente.</p>
      </div>

      {current && (
        <div className="glass rounded-xl p-4 relative">
          <img src={current.image_url} alt="hero" className="w-full rounded-xl aspect-[21/9] object-cover" />
          <button
            onClick={handleDelete}
            className="absolute top-6 right-6 glass rounded-full p-2 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remover imagem hero"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <label className="cursor-pointer block">
        <div className="glass rounded-xl p-6 border-2 border-dashed border-border flex items-center justify-center hover:border-accent/50 transition-colors">
          <div className="text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {uploading ? 'Enviando...' : current ? 'Clique para substituir a imagem atual' : 'Clique para fazer upload'}
            </p>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }}
        />
      </label>
    </div>
  );
}
