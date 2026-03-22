import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Trash2, Copy, Check, Image, Film, FileText, Search, Grid, List, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const BUCKET = 'media';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf',
];

type MediaFile = {
  name: string;
  id: string;
  created_at: string;
  metadata: { size?: number; mimetype?: string } | null;
  publicUrl: string;
};

type UploadItem = {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileIcon(mime?: string) {
  if (!mime) return FileText;
  if (mime.startsWith('image/')) return Image;
  if (mime.startsWith('video/')) return Film;
  return FileText;
}

export function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).list('', {
      limit: 500,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      toast({ title: 'Erro ao carregar mídia', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const mapped: MediaFile[] = (data || [])
      .filter(f => f.name !== '.emptyFolderPlaceholder')
      .map(f => ({
        name: f.name,
        id: f.id || f.name,
        created_at: f.created_at || '',
        metadata: f.metadata as MediaFile['metadata'],
        publicUrl: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      }));

    setFiles(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return `Formato não suportado: ${file.type}`;
    if (file.size > MAX_FILE_SIZE) return `Arquivo muito grande: ${formatBytes(file.size)} (máx ${formatBytes(MAX_FILE_SIZE)})`;
    return null;
  };

  const uploadFiles = async (fileList: File[]) => {
    const items: UploadItem[] = fileList.map(file => {
      const err = validateFile(file);
      return { file, progress: 0, status: err ? 'error' : 'pending', error: err || undefined } as UploadItem;
    });
    setUploads(prev => [...prev, ...items]);

    const validItems = items.filter(i => i.status === 'pending');

    for (const item of validItems) {
      setUploads(prev => prev.map(u =>
        u.file === item.file ? { ...u, status: 'uploading', progress: 10 } : u
      ));

      // Generate unique name
      const ext = item.file.name.split('.').pop();
      const timestamp = Date.now();
      const safeName = item.file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 50);
      const fileName = `${safeName}_${timestamp}.${ext}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, item.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        setUploads(prev => prev.map(u =>
          u.file === item.file ? { ...u, status: 'error', error: error.message } : u
        ));
      } else {
        setUploads(prev => prev.map(u =>
          u.file === item.file ? { ...u, status: 'done', progress: 100 } : u
        ));
      }
    }

    // Refresh file list
    await fetchFiles();

    // Clear completed uploads after delay
    setTimeout(() => {
      setUploads(prev => prev.filter(u => u.status === 'error'));
    }, 3000);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) uploadFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) uploadFiles(selected);
    e.target.value = '';
  };

  const deleteFile = async (name: string) => {
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Arquivo excluído' });
      setFiles(prev => prev.filter(f => f.name !== name));
      if (previewFile?.name === name) setPreviewFile(null);
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({ title: 'URL copiada!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const isImage = (mime?: string) => mime?.startsWith('image/');
  const isVideo = (mime?: string) => mime?.startsWith('video/');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-foreground">Biblioteca de Mídia</h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            {files.length} arquivo{files.length !== 1 ? 's' : ''} • Arraste para fazer upload
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchFiles()} className="text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs tracking-[0.1em] uppercase"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar arquivos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-8 text-xs bg-secondary/50"
          />
        </div>
        <div className="flex border border-border rounded-sm overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
          >
            <Grid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-sm border-2 border-dashed transition-all duration-300 ${
          dragOver
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-muted-foreground/30'
        } ${uploads.length > 0 ? 'p-4' : 'p-8'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploads.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary border border-border">
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-foreground font-body">
                Arraste arquivos aqui ou{' '}
                <button onClick={() => fileInputRef.current?.click()} className="text-primary hover:underline">
                  selecione
                </button>
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground font-body">
                JPG, PNG, WebP, GIF, MP4, WebM, MOV, PDF • Máx 50MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {uploads.map((u, i) => (
              <div key={i} className="flex items-center gap-3 rounded-sm bg-secondary/50 px-3 py-2">
                <span className="text-xs text-foreground font-body truncate flex-1">{u.file.name}</span>
                <span className="text-[10px] text-muted-foreground font-body">{formatBytes(u.file.size)}</span>
                {u.status === 'uploading' && (
                  <div className="w-20">
                    <Progress value={u.progress} className="h-1" />
                  </div>
                )}
                {u.status === 'done' && <Check className="h-3.5 w-3.5 text-primary" />}
                {u.status === 'error' && (
                  <span className="text-[10px] text-destructive font-body">{u.error}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-xs text-muted-foreground font-body">
            {search ? 'Nenhum arquivo encontrado.' : 'Nenhum arquivo na biblioteca.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(file => {
            const mime = file.metadata?.mimetype;
            const Icon = getFileIcon(mime);
            return (
              <div
                key={file.id}
                className="group relative rounded-sm border border-border bg-secondary/30 overflow-hidden hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setPreviewFile(file)}
              >
                <div className="aspect-square flex items-center justify-center bg-secondary/50">
                  {isImage(mime) ? (
                    <img
                      src={file.publicUrl}
                      alt={file.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : isVideo(mime) ? (
                    <video
                      src={file.publicUrl}
                      className="h-full w-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-foreground font-body truncate">{file.name}</p>
                  {file.metadata?.size && (
                    <p className="text-[9px] text-muted-foreground font-body">{formatBytes(file.metadata.size)}</p>
                  )}
                </div>

                {/* Hover actions */}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); copyUrl(file.publicUrl, file.id); }}
                    className="p-1 rounded-sm bg-background/80 text-foreground hover:text-primary transition-colors"
                    title="Copiar URL"
                  >
                    {copiedId === file.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deleteFile(file.name); }}
                    className="p-1 rounded-sm bg-background/80 text-foreground hover:text-destructive transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(file => {
            const mime = file.metadata?.mimetype;
            const Icon = getFileIcon(mime);
            return (
              <div
                key={file.id}
                className="group flex items-center gap-3 rounded-sm border border-border bg-secondary/20 px-3 py-2 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setPreviewFile(file)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-secondary overflow-hidden">
                  {isImage(mime) ? (
                    <img src={file.publicUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className="flex-1 text-xs text-foreground font-body truncate">{file.name}</span>
                {file.metadata?.size && (
                  <span className="text-[10px] text-muted-foreground font-body">{formatBytes(file.metadata.size)}</span>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); copyUrl(file.publicUrl, file.id); }}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {copiedId === file.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deleteFile(file.name); }}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-base text-foreground truncate">
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="space-y-4">
              <div className="rounded-sm overflow-hidden bg-secondary/50 flex items-center justify-center max-h-[60vh]">
                {isImage(previewFile.metadata?.mimetype) ? (
                  <img
                    src={previewFile.publicUrl}
                    alt={previewFile.name}
                    className="max-h-[60vh] object-contain"
                  />
                ) : isVideo(previewFile.metadata?.mimetype) ? (
                  <video
                    src={previewFile.publicUrl}
                    controls
                    className="max-h-[60vh] w-full"
                  />
                ) : (
                  <div className="py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-xs text-muted-foreground font-body">Preview não disponível</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                {previewFile.metadata?.size && <span>{formatBytes(previewFile.metadata.size)}</span>}
                {previewFile.metadata?.mimetype && (
                  <>
                    <span>•</span>
                    <span>{previewFile.metadata.mimetype}</span>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex-1"
                  onClick={() => copyUrl(previewFile.publicUrl, previewFile.id)}
                >
                  {copiedId === previewFile.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  Copiar URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open(previewFile.publicUrl, '_blank')}
                >
                  Abrir original
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    deleteFile(previewFile.name);
                    setPreviewFile(null);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
