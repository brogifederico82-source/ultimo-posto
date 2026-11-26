import { packageGame } from "./package.mjs";
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { createHash } from 'node:crypto';

const source = new URL('../src/', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const loadText = name => readFile(new URL(name, source), 'utf8');
const scripts = ['game.js', 'campus-life.js', 'classrooms.js', 'interiors.js', 'pola.js', 'vivid.js', 'world.js', 'navigation.js', 'audio.js', 'sfx.js', 'dialogue.js', 'ambiente.js', 'realismo.js', 'insegne.js', 'schermo.js', 'transizioni.js', 'villa-ada.js', 'idee.js', 'lore.js', 'minigames.js', 'holdem.js', 'viale-races.js', 'virtual-football.js', 'calcetto.js', 'loft-arcade.js', 'smoking.js', 'segreti.js', 'schermate.js', 'zaino.js', 'editor.js'];

const [template, css, map, plan, entranceMusic, campusMusic, ...parts] = await Promise.all([
  loadText('index.html'),
  loadText('styles.css'),
  loadText('campus.json'),
  readFile(new URL('plan.webp', source)),
  readFile(new URL('sunny-underground.mp3', source)),
  readFile(new URL('arcade-sunset.mp3', source)),
  ...scripts.map(loadText),
]);

const game = parts.map(part => part.trim()).join('\n');
new Script(game, { filename: 'Ultimo Posto' });

// Font pixel-art (licenza OFL, vedi src/fonts): incorporati nell'HTML e disponibili come variabili CSS.
const fontFiles = [
  ['Pixelify Sans', 400, 'pixelify-sans-latin-400-normal.woff2'],
  ['Pixelify Sans', 700, 'pixelify-sans-latin-700-normal.woff2'],
  ['Press Start 2P', 400, 'press-start-2p-latin-400-normal.woff2'],
];
const fontFaces = await Promise.all(fontFiles.map(async ([family, weight, file]) => {
  const data = (await readFile(new URL('fonts/' + file, source))).toString('base64');
  return `@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;font-display:swap;src:url(data:font/woff2;base64,${data}) format("woff2")}`;
}));
const fontCss = fontFaces.join('\n') + '\n:root{--font-ui:"Pixelify Sans",ui-monospace,monospace;--font-title:"Press Start 2P","Pixelify Sans",ui-monospace,monospace}\n';

const sections = {
  STYLES: fontCss + css.trim(),
  CAMPUS: JSON.stringify(JSON.parse(map)).replaceAll('<', '\\u003c'),
  PLAN: plan.toString('base64'),
  ENTRANCE_MUSIC: entranceMusic.toString('base64'),
  CAMPUS_MUSIC: campusMusic.toString('base64'),
  GAME: game.trim(),
};
let html = template;
for (const [name, contents] of Object.entries(sections)) {
  const marker = `<!-- BUILD_${name} -->`;
  const first = html.indexOf(marker);
  if (first < 0 || first !== html.lastIndexOf(marker)) {
    throw new Error(`Expected exactly one ${marker} in src/index.html`);
  }
  html = html.replace(marker, () => contents);
}

const release = createHash('sha256').update(html).update(
  await readFile(new URL('./package.mjs', import.meta.url))
).digest('hex').slice(0, 16);
html = html.replace('<!-- BUILD_RELEASE -->', release);
await mkdir(output, { recursive: true });
await writeFile(new URL('index.html', output), html);
await packageGame(output, release);
console.log('Built dist/index.html');
