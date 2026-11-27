// Quartiere reale: sostituisce l'esterno di "pola" e "parenzo" con la geometria vera (impronte degli edifici, strade, marciapiedi, verde)
// ricavata da Overture Maps tramite scripts/overture/to-zone.py (dati in quartiere-dati.js, 3 m per tessera).
// Gli oggetti della storia (porte, ingressi, cartelli, NPC) restano gli stessi, con id e azioni invariati, ma ricollocati sulle strade e sugli edifici veri.
// Attenzione: niente const/let a livello di file: queste funzioni girano mentre world.js viene ancora eseguito.

function quartiereTerreno(righe,w,h){
  // unisce le tessere uguali in rettangoli (prima per righe, poi per colonne uguali)
  const out=[];
  for(const tipo of ["p","r","a"]){
    const aperti=new Map();
    const chiudi=(chiave)=>{out.push(aperti.get(chiave));aperti.delete(chiave);};
    for(let y=0;y<=h;y++){
      const viste=new Set();
      if(y<h){
        let x=0;
        while(x<w){
          if(righe[y][x]!==tipo){x++;continue;}
          let x2=x;while(x2<w&&righe[y][x2]===tipo)x2++;
          const chiave=x+","+(x2-x);viste.add(chiave);
          const a=aperti.get(chiave);
          if(a&&a.y+a.h===y)a.h++;else{if(a)chiudi(chiave);aperti.set(chiave,{t:tipo,x,y,w:x2-x,h:1});}
          x=x2;
        }
      }
      for(const chiave of [...aperti.keys()])if(!viste.has(chiave))chiudi(chiave);
    }
  }
  return out;
}

