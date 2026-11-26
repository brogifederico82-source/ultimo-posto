// Colori vivaci: ritocco della palette e grading leggero del canvas.
// Le funzioni sono hoisted; i const di questo file non vengono usati prima del caricamento.
const vividPreferenceKey="ultimo-posto-colori-vivaci";
let vividOn=true;
try{vividOn=localStorage.getItem(vividPreferenceKey)!=="off";}catch{}
const vividCache=new Map();
function vividHex(hex){
  if(!vividOn||typeof hex!=="string"||hex[0]!=="#"||(hex.length!==7&&hex.length!==9))return hex;
  const hit=vividCache.get(hex);
  if(hit)return hit;
  const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
  let l=(max+min)/2,s=d?d/(1-Math.abs(2*l-1)):0,h=0;
  if(d){
    if(max===r)h=((g-b)/d+6)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;
    h*=60;
  }
  if(s<.07&&l>.1&&l<.92){
    // grigi piatti: tinta calda (pietra) nelle luci, blu tenue nelle ombre
    const warm=l>.34;
    h=warm?34:220;s=warm?.1+.1*(l-.34):.1;
  }else if(s>=.07){
    if(h>=110&&h<=195)h-=14*Math.max(0,1-Math.abs(h-150)/45);
    const warmLight=h>=25&&h<=65&&l>.55;
    s=Math.min(warmLight?.46:.85,s*1.1+.04*(1-s));
  }
  if(l>.12&&l<.9)l=Math.min(.95,Math.max(.04,.5+(l-.5)*1.05+.006));
  const k=(1-Math.abs(2*l-1))*s,x=k*(1-Math.abs((h/60)%2-1)),m=l-k/2;
  const [R,G,B]=h<60?[k,x,0]:h<120?[x,k,0]:h<180?[0,k,x]:h<240?[0,x,k]:h<300?[x,0,k]:[k,0,x];
  const out="#"+[R,G,B].map(v=>Math.round(Math.min(1,Math.max(0,v+m))*255).toString(16).padStart(2,"0")).join("")+hex.slice(7);
  vividCache.set(hex,out);
  return out;
}
// Grading del canvas: filtro CSS leggero, diverso per zona (se non supportato non succede nulla).
let vividGradeKey="";
function vividGrade(zoneId){
  const el=document.getElementById("stage");
  if(!el)return;
  const key=(vividOn?"on:":"off:")+zoneId;
  if(key===vividGradeKey)return;
  vividGradeKey=key;
  let filter="";
  if(vividOn){
    let ground="";
    try{ground=room(zoneId).ground;}catch{}
    filter=ground==="grass"?"contrast(1.06) saturate(1.06) brightness(1.02)"
      :ground==="road"?"contrast(1.06) saturate(1.06)"
      :"contrast(1.06) saturate(1.04) sepia(.04) brightness(1.04)";
  }
  try{el.style.filter=filter;}catch{}
}
function setVividColors(on){
  vividOn=!!on;vividCache.clear();vividGradeKey="";
  try{localStorage.setItem(vividPreferenceKey,on?"on":"off");}catch{}
  try{minimapCache=new WeakMap();}catch{}
}
(function initVividOption(){
  const box=document.getElementById("vividColors");
  if(!box)return;
  box.checked=vividOn;
  box.onchange=()=>setVividColors(box.checked);
})();
