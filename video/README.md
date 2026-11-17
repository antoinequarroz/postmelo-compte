# Vidéo de présentation de la suite

Motion design de la suite Postmelo, fait en code avec [Remotion](https://www.remotion.dev),
avec le design du site : Geist et Instrument Serif, le grain, le thème sombre, les icônes des apps
(copiées depuis `public/_compte/brand`).

| Composition | Format | Durée | Usage |
|---|---|---|---|
| `Presentation` | 1920×1080 | 72 s | Site postmelo.ch, YouTube, LinkedIn |
| `Teaser` | 1080×1920 | 28 s | Reels, TikTok, Shorts |
| `Equipe` | 1080×1920 | 32 s | Lamio, Cairn, TickUp, Alfred |
| `Media` | 1080×1920 | 32 s | Metricove, Nino Studio, Maya Studio |

```bash
cd video
npm install
npm run studio            # aperçu interactif
npm run render            # rend les 4 vidéos dans out/
node render.mjs Teaser    # une seule
```

Tout est calé sur un tempo de 120 BPM (un temps = 15 images) :
- `src/opening.tsx` : l'accroche (trop d'apps) et la révélation du logo,
- `src/ad.tsx` : le moteur d'une scène d'app (titre, fenêtre, caméra, curseur, bulles, bruitages),
- `src/apps/<app>.tsx` : l'écran animé de chaque app et son script (curseur, bulles, zooms, sons),
- `src/finale.tsx` : « Et elles se parlent », le hub et l'appel à l'action,
- `scripts/make_audio.py` : la musique provisoire et les bruitages, synthétisés (`python3 scripts/make_audio.py`).

Pour une autre musique, remplace `public/music/*.wav` (120 BPM, le drop à la mesure 4) ou change `music` dans `src/Root.tsx`.
Après le rendu, normaliser le son : `ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac out.mp4`.
