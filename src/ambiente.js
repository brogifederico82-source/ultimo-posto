// Animazioni ambientali: tutto deterministico (funzione del tempo), disegnato solo nella vista e senza
// allocazioni per frame. Niente di quello che c'è qui finisce in `state` o nei salvataggi.
// Ganci: draw() in dialogue.js (ambienteMondo, ambienteFoco, ambienteEtichetta, ambienteSchermo),
// drawObject() in world.js (ambienteOggetto, ambienteSguardo), interact() e renderScene() in game.js.
var amb=null,ambCache=new WeakMap();
const AMB_LEAVES=["#b8c46f","#d7a55a","#8fae62","#c98a4b"],AMB_PETALS=["#f2c8d2","#fff0d8","#e8a9bf","#f6dca0"];
const AMB_BUTTERFLY=["#f4c14e","#eeeef4","#f08aa6","#8fc3f0"];
const AMB_FLAGS=[
  ["ingresso","romania-255",1.5,.2,0],["giardino","main-front",1.2,.1,0],["giardino","main-front",15.8,.1,1],
  ["giardino","radio-building",3.5,.1,2],["giardino","dome-building",4.5,.1,0],["giardino","main-gatehouse",.7,.2,1]
];
const AMB_FLAG_COLORS=[["#2f9a58","#f4f1e6","#cf4a3f"],["#1d3a6b","#1d3a6b","#e8b24e"],["#2c5aa8","#2c5aa8","#f1d36a"]];
function ambMake(){
  return {lz:null,lx:0,ly:0,fade:-1e9,pop:null,focusSeen:-1e9,focusAt:0,focusUid:null,btn:false,sceneKey:"",
    puff:new Float32Array(24*6),pi:0};
}
function ambH(n){
  n=Math.imul((n|0)^((n|0)>>>15),2246822519);n=Math.imul(n^(n>>>13),3266489917);
  return ((n^(n>>>16))>>>0)/4294967296;
}
function ambTargets(z,id){
  let t=ambCache.get(z);
  if(t&&t.n===z.objects.length)return t;
  t={n:z.objects.length,lamps:[],water:[],flowers:[],strings:[],flags:[],coins:[]};
  for(const o of z.objects){
    if(o.kind==="lamp")t.lamps.push(o);
    else if(o.kind==="fountain"||o.kind==="nasone")t.water.push(o);
    else if(o.kind==="flowers"||o.kind==="flowerMeadow"||o.kind==="roseBed")t.flowers.push(o);
    else if(o.kind==="polaLights")t.strings.push(o);
  }
  for(const [zone,uid,dx,dy,style] of AMB_FLAGS){
    if(zone!==id)continue;
    const o=z.objects.find(item=>item.uid===uid);
    if(o)t.flags.push({x:o.x*16+dx*16,y:o.y*16+dy*16,style,seed:t.flags.length});
  }
  for(const coin of vialeCoins)if(coin[1]===id)t.coins.push(coin);
  ambCache.set(z,t);
  return t;
}
function ambOutdoor(z,id){return z.ground==="grass"||id==="pola"||id==="parenzo"||id==="ingresso";}
function ambSurface(z,x,y){return terrainCache.get(z)?.get(x+y*z.width)?.kind??z.ground;}

