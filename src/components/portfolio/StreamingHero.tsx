import { useHeroImages } from '@/hooks/useSupabaseData';
import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StreamingHero() {
  const { data: heroImages, loading } = useHeroImages();
  const hero = heroImages[0];
  const videoUrl = hero?.video_url ?? null;
  const [muted, setMuted] = useState(true);
  const [showSoundButton, setShowSoundButton] = useState(true);
  const [showSoundLabel, setShowSoundLabel] = useState(true);

  useEffect(() => {
    if (!videoUrl) return;
    const timeout = window.setTimeout(() => setShowSoundLabel(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [videoUrl]);

  const toggleSound = () => {
    setMuted(value => !value);
    setShowSoundLabel(false);
    if (muted) setShowSoundButton(false);
  };

  return (
    <section className="relative w-full mb-6 md:mb-14">
      <div className="relative overflow-hidden rounded-3xl aspect-[16/9] bg-secondary/40">
        {videoUrl ? (<>
          <video
            key={videoUrl}
            src={videoUrl}
            autoPlay
            muted={muted}
            loop
            playsInline
            preload="metadata"
            onClick={() => setShowSoundButton(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {showSoundButton && <Button
            type="button"
            variant="ghost"
            size={showSoundLabel ? 'default' : 'icon'}
            onClick={toggleSound}
            aria-label={muted ? 'Ativar som' : 'Silenciar vídeo'}
            aria-pressed={!muted}
            title={muted ? 'Ativar som' : 'Silenciar vídeo'}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-10 glass rounded-full text-foreground hover:bg-background/80 hover:text-accent"
          >
            {muted ? <VolumeX /> : <Volume2 />}
            {showSoundLabel && <span className="text-xs">turn on sound</span>}
          </Button>}
        </>
        ) : (
          // Quiet placeholder — no flash of stale image while loading
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            {loading ? '' : 'Envie um vídeo no painel admin para exibir aqui.'}
          </div>
        )}
      </div>
    </section>
  );
}
