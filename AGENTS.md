# Architecture rules

- Use semantic CSS theme tokens for page surfaces, text, accents, media shadows, and overlays so all pages share the same palette.
- Mount below-the-fold portfolio sections through DeferredSection and React.lazy so offscreen content does not fetch or load its code at startup; keep anchor IDs on the wrappers for navigation before mounting.
- Load media modal chunks only after their first open and retain their mounted shells thereafter so closing animations continue to work.
- Use StreamingHero as the single hero video implementation; control audio through React muted state without changing the video source or key so playback is uninterrupted.