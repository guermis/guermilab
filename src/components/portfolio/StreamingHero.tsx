import { useHeroImages } from '@/hooks/useSupabaseData';
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StreamingHero() {
  const { data: heroImages, loading } = useHeroImages();
  const hero = heroImages[0];
  const videoUrl = hero?.video_url ?? null;
  const [muted, setMuted] = useState(true);
  const [buttonVisible, setButtonVisible] = useState(true);
  const [labelVisible, setLabelVisible] = useState(true);
  const labelTimer = useRef<number | null>(null);

  // Show the label for 2s after the button (re)appears, then collapse to icon only.
  useEffect(() => {
    if (!buttonVisible) return;
    setLabelVisible(true);
    labelTimer.current = window.setTimeout(() => setLabelVisible(false), 2000);
    return () => {
      if (labelTimer.current !== null) window.clearTimeout(labelTimer.current);
    };
  }, [buttonVisible]);

  const handleUnmute = () => {
    setMuted(false);
    setButtonVisible(false);
  };

  // Clicking the background video brings the sound button back.
  const handleVideoClick = () => {
    if (!buttonVisible) setButtonVisible(true);
  };

  return (
    <section className="relative w-full mb-14">
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
            onClick={handleVideoClick}
            className="absolute inset-0 h-full w-full object-cover cursor-pointer"
          />
          {buttonVisible && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => (muted ? handleUnmute() : setMuted(true))}
              aria-label={muted ? 'Ativar som' : 'Silenciar vídeo'}
              aria-pressed={!muted}
              title={muted ? 'Ativar som' : 'Silenciar vídeo'}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-10 glass rounded-full text-foreground hover:bg-background/80 hover:text-accent gap-2 px-3"
            >
              {muted ? <VolumeX /> : <Volume2 />}
              <span
                className={`text-sm whitespace-nowrap transition-all duration-500 ease-in-out overflow-hidden ${
                  labelVisible ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0'
                }`}
                aria-hidden={!labelVisible}
              >
                ativar som
              </span>
            </Button>
          )}
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
