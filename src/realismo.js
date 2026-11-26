// Realismo: luce che segue l'ora del giorno, ombre degli edifici e degli alberi, lampioni accesi di sera.
// Lo stato non entra nei salvataggi: la luce segue l'orologio del dispositivo (come le battute con l'orario).
// Per provare un'ora precisa: window.realismoOra = 18.5 (null per tornare all'orologio vero).

const realismoChiave="ultimo-posto-realismo";
let realismoAttivo=true;
try{realismoAttivo=localStorage.getItem(realismoChiave)!=="off";}catch{}
function realismoImposta(on){
  realismoAttivo=!!on;
  try{localStorage.setItem(realismoChiave,on?"on":"off");}catch{}
}

// Ora decimale locale (override per i test).
function realismoOraCorrente(){
  if(typeof window.realismoOra==="number")return window.realismoOra;
  const d=new Date();return d.getHours()+d.getMinutes()/60;
}

// Fotogrammi chiave: [ora, colore moltiplicato, intensità dei lampioni 0-1, intensità delle ombre 0-1, vignetta 0-1]
const realismoFasi=[
  [0,   [138,152,198],1,0.00,.30],
  [5.5, [146,158,200],1,0.00,.28],
  [6.6, [255,205,170],.45,.55,.20],
  [8,   [255,247,236],0,.80,.12],
  [12,  [255,255,255],0,.60,.08],
  [16,  [255,249,238],0,.80,.12],
  [18,  [255,208,152],.25,.95,.18],
  [19.6,[214,160,156],.75,.55,.24],
  [21,  [140,153,198],1,.10,.30],
  [24,  [138,152,198],1,0.00,.30]
];
function realismoLuce(){
  const h=((realismoOraCorrente()%24)+24)%24;
  let i=0;while(i<realismoFasi.length-2&&h>=realismoFasi[i+1][0])i++;
  const a=realismoFasi[i],b=realismoFasi[i+1],t=Math.min(1,Math.max(0,(h-a[0])/(b[0]-a[0])));
  const mix=(x,y)=>x+(y-x)*t;
  return {ora:h,rgb:a[1].map((v,k)=>Math.round(mix(v,b[1][k]))),lampioni:mix(a[2],b[2]),ombre:mix(a[3],b[3]),vignetta:mix(a[4],b[4])};
}

// Altezza stimata (in tile) per gli edifici e le piante.
const realismoAltezza={faculty:2.6,roof:2.2,chapel:3.2,domeHall:2.1,booth:1.3,pillar:1.6,shelter:1.2,tree:1.5,pine:2.4,cypress:2.6};
function realismoEsterno(z,id){try{return typeof ambOutdoor==="function"?!!ambOutdoor(z,id):z.ground!=="floor";}catch{return true;}}

function realismoEnvelope(punti){
  // inviluppo convesso (monotone chain)
  const p=punti.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lower=[];for(const q of p){while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],q)<=0)lower.pop();lower.push(q);}
  const upper=[];for(let k=p.length-1;k>=0;k--){const q=p[k];while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],q)<=0)upper.pop();upper.push(q);}
  lower.pop();upper.pop();return lower.concat(upper);
}

