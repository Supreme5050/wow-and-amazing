# Wow & Amazing — Phase 7E Cinematic Video Playback Hotfix

This patch fixes the department cinematic media stacking issue that left only the dark/grey overlay visible.

## Changes

- Restores the video layer above the banner background.
- Keeps the text and gradient overlay above the video.
- Uses `preload="auto"` and retries muted playback when the media becomes ready.
- Resumes playback when the browser tab becomes visible again.
- Keeps the poster image as a fallback.
- Continues respecting `prefers-reduced-motion`.

No Supabase migration is required.
