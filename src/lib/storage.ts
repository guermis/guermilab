import { supabase } from '@/integrations/supabase/client';

const MEDIA_BUCKET = 'media';

/** Extracts the storage object path from a public URL of the media bucket. */
export function extractStoragePath(publicUrl: string | null | undefined): string | null {
  if (!publicUrl) return null;
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  return idx === -1 ? null : publicUrl.substring(idx + marker.length);
}

/** Permanently removes the physical file from Storage given its public URL. */
export async function removeStorageFile(publicUrl: string | null | undefined): Promise<void> {
  const path = extractStoragePath(publicUrl);
  if (!path) return;
  await supabase.storage.from(MEDIA_BUCKET).remove([path]);
}
