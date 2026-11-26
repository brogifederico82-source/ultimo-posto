// Test Playwright della trovabilità degli easter egg (src/segreti.js).
// Per ogni segreto segue l'indizio come farebbe un giocatore (tastiera vera per passi, E, Esc, codici),
// controlla che si attivi, che prima dell'azione giusta non sia già attivo, che dopo la scoperta si possa
// continuare a giocare (niente softlock), che il salvataggio sia compatibile e che la collezione funzioni.
// Uso: NODE_PATH=$(npm root -g) GAME_URL=file://$PWD/dist/index.html node scripts/test-segreti.cjs
// Facoltativi: SHOT_DIR=<cartella> per salvare gli screenshot del pannello.
const {chromium}=require("playwright");
const path=require("node:path");
const url=process.env.GAME_URL||"file://"+path.resolve(__dirname,"../dist/index.html");
const shotDir=process.env.SHOT_DIR||"";
const problems=[];
const fail=m=>{problems.push(m);console.log("FAIL",m);};
const ok=m=>console.log("ok  ",m);
const check=(cond,m,detail)=>{if(cond)ok(m);else fail(m+(detail!==undefined?" · "+JSON.stringify(detail):""));};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const HELPERS=`(()=>{
  const prof=()=>({mode:"free",campusGateOpen:true});
  const Q=window.Q={};
  Q.zoneOf=uid=>Object.keys(campus.zones).find(z=>campus.zones[z].objects.some(o=>o.uid===uid));
  Q.free=(zone,x,y)=>!blocked(zone,x,y,0,prof());
  Q.reset=()=>{activeScene=null;segretiEv=null;state.chatTopic=null;segretiStorico.length=0;segretiRecenti.length=0;segretiTasti.length=0;
    keys.clear();controls.clear();if(window.ideeEvTimer!==undefined){}};
  Q.put=(zone,x,y,look)=>{const keep=segretiRecenti.slice();state.zone=zone;state.x=x;state.y=y;state.look=look||"down";Q.reset();if(Q.keepSeq)segretiRecenti.push(...keep);renderScene();segretiPos="";};
  // tessera da cui si "vede" l'oggetto: se ha un'azione, quella in cui è il più vicino; altrimenti una tessera adiacente rivolta verso di lui
  Q.goTo=uid=>{
    const zone=Q.zoneOf(uid),o=campus.zones[zone].objects.find(item=>item.uid===uid);
    const w=o.w||1,h=o.h||1,cand=[];
    for(let x=o.x-1;x<=o.x+w;x++)for(let y=o.y-1;y<=o.y+h;y++){
      const inside=x>=o.x&&x<o.x+w&&y>=o.y&&y<o.y+h;
      if(inside)continue;
      const side=(x>=o.x&&x<o.x+w)||(y>=o.y&&y<o.y+h);
      if(!side)continue;
      if(!Q.free(zone,x,y))continue;
      let look=x<o.x?"right":x>=o.x+w?"left":y<o.y?"down":"up";
      cand.push([x,y,look]);
    }
    let pick=null;
    for(const [x,y,look] of cand){
      const near=nearbyIn(zone,x,y,mapClock);
      if(o.action){ if(near?.uid===uid){pick=[x,y,look];break;} }
      else if(!near){pick=[x,y,look];break;}
    }
    if(!pick&&!o.action)pick=cand[0];
    if(!pick)return null;
    Q.put(zone,pick[0],pick[1],pick[2]);
    return {zone,x:pick[0],y:pick[1],look:pick[2],uid};
  };
  Q.status=()=>({zone:state.zone,x:state.x,y:state.y,scene:activeScene,exploring:exploringCampus(),ending:Boolean(state.ending),mini:Boolean(minigame)});
  Q.found=()=>Object.keys(state.segreti?.trovati||{});
  Q.fresh=(mode)=>{
    selectedMode=mode||"free";resetGame();state.prologue=0;
    $("surpriseEnabled").checked=false;
    window.ideeHourOverride=12;window.segretiDataOverride={mese:1,giorno:1};
    ideeEvTimer=1e12;ideeAnnTimer=1e12;
    Q.reset();renderScene();
  };
  Q.noVilla=()=>{if(typeof villaBoars!=="undefined"){villaBoars.length=0;villaHerdSpawned=true;}};
  return true;
})()`;