function ambCloud(c,view,now){
  const s=now*.008;
  const gx0=Math.floor((view.x-s-110)/400),gx1=Math.floor((view.x+view.w-s+110)/400);
  const gy0=Math.floor((view.y-60)/300),gy1=Math.floor((view.y+view.h+60)/300);
  for(let gy=gy0;gy<=gy1;gy++)for(let gx=gx0;gx<=gx1;gx++){
    const k=gx*73856093^gy*19349663;
    if(ambH(k)<.45)continue;
    const cx=gx*400+ambH(k+1)*400+s,cy=gy*300+ambH(k+2)*300;
    const rx=52+ambH(k+3)*42,ry=26+ambH(k+4)*16;
    c.fillStyle="#0b1f2a0e";c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,6.2832);c.fill();
    c.fillStyle="#0b1f2a0b";c.beginPath();c.ellipse(cx+rx*.12,cy-ry*.1,rx*.68,ry*.66,0,0,6.2832);c.fill();
  }
}
function ambLamp(c,o,now,view){
  const x=o.x*16+8,y=o.y*16+4;
  if(x<view.x-14||x>view.x+view.w+14||y<view.y-14||y>view.y+view.h+22)return;
  c.globalAlpha=.86+.14*Math.sin(now/700+o.x*1.7+o.y);
  c.fillStyle="#ffdf9a12";c.beginPath();c.ellipse(x,y+10,10,3.4,0,0,6.2832);c.fill();
  c.fillStyle="#ffdf9a10";c.beginPath();c.arc(x,y,12,0,6.2832);c.fill();
  c.fillStyle="#ffe8b01e";c.beginPath();c.arc(x,y,7,0,6.2832);c.fill();
  c.fillStyle="#fff3cc40";c.beginPath();c.arc(x,y,3.2,0,6.2832);c.fill();
  c.globalAlpha=1;
}
function ambWater(c,o,now,view){
  const x=o.x*16,y=o.y*16,w=o.w*16,h=o.h*16;
  if(x+w<view.x||x>view.x+view.w||y+h<view.y||y>view.y+view.h)return;
  const cx=x+w/2;
  if(o.kind==="nasone"){
    for(let k=0;k<2;k++){
      const u=(now/700+k*.5+o.x*.3)%1;
      c.globalAlpha=(1-u)*.7;c.strokeStyle="#d8f3f4";c.lineWidth=1;
      c.beginPath();c.ellipse(x+12.5,y+13.6,1+u*3.4,.5+u*1.1,0,0,6.2832);c.stroke();
    }
    c.globalAlpha=1;return;
  }
  const cy=y+h*.5,rx0=w*.36,ry0=h*.17;
  for(let k=0;k<3;k++){
    const u=(now/2600+k/3+o.x*.17)%1;
    c.globalAlpha=(1-u)*.62;c.strokeStyle="#e4f6f4";c.lineWidth=1;
    c.beginPath();c.ellipse(cx,cy,rx0*(.25+u*.75),ry0*(.25+u*.75),0,0,6.2832);c.stroke();
  }
  c.globalAlpha=1;
  for(let k=0;k<3;k++){
    const t=(now/900+k*.37+o.y*.21)%1;
    if(t>.28)continue;
    const a=ambH(k+(o.x|0)*7+Math.floor(now/900+k*.37)*13);
    rect(c,"#f4fffa",cx+(a-.5)*rx0*1.5,cy+(ambH(a*999)-.5)*ry0*1.4,1,1);
  }
}
function ambFlag(c,f,now,view){
  if(f.x<view.x-16||f.x>view.x+view.w+16||f.y<view.y-6||f.y>view.y+view.h+22)return;
  const px=Math.round(f.x),py=Math.round(f.y),col=AMB_FLAG_COLORS[f.style];
  rect(c,"#00000030",px-1,py+7,3,1);
  rect(c,"#d9d1be",px,py-14,1,22);rect(c,"#f4d982",px-.5,py-15,2,1.4);
  const gust=.6+.4*Math.sin(now/1900+f.seed);
  for(let i=0;i<9;i++){
    const w=Math.sin(now/230-i*.75+f.seed*2)*gust*(.3+i*.12);
    const top=Math.round(py-13+w);
    if(f.style===0)for(let j=0;j<3;j++)rect(c,col[j],px+1+i,top+(j===0?0:j*1.7-.2),1,j===0?2:1.7);
    else{
      rect(c,col[0],px+1+i,top,1,5);
      if(f.style===1&&i>2&&i<6)rect(c,col[2],px+1+i,top+1.5,1,2);
      if(f.style===2&&(i===3||i===6))for(let j=0;j<3;j++)rect(c,col[2],px+1+i,top+j*1.6,1,1);
    }
  }
}
function ambButterfly(c,o,now,view,i){
  const h=ambH(Math.imul(o.x|0,31)+(o.y|0)*17+i);
  const cx=o.x*16+8+Math.cos(now/(1250+h*500)+h*6.28)*11,cy=o.y*16+5+Math.sin(now/(860+h*300)+h*9)*6;
  if(cx<view.x-6||cx>view.x+view.w+6||cy<view.y-6||cy>view.y+view.h+6)return;
  const x=Math.round(cx),y=Math.round(cy),open=Math.floor(now/95+h*9)%2;
  const color=AMB_BUTTERFLY[Math.floor(h*4)];
  if(open){rect(c,color,x-1,y-1,1,2);rect(c,color,x+1,y-1,1,2);}
  else rect(c,color,x,y-1,1,2);
  rect(c,"#3b3030",x,y,1,1);
}
function ambCoins(c,list,now,view){
  const picked=wallet().picked;
  for(const [id,,x,y] of list){
    const cycle=(now+ambH(x*37+y)*2600)%2600;
    if(cycle>440)continue;
    const px=x*16+10,py=y*16+4;
    if(px<view.x-6||px>view.x+view.w+6||py<view.y-6||py>view.y+view.h+6||picked.includes(id))continue;
    const arm=Math.round(1+Math.sin(cycle/440*Math.PI)*3);
    rect(c,"#fffbe0",px-arm,py,arm*2+1,1);rect(c,"#fffbe0",px,py-arm,1,arm*2+1);
  }
}
function ambPuffs(c,a,now){
  const p=a.puff;
  for(let i=0;i<p.length;i+=6){
    const age=now-p[i+4];
    if(age<0||age>460)continue;
    const t=age/1000;
    c.globalAlpha=1-age/460;
    rect(c,p[i+5]?"#a9c06f":"#e2d6bb",p[i]+p[i+2]*t,p[i+1]+p[i+3]*t+60*t*t,p[i+5]?1:2,1);
  }
  c.globalAlpha=1;
}
function ambSpawnPuffs(a,x,y,grass,now){
  for(let k=0;k<3;k++){
    const i=(a.pi++%24)*6,h=ambH(a.pi*17+x);
    a.puff[i]=x*16+5+h*6;a.puff[i+1]=y*16+13;
    a.puff[i+2]=(h-.5)*26;a.puff[i+3]=-(grass?26:12)-ambH(a.pi*5)*14;
    a.puff[i+4]=now;a.puff[i+5]=grass?1:0;
  }
}
function ambLeaves(c,view,now,petals,density){
  const palette=petals?AMB_PETALS:AMB_LEAVES;
  const gx0=Math.floor(view.x/96)-1,gx1=Math.floor((view.x+view.w)/96)+1;
  const gy0=Math.floor(view.y/96)-1,gy1=Math.floor((view.y+view.h)/96)+1;
  for(let gy=gy0;gy<=gy1;gy++)for(let gx=gx0;gx<=gx1;gx++)for(let n=0;n<2;n++){
    const k=gx*83492791^gy*2654435761^n*97;
    if(ambH(k)>density)continue;
    const period=7000+ambH(k+1)*6000,u=((now+ambH(k+2)*period)%period)/period;
    if(u<.05||u>.95)continue;
    const x=gx*96+ambH(k+3)*96+u*26+Math.sin(u*9+ambH(k+4)*6)*7,y=gy*96+u*110-12;
    if(x<view.x-3||x>view.x+view.w+3||y<view.y-3||y>view.y+view.h+3)continue;
    const flip=Math.floor(now/240+k)&1;
    rect(c,palette[(ambH(k+5)*4)|0],Math.round(x),Math.round(y),flip?2:1,flip?1:2);
  }
}
function ambDust(c,view,now){
  const gx0=Math.floor(view.x/64)-1,gx1=Math.floor((view.x+view.w)/64)+1;
  const gy0=Math.floor(view.y/64)-1,gy1=Math.floor((view.y+view.h)/64)+1;
  for(let gy=gy0;gy<=gy1;gy++)for(let gx=gx0;gx<=gx1;gx++){
    const k=gx*83492791^gy*2654435761;
    const period=9000+ambH(k)*6000,u=((now+ambH(k+1)*period)%period)/period;
    const x=gx*64+ambH(k+2)*64+Math.sin(u*6.28+ambH(k+3)*6)*8,y=gy*64+ambH(k+4)*64-u*14;
    c.globalAlpha=Math.sin(u*Math.PI)*.5;
    rect(c,"#fff0c8",Math.round(x),Math.round(y),1,1);
  }
  c.globalAlpha=1;
}
function ambBirds(c,view,now){
  const span=24000,epoch=Math.floor(now/span),local=now%span;
  if(ambH(epoch*3+1)>.7)return;
  const start=2500+ambH(epoch*7+3)*7000,u=(local-start)/9500;
  if(u<0||u>1)return;
  const dir=ambH(epoch*11+5)<.5?1:-1;
  const baseX=dir>0?view.x-30+u*(view.w+60):view.x+view.w+30-u*(view.w+60);
  const baseY=view.y+14+ambH(epoch*5+2)*70+Math.sin(u*7)*5;
  for(let i=0;i<4;i++){
    const x=Math.round(baseX-dir*[0,9,17,23][i]),y=Math.round(baseY+[0,4,-3,3][i]+Math.sin(u*11+i)*1.2);
    const f=Math.floor(now/95+i*2)%3;
    rect(c,"#0b161a1c",x-1,y+26,3,1);
    c.fillStyle="#1d282d";
    c.fillRect(x,y,1,1);
    if(f===0){c.fillRect(x-1,y-1,1,1);c.fillRect(x-2,y-2,1,1);c.fillRect(x+1,y-1,1,1);c.fillRect(x+2,y-2,1,1);}
    else if(f===1){c.fillRect(x-1,y,2,1);c.fillRect(x-2,y,1,1);c.fillRect(x+1,y,2,1);}
    else{c.fillRect(x-1,y+1,1,1);c.fillRect(x-2,y+1,1,1);c.fillRect(x+1,y+1,1,1);c.fillRect(x+2,y+1,1,1);}
  }
}
function ambPop(c,p,now){
  const t=(now-p.t)/380;
  if(t<0||t>1)return;
  const e=t*7;
  c.globalAlpha=1-t;c.strokeStyle="#ffe2a8";c.lineWidth=1;
  c.strokeRect(p.x*16-e+.5,p.y*16-e+.5,p.w*16+e*2,p.h*16+e*2);
  const cx=(p.x+p.w/2)*16,cy=(p.y+p.h/2)*16,r=t*Math.min(18,8+p.w*3);
  for(let k=0;k<8;k++){
    const a=k*.7854+.3;
    rect(c,"#fff0b8",Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r*.8),1,1);
  }
  c.globalAlpha=1;
}

