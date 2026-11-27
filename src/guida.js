// Guida: il car sharing LUISS (Renault 5 elettrica) da guidare tra le strade vere del quartiere, vista dall'alto come nei vecchi GTA.
// Le auto (uid "guida-auto-<n>", 12 come la flotta reale) sono parcheggiate vicino a pola-arrival, parenzo-arrival e alla porta di Viale Romania 32.
// E vicino all'auto per salire; E o Esc per scendere (l'auto resta dove la lasci). Frecce/WASD, spazio freno a mano, H clacson.
// Ganci negli altri file: world.js (installazione dopo normalizeCampus, drawObject), quartiere.js (rigenerazione),
// dialogue.js (frame, draw, interact via game.js), schermo.js (Esc). Stato opzionale: state.guida {on,n,zone,x,y,a,park:{n:[zona,x,y,a]}}.
// Attenzione: guidaInstalla gira mentre world.js e' ancora in esecuzione: nessun const/let di questo file al suo interno.

// ---------------------------------------------------------------------------
// Stato di modulo (proprieta' di funzione: disponibile anche durante world.js)
// ---------------------------------------------------------------------------
function guidaS(){
  let S=guidaS.v;
  if(S)return S;
  S=guidaS.v={auto:[],def:[],d:null,state:null,grids:new Map(),k:{up:0,down:0,left:0,right:0,hand:0},steer:0,uscita:false,
    zoom:1,cx:0,cy:0,camInit:false,tv:0,vista:{x:0,y:0,zoom:1,camX:0,camY:0,row:0,draw:null},ui:null,mot:null,
    hornT:0,tSalita:0,urtoT:0,saveT:0,kmhT:0,kmh:-1,luceT:-1,luce:null,now:0,roll:0,pitch:0,prevVf:0,
    np:48,pn:new Float32Array(48*8),pc:0,sn:96,sk:new Float32Array(96*5),sc:0,skZone:"",wlx:0,wly:0,wrx:0,wry:0,wOk:false,skT:0,dustT:0,
    grBeam:null,grGlow:null,mezzo:0};
  return S;
}

// ---------------------------------------------------------------------------
// Installazione: 12 auto vicino ai tre punti di partenza (dopo normalizeCampus)
// ---------------------------------------------------------------------------
function guidaInstalla(map){
  try{
    const S=guidaS();
    const dati=quartiereCache();
    const ids=Object.keys(dati).filter(id=>map.zones[id]);
    if(!ids.length)return map;
    for(const id of ids){const ob=map.zones[id].objects;for(let i=ob.length-1;i>=0;i--)if(String(ob[i].uid).startsWith("guida-auto-"))ob.splice(i,1);}
    S.auto.length=0;S.def.length=0;S.d=null;S.state=null;S.grids.clear();
    const punti=[["pola","pola-arrival"],["parenzo","parenzo-arrival"],["pq-1-1","q-pq-1-1-ingresso-luiss"]];
    let n=0;
    for(const [id,uid] of punti){
      const z=map.zones[id],ancora=z&&z.objects.find(o=>o.uid===uid);
      if(!ancora)continue;
      for(const p of guidaPosti(z,ancora,4)){
        n++;
        const o={uid:"guida-auto-"+n,kind:"car",name:"Sali sul car sharing",x:0,y:0,w:2,h:1,rotation:0,variant:0,color:"#2f9a83",solid:true,action:"guida",
          native:"",text:"",target:"",gate:"",missionTarget:"",auto:false,behavior:"idle",speed:1,route:[],guida:n};
        guidaImposta(o,p.x,p.y,p.a);
        z.objects.push(o);
        S.auto[n]={o,zone:id,in:id,x:p.x,y:p.y,a:p.a};
        S.def[n]={zone:id,x:p.x,y:p.y,a:p.a};
      }
    }
    // le auto non entrano in salvataggi ed esportazioni dell'editor (come gli oggetti "q-")
    for(const id of Object.keys(dati)){
      const z=map.zones[id];
      if(!z)continue;
      Object.defineProperty(z.objects,"toJSON",{value(){return this.filter(o=>!String(o.uid).startsWith("q-")&&!String(o.uid).startsWith("guida-auto-"));},enumerable:false,configurable:true});
    }
  }catch(e){try{console.warn("guida: installazione non riuscita",e);}catch{}}
  return map;
}

// Sceglie fino a "quanti" posti auto liberi (2x1) vicino all'ancora, su strada o marciapiede, orientati lungo la strada.
function guidaPosti(z,ancora,quanti){
  const w=z.width,h=z.height,sol=new Uint8Array(w*h),sup=new Uint8Array(w*h),occ=new Uint8Array(w*h);
  const riempi=(arr,o,v)=>{
    const x0=Math.max(0,Math.floor(o.x)),y0=Math.max(0,Math.floor(o.y)),x1=Math.min(w,Math.ceil(o.x+o.w)),y1=Math.min(h,Math.ceil(o.y+o.h));
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)arr[y*w+x]=v;
  };
  for(const o of z.objects){
    if(o.kind==="road")riempi(sup,o,2);else if(o.kind==="paving")riempi(sup,o,1);else if(o.kind==="path")riempi(sup,o,3);
  }
  for(const o of z.objects){
    if(String(o.uid).startsWith("guida-auto-"))continue;
    if(o.solid)riempi(sol,o,1);
    if(o.kind==="door"||o.kind==="entrance"||o.action){
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const x=Math.floor(o.x)+dx,y=Math.floor(o.y)+dy;
        if(x>=0&&y>=0&&x<w&&y<h)occ[y*w+x]=1;
      }
    }
  }
  const ax=Math.floor(ancora.x),ay=Math.floor(ancora.y);
  const libero=(x,y)=>x>=1&&y>=1&&x<w-1&&y<h-1&&!sol[y*w+x]&&!occ[y*w+x]&&(sup[y*w+x]===1||sup[y*w+x]===2);
  const valore=(x,y)=>x<0||y<0||x>=w||y>=h?0:sup[y*w+x]===2?2:sup[y*w+x]===1?1:0;
  const scelti=[];
  for(let n=0;n<quanti;n++){
    let best=null;
    for(let r=2;r<=16&&!best;r++){
      for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
        if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
        const cx=ax+dx,cy=ay+dy;
        for(let vert=0;vert<2;vert++){
          const x2=vert?cx:cx+1,y2=vert?cy+1:cy;
          if(!libero(cx,cy)||!libero(x2,y2))continue;
          if(Math.max(Math.abs(x2-ax),Math.abs(y2-ay))<2)continue;
          const px=vert?cx+.5:cx+1,py=vert?cy+1:cy+.5;
          if(scelti.some(s=>Math.abs(s.x-px)<3&&Math.abs(s.y-py)<3))continue;
          let score=0;
          for(let t=-1;t<=2;t++)score+=vert?valore(cx,cy+t):valore(cx+t,cy);
          if(score<5)continue;
          if(!best||score>best.score)best={score,x:px,y:py,vert};
        }
      }
    }
    if(!best)break;
    best.a=best.vert?(n%2?-Math.PI/2:Math.PI/2):(n%2?Math.PI:0);
    scelti.push(best);
    const cx=Math.floor(best.x),cy=Math.floor(best.y);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=cx+dx,y=cy+dy;if(x>=0&&y>=0&&x<w&&y<h)occ[y*w+x]=1;}
  }
  return scelti;
}

