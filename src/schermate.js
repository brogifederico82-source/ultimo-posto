// Schermate iniziali: titolo (#home), creazione del personaggio (#creator) e pannello Opzioni.
// Modulo autonomo: ganci in game.js (show, preview, updateMeters, refreshLanguage, updateHomeActions)
// chiamano schermateMostra, schermatePreview, schermateTratti, schermateLingua, schermateAggiornaHome.
// Funzioni pubbliche per gli altri moduli (menu di pausa ecc.):
//   opzioniApri(origine) / opzioniChiudi() / opzioniCostruisci() · schermateSchermoIntero() · schermateVai(schermata)
Object.assign(english,{
  "Crea il tuo personaggio":"Create your character","Il badge è pronto. Manca solo chi lo porta.":"The badge is ready. Only its owner is missing.",
  "Aspetto":"Look","Abiti":"Outfit","Tratti":"Traits","Nome":"Name","Indietro":"Back","Avanti":"Next","Inizia":"Start",
  "Mescola il guardaroba":"Shuffle wardrobe","Suggerisci un nome":"Suggest a name","Badge studente":"Student badge",
  "Profilo investigativo":"Investigator profile","Profilo diplomatico":"Diplomat profile","Profilo spericolato":"Reckless profile",
  "Frecce o W/S per scegliere · E o Invio per confermare":"Arrows or W/S to choose · E or Enter to confirm",
  "Tocca una voce per iniziare":"Tap an entry to begin","Satira studentesca · Pianta di gioco stilizzata":"Student satire · Stylised game map",
  "Hai un esame domani. Ti servono un tavolo, una presa e dieci minuti di silenzio. Il campus considera queste tre richieste separatamente.":"You have an exam tomorrow. You need a table, an outlet and ten minutes of quiet. The campus treats these three requests separately.",
  "Studentessa":"Female student","Studente":"Male student","Senza etichetta":"No label","Giacca":"Jacket","Felpa":"Hoodie","Camicia":"Shirt",
  "Giubbotto varsity":"Varsity jacket","Antracite":"Charcoal","Sabbia":"Sand","Salvia":"Sage","Nere":"Black","Bianche":"White","Marroni":"Brown",
  "Tela":"Canvas","Tecnico":"Technical","Spilla":"Pin","Patch":"Patch","Laccetto badge":"Badge lanyard","Profilo":"Profile",
  "Nome sul badge":"Badge name","Pantaloni":"Trousers","Scarpe":"Shoes","Borsa":"Bag","Capo":"Garment","Dettaglio":"Detail",
  "Tessuto":"Fabric","Mestiere":"Background","Perché sei qui":"Why you are here","Corporatura":"Build","Barba e baffi":"Facial hair",
  "Tinta unita":"Solid","Pois":"Polka dots","Denim":"Denim","Blu Luiss":"Luiss blue","Ruggine":"Rust","Indaco":"Indigo","Mostarda":"Mustard"
});
const schSound=name=>{try{if(typeof sound==="function")sound(name,"interface");}catch{}};
const schAvatarColors={
  pelle:["#edbc94","#c98b60","#a26950","#744936"],abito:["#b85052","#63946e","#5476a3","#c18c43","#202f51"],
  tinta:["#5b352a","#2e2938","#954933","#9c919b","#754261"],occhi:["#633c2c","#436249","#3d617b","#965c31"],
  pantaloni:["#343845","#415a78","#a89170","#586c54"],scarpe:["#29313a","#e8dfca","#77472e"]
};
let schOpener=null,schPanel=null;

