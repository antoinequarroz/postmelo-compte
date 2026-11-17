# Vidéo de présentation de la suite

Motion design de la suite Postmelo, fait en code avec [Remotion](https://www.remotion.dev),
avec le design du site : Geist et Instrument Serif, le grain, le thème sombre, les icônes des apps
(copiées depuis `public/_compte/brand`).

| Composition | Format | Durée | Usage |
|---|---|---|---|
| `Presentation` | 1920×1080 | ~75 s | Site postmelo.ch, YouTube, LinkedIn |
| `Teaser` | 1080×1920 | ~20 s | Reels, TikTok, Shorts |
| `Equipe` | 1080×1920 | ~25 s | Lamio, Cairn, TickUp, Alfred |
| `Media` | 1080×1920 | ~25 s | Metricove, Nino Studio, Maya Studio |

```bash
cd video
npm install
npm run studio            # aperçu interactif
npm run render            # rend les 4 vidéos dans out/
node render.mjs Teaser    # une seule
```

Les scènes sont dans `src/scenes.tsx`, les écrans animés des apps dans `src/mocks.tsx`,
le catalogue et les couleurs dans `src/theme.ts`. Pas de musique pour l'instant :
on la pose au montage, ou via `<Audio>` dans `src/Root.tsx`.