// Posa l'oggetto auto (riquadro 2x1 o 1x2 attorno al centro) per ostacolo, interazione e ordine di disegno.
function guidaImposta(o,x,y,a){
  const vert=Math.abs(Math.sin(a))>.7;
  o.w=vert?1:2;o.h=vert?2:1;
  o.x=x-o.w/2;o.y=y-o.h/2;
}
function guidaInvalida(){
  foregroundCache=new WeakMap();
  wallRuns=new WeakMap();
  guidaS().grids.clear();
}
function guidaTogli(n){
  const a=guidaS().auto[n];
  if(!a)return;
  if(a.in){
    const arr=campus.zones[a.in]?.objects;
    const i=arr?arr.indexOf(a.o):-1;
    if(i>=0)arr.splice(i,1);
    a.in=null;
  }
  guidaInvalida();
}
function guidaPonila(n,zone,x,y,ang){
  const a=guidaS().auto[n];
  if(!a||!campus.zones[zone])return false;
  guidaTogli(n);
  guidaImposta(a.o,x,y,ang);
  campus.zones[zone].objects.push(a.o);
  a.in=zone;a.zone=zone;a.x=x;a.y=y;a.a=ang;
  guidaInvalida();
  return true;
}

// ---------------------------------------------------------------------------
// Parametri di guida
// ---------------------------------------------------------------------------
const guidaP={
  //            prato  marciapiede strada sentiero
  vmax:[2.1,3.0,3.7,1.4],acc:[4.6,5.8,6.6,3.6],drag:[1.1,.25,0,2.2],grip:[7,12,14,5],
  freno:10,retro:3.2,rmax:1.6,rotola:1.1,mano:3.6,gripMano:1.2,sterzo:2.7,raggio:.36,passo:.4
};

// ---------------------------------------------------------------------------
// Griglie di collisione e terreno per zona (cache), con celle oltre il bordo risolte nella zona contigua
// ---------------------------------------------------------------------------
function guidaGriglia(id){
  const S=guidaS(),z=room(id);
  let g=S.grids.get(id);
  if(g&&g.z===z)return g;
  const w=z.width,h=z.height,solid=new Uint8Array(w*h),surf=new Uint8Array(w*h);
  let tiles=terrainCache.get(z);
  if(!tiles){tiles=terrainMap(z);terrainCache.set(z,tiles);}
  for(const [key,o] of tiles)surf[key]=o.kind==="road"?2:o.kind==="paving"||o.kind==="floor"?1:o.kind==="path"?3:0;
  let strade=0;
  for(let i=0;i<surf.length;i++)if(surf[i]===2)strade++;
  for(const o of zoneObjects(z).solid){
    if(o.guida)continue;
    if(o.gate&&!gateLocked(o.gate,state))continue;
    if(isVehicle(o)&&o.behavior&&o.behavior!=="idle")continue;
    const y0=Math.max(0,Math.floor(o.y-.5)),y1=Math.min(h-1,Math.ceil(o.y+o.h)),x0=Math.max(0,Math.floor(o.x-.5)),x1=Math.min(w-1,Math.ceil(o.x+o.w));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      if(x+.5>=o.x-.002&&x+.5<o.x+o.w&&y+.5>=o.y-.002&&y+.5<o.y+o.h)solid[y*w+x]=1;
    }
  }
  g={z,w,h,solid,surf,strade};
  S.grids.set(id,g);
  return g;
}
function guidaSolido(id,tx,ty){
  const g=guidaGriglia(id);
  if(tx>=0&&ty>=0&&tx<g.w&&ty<g.h)return g.solid[ty*g.w+tx]===1;
  const inX=tx>=0&&tx<g.w,inY=ty>=0&&ty<g.h;
  if(inX===inY)return true;                            // angolo: muro
  const dir=tx<0?"w":tx>=g.w?"e":ty<0?"n":"s",nid=quartiereVicino(id,dir);
  if(!nid||!Object.hasOwn(campus.zones,nid))return true;
  const n=guidaGriglia(nid);
  const nx=tx<0?tx+n.w:tx>=g.w?tx-g.w:tx,ny=ty<0?ty+n.h:ty>=g.h?ty-g.h:ty;
  if(nx<0||ny<0||nx>=n.w||ny>=n.h)return true;
  return n.solid[ny*n.w+nx]===1;
}

// ---------------------------------------------------------------------------
// Salire, scendere, stato e salvataggio
// ---------------------------------------------------------------------------
function guidaOk(){
  const S=guidaS();
  return screen==="game"&&Boolean(state)&&S.state===state&&!state.ending&&!state.prologue&&!minigame&&!activeScene&&
    !document.getElementById("campusSurprise").open&&!(typeof schermoPausato==="function"&&schermoPausato());
}
function guidaAttiva(){const S=guidaS();return Boolean(S.d&&S.state===state&&screen==="game");}