/* ---------- Scena animata del titolo ---------- */
const schS={ps:3,map:null,mapKey:"",region:{x:48,y:96,w:1440,h:1400},t:0,last:0,raf:0,clouds:null,birds:[],leaves:null,walkers:null,nextBird:3,seed:7,pad:[]};
function schRnd(){schS.seed=(schS.seed*16807)%2147483647;return (schS.seed-1)/2147483646;}
function schMap(){
  const key=vividOn?"v":"n";
  if(schS.map&&schS.mapKey===key)return schS.map;
  try{
    const R=schS.region,cv=document.createElement("canvas");
    cv.width=R.w;cv.height=R.h;
    const c=cv.getContext("2d");
    c.translate(-R.x,-R.y);
    worldView(c,"giardino",0,{x:R.x,y:R.y,w:R.w,h:R.h},{...layers,persone:false});
    schS.map=cv;schS.mapKey=key;
  }catch{schS.map=null;}
  return schS.map;
}
function schSize(cv){
  const W=Math.max(1,window.innerWidth),H=Math.max(1,window.innerHeight);
  schS.ps=Math.max(2,Math.round(Math.min(W,H)/300));
  cv.width=Math.ceil(W/schS.ps);cv.height=Math.ceil(H/schS.ps);
}
const schWaypoints=[[560,430],[800,760],[470,1180],[1060,980],[1010,520],[330,760]];
function schCamera(t,iw,ih){
  const R=schS.region,leg=24,n=schWaypoints.length,k=t/leg,i=Math.floor(k)%n,f=k-Math.floor(k);
  const e=f*f*(3-2*f),A=schWaypoints[i],B=schWaypoints[(i+1)%n];
  const cx=A[0]+(B[0]-A[0])*e-R.x,cy=A[1]+(B[1]-A[1])*e-R.y;
  const mx=Math.max(0,R.w-iw),my=Math.max(0,R.h-ih);
  return [Math.round(Math.min(mx,Math.max(0,cx-iw/2))),Math.round(Math.min(my,Math.max(0,cy-ih/2)))];
}
function schCloud(){
  const rects=[],n=4+Math.floor(schRnd()*3);let w=0,h=0;
  for(let i=0;i<n;i++){
    const cx=i*20+schRnd()*8,cy=(schRnd()-.5)*14,rx=18+schRnd()*16,ry=8+schRnd()*7;
    for(let dy=-ry;dy<=ry;dy+=2){
      const hw=Math.round(rx*Math.sqrt(1-(dy/ry)**2));
      rects.push([Math.round(cx-hw),Math.round(cy+dy),hw*2,2]);
    }
    w=Math.max(w,cx+rx);h=Math.max(h,cy+ry);
  }
  return {x:0,y:0,v:5+schRnd()*7,rects,w:w+20,h:h*2};
}
function schPopulate(iw,ih){
  schS.clouds=Array.from({length:Math.max(3,Math.ceil(iw/150)+1)},()=>{const c=schCloud();c.x=schRnd()*(iw+c.w)-c.w*.5;c.y=schRnd()*ih*.9;return c;});
  schS.leaves=Array.from({length:Math.max(10,Math.ceil(iw/40))},()=>({x:schRnd()*iw,y:schRnd()*ih,vx:5+schRnd()*9,vy:9+schRnd()*12,ph:schRnd()*6,col:["#d9a441","#c0612b","#8fae3f","#e6c15a"][Math.floor(schRnd()*4)]}));
  const R=schS.region;
  const paths=[[520,400,860,400],[620,880,980,880],[300,520,300,820],[700,560,700,820],[900,300,1180,300],[420,1000,800,1000],[860,1080,1180,1080]];
  schS.walkers=paths.map(([ax,ay,bx,by],i)=>({
    a:Object.fromEntries(Object.entries(options).map(([k,list])=>[k,Math.floor(schRnd()*list.length)])),
    ax:ax-R.x,ay:ay-R.y,bx:bx-R.x,by:by-R.y,p:schRnd(),sp:.012+schRnd()*.01
  }));
}
function schBird(iw,ih){
  const dir=schRnd()<.5?1:-1,n=3+Math.floor(schRnd()*3),y=ih*(.1+schRnd()*.5),v=34+schRnd()*16;
  for(let i=0;i<n;i++)schS.birds.push({x:dir>0?-12-i*11:iw+12+i*11,y:y+(i%2?1:-1)*i*4,v:v*dir,ph:schRnd()*4});
}
function schDrawScene(c,iw,ih,t,animated){
  if(!schS.clouds)schPopulate(iw,ih);
  c.imageSmoothingEnabled=false;
  c.fillStyle="#2c4941";c.fillRect(0,0,iw,ih);
  const map=schMap(),[cx,cy]=schCamera(animated?t:0,iw,ih);
  if(map)c.drawImage(map,-cx,-cy);
  // ombre delle nuvole
  c.fillStyle="#0c2420";c.globalAlpha=.2;
  for(const k of schS.clouds)for(const [x,y,w,h] of k.rects)c.fillRect(Math.round(k.x+x+16),Math.round(k.y+y+12),w,h);
  c.globalAlpha=1;
  // studenti che passeggiano
  for(const w of schS.walkers){
    const q=animated?(w.p+t*w.sp)%2:w.p,f=q<1?q:2-q;
    const x=w.ax+(w.bx-w.ax)*f-cx,y=w.ay+(w.by-w.ay)*f-cy;
    if(x<-30||x>iw+30||y<-30||y>ih+50)continue;
    const fwd=q<1,dx=w.bx-w.ax,dy=w.by-w.ay;
    const look=Math.abs(dx)>=Math.abs(dy)?((dx>0)===fwd?"right":"left"):((dy>0)===fwd?"down":"up");
    sprite(c,w.a,x,y,animated?[0,1,0,2][Math.floor(t*6+w.p*9)%4]:0,look,1);
  }
  // foglie
  for(const l of schS.leaves){
    const sw=Math.round(1+Math.abs(Math.sin(l.ph+t*3))*1.4);
    c.fillStyle=l.col;c.fillRect(Math.round(l.x),Math.round(l.y),sw+1,2);
  }
  // uccelli
  for(const b of schS.birds){
    c.fillStyle="#0c2420";c.globalAlpha=.22;c.fillRect(Math.round(b.x),Math.round(b.y+14),4,1);c.globalAlpha=1;
    c.fillStyle="#1b2326";
    const up=Math.floor(t*7+b.ph)%2===0,x=Math.round(b.x),y=Math.round(b.y);
    c.fillRect(x,y,1,1);c.fillRect(x-1,y+(up?0:0),1,1);c.fillRect(x+1,y,1,1);
    c.fillRect(x-2,y+(up?-1:1),1,1);c.fillRect(x+2,y+(up?-1:1),1,1);c.fillRect(x-3,y+(up?-2:1),1,1);c.fillRect(x+3,y+(up?-2:1),1,1);
  }
  // nuvole alte
  c.fillStyle="#fff7e6";c.globalAlpha=.5;
  for(const k of schS.clouds)for(const [x,y,w,h] of k.rects)c.fillRect(Math.round(k.x+x),Math.round(k.y+y),w,h);
  c.globalAlpha=1;
}
function schStepScene(dt,iw,ih){
  for(const k of schS.clouds){k.x+=k.v*dt;if(k.x-k.w>iw){k.x=-k.w-schRnd()*40;k.y=schRnd()*ih*.9;}}
  for(const l of schS.leaves){
    l.x+=(l.vx+Math.sin(l.ph+schS.t*1.3)*6)*dt;l.y+=l.vy*dt;
    if(l.x>iw+4||l.y>ih+4){l.x=-4-schRnd()*iw*.4;l.y=schRnd()*ih*.6-ih*.1;}
  }
  schS.nextBird-=dt;
  if(schS.nextBird<=0){schBird(iw,ih);schS.nextBird=9+schRnd()*9;}
  schS.birds=schS.birds.filter(b=>{b.x+=b.v*dt;b.y+=Math.sin(schS.t*2+b.ph)*4*dt;return b.x>-30&&b.x<iw+30;});
}
function schHomeCanvas(){return document.getElementById("homeScene");}
function schHomeResize(){
  const cv=schHomeCanvas();if(!cv)return;
  schSize(cv);schS.clouds=null;
  schDrawScene(cv.getContext("2d"),cv.width,cv.height,schS.t,false);
}
function schCreatorBg(){
  const cv=document.getElementById("creatorScene");if(!cv||screen!=="creator")return;
  schSize(cv);schS.clouds=null;
  schDrawScene(cv.getContext("2d"),cv.width,cv.height,6,false);
}

