import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Trash2, Upload } from 'lucide-react';
import type { HeroImageItem } from '@/types/models';

export function HeroManager() {
  const [images, setImages] = useState<HeroImageItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    const { data } = await supabase.from('hero_images').select('*').order('sort_order');
    if (data) setImages(data);
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `hero/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      const { error: insertError } = await supabase
        .from('hero_images')
        .insert({ image_url: publicUrl, sort_order: images.length });
      if (insertError) throw insertError;
      toast.success('Imagem hero enviada com sucesso');
      fetchImages();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao enviar imagem: ' + msg);
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('hero_images').delete().eq('id', id);
    if (error) { toast.error('Erro ao deletar: ' + error.message); return; }
    toast.success('Imagem removida');
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
          <button
            onClick={() => handleDelete(img.id)}
            className="absolute top-6 right-6 glass rounded-full p-2 text-muted-foreground hover:text-destructive transition-colors"
          >
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
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
        />
      </label>
    </div>
  );
}
