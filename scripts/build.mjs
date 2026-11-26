import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { Script } from 'node:vm';

const source = new URL('../src/', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const loadText = name => readFile(new URL(name, source), 'utf8');
const scripts = ['game.js', 'campus-life.js', 'classrooms.js', 'interiors.js', 'world.js', 'navigation.js', 'audio.js', 'dialogue.js', 'villa-ada.js', 'minigames.js', 'holdem.js', 'viale-races.js', 'virtual-football.js', 'calcetto.js', 'loft-arcade.js', 'smoking.js', 'editor.js'];

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

const sections = {
  STYLES: css.trim(),
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

await mkdir(output, { recursive: true });
await writeFile(new URL('index.html', output), html);
console.log('Built dist/index.html');