/* ---------- Ciclo unico (titolo e creazione) ---------- */
function schLoop(now){
  schS.raf=requestAnimationFrame(schLoop);
  schPoll();
  if(document.hidden){schS.last=0;return;}
  const dt=Math.min(.05,(now-(schS.last||now))/1000);schS.last=now;
  if(screen==="home"&&!reducedMotion){
    const cv=schHomeCanvas();
    if(cv.width<2)schHomeResize();
    schS.t+=dt;schStepScene(dt,cv.width,cv.height);
    schDrawScene(cv.getContext("2d"),cv.width,cv.height,schS.t,true);
  }else if(screen==="creator"&&!reducedMotion)schCreatorTick(dt);
}
function schermateMostra(next){
  const on=next==="home"||next==="creator";
  document.documentElement.classList.toggle("sch-rm",reducedMotion);
  document.documentElement.classList.toggle("sch-lock",on);
  if(on&&!schS.raf){schS.last=0;schS.raf=requestAnimationFrame(schLoop);}
  if(!on&&schS.raf){cancelAnimationFrame(schS.raf);schS.raf=0;}
  if(next==="home"){
    schHomeResize();schermateAggiornaHome();
    const first=document.querySelector("#homeMenu button:not([hidden])");
    if(first&&!schPanel)first.focus({preventScroll:true});
  }
  if(next==="creator"){
    schTab(0);schCreatorBg();schPrev.t=0;schDrawPreview();
    document.getElementById("tabAspetto").focus({preventScroll:true});
  }
}
function schermateVai(next){
  if(typeof transizione==="function"){
    try{const r=transizione("dissolvenza",()=>show(next));if(r&&typeof r.then==="function")return r;}catch{}
  }
  show(next);
}
window.addEventListener("resize",()=>{
  if(screen==="home")schHomeResize();
  if(screen==="creator")schCreatorBg();
});
document.addEventListener("visibilitychange",()=>{schS.last=0;});

