// Transizioni e animazioni d'interfaccia. Modulo autonomo: gli stili sono iniettati da qui (niente styles.css).
// API pubblica:
//   transizione(tipo, azione, opzioni) -> Promise   tipi: dissolvenza, iride, sipario, porta, tessere, battaglia, pagina
//     copre lo schermo, esegue azione() (a meta' copertura, oppure subito se opzioni.subito) e scopre.
//     opzioni: {subito, snap, centro:{x,y} in px di viewport, colore}
//   toastOggetto(nome, testo, opzioni)  avviso "Hai ottenuto: X!" con icona, in coda
//   transizioneAttiva()  true finche' un overlay e' a schermo
// Ganci negli altri file: show() e travel() in game.js, openChallenge/closeChallenge in minigames.js,
// renderScene() (Game Over / Riprova), carry()/discover()/awardCoins(), ambienteMondo() in ambiente.js.
// Nessuna transizione blocca l'input (overlay con pointer-events:none) e ognuna ha un timeout di sicurezza.
var trz={att:null,ultimoAvvio:-1e9,ultimoShow:-1e9,zonaVista:null,zonaNota:null,coda:[],toastAttivo:false,
  over:undefined,st:null,monete:null,obiettivo:null,banner:null};
var TRZ_DURATE={dissolvenza:380,iride:700,sipario:850,porta:640,tessere:680,battaglia:820,pagina:760};
var TRZ_COL="#0c1214";
function trzRidotto(){
  try{if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return true;}catch(e){}
  return false;
}
// Con un browser automatico le durate sono minime, salvo `window.transizioniReali=true` (usato dai miei test visivi).
function trzAuto(){return Boolean(navigator.webdriver)&&!window.transizioniReali;}
function trzEase(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function trzClamp(x,a,b){return x<a?a:x>b?b:x;}

// ---------------------------------------------------------------------------
// Disegno delle coperture: u = 0 (schermo libero) ... 1 (schermo coperto)
// ---------------------------------------------------------------------------
function trzDisegna(c,tipo,u,W,H,cx,cy,rev,col){
  c.clearRect(0,0,W,H);
  if(u<=0)return;
  const full=u>=1;
  c.fillStyle=col;
  if(tipo==="dissolvenza"){
    c.globalAlpha=u;c.fillRect(0,0,W,H);c.globalAlpha=1;
  }else if(tipo==="iride"){
    const R=Math.hypot(Math.max(cx,W-cx),Math.max(cy,H-cy))+2,r=(1-u)*R;
    if(full||r<.5){c.fillRect(0,0,W,H);return;}
    c.beginPath();c.rect(0,0,W,H);c.arc(cx,cy,r,0,6.2832,true);c.fill("evenodd");
    c.strokeStyle="#e5ad62";c.lineWidth=1;c.beginPath();c.arc(cx,cy,r+.5,0,6.2832);c.stroke();
  }else if(tipo==="sipario"){
    const w=Math.ceil(u*W/2)+(full?1:0);
    for(let side=0;side<2;side++){
      const x0=side?W-w:0;
      c.fillStyle="#7d1f2c";c.fillRect(x0,0,w,H);
      for(let x=0;x<w;x+=4){
        const k=.5+.5*Math.sin((x+side*5)*.8);
        c.fillStyle="rgba(0,0,0,"+(.06+.24*k).toFixed(2)+")";c.fillRect(x0+x,0,2,H);
        c.fillStyle="rgba(255,190,170,"+(.05*k).toFixed(2)+")";c.fillRect(x0+x+2,0,1,H);
      }
      c.fillStyle="#e5ad62";c.fillRect(side?x0:x0+w-2,0,2,H);
      c.fillStyle="#53131d";c.fillRect(x0,0,w,Math.max(3,H*.035));
    }
  }else if(tipo==="porta"){
    const w=Math.ceil(u*W/2)+(full?1:0);
    for(let side=0;side<2;side++){
      const x0=side?W-w:0,inner=side?x0:x0+w;
      c.fillStyle="#6b4528";c.fillRect(x0,0,w,H);
      for(let d=0;d<w+14;d+=14){
        const px=side?inner+d:inner-d-1;
        if(px<x0-1||px>x0+w)continue;
        c.fillStyle="#4a2e19";c.fillRect(px,0,1,H);
        c.fillStyle="#82583a";c.fillRect(px+(side?1:-1),0,1,H);
      }
      if(w>24){
        c.strokeStyle="#4a2e19";c.lineWidth=1;
        const ix=side?inner+6:inner-w+6,iw=Math.max(0,w-12);
        c.strokeRect(ix+.5,H*.08+.5,iw,H*.32);c.strokeRect(ix+.5,H*.56+.5,iw,H*.34);
      }
      c.fillStyle="rgba(0,0,0,.34)";c.fillRect(side?inner:inner-6,0,6,H);
      c.fillStyle="#e5ad62";c.beginPath();c.arc(side?inner+5:inner-6,H*.5,2.2,0,6.2832);c.fill();
    }
  }else if(tipo==="tessere"){
    const T=Math.max(10,Math.round(W/22)),nx=Math.ceil(W/T),ny=Math.ceil(H/T);
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
      const th=((Math.imul(i+1,2654435761)^Math.imul(j+7,40503))>>>0)%100/100*.36+((i+j)/(nx+ny))*.42;
      const q=full?1:trzClamp((u-th)/.2,0,1);
      if(q<=0)continue;
      const s=Math.ceil(T*q);
      c.fillStyle=(i+j)&1?"#162226":col;
      c.fillRect(i*T+((T-s)>>1),j*T+((T-s)>>1),s+(q>=1?1:0),s+(q>=1?1:0));
    }
  }else if(tipo==="battaglia"){
    const N=12,ry=Math.ceil(H/N);
    for(let i=0;i<N;i++){
      const q=trzClamp(u*1.6-(i/N)*.6,0,1);
      if(q<=0)continue;
      const w=Math.ceil(q*W)+(q>=1?1:0),x=i%2?W-w:0;
      c.fillStyle=col;c.fillRect(x,i*ry,w,ry);
      c.fillStyle="#f1deb4";c.fillRect(i%2?x:x+w-1,i*ry,1,ry);
    }
    if(!rev&&u<.4){
      const a=(Math.sin(u*45)>0?.55:0)*(1-u/.4);
      if(a>0){c.globalAlpha=a;c.fillStyle="#fff";c.fillRect(0,0,W,H);c.globalAlpha=1;}
    }
  }else if(tipo==="pagina"){
    // Pagina che si gira: in copertura scorre da destra a sinistra, in apertura se ne va verso sinistra.
    const edge=rev?W*u:W*(1-u),x0=rev?0:edge,w=rev?edge:W-edge;
    if(w<=0)return;
    c.fillStyle="#efe0bd";c.fillRect(x0,0,w+(full?1:0),H);
    c.fillStyle="rgba(120,96,60,.28)";
    for(let y=14;y<H;y+=11)c.fillRect(x0+6,y,Math.max(0,w-12),1);
    if(!full){
      const fx=rev?edge:edge-16;
      for(let k=0;k<16;k++){
        const a=rev?(.34*(1-k/16)):(.34*(k/16));
        c.fillStyle="rgba(40,24,10,"+a.toFixed(3)+")";c.fillRect(fx+k,0,1,H);
      }
      c.fillStyle="#fff8e4";c.fillRect(rev?edge-3:edge,0,3,H);
      c.fillStyle="rgba(0,0,0,.18)";c.fillRect(rev?edge:edge-34,0,1,H);
    }
  }
}

