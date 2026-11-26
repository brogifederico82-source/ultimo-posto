// Base per la modalità online: profilo del giocatore (nome, cognome, soprannome), sticker con QR e client multigiocatore (spento finché non c'è un server).
// Il profilo resta solo sul dispositivo finché non si attiva l'online; vedi docs/online.md per architettura, privacy e costi.
const profiloChiave="ultimo-posto-profilo",stickerChiave="ultimo-posto-sticker";
function profiloLeggi(){
  try{const p=JSON.parse(localStorage.getItem(profiloChiave)||"{}");return {nome:String(p.nome||"").slice(0,24),cognome:String(p.cognome||"").slice(0,24),soprannome:String(p.soprannome||"").slice(0,16),consenso:!!p.consenso};}
  catch{return {nome:"",cognome:"",soprannome:"",consenso:false};}
}
function profiloScrivi(p){try{localStorage.setItem(profiloChiave,JSON.stringify(p));}catch{}}
// Nome mostrato sopra il personaggio online: soprannome, altrimenti nome e iniziale del cognome (mai il cognome intero in pubblico).
function profiloNomePubblico(){
  const p=profiloLeggi();
  return p.soprannome||(p.nome?p.nome+(p.cognome?" "+p.cognome[0].toUpperCase()+".":""):"Studente");
}
// Riga per le Opzioni: tre campi e il consenso per mostrarsi agli altri giocatori.
function profiloRiga(){
  const box=document.createElement("div");box.className="sch-row sch-profilo";
  box.style.cssText="display:grid;gap:8px;padding:12px 0;border-top:1px solid #53615a";
  const t=document.createElement("strong");t.textContent=local("Profilo","Profile");
  const d=document.createElement("span");d.textContent=local("Serve solo per giocare online. Gli altri vedono il soprannome (o nome e iniziale).","Only needed to play online. Others see your nickname (or first name and initial).");
  d.style.opacity=".8";
  const p=profiloLeggi();
  const campo=(k,etichetta,max)=>{
    const l=document.createElement("label");l.style.cssText="display:grid;gap:4px";
    const s=document.createElement("span");s.textContent=etichetta;
    const i=document.createElement("input");i.type="text";i.maxLength=max;i.value=p[k];i.autocomplete=k==="nome"?"given-name":k==="cognome"?"family-name":"nickname";
    i.style.cssText="font:inherit;padding:10px;min-height:44px";
    i.addEventListener("input",()=>{const q=profiloLeggi();q[k]=i.value.trim();profiloScrivi(q);});
    l.append(s,i);return l;
  };
  const c=document.createElement("label");c.style.cssText="display:flex;gap:10px;align-items:center;min-height:44px";
  const cb=document.createElement("input");cb.type="checkbox";cb.checked=p.consenso;
  cb.addEventListener("change",()=>{const q=profiloLeggi();q.consenso=cb.checked;profiloScrivi(q);});
  const cs=document.createElement("span");cs.textContent=local("Accetto di comparire agli altri giocatori online","I agree to appear to other online players");
  c.append(cb,cs);
  box.append(t,d,campo("nome",local("Nome","First name"),24),campo("cognome",local("Cognome","Last name"),24),campo("soprannome",local("Soprannome (facoltativo)","Nickname (optional)"),16),c);
  return box;
}

// Sticker: l'URL del QR contiene ?s=CODICE (es. ?s=LUISS-A200). All'apertura il codice si registra e dà una ricompensa una tantum.
function stickerElenco(){try{return JSON.parse(localStorage.getItem(stickerChiave)||"[]");}catch{return [];}}
function stickerLeggiUrl(){
  let codice="";
  try{codice=(new URLSearchParams(location.search).get("s")||"").toUpperCase().replace(/[^A-Z0-9-]/g,"").slice(0,24);}catch{}
  if(!codice)return null;
  const gia=stickerElenco();
  const nuovo=!gia.includes(codice);
  if(nuovo)try{localStorage.setItem(stickerChiave,JSON.stringify([...gia,codice]));}catch{}
  try{history.replaceState(null,"",location.pathname);}catch{}
  return {codice,nuovo};
}
window.addEventListener("load",()=>{
  const s=stickerLeggiUrl();
  if(!s||!s.nuovo)return;
  setTimeout(()=>{if(typeof toastOggetto==="function")toastOggetto("Sticker "+s.codice,"Hai trovato uno sticker del campus!");},1500);
},{once:true});

// Client online (disattivato): si accende con window.UP_SERVER = "wss://..." (vedi docs/online.md).
var onlineStato={connesso:false,altri:new Map(),socket:null};
function onlineConnetti(){
  const url=window.UP_SERVER;
  if(!url||onlineStato.socket||typeof WebSocket!=="function")return false;
  const p=profiloLeggi();if(!p.consenso||!p.nome)return false;
  const ws=new WebSocket(url);onlineStato.socket=ws;
  ws.onopen=()=>{onlineStato.connesso=true;ws.send(JSON.stringify({t:"ciao",nome:profiloNomePubblico(),avatar:state.avatar,zona:state.zone,x:state.x,y:state.y}));};
  ws.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.t==="stato"){onlineStato.altri=new Map(m.giocatori.map(g=>[g.id,g]));}}catch{}};
  ws.onclose=()=>{onlineStato.connesso=false;onlineStato.socket=null;onlineStato.altri.clear();};
  return true;
}
function onlineInvia(){
  const ws=onlineStato.socket;if(!ws||ws.readyState!==1)return;
  ws.send(JSON.stringify({t:"pos",zona:state.zone,x:state.x,y:state.y}));
}
