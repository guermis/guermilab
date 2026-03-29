import { useState } from 'react';
import { ArrowLeft, Upload, Image, Film, Smartphone, Monitor, LogOut, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Hardcoded credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'guermilab2024';

type Tab = 'hero' | 'vertical' | 'horizontal' | 'fotografia';

interface UploadItem {
  title: string;
  client: string;
  duration: string;
  videoUrl: string;
  thumbnailFile: File | null;
  thumbnailPreview: string;
}

const emptyItem = (): UploadItem => ({
  title: '',
  client: '',
  duration: '',
  videoUrl: '',
  thumbnailFile: null,
  thumbnailPreview: '',
});

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const navigate = useNavigate();

  // Upload state per section
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState('');
  const [items, setItems] = useState<Record<Exclude<Tab, 'hero'>, UploadItem[]>>({
    vertical: [emptyItem()],
    horizontal: [emptyItem()],
    fotografia: [emptyItem()],
  });

  // Albums for photography
  const [albums, setAlbums] = useState<{ name: string; photos: string[] }[]>([]);
  const [newAlbumName, setNewAlbumName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Credenciais inválidas');
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass rounded-2xl p-8 w-full max-w-sm glass-glow">
          <h1 className="text-foreground text-xl font-semibold mb-6 text-center">Guermi Lab Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              placeholder="Usuário"
              value={loginUser}
              onChange={e => setLoginUser(e.target.value)}
              className="bg-secondary/50 border-border"
            />
            <Input
              type="password"
              placeholder="Senha"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              className="bg-secondary/50 border-border"
            />
            {loginError && <p className="text-destructive text-xs">{loginError}</p>}
            <Button type="submit" className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              Entrar
            </Button>
          </form>
        </div>
      </main>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'hero', label: 'Hero', icon: <Image className="h-3.5 w-3.5" /> },
    { id: 'vertical', label: 'Vertical', icon: <Smartphone className="h-3.5 w-3.5" /> },
    { id: 'horizontal', label: 'Horizontal', icon: <Monitor className="h-3.5 w-3.5" /> },
    { id: 'fotografia', label: 'Fotografia', icon: <Image className="h-3.5 w-3.5" /> },
  ];

  const handleThumbnailChange = (tab: Exclude<Tab, 'hero'>, index: number, file: File) => {
    const preview = URL.createObjectURL(file);
    setItems(prev => ({
      ...prev,
      [tab]: prev[tab].map((item, i) =>
        i === index ? { ...item, thumbnailFile: file, thumbnailPreview: preview } : item
      ),
    }));
  };

  const updateItem = (tab: Exclude<Tab, 'hero'>, index: number, field: keyof UploadItem, value: string) => {
    setItems(prev => ({
      ...prev,
      [tab]: prev[tab].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = (tab: Exclude<Tab, 'hero'>) => {
    setItems(prev => ({ ...prev, [tab]: [...prev[tab], emptyItem()] }));
  };

  const removeItem = (tab: Exclude<Tab, 'hero'>, index: number) => {
    setItems(prev => ({ ...prev, [tab]: prev[tab].filter((_, i) => i !== index) }));
  };

  const renderUploadForm = (tab: Exclude<Tab, 'hero'>) => {
    const isPhoto = tab === 'fotografia';
    const tabItems = items[tab];

    return (
      <div className="space-y-6">
        {tabItems.map((item, index) => (
          <div key={index} className="glass rounded-xl p-5 space-y-3 relative">
            {tabItems.length > 1 && (
              <button
                onClick={() => removeItem(tab, index)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <Input
              placeholder="Título"
              value={item.title}
              onChange={e => updateItem(tab, index, 'title', e.target.value)}
              className="bg-secondary/50 border-border"
            />
            <Input
              placeholder="Cliente / Empresa"
              value={item.client}
              onChange={e => updateItem(tab, index, 'client', e.target.value)}
              className="bg-secondary/50 border-border"
            />

            {!isPhoto && (
              <>
                <Input
                  placeholder="Duração (ex: 2:30)"
                  value={item.duration}
                  onChange={e => updateItem(tab, index, 'duration', e.target.value)}
                  className="bg-secondary/50 border-border"
                />
                <Input
                  placeholder="Link do vídeo (YouTube, Vimeo...)"
                  value={item.videoUrl}
                  onChange={e => updateItem(tab, index, 'videoUrl', e.target.value)}
                  className="bg-secondary/50 border-border"
                />
              </>
            )}

            {/* Thumbnail upload */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Thumbnail</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer glass rounded-lg px-4 py-2 text-xs text-foreground/70 hover:text-foreground transition-colors flex items-center gap-2">
                  <Upload className="h-3.5 w-3.5" />
                  Escolher imagem
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailChange(tab, index, file);
                    }}
                  />
                </label>
                {item.thumbnailPreview && (
                  <img src={item.thumbnailPreview} alt="preview" className="h-10 w-10 rounded-lg object-cover" />
                )}
              </div>
            </div>
          </div>
        ))}

        <Button
          onClick={() => addItem(tab)}
          variant="outline"
          className="w-full rounded-full border-border text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar item
        </Button>

        {/* Album management for Photography */}
        {isPhoto && (
          <div className="mt-8 space-y-4">
            <h3 className="text-foreground text-sm font-semibold">Álbuns</h3>

            {albums.map((album, ai) => (
              <div key={ai} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground text-sm font-medium">{album.name}</span>
                  <button
                    onClick={() => setAlbums(prev => prev.filter((_, i) => i !== ai))}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{album.photos.length} fotos</p>
                <label className="cursor-pointer mt-2 inline-flex items-center gap-2 glass rounded-lg px-3 py-1.5 text-xs text-foreground/70 hover:text-foreground transition-colors">
                  <Plus className="h-3 w-3" />
                  Adicionar fotos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      setAlbums(prev => prev.map((a, i) =>
                        i === ai ? { ...a, photos: [...a.photos, ...files.map(f => URL.createObjectURL(f))] } : a
                      ));
                    }}
                  />
                </label>
                {album.photos.length > 0 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto">
                    {album.photos.map((photo, pi) => (
                      <img key={pi} src={photo} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Nome do álbum"
                value={newAlbumName}
                onChange={e => setNewAlbumName(e.target.value)}
                className="bg-secondary/50 border-border"
              />
              <Button
                onClick={() => {
                  if (newAlbumName.trim()) {
                    setAlbums(prev => [...prev, { name: newAlbumName.trim(), photos: [] }]);
                    setNewAlbumName('');
                  }
                }}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90 mt-4">
          Salvar alterações
        </Button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 md:px-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-body"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <span className="text-muted-foreground/30">|</span>
          <span className="font-display text-sm tracking-widest text-foreground uppercase">Guermi Lab Admin</span>
        </div>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </header>

      <div className="border-b border-border px-6 md:px-16">
        <div className="flex gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs tracking-[0.15em] uppercase font-body flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8 md:px-16 max-w-3xl">
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-foreground text-xl font-semibold mb-1">Imagem Hero</h2>
              <p className="text-xs text-muted-foreground">Upload da imagem principal que aparece no topo do site.</p>
            </div>
            <div className="glass rounded-xl p-6 glass-glow">
              <label className="cursor-pointer block">
                {heroPreview ? (
                  <img src={heroPreview} alt="hero preview" className="w-full rounded-xl aspect-[21/9] object-cover" />
                ) : (
                  <div className="w-full rounded-xl aspect-[21/9] border-2 border-dashed border-border flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setHeroImage(file);
                      setHeroPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              {heroImage && (
                <Button className="mt-4 w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Salvar Hero
                </Button>
              )}
            </div>
          </div>
        )}
        {activeTab !== 'hero' && renderUploadForm(activeTab)}
      </div>
    </main>
  );
}