function guidaInteragisci(spot){
  if(!spot||typeof spot.uid!=="string"||!spot.uid.startsWith("guida-auto-"))return false;
  const S=guidaS(),n=Number(spot.uid.slice(11));
  if(S.d||!S.auto[n]||!guidaOk())return true;
  if(!guidaZonaOk(state.zone)){sound("error","interface");return true;}
  guidaSali(n);
  return true;
}
// si guida solo nelle celle del quartiere reale (con strade), mai nel campus
function guidaZonaOk(id){
  return Boolean(quartiereVicino.mappa&&quartiereVicino.mappa[id]&&Object.hasOwn(campus.zones,id)&&guidaGriglia(id).strade>=12);
}
function guidaEsc(){
  const S=guidaS();
  if(!S.d||!guidaOk())return false;
  guidaScendiRichiesta();
  return true;
}
function guidaSali(n,posa,ripresa){
  const S=guidaS(),a=S.auto[n];
  if(!a)return false;
  posa=posa||{zone:a.zone,x:a.x,y:a.y,a:a.a};
  guidaTogli(n);
  const k=S.k;k.up=k.down=k.left=k.right=k.hand=0;
  state.zone=posa.zone;
  S.d={n,x:posa.x,y:posa.y,a:posa.a,vx:0,vy:0,vf:0,sf:2,z:posa.zone};
  S.tSalita=performance.now();   // lo stesso tasto E che sale non deve anche scendere
  S.steer=0;S.uscita=false;S.camInit=false;S.zoom=1;S.roll=0;S.pitch=0;S.prevVf=0;S.wOk=false;S.sc=0;S.pc=0;S.pn.fill(0);S.sk.fill(0);S.kmh=-1;
  guidaSblocca();
  const g=state.guida||(state.guida={});
  if(!g.park||typeof g.park!=="object")g.park={};
  g.on=true;g.n=n;
  guidaSync(true);
  walkStep=null;clearCampusInputs();
  guidaUI(true);
  if(!ripresa){sound("door","map");renderScene();dirty=true;}
  syncBackgroundMusic();
  return true;
}
// se la posizione salvata cade in un solido (mappa cambiata), cerca la tessera libera piu' vicina
function guidaSblocca(){
  const d=guidaS().d,id=state.zone;
  if(!guidaSolido(id,Math.floor(d.x),Math.floor(d.y)))return;
  for(let r=1;r<20;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
    const tx=Math.floor(d.x)+dx,ty=Math.floor(d.y)+dy;
    if(!guidaSolido(id,tx,ty)&&!guidaSolido(id,tx+1,ty)&&!guidaSolido(id,tx,ty+1)&&!guidaSolido(id,tx-1,ty)&&!guidaSolido(id,tx,ty-1)&&
       tx>=0&&ty>=0&&tx<room(id).width&&ty<room(id).height){d.x=tx+.5;d.y=ty+.5;return;}
  }
}
// aggiorna state.zone/x/y e il blocco state.guida (zona, x, y, angolo) a ogni fotogramma, senza allocare
function guidaSync(forza){
  const S=guidaS(),d=S.d,g=state.guida;
  if(!d||!g)return;
  state.x=Math.floor(d.x);state.y=Math.floor(d.y);
  g.zone=state.zone;g.x=Math.round(d.x*100)/100;g.y=Math.round(d.y*100)/100;g.a=Math.round(d.a*1000)/1000;
  if(forza)return;
}
function guidaScendiRichiesta(){
  const S=guidaS(),d=S.d;
  if(!d)return;
  if(Math.hypot(d.vx,d.vy)<1.1)guidaScendi();
  else S.uscita=true;                                   // frena da solo e scende appena possibile
}
// esterno: il giocatore e' stato spostato da altro codice (viaggio, prova automatica): l'auto resta dov'e', a lui non si tocca la posizione
function guidaScendi(forzata,esterno){
  const S=guidaS(),d=S.d;
  if(!d)return;
  const zone=d.z;
  guidaPonila(d.n,zone,d.x,d.y,d.a);
  // tessera libera accanto all'auto, preferibilmente sul lato
  const fx=Math.cos(d.a),fy=Math.sin(d.a);
  const prove=[[-fy,fx],[fy,-fx],[-fx,-fy],[fx,fy]];
  let tx=-1,ty=-1;
  for(const [px,py] of esterno?[]:prove){
    for(const dist of [1.3,1.9]){
      const x=Math.floor(d.x+px*dist),y=Math.floor(d.y+py*dist);
      if(x>=0&&y>=0&&x<room(zone).width&&y<room(zone).height&&!blocked(zone,x,y,mapClock)){tx=x;ty=y;break;}
    }
    if(tx>=0)break;
  }
  if(!esterno){
    if(tx<0)[tx,ty]=freeTile(zone,Math.floor(d.x),Math.floor(d.y));
    state.x=tx;state.y=ty;state.look="down";
  }
  const g=state.guida||(state.guida={park:{}});
  g.on=false;if(!g.park)g.park={};
  g.park[d.n]=[zone,Math.round(d.x*100)/100,Math.round(d.y*100)/100,Math.round(d.a*1000)/1000];
  delete g.zone;delete g.x;delete g.y;delete g.a;delete g.n;
  S.d=null;S.uscita=false;S.k.up=S.k.down=S.k.left=S.k.right=S.k.hand=0;
  guidaMotore(0,false);
  guidaUI(false);
  walkStep=null;clearCampusInputs();
  if(!forzata)sound("door","map");
  renderScene();save();dirty=false;
  try{document.getElementById("interact").focus({preventScroll:true});}catch{}
}
// nuovo salvataggio/partita: tutte le auto tornano ai posti di partenza, poi si applica state.guida
function guidaSincronizza(){
  const S=guidaS();
  S.state=state;
  if(S.d){S.d=null;guidaUI(false);guidaMotore(0,false);}
  S.uscita=false;
  for(let n=1;n<S.auto.length;n++){
    const p=S.def[n];
    if(S.auto[n]&&p)guidaPonila(n,p.zone,p.x,p.y,p.a);
  }
  const g=state&&state.guida;
  if(!g||typeof g!=="object")return;
  const ok=v=>Number.isFinite(v);
  if(g.park&&typeof g.park==="object"){
    for(const key of Object.keys(g.park)){
      const n=Number(key),p=g.park[key];
      if(S.auto[n]&&Array.isArray(p)&&Object.hasOwn(campus.zones,p[0])&&ok(p[1])&&ok(p[2])&&ok(p[3]))guidaPonila(n,p[0],p[1],p[2],p[3]);
    }
  }
  if(g.on&&S.auto[g.n]&&guidaZonaOk(g.zone)&&ok(g.x)&&ok(g.y)&&ok(g.a)&&!state.ending&&!state.prologue){
    guidaSali(g.n,{zone:g.zone,x:g.x,y:g.y,a:g.a},true);
  }else if(g.on){g.on=false;}
}

// ---------------------------------------------------------------------------
// Ciclo di gioco: fisica arcade a coordinate continue (senza allocazioni nel ciclo caldo)
// ---------------------------------------------------------------------------
function guidaTick(now,delta){
  const S=guidaS();
  if(S.state!==state)guidaSincronizza();
  const d=S.d;
  if(!d){return;}
  if(state.zone!==d.z||Math.abs(state.x-Math.floor(d.x))>1||Math.abs(state.y-Math.floor(d.y))>1){guidaScendi(true,true);return;}
  if(!guidaOk()){
    if(state.ending||state.prologue){guidaScendi(true);return;}
    guidaMotore(0,false);
    return;
  }
  const dt=Math.min(.05,Math.max(.001,delta/1000));
  trafficClock+=Math.min(40,delta);
  S.now=now;
  guidaPasso(dt);
  guidaSync(false);
  guidaEffetti(dt);
  guidaMotore(Math.hypot(d.vx,d.vy)/guidaP.vmax[2],true);
  if(S.uscita&&Math.hypot(d.vx,d.vy)<1.0){guidaScendi();return;}
  if(now-S.saveT>1000){S.saveT=now;dirty=true;}
  guidaHud(now);
}