/* ---------- Menu del titolo ---------- */
function schLabel(btn,label,detail){
  btn.replaceChildren();
  const a=document.createElement("span");a.className="sch-lab";a.textContent=label;btn.append(a);
  if(detail){const d=document.createElement("small");d.className="sch-sub";d.textContent=detail;btn.append(d);}
}
function schermateAggiornaHome(){
  const story=stored("story"),free=stored("free");
  schLabel($("start"),story?local("Continua","Continue"):local("Nuova partita","New game"),story?(story.name||""):local("La storia","The story"));
  $("resume").hidden=!story;
  schLabel($("resume"),local("Nuova partita","New game"),local("Sostituisce il salvataggio","Replaces your save"));
  schLabel($("free"),local("Modalità libera","Free roam"),free?local("Riprendi","Resume"):local("Senza storia","No story"));
  schLabel($("optOpen"),local("Opzioni","Options"),"");
  schLabel($("edOpen"),local("Editor mappe","Map editor"),"");
  schFsLabel();
  $("start").classList.toggle("primary",true);
}
function schermateLingua(){
  $("langIt").setAttribute("aria-pressed",String(locale==="it"));
  $("langEn").setAttribute("aria-pressed",String(locale==="en"));
  $("homeMenu").setAttribute("aria-label",local("Menu principale","Main menu"));
  schermateAggiornaHomeSafe();
  schCreatorLabels();schermatePreview();
  if(schPanel)schOptRefresh();
}
function schermateAggiornaHomeSafe(){try{schermateAggiornaHome();}catch{}}
function schMenuItems(){return [...document.querySelectorAll("#homeMenu button:not([hidden])")];}
function schMenuMove(d){
  const items=schMenuItems(),i=Math.max(0,items.indexOf(document.activeElement));
  const next=items[(i+d+items.length)%items.length];
  if(next){next.focus({preventScroll:true});schSound("menu");}
}
for(const b of document.querySelectorAll("#homeMenu button"))b.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse"&&!schPanel)b.focus({preventScroll:true});});
$("optOpen").onclick=()=>opzioniApri("home");
$("fsOpen").onclick=()=>schermateSchermoIntero();
$("langIt").onclick=()=>chooseLanguage("it");
$("langEn").onclick=()=>chooseLanguage("en");
$("homeAudio").onclick=()=>$("audio").onclick();
function schAudioMirror(){
  const on=$("audio").getAttribute("aria-pressed")==="true";
  $("homeAudio").setAttribute("aria-pressed",String(on));
  $("homeAudio").setAttribute("aria-label",local(on?"Audio acceso":"Audio spento",on?"Audio on":"Audio off"));
}
new MutationObserver(schAudioMirror).observe($("audio"),{attributes:true,childList:true,characterData:true,subtree:true});
schAudioMirror();

/* ---------- Schermo intero ---------- */
const schFsOk=Boolean(document.fullscreenEnabled||document.webkitFullscreenEnabled);
const schFsOn=()=>Boolean(document.fullscreenElement||document.webkitFullscreenElement);
function schermateSchermoIntero(){
  try{
    if(schFsOn()){(document.exitFullscreen||document.webkitExitFullscreen).call(document);}
    else{const el=document.documentElement;(el.requestFullscreen||el.webkitRequestFullscreen)?.call(el);}
  }catch{}
}
function schFsLabel(){
  const b=$("fsOpen");if(!b)return;
  b.hidden=!schFsOk;
  schLabel(b,schFsOn()?local("Esci da schermo intero","Exit full screen"):local("Schermo intero","Full screen"),"");
  if(schPanel)schOptRefresh();
}
document.addEventListener("fullscreenchange",schFsLabel);
document.addEventListener("webkitfullscreenchange",schFsLabel);

/* ---------- Creazione del personaggio ---------- */
const schPrev={dir:0,auto:true,t:0,key:""};
const schDirs=["down","left","up","right"];
const schDirNames=[["Di fronte","Facing you"],["Di lato · sinistra","Side · left"],["Di spalle","From behind"],["Di lato · destra","Side · right"]];
function schDrawPreview(force){
  const cv=$("portrait");if(!cv)return;
  const dir=schPrev.auto?Math.floor(schPrev.t/2.4)%4:schPrev.dir;
  const step=reducedMotion?0:[0,1,0,2][Math.floor(schPrev.t*6)%4];
  const a=avatar(),key=dir+"/"+step+"/"+JSON.stringify(a);
  if(!force&&key===schPrev.key)return;
  schPrev.key=key;
  const c=cv.getContext("2d");
  const g=c.createLinearGradient(0,0,0,192);g.addColorStop(0,"#27485a");g.addColorStop(1,"#17303a");
  c.fillStyle=g;c.fillRect(0,0,192,192);
  const r=c.createRadialGradient(96,110,8,96,110,92);r.addColorStop(0,"#f3d9a044");r.addColorStop(1,"#f3d9a000");
  c.fillStyle=r;c.fillRect(0,0,192,192);
  c.fillStyle="#ffffff0d";for(let y=0;y<192;y+=16)c.fillRect(0,y,192,1);
  c.fillStyle="#0b1618";c.beginPath();c.ellipse(96,154,52,9,0,0,Math.PI*2);c.fill();
  c.strokeStyle="#e5ad62";c.lineWidth=2;c.beginPath();c.ellipse(96,154,52,9,0,0,Math.PI*2);c.stroke();
  sprite(c,a,96,152,step,schDirs[dir],4.6);
  const label=$("turnLabel");
  const text=schPrev.auto?local("In cammino","Walking"):local(...schDirNames[dir]);
  if(label.textContent!==text)label.textContent=text;
}
function schCreatorTick(dt){schPrev.t+=dt;schDrawPreview();}
function schermatePreview(){
  schFieldsRefresh();
  const auto=$("nameAuto");
  if(auto)auto.textContent=nameInput.value.trim()?"":local("Se lasci vuoto useremo «"+badgeName()+"».","If you leave it empty we will use “"+badgeName()+"”.");
  const n=$("nameCount");if(n)n.textContent=nameInput.value.length+" / "+nameInput.maxLength;
  if(screen==="creator")schDrawPreview(true);
}
$("turnLeft").onclick=()=>{
  if(schPrev.auto){schPrev.dir=Math.floor(schPrev.t/2.4)%4;}
  schPrev.auto=false;schPrev.dir=(schPrev.dir+3)%4;schDrawPreview(true);
};
$("turnRight").onclick=()=>{
  if(schPrev.auto){schPrev.dir=Math.floor(schPrev.t/2.4)%4;}
  schPrev.auto=false;schPrev.dir=(schPrev.dir+1)%4;schDrawPreview(true);
};
$("portrait").addEventListener("click",()=>{schPrev.auto=!schPrev.auto;schDrawPreview(true);});

