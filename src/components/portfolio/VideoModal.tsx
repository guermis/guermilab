import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

type Embed =
  | { kind: 'iframe'; src: string }
  | { kind: 'instagram'; permalink: string }
  | { kind: 'raw-html'; html: string }
  | { kind: 'empty' };

/** Detects what kind of embed content the admin pasted. */
function resolveEmbed(input: string): Embed {
  const value = (input || '').trim();
  if (!value) return { kind: 'empty' };

  // 1. Pasted full HTML embed
  if (/<iframe|<blockquote/i.test(value)) {
    // Try to extract a clean iframe src first — it's far more reliable than embedding raw HTML.
    const iframeSrc = value.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1];
    if (iframeSrc) return { kind: 'iframe', src: iframeSrc };

    // Instagram blockquote → derive permalink and use the official /embed endpoint
    const igPermalink = value.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i)?.[0];
    if (igPermalink) return { kind: 'instagram', permalink: `https://www.${igPermalink}` };

    return { kind: 'raw-html', html: value };
  }

  // 2. YouTube link
  const yt = value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0` };

  // 3. Vimeo link
  const vimeo = value.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };

  // 4. Instagram link → use /embed endpoint
  const ig = value.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  if (ig) return { kind: 'instagram', permalink: `https://www.instagram.com/${ig[1]}/${ig[2]}/` };

  // 5. Anything else: try to use as direct iframe src
  if (/^https?:\/\//i.test(value)) return { kind: 'iframe', src: value };

  return { kind: 'empty' };
}

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  const embed = useMemo(() => resolveEmbed(videoUrl), [videoUrl]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInstagramVertical = embed.kind === 'instagram' || embed.kind === 'raw-html';

  // Instagram embeds need their script to (re)process the blockquote whenever it mounts.
  useEffect(() => {
    if (!isOpen) return;
    if (embed.kind !== 'raw-html') return;

    const SCRIPT_ID = 'instagram-embed-script';
    const trigger = () => {
      const w = window as unknown as { instgrm?: { Embeds?: { process: () => void } } };
      w.instgrm?.Embeds?.process();
    };

    if (document.getElementById(SCRIPT_ID)) {
      trigger();
      return;
    }
    const s = document.createElement('script');
    s.id = SCRIPT_ID;
    s.async = true;
    s.src = 'https://www.instagram.com/embed.js';
    s.onload = trigger;
    document.body.appendChild(s);
  }, [isOpen, embed.kind]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-[hsla(0,0%,0%,0.85)] backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-4 md:inset-12 lg:inset-20 z-[201] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground text-sm font-medium truncate">{title}</h3>
              <button
                onClick={onClose}
                className="glass rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Embed area — center vertical content, fill horizontal content */}
            <div
              className={`flex-1 rounded-2xl overflow-hidden bg-black ${
                isInstagramVertical ? 'flex items-center justify-center overflow-y-auto' : ''
              }`}
            >
              {embed.kind === 'iframe' && (
                <iframe
                  src={embed.src}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                  title={title}
                />
              )}

              {embed.kind === 'instagram' && (
                <iframe
                  src={`${embed.permalink}embed`}
                  className="h-full w-[min(540px,100%)]"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  scrolling="no"
                  title={title}
                />
              )}

              {embed.kind === 'raw-html' && (
                <div
                  ref={containerRef}
                  className="w-[min(540px,100%)] my-auto"
                  dangerouslySetInnerHTML={{ __html: embed.html }}
                />
              )}

              {embed.kind === 'empty' && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  Vídeo não disponível
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