function guidaPasso(dt){
  const S=guidaS(),d=S.d,k=S.k,P=guidaP;
  const id=state.zone,g=guidaGriglia(id);
  const sx=Math.floor(d.x),sy=Math.floor(d.y);
  const sf=sx>=0&&sy>=0&&sx<g.w&&sy<g.h?g.surf[sy*g.w+sx]:2;
  d.sf=sf;
  const vmax=P.vmax[sf],acc=P.acc[sf],drag=P.drag[sf];
  const mano=k.hand===1;
  const grip=mano?P.gripMano:P.grip[sf];
  let gas=k.up===1,fre=k.down===1,sterzo=(k.right?1:0)-(k.left?1:0);
  if(S.uscita){gas=false;fre=true;sterzo=0;}
  let fx=Math.cos(d.a),fy=Math.sin(d.a);
  let vf=d.vx*fx+d.vy*fy,vl=-d.vx*fy+d.vy*fx;
  const vf0=vf;
  if(gas){vf+=(vf<0?acc+P.freno:acc*Math.max(0,1-vf/(vmax*1.02)))*dt;}
  else if(fre){
    if(vf>.12)vf=Math.max(0,vf-P.freno*dt);
    else vf=Math.max(-P.rmax*(sf===0||sf===3?.7:1),vf-P.retro*dt);
  }else{
    const r=(P.rotola+drag)*dt;
    vf=Math.abs(vf)<=r?0:vf-Math.sign(vf)*r;
  }
  if(vf>vmax)vf-=(vf-vmax)*Math.min(1,3.2*dt);
  if(vf<-P.rmax)vf=-P.rmax;
  if(mano){const r=P.mano*dt;vf=Math.abs(vf)<=r?0:vf-Math.sign(vf)*r;}
  vl*=Math.exp(-grip*dt);
  // sterzo: a bassa velocita' l'auto sterza poco; in retromarcia il verso si inverte
  S.steer+=(sterzo-S.steer)*Math.min(1,dt*9);
  const sp=Math.abs(vf),dir=Math.max(-1,Math.min(1,vf/.6));
  const yaw=S.steer*P.sterzo*Math.min(1,sp/1.4)*dir*(1-.3*Math.min(1,sp/vmax))*(mano?1.6:1);
  // velocita' nel sistema del mondo; ruota con l'auto (quasi tutta, meno con il freno a mano: derapata)
  let vx=vf*fx-vl*fy,vy=vf*fy+vl*fx;
  const rot=yaw*dt*(mano?.35:.92),cr=Math.cos(rot),sr=Math.sin(rot);
  d.vx=vx*cr-vy*sr;d.vy=vx*sr+vy*cr;
  d.a+=yaw*dt;
  if(d.a>Math.PI)d.a-=Math.PI*2;else if(d.a<-Math.PI)d.a+=Math.PI*2;
  d.vf=vf;
  // rollio e beccheggio (solo estetica)
  const rollT=S.steer*Math.min(sp,3.6)*.42,pitchT=Math.max(-1.1,Math.min(1.1,(vf-vf0)/dt*.06));
  S.roll+=(rollT-S.roll)*Math.min(1,dt*8);S.pitch+=(pitchT-S.pitch)*Math.min(1,dt*8);
  S.prevVf=vf;
  // integrazione a sottopassi (niente tunneling) con collisioni
  const speed=Math.hypot(d.vx,d.vy),n=Math.min(4,1+Math.floor(speed*dt/.18)),h=dt/n;
  let colpo=0;
  for(let i=0;i<n;i++){
    d.x+=d.vx*h;d.y+=d.vy*h;
    const c=guidaUrti(d,id);
    if(c>colpo)colpo=c;
    guidaBordo(d);
  }
  if(colpo>.7){
    const t=S.now;
    if(t-S.urtoT>200){
      S.urtoT=t;
      if(typeof playTones==="function"&&audioOn)playTones([40,33],.035,Math.min(.1,.04+colpo*.02),"map","triangle",.14);
      guidaScintille(colpo);
    }
  }
}

// collisioni: tre cerchi lungo l'asse dell'auto contro le tessere solide e le altre auto parcheggiate; rimbalzo morbido, scorrimento lungo il muro
function guidaUrti(d,id){
  const P=guidaP,R=P.raggio,S=guidaS();
  let colpo=0;
  for(let pass=0;pass<2;pass++){
    const fx=Math.cos(d.a),fy=Math.sin(d.a);
    for(let i=0;i<3;i++){
      const off=(i-1)*P.passo;
      const cx=d.x+fx*off,cy=d.y+fy*off;
      const x0=Math.floor(cx-R),x1=Math.floor(cx+R),y0=Math.floor(cy-R),y1=Math.floor(cy+R);
      for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
        if(!guidaSolido(id,tx,ty))continue;
        const px=cx<tx?tx:cx>tx+1?tx+1:cx,py=cy<ty?ty:cy>ty+1?ty+1:cy;
        let nx=cx-px,ny=cy-py;
        const q=nx*nx+ny*ny;
        if(q>=R*R)continue;
        let dist=Math.sqrt(q);
        if(dist<1e-4){nx=cx-(tx+.5);ny=cy-(ty+.5);const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;dist=0;}
        else{nx/=dist;ny/=dist;}
        const pen=R-dist;
        d.x+=nx*pen;d.y+=ny*pen;
        const vn=d.vx*nx+d.vy*ny;
        if(vn<0){
          d.vx-=(1.28)*vn*nx;d.vy-=(1.28)*vn*ny;
          d.vx*=.985;d.vy*=.985;
          if(-vn>colpo)colpo=-vn;
        }
      }
    }
  }
  // altre auto del car sharing ferme nella stessa zona
  for(let n=1;n<S.auto.length;n++){
    const a=S.auto[n];
    if(!a||a.in!==id||Math.abs(a.x-d.x)>3||Math.abs(a.y-d.y)>3)continue;
    const ax=Math.cos(a.a),ay=Math.sin(a.a),fx=Math.cos(d.a),fy=Math.sin(d.a);
    for(let j=-1;j<=1;j+=2){
      const qx=a.x+ax*.38*j,qy=a.y+ay*.38*j;
      for(let i=0;i<3;i++){
        const cx=d.x+fx*(i-1)*P.passo,cy=d.y+fy*(i-1)*P.passo;
        let nx=cx-qx,ny=cy-qy;
        const q=nx*nx+ny*ny,rr=R*2;
        if(q>=rr*rr)continue;
        const dist=Math.sqrt(q)||1e-4;
        nx/=dist;ny/=dist;
        const pen=rr-dist;
        d.x+=nx*pen*.6;d.y+=ny*pen*.6;
        const vn=d.vx*nx+d.vy*ny;
        if(vn<0){d.vx-=1.2*vn*nx;d.vy-=1.2*vn*ny;if(-vn>colpo)colpo=-vn;}
      }
    }
  }
  return colpo;
}

