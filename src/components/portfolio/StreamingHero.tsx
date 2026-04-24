import { useHeroImages } from '@/hooks/useSupabaseData';

export function StreamingHero() {
  const { data: heroImages, loading } = useHeroImages();
  const hero = heroImages[0];
  const videoUrl = hero?.video_url ?? null;

  return (
    <section className="relative w-full mb-14">
      <div className="relative overflow-hidden rounded-3xl aspect-[16/9] bg-secondary/40">
        {videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
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