var ambView={x:0,y:0,w:0,h:0};
function ambienteMondo(c,id,vx,vy,vw,vh,now,tx,ty){
  if(typeof transizioneZonaVista==="function")transizioneZonaVista(id);
  if(reducedMotion)return;
  const a=amb||(amb=ambMake()),z=room(id),view=ambView;
  view.x=vx;view.y=vy;view.w=vw;view.h=vh;
  if(a.lz!==id){
    if(a.lz!==null)a.fade=now;
    a.lz=id;a.lx=tx;a.ly=ty;
  }else if(tx!==a.lx||ty!==a.ly){
    if(Math.abs(tx-a.lx)+Math.abs(ty-a.ly)===1)ambSpawnPuffs(a,a.lx,a.ly,ambSurface(z,a.lx,a.ly)==="grass",now);
    a.lx=tx;a.ly=ty;
  }
  const out=ambOutdoor(z,id),t=ambTargets(z,id);
  c.save();
  if(out)ambCloud(c,view,now);
  for(const o of t.lamps)ambLamp(c,o,now,view);
  for(const o of t.strings){
    const x=o.x*16,y=o.y*16+5;
    if(x+o.w*16<view.x||x>view.x+view.w||y<view.y-8||y>view.y+view.h+8)continue;
    for(let i=0;i<6;i++){
      c.globalAlpha=.55+.45*Math.sin(now/310+i*1.9+o.x);
      c.fillStyle="#ffe1a118";c.beginPath();c.arc(x+(i+.5)*o.w*16/6,y+1,5,0,6.2832);c.fill();
    }
    c.globalAlpha=1;
  }
  for(const o of t.water)ambWater(c,o,now,view);
  for(const f of t.flags)ambFlag(c,f,now,view);
  if(out&&id!=="ingresso"){
    let n=0;
    for(let i=0;i<t.flowers.length&&n<6;i++){
      const o=t.flowers[i];
      if(i%3||o.x*16<view.x-30||o.x*16>view.x+view.w+30||o.y*16<view.y-20||o.y*16>view.y+view.h+20)continue;
      ambButterfly(c,o,now,view,i);n++;
    }
  }
  if(state&&!testMode&&t.coins.length)ambCoins(c,t.coins,now,view);
  ambPuffs(c,a,now);
  if(out){
    ambLeaves(c,view,now,id==="pola"||id==="parenzo",id==="ingresso"?.3:.85);
    ambBirds(c,view,now);
  }else ambDust(c,view,now);
  if(a.pop)ambPop(c,a.pop,now);
  c.restore();
}