// passaggio alla cella contigua del quartiere senza interruzioni (come quartiereBordo, ma con coordinate continue)
function guidaBordo(d){
  const id=state.zone,z=room(id);
  if(d.x>=0&&d.y>=0&&d.x<z.width&&d.y<z.height)return;
  const dir=d.x<0?"w":d.x>=z.width?"e":d.y<0?"n":"s",nid=quartiereVicino(id,dir);
  if(!nid||!Object.hasOwn(campus.zones,nid)){
    d.x=Math.max(.01,Math.min(z.width-.01,d.x));d.y=Math.max(.01,Math.min(z.height-.01,d.y));
    return;
  }
  const n=room(nid),S=guidaS();
  const dx=dir==="w"?n.width:dir==="e"?-z.width:0,dy=dir==="n"?n.height:dir==="s"?-z.height:0;
  d.x+=dx;d.y+=dy;
  S.cx+=dx;S.cy+=dy;S.wOk=false;
  state.zone=nid;d.z=nid;state.chatTopic=null;state.freeMoment=null;
  S.sc=0;
  guidaSync(false);
  renderScene();syncBackgroundMusic();
}

// ---------------------------------------------------------------------------
// Effetti: polvere sul prato, segni delle gomme, scintille agli urti
// ---------------------------------------------------------------------------
function guidaNuova(x,y,vx,vy,vita,dim,tipo){
  const S=guidaS(),i=(S.pc++%S.np)*8,p=S.pn;
  p[i]=x;p[i+1]=y;p[i+2]=vx;p[i+3]=vy;p[i+4]=0;p[i+5]=vita;p[i+6]=dim;p[i+7]=tipo;
}
function guidaScintille(forza){
  if(reducedMotion)return;
  const S=guidaS(),d=S.d;
  const fx=Math.cos(d.a),fy=Math.sin(d.a);
  for(let i=0;i<5;i++){
    const r=(i*2.399)%6.283;
    guidaNuova(d.x+fx*.6,d.y+fy*.6,Math.cos(r)*(.8+forza*.2),Math.sin(r)*(.8+forza*.2),.35,1.2,2);
  }
}
function guidaEffetti(dt){
  const S=guidaS(),d=S.d;
  if(reducedMotion)return;
  const p=S.pn;
  for(let i=0;i<S.np;i++){
    const o=i*8;
    if(p[o+5]<=0)continue;
    p[o+4]+=dt;
    if(p[o+4]>=p[o+5]){p[o+5]=0;continue;}
    p[o]+=p[o+2]*dt;p[o+1]+=p[o+3]*dt;
    p[o+2]*=1-Math.min(1,2.2*dt);p[o+3]*=1-Math.min(1,2.2*dt);
  }
  for(let i=0;i<S.sn;i++){const o=i*5+4;if(S.sk[o]>0)S.sk[o]=Math.max(0,S.sk[o]-dt*.12);}
  const sp=Math.hypot(d.vx,d.vy);
  const fx=Math.cos(d.a),fy=Math.sin(d.a);
  const rx=d.x-fx*.52,ry=d.y-fy*.52;
  const lx=rx-fy*.27,ly=ry+fx*.27,rrx=rx+fy*.27,rry=ry-fx*.27;
  const vl=Math.abs(-d.vx*fy+d.vy*fx);
  const strada=d.sf===1||d.sf===2;
  // segni di derapata/frenata sull'asfalto
  const segno=strada&&((S.k.hand===1&&sp>1.5)||vl>1.1||((S.k.down===1||S.uscita)&&d.vf>2.4));
  if(segno&&S.wOk){
    const i=(S.sc++%S.sn)*5,s=S.sk;
    s[i]=S.wlx;s[i+1]=S.wly;s[i+2]=lx;s[i+3]=ly;s[i+4]=1;
    const j=(S.sc++%S.sn)*5;
    s[j]=S.wrx;s[j+1]=S.wry;s[j+2]=rrx;s[j+3]=rry;s[j+4]=1;
  }
  S.wlx=lx;S.wly=ly;S.wrx=rrx;S.wry=rry;S.wOk=true;
  // polvere su prato e sentiero
  if(!strada&&sp>.9){
    S.dustT+=dt*sp*7;
    while(S.dustT>=1){
      S.dustT-=1;
      const side=(S.pc&1)?lx:rrx,sideY=(S.pc&1)?ly:rry;
      guidaNuova(side,sideY,-d.vx*.12+(S.pc%5-2)*.07,-d.vy*.12+(S.pc%3-1)*.07,.55+(S.pc%4)*.1,1.6,d.sf===3?1:0);
    }
  }
}

// ---------------------------------------------------------------------------
// Suono: motore elettrico (sinusoide che sale con la velocita'), clacson, urto. Tutto sul canale "map" del mixer.
// ---------------------------------------------------------------------------
function guidaMotore(v01,attivo){
  const S=guidaS();
  const puo=attivo&&audioOn&&typeof audioContext!=="undefined"&&audioContext&&typeof effectBuses!=="undefined"&&effectBuses.get("map")&&channelLevel("master")&&channelLevel("map");
  if(!puo){
    if(S.mot){
      try{S.mot.g.gain.setTargetAtTime(0,audioContext.currentTime,.05);}catch{}
      const m=S.mot;S.mot=null;
      setTimeout(()=>{try{m.a.stop();m.b.stop();m.a.disconnect();m.b.disconnect();m.g.disconnect();}catch{}},400);
    }
    return;
  }
  if(!S.mot){
    const a=audioContext.createOscillator(),b=audioContext.createOscillator(),g=audioContext.createGain(),g2=audioContext.createGain();
    a.type="sine";b.type="triangle";g.gain.value=0;g2.gain.value=.28;
    a.connect(g);b.connect(g2);g2.connect(g);g.connect(effectBuses.get("map"));
    a.start();b.start();
    S.mot={a,b,g};
  }
  const v=Math.max(0,Math.min(1.2,v01)),t=audioContext.currentTime;
  const f=58+v*210;
  S.mot.a.frequency.setTargetAtTime(f,t,.06);
  S.mot.b.frequency.setTargetAtTime(f*2.01,t,.06);
  S.mot.g.gain.setTargetAtTime(.016+v*.05,t,.08);
}
function guidaClacson(){
  if(typeof playTones==="function")playTones([65,69],0,.085,"map","triangle",.42);
}

