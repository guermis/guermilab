import { useHeroImages } from '@/hooks/useSupabaseData';
import { PROJECTS } from '@/data/projects';

export function StreamingHero() {
  const { data: heroImages } = useHeroImages();

  // Use first hero image from DB, fallback to hardcoded
  const imageUrl = heroImages.length > 0 ? heroImages[0].image_url : PROJECTS[0]?.heroImage || '/placeholder.svg';

  return (
    <section className="relative w-full mb-14">
      <div className="relative overflow-hidden rounded-3xl aspect-[21/9]">
        <img
          src={imageUrl}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
