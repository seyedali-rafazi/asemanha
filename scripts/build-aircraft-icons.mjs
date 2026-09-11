/**
 * Build a local aircraft icon atlas from RexKramer1/AircraftShapesSVG (GPL-3.0).
 * Stroke-outline SVGs are filled, rasterized, and packed into one spritesheet
 * for Deck.gl IconLayer / MapLibre symbol use.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "public/aircraft/icons/source");
const outDir = path.join(root, "public/aircraft");
const tileSize = 128;
const padding = 2;
const fillColor = "#F2C94C";
const strokeColor = "#1F2937";

/** Category fallback icons used when ICAO type is unknown. */
const CATEGORY_ALIASES = {
  commercial_airliner: "A320",
  large_passenger: "B77W",
  small_passenger: "E170",
  business_jet: "FA7X",
  cargo: "C130",
  helicopter: "EC35",
  military: "F16",
  turboprop: "DH8D",
  unknown: "Unidentified",
};

function sanitizeId(filename) {
  return path
    .basename(filename, ".svg")
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_-]/g, "");
}

/**
 * Adapt AircraftShapesSVG outlines into filled map silhouettes.
 * Keeps original path geometry; only restyles for map readability.
 */
function prepareSvg(raw) {
  let svg = raw
    // Drop Inkscape UI chrome that confuses some rasterizers
    .replace(/<sodipodi:namedview[\s\S]*?<\/sodipodi:namedview>/g, "")
    .replace(/<metadata[\s\S]*?<\/metadata>/g, "")
    // Hide detail/accent layers — silhouette only
    .replace(
      /inkscape:label="Accent"[^>]*>/g,
      'inkscape:label="Accent" style="display:none">'
    )
    .replace(
      /inkscape:label="Reference"[^>]*>/g,
      'inkscape:label="Reference" style="display:none">'
    );

  // Fill closed silhouette paths (assets ship as stroke-only outlines)
  svg = svg.replace(/style="([^"]*)"/g, (_match, style) => {
    let next = style
      .replace(/fill\s*:\s*none/gi, `fill:${fillColor}`)
      .replace(/stroke\s*:\s*#[0-9a-fA-F]{3,8}/gi, `stroke:${strokeColor}`);

    if (!/fill\s*:/i.test(next)) {
      next = `fill:${fillColor};${next}`;
    }
    if (!/stroke-width\s*:/i.test(next)) {
      next = `${next};stroke-width:0.35`;
    } else {
      next = next.replace(/stroke-width\s*:\s*[^;]+/gi, "stroke-width:0.35");
    }
    return `style="${next}"`;
  });

  // Normalize root <svg> sizing for a square, nose-up transparent tile
  svg = svg.replace(/<svg\b([^>]*)>/i, (_m, attrs) => {
    let next = String(attrs)
      .replace(/\swidth="[^"]*"/gi, "")
      .replace(/\sheight="[^"]*"/gi, "")
      .replace(/\spreserveAspectRatio="[^"]*"/gi, "");
    if (!/viewBox=/i.test(next)) {
      next += ' viewBox="0 0 80 80"';
    }
    return `<svg${next} width="${tileSize}" height="${tileSize}" preserveAspectRatio="xMidYMid meet">`;
  });

  return svg;
}

function renderTile(svgText) {
  const resvg = new Resvg(svgText, {
    fitTo: { mode: "width", value: tileSize },
    background: "rgba(0,0,0,0)",
  });
  const pngData = resvg.render().asPng();
  return sharp(pngData)
    .resize(tileSize, tileSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function main() {
  const files = fs
    .readdirSync(sourceDir)
    .filter((f) => f.toLowerCase().endsWith(".svg"))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    throw new Error(`No SVG sources in ${sourceDir}`);
  }

  const icons = [];
  for (const file of files) {
    const id = sanitizeId(file);
    const raw = fs.readFileSync(path.join(sourceDir, file), "utf8");
    const prepared = prepareSvg(raw);
    const png = await renderTile(prepared);
    icons.push({ id, png, sourceFile: file });
  }

  // Ensure category alias targets exist as named entries (reusing rendered tiles)
  const byId = new Map(icons.map((i) => [i.id, i]));
  for (const [alias, target] of Object.entries(CATEGORY_ALIASES)) {
    const source = byId.get(target);
    if (!source) {
      console.warn(`Category alias ${alias} → missing ${target}`);
      continue;
    }
    if (!byId.has(alias)) {
      const copy = { id: alias, png: source.png, sourceFile: source.sourceFile };
      icons.push(copy);
      byId.set(alias, copy);
    }
  }

  icons.sort((a, b) => a.id.localeCompare(b.id));

  const cols = Math.ceil(Math.sqrt(icons.length));
  const rows = Math.ceil(icons.length / cols);
  const cell = tileSize + padding * 2;
  const sheetW = cols * cell;
  const sheetH = rows * cell;

  const composites = [];
  const mapping = {};

  icons.forEach((icon, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * cell + padding;
    const y = row * cell + padding;
    composites.push({ input: icon.png, left: x, top: y });
    mapping[icon.id] = {
      x,
      y,
      width: tileSize,
      height: tileSize,
      anchorX: tileSize / 2,
      anchorY: tileSize / 2,
    };
  });

  await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(path.join(outDir, "aircraft-atlas.png"));

  const manifest = {
    source: {
      name: "AircraftShapesSVG",
      url: "https://github.com/RexKramer1/AircraftShapesSVG",
      license: "GPL-3.0",
      attribution:
        "Aircraft silhouettes © RexKramer1 / BelugaProject contributors, GNU GPL v3.0",
    },
    tileSize,
    columns: cols,
    rows,
    count: icons.length,
    categoryAliases: CATEGORY_ALIASES,
    iconMapping: mapping,
    iconIds: icons.map((i) => i.id),
  };

  fs.writeFileSync(
    path.join(outDir, "aircraft-atlas.json"),
    JSON.stringify(manifest, null, 2)
  );

  // Compact mapping for the app (Deck.gl iconMapping)
  fs.writeFileSync(
    path.join(root, "src/pages/Home/components/AircraftLayer/icon/aircraftIconMapping.json"),
    JSON.stringify(mapping, null, 2)
  );

  fs.writeFileSync(
    path.join(outDir, "ATTRIBUTION.md"),
    `# Aircraft icon attribution

Map aircraft silhouettes are derived from [AircraftShapesSVG](https://github.com/RexKramer1/AircraftShapesSVG)
by RexKramer1 (and BelugaProject contributors), licensed under the
[GNU General Public License v3.0](./LICENSE-AircraftShapesSVG.txt).

Original SVG sources are retained under \`icons/source/\` to satisfy GPL source-availability
for these graphical assets. The packed atlas \`aircraft-atlas.png\` is a built derivative
used at runtime; it does not depend on any external image server.

These assets are **not** affiliated with Flightradar24.
`
  );

  console.log(
    `Built ${icons.length} icons → ${path.relative(root, path.join(outDir, "aircraft-atlas.png"))} (${sheetW}×${sheetH})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
