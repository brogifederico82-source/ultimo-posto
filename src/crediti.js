// Crediti e fonti dei dati: la dicitura richiesta da OpenStreetMap/Overture (ODbL) deve essere visibile nel gioco.
// Funzioni senza const/let a livello di file: possono essere chiamate da qualunque modulo.

function creditiTesto(){
  return local(
    "Mappa dei Parioli: © OpenStreetMap contributors, Overture Maps Foundation (edifici, strade, verde, acque: licenza ODbL 1.0; luoghi: CDLA Permissive 2.0). Il tracciato è semplificato e in parte dedotto; non è una mappa ufficiale.",
    "Parioli map: © OpenStreetMap contributors, Overture Maps Foundation (buildings, roads, green areas, water: ODbL 1.0; places: CDLA Permissive 2.0). The layout is simplified and partly inferred; it is not an official map.");
}
// Riga per le Opzioni.
function creditiRiga(){
  const box=document.createElement("div");box.className="sch-row sch-crediti";
  box.style.cssText="display:grid;gap:6px;padding:12px 0;border-top:1px solid #53615a";
  const t=document.createElement("strong");t.textContent=local("Crediti e fonti","Credits and sources");
  const d=document.createElement("span");d.textContent=creditiTesto();d.style.cssText="opacity:.85;line-height:1.45";
  const d2=document.createElement("span");d2.style.cssText="opacity:.75;line-height:1.45";
  d2.textContent=local("Font: Pixelify Sans e Press Start 2P (SIL OFL 1.1). Gioco satirico di fantasia, non affiliato alla LUISS.","Fonts: Pixelify Sans and Press Start 2P (SIL OFL 1.1). Satirical fan game, not affiliated with LUISS.");
  box.append(t,d,d2);return box;
}
// Riga breve nel piè di pagina della schermata iniziale.
window.addEventListener("DOMContentLoaded",()=>{
  const f=document.querySelector("footer");
  if(!f||f.querySelector(".crediti-mappa"))return;
  const s=document.createElement("small");s.className="crediti-mappa";s.style.cssText="display:block;margin-top:6px;opacity:.75";
  s.textContent="© OpenStreetMap contributors, Overture Maps Foundation (ODbL)";
  f.append(s);
},{once:true});
