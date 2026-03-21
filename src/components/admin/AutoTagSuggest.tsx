import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface AutoTagSuggestProps {
  title: string;
  description?: string;
  category?: string;
  currentTags: string[];
  onApplyTags: (tags: string[]) => void;
  onApplyDescription?: (desc: string) => void;
}

export function AutoTagSuggest({ title, description, category, currentTags, onApplyTags, onApplyDescription }: AutoTagSuggestProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ tags: string[]; description_suggestion: string } | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!title.trim()) {
      toast.error('Adicione um título primeiro');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-tag', {
        body: { title, description, category },
      });

      if (error) throw error;
      setSuggestions(data);
    } catch (e) {
      toast.error('Erro ao gerar sugestões');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [title, description, category]);

  const applyTags = () => {
    if (!suggestions) return;
    const merged = Array.from(new Set([...currentTags, ...suggestions.tags]));
    onApplyTags(merged);
    toast.success('Tags aplicadas!');
  };

  const applyDescription = () => {
    if (!suggestions?.description_suggestion || !onApplyDescription) return;
    onApplyDescription(suggestions.description_suggestion);
    toast.success('Descrição aplicada!');
  };

  return (
    <div className="space-y-3">
      <button
        onClick={fetchSuggestions}
        disabled={loading}
        className="flex items-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 text-xs tracking-[0.1em] uppercase text-primary hover:bg-primary/20 transition-all font-body disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {loading ? 'Analisando...' : 'Sugerir tags com IA'}
      </button>

      {suggestions && (
        <div className="rounded-sm border border-border bg-card p-3 space-y-3">
          {/* Tag suggestions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body">
                Tags sugeridas
              </span>
              <div className="flex gap-1">
                <button onClick={applyTags} className="p-1 rounded-sm hover:bg-secondary transition-colors" title="Aplicar">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </button>
                <button onClick={() => setSuggestions(null)} className="p-1 rounded-sm hover:bg-secondary transition-colors" title="Descartar">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.tags.map(tag => (
                <span
                  key={tag}
                  className={`rounded-sm px-2 py-0.5 text-[10px] tracking-wider font-body ${
                    currentTags.includes(tag)
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-secondary text-muted-foreground border border-border'
                  }`}
                >
                  {tag}
                  {currentTags.includes(tag) && ' ✓'}
                </span>
              ))}
            </div>
          </div>

          {/* Description suggestion */}
          {suggestions.description_suggestion && onApplyDescription && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body">
                  Descrição sugerida
                </span>
                <button onClick={applyDescription} className="p-1 rounded-sm hover:bg-secondary transition-colors" title="Aplicar">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </button>
              </div>
              <p className="text-xs text-foreground font-body leading-relaxed bg-secondary rounded-sm p-2 border border-border">
                {suggestions.description_suggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