const schFieldRows=[];
function schBuildFields(){
  for(const [id,select] of Object.entries(selectors)){
    const old=select.closest("label");if(!old)continue;
    const field=document.createElement("div");field.className="sch-field";field.dataset.field=id;
    const lab=document.createElement("span");lab.className="sch-flabel";lab.id="schl-"+id;
    const step=document.createElement("div");step.className="sch-step";step.tabIndex=0;step.setAttribute("role","spinbutton");
    step.setAttribute("aria-labelledby",lab.id);step.setAttribute("aria-valuemin","1");step.setAttribute("aria-valuemax",String(select.options.length));
    const left=document.createElement("button"),right=document.createElement("button"),val=document.createElement("output"),sw=document.createElement("i");
    for(const [b,cls,d] of [[left,"left",-1],[right,"right",1]]){
      b.type="button";b.className="sch-arrow "+cls;b.tabIndex=-1;
      b.addEventListener("click",()=>{schSetField(id,d);step.focus({preventScroll:true});});
    }
    sw.className="sch-sw";sw.setAttribute("aria-hidden","true");val.className="sch-val";
    const mid=document.createElement("span");mid.className="sch-mid";mid.append(sw,val);
    step.append(left,mid,right);
    select.classList.add("sch-sel");select.tabIndex=-1;select.setAttribute("aria-hidden","true");
    field.append(lab,step,select);
    old.replaceWith(field);
    select.addEventListener("change",schFieldsRefresh);
    step.addEventListener("keydown",e=>{
      const k=e.key.toLowerCase();
      if(k==="arrowleft"||k==="a"){e.preventDefault();schSetField(id,-1);}
      else if(k==="arrowright"||k==="d"){e.preventDefault();schSetField(id,1);}
      else if(k==="arrowup"||k==="w"){e.preventDefault();schRowMove(step,-1);}
      else if(k==="arrowdown"||k==="s"){e.preventDefault();schRowMove(step,1);}
      else if(k==="home"){e.preventDefault();schSetField(id,-select.selectedIndex);}
      else if(k==="end"){e.preventDefault();schSetField(id,select.options.length-1-select.selectedIndex);}
    });
    schFieldRows.push({id,select,lab,step,val,sw});
  }
  schCreatorLabels();
}
function schSetField(id,d){
  const row=schFieldRows.find(r=>r.id===id),n=row.select.options.length;
  row.select.selectedIndex=(row.select.selectedIndex+d+n)%n;
  row.select.dispatchEvent(new Event("change",{bubbles:true}));
  schSound("click");
}
function schRowMove(step,d){
  const pane=step.closest(".sch-pane");
  const rows=[...pane.querySelectorAll(".sch-step,input[type=range]")];
  const i=rows.indexOf(step),next=rows[Math.max(0,Math.min(rows.length-1,i+d))];
  if(next)next.focus({preventScroll:false});
}
function schFieldsRefresh(){
  for(const r of schFieldRows){
    const i=r.select.selectedIndex,text=r.select.options[i]?.textContent??"";
    r.val.textContent=text;
    r.step.setAttribute("aria-valuenow",String(i+1));r.step.setAttribute("aria-valuetext",text);
    const col=schAvatarColors[r.id]?.[i];
    r.sw.hidden=!col;if(col)r.sw.style.background=col;
  }
}
function schCreatorLabels(){
  for(const r of schFieldRows)r.lab.textContent=tr(labels[r.id]??r.id);
}
const schTabs=["tabAspetto","tabAbiti","tabTratti","tabNome"];
const schPanes=["panAspetto","panAbiti","panTratti","panNome"];
let schTabNow=0;
function schTab(i,focus){
  i=Math.max(0,Math.min(3,i));schTabNow=i;
  schTabs.forEach((id,k)=>{const t=$(id);t.setAttribute("aria-selected",String(k===i));t.tabIndex=k===i?0:-1;$(schPanes[k]).hidden=k!==i;});
  $("crStep").textContent=(i+1)+" / 4";
  $("crNext").hidden=i===3;
  $("crBack").textContent=i===0?local("Titolo","Title"):local("Indietro","Back");
  $("crBack").setAttribute("aria-label",i===0?local("Torna al titolo","Back to title"):local("Scheda precedente","Previous section"));
  $(schPanes[i]).scrollTop=0;
  if(focus)$(schTabs[i]).focus();
}
schTabs.forEach((id,i)=>{
  $(id).addEventListener("click",()=>{schTab(i);schSound("menu");});
  $(id).addEventListener("keydown",e=>{
    const k=e.key;
    if(k==="ArrowRight"||k==="ArrowLeft"||k==="Home"||k==="End"){
      e.preventDefault();
      schTab(k==="Home"?0:k==="End"?3:(i+(k==="ArrowRight"?1:-1)+4)%4,true);schSound("menu");
    }
  });
});
$("crNext").onclick=()=>{schTab(schTabNow+1);schSound("menu");};
$("crBack").onclick=()=>{
  if(schTabNow>0){schTab(schTabNow-1);return;}
  schermateVai("home");
};
function schermateTratti(){
  for(const id in traits){
    const s=sliders[id];if(!s)continue;
    const v=Number(s.value);
    s.style.setProperty("--v",v+"%");
    const word=v<34?local("basso","low"):v<67?local("medio","medium"):local("alto","high");
    const w=s.closest("label")?.querySelector(".sch-tword");if(w)w.textContent=word;
    s.setAttribute("aria-valuetext",v+", "+word);
  }
}
function schBuildTraits(){
  for(const id in traits){
    const label=sliders[id].closest("label"),heading=label.querySelector("span");
    label.classList.add("sch-trait");
    const w=document.createElement("em");w.className="sch-tword";
    heading.insertBefore(w,heading.querySelector("output"));
  }
  schermateTratti();
}
function schBuildName(){
  const box=$("nameBox");
  nameLabel.classList.add("sch-nameframe");
  const count=document.createElement("small");count.id="nameCount";count.className="sch-count";count.setAttribute("aria-hidden","true");
  nameLabel.append(count);
  const auto=document.createElement("p");auto.id="nameAuto";auto.className="hint";
  box.append(nameLabel,auto);
  nameInput.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("play").click();}});
}
schBuildFields();schBuildTraits();schBuildName();schTab(0);

