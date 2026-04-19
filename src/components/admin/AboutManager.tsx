import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, Edit2, Trash2, X } from 'lucide-react';
import type { AboutStatItem } from '@/types/models';

const ICON_OPTIONS = ['Film', 'Camera', 'Award', 'Star', 'Heart', 'Users', 'Globe', 'Zap'];
const EMPTY_STAT = { icon: 'Film', label: '', value: '' };

export function AboutManager() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [id, setId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState<AboutStatItem[]>([]);
  const [statForm, setStatForm] = useState(EMPTY_STAT);
  const [editStatId, setEditStatId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const { data } = await supabase.from('about_stats').select('*').order('sort_order');
    if (data) setStats(data as AboutStatItem[]);
  }, []);

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
    fetchStats();
  }, [fetchStats]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        const { error } = await supabase.from('about_content').update({ title, description }).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('about_content')
          .insert({ title, description })
          .select('id')
          .single();
        if (error) throw error;
        if (data) setId(data.id);
      }
      toast.success('Seção "Sobre" salva');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro: ' + msg);
    }
    setSaving(false);
  };

  const saveStat = async () => {
    if (!statForm.label || !statForm.value) return;
    try {
      if (editStatId) {
        const { error } = await supabase
          .from('about_stats')
          .update({ icon: statForm.icon, label: statForm.label, value: statForm.value })
          .eq('id', editStatId);
        if (error) throw error;
        toast.success('Métrica atualizada');
      } else {
        const { error } = await supabase
          .from('about_stats')
          .insert({ ...statForm, sort_order: stats.length });
        if (error) throw error;
        toast.success('Métrica adicionada');
      }
      setStatForm(EMPTY_STAT);
      setEditStatId(null);
      fetchStats();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro: ' + msg);
    }
  };

  const deleteStat = async (sid: string) => {
    await supabase.from('about_stats').delete().eq('id', sid);
    toast.success('Métrica removida');
    fetchStats();
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

      <h3 className="text-foreground text-lg font-semibold">Métricas</h3>
      <div className="space-y-3">
        {stats.map(stat => (
          <div key={stat.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent text-xs font-bold uppercase">{stat.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium">{stat.value} — {stat.label}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { setEditStatId(stat.id); setStatForm({ icon: stat.icon, label: stat.label, value: stat.value }); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button onClick={() => deleteStat(stat.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-5 space-y-3">
        <h4 className="text-sm text-foreground font-medium">{editStatId ? 'Editar métrica' : 'Adicionar métrica'}</h4>
        <div className="grid grid-cols-3 gap-3">
          <select
            value={statForm.icon}
            onChange={e => setStatForm(p => ({ ...p, icon: e.target.value }))}
            className="bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm text-foreground"
          >
            {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select>
          <Input placeholder="Valor (ex: 40+)" value={statForm.value} onChange={e => setStatForm(p => ({ ...p, value: e.target.value }))} className="bg-secondary/50 border-border" />
          <Input placeholder="Label (ex: Projetos)" value={statForm.label} onChange={e => setStatForm(p => ({ ...p, label: e.target.value }))} className="bg-secondary/50 border-border" />
        </div>
        <div className="flex gap-2">
          <Button onClick={saveStat} disabled={!statForm.label || !statForm.value} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Check className="h-4 w-4 mr-1" /> {editStatId ? 'Salvar' : 'Adicionar'}
          </Button>
          {editStatId && (
            <Button variant="outline" onClick={() => { setEditStatId(null); setStatForm(EMPTY_STAT); }} className="rounded-full">
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