// ---------------------------------------------------------------------------
// Motore: una sola transizione per volta, azione eseguita una e una sola volta
// ---------------------------------------------------------------------------
function transizioneAttiva(){return Boolean(trz&&trz.att);}
function trzEsegui(t){
  if(t.fatta)return;
  t.fatta=true;
  if(typeof t.azione==="function"){try{t.azione();}catch(e){console.error(e);}}
}
function trzMeta(t){
  if(t.snapEl){t.snapEl.remove();t.snapEl=null;}
  trzEsegui(t);
}
function trzFine(t){
  trzMeta(t);
  if(t.chiusa)return;
  t.chiusa=true;
  clearTimeout(t.tm1);clearTimeout(t.tm2);
  if(t.raf)cancelAnimationFrame(t.raf);
  t.root.remove();
  if(trz.att===t)trz.att=null;
  t.res();
}
function trzFrame(t,now){
  if(trz.att!==t)return;
  const e=now-t.t0;
  let u,rev=false;
  if(e<t.cop)u=trzEase(e/t.cop);
  else if(e<t.cop+t.hold){u=1;trzMeta(t);}
  else{
    trzMeta(t);
    const r=(e-t.cop-t.hold)/t.apr;
    if(r>=1){trzFine(t);return;}
    u=1-trzEase(r);rev=true;
  }
  trzDisegna(t.ctx,t.tipo,u,t.W,t.H,t.cx,t.cy,rev,t.col);
  t.raf=requestAnimationFrame(n=>trzFrame(t,n));
}
function transizione(tipo,azione,opzioni){
  const opz=opzioni||{};
  if(typeof document==="undefined"||!trz){if(typeof azione==="function")azione();return Promise.resolve();}
  if(trz.att)trzFine(trz.att);
  if(!Object.hasOwn(TRZ_DURATE,tipo))tipo="dissolvenza";
  const rid=trzRidotto();
  let tot=TRZ_DURATE[tipo];
  if(rid){tipo="dissolvenza";tot=220;}
  if(trzAuto())tot=40;
  const t={tipo,azione,fatta:false,chiusa:false,col:opz.colore||TRZ_COL,
    cop:tot*.42,hold:tot*.08,apr:tot*.5,snapEl:null,raf:0};
  trz.ultimoAvvio=performance.now();
  const iw=window.innerWidth||document.documentElement.clientWidth||320,ih=window.innerHeight||document.documentElement.clientHeight||200;
  const S=Math.max(2,Math.round(iw/360));
  t.W=Math.ceil(iw/S);t.H=Math.ceil(ih/S);
  const st=document.getElementById("stage"),rect=st?st.getBoundingClientRect():null;
  const haStage=Boolean(rect&&rect.width>8&&rect.height>8);
  const centro=opz.centro||(haStage?{x:rect.left+rect.width/2,y:rect.top+rect.height/2}:{x:iw/2,y:ih/2});
  t.cx=centro.x/S;t.cy=centro.y/S;
  const root=document.createElement("div");
  root.id="trz";root.setAttribute("aria-hidden","true");root.dataset.tipo=tipo;
  root.style.cssText="position:fixed;left:0;top:0;width:100vw;height:100vh;height:100dvh;margin:0;padding:0;border:0;background:none;"+
    "overflow:hidden;pointer-events:none;z-index:2147483000;display:block;inset:0;";
  if(opz.subito&&opz.snap&&haStage&&st.width){
    try{
      const s=document.createElement("canvas");s.width=st.width;s.height=st.height;
      s.getContext("2d").drawImage(st,0,0);
      s.style.cssText="position:fixed;left:"+rect.left+"px;top:"+rect.top+"px;width:"+rect.width+"px;height:"+rect.height+"px;image-rendering:pixelated;";
      root.append(s);t.snapEl=s;
    }catch(e){}
  }
  const cv=document.createElement("canvas");
  cv.width=t.W;cv.height=t.H;
  cv.style.cssText="position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;";
  root.append(cv);
  t.ctx=cv.getContext("2d");t.root=root;
  document.body.append(root);
  if(root.showPopover){try{root.setAttribute("popover","manual");root.showPopover();}catch(e){}}
  // Il popover sposta lo stile predefinito (margini, bordo): lo riportiamo a schermo intero.
  root.style.inset="0";
  trz.att=t;
  if(opz.subito)trzEsegui(t);
  t.t0=performance.now();
  trzDisegna(t.ctx,t.tipo,opz.subito&&!t.snapEl?1:0,t.W,t.H,t.cx,t.cy,false,t.col);
  if(opz.subito&&!t.snapEl)t.cop=0;
  // Timeout di sicurezza: anche se requestAnimationFrame e' sospeso (scheda in secondo piano) tutto si chiude.
  t.tm1=setTimeout(()=>trzMeta(t),t.cop+t.hold+250);
  t.tm2=setTimeout(()=>trzFine(t),tot+700);
  return new Promise(res=>{
    t.res=res;
    t.raf=requestAnimationFrame(n=>trzFrame(t,n));
  });
}
// ---------------------------------------------------------------------------
// Ganci di schermata, zona, scena
// ---------------------------------------------------------------------------
function transizioneSchermata(da,a){
  if(!trz||da===a)return;
  trz.ultimoShow=performance.now();
  let tipo="dissolvenza";
  if(a==="game")tipo=da==="home"?"pagina":"iride";
  else if(a==="home")tipo=da==="game"?"sipario":"dissolvenza";
  else if(a==="editor"||da==="editor")tipo="tessere";
  transizione(tipo,null,{subito:true,snap:da==="game"});
}
function trzStanza(id){try{return room(id);}catch(e){return null;}}
function transizioneZona(da,a){
  if(!trz)return;
  trz.zonaNota=a;
  const za=trzStanza(a),zd=trzStanza(da);
  let tipo="dissolvenza";
  if(a==="villa-ada"||da==="villa-ada")tipo="iride";
  else if(a==="pola"||a==="pola-cortile")tipo="sipario";
  else if(da!==a&&((za&&za.ground==="floor")||(zd&&zd.ground==="floor")))tipo="porta";
  transizione(tipo,null,{subito:true,snap:true});
}
// Chiamata a ogni frame da ambienteMondo(): rileva ogni cambio di zona (anche quelli senza travel()).
function transizioneZonaVista(id){
  if(!trz||id===trz.zonaVista)return;
  const prima=trz.zonaVista;
  trz.zonaVista=id;
  if(prima===null||typeof screen==="undefined"||screen!=="game")return;
  const recente=performance.now()-trz.ultimoAvvio<1200;
  if(!recente&&trz.zonaNota!==id)transizione("dissolvenza",null,{subito:true});
  trzBanner(id,recente||Boolean(trz.att));
}
function trzBanner(id,ritardo){
  const z=trzStanza(id);
  if(!z||!z.name)return;
  const nome=typeof tr==="function"?tr(z.name):z.name,parti=nome.split(" · ");
  if(trz.banner){trz.banner.remove();trz.banner=null;}
  const el=document.createElement("div");
  el.className="trz-banner"+(trzRidotto()?" trz-rid":"")+(ritardo?" trz-ritardo":"");
  el.setAttribute("aria-hidden","true");
  const b=document.createElement("b");b.textContent=parti[0];el.append(b);
  if(parti[1]){const s=document.createElement("small");s.textContent=parti.slice(1).join(" · ");el.append(s);}
  const durata=trzAuto()?600:2900;
  el.style.animationDuration=durata+"ms";
  document.body.append(el);trz.banner=el;
  setTimeout(()=>{el.remove();if(trz.banner===el)trz.banner=null;},durata+400);
}
// Chiamata alla fine di renderScene(): Game Over (tremolio, lampo, bordo rosso) e Riprova (iride).
function transizioniScena(){
  if(!trz||typeof state==="undefined"||!state)return;
  const e=state.ending,over=Boolean(e&&(e.traffic||e.guard||e.boar));
  if(trz.st!==state||trz.over===undefined){trz.st=state;trz.over=over;return;}
  if(over&&!trz.over)trzGameOver();
  else if(!over&&trz.over&&typeof screen!=="undefined"&&screen==="game")transizione("iride",null,{subito:true,snap:true});
  trz.over=over;
}
function trzGameOver(){
  if(trzRidotto())return;
  const g=document.getElementById("game");
  if(g){g.classList.remove("trz-shake");void g.offsetWidth;g.classList.add("trz-shake");setTimeout(()=>g.classList.remove("trz-shake"),700);}
  for(const cl of ["trz-lampo","trz-vignetta"]){
    const el=document.createElement("div");el.className=cl;el.setAttribute("aria-hidden","true");
    document.body.append(el);setTimeout(()=>el.remove(),1300);
  }
}

