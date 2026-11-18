// Usage:
//   node render.mjs                      → renders every composition to out/*.mp4
//   node render.mjs Presentation         → renders one composition
//   node render.mjs --stills Presentation 60,300,470 [dir]  → PNG stills at half size, to check frames
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const args = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });

if (args[0] === "--stills") {
  const [, id, frames, dir = "out/stills"] = args;
  fs.mkdirSync(dir, { recursive: true });
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  for (const frame of frames.split(",").map(Number)) {
    const output = `${dir}/${id}-${frame}.png`;
    await renderStill({ serveUrl, composition, frame, output, scale: 0.5, browserExecutable });
    console.log(output);
  }
} else {
  const ids = args.length ? args : ["Presentation", "Teaser", "Equipe", "Media"];
  fs.mkdirSync("out", { recursive: true });
  for (const id of ids) {
    const composition = await selectComposition({ serveUrl, id, browserExecutable });
    const outputLocation = `out/postmelo-${id.toLowerCase()}.mp4`;
    let last = -1;
    await renderMedia({
      serveUrl,
      composition,
      codec: "h264",
      crf: 18,
      pixelFormat: "yuv420p",
      imageFormat: "jpeg",
      jpegQuality: 92,
      outputLocation,
      browserExecutable,
      concurrency: Number(process.env.CONCURRENCY) || null,
      onProgress: ({ progress }) => {
        const p = Math.floor(progress * 10);
        if (p !== last) console.log(`${id} ${p * 10}%`), (last = p);
      },
    });
    console.log(outputLocation);
  }
}
