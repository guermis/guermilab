import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAlbumPhotos } from '@/hooks/useSupabaseData';
import type { Album } from '@/hooks/useSupabaseData';

interface AlbumModalProps {
  album: Album | null;
  onClose: () => void;
}

export function AlbumModal({ album, onClose }: AlbumModalProps) {
  const { data: photos } = useAlbumPhotos(album?.id || null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) {
      if (e.key === 'Escape') onClose();
      return;
    }
    if (e.key === 'Escape') setLightboxIndex(null);
    if (e.key === 'ArrowRight' && lightboxIndex < photos.length - 1) setLightboxIndex(lightboxIndex + 1);
    if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1);
  }, [lightboxIndex, photos.length, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Demo photos when DB is empty
  const displayPhotos = photos.length > 0 ? photos : [
    { id: '1', album_id: '', image_url: '/placeholder.svg', sort_order: 0 },
    { id: '2', album_id: '', image_url: '/placeholder.svg', sort_order: 1 },
    { id: '3', album_id: '', image_url: '/placeholder.svg', sort_order: 2 },
    { id: '4', album_id: '', image_url: '/placeholder.svg', sort_order: 3 },
    { id: '5', album_id: '', image_url: '/placeholder.svg', sort_order: 4 },
    { id: '6', album_id: '', image_url: '/placeholder.svg', sort_order: 5 },
  ];

  return (
    <AnimatePresence>
      {album && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[hsla(0,0%,0%,0.9)] backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 z-[201] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-foreground text-xl font-semibold">{album.title}</h2>
              <button
                onClick={onClose}
                className="glass rounded-full p-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Photo grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {displayPhotos.map((photo, i) => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxIndex(i)}
                  className="cursor-pointer group relative overflow-hidden rounded-2xl aspect-[3/4]"
                >
                  <img
                    src={photo.image_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 rounded-2xl transition-all duration-500"
                    style={{ boxShadow: 'inset 0 0 0 1px hsla(0,0%,100%,0.06)' }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Lightbox */}
          <AnimatePresence>
            {lightboxIndex !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] bg-[hsla(0,0%,0%,0.95)] flex items-center justify-center"
                onClick={() => setLightboxIndex(null)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
                  className="absolute top-4 right-4 glass rounded-full p-2.5 text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>

                {lightboxIndex > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                    className="absolute left-4 glass rounded-full p-3 text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {lightboxIndex < displayPhotos.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                    className="absolute right-4 glass rounded-full p-3 text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}

                <img
                  src={displayPhotos[lightboxIndex].image_url}
                  alt=""
                  className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="absolute bottom-6 text-center text-sm text-muted-foreground">
                  {lightboxIndex + 1} / {displayPhotos.length}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
