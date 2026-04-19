import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type {
  HeroImageItem,
  VideoItem,
  AlbumItem,
  PhotoItem,
  AboutContentItem,
  AboutStatItem,
} from '@/types/models';

// Re-export legacy aliases for backwards compatibility
export type HeroImage = HeroImageItem;
export type { VideoItem, AboutStatItem as AboutStat } from '@/types/models';
export type Album = AlbumItem;
export type AlbumPhoto = PhotoItem;
export type AboutContent = AboutContentItem;

const STALE_TIME = 1000 * 60; // 1 min

function useErrorToast(isError: boolean, label: string) {
  useEffect(() => {
    if (isError) toast.error(`Não foi possível carregar ${label}.`);
  }, [isError, label]);
}

export function useHeroImages() {
  const query = useQuery({
    queryKey: ['hero_images'],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<HeroImageItem[]> => {
      const { data, error } = await supabase.from('hero_images').select('*').order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });
  useErrorToast(query.isError, 'as imagens do hero');
  return { data: query.data ?? [], loading: query.isLoading, refetch: query.refetch };
}

export function useVideos(type: 'vertical' | 'horizontal') {
  const table = type === 'vertical' ? 'videos_vertical' : 'videos_horizontal';
  const query = useQuery({
    queryKey: ['videos', type],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<VideoItem[]> => {
      const { data, error } = await supabase.from(table).select('*').order('sort_order');
      if (error) throw error;
      return (data ?? []) as VideoItem[];
    },
  });
  useErrorToast(query.isError, `os vídeos ${type === 'vertical' ? 'verticais' : 'horizontais'}`);
  return { data: query.data ?? [], loading: query.isLoading, refetch: query.refetch };
}

export function useAlbums() {
  const query = useQuery({
    queryKey: ['photography_albums'],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<AlbumItem[]> => {
      const { data, error } = await supabase
        .from('photography_albums')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });
  useErrorToast(query.isError, 'os álbuns');
  return { data: query.data ?? [], loading: query.isLoading, refetch: query.refetch };
}

export function useAlbumPhotos(albumId: string | null) {
  const query = useQuery({
    queryKey: ['photography_photos', albumId],
    enabled: !!albumId,
    staleTime: STALE_TIME,
    queryFn: async (): Promise<PhotoItem[]> => {
      if (!albumId) return [];
      const { data, error } = await supabase
        .from('photography_photos')
        .select('*')
        .eq('album_id', albumId)
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });
  useErrorToast(query.isError, 'as fotos do álbum');
  return {
    data: query.data ?? [],
    loading: albumId ? query.isLoading : false,
    refetch: query.refetch,
  };
}

export function useAboutStats() {
  const query = useQuery({
    queryKey: ['about_stats'],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<AboutStatItem[]> => {
      const { data, error } = await supabase.from('about_stats').select('*').order('sort_order');
      if (error) throw error;
      return (data ?? []) as AboutStatItem[];
    },
  });
  useErrorToast(query.isError, 'as métricas');
  return { data: query.data ?? [], loading: query.isLoading, refetch: query.refetch };
}

export function useAboutContent() {
  const query = useQuery({
    queryKey: ['about_content'],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<AboutContentItem | null> => {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  useErrorToast(query.isError, 'o conteúdo da seção sobre');
  return { data: query.data ?? null, loading: query.isLoading, refetch: query.refetch };
}
