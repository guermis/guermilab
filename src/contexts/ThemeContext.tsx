import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ThemeValues {
  fontDisplay: string;
  fontBody: string;
  colorBackground: string;
  colorForeground: string;
  colorPrimary: string;
  colorSecondary: string;
  colorMuted: string;
  colorAccent: string;
  colorBorder: string;
  spacingBase: number;
  borderRadius: number;
}

const DEFAULT_THEME: ThemeValues = {
  fontDisplay: 'Playfair Display',
  fontBody: 'Inter',
  colorBackground: '0 0% 4%',
  colorForeground: '40 20% 92%',
  colorPrimary: '38 80% 55%',
  colorSecondary: '0 0% 12%',
  colorMuted: '0 0% 14%',
  colorAccent: '38 80% 55%',
  colorBorder: '0 0% 16%',
  spacingBase: 1,
  borderRadius: 0.25,
};

interface ThemeContextType {
  theme: ThemeValues;
  setTheme: (theme: ThemeValues) => void;
  updateThemeProperty: <K extends keyof ThemeValues>(key: K, value: ThemeValues[K]) => void;
  saveTheme: () => Promise<void>;
  presets: { id: string; name: string }[];
  loadPreset: (id: string) => Promise<void>;
  saveAsPreset: (name: string) => Promise<void>;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

function applyThemeToDOM(theme: ThemeValues) {
  const root = document.documentElement;
  root.style.setProperty('--background', theme.colorBackground);
  root.style.setProperty('--foreground', theme.colorForeground);
  root.style.setProperty('--primary', theme.colorPrimary);
  root.style.setProperty('--secondary', theme.colorSecondary);
  root.style.setProperty('--muted', theme.colorMuted);
  root.style.setProperty('--accent', theme.colorAccent);
  root.style.setProperty('--border', theme.colorBorder);
  root.style.setProperty('--input', theme.colorBorder);
  root.style.setProperty('--ring', theme.colorPrimary);
  root.style.setProperty('--radius', `${theme.borderRadius}rem`);
  root.style.setProperty('--font-display', `'${theme.fontDisplay}', serif`);
  root.style.setProperty('--font-body', `'${theme.fontBody}', sans-serif`);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeValues>(DEFAULT_THEME);
  const [presets, setPresets] = useState<{ id: string; name: string }[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load active theme from DB
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (data) {
        const t: ThemeValues = {
          fontDisplay: data.font_display,
          fontBody: data.font_body,
          colorBackground: data.color_background,
          colorForeground: data.color_foreground,
          colorPrimary: data.color_primary,
          colorSecondary: data.color_secondary,
          colorMuted: data.color_muted,
          colorAccent: data.color_accent,
          colorBorder: data.color_border,
          spacingBase: Number(data.spacing_base),
          borderRadius: Number(data.border_radius),
        };
        setThemeState(t);
        setActiveId(data.id);
        applyThemeToDOM(t);
      }
    }

    async function loadPresets() {
      const { data } = await supabase.from('theme_settings').select('id, name').order('name');
      if (data) setPresets(data);
    }

    load();
    loadPresets();
  }, []);

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = useCallback((t: ThemeValues) => {
    setThemeState(t);
  }, []);

  const updateThemeProperty = useCallback(<K extends keyof ThemeValues>(key: K, value: ThemeValues[K]) => {
    setThemeState(prev => ({ ...prev, [key]: value }));
  }, []);

  const saveTheme = useCallback(async () => {
    if (!activeId) return;
    await supabase.from('theme_settings').update({
      font_display: theme.fontDisplay,
      font_body: theme.fontBody,
      color_background: theme.colorBackground,
      color_foreground: theme.colorForeground,
      color_primary: theme.colorPrimary,
      color_secondary: theme.colorSecondary,
      color_muted: theme.colorMuted,
      color_accent: theme.colorAccent,
      color_border: theme.colorBorder,
      spacing_base: theme.spacingBase,
      border_radius: theme.borderRadius,
    }).eq('id', activeId);
  }, [activeId, theme]);

  const loadPreset = useCallback(async (id: string) => {
    const { data } = await supabase.from('theme_settings').select('*').eq('id', id).single();
    if (!data) return;

    // Deactivate current, activate new
    if (activeId) await supabase.from('theme_settings').update({ is_active: false }).eq('id', activeId);
    await supabase.from('theme_settings').update({ is_active: true }).eq('id', id);

    const t: ThemeValues = {
      fontDisplay: data.font_display,
      fontBody: data.font_body,
      colorBackground: data.color_background,
      colorForeground: data.color_foreground,
      colorPrimary: data.color_primary,
      colorSecondary: data.color_secondary,
      colorMuted: data.color_muted,
      colorAccent: data.color_accent,
      colorBorder: data.color_border,
      spacingBase: Number(data.spacing_base),
      borderRadius: Number(data.border_radius),
    };
    setThemeState(t);
    setActiveId(id);
  }, [activeId]);

  const saveAsPreset = useCallback(async (name: string) => {
    const { data } = await supabase.from('theme_settings').insert({
      name,
      is_active: false,
      font_display: theme.fontDisplay,
      font_body: theme.fontBody,
      color_background: theme.colorBackground,
      color_foreground: theme.colorForeground,
      color_primary: theme.colorPrimary,
      color_secondary: theme.colorSecondary,
      color_muted: theme.colorMuted,
      color_accent: theme.colorAccent,
      color_border: theme.colorBorder,
      spacing_base: theme.spacingBase,
      border_radius: theme.borderRadius,
    }).select('id, name').single();

    if (data) setPresets(prev => [...prev, data]);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, updateThemeProperty, saveTheme, presets, loadPreset, saveAsPreset, isEditing, setIsEditing }}>
      {children}
    </ThemeContext.Provider>
  );
}