// Oscillazione di chiome/fiori e respiro degli NPC, applicati in drawObject dopo il posizionamento.
function ambienteOggetto(c,o,now){
  if(reducedMotion||!now)return;
  switch(o.kind){
    case "tree":case "pine":case "orangeTree":case "cypress":case "bush":case "hedge":
    case "flowers":case "roseBed":case "flowerMeadow":{
      const ph=o.x*.83+o.y*1.37,flower=o.kind[0]==="f"||o.kind==="roseBed";
      const amp=(flower?1.4:o.kind==="bush"||o.kind==="hedge"?.5:o.kind==="cypress"?.6:1)*(.55+.45*Math.sin(now/4200+o.x*.12));
      const k=(Math.sin(now/(flower?620:950)+ph)+Math.sin(now/370+ph*2)*.25)*amp/15;
      c.transform(1,0,k,1,-k*15,0);
      return;
    }
  }
  if(assets[o.kind]?.[2]!=="persone"||isVehicle(o)||o.kind==="boar"||o.step||(o.route?.length&&o.behavior!=="idle"))return;
  const ph=o.x*2.3+o.y*3.1,b=(Math.sin(now/760+ph)+1)/2;
  c.translate(8,15);c.scale(1,1+b*.05);c.translate(-8,-15);
}
function ambienteSguardo(o,now){
  const base=o.look??"down";
  if(reducedMotion||!now||base!=="down"||o.step||(o.route?.length&&o.behavior!=="idle"))return base;
  const slot=(now+ambH(Math.round(o.x*16+o.y*31))*9000)%9000;
  return slot<520?"left":slot>4700&&slot<5300?"right":base;
}

