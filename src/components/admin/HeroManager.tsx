import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Upload } from 'lucide-react';
import type { HeroImageItem } from '@/types/models';

/**
 * Hero singleton manager — single 16:9 video.
 * The hero is now a video (autoplay/muted/loop) instead of an image,
 * to eliminate any "flash of stale image" while loading.
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
    setCurrent((data as HeroImageItem) ?? null);
  }, []);

  useEffect(() => { fetchCurrent(); }, [fetchCurrent]);

  const extractStoragePath = (publicUrl: string | null): string | null => {
    if (!publicUrl) return null;
    const marker = '/storage/v1/object/public/media/';
    const idx = publicUrl.indexOf(marker);
    return idx === -1 ? null : publicUrl.substring(idx + marker.length);
  };

  const invalidate = () => qc.invalidateQueries({ queryKey: ['hero_images'] });

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Envie um arquivo de vídeo (MP4, WebM...).');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `hero/video-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);

      const previous = current;
      if (previous) {
        const { error: updateError } = await supabase
          .from('hero_images')
          .update({ video_url: publicUrl, updated_at: new Date().toISOString() })
          .eq('id', previous.id);
        if (updateError) throw updateError;

        const oldPath = extractStoragePath(previous.video_url);
        if (oldPath) await supabase.storage.from('media').remove([oldPath]);
      } else {
        const { error: insertError } = await supabase
          .from('hero_images')
          .insert({ video_url: publicUrl, sort_order: 0 });
        if (insertError) throw insertError;
      }

      toast.success('Vídeo do hero atualizado');
      await fetchCurrent();
      invalidate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao enviar vídeo: ' + msg);
    }
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!current) return;
    const oldPath = extractStoragePath(current.video_url);
    const { error } = await supabase.from('hero_images').delete().eq('id', current.id);
    if (error) { toast.error('Erro ao remover: ' + error.message); return; }
    if (oldPath) await supabase.storage.from('media').remove([oldPath]);
    // Also clean up any legacy image files attached to this row
    const legacyH = extractStoragePath(current.image_url);
    const legacyV = extractStoragePath(current.image_url_vertical);
    const toRemove = [legacyH, legacyV].filter(Boolean) as string[];
    if (toRemove.length) await supabase.storage.from('media').remove(toRemove);
    toast.success('Vídeo removido');
    await fetchCurrent();
    invalidate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold mb-1">Vídeo do Hero</h2>
        <p className="text-xs text-muted-foreground">
          Vídeo único <strong>16:9</strong> exibido no topo da página.
          Reproduz automaticamente, sem som e em loop. Recomendado: MP4, &lt; 15&nbsp;MB.
        </p>
      </div>

      {current?.video_url && (
        <div className="glass rounded-xl p-3 relative">
          <video
            key={current.video_url}
            src={current.video_url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full rounded-lg aspect-video object-cover"
          />
          <button
            onClick={handleDelete}
            className="absolute top-5 right-5 glass rounded-full p-2 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remover vídeo do hero"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <label className="cursor-pointer block">
        <div className="glass rounded-xl p-5 border-2 border-dashed border-border flex items-center justify-center hover:border-accent/50 transition-colors">
          <div className="text-center">
            <Upload className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {uploading
                ? 'Enviando...'
                : current?.video_url
                  ? 'Clique para substituir o vídeo'
                  : 'Clique para fazer upload do vídeo'}
            </p>
          </div>
        </div>
        <input
          type="file"
          accept="video/*"
          className="hidden"
          disabled={uploading}
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}
