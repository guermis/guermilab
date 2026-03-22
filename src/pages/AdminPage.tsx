import { useState } from 'react';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { AutoTagSuggest } from '@/components/admin/AutoTagSuggest';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { BarChart3, Sparkles, ArrowLeft, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Tab = 'analytics' | 'ai' | 'media';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('media');
  const navigate = useNavigate();

  const [demoTitle, setDemoTitle] = useState('');
  const [demoDesc, setDemoDesc] = useState('');
  const [demoCategory, setDemoCategory] = useState('');
  const [demoTags, setDemoTags] = useState<string[]>([]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'media', label: 'Mídia', icon: <Image className="h-3.5 w-3.5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: 'ai', label: 'IA & Automação', icon: <Sparkles className="h-3.5 w-3.5" /> },
  ];

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 md:px-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-body"
          >
            <ArrowLeft className="h-4 w-4" />
            Portfolio
          </button>
          <span className="text-muted-foreground/30">|</span>
          <span className="font-display text-sm tracking-widest text-foreground uppercase">Admin</span>
        </div>
      </header>

      <div className="border-b border-border px-6 md:px-16">
        <div className="flex gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs tracking-[0.15em] uppercase font-body flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8 md:px-16 max-w-5xl">
        {activeTab === 'media' && <MediaLibrary />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'ai' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-xl text-foreground mb-1">Auto-tagging com IA</h2>
              <p className="text-xs text-muted-foreground font-body">
                Insira informações de um projeto e a IA sugerirá tags e descrição automaticamente.
              </p>
            </div>
            <div className="rounded-sm border border-border bg-card p-4 space-y-3 max-w-xl">
              <input
                type="text"
                placeholder="Título do projeto"
                value={demoTitle}
                onChange={(e) => setDemoTitle(e.target.value)}
                className="w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground"
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={demoDesc}
                onChange={(e) => setDemoDesc(e.target.value)}
                rows={2}
                className="w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground resize-y"
              />
              <input
                type="text"
                placeholder="Categoria (ex: Documentário, Drama)"
                value={demoCategory}
                onChange={(e) => setDemoCategory(e.target.value)}
                className="w-full rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground font-body placeholder:text-muted-foreground"
              />
              {demoTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {demoTags.map(tag => (
                    <span key={tag} className="rounded-sm bg-primary/15 border border-primary/30 px-2 py-0.5 text-[10px] tracking-wider text-primary font-body">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <AutoTagSuggest
                title={demoTitle}
                description={demoDesc}
                category={demoCategory}
                currentTags={demoTags}
                onApplyTags={setDemoTags}
                onApplyDescription={setDemoDesc}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