// Ombre: chiamata da worldView prima di disegnare gli oggetti (coordinate in pixel di mondo, tile da 16).
var realismoGiocatore={x:0,y:0};
function realismoOmbre(c,z,id,left,top,right,bottom,now){
  if(!realismoAttivo||z.ground==="floor"||!realismoEsterno(z,id))return;
  const luce=realismoLuce();
  if(luce.ombre<=.02)return;
  // il sole è a est al mattino e a ovest nel pomeriggio: l'ombra va verso il lato opposto
  const t=Math.max(-1,Math.min(1,(luce.ora-12)/6.5));
  const lung=.35+1.05*t*t;
  const dx=t*1.55*lung/(.35+1.05*t*t||1)*Math.min(1,.45+Math.abs(t)),dy=.5+.25*(1-Math.abs(t));
  const alpha=.30*luce.ombre;
  c.save();
  c.fillStyle="rgba(22,28,52,"+alpha.toFixed(3)+")";
  // persone e animali: ombra ovale ai piedi, inclinata come le altre
  const piedi=(fx,fy,r)=>{c.beginPath();c.ellipse(fx*16+dx*5,fy*16+1.5+dy*2,r*(1+Math.abs(t)*.6),r*.38,0,0,Math.PI*2);c.fill();};
  piedi(realismoGiocatore.x+.5,realismoGiocatore.y+.9,5.5);
  for(const o of zoneObjects(z).objects){
    if(isVehicle(o)||kindLayer(o)!=="persone")continue;
    let p=o;try{p=positionOf(o,now||0,z.width);}catch{}
    if(p.x+1<left||p.x>right||p.y+1<top||p.y>bottom)continue;
    piedi(p.x+(p.w||1)/2,p.y+(p.h||1)*.94,o.kind==="boar"?8:5.5);
  }
  for(const o of zoneObjects(z).objects){
    const alt=realismoAltezza[o.kind];
    if(!alt)continue;
    if(o.x+o.w<left||o.x>right||o.y+o.h<top-4||o.y>bottom+4)continue;
    const w=o.w,h=o.h,x=o.x,y=o.y;
    const sx=dx*alt*lung,sy=dy*alt*lung;
    if(o.kind==="tree"||o.kind==="pine"||o.kind==="cypress"){
      const cx=(x+w/2)*16,cy=(y+h*.88)*16;
      const rx=(w*.5+.35)*16*(o.kind==="cypress"?.5:1),ry=rx*.5;
      c.beginPath();
      c.ellipse(cx+sx*8,cy+sy*8,rx,ry,Math.atan2(sy,sx||.001)*.35,0,Math.PI*2);
      c.fill();
      continue;
    }
    const base=[[x,y+h*.45],[x+w,y+h*.45],[x+w,y+h],[x,y+h]];
    const pts=[];for(const [px,py] of base){pts.push([px,py]);pts.push([px+sx*.55,py+sy*.55]);}
    const hull=realismoEnvelope(pts);
    c.beginPath();hull.forEach(([px,py],k)=>k?c.lineTo(px*16,py*16):c.moveTo(px*16,py*16));c.closePath();c.fill();
  }
  c.restore();
}

// Luce globale: moltiplica il colore dell'ora, accende i lampioni, aggiunge una vignetta leggera.
function realismoLuceMondo(c,z,id,camX,camY,vw,vh,now){
  if(!realismoAttivo||z.ground==="floor"||!realismoEsterno(z,id))return;
  const luce=realismoLuce();
  const [r,g,b]=luce.rgb;
  c.save();
  if(r<250||g<250||b<250){
    c.globalCompositeOperation="multiply";
    c.fillStyle="rgb("+r+","+g+","+b+")";
    c.fillRect(camX,camY,vw,vh);
  }
  // lampioni accesi
  if(luce.lampioni>.04){
    c.globalCompositeOperation="lighter";
    const flick=typeof reducedMotion!=="undefined"&&reducedMotion?0:Math.sin(now/280)*.03;
    for(const o of zoneObjects(z).objects){
      if(o.kind!=="lamp")continue;
      const px=(o.x+.5)*16,py=(o.y+.2)*16;
      if(px<camX-40||px>camX+vw+40||py<camY-40||py>camY+vh+40)continue;
      const R=34,grad=c.createRadialGradient(px,py,1,px,py,R);
      const a=Math.max(0,luce.lampioni*(.55+flick));
      grad.addColorStop(0,"rgba(255,214,140,"+(a*.85).toFixed(3)+")");
      grad.addColorStop(.45,"rgba(255,170,90,"+(a*.30).toFixed(3)+")");
      grad.addColorStop(1,"rgba(255,150,60,0)");
      c.fillStyle=grad;c.fillRect(px-R,py-R,R*2,R*2);
    }
  }
  // vignetta
  if(luce.vignetta>.02){
    c.globalCompositeOperation="source-over";
    const cx=camX+vw/2,cy=camY+vh/2,R=Math.hypot(vw,vh)*.62;
    const grad=c.createRadialGradient(cx,cy,R*.45,cx,cy,R);
    grad.addColorStop(0,"rgba(8,12,24,0)");
    grad.addColorStop(1,"rgba(8,12,24,"+(luce.vignetta*.85).toFixed(3)+")");
    c.fillStyle=grad;c.fillRect(camX,camY,vw,vh);
  }
  c.restore();
}
