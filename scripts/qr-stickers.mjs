// Genera il foglio di sticker con QR (SVG stampabile). Uso:
//   npm i --no-save qrcode && node scripts/qr-stickers.mjs https://TUO-DOMINIO/ docs/stickers
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(process.cwd()+'/');
const QR=require('qrcode');
const base=(process.argv[2]||'https://brogifederico82-source.github.io/ultimo-posto/').replace(/\/?$/,'/');
const out=process.argv[3]||'docs/stickers';
mkdirSync(out,{recursive:true});
// codice, titolo, sottotitolo (un codice = un luogo fisico, così si sa quale sticker funziona)
const sticker=[
  ['INGRESSO','Entra nel campus','Scansiona e gioca'],['MENSA','Il tavolo dell’ultimo posto','Segreto della mensa'],
  ['AULA-STUDIO','Silenzio, si gioca','Aula studio'],['BAR','Il caffè sospeso','Bar del campus'],
  ['RADIO','Sintonizzati','Radio Luiss'],['DOME','Sotto la cupola','The Dome'],
  ['BUS-360','Fermata del 360','Viale Romania'],['VILLA-ADA','Attenti ai cinghiali','Villa Ada']
];
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
let body='';
for(const [i,[cod,tit,sub]] of sticker.entries()){
  const svg=await QR.toString(base+'?s='+cod,{type:'svg',margin:1,errorCorrectionLevel:'M',color:{dark:'#10151a',light:'#fff6dd'}});
  const inner=svg.replace(/<\?xml[^>]*>/,'').replace(/<svg[^>]*viewBox="([^"]+)"[^>]*>/,'<svg x="14" y="52" width="172" height="172" viewBox="$1">');
  const x=(i%4)*200,y=Math.floor(i/4)*270;
  body+=`<g transform="translate(${x},${y})"><rect width="196" height="262" rx="14" fill="#fff6dd" stroke="#10151a" stroke-width="3"/><text x="98" y="26" text-anchor="middle" font-family="monospace" font-weight="700" font-size="13" fill="#10151a">ULTIMO POSTO</text><text x="98" y="44" text-anchor="middle" font-family="monospace" font-size="10" fill="#555">${esc(tit)}</text>${inner}<text x="98" y="244" text-anchor="middle" font-family="monospace" font-size="10" fill="#10151a">${esc(sub)} · ${cod}</text></g>`;
}
writeFileSync(out+'/sticker.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 540" width="800" height="540"><rect width="800" height="540" fill="#fff"/>${body}</svg>`);
console.log('Scritto',out+'/sticker.svg','→',base+'?s=CODICE');
