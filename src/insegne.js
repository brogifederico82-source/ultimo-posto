// Insegne: font a pixel per tutte le scritte dipinte nel mondo, autobus con livrea e display, cartelli con pittogrammi,
// vetrine e insegne degli edifici del campus. Ganci in world.js: insegnaFont, insegnaAutobus, insegnaCartello, insegnaEdificio.
try{document.fonts?.load("700 8px 'Pixelify Sans'");document.fonts?.load("8px 'Press Start 2P'");}catch{}

function insegnaFont(px,titolo){
  return titolo?px+"px 'Press Start 2P','Pixelify Sans',monospace":"700 "+px+"px 'Pixelify Sans',ui-monospace,monospace";
}
// Testo con contorno scuro (leggibile su ogni sfondo). Coordinate già in pixel reali.
function insegnaTesto(c,txt,x,y,px,fill,maxW,contorno="#141a22",titolo=false){
  c.save();c.font=insegnaFont(px,titolo);c.textAlign="center";c.textBaseline="middle";
  if(contorno){c.fillStyle=contorno;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])c.fillText(txt,x+dx,y+dy,maxW);}
  c.fillStyle=fill;c.fillText(txt,x,y,maxW);c.restore();
}

// Autobus 360 / navetta: porte a soffietto, fascia livrea, display a LED, fari. Chiamata dopo la sagoma base (spazio 16x16 scalato).
function insegnaAutobus(c,o,w,h,now){
  const bus=o.kind==="bus",box=(t,a,b,ww,hh)=>{c.fillStyle=t;c.fillRect(a,b,ww,hh);};
  // porte
  for(const px of bus?[4.1,9.1]:[5.2,10.2]){box("#2c3a3f",px,4,1.7,7.6);box("#93aab0",px+.15,4.2,.6,4);box("#93aab0",px+.95,4.2,.6,4);}
  // fascia bassa e gonne
  box(bus?"#f0e2bb":"#2a4a6d",.4,11.1,15.2,.55);
  box("#1b2224",.3,13.2,15.4,.8);
  // ruote
  for(const wx of bus?[2.2,11.2]:[2.6,10.6]){box("#14191b",wx,12.1,2.8,2.3);box("#8c969a",wx+.7,12.8,1.4,.9);}
  // fari e luci posteriori (lampeggio freno)
  box("#fff6c4",15.1,10.2,.9,1);box(o.braking?"#ff6b52":"#9e3a34",0,10.2,.9,1);
  // display a LED sul parabrezza anteriore
  box("#0d1114",11.4,2.4,4.3,1.1);
  c.save();c.scale(16/w,16/h);
  if(o.look==="left"){c.translate(w,0);c.scale(-1,1);}
  const lamp=Math.floor((now||0)/520)%2===0?"#ffbf45":"#ffa72b";
  insegnaTesto(c,bus?"360 ROMANIA":"LUISS",w*.5,h*.19,Math.max(3,h*.26),lamp,w*.55,null);
  c.restore();
}

// Cartelli: palo e tabella con colore e parola per tipo. box(colore,x,y,w,h) già legato al contesto 16x16.
const insegnaTipi=[
  [/mensa|menù/i,"MENSA","#b5562c"],[/bar e|bar del|terrazza/i,"BAR","#7a4a2a"],[/radio|busta/i,"RADIO","#a8343a"],
  [/fermata|navetta|360|bus/i,"BUS","#2f5f93"],[/green mobility|car sharing|auto/i,"EV","#2f7f58"],
  [/orto|impollinatori|giardino|pini|passeggiata|tavoli/i,"VERDE","#3f7b46"],[/tutorato/i,"TUTOR","#6a4f95"],
  [/dome/i,"DOME","#2b6d78"],[/a200|programma|aula/i,"A200","#5c4a86"],[/loft/i,"LOFT","#c26a2a"],
  [/piano\s*(\d)/i,null,"#46576a"],[/parenzo|pola/i,"SEDE","#5a3d32"],[/panama|romania|via|viale|ingresso|indicazioni/i,"VIA","#34567a"],
  [/menu|bacheca/i,"AVVISI","#7b5c32"]
];
function insegnaCartello(c,o,box){
  let tipo=insegnaTipi.find(t=>t[0].test(o.name||""));
  const piano=(o.name||"").match(/Piano\s*(\d)/i);
  const txt=piano?"P"+piano[1]:tipo?.[1]??"?",col=tipo?.[2]??"#4b5a63";
  box("#222a2d",7.4,8,1.3,8);box("#222a2d",5.7,15,4.7,1);               // palo e base
  box("#1b2224",1.4,1.2,13.2,8.4);box(col,2,1.8,12,7.2);               // cornice e tabella
  box("#ffffff40",2,1.8,12,1.1);box("#00000030",2,7.9,12,1.1);          // luce e ombra
  box("#f4ead2",2.6,2.4,10.8,.35);
  c.save();c.scale(1,1);
  const tw=(o.name||"").includes("→")?"→":"";
  c.restore();
  return {txt,col};
}
// Il testo del cartello va disegnato a risoluzione reale: lo chiama il gancio dopo c.scale(16/w,16/h).
function insegnaCartelloTesto(c,txt,w,h){
  c.save();c.scale(16/w,16/h);
  insegnaTesto(c,txt,w/2,h*.34,Math.max(3.5,Math.min(h*.2,w*.9/Math.max(3,txt.length)*1.5)),"#fff6dd",w*.8,"#10151a");
  c.restore();
}