function installQuartiere(map){
  const dati=quartiereDati();
  for(const id of ["pola","parenzo"]){
    const z=map.zones[id],d=dati[id];
    if(!z||!d||(z.width===d.w&&z.height===d.h&&z.objects.some(o=>o.uid.startsWith("q-"))))continue;
    const tieni=z.objects.filter(o=>!o.uid.startsWith("q-")&&(o.action||o.kind==="entrance"||o.kind==="door"));
    const solidi=[];                                   // rettangoli occupati: edifici e alberi
    const oggetti=[];
    const colori={p:"#a59a8d",r:"#6a6c6e",a:"#b8a281"};
    const nomiTerreno={p:["paving","Marciapiede e spiazzi"],r:["road","Strada"],a:["path","Sentiero"]};
    for(const t of quartiereTerreno(d.righe,d.w,d.h)){
      oggetti.push({uid:"q-"+id+"-"+nomiTerreno[t.t][0]+"-"+oggetti.length,kind:nomiTerreno[t.t][0],name:nomiTerreno[t.t][1],x:t.x,y:t.y,w:t.w,h:t.h,color:colori[t.t],solid:false});
    }
    d.edifici.forEach((e,n)=>{
      const k=e.k==="f"?"faculty":"roof";
      oggetti.push({uid:"q-"+id+"-edificio-"+n,kind:k,name:e.n||(e.k==="f"?"Edificio in cotto":"Edificio"),x:e.x,y:e.y,w:e.w,h:e.h,color:e.c,solid:true});
      solidi.push([e.x,e.y,e.w,e.h]);
    });
    d.alberi.forEach(([x,y,tipo],n)=>{
      const pino=tipo==="pine";
      oggetti.push({uid:"q-"+id+"-"+tipo+"-"+n,kind:tipo,name:pino?"Pino":"Albero",x,y,w:pino?3:1,h:pino?3:1,color:pino?"#526d49":"#4c7553",solid:!pino});
      if(!pino)solidi.push([x,y,1,1]);
    });
    d.lampioni.forEach(([x,y],n)=>oggetti.push({uid:"q-"+id+"-lampione-"+n,kind:"lamp",name:"Lampione",x,y,w:1,h:1,color:"#d2ac66",solid:false}));
    d.stagni.forEach(([x,y],n)=>{oggetti.push({uid:"q-"+id+"-fontana-"+n,kind:"fountain",name:"Fontana",x,y,w:2,h:2,color:"#699b9b",solid:true});solidi.push([x,y,2,2]);});
    d.insegne.forEach(([x,y,nome],n)=>oggetti.push({uid:"q-"+id+"-via-"+n,kind:"sign",name:nome,x,y,w:1,h:1,color:"#2a56a8",solid:false,action:"event",text:nome+"."}));
    // libero = tessera percorribile e non occupata
    const occupato=(x,y)=>x<0||y<0||x>=d.w||y>=d.h||d.righe[y][x]==="B"||solidi.some(([a,b,w,h])=>x>=a&&x<a+w&&y>=b&&y<b+h);
    const usati=new Set();
    const libera=(x,y)=>{
      for(let r=0;r<14;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
        if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
        const a=x+dx,b=y+dy;
        if(occupato(a,b)||usati.has(a+","+b)||d.righe[b][a]==="r")continue;
        usati.add(a+","+b);return [a,b];
      }
      return [x,y];
    };
    const posa=(o,x,y)=>{const [a,b]=libera(x,y);o.x=a;o.y=b;o.w=1;o.h=1;return o;};
    const porta=d.porta||[Math.floor(d.w/2),Math.floor(d.h/2)],arrivo=d.arrivo||porta,ritorno=d.ritorno||porta;
    usati.add(porta.join(","));usati.add(arrivo.join(","));usati.add(ritorno.join(","));
    const prima=new Map(z.objects.map(o=>[o.uid,o]));
    const sposta=(uid,xy,fisso)=>{const o=prima.get(uid);if(!o)return;if(fisso){o.x=xy[0];o.y=xy[1];o.w=1;o.h=1;}else posa(o,xy[0],xy[1]);};
    sposta(id+"-inside",porta,true);sposta(id+"-interior-return",ritorno,true);sposta(id+"-arrival",arrivo,true);
    sposta(id+"-back",[arrivo[0]+1,arrivo[1]]);sposta(id+"-info",[arrivo[0]-1,arrivo[1]]);
    for(const o of tieni){
      if([id+"-inside",id+"-interior-return",id+"-arrival",id+"-back",id+"-info"].includes(o.uid))continue;
      if(o.uid===id+"-villa")continue;                    // vecchia villa disegnata a mano: ora c'è l'edificio vero
      posa(o,porta[0]+2,porta[1]+2);                      // gli altri oggetti narrativi si dispongono attorno alla porta
    }
    if(id==="pola"&&!tieni.some(o=>o.uid==="giardini-vivi-pola")){
      // Noemi (campus-life.js la metteva nel giardino di Villa Alberoni): resta nel prato accanto alla villa
      tieni.push(posa({uid:"giardini-vivi-pola",kind:"student",name:"Noemi · Giardino di Villa Alberoni",color:"#a2865c",solid:false,
        action:"dialog",native:"",text:"",target:"",behavior:"idle",speed:1.05,route:[],rotation:0,variant:0,gate:"",missionTarget:"",auto:false},porta[0]-3,porta[1]-3));
    }
    z.objects=[...oggetti,...tieni.filter(o=>o.uid!==id+"-villa")];
    z.width=d.w;z.height=d.h;z.ground="grass";z.name=d.nome;
  }
  return map;
}

// Dopo Lore, Idee e Segreti: sposta in una tessera libera gli oggetti che sono finiti dentro un edificio, un albero o fuori mappa.
function quartiereRifinisci(map){
  for(const id of ["pola","parenzo"]){
    const z=map.zones[id];
    if(!z||!z.objects.some(o=>o.uid.startsWith("q-")))continue;
    const solidi=z.objects.filter(o=>o.solid&&(o.kind==="roof"||o.kind==="faculty"||o.kind==="tree"||o.kind==="fountain"));
    const dentro=(x,y)=>x<0||y<0||x>=z.width||y>=z.height||solidi.some(s=>x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h);
    const strade=z.objects.filter(o=>o.kind==="road");
    const su=(x,y,lista)=>lista.some(s=>x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h);
    const presi=new Set(z.objects.filter(o=>o.kind==="door"||o.kind==="entrance"||o.action).map(o=>o.x+","+o.y));
    for(const o of z.objects){
      if(o.uid.startsWith("q-")||o.kind==="door"||o.kind==="entrance")continue;
      if(!dentro(o.x,o.y)&&!su(o.x,o.y,strade))continue;
      let fatto=false;
      for(let r=1;r<20&&!fatto;r++)for(let dy=-r;dy<=r&&!fatto;dy++)for(let dx=-r;dx<=r&&!fatto;dx++){
        if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
        const a=o.x+dx,b=o.y+dy;
        if(dentro(a,b)||su(a,b,strade)||presi.has(a+","+b))continue;
        o.x=a;o.y=b;presi.add(a+","+b);fatto=true;
      }
    }
  }
  return map;
}
