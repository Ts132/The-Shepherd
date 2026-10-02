# The Shepherd: website

A single-page visual archive for **The Shepherd (الراعي للمشغولات القبطية)**, built with React, TypeScript and Vite.

## See it right away (no install)

The `dist/` folder is a finished build. Serve it with any static server, for example:

```
npx serve dist
```

or, with Python installed: `cd dist` then `python -m http.server 8080`, and open http://localhost:8080.

(Opening `dist/index.html` by double-clicking will not work, because browsers block local files from loading scripts.)

## Develop

```
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
```

## Languages and themes

- **Arabic / English**: every word on the site lives in `src/content/strings.ts` (one block per language). The switch in the header flips the whole page, including RTL layout, numerals, arrows and scroll directions. The choice is remembered; `?lang=ar` or `?lang=en` in the URL forces a language.
- **Dark / light**: colour tokens are at the top of `src/styles.css` (`:root[data-theme='dark']` and `:root[data-theme='light']`). The choice is remembered, and the visitor's system setting is used the first time.

## Contact details

`src/content/site.ts`: phone/WhatsApp (+20 12 82995534), Facebook, Instagram and the workshop location. There is no email on the site.

## Pope Tawadros II section

`src/components/Pope.tsx`. The film is `public/video/pope-tawadros.mp4` (with a `.webm` copy for browsers without H.264).
Photographs for this section are listed in `src/content/pope.ts`: add photo ids (files in `public/images`) to `popePhotoIds` and they appear around the film.

## Photos

- 656 photos from the archive (near-duplicates removed). Each one has two WebP sizes in `public/images/` (`-s` 640px for the grid, `-l` 1600px for the viewer).
- Captions (English and Arabic) and categories: `src/content/photos.ts`. 150 curated photos have captions and are hung larger in the archive.
- Videos: `public/video/` (ceiling loop and router clip, re-encoded without sound).

## Structure

| Section | File | Motion |
| --- | --- | --- |
| Opening arches | `Hero.tsx` | Arches draw in; scrolling opens the arch to full screen |
| Statement (Ⲁ) | `Statement.tsx` | Words light up as you scroll |
| The sanctuary | `Sanctuary.tsx` | Vertical scroll moves a horizontal sequence |
| Candlelight | `Candlelight.tsx` | Pointer carries a pool of light over a carving |
| Motifs | `Motifs.tsx` | Clip-path reveals, parallax |
| Look up | `Ceilings.tsx` | Ceiling video with parallax photos |
| Process | `Process.tsx` | Four steps; scroll changes the image |
| The exhibition | `Wall.tsx` | Three rows of photos drifting in opposite directions; scrolling speeds them up, hover pauses |
| Pope Tawadros II | `Pope.tsx` | The film inside a gilded arch |
| Archive | `Archive.tsx` + `Lightbox.tsx` | Filters, exhibition grid with mixed sizes, fullscreen viewer with filmstrip (arrow keys, Esc, swipe) |
| Contact (Ⲱ) | `Contact.tsx` | Page lifts to reveal the closing panel |

All scroll effects share a single requestAnimationFrame loop (`src/lib/motion.ts`) and write transforms directly, so scrolling never re-renders React. With "reduce motion" turned on in the system settings, every section switches to a still layout.

Fonts (Marcellus, Alegreya Sans, Amiri, IBM Plex Sans Arabic, Noto Sans Coptic) are self-hosted in `public/fonts/` under the SIL Open Font License.