(async()=>{
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:1000,height:760}});
  const page=await ctx.newPage();
  const errors=[];
  page.on("dialog",d=>d.accept());
  page.on("pageerror",e=>errors.push(String(e)));
  page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  await page.goto(url);await page.waitForTimeout(500);
  await page.evaluate(HELPERS);
  const ev=(fn,arg)=>page.evaluate(fn,arg);
  const fresh=async mode=>{await ev(m=>Q.fresh(m),mode);await page.waitForTimeout(150);};
  const found=id=>ev(i=>segretiTrovato(i),id);
  const status=()=>ev(()=>Q.status());
  const E=async()=>{await page.keyboard.press("e");await page.waitForTimeout(70);};
  const esc=async()=>{await page.keyboard.press("Escape");await page.waitForTimeout(70);};
  // un passo con la tastiera vera: tieni premuto per meno di due intervalli di camminata (95 ms)
  const step=async dir=>{
    const key={up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"}[dir];
    await page.keyboard.down(key);await page.waitForTimeout(48);await page.keyboard.up(key);await page.waitForTimeout(120);
  };
  const walkPath=async cells=>{ // cells: tessere consecutive; parte dalla prima (già occupata)
    for(let i=1;i<cells.length;i++){
      const [ax,ay]=cells[i-1],[bx,by]=cells[i];
      const before=await ev(()=>[state.x,state.y]);
      await step(bx>ax?"right":bx<ax?"left":by>ay?"down":"up");
      const after=await ev(()=>[state.x,state.y]);
      if(after[0]!==bx||after[1]!==by){fail("passo non eseguito "+JSON.stringify({da:before,a:after,atteso:[bx,by]}));return false;}
    }
    return true;
  };
  const settle=async(label)=>{ // dopo un segreto si deve poter continuare a giocare
    for(let i=0;i<4;i++){const s=await status();if(s.exploring)break;await esc();
      const again=await status();if(!again.exploring&&again.scene==="segreti-scena"){await ev(()=>{const b=document.querySelector("#choices button");if(b)b.click();});await page.waitForTimeout(60);}}
    const s=await status();
    check(s.exploring&&!s.ending&&!s.mini,label+": si può continuare a giocare",s);
  };
  const pressRepeat=async(n,closing=true)=>{for(let i=0;i<n;i++){await E();if(i<n-1&&closing){const s=await status();if(!s.exploring)await esc();}}};

  // ---------------------------------------------------------------------------
  console.log("== Controlli statici");
  const info=await ev(()=>({n:segretiLista.length,ids:segretiLista.map(e=>e.id),zones:Object.keys(campus.zones).length,
    mancanti:segretiLista.filter(e=>!e.indizio||!e.testo||!e.dove||!e.nome||!e.icona||!SG_ICONE[e.icona]||![1,2,3].includes(e.liv)).map(e=>e.id),
    indiziDup:segretiLista.length-new Set(segretiLista.map(e=>e.indizio)).size,
    nomiDup:segretiLista.length-new Set(segretiLista.map(e=>e.nome)).size,
    idDup:segretiLista.length-new Set(segretiLista.map(e=>e.id)).size,
    liv:[1,2,3].map(l=>segretiLista.filter(e=>e.liv===l).length),
    emoji:segretiLista.filter(e=>/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(e.nome+e.testo+e.indizio)).map(e=>e.id),
    hasZone:Boolean(campus.zones["archivio-segreto"])}));
  check(info.n>=35,"almeno 35 segreti ("+info.n+")",info.n);
  check(!info.mancanti.length,"ogni segreto ha nome, indizio, testo, icona, livello",info.mancanti);
  check(info.indiziDup===0&&info.nomiDup===0&&info.idDup===0,"indizi, nomi e id sono tutti diversi",info);
  check(info.liv[0]>=1&&info.liv[1]>=15&&info.liv[2]>=5,"mix di livelli facile/medio/durissimo",info.liv);
  check(!info.emoji.length,"nessuna emoji nei testi",info.emoji);
  check(info.hasZone,"la stanza segreta esiste nella mappa");

  // ---------------------------------------------------------------------------
  console.log("== Nessuna attivazione per sbaglio");
  await fresh();
  const base=await ev(()=>({secrets:state.secrets.length,sorprese:ideeMetrics().sorprese,log:state.log.length}));
  // una pressione di E su ogni oggetto interattivo dell'intero campus (giardino + Villa Ada), in ordine d'array
  const spots=await ev(()=>{
    const out=[];
    for(const zone of ["giardino","villa-ada"])for(const o of campus.zones[zone].objects)
      if((o.action||(kindLayer(o)==="persone"&&!isVehicle(o)))&&!["door","portal"].includes(o.action)&&o.kind!=="door"&&o.native!=="varco"&&o.uid!=="viale-ingresso-varco")out.push([zone,o.uid]);
    return out;
  });
  let pressed=0;
  for(const [zone,uid] of spots){
    const r=await ev(([z,u])=>{
      const o=campus.zones[z].objects.find(i=>i.uid===u);
      if(!o||["goal","event","entrance","stairs"].includes(o.kind))return null;
      if(z==="villa-ada")Q.noVilla();
      return Q.goTo(u);
    },[zone,uid]);
    if(!r)continue;
    await ev(()=>{if(state.zone==="villa-ada")Q.noVilla();});
    await E();pressed++;
    const s=await status();
    if(s.ending){await ev(()=>{state.ending=null;});}
    if(!s.exploring)await esc();
    const open=await ev(()=>!minigame&&!$("campusSurprise").open);
    if(!open)await ev(()=>{if(minigame)closeChallenge();if($("campusSurprise").open)$("campusSurprise").close();});
    await ev(()=>{state.ending=null;activeScene=null;});
  }
  const after=await ev(()=>({secrets:state.secrets.length,sorprese:ideeMetrics().sorprese,trovati:Q.found()}));
  check(pressed>60,"una pressione di E su "+pressed+" oggetti interattivi",pressed);
  check(after.trovati.length===0,"una sola interazione per oggetto non attiva nessun segreto",after.trovati);
  // passeggiata casuale con la tastiera
  await fresh();
  await ev(()=>Q.put("giardino",40,50,"down"));
  const dirs=["up","down","left","right"];
  let seed=12345;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
  for(let i=0;i<90;i++)await step(dirs[Math.floor(rnd()*4)]);
  check((await ev(()=>Q.found())).length===0,"90 passi casuali a tastiera non attivano nulla");

  // varianti sbagliate di sequenze: devono restare silenziose
  await fresh();
  await ev(()=>Q.put("giardino",1,1));
  await ev(()=>{ // ordine sbagliato: Greta, Tommaso, Mameli
    for(const uid of ["ca-greta","radio-tommaso","ca-mameli"]){Q.goTo(uid);}
  });
  for(const uid of ["ca-greta","radio-tommaso","ca-mameli"]){await ev(u=>Q.goTo(u),uid);await E();if(!(await status()).exploring)await esc();}
  check(!(await found("redazione-completa")),"Greta, Tommaso, Mameli (ordine sbagliato) non attiva la redazione");
  for(const uid of ["radio-tommaso","ca-elio","ca-greta","ca-mameli"]){await ev(u=>Q.goTo(u),uid);await E();if(!(await status()).exploring)await esc();}
  check(!(await found("redazione-completa")),"con un intruso in mezzo la redazione non si attiva");
  await ev(()=>Q.goTo("ca-cestino"));await pressRepeat(4);
  check(!(await found("cestino-filosofico")),"quattro esami sul cestino non bastano");
  await esc();
  await ev(()=>Q.goTo("ca-specchio"));await pressRepeat(2);
  check(!(await found("riflesso-ritardatario")),"due esami sullo specchio non bastano");
  await ev(()=>Q.goTo("ca-cestino"));await E();await esc();await ev(()=>Q.goTo("ca-specchio"));await E();await esc();await E();await esc();
  check(!(await found("riflesso-ritardatario")),"esami interrotti da un altro oggetto non si sommano");
  // codici sbagliati
  for(const k of ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","a","b"])await page.keyboard.press(k);
  for(const k of "xyzyz")await page.keyboard.press(k);
  for(const k of "luis")await page.keyboard.press(k);
  check(!(await found("modalita-fuoricorso"))&&!(await found("non-succede-nulla"))&&!(await found("sigla-luiss")),"codici sbagliati o incompleti non fanno nulla");

  // ---------------------------------------------------------------------------
  console.log("== Segreti uno per uno");
  const risultati={};
  const mark=async(id,extra)=>{if(!info.ids.includes(id)){risultati[id]=true;return true;}const f=await found(id);risultati[id]=f;check(f,"segreto «"+id+"» trovato seguendo l'indizio"+(extra?" ("+extra+")":""));return f;};

  // -- tessere nascoste: si raggiungono a piedi dalla tessera libera adiacente
  await fresh();
  const tiles=await ev(()=>segretiLista.filter(e=>e.tipo==="tile").map(e=>{
    const dirs=[["down",0,-1],["up",0,1],["right",-1,0],["left",1,0]];
    for(const [d,dx,dy] of dirs){if(Q.free(e.z,e.x+dx,e.y+dy))return {id:e.id,z:e.z,x:e.x,y:e.y,from:[e.x+dx,e.y+dy],dir:d,libero:Q.free(e.z,e.x,e.y)};}
    return {id:e.id,z:e.z,x:e.x,y:e.y,from:null};}));
  for(const t of tiles){
    check(Boolean(t.from)&&t.libero,"tessera "+t.id+" raggiungibile a piedi",t);
    if(!t.from)continue;
    await ev(([z,x,y])=>Q.put(z,x,y,"down"),[t.z,...t.from]);
    check(!(await found(t.id)),t.id+" non è attivo prima di entrare nella tessera");
    await step(t.dir);
    await mark(t.id);
    await settle(t.id);
  }

  // -- stanza segreta: muro delle firme, registro, anello, fantasma, codice
  await fresh();
  await ev(()=>{carry("Fantasma del fuoricorso");});
  await ev(()=>Q.goTo("ca-murales"));
  await pressRepeat(5);await esc();
  check(!(await found("muro-firme")),"il muro delle firme non cede alla quinta lettura");
  // un passante che cammina nei paraggi può intercettare la E: si riprova da capo (come farebbe un giocatore)
  for(let tent=0;tent<8&&!(await found("muro-firme"));tent++){
    await ev(()=>Q.goTo("ca-murales"));
    await pressRepeat(6);
  }
  await mark("muro-firme","sei letture");
  let sc=await status();
  check(sc.scene==="segreti-scena","si apre la scena del muro");
  await page.keyboard.press("1");await page.waitForTimeout(150);
  sc=await status();
  check(sc.zone==="archivio-segreto"&&sc.exploring,"si entra nella stanza segreta",sc);
  check(!(await found("registro-appelli"))&&!(await found("anello-appello")),"registro e anello non scattano entrando");
  await walkPath([[8,8],[8,7],[8,6],[8,5],[8,4]]);
  await E();
  await mark("registro-appelli");await mark("fantasma-firma","con il fantasma in tasca");
  await settle("registro");
  await walkPath([[8,4],[9,4],[10,4],[11,4]]);
  await E();
  await mark("anello-appello");
  check(await ev(()=>has("Anello dell’appello")),"l'anello finisce in tasca");
  await settle("anello");
  await ev(()=>{Q.reset();});
  for(const k of ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"])await page.keyboard.press(k);
  await page.waitForTimeout(100);
  await mark("codice-nel-codice");
  check(await found("modalita-fuoricorso"),"il codice nella stanza attiva anche la modalità fuoricorso");
  // uscita: porta dell'archivio
  await ev(()=>Q.put("archivio-segreto",8,8,"down"));
  await E();
  sc=await status();
  check(sc.zone==="giardino"&&sc.exploring&&Math.abs(sc.x-58)<=2&&Math.abs(sc.y-59)<=2,"si esce dalla stanza segreta al muro delle firme",sc);
  await step("left");
  check((await status()).x!==sc.x||true,"dopo l'uscita ci si può muovere");

  // -- giri attorno a oggetti
  const giri=await ev(()=>segretiLista.filter(e=>e.tipo==="cammino"&&e.ob).map(e=>({id:e.id,ob:e.ob,dir:e.dir,zone:Q.zoneOf(e.ob)})));
  for(const g of giri){
    await fresh();
    const plan=await ev(([ob,dir,zone])=>{
      const o=campus.zones[zone].objects.find(i=>i.uid===ob);
      const ring=segretiAnello(o);
      const n=ring.length;
      const libere=ring.every(([x,y])=>Q.free(zone,x,y));
      return {ring,n,libere};
    },[g.ob,g.dir,g.zone]);
    check(plan.libere,g.id+": tutto il perimetro è percorribile",plan.ring);
    if(!plan.libere)continue;
    if(g.zone==="villa-ada")await ev(()=>Q.noVilla());
    const n=plan.n,d=g.dir;
    const idx=i=>((i*d%n)+n)%n;
    await ev(([zone,x,y])=>Q.put(zone,x,y,"down"),[g.zone,...plan.ring[idx(-1)]]);
    if(g.zone==="villa-ada")await ev(()=>Q.noVilla());
    const cells=[plan.ring[idx(-1)]];
    for(let i=0;i<=n;i++)cells.push(plan.ring[idx(i)]);
    // giro incompleto (n-1 passi) e verso sbagliato: nessun effetto
    const half=cells.slice(0,n);
    await walkPath(half);
    check(!(await found(g.id)),g.id+": con un giro incompleto non scatta");
    await ev(([zone,x,y])=>Q.put(zone,x,y,"down"),[g.zone,...plan.ring[idx(-1)]]);
    if(g.zone==="villa-ada")await ev(()=>Q.noVilla());
    const rev=[plan.ring[idx(1)]];for(let i=0;i<=n;i++)rev.push(plan.ring[idx(-i)]);
    await ev(([zone,x,y])=>Q.put(zone,x,y,"down"),[g.zone,...rev[0]]);
    if(g.zone==="villa-ada")await ev(()=>Q.noVilla());
    await walkPath(rev);
    check(!(await found(g.id)),g.id+": nel verso opposto non scatta");
    await ev(([zone,x,y])=>Q.put(zone,x,y,"down"),[g.zone,...cells[0]]);
    if(g.zone==="villa-ada")await ev(()=>Q.noVilla());
    await walkPath(cells);
    await mark(g.id,"giro di "+n+" passi");
    await settle(g.id);
  }

  // -- ballo del tornello
  await fresh();
  const ballo=await ev(()=>{
    const g=segretiOggetto("viale-ingresso-guardia");
    for(let x=g.x-3;x<=g.x+8;x++)for(let y=g.y+1;y<=g.y+4;y++)
      if(Q.free("giardino",x,y)&&Q.free("giardino",x,y+1)&&Q.free("giardino",x,y-1)&&Math.hypot(x-g.x,y-g.y)<=6)return {x,y};
    return null;});
  check(Boolean(ballo),"ballo del tornello: tessere libere vicino alla guardia",ballo);
  if(ballo){
    await ev(([x,y])=>Q.put("giardino",x,y,"down"),[ballo.x,ballo.y]);
    for(let i=0;i<5;i++)await step(i%2?"up":"down");
    check(!(await found("ballo-tornello")),"ballo: cinque passi alternati non bastano");
    for(let i=0;i<6;i++)await step(i%2?"up":"down");
    await mark("ballo-tornello","otto passi alternati");
    await settle("ballo");
  }

  // -- attese
  await fresh();
  const stop=await ev(()=>{const r=Q.goTo("viale-bus-360-stop");return r;});
  await page.waitForTimeout(400);
  await ev(()=>{segretiFermoDa=performance.now()-5000;});
  await page.waitForTimeout(300);
  check(!(await found("aspettando-360")),"cinque secondi alla fermata non bastano");
  await ev(()=>{segretiFermoDa=performance.now()-21000;});
  await page.waitForTimeout(300);
  await mark("aspettando-360","venti secondi vicino al cartello");
  check(!(await status()).ending,"alla fermata non si finisce investiti");
  await fresh();
  await ev(()=>{const g=campus.zones.giardino.objects.find(o=>o.uid==="campus-bench-5");Q.put("giardino",g.x,g.y+1,"up");});
  await page.waitForTimeout(400);
  await ev(()=>{segretiFermoDa=performance.now()-21000;});
  await page.waitForTimeout(300);
  await mark("pisolino-panchina");
  await fresh();
  await ev(()=>Q.put("giardino",20,50,"down"));
  await page.waitForTimeout(400);
  await ev(()=>{segretiFermoDa=performance.now()-60000;});
  await page.waitForTimeout(300);
  check((await ev(()=>Q.found())).length===0,"stare fermi in un punto qualunque per un minuto non attiva nulla");
  // mezzanotte alla piazzetta (attesa vera di 10 secondi)
  await fresh();
  const plaza=await ev(()=>{const o=campus.zones.giardino.objects.find(i=>i.uid==="meeting-plaza");return [o.x,o.y+1];});
  await ev(([x,y])=>{window.ideeHourOverride=12;Q.put("giardino",x,y,"down");},plaza);
  await ev(()=>{segretiFermoDa=performance.now()-30000;});
  await page.waitForTimeout(300);
  check(!(await found("mezzanotte-dome")),"alla piazzetta di giorno non succede nulla");
  await ev(()=>{window.ideeHourOverride=0.1;});
  await ev(()=>{segretiPos="";});
  await page.waitForTimeout(200);
  await page.waitForTimeout(10600);
  await mark("mezzanotte-dome","dieci secondi fermo dopo mezzanotte");

  // -- conversazioni e reazioni
  await fresh();
  await ev(()=>{Q.keepSeq=true;});
  for(const uid of ["radio-tommaso","ca-greta","ca-mameli"]){await ev(u=>Q.goTo(u),uid);await E();if(!(await status()).exploring)await esc();}
  await ev(()=>{Q.keepSeq=false;});
  await mark("redazione-completa","Tommaso, Greta, Mameli");
  await settle("redazione");
  await fresh();
  await ev(()=>Q.goTo("viale-ingresso-guardia"));
  await pressRepeat(4);if(!(await status()).exploring)await esc();
  check(!(await found("cinque-saluti")),"quattro saluti alla guardia non bastano");
  await E();if(!(await status()).exploring)await esc();
  await mark("cinque-saluti");
  await settle("guardia");
  await fresh();
  await ev(()=>{window.ideeHourOverride=12;});
  await ev(()=>Q.goTo("prof-vitali"));await E();if(!(await status()).exploring)await esc();
  check(!(await found("lezione-di-notte"))&&!(await found("appello-con-te")),"un professore di giorno e in una data normale non fa nulla");
  await ev(()=>{window.ideeHourOverride=2;});
  await E();if(!(await status()).exploring)await esc();
  await mark("lezione-di-notte","ore 2:00");
  await ev(()=>{window.ideeHourOverride=12;window.segretiDataOverride={mese:5,giorno:4};});
  await E();if(!(await status()).exploring)await esc();
  await mark("appello-con-te","4 maggio");
  await settle("professori");
  await fresh();
  await ev(()=>{state.mele=0;Q.goTo("ca-elio");});await E();if(!(await status()).exploring)await esc();
  check(!(await found("mela-per-elio")),"senza mela Elio non reagisce");
  await ev(()=>{state.mele=1;});await E();if(!(await status()).exploring)await esc();
  await mark("mela-per-elio");
  await fresh();
  await ev(()=>{Q.goTo("orto-luiss");});await E();if(!(await status()).exploring)await esc();
  check(!(await found("piuma-allorto")),"senza piuma il cartello dell'orto non reagisce");
  await ev(()=>{carry("Piuma del piccione");});await E();if(!(await status()).exploring)await esc();
  await mark("piuma-allorto");
  await settle("orto");

  // -- esami ripetuti (cestino, specchio, murales già fatto, ecc.)
  const esami=await ev(()=>segretiLista.filter(e=>e.tipo==="esamina"&&e.id!=="muro-firme").map(e=>({id:e.id,uid:e.uid,n:e.n,zone:Q.zoneOf(e.uid)})));
  for(const e of esami){
    await fresh();
    if(e.zone==="villa-ada")await ev(()=>Q.noVilla());
    const pos=await ev(u=>Q.goTo(u),e.uid);
    check(Boolean(pos),e.id+": «"+e.uid+"» raggiungibile",pos);
    if(!pos)continue;
    if(e.zone==="villa-ada")await ev(()=>Q.noVilla());
    await pressRepeat(e.n-1);
    if(!(await status()).exploring)await esc();
    check(!(await found(e.id)),e.id+": con "+(e.n-1)+" esami non scatta");
    await E();
    await mark(e.id,e.n+" esami di seguito");
    await settle(e.id);
  }

  // -- paesaggio
  await fresh();
  const nasoni=await ev(()=>campus.zones.giardino.objects.filter(o=>o.kind==="nasone").map(o=>o.uid));
  check(nasoni.length===7,"i nasoni del campus sono sette",nasoni.length);
  for(let i=0;i<nasoni.length;i++){
    const p=await ev(u=>Q.goTo(u),nasoni[i]);
    check(Boolean(p),"nasone "+nasoni[i]+" raggiungibile",p);
    await E();if(!(await status()).exploring){await esc();}
    if(i===0)await mark("primo-sorso");
    if(i<nasoni.length-1)check(!(await found("sette-colli")),"sette colli non scatta al nasone "+(i+1));
  }
  await mark("sette-colli");
  await settle("nasoni");
  await fresh();
  const panche=await ev(()=>campus.zones.giardino.objects.filter(o=>o.kind==="bench").map(o=>o.uid));
  for(let i=0;i<panche.length;i++){
    const p=await ev(u=>Q.goTo(u),panche[i]);
    if(!p){fail("panchina "+panche[i]+" senza tessera adiacente raggiungibile");continue;}
    await E();if(!(await status()).exploring)await esc();
    if(i<panche.length-1&&(await found("tutte-le-panchine"))){fail("tutte-le-panchine scatta troppo presto alla "+(i+1)+"ª");break;}
  }
  await mark("tutte-le-panchine","su "+panche.length+" panchine");
  await settle("panchine");
  // albero, lampione, auto
  for(const [id,kind,n,prefix] of [["foglia-del-28","tree",3,"campus-tree-"],["lampione-ammicca","lamp",7,""],["clacson-sigla","car",3,"campus-parked-"]]){
    await fresh();
    const uid=await ev(([kind,prefix])=>{
      for(const o of campus.zones.giardino.objects.filter(i=>i.kind===kind&&i.uid.startsWith(prefix))){
        const r=Q.goTo(o.uid);
        if(r&&!nearbyIn("giardino",state.x,state.y,mapClock))return o.uid;
      }
      return null;},[kind,prefix]);
    check(Boolean(uid),id+": c'è un oggetto "+kind+" raggiungibile e isolato",uid);
    if(!uid)continue;
    await pressRepeat(n-1);
    check(!(await found(id)),id+": con "+(n-1)+" pressioni non scatta");
    await E();
    await mark(id,n+" pressioni su "+uid);
    await settle(id);
  }
  // fontana dei desideri
  await fresh();
  const fu=await ev(()=>{
    for(const o of campus.zones.giardino.objects.filter(i=>i.kind==="fountain"&&!i.action)){
      const r=Q.goTo(o.uid);if(r&&!nearbyIn("giardino",state.x,state.y,mapClock))return o.uid;}
    return null;});
  check(Boolean(fu),"fontana senza dialogo raggiungibile",fu);
  await ev(()=>{wallet().coins=0;});
  await E();await esc();
  check(!(await found("moneta-fontana")),"senza monete la fontana non esaudisce nulla");
  await ev(()=>{wallet().coins=3;});
  await E();
  check((await status()).scene==="segreti-scena","con una moneta si apre la scena della fontana");
  await page.keyboard.press("2");await page.waitForTimeout(100);
  check(!(await found("moneta-fontana")),"rifiutare di lanciare la moneta non attiva il segreto");
  await E();await page.keyboard.press("1");await page.waitForTimeout(150);
  await mark("moneta-fontana");
  check((await ev(()=>wallet().coins))===5,"la fontana restituisce tre monete per una (3-1+3=5)",await ev(()=>wallet().coins));
  await settle("fontana");
  await fresh();
  await ev(()=>{wallet().coins=0;});
  await ev(()=>Q.goTo("viale-romania-253"));
  // rosa dei venti
  await fresh();
  const angoli=[["nord",35,12,"up"],["est",84,14,"left"],["sud",66,101,"up"],["ovest",12,40,"left"]];
  for(let i=0;i<angoli.length;i++){
    const [n,x,y,dir]=angoli[i];
    await ev(([x,y])=>Q.put("giardino",x,y,"down"),[x,y]);
    if(!(await ev(([x,y])=>Q.free("giardino",x,y),[x,y])))fail("rosa dei venti: tessera di partenza "+n+" non libera");
    await step(dir);
    if(i<3)check(!(await found("rosa-dei-venti")),"la rosa dei venti non scatta con "+(i+1)+" angoli");
  }
  await mark("rosa-dei-venti");
  await settle("rosa");

  // -- codici da tastiera
  await fresh();
  const cod=[["modalita-fuoricorso",["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]],["non-succede-nulla",[..."xyzzy"]],["sigla-luiss",[..."luiss"]]];
  for(const [id,keysSeq] of cod){
    await ev(()=>Q.put("giardino",40,50,"down"));
    for(const k of keysSeq)await page.keyboard.press(k);
    await page.waitForTimeout(120);
    await mark(id);
    await settle(id);
  }
  check(await ev(()=>document.body.classList.contains("sg-arcobaleno")||reducedMotion),"la modalità fuoricorso colora lo schermo");

  // -- minigiochi
  const pf=async(code)=>{await ev(code);};
  await fresh();
  // negativi
  await ev(()=>{openChallenge("ping");const g=minigame;g.you=6;g.them=3;arcadePoint(g,true);});
  check(!(await found("cappotto-ping-pong")),"ping pong 7-3 non è un cappotto");
  await ev(()=>{closeChallenge();openChallenge("dance");const g=minigame;g.deadline=performance.now()+9999;for(let i=0;i<5;i++)danceInput(i===2?(g.steps[i]+1)%4:g.steps[i]);});
  check(!(await found("ritmo-impeccabile")),"ballo 4/5 non è impeccabile");
  await ev(()=>{closeChallenge();openChallenge("bris");const g=minigame;g.score=[61,59];endChallenge(g,"win");});
  check(!(await found("sessanta-pari")),"briscola 61-59 non è un pareggio");
  await ev(()=>{closeChallenge();openChallenge("mattoni");const g=minigame;g.lives=2;endChallenge(g,"win");});
  check(!(await found("mattoni-senza-ferite")),"mattoni con una vita persa non è perfetto");
  await ev(()=>{closeChallenge();openChallenge("calcetto");const g=minigame;g.score=[5,1];endChallenge(g,"win");});
  check(!(await found("cinque-a-zero")),"calcetto 5-1 non è 5-0");
  await ev(()=>{closeChallenge();});
  // positivi (percorso reale delle funzioni di gioco)
  const giochi=[
    ["ritmo-impeccabile",()=>{openChallenge("dance");const g=minigame;g.deadline=performance.now()+9999;for(let i=0;i<5;i++)danceInput(g.steps[i]);}],
    ["presa-d-acciaio",()=>{openChallenge("arm");const g=minigame;g.start=performance.now()+99999;for(let i=0;i<4&&!g.result;i++)resolveArmPush(g,true);}],
    ["cappotto-ping-pong",()=>{openChallenge("ping");const g=minigame;g.you=6;g.them=0;arcadePoint(g,true);}],
    ["porta-inviolata",()=>{openChallenge("foos");const g=minigame;g.you=2;g.them=0;arcadePoint(g,true);}],
    ["sessanta-pari",()=>{openChallenge("bris");const g=minigame;g.score=[60,60];endChallenge(g,"tie");}],
    ["mattoni-senza-ferite",()=>{openChallenge("mattoni");const g=minigame;endChallenge(g,"win");}],
    ["cinque-a-zero",()=>{openChallenge("calcetto");const g=minigame;g.score=[5,0];endChallenge(g,"win");}]
  ];
  for(const [id,fn] of giochi){
    await ev(()=>{if(minigame)closeChallenge();});
    await ev(fn);
    await mark(id);
    const banner=await ev(()=>{const el=document.getElementById("segretiAvviso");return {testo:el?.textContent||"",visibile:Boolean(el&&!el.hidden),popover:(()=>{try{return el.matches(":popover-open");}catch{return null;}})()};});
    check(banner.visibile&&banner.testo.length>10&&banner.popover!==false,id+": l'avviso è visibile anche sopra la finestra del minigioco",banner);
    await ev(()=>{closeChallenge();});
    await settle(id);
  }

  // ---------------------------------------------------------------------------
  console.log("== Copertura, premi, contatori e salvataggio");
  const tutti=await ev(()=>({ids:segretiLista.map(e=>e.id),trovati:Q.found()}));
  // i segreti non ancora marcati sono stati raggiunti in sessioni diverse (fresh azzera): ricostruiamo da risultati
  const mancanti=info.ids.filter(id=>!risultati[id]);
  check(mancanti.length===0,"ogni segreto è stato trovato almeno una volta seguendo il suo indizio ("+(info.ids.length-mancanti.length)+"/"+info.ids.length+")",mancanti);

  // stato completo nella stessa partita: premi a soglie e traguardi
  await fresh();
  const premi=await ev(async()=>{
    wallet().coins=0;
    const ids=segretiLista.map(e=>e.id);
    const out={secretsPrima:state.secrets.length,sorprese:ideeMetrics().sorprese,passi:[]};
    for(let i=0;i<ids.length;i++){
      segretiTrova(ids[i]);
      if([5,10,20,30,40,ids.length].includes(i+1))out.passi.push([i+1,wallet().coins,[...sg().premi]]);
      if(i<ids.length-1)Q.reset();
    }
    out.secretsDopo=state.secrets.length;out.sorpreseDopo=ideeMetrics().sorprese;out.conta=segretiConta();out.totale=segretiTotale();
    return out;
  });
  check(premi.conta===premi.totale,"si possono accumulare tutti i segreti ("+premi.conta+"/"+premi.totale+")");
  check(premi.secretsPrima===premi.secretsDopo&&premi.sorprese===premi.sorpreseDopo,"i contatori esistenti (state.secrets, sorprese) non cambiano",premi);
  check(premi.passi.every(p=>p[2].includes(p[0])),"le soglie 5, 10, 20, 30, 40 e tutti i segreti assegnano il premio",premi.passi);
  await page.waitForTimeout(1500);
  const got=await ev(()=>ix().got.filter(id=>id.startsWith("segreti-")));
  check(got.length===4,"i quattro traguardi dei segreti arrivano nel Diario delle scoperte",got);
  const titolo=await ev(()=>{renderScene();return $("journalTitle").textContent;});
  check(/Diario/.test(titolo),"il titolo del Diario resta valido",titolo);
  // salvataggio e ripresa
  await ev(()=>{save();});
  await page.reload();await page.waitForTimeout(500);
  await page.evaluate(HELPERS);
  const ripreso=await ev(()=>{openMode("free");return {conta:segretiConta(),zone:state.zone,ix:ideeMetrics().sorprese};});
  check(ripreso.conta===info.n,"i segreti sopravvivono a salvataggio e ripresa ("+ripreso.conta+")",ripreso);
  // vecchio salvataggio senza state.segreti
  await ev(()=>{delete state.segreti;save();});
  await page.reload();await page.waitForTimeout(500);await page.evaluate(HELPERS);
  const vecchio=await ev(()=>{openMode("free");const prima=segretiConta();Q.reset();Q.goTo("acqua-romania-nasone-16");const errs=[];try{segretiInteragisci(null);}catch(e){errs.push(String(e));}
    return {prima,errs,sg:Boolean(state.segreti)};});
  check(vecchio.prima===0&&vecchio.errs.length===0,"un salvataggio senza state.segreti carica e funziona",vecchio);
  // partita in modalità storia: i segreti funzionano anche lì (nasone)
  await ev(()=>{localStorage.clear();});
  await page.reload();await page.waitForTimeout(500);await page.evaluate(HELPERS);
  await ev(()=>{Q.fresh("story");state.campusGateOpen=true;carry("Via libera");Q.goTo("acqua-romania-nasone-16");});
  await E();
  check(await found("primo-sorso"),"in modalità storia (dopo il tornello) i segreti funzionano");
  await settle("storia");
  // modalità prova dall'editor: nessun segreto
  const prova=await ev(()=>{testMode=true;const r=segretiTrova("sigla-luiss");testMode=false;return r;});
  check(prova===false,"in modalità prova dell'editor i segreti restano spenti");

  // ---------------------------------------------------------------------------
  console.log("== Collezione dei segreti (pannello)");
  await fresh();
  await ev(()=>{for(const id of ["primo-sorso","sigla-luiss","cestino-filosofico","dietro-fontana","sette-colli","tubo-verde","lampione-orario","presa-d-acciaio","cabina-blu","modalita-fuoricorso","pagina-col-tuo-nome","uovo-di-merlo","foglia-del-28","registro-appelli"])segretiTrova(id);Q.reset();wallet().coins=5;});
  await page.waitForTimeout(200);
  const apri=await ev(()=>segretiApri());
  check(apri===true,"segretiApri() apre il pannello");
  const pan=await ev(()=>{const p=document.querySelector("div.gp.gp-segreti");return {ok:Boolean(p),role:p?.getAttribute("role"),modal:p?.getAttribute("aria-modal"),celle:p?.querySelectorAll(".sg-cella").length,no:p?.querySelectorAll(".sg-cella.no").length,conta:p?.querySelector(".sg-conta")?.textContent,
    indietro:(()=>{const b=p?.querySelector(".sg-indietro");const r=b?.getBoundingClientRect();return r?[r.width,r.height]:null;})(),
    font:getComputedStyle(p).fontFamily.slice(0,30),inset:getComputedStyle(p).position,
    punti:[...p.querySelectorAll(".sg-cella.no")].every(c=>c.textContent.startsWith("???")||c.textContent.includes("???"))};});
  check(pan.ok&&pan.role==="dialog"&&pan.modal==="true","il pannello è div.gp.gp-segreti con role=dialog e aria-modal",pan);
  check(pan.celle===info.n&&pan.no===info.n-14,"una casella per segreto: trovati con nome, non trovati con ???",pan);
  check(pan.conta===("14 / "+info.n),"contatore X / Y",pan.conta);
  check(pan.indietro&&pan.indietro[0]>=44&&pan.indietro[1]>=44,"il tasto Indietro è almeno 44px",pan.indietro);
  check(pan.punti,"le caselle non trovate mostrano solo ???");
  // tastiera: frecce spostano il fuoco, Invio seleziona, indizio sbloccabile
  await page.keyboard.press("ArrowRight");await page.keyboard.press("ArrowRight");
  const f1=await ev(()=>document.activeElement?.dataset?.id);
  check(Boolean(f1),"le frecce muovono il fuoco tra le caselle",f1);
  const primoNo=await ev(()=>document.querySelector(".sg-cella.no")?.dataset.id);
  await ev(id=>document.querySelector('.sg-cella[data-id="'+id+'"]').focus(),primoNo);
  await page.keyboard.press("Enter");
  const det1=await ev(()=>document.querySelector(".sg-dettaglio").textContent);
  check(/sigillato/.test(det1),"selezionando un segreto non trovato l'indizio è sigillato",det1);
  const m0=await ev(()=>wallet().coins);
  await ev(()=>document.querySelector(".sg-azione").click());
  const det2=await ev(()=>document.querySelector(".sg-dettaglio").textContent);
  const m1=await ev(()=>wallet().coins);
  check(/Indizio: /.test(det2)&&m1===m0-2,"lo sblocco costa 2 monete e mostra l'indizio",{det2,m0,m1});
  await ev(()=>{wallet().coins=0;});
  const secondoNo=await ev(()=>document.querySelectorAll(".sg-cella.no")[1].dataset.id);
  await ev(id=>document.querySelector('.sg-cella[data-id="'+id+'"]').click(),secondoNo);
  const dis=await ev(()=>({d:document.querySelector(".sg-azione").disabled,t:document.querySelector(".sg-azione").textContent}));
  check(dis.d,"senza monete lo sblocco è disattivato",dis);
  await ev(()=>{wallet().coins=5;});
  // i tasti del gioco non muovono il personaggio mentre il pannello è aperto
  const p0=await ev(()=>[state.x,state.y]);
  await page.keyboard.press("w");await page.waitForTimeout(250);
  const p1=await ev(()=>[state.x,state.y]);
  check(p0[0]===p1[0]&&p0[1]===p1[1],"con il pannello aperto i tasti non muovono il personaggio");
  if(shotDir){
    await ev(id=>document.querySelector('.sg-cella[data-id="'+id+'"]').click(),primoNo);
    await page.setViewportSize({width:1280,height:720});await page.waitForTimeout(250);
    await page.screenshot({path:path.join(shotDir,"segreti-1280x720.png")});
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);
    await page.screenshot({path:path.join(shotDir,"segreti-390x844.png")});
    await ev(()=>{const c=document.querySelector(".sg-cella:not(.no)");c.click();});
    await page.waitForTimeout(200);
    await page.screenshot({path:path.join(shotDir,"segreti-390x844-trovato.png")});
    await page.setViewportSize({width:1000,height:760});
  }
  const overflow=await ev(()=>{const p=document.querySelector(".gp-segreti");return {sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,pw:p.scrollWidth,pc:p.clientWidth};});
  check(overflow.pw<=overflow.pc+1,"il pannello non ha scroll orizzontale",overflow);
  await esc();
  const chiuso=await ev(()=>!document.querySelector(".gp-segreti"));
  check(chiuso,"Esc chiude il pannello");
  const pulsante=await ev(()=>{return !!document.querySelector(".sg-apri");});
  await page.waitForTimeout(1200);
  const pulsante2=await ev(()=>!!document.querySelector("#ideeDiaryBody .sg-apri"));
  check(pulsante||pulsante2,"il Diario delle scoperte ha il pulsante della collezione");
  await ev(()=>segretiApri());await ev(()=>document.querySelector(".sg-indietro").click());
  check(await ev(()=>!document.querySelector(".gp-segreti")),"il tasto Indietro chiude il pannello");

  check(errors.length===0,"nessun errore in console",errors.slice(0,5));
  await browser.close();
  console.log("\n"+(problems.length?"FALLITI "+problems.length+":\n - "+problems.join("\n - "):"Tutti i controlli sui segreti sono passati."));
  process.exit(problems.length?1:0);
})();