// ---------------------------------------------------------------------------
// Ingressi: tastiera
// ---------------------------------------------------------------------------
function guidaTasto(event,giu){
  const S=guidaS();
  if(!S.d||!guidaOk())return;
  if(event.ctrlKey||event.altKey||event.metaKey)return;
  const campo=event.target instanceof Element&&event.target.closest("input,select,textarea,[contenteditable]:not([contenteditable=false])");
  if(campo)return;
  const key=event.key.toLowerCase(),k=S.k;
  let usato=true;
  if(key==="arrowup"||key==="w")k.up=giu?1:0;
  else if(key==="arrowdown"||key==="s")k.down=giu?1:0;
  else if(key==="arrowleft"||key==="a")k.left=giu?1:0;
  else if(key==="arrowright"||key==="d")k.right=giu?1:0;
  else if(key===" ")k.hand=giu?1:0;
  else if(key==="h"){if(giu&&!event.repeat)guidaClacson();}
  else if(key==="e"){if(giu&&!event.repeat&&performance.now()-S.tSalita>350)guidaScendiRichiesta();}
  else usato=false;
  if(usato){
    if(giu&&k.up===1)S.uscita=false;
    event.preventDefault();
  }
}
window.addEventListener("keydown",event=>guidaTasto(event,true));
window.addEventListener("keyup",event=>{
  const S=guidaS();
  if(!S.d)return;
  const key=event.key.toLowerCase();
  const k=S.k;
  if(key==="arrowup"||key==="w")k.up=0;
  else if(key==="arrowdown"||key==="s")k.down=0;
  else if(key==="arrowleft"||key==="a")k.left=0;
  else if(key==="arrowright"||key==="d")k.right=0;
  else if(key===" "){k.hand=0;event.preventDefault();}
});
window.addEventListener("blur",()=>{const k=guidaS().k;k.up=k.down=k.left=k.right=k.hand=0;});
// il motore tace fuori dalla schermata di gioco e quando la scheda e' nascosta (il ciclo dei fotogrammi si ferma)
document.addEventListener("visibilitychange",()=>{if(document.hidden){const k=guidaS().k;k.up=k.down=k.left=k.right=k.hand=0;guidaMotore(0,false);}});
setInterval(()=>{const S=guidaS();if(S.mot&&(screen!=="game"||document.hidden))guidaMotore(0,false);},500);

// ---------------------------------------------------------------------------
// Interfaccia: indicatore in alto sulla scena e comandi touch (solo mentre si guida)
// ---------------------------------------------------------------------------
function guidaStili(){
  if(guidaStili.fatto)return;
  guidaStili.fatto=true;
  const s=document.createElement("style");
  s.textContent=`
#game .guida-hud{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(var(--m,8px) + env(safe-area-inset-bottom));display:flex;align-items:center;gap:calc(var(--m,8px)*1.2);width:max-content;max-width:calc(100% - 16px);padding:.35em .8em;background:#0b110dd9;border:2px solid #f0b266cc;color:#f7e6bf;font:400 max(12px,var(--u,14px))/1.3 var(--font-ui,monospace);pointer-events:none;z-index:3;flex-wrap:wrap;justify-content:center;text-align:center}
#game .guida-hud b{font-family:var(--font-title,monospace);font-weight:400;font-size:.8em;color:#ffd499;min-width:5.5em;text-align:right}
#game.gs-portrait.gs-touch-on .guida-hud{bottom:calc(var(--m,8px)*2 + 150px)}
#game.guida-on .gs-touch{display:none!important}
#game .guida-pad{display:none;position:absolute;left:calc(var(--ux,0px) + var(--m,8px));right:calc(100% - var(--ux,0px) - var(--uw,100%) + var(--m,8px));bottom:calc(var(--m,8px) + 4px);justify-content:space-between;align-items:flex-end;pointer-events:none;z-index:3}
#game.gs-portrait .guida-pad{left:var(--m,8px);right:var(--m,8px);bottom:calc(var(--m,8px)*2)}
#game.gs-touch-on .guida-pad{display:flex}
#game.game-reading .guida-pad,#game.gs-modal .guida-pad{display:none}
#game .guida-pad>*{pointer-events:auto}
#game .guida-pad .gp-grp{display:flex;gap:8px;align-items:flex-end}
#game .guida-pad .gp-col{display:flex;flex-direction:column;gap:8px;align-items:flex-end}
#game .guida-pad button{position:relative;min-width:44px;min-height:44px;width:max(64px,calc(var(--u,14px)*4));height:max(64px,calc(var(--u,14px)*4));padding:0;background:#0b110dcc;border:2px solid #f0b266cc;border-radius:0;color:#f7e6bf;font:400 max(11px,calc(var(--u,14px)*.8))/1 var(--font-ui,monospace);touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
#game .guida-pad button.gp-small{width:auto;min-width:88px;height:48px;padding:0 12px}
#game .guida-pad button.on{background:#f0b266;color:#0b110d}
#game .guida-pad button i{position:absolute;inset:0;margin:auto;width:40%;height:40%;background:currentColor}
#game .guida-pad button.on i{background:#0b110d}
#game .guida-pad [data-g=left] i{clip-path:polygon(100% 0,0 50%,100% 100%)}
#game .guida-pad [data-g=right] i{clip-path:polygon(0 0,100% 50%,0 100%)}
#game .guida-pad [data-g=up] i{clip-path:polygon(0 100%,50% 0,100% 100%)}
#game .guida-pad [data-g=down] i{clip-path:polygon(0 0,100% 0,50% 100%)}
`;
  document.head.appendChild(s);
}
function guidaUI(on){
  const S=guidaS(),game=document.getElementById("game");
  if(!game)return;
  if(!on){
    game.classList.remove("guida-on");
    if(S.ui){S.ui.hud.remove();S.ui.pad.remove();S.ui=null;}
    return;
  }
  if(S.ui)return;
  guidaStili();
  game.classList.add("guida-on");
  const host=document.getElementById("gsHud")||game;
  const hud=document.createElement("div");
  hud.className="guida-hud";
  const txt=document.createElement("span"),kmh=document.createElement("b");
  txt.textContent=local("Guida: frecce/WASD, E per scendere","Driving: arrows/WASD, E to get out");kmh.textContent="0 km/h";kmh.setAttribute("aria-hidden","true");
  hud.append(txt,kmh);
  const pad=document.createElement("div");
  pad.className="guida-pad";pad.setAttribute("role","group");pad.setAttribute("aria-label",local("Comandi di guida","Driving controls"));
  const mk=(g,label,small)=>{
    const b=document.createElement("button");
    b.type="button";b.dataset.g=g;b.setAttribute("aria-label",label);
    if(small){b.className="gp-small";b.textContent=small;}else b.append(document.createElement("i"));
    return b;
  };
  const sx=mk("left",local("Sterza a sinistra","Steer left")),dx=mk("right",local("Sterza a destra","Steer right"));
  const fr=mk("down",local("Freno e retromarcia","Brake and reverse")),gas=mk("up",local("Acceleratore","Accelerator"));
  const scendi=mk("exit",local("Scendi dall’auto","Get out of the car"),local("Scendi","Exit")),horn=mk("horn",local("Clacson","Horn"),local("Clacson","Horn"));
  const l=document.createElement("div");l.className="gp-grp";l.append(sx,dx);
  const r=document.createElement("div");r.className="gp-col";
  const rr=document.createElement("div");rr.className="gp-grp";rr.append(fr,gas);
  const rs=document.createElement("div");rs.className="gp-grp";rs.append(horn,scendi);
  r.append(rs,rr);
  pad.append(l,r);
  const k=S.k,map={left:"left",right:"right",up:"up",down:"down"};
  for(const b of [sx,dx,fr,gas]){
    const nome=map[b.dataset.g];
    b.addEventListener("pointerdown",e=>{if(e.button!==0&&e.pointerType==="mouse")return;try{b.setPointerCapture(e.pointerId);}catch{}k[nome]=1;if(nome==="up")S.uscita=false;b.classList.add("on");e.preventDefault();});
    const su=()=>{k[nome]=0;b.classList.remove("on");};
    b.addEventListener("pointerup",su);b.addEventListener("pointercancel",su);b.addEventListener("lostpointercapture",su);
    b.addEventListener("contextmenu",e=>e.preventDefault());
  }
  horn.addEventListener("pointerdown",e=>{guidaClacson();e.preventDefault();});
  scendi.addEventListener("click",()=>{if(guidaOk())guidaScendiRichiesta();});
  host.append(hud,pad);
  S.ui={hud,pad,txt,kmh};
}
function guidaHud(now){
  const S=guidaS();
  if(!S.ui||now-S.kmhT<200)return;
  S.kmhT=now;
  const d=S.d,v=Math.round(Math.hypot(d.vx,d.vy)*10.8);
  if(v!==S.kmh){S.kmh=v;S.ui.kmh.textContent=v+" km/h";}
}

