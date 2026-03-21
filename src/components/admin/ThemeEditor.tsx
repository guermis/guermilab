import { useState } from 'react';
import { useTheme, ThemeValues } from '@/contexts/ThemeContext';
import { X, Save, Palette, Type, Maximize, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { toast } from 'sonner';

const FONT_OPTIONS = [
  'Playfair Display', 'Inter', 'Lora', 'Montserrat', 'Raleway',
  'Merriweather', 'Roboto', 'Open Sans', 'Poppins', 'Source Serif Pro',
  'DM Sans', 'Space Grotesk', 'Libre Baskerville', 'Cormorant Garamond',
];

const COLOR_PRESETS: Record<string, Partial<ThemeValues>> = {
  'Cinematográfico': {
    colorBackground: '0 0% 4%', colorForeground: '40 20% 92%',
    colorPrimary: '38 80% 55%', colorSecondary: '0 0% 12%',
    colorAccent: '38 80% 55%',
  },
  'Midnight Blue': {
    colorBackground: '220 30% 6%', colorForeground: '210 20% 92%',
    colorPrimary: '210 70% 55%', colorSecondary: '220 20% 14%',
    colorAccent: '210 70% 55%',
  },
  'Warm Film': {
    colorBackground: '20 15% 5%', colorForeground: '35 25% 90%',
    colorPrimary: '15 75% 55%', colorSecondary: '20 10% 12%',
    colorAccent: '15 75% 55%',
  },
  'Monocromático': {
    colorBackground: '0 0% 3%', colorForeground: '0 0% 90%',
    colorPrimary: '0 0% 70%', colorSecondary: '0 0% 10%',
    colorAccent: '0 0% 70%',
  },
  'Forest': {
    colorBackground: '150 15% 5%', colorForeground: '140 10% 90%',
    colorPrimary: '140 50% 45%', colorSecondary: '150 10% 12%',
    colorAccent: '140 50% 45%',
  },
};

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hslToHex = (hsl: string) => {
    const parts = hsl.split(' ').map(Number);
    if (parts.length < 3) return '#c8963c';
    const [h, s, l] = parts;
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-muted-foreground font-body">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hslToHex(value)}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="h-6 w-6 rounded-sm border border-border cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded-sm border border-border bg-secondary px-2 py-1 text-[10px] text-foreground font-mono"
        />
      </div>
    </div>
  );
}

