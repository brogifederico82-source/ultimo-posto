import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { Script } from 'node:vm';

const source = new URL('../src/', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const loadText = name => readFile(new URL(name, source), 'utf8');
const scripts = ['game.js', 'classrooms.js', 'interiors.js', 'world.js', 'navigation.js', 'dialogue.js', 'minigames.js', 'loft-arcade.js', 'editor.js'];

const [template, css, map, plan, music, ...parts] = await Promise.all([
  loadText('index.html'),
  loadText('styles.css'),
  loadText('campus.json'),
  readFile(new URL('plan.webp', source)),
  readFile(new URL('sunny-underground.mp3', source)).catch(error => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  }),
  ...scripts.map(loadText),
]);

const game = parts.map(part => part.trim()).join('\n');
new Script(game, { filename: 'Ultimo Posto' });

const sections = {
  STYLES: css.trim(),
  CAMPUS: JSON.stringify(JSON.parse(map)).replaceAll('<', '\\u003c'),
  PLAN: plan.toString('base64'),
  MUSIC: music ? 'data:audio/mpeg;base64,' + music.toString('base64') :
    'https://raw.githubusercontent.com/brogifederico82-source/ultimo-posto/5d56147c6b2ef0baa117ccab6998664e7cb0f6d3/src/sunny-underground.mp3',
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