// ---------------------------------------------------------------------------
// Monete e obiettivo: osservano il DOM, quindi non dipendono dal layout scelto da altri
// ---------------------------------------------------------------------------
function trzNum(s){const m=/-?\d+/.exec(s||"");return m?Number(m[0]):0;}
function trzRiavvia(el,cl){el.classList.remove(cl);void el.offsetWidth;el.classList.add(cl);}
function trzMonete(w,diff){
  if(trzRidotto())return;
  if(getComputedStyle(w).display==="inline"){w.style.display="inline-block";setTimeout(()=>{w.style.display="";},700);}
  trzRiavvia(w,"trz-pop");
  setTimeout(()=>w.classList.remove("trz-pop"),700);
  const r=w.getBoundingClientRect();
  if(r.width<2)return;
  const f=document.createElement("span");
  f.className="trz-piu";f.textContent="+"+diff;f.setAttribute("aria-hidden","true");
  f.style.left=(r.left+r.width/2)+"px";f.style.top=(r.bottom+2)+"px";
  document.body.append(f);setTimeout(()=>f.remove(),1100);
}
function trzOsserva(){
  if(typeof document==="undefined")return;
  const w=document.getElementById("walletCoins"),o=document.getElementById("objective");
  if(!w||!o||typeof MutationObserver==="undefined")return;
  const attivo=()=>typeof screen!=="undefined"&&screen==="game"&&performance.now()-trz.ultimoShow>800;
  trz.monete=trzNum(w.textContent);
  new MutationObserver(()=>{
    const n=trzNum(w.textContent);
    if(n>trz.monete&&attivo())trzMonete(w,n-trz.monete);
    trz.monete=n;
  }).observe(w,{childList:true,characterData:true,subtree:true});
  trz.obiettivo=o.textContent;
  new MutationObserver(()=>{
    const t=o.textContent;
    if(t!==trz.obiettivo&&trz.obiettivo&&t&&attivo()&&!trzRidotto()){
      const card=o.closest(".task-card")||o;
      trzRiavvia(card,"trz-impulso");
      setTimeout(()=>card.classList.remove("trz-impulso"),900);
      if(typeof sound==="function")sound("objective","interface");
    }
    trz.obiettivo=t;
  }).observe(o,{childList:true,characterData:true,subtree:true});
}