export function ThemeEditor() {
  const { theme, updateThemeProperty, saveTheme, presets, loadPreset, saveAsPreset, isEditing, setIsEditing } = useTheme();
  const [openSections, setOpenSections] = useState({ colors: true, fonts: true, spacing: false, presets: false });
  const [newPresetName, setNewPresetName] = useState('');

  const toggle = (section: keyof typeof openSections) =>
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-sm border border-border bg-secondary/90 px-4 py-2.5 text-xs tracking-[0.15em] uppercase text-foreground hover:border-primary/40 transition-all duration-300 font-body shadow-lg"
      >
        <Palette className="h-4 w-4 text-primary" />
        Editor
      </button>
    );
  }

  const handleSave = async () => {
    await saveTheme();
    toast.success('Tema salvo com sucesso!');
  };

  const handleSavePreset = async () => {
    if (!newPresetName.trim()) return;
    await saveAsPreset(newPresetName.trim());
    setNewPresetName('');
    toast.success('Preset criado!');
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 z-50 w-72 border-l border-border bg-card/95 overflow-y-auto shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 border-b border-border px-4 py-3 flex items-center justify-between z-10">
        <span className="text-xs tracking-[0.2em] uppercase text-foreground font-body flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          Editor Visual
        </span>
        <div className="flex items-center gap-1">
          <button onClick={handleSave} className="p-1.5 rounded-sm hover:bg-secondary transition-colors" title="Salvar">
            <Save className="h-4 w-4 text-primary" />
          </button>
          <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-sm hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Quick color presets */}
      <div className="px-4 py-3 border-b border-border">
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">Temas rápidos</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Object.entries(COLOR_PRESETS).map(([name, values]) => (
            <button
              key={name}
              onClick={() => Object.entries(values).forEach(([k, v]) => updateThemeProperty(k as keyof ThemeValues, v as string))}
              className="rounded-sm border border-border px-2 py-1 text-[9px] tracking-wider uppercase text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all font-body"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Colors section */}
      <div className="border-b border-border">
        <button onClick={() => toggle('colors')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
          <span className="text-[11px] tracking-[0.15em] uppercase text-foreground font-body flex items-center gap-2">
            <Palette className="h-3.5 w-3.5 text-primary" />
            Cores
          </span>
          {openSections.colors ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </button>
        {openSections.colors && (
          <div className="px-4 pb-4 space-y-2.5">
            <ColorInput label="Fundo" value={theme.colorBackground} onChange={(v) => updateThemeProperty('colorBackground', v)} />
            <ColorInput label="Texto" value={theme.colorForeground} onChange={(v) => updateThemeProperty('colorForeground', v)} />
            <ColorInput label="Primária" value={theme.colorPrimary} onChange={(v) => updateThemeProperty('colorPrimary', v)} />
            <ColorInput label="Secundária" value={theme.colorSecondary} onChange={(v) => updateThemeProperty('colorSecondary', v)} />
            <ColorInput label="Muted" value={theme.colorMuted} onChange={(v) => updateThemeProperty('colorMuted', v)} />
            <ColorInput label="Destaque" value={theme.colorAccent} onChange={(v) => updateThemeProperty('colorAccent', v)} />
            <ColorInput label="Bordas" value={theme.colorBorder} onChange={(v) => updateThemeProperty('colorBorder', v)} />
          </div>
        )}
      </div>

      {/* Fonts section */}
      <div className="border-b border-border">
        <button onClick={() => toggle('fonts')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
          <span className="text-[11px] tracking-[0.15em] uppercase text-foreground font-body flex items-center gap-2">
            <Type className="h-3.5 w-3.5 text-primary" />
            Tipografia
          </span>
          {openSections.fonts ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </button>
        {openSections.fonts && (
          <div className="px-4 pb-4 space-y-3">
            <div>
              <label className="text-[10px] text-muted-foreground font-body block mb-1">Fonte Display</label>
              <select
                value={theme.fontDisplay}
                onChange={(e) => updateThemeProperty('fontDisplay', e.target.value)}
                className="w-full rounded-sm border border-border bg-secondary px-2 py-1.5 text-xs text-foreground font-body"
              >
                {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-body block mb-1">Fonte Body</label>
              <select
                value={theme.fontBody}
                onChange={(e) => updateThemeProperty('fontBody', e.target.value)}
                className="w-full rounded-sm border border-border bg-secondary px-2 py-1.5 text-xs text-foreground font-body"
              >
                {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Spacing section */}
      <div className="border-b border-border">
        <button onClick={() => toggle('spacing')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
          <span className="text-[11px] tracking-[0.15em] uppercase text-foreground font-body flex items-center gap-2">
            <Maximize className="h-3.5 w-3.5 text-primary" />
            Espaçamento
          </span>
          {openSections.spacing ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </button>
        {openSections.spacing && (
          <div className="px-4 pb-4 space-y-3">
            <div>
              <label className="text-[10px] text-muted-foreground font-body flex justify-between mb-1">
                <span>Espaçamento base</span>
                <span className="text-primary">{theme.spacingBase}x</span>
              </label>
              <input
                type="range"
                min="0.5" max="2" step="0.1"
                value={theme.spacingBase}
                onChange={(e) => updateThemeProperty('spacingBase', Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-body flex justify-between mb-1">
                <span>Border radius</span>
                <span className="text-primary">{theme.borderRadius}rem</span>
              </label>
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={theme.borderRadius}
                onChange={(e) => updateThemeProperty('borderRadius', Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Presets section */}
      <div className="border-b border-border">
        <button onClick={() => toggle('presets')} className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
          <span className="text-[11px] tracking-[0.15em] uppercase text-foreground font-body flex items-center gap-2">
            <Save className="h-3.5 w-3.5 text-primary" />
            Presets salvos
          </span>
          {openSections.presets ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </button>
        {openSections.presets && (
          <div className="px-4 pb-4 space-y-2">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => loadPreset(p.id)}
                className="w-full text-left rounded-sm border border-border px-3 py-2 text-xs text-foreground hover:border-primary/40 transition-all font-body"
              >
                {p.name}
              </button>
            ))}
            <div className="flex gap-1 mt-2">
              <input
                type="text"
                placeholder="Nome do preset..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="flex-1 rounded-sm border border-border bg-secondary px-2 py-1.5 text-xs text-foreground font-body placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSavePreset}
                className="rounded-sm border border-primary/40 bg-primary/10 px-2 py-1.5 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
