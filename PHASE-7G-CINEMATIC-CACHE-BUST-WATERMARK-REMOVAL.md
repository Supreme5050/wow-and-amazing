# Phase 7G — Permanent cinematic watermark and badge removal

This patch fixes browsers that continued serving the original cached cinematic videos.

Changes:
- Uses entirely new clean video and poster filenames (`*-cinematic-clean-v2.*`) so Chrome cannot reuse the old cached files.
- Removes the bottom-right `Playing silently` badge from the category page source.
- Removes the left-side `Cinematic introduction playing` status line.
- Keeps autoplay, muted playback, looping, aligned departments, rentals, services, products, Paystack and Supabase unchanged.

No SQL migration is required.