// ---------------------------------------------------------------------------
// Avvisi "Hai ottenuto: X!"
// ---------------------------------------------------------------------------
function trzIconaRiserva(nome){
  const c=document.createElement("canvas");c.width=16;c.height=16;
  const g=c.getContext("2d"),r=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const n=String(nome||"").toLowerCase();
  if(/monet|coin|euro/.test(n)){
    r("#8a5a1c",5,2,6,12);r("#8a5a1c",3,4,10,8);r("#e5ad62",5,3,6,10);r("#e5ad62",4,5,8,6);
    r("#ffe3a2",5,4,2,2);r("#b8802f",7,5,2,6);
  }else if(/sigar/.test(n)){
    r("#f1ece0",2,7,10,3);r("#d98b3a",12,7,2,3);r("#b9b2a2",9,7,1,3);r("#9a9a9a",13,4,1,2);r("#bdbdbd",14,2,1,2);
  }else if(/mel[ae]|apple/.test(n)){
    r("#b8362f",4,5,8,8);r("#d8473b",5,4,6,2);r("#d8473b",5,6,2,3);r("#6a3a1c",8,2,1,3);r("#5f9a45",9,2,3,2);
  }else if(/traguard|scopert|star|stella/.test(n)){
    r("#e5ad62",7,1,2,3);r("#e5ad62",3,5,10,3);r("#e5ad62",5,8,6,3);r("#e5ad62",4,11,3,3);r("#e5ad62",9,11,3,3);r("#ffe3a2",7,5,2,2);
  }else{
    let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))>>>0;
    const cols=["#c8553f","#4d8fb8","#6aa65a","#9b6ac4","#d1a23f","#4aa6a0"],col=cols[h%cols.length];
    r("#1b1410",2,5,12,10);r(col,3,6,10,8);r("rgba(255,255,255,.28)",3,6,10,2);
    r("#f1deb4",7,4,2,11);r("#f1deb4",3,9,10,2);r("#f1deb4",5,2,3,3);r("#f1deb4",9,2,3,3);
  }
  return c;
}
function trzIcona(nome){
  try{
    if(typeof iconaOggetto==="function"){
      const i=iconaOggetto(nome,16);
      if(i instanceof Node)return i;
      if(typeof i==="string"&&i){const im=new Image();im.src=i;return im;}
    }
  }catch(e){}
  return trzIconaRiserva(nome);
}
function toastOggetto(nome,testo,opzioni){
  if(typeof document==="undefined"||!trz)return;
  const opz=opzioni||{},msg=testo||("Hai ottenuto: "+nome+"!");
  if(trz.coda.some(x=>x.msg===msg&&x.nome===nome))return;
  if(trz.coda.length>=6)trz.coda.shift();
  trz.coda.push({nome,msg,suono:opz.suono!==false});
  if(!trz.toastAttivo)trzToastSuccessivo();
}
function trzToastSuccessivo(){
  const x=trz.coda.shift();
  if(!x){trz.toastAttivo=false;return;}
  trz.toastAttivo=true;
  const el=document.createElement("div");
  el.className="trz-toast"+(trzRidotto()?" trz-rid":"");
  el.setAttribute("role","status");
  const ico=trzIcona(x.nome);
  ico.classList.add("trz-ico");
  const tx=document.createElement("span");tx.textContent=x.msg;
  el.append(ico,tx);
  const durata=trzAuto()?700:(trz.coda.length?2000:2800);
  el.style.animationDuration=durata+"ms";
  document.body.append(el);
  if(x.suono&&typeof sound==="function")sound("coin","interface");
  setTimeout(()=>{el.remove();trzToastSuccessivo();},durata+60);
}