// Insegne degli edifici: nome su targa, tenda e vetrina del bar, spia ON AIR della radio. Spazio reale in pixel (w,h).
const insegnaEdifici=[
  [/^Bar del campus/,{testo:"BAR",colore:"#7a2f3a",tenda:["#c4564a","#f2e2c0"],vetrina:true}],
  [/^Radio Luiss/,{testo:"RADIO LUISS",colore:"#3a2542",onair:true}],
  [/^The Dome 1/,{testo:"THE DOME 1",colore:"#1f4a54"}],
  [/^The Dome 2/,{testo:"THE DOME 2",colore:"#1f4a54"}],
  [/^A200/,{testo:"A200",colore:"#40306a"}],
  [/^Corpo aule/,{testo:"AULE",colore:"#37495a"}],
  [/^Edificio principale · Facciata/,{testo:"LUISS · CAMPUS",colore:"#1f3c63"}],
  [/^Guardiola di Viale Romania|^Guardiola$/,{testo:"PORTINERIA",colore:"#3d3a2f"}],
  [/^Palazzina rosa/,{testo:"RESIDENZE",colore:"#6a3b3a"}]
];
function insegnaEdificio(c,o,w,h,now){
  const d=insegnaEdifici.find(e=>e[0].test(o.name||""));
  if(!d)return;
  const cfg=d[1],y0=o.kind==="domeHall"?h*.5:h*.80;
  c.save();c.scale(16/w,16/h);
  const bw=Math.min(w*.72,cfg.testo.length*Math.max(4.4,h*.075)+10),bh=Math.max(9,Math.min(14,h*.14)),bx=w/2-bw/2,by=Math.min(h-bh-2,y0-bh/2);
  if(cfg.tenda){
    const ty=by+bh+1,tw=w*.8,tx=w/2-tw/2,n=Math.round(tw/7);
    for(let i=0;i<n;i++){c.fillStyle=cfg.tenda[i%2];c.fillRect(tx+i*tw/n,ty,tw/n+.4,5);}
    c.fillStyle="#00000044";c.fillRect(tx,ty+5,tw,1.5);
  }
  c.fillStyle="#12171b";c.fillRect(bx-1,by-1,bw+2,bh+2);
  c.fillStyle=cfg.colore;c.fillRect(bx,by,bw,bh);
  c.fillStyle="#ffffff30";c.fillRect(bx,by,bw,1);
  insegnaTesto(c,cfg.testo,w/2,by+bh/2+.5,Math.min(bh*.72,8),"#fff1cf",bw-4,null);
  if(cfg.vetrina){
    const vy=by+bh+8;
    for(const vx of [w*.2,w*.62]){c.fillStyle="#1c2830";c.fillRect(vx,vy,w*.18,Math.max(5,h*.12));c.fillStyle="#f6d98e66";c.fillRect(vx+1,vy+1,w*.18-2,Math.max(3,h*.12-2));}
    c.fillStyle="#f0c36a";c.fillRect(w*.23,vy+Math.max(5,h*.12)-3,3,2);c.fillRect(w*.27,vy+Math.max(5,h*.12)-3,3,2);
  }
  if(cfg.onair){
    const on=Math.floor((now||0)/700)%2===0;
    c.fillStyle="#12171b";c.fillRect(w-26,by-12,22,9);
    c.fillStyle=on?"#ff4a3d":"#6b2622";c.fillRect(w-24,by-10,18,5);
    insegnaTesto(c,"ON AIR",w-15,by-7.5,4,"#fff",20,null);
  }
  c.restore();
}