// ---------------------------------------------------------------------------
// Camera e rendering
// ---------------------------------------------------------------------------
function guidaLuceCorrente(now){
  const S=guidaS();
  if(S.luceT!==now){S.luceT=now;S.luce=typeof realismoLuce==="function"?realismoLuce():{ora:12,ombre:0,lampioni:0};}
  return S.luce;
}
// chiamata da draw(): restituisce null se non si guida; altrimenti posizione, zoom e camera (in pixel di mondo)
function guidaVista(now){
  const S=guidaS(),d=S.d;
  if(!d||S.state!==state||screen!=="game")return null;
  const dtv=Math.min(.1,Math.max(0,(now-(S.tv||now))/1000));S.tv=now;
  const sp=Math.hypot(d.vx,d.vy);
  const zt=reducedMotion?1:1-.2*Math.min(1,sp/3.6);
  S.zoom+=(zt-S.zoom)*Math.min(1,dtv*2.2);
  const zoom=Math.round(S.zoom*32)/32;
  const vw=320/zoom,vh=192/zoom;
  const lead=reducedMotion?0:.5;
  if(!S.camInit){S.cx=d.x;S.cy=d.y;S.camInit=true;}
  else{const kk=Math.min(1,dtv*5);S.cx+=(d.x+d.vx*lead-S.cx)*kk;S.cy+=(d.y+d.vy*lead-S.cy)*kk;}
  const z=room(state.zone),id=state.zone;
  const has=dir=>{const n=quartiereVicino(id,dir);return Boolean(n&&Object.hasOwn(campus.zones,n));};
  const camX=clamp(S.cx*16-vw/2,has("w")?-1e9:0,has("e")?1e9:Math.max(0,z.width*16-vw));
  const camY=clamp(S.cy*16-vh/2,has("n")?-1e9:0,has("s")?1e9:Math.max(0,z.height*16-vh));
  const v=S.vista;
  v.x=d.x;v.y=d.y;v.zoom=zoom;v.camX=Math.round(camX);v.camY=Math.round(camY);v.row=d.y+.4;
  if(!v.draw)v.draw=()=>guidaDisegnaPrimoPiano();
  return v;
}
// zone contigue visibili oltre il bordo: il passaggio tra le celle non ha stacchi
function guidaVicini(c,now,camX,camY,vw,vh){
  const lista=[[state.zone,0,0]];
  for(let i=0;i<lista.length&&lista.length<9;i++){
    const [id,ox,oy]=lista[i],zz=room(id);
    for(const dir of ["n","s","e","w"]){
      const nid=quartiereVicino(id,dir);
      if(!nid||!Object.hasOwn(campus.zones,nid))continue;
      const n=room(nid);
      const nx=dir==="e"?ox+zz.width:dir==="w"?ox-n.width:ox,ny=dir==="s"?oy+zz.height:dir==="n"?oy-n.height:oy;
      if(lista.some(l=>l[1]===nx&&l[2]===ny))continue;
      if(nx*16>=camX+vw||(nx+n.width)*16<=camX||ny*16>=camY+vh||(ny+n.height)*16<=camY)continue;
      lista.push([nid,nx,ny]);
    }
  }
  for(let i=1;i<lista.length;i++){
    const [id,ox,oy]=lista[i];
    c.save();c.translate(ox*16,oy*16);
    worldView(c,id,now,{x:camX-ox*16,y:camY-oy*16,w:vw,h:vh},layers,false,null);
    c.restore();
  }
}