// ---------------------------------------------------------------------------
// Stili (iniettati dal JS)
// ---------------------------------------------------------------------------
(function trzStili(){
  if(typeof document==="undefined")return;
  const css=
    "@keyframes trz-pop{0%{transform:scale(1)}30%{transform:scale(1.32);filter:brightness(1.5)}60%{transform:scale(.95)}100%{transform:scale(1)}}"+
    "@keyframes trz-piu{0%{opacity:0;transform:translate(-50%,0) scale(.7)}18%{opacity:1;transform:translate(-50%,-3px) scale(1.15)}100%{opacity:0;transform:translate(-50%,-30px) scale(1)}}"+
    "@keyframes trz-impulso{0%{box-shadow:0 0 0 0 #e5ad6200}25%{box-shadow:0 0 0 3px #e5ad62cc,0 0 18px 4px #e5ad6288;transform:scale(1.035)}60%{box-shadow:0 0 0 2px #e5ad6266;transform:scale(1)}100%{box-shadow:0 0 0 0 #e5ad6200;transform:scale(1)}}"+
    "@keyframes trz-banner{0%{transform:translateX(-105%);opacity:1}16%{transform:translateX(0)}84%{transform:translateX(0);opacity:1}100%{transform:translateX(105%);opacity:1}}"+
    "@keyframes trz-banner-r{0%{opacity:0}16%{opacity:1}84%{opacity:1}100%{opacity:0}}"+
    "@keyframes trz-toast{0%{transform:translate(-50%,-170%);opacity:0}12%{transform:translate(-50%,8px);opacity:1}18%{transform:translate(-50%,0)}86%{transform:translate(-50%,0);opacity:1}100%{transform:translate(-50%,-170%);opacity:0}}"+
    "@keyframes trz-toast-r{0%{opacity:0}15%{opacity:1}85%{opacity:1}100%{opacity:0}}"+
    "@keyframes trz-shake{0%,100%{transform:translate(0,0)}10%{transform:translate(-7px,3px)}22%{transform:translate(6px,-4px)}34%{transform:translate(-5px,-2px)}46%{transform:translate(4px,3px)}58%{transform:translate(-3px,1px)}72%{transform:translate(2px,-1px)}86%{transform:translate(-1px,1px)}}"+
    "@keyframes trz-lampo{0%{opacity:.95}100%{opacity:0}}"+
    "@keyframes trz-vignetta{0%{opacity:0}18%{opacity:1}100%{opacity:0}}"+
    "@keyframes trz-pannello{from{opacity:0;transform:translateY(10px) scale(.975)}to{opacity:1;transform:none}}"+
    "@keyframes trz-velo{from{opacity:0}to{opacity:1}}"+
    ".trz-pop{animation:trz-pop .5s cubic-bezier(.2,1.5,.4,1)}"+
    ".trz-piu{position:fixed;z-index:9500;pointer-events:none;font:700 15px var(--font-ui,system-ui);color:#ffe3a2;text-shadow:0 2px 0 #3a2a10,0 0 8px #e5ad62;animation:trz-piu 1s ease-out both}"+
    ".trz-impulso{animation:trz-impulso .85s cubic-bezier(.25,.8,.3,1)}"+
    ".trz-banner{position:fixed;left:0;right:0;top:max(22%,64px);z-index:9000;pointer-events:none;padding:10px 6vw 11px;"+
      "background:linear-gradient(90deg,#0c1214ee 0,#0c1214dd 70%,#0c121400);border-top:2px solid #e5ad62;border-bottom:2px solid #e5ad6288;"+
      "display:flex;flex-direction:column;gap:5px;animation:trz-banner 2.9s cubic-bezier(.22,.9,.3,1) both}"+
    ".trz-banner b{font:400 clamp(13px,2.6vw,22px)/1.25 var(--font-title,var(--font-ui,system-ui));color:#f1deb4;text-shadow:2px 2px 0 #000}"+
    ".trz-banner small{font:400 clamp(11px,1.9vw,16px)/1.2 var(--font-ui,system-ui);color:#e5ad62;letter-spacing:.08em}"+
    ".trz-banner.trz-ritardo{animation-delay:.3s}"+
    ".trz-banner.trz-rid{animation-name:trz-banner-r}"+
    ".trz-toast{position:fixed;left:50%;top:max(env(safe-area-inset-top),12px);z-index:9600;pointer-events:none;display:flex;align-items:center;gap:12px;"+
      "max-width:min(92vw,520px);padding:9px 16px 9px 10px;background:#1b2a2c;color:#f1deb4;border:2px solid #e5ad62;border-radius:4px;"+
      "box-shadow:0 0 0 2px #0c1214,0 5px 0 2px #0c1214,0 10px 22px #0008;font:400 clamp(14px,2.4vw,18px)/1.25 var(--font-ui,system-ui);"+
      "animation:trz-toast 2.8s cubic-bezier(.22,.9,.3,1.1) both}"+
    ".trz-toast.trz-rid{animation-name:trz-toast-r}"+
    ".trz-toast.trz-rid,.trz-toast{transform:translateX(-50%)}"+
    ".trz-ico{flex:none;width:34px;height:34px;image-rendering:pixelated;background:#0f1a1c;border:2px solid #53615a;padding:2px;border-radius:3px}"+
    "#game.trz-shake{animation:trz-shake .62s cubic-bezier(.3,.6,.4,1)}"+
    ".trz-lampo{position:fixed;inset:0;z-index:9400;pointer-events:none;background:#fff;animation:trz-lampo .38s ease-out both}"+
    ".trz-vignetta{position:fixed;inset:0;z-index:9390;pointer-events:none;background:radial-gradient(ellipse at center,#0000 38%,#a8141488 80%,#5a0808cc 100%);animation:trz-vignetta 1.15s ease-out both}"+
    // feedback di pressione e comparsa pannelli: selettori a specificita' zero, qualunque regola del tema li batte
    ":where(button:not(:disabled),[role=button]){transition:transform .09s cubic-bezier(.3,.7,.4,1),filter .12s,box-shadow .12s}"+
    ":where(button:not(:disabled),[role=button]):active{transform:translateY(1px) scale(.965);filter:brightness(1.14)}"+
    "dialog[open]{animation:trz-pannello .24s cubic-bezier(.2,.9,.3,1.1)}"+
    "dialog[open]::backdrop{animation:trz-velo .22s ease-out}"+
    ".gp{animation:trz-pannello .26s cubic-bezier(.2,.9,.3,1.1)}"+
    "@media (prefers-reduced-motion:reduce){.trz-pop,.trz-impulso,#game.trz-shake,dialog[open],dialog[open]::backdrop,.gp,.trz-lampo,.trz-vignetta{animation:none}"+
      ".trz-piu{animation:trz-toast-r .9s both}:where(button,[role=button]){transition:none}:where(button,[role=button]):active{transform:none}}";
  const style=document.createElement("style");
  style.id="trz-stili";style.textContent=css;
  document.head.append(style);
  try{trzOsserva();}catch(e){}
})();
