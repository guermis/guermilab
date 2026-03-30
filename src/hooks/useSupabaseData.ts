import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeroImage {
  id: string;
  image_url: string;
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

export interface Album {
  id: string;
  title: string;
  cover_image_url: string | null;
  sort_order: number;
}

export interface AlbumPhoto {
  id: string;
  album_id: string;
  image_url: string;
  sort_order: number;
}

export interface AboutContent {
  id: string;
  title: string;
  description: string;
}

export function useHeroImages() {
  const [data, setData] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: rows } = await supabase.from('hero_images').select('*').order('sort_order');
    if (rows) setData(rows);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useVideos(type: 'vertical' | 'horizontal') {
  const [data, setData] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const table = type === 'vertical' ? 'videos_vertical' : 'videos_horizontal';

  const fetch = useCallback(async () => {
    const { data: rows } = await supabase.from(table).select('*').order('sort_order');
    if (rows) setData(rows as VideoItem[]);
    setLoading(false);
  }, [table]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useAlbums() {
  const [data, setData] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: rows } = await supabase.from('photography_albums').select('*').order('sort_order');
    if (rows) setData(rows);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useAlbumPhotos(albumId: string | null) {
  const [data, setData] = useState<AlbumPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!albumId) { setData([]); setLoading(false); return; }
    const { data: rows } = await supabase.from('photography_photos').select('*').eq('album_id', albumId).order('sort_order');
    if (rows) setData(rows);
    setLoading(false);
  }, [albumId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export interface AboutStat {
  id: string;
  icon: string;
  label: string;
  value: string;
  sort_order: number;
}

export function useAboutStats() {
  const [data, setData] = useState<AboutStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: rows } = await supabase.from('about_stats').select('*').order('sort_order');
    if (rows) setData(rows as AboutStat[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useAboutContent() {
  const [data, setData] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: row } = await supabase.from('about_content').select('*').limit(1).maybeSingle();
    if (row) setData(row);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}