function guidaOmbra(c,px,py,a,now,alt){
  const luce=guidaLuceCorrente(now);
  if(typeof realismoAttivo!=="undefined"&&!realismoAttivo)return;
  const L=12.5,W=6.5,ca=Math.cos(a),sa=Math.sin(a);
  // ombra di contatto
  c.fillStyle="rgba(10,14,22,.30)";
  c.beginPath();
  for(const [x,y] of [[-L-1,-W-1],[L+1,-W-1],[L+1,W+1],[-L-1,W+1]]){const X=px+x*ca-y*sa,Y=py+1+x*sa+y*ca;if(x===-L-1&&y===-W-1)c.moveTo(X,Y);else c.lineTo(X,Y);}
  c.closePath();c.fill();
  if(luce.ombre<=.02)return;
  const t=Math.max(-1,Math.min(1,(luce.ora-12)/6.5)),lung=.35+1.05*t*t;
  const dx=t*1.55*Math.min(1,.45+Math.abs(t)),dy=.5+.25*(1-Math.abs(t));
  const sx=dx*alt*lung*16,sy=dy*alt*lung*16;
  c.fillStyle="rgba(22,28,52,"+(.30*luce.ombre).toFixed(3)+")";
  c.beginPath();
  for(const f of [.15,.55,1]){
    let first=true;
    for(const [x,y] of [[-L,-W],[L,-W],[L,W],[-L,W]]){
      const X=px+x*ca-y*sa+sx*f,Y=py+x*sa+y*ca+sy*f;
      if(first){c.moveTo(X,Y);first=false;}else c.lineTo(X,Y);
    }
    c.closePath();
  }
  c.fill();
}
// la Renault 5 elettrica vista dall'alto, rivolta verso +x; sollevata di un pixel con "pareti" scure per dare volume
function guidaCarrozzeria(c,px,py,a,sterzo,roll,pitch,freno,retro,fari){
  const R=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  c.save();c.translate(px,py);c.rotate(a);
  // fianchi e ruote
  R("#142e29",-12,-6,24,12);
  R("#101214",-10,-8,5.4,2.8);R("#101214",-10,5.2,5.4,2.8);
  for(const s of [-1,1]){
    c.save();c.translate(7.4,s*6.7);c.rotate(sterzo*.6);R("#101214",-2.7,-1.5,5.4,3);c.restore();
  }
  c.restore();
  c.save();c.translate(px,py-1.4);c.rotate(a);
  // scocca
  R("#1b5d50",-12.5,-5.6,25,11.2);R("#1b5d50",-11.6,-6.4,23.2,12.8);
  R("#2f9a83",-12,-5.2,24,10.4);R("#2f9a83",-11.1,-6,22.2,12);
  R("#3cae96",5.2,-4.4,6,8.8);R("#27806e",-12,-5.2,24,1);R("#27806e",-12,4.2,24,1);
  R("#3cae96",6.2,-.8,5,1.6);
  // specchietti
  R("#27806e",3,-7.4,2,1.5);R("#27806e",3,5.9,2,1.5);
  // fari anteriori e posteriori
  const luce=fari?"#fff6c8":"#e7e0be";
  R(luce,11,-5,1.8,2.5);R(luce,11,2.5,1.8,2.5);
  const rosso=freno?"#ff4a38":"#a22a2a";
  R(rosso,-12.7,-5.2,1.8,2.6);R(rosso,-12.7,2.6,1.8,2.6);
  if(retro){R("#f4f4f0",-12.7,-1.2,1.8,2.4);}
  // abitacolo con rollio/beccheggio
  c.translate(pitch,roll);
  R("#1f3a44",2.8,-4.9,4.2,9.8);R("#1f3a44",-9,-4.7,2.6,9.4);
  R("#eaf3ef",-6.4,-5,9.2,10);R("#c9d9d2",-6.4,-5,9.2,.9);R("#c9d9d2",-6.4,4.1,9.2,.9);
  R("#fbfffd",-5.2,-3.6,6.8,7.2);
  c.restore();
}
function guidaDisegnaPrimoPiano(){
  const S=guidaS(),d=S.d;
  if(!d)return;
  const c=stage,now=S.now||performance.now();
  const px=d.x*16,py=d.y*16;
  if(!reducedMotion){
    // segni delle gomme (solo nella zona corrente) e polvere
    c.save();c.lineWidth=1.3;c.strokeStyle="#161619";
    for(let i=0;i<S.sn;i++){
      const o=i*5,v=S.sk[o+4];
      if(v<=0)continue;
      c.globalAlpha=v*.5;c.beginPath();c.moveTo(S.sk[o]*16,S.sk[o+1]*16);c.lineTo(S.sk[o+2]*16,S.sk[o+3]*16);c.stroke();
    }
    c.restore();
  }
  guidaOmbra(c,px,py,d.a,now,.7);
  if(!reducedMotion){
    const p=S.pn;
    c.save();
    for(let i=0;i<S.np;i++){
      const o=i*8,vita=p[o+5];
      if(vita<=0)continue;
      const t=p[o+4]/vita,tipo=p[o+7];
      c.globalAlpha=(1-t)*(tipo===2?1:.55);
      c.fillStyle=tipo===2?"#ffe2a0":tipo===1?"#cdb98f":"#a7b878";
      const s=p[o+6]*(1+t*1.6);
      c.fillRect(p[o]*16-s/2,p[o+1]*16-s/2,s,s);
    }
    c.restore();
  }
  const pitch=reducedMotion?0:S.pitch,roll=reducedMotion?0:S.roll;
  const luce=guidaLuceCorrente(now);
  guidaCarrozzeria(c,px,py,d.a,reducedMotion?0:S.steer,roll,pitch,S.k.down===1&&d.vf>.1||S.uscita||S.k.hand===1,d.vf<-.1,luce.lampioni>.12);
}
// fari accesi di sera: dopo la luce globale, in modo additivo
function guidaLuci(c,now){
  const S=guidaS(),d=S.d;
  if(!d||S.state!==state)return;
  const luce=guidaLuceCorrente(now);
  if(typeof realismoAttivo!=="undefined"&&!realismoAttivo)return;
  if(luce.lampioni<=.12)return;
  const k=Math.min(1,luce.lampioni);
  c.save();
  c.globalCompositeOperation="lighter";
  c.translate(d.x*16,d.y*16-1.4);c.rotate(d.a);
  if(!S.grBeam){
    S.grBeam=c.createLinearGradient(11,0,92,0);
    S.grBeam.addColorStop(0,"rgba(255,238,176,.62)");S.grBeam.addColorStop(.5,"rgba(255,214,140,.2)");S.grBeam.addColorStop(1,"rgba(255,200,120,0)");
    S.grGlow=c.createRadialGradient(0,0,0,0,0,9);
    S.grGlow.addColorStop(0,"rgba(255,244,200,.8)");S.grGlow.addColorStop(1,"rgba(255,230,160,0)");
  }
  c.globalAlpha=k;
  c.fillStyle=S.grBeam;
  c.beginPath();c.moveTo(11,-4);c.lineTo(92,-30);c.lineTo(92,30);c.lineTo(11,4);c.closePath();c.fill();
  c.fillStyle=S.grGlow;
  for(const y of [-3.8,3.8]){c.save();c.translate(12,y);c.fillRect(-9,-9,18,18);c.restore();}
  if(S.k.down===1&&d.vf>.1){
    c.fillStyle="rgba(255,60,40,.55)";
    for(const y of [-3.9,3.9]){c.fillRect(-15,y-2,5,4);}
  }
  c.restore();
}
// auto ferma (parcheggiata): chiamata da drawObject
function guidaDisegnaFermo(c,o,now){
  const S=guidaS(),a=S.auto[o.guida];
  if(!a)return;
  const px=(o.x+o.w/2)*16,py=(o.y+o.h/2)*16;
  guidaOmbra(c,px,py,a.a,now,.7);
  guidaCarrozzeria(c,px,py,a.a,0,0,0,false,false,false);
}

// ---------------------------------------------------------------------------
// Ganci non invasivi: mentre si guida non si cammina, niente interazioni e il traffico non ti investe
// ---------------------------------------------------------------------------
const guidaEsplorandoBase=exploringCampus;
exploringCampus=function(){return !guidaS().d&&guidaEsplorandoBase.apply(this,arguments);};
const guidaTrafficoBase=trafficImpact;
trafficImpact=function(){if(guidaS().d)return;return guidaTrafficoBase.apply(this,arguments);};
const guidaScenaBase=getScene;
getScene=function(){
  if(guidaS().d&&state&&!activeScene&&!state.prologue&&!state.ending&&!state.freeMoment)
    return scene(local("Guida","Driving"),local("Guida: frecce/WASD, E per scendere","Driving: arrows/WASD, E to get out"));
  return guidaScenaBase.apply(this,arguments);
};
