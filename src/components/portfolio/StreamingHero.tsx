import { useHeroImages } from '@/hooks/useSupabaseData';
import { PROJECTS } from '@/data/projects';

export function StreamingHero() {
  const { data: heroImages } = useHeroImages();
  const hero = heroImages[0];

  const fallback = PROJECTS[0]?.heroImage || '/placeholder.svg';
  const horizontalUrl = hero?.image_url || fallback;
  const verticalUrl = hero?.image_url_vertical || hero?.image_url || fallback;

  return (
    <section className="relative w-full mb-14">
      {/* Vertical (mobile / portrait) — 4:3 */}
      <div className="relative overflow-hidden rounded-3xl aspect-[4/3] md:hidden">
        <img
          src={verticalUrl}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Horizontal (tablet landscape and up) — 16:9 */}
      <div className="relative overflow-hidden rounded-3xl aspect-[16/9] hidden md:block">
        <img
          src={horizontalUrl}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
