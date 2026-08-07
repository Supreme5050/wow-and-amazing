# Wow & Amazing — Cinematic Gateway Extension

This approved scope extension keeps the existing home page as the gateway and adds four immersive collection experiences:

- `/experiences/gadgets`
- `/experiences/food`
- `/experiences/creators`
- `/experiences/home-decor`

## Gateway behavior

The six existing home-page category cards and category mega-menu now route customers through the cinematic experience pages before they reach the functional category catalog.

- Gadgets & Accessories → Gadgets experience
- Creator Kits → Creators experience
- Restaurant Food → Food experience
- Food Packaging → Food experience
- Housing & Decor → Home Decor experience
- Cinematography → Creators experience

`Shop All` and `View All Categories` still open the practical catalog directly.

## Media treatment

- Uploaded videos were optimized as silent H.264 MP4 files with fast-start enabled.
- Audio was removed because hero videos autoplay muted.
- Poster images are included for loading and reduced-motion users.
- Housing & Decor uses the uploaded still image as a WebP hero.
- The additional technology video with baked-in headline/button text was intentionally not used. Website copy remains real HTML so it is responsive, accessible, and easy to edit.

## No database change

No new Supabase migration is required for this extension.

## CMD checks

```cmd
npm install
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

The site runs at `http://localhost:3004`.