/* ---------- Tastiera e gamepad ---------- */
function schAct(a){
  if(schPanel)return;
  if(screen==="home"){
    if(a==="up")schMenuMove(-1);
    else if(a==="down")schMenuMove(1);
    else if(a==="ok"){const cur=document.activeElement;(cur?.closest("#homeMenu")?cur:schMenuItems()[0])?.click();}
  }else if(screen==="creator"){
    if(a==="prev")schTab(schTabNow-1,true);
    else if(a==="next")schTab(schTabNow+1,true);
    else if(a==="back")$("crBack").click();
    else if(a==="ok"){const cur=document.activeElement;if(cur&&cur.matches("button"))cur.click();}
    else{
      const cur=document.activeElement,row=cur?.closest(".sch-step");
      if(row){
        const id=row.closest(".sch-field").dataset.field;
        if(a==="left")schSetField(id,-1);else if(a==="right")schSetField(id,1);else schRowMove(row,a==="up"?-1:1);
      }else if(a==="down"||a==="up"){
        const first=$(schPanes[schTabNow]).querySelector(".sch-step,input[type=range],input[type=text],button");
        if(a==="down")first?.focus();
      }
    }
  }
}
window.addEventListener("keydown",e=>{
  if(schPanel)return;
  if((screen!=="home"&&screen!=="creator")||e.ctrlKey||e.altKey||e.metaKey)return;
  const k=e.key.toLowerCase(),t=e.target instanceof Element?e.target:null;
  const typing=t?.closest("input[type=text],input:not([type]),textarea");
  if(screen==="home"){
    if(k==="arrowup"||k==="w"){e.preventDefault();schAct("up");}
    else if(k==="arrowdown"||k==="s"){e.preventDefault();schAct("down");}
    else if(k==="e"&&!(t?.closest("button")&&!t.closest("#homeMenu"))){e.preventDefault();schAct("ok");}
    else if((k==="enter"||k===" ")&&!t?.closest("button,a")){e.preventDefault();schAct("ok");}
    return;
  }
  if(typing)return;
  if(k==="escape"){e.preventDefault();schAct("back");}
  else if(k==="pageup"){e.preventDefault();schAct("prev");}
  else if(k==="pagedown"){e.preventDefault();schAct("next");}
  else if(k==="e"&&t?.closest("button")){e.preventDefault();t.click();}
  else if((k==="arrowdown"||k==="s")&&!t?.closest(".sch-step,input[type=range]")){e.preventDefault();schAct("down");}
});
function schPoll(){
  const pads=navigator.getGamepads?.()??[],pad=[...pads].find(Boolean);
  if(!pad)return;
  const b=i=>Boolean(pad.buttons[i]?.pressed);
  const now={up:b(12)||pad.axes[1]<-.6,down:b(13)||pad.axes[1]>.6,left:b(14)||pad.axes[0]<-.6,right:b(15)||pad.axes[0]>.6,ok:b(0),back:b(1),prev:b(4),next:b(5)};
  for(const k in now)if(now[k]&&!schS.pad[k])schAct(k);
  schS.pad=now;
}

