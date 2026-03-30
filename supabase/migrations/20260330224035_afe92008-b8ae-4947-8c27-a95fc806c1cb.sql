
-- Allow anon role to manage content tables (admin uses hardcoded login, not Supabase auth)
CREATE POLICY "Anon manage hero_images" ON public.hero_images FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage videos_vertical" ON public.videos_vertical FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage videos_horizontal" ON public.videos_horizontal FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage photography_albums" ON public.photography_albums FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage photography_photos" ON public.photography_photos FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage about_content" ON public.about_content FOR ALL TO anon USING (true) WITH CHECK (true);