// Feedback sugli oggetti interattivi, in coordinate schermo (dentro draw, accanto all'etichetta).
function ambienteEtichetta(uid,now){
  const a=amb||(amb=ambMake());
  if(reducedMotion)return 0;
  if(a.focusUid!==uid||now-a.focusSeen>120){a.focusUid=uid;a.focusAt=now;}
  a.focusSeen=now;
  const t=Math.min(1,(now-a.focusAt)/220);
  const back=1+2.70158*Math.pow(t-1,3)+1.70158*Math.pow(t-1,2);
  c_lastAlpha=Math.min(1,t*2.2);
  return Math.round((1-back)*7)+(t>=1&&Math.sin(now/330)>.55?-1:0);
}
var c_lastAlpha=1;
function ambienteFoco(c,o,cameraX,cameraY,zoom,now){
  const a=amb||(amb=ambMake());
  a.focusFrame=now;
  if(reducedMotion)return;
  const l=Math.round((o.x*16-cameraX)*zoom),tp=Math.round((o.y*16-cameraY)*zoom);
  const w=Math.round(o.w*16*zoom),h=Math.round(o.h*16*zoom);
  const pulse=.5+.5*Math.sin(now/260);
  if(o.w*o.h<=12){
    c.globalAlpha=.05+.07*pulse;c.fillStyle="#ffd499";c.fillRect(l,tp,w,h);
  }
  const pad=2+Math.round(pulse),len=Math.max(2,Math.min(4,Math.floor(Math.min(w,h)/3)));
  c.globalAlpha=.5+.4*pulse;c.fillStyle="#ffd499";
  const x0=l-pad,y0=tp-pad,x1=l+w+pad-1,y1=tp+h+pad-1;
  c.fillRect(x0,y0,len,1);c.fillRect(x0,y0,1,len);
  c.fillRect(x1-len+1,y0,len,1);c.fillRect(x1,y0,1,len);
  c.fillRect(x0,y1,len,1);c.fillRect(x0,y1-len+1,1,len);
  c.fillRect(x1-len+1,y1,len,1);c.fillRect(x1,y1-len+1,1,len);
  c.globalAlpha=1;
}
function ambienteAlfa(){return reducedMotion?1:c_lastAlpha;}
function ambienteInteragisci(o){
  const a=amb||(amb=ambMake());
  if(reducedMotion)return;
  a.pop={x:o.x,y:o.y,w:o.w,h:o.h,t:performance.now()};
  const b=document.getElementById("interact");
  if(b){b.classList.remove("amb-pop");void b.offsetWidth;b.classList.add("amb-pop");}
}
// Dissolvenza all'arrivo in una nuova zona e stato del tasto E. Non blocca mai il gioco.
function ambienteSchermo(c,now){
  const a=amb;
  if(!a||reducedMotion)return;
  const ready=a.focusFrame===now;
  if(ready!==a.btn){
    a.btn=ready;
    document.getElementById("interact")?.classList.toggle("amb-ready",ready);
  }
  if(typeof transizione==="function")return; // la dissolvenza di zona e' ora in transizioni.js
  const t=(now-a.fade)/360;
  if(t<0||t>=1)return;
  c.globalAlpha=Math.pow(1-t,2)*.9;
  c.fillStyle="#101a1a";c.fillRect(0,0,320,192);
  c.globalAlpha=1;
}
// Comparsa animata di dialoghi e scelte (solo CSS, riavviato quando cambia la scena).
function ambienteScena(){
  const a=amb||(amb=ambMake());
  const key=$("sceneTitle").textContent+"|"+$("choices").textContent;
  if(key===a.sceneKey)return;
  a.sceneKey=key;
  if(reducedMotion)return;
  for(const el of [document.querySelector(".scene"),$("speakerPortrait")]){
    if(!el||el.hidden)continue;
    el.classList.remove("amb-in");void el.offsetWidth;el.classList.add("amb-in");
  }
}
(function ambienteStili(){
  if(typeof document==="undefined"||reducedMotion)return;
  const style=document.createElement("style");
  style.textContent=
    "@keyframes amb-in{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}"+
    "@keyframes amb-btn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}"+
    "@keyframes amb-key{0%,100%{box-shadow:0 0 0 0 #ffd49900}50%{box-shadow:0 0 8px 1px #ffd49966}}"+
    "@keyframes amb-kbd{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}"+
    "@keyframes amb-pop{0%{transform:scale(1)}35%{transform:scale(.92)}70%{transform:scale(1.06)}100%{transform:scale(1)}}"+
    ".amb-in{animation:amb-in .26s cubic-bezier(.2,.9,.3,1.1) both}"+
    ".scene.amb-in #choices button{animation:amb-btn .28s ease-out both}"+
    ".scene.amb-in #choices button:nth-child(2){animation-delay:.04s}.scene.amb-in #choices button:nth-child(3){animation-delay:.08s}"+
    ".scene.amb-in #choices button:nth-child(4){animation-delay:.12s}.scene.amb-in #choices button:nth-child(n+5){animation-delay:.16s}"+
    "#interact.amb-ready{animation:amb-key 1.5s ease-in-out infinite}"+
    "#interact.amb-ready kbd{display:inline-block;animation:amb-kbd 1.5s ease-in-out infinite}"+
    "#interact.amb-pop{animation:amb-pop .28s ease-out}"+
    "@media (prefers-reduced-motion:reduce){.amb-in,.scene.amb-in #choices button,#interact.amb-ready,#interact.amb-ready kbd,#interact.amb-pop{animation:none}}";
  document.head.append(style);
})();
