import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Upload } from 'lucide-react';
import type { HeroImageItem } from '@/types/models';

type Variant = 'horizontal' | 'vertical';

/**
 * Hero singleton manager: a single row holds BOTH the horizontal (16:9)
 * and vertical (4:3) hero images. Each upload atomically replaces its
 * variant (DB column + storage object).
 */
export function HeroManager() {
  const qc = useQueryClient();
  const [current, setCurrent] = useState<HeroImageItem | null>(null);
  const [uploading, setUploading] = useState<Variant | null>(null);

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

  const handleUpload = async (file: File, variant: Variant) => {
    setUploading(variant);
    try {
      const ext = file.name.split('.').pop();
      const path = `hero/${variant}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);

      const previous = current;
      const column = variant === 'horizontal' ? 'image_url' : 'image_url_vertical';

      if (previous) {
        const { error: updateError } = await supabase
          .from('hero_images')
          .update({ [column]: publicUrl, updated_at: new Date().toISOString() })
          .eq('id', previous.id);
        if (updateError) throw updateError;

        const oldUrl = variant === 'horizontal' ? previous.image_url : previous.image_url_vertical;
        const oldPath = extractStoragePath(oldUrl);
        if (oldPath) await supabase.storage.from('media').remove([oldPath]);
      } else {
        // First-ever insert: image_url is NOT NULL in DB, so seed it.
        const insertPayload = variant === 'horizontal'
          ? { image_url: publicUrl, image_url_vertical: null, sort_order: 0 }
          : { image_url: publicUrl, image_url_vertical: publicUrl, sort_order: 0 };
        const { error: insertError } = await supabase
          .from('hero_images')
          .insert(insertPayload);
        if (insertError) throw insertError;
      }

      toast.success(`Hero ${variant === 'horizontal' ? '16:9' : '4:3'} atualizada`);
      await fetchCurrent();
      invalidate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao enviar imagem: ' + msg);
    }
    setUploading(null);
  };

  const handleDelete = async (variant: Variant) => {
    if (!current) return;
    const oldUrl = variant === 'horizontal' ? current.image_url : current.image_url_vertical;
    const oldPath = extractStoragePath(oldUrl);

    if (variant === 'vertical') {
      const { error } = await supabase
        .from('hero_images')
        .update({ image_url_vertical: null, updated_at: new Date().toISOString() })
        .eq('id', current.id);
      if (error) { toast.error('Erro ao remover: ' + error.message); return; }
    } else {
      // Horizontal is the required one — delete the entire row.
      const { error } = await supabase.from('hero_images').delete().eq('id', current.id);
      if (error) { toast.error('Erro ao remover: ' + error.message); return; }
      const vPath = extractStoragePath(current.image_url_vertical);
      if (vPath) await supabase.storage.from('media').remove([vPath]);
    }

    if (oldPath) await supabase.storage.from('media').remove([oldPath]);
    toast.success('Imagem removida');
    await fetchCurrent();
    invalidate();
  };

  const Slot = ({ variant, label, hint, ratioClass, currentUrl }: {
    variant: Variant;
    label: string;
    hint: string;
    ratioClass: string;
    currentUrl: string | null;
  }) => (
    <div className="space-y-3">
      <div>
        <h3 className="text-foreground text-sm font-semibold">{label}</h3>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>

      {currentUrl && (
        <div className="glass rounded-xl p-3 relative">
          <img src={currentUrl} alt={label} className={`w-full rounded-lg ${ratioClass} object-cover`} />
          <button
            onClick={() => handleDelete(variant)}
            className="absolute top-5 right-5 glass rounded-full p-2 text-muted-foreground hover:text-destructive transition-colors"
            aria-label={`Remover hero ${label}`}
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
              {uploading === variant
                ? 'Enviando...'
                : currentUrl
                  ? 'Clique para substituir'
                  : 'Clique para fazer upload'}
            </p>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading !== null}
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f, variant);
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-foreground text-xl font-semibold mb-1">Imagem Hero</h2>
        <p className="text-xs text-muted-foreground">
          Envie duas versões: <strong>16:9</strong> (desktop/tablet em paisagem) e <strong>4:3</strong> (mobile/retrato).
          O site escolhe automaticamente conforme a orientação da tela.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Slot
          variant="horizontal"
          label="Versão Horizontal (16:9)"
          hint="Exibida em telas largas (PC e tablets em paisagem)."
          ratioClass="aspect-[16/9]"
          currentUrl={current?.image_url ?? null}
        />
        <Slot
          variant="vertical"
          label="Versão Vertical (4:3)"
          hint="Exibida em smartphones e telas em modo retrato."
          ratioClass="aspect-[4/3]"
          currentUrl={current?.image_url_vertical ?? null}
        />
      </div>
    </div>
  );
}