/* ---------- Opzioni ---------- */
function schSwitch(label,desc,{get,set,disabled}){
  const row=document.createElement("div");row.className="sch-opt-row";
  const text=document.createElement("div");text.className="sch-opt-text";
  const l=document.createElement("span");l.className="sch-opt-label";l.textContent=label;
  text.append(l);
  if(desc){const d=document.createElement("small");d.className="sch-opt-desc";d.textContent=desc;text.append(d);}
  const sw=document.createElement("button");sw.type="button";sw.className="sch-switch";sw.setAttribute("role","switch");
  const id="schs-"+Math.random().toString(36).slice(2,8);l.id=id;sw.setAttribute("aria-labelledby",id);
  const knob=document.createElement("i");knob.setAttribute("aria-hidden","true");
  const state=document.createElement("b");state.setAttribute("aria-hidden","true");sw.append(state,knob);
  const sync=()=>{const on=Boolean(get());sw.setAttribute("aria-checked",String(on));state.textContent=on?local("SÌ","ON"):local("NO","OFF");sw.disabled=Boolean(disabled?.());};
  sw.onclick=()=>{set(!get());sync();};
  row.append(text,sw);row.sync=sync;sync();
  return row;
}
function schCheckbox(id){
  const box=$(id);
  return {get:()=>box.checked,set:v=>{box.checked=v;box.dispatchEvent(new Event("change",{bubbles:true}));}};
}
function schRange(label,{value,onInput,onChange,suffix="%",extra}){
  const wrap=document.createElement("div");wrap.className="sch-slider";
  const head=document.createElement("div");head.className="sch-slider-head";
  const name=document.createElement("label");name.textContent=label;
  const out=document.createElement("output");
  const input=document.createElement("input");input.type="range";input.min=0;input.max=100;input.step=1;
  const id="schr-"+Math.random().toString(36).slice(2,8);input.id=id;name.htmlFor=id;
  const sync=()=>{out.textContent=input.value+suffix;input.style.setProperty("--v",input.value+"%");input.setAttribute("aria-valuetext",input.value+suffix);};
  input.value=value();sync();
  input.oninput=()=>{sync();onInput(Number(input.value));};
  if(onChange)input.onchange=()=>onChange(Number(input.value));
  head.append(name,out);wrap.append(head,input);
  if(extra)wrap.append(extra);
  wrap.refresh=()=>{input.value=value();sync();};
  return wrap;
}
function opzioniCostruisci(){
  const root=document.createElement("div");root.className="sch-opt";
  const refreshers=[];
  const section=(title)=>{
    const s=document.createElement("section");s.className="sch-opt-sec";
    const h=document.createElement("h3");h.textContent=title;s.append(h);root.append(s);return s;
  };
  // Audio
  const audio=section(local("Audio","Audio"));
  const master=schSwitch(local("Audio del gioco","Game audio"),local("Musica ed effetti. Non parte da solo: lo decidi tu.","Music and effects. It never starts on its own."),
    {get:()=>audioOn,set:()=>{$("audio").onclick();}});
  audio.append(master);refreshers.push(master.sync);
  const status=document.createElement("output");status.className="sch-opt-status";status.setAttribute("role","status");
  for(const [channel,it,en] of audioChannels){
    const name=local(it,en);
    const mute=schSwitch(local("Muto","Mute"),"",{
      get:()=>mixer[channel].muted,
      set:v=>{mixer[channel]={level:mixer[channel].level,muted:v};syncMixer();saveMixer();renderMixers();}
    });
    mute.classList.add("sch-mini");mute.querySelector(".sch-opt-label").setAttribute("aria-label",local("Muto: ","Mute: ")+name);
    const test=document.createElement("button");test.type="button";test.className="sch-test";test.textContent=local("Prova","Test");
    test.setAttribute("aria-label",local("Prova suono · ","Test sound · ")+name);
    test.onclick=()=>{status.textContent=mixerPreview(channel)?local("Prova avviata.","Playing test."):local("Canale silenziato o audio spento.","Channel muted or audio off.");};
    const extra=document.createElement("div");extra.className="sch-slider-tools";extra.append(mute,test);
    const range=schRange(name,{value:()=>mixer[channel].level,onInput:v=>{mixer[channel]={level:v,muted:mixer[channel].muted};syncMixer();saveMixer();},onChange:()=>renderMixers(),extra});
    audio.append(range);refreshers.push(range.refresh,mute.sync);
  }
  const reset=document.createElement("button");reset.type="button";reset.className="sch-wide";reset.textContent=local("Ripristina i volumi","Restore volumes");
  reset.onclick=()=>{mixer=defaultMixer();syncMixer();saveMixer();renderMixers();for(const f of refreshers)f();};
  audio.append(reset,status);
  // Gioco
  const game=section(local("Gioco","Game"));
  const lang=document.createElement("div");lang.className="sch-opt-row";
  const lt=document.createElement("div");lt.className="sch-opt-text";
  lt.innerHTML="";const ll=document.createElement("span");ll.className="sch-opt-label";ll.id="schLangLab";ll.textContent=local("Lingua","Language");
  const ld=document.createElement("small");ld.className="sch-opt-desc";ld.textContent=local("Cambia subito testi e dialoghi.","Changes texts and dialogue right away.");
  lt.append(ll,ld);
  const seg=document.createElement("div");seg.className="sch-seg";seg.setAttribute("role","group");seg.setAttribute("aria-labelledby","schLangLab");
  for(const [code,txt] of [["it","Italiano"],["en","English"]]){
    const b=document.createElement("button");b.type="button";b.textContent=txt;b.lang=code;b.dataset.lang=code;
    b.setAttribute("aria-pressed",String(locale===code));
    b.onclick=()=>chooseLanguage(code);
    seg.append(b);
  }
  lang.append(lt,seg);game.append(lang);
  const rows=[
    [local("Sorprese","Surprises"),local("Incontri horror-comici nascosti nel campus. La voce segue l’audio del gioco.","Horror-comedy encounters hidden around campus. The voice follows the game audio."),schCheckbox("surpriseEnabled")],
    [local("Colori vivaci","Vivid colours"),local("Palette più calda e contrastata.","A warmer, higher-contrast palette."),{get:()=>vividOn,set:v=>{$("vividColors").checked=v;setVividColors(v);}}],
    [local("Movimento ridotto","Reduced motion"),local("Niente animazioni decorative. Il sistema può già chiederlo.","No decorative animation. Your system may already ask for this."),
      {get:()=>reducedMotion,set:v=>{
        reducedMotion=v;try{localStorage.setItem("ultimo-posto-movimento-ridotto",v?"on":"off");}catch{}
        schermateMostra(screen);
      },disabled:()=>systemReducedMotion}],
    [local("Comando Fuma","Smoke command"),local("Mostra il comando Fuma nelle zone dove ha senso.","Shows the Smoke command where it makes sense."),schCheckbox("smokingEnabled")],
    [local("Guardia disarmata","Unarmed guard"),local("Variante più leggera del tornello.","A lighter take on the turnstile.")
      ,schCheckbox("unarmedGuard")]
  ];
  for(const [l,d,io] of rows){const r=schSwitch(l,d,io);game.append(r);refreshers.push(r.sync);}
  if(schFsOk){
    const fs=schSwitch(local("Schermo intero","Full screen"),local("Il gioco occupa tutta la finestra.","The game fills the whole window."),{get:schFsOn,set:()=>schermateSchermoIntero()});
    fs.dataset.fs="1";game.append(fs);refreshers.push(fs.sync);
  }
  root.refresh=()=>{
    for(const f of refreshers)f();
    for(const b of root.querySelectorAll(".sch-seg button"))b.setAttribute("aria-pressed",String(locale===b.dataset.lang));
  };
  return root;
}
function schOptRefresh(){
  if(!schPanel)return;
  const body=schPanel.querySelector(".sch-opt-body");
  const keep=document.activeElement&&schPanel.contains(document.activeElement)?document.activeElement.id||document.activeElement.dataset.lang:null;
  schPanel.querySelector("h2").textContent=local("Opzioni","Options");
  const back=schPanel.querySelector(".sch-opt-back");back.textContent=local("Indietro","Back");
  const fresh=opzioniCostruisci();body.replaceChildren(fresh);
  if(keep){(schPanel.querySelector("#"+CSS.escape(keep))||schPanel.querySelector('[data-lang="'+keep+'"]'))?.focus({preventScroll:true});}
}
function opzioniApri(origine){
  if(schPanel)return;
  schOpener=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const p=document.createElement("div");p.className="gp gp-opzioni";p.setAttribute("role","dialog");p.setAttribute("aria-modal","true");p.setAttribute("aria-labelledby","schOptTitle");
  p.dataset.origine=origine||"";
  const head=document.createElement("header");head.className="sch-opt-head";
  const h=document.createElement("h2");h.id="schOptTitle";h.textContent=local("Opzioni","Options");
  const back=document.createElement("button");back.type="button";back.className="sch-opt-back primary";back.textContent=local("Indietro","Back");
  back.onclick=opzioniChiudi;
  head.append(h,back);
  const body=document.createElement("div");body.className="sch-opt-body";
  body.append(opzioniCostruisci());
  const hint=document.createElement("p");hint.className="sch-opt-hint";hint.textContent=local("Esc o B per tornare indietro","Esc or B to go back");
  p.append(head,body,hint);
  document.body.append(p);
  schPanel=p;
  document.documentElement.classList.add("sch-modal");
  const main=$("main");if(main)main.inert=true;
  schSound("menu");
  p.querySelector("input,button")?.focus({preventScroll:true});
}
function opzioniChiudi(){
  if(!schPanel)return;
  schPanel.remove();schPanel=null;
  document.documentElement.classList.remove("sch-modal");
  const main=$("main");if(main)main.inert=false;
  schSound("back");
  if(schOpener&&schOpener.isConnected)schOpener.focus({preventScroll:true});
  else if(screen==="home")schMenuItems()[0]?.focus();
  schOpener=null;
}
function schPanelKey(e){
  if(e.key==="Escape"){e.preventDefault();e.stopPropagation();opzioniChiudi();return;}
  if(e.key==="Tab"){
    const f=[...schPanel.querySelectorAll("button:not([disabled]),input:not([disabled])")].filter(x=>x.offsetParent!==null);
    if(!f.length)return;
    const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    else if(!schPanel.contains(document.activeElement)){e.preventDefault();first.focus();}
  }
}
// Con il pannello aperto i tasti non raggiungono il gioco sotto (fase di cattura).
window.addEventListener("keydown",e=>{
  if(!schPanel)return;
  schPanelKey(e);
  if(!e.defaultPrevented)e.stopPropagation();
},true);
