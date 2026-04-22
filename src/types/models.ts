// Shared admin & data model types

export type AdminTab = 'hero' | 'vertical' | 'horizontal' | 'fotografia' | 'sobre';

export interface HeroImageItem {
  id: string;
  image_url: string;                  // Horizontal (16:9) — desktop/tablet landscape
  image_url_vertical: string | null;  // Vertical (4:3) — mobile / portrait
  sort_order: number;
}

export interface VideoItem {
  id: string;
  title: string;
  client: string | null;
  duration: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  sort_order: number;
}

export interface AlbumItem {
  id: string;
  title: string;
  cover_image_url: string | null;
  sort_order: number;
}

export interface PhotoItem {
  id: string;
  album_id: string;
  image_url: string;
  sort_order: number;
}

export interface AboutContentItem {
  id: string;
  title: string;
  description: string;
}

export interface AboutStatItem {
  id: string;
  icon: string;
  label: string;
  value: string;
  sort_order: number;
}
