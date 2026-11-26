// Playable interpretation of Villa Alberoni. Keep the original portal and story IDs.
function installPola(map){
  const entrance=map.zones.pola, courtyard=map.zones["pola-cortile"];
  if(!entrance||!courtyard)return map;
  const build=(room,width,height,name,layout)=>{
    room.width=width;room.height=height;room.name=name;room.ground="grass";
    layout(room.objects);
  };
  const piece=(objects,uid,kind,x,y,w=1,h=1,extra={})=>{
    const spec=assets[kind];
    objects.push({uid,kind,name:spec[1],x,y,w,h,color:spec[3],solid:Boolean(spec[6]),...extra});
  };
  const stock=(room,id,width,height)=>{
    if(room.width!==width||room.height!==height)return false;
    const sources=originalPolaStock[id];
    return sources.some(source=>room.objects.length===source.size&&room.objects.every(o=>
      JSON.stringify(o)===source.get(o.uid)));
  };
  const original=(room,id,x,y)=>({...room.objects.find(o=>o.uid===id),x,y});
  if(stock(entrance,"pola",22,14)){
    const entries=[
      original(entrance,"pola-arrival",20,28),
      original(entrance,"pola-back",19,30),
      original(entrance,"pola-interior-return",23,9),
      {...original(entrance,"pola-inside",23,8),name:"Cortile della laurea"},
      {...original(entrance,"pola-info",19,25),name:"Viale Pola 12",text:"Villa Alberoni è in cima alla salita. Per il Tinello e il ninfeo del Nilo, prendi il vialetto a sinistra."}
    ];
    entrance.objects=[];
    build(entrance,44,32,"Viale Pola 12 · Villa Alberoni",objects=>{
      const add=(id,...args)=>piece(objects,"pola-"+id,...args);
      add("strada","road",0,30,44,2);
      add("marciapiede","paving",0,28,44,2,{color:"#a59a8d"});
      add("varco","paving",19,24,4,5,{color:"#c2ad8a"});
      add("salita","path",19,11,5,14,{color:"#b8a281"});
      for(const [i,y] of [12,16,21].entries()){
        add("gradinata-"+i,"stairs",19,y,5,1,{solid:false,color:"#a69377"});
      }
      add("terrazza","paving",13,8,21,5,{color:"#bcab8d"});
      add("sentiero-tinello","path",6,18,14,3,{color:"#b8a281"});
      add("sentiero-giardino","path",24,16,16,3,{color:"#b8a281"});
      add("via-alta","path",34,12,3,9);
      add("piazza-tinello","paving",3,13,13,9,{color:"#ad9d81"});
      add("bordo-cancello-ovest","wall",0,26,18,1);
      add("bordo-cancello-est","wall",24,26,20,1);
      add("pilastro-ovest","pillar",18,25,1,2);
      add("pilastro-est","pillar",23,25,1,2);
      add("villa","polaVilla",13,2,21,6,{name:"Villino di Villa Alberoni"});
      add("tinello","polaNinfeo",4,13,10,5,{name:"Tinello Alberoni · Ninfeo del Nilo"});
      add("targa-nilo","sign",13,19,1,1,{name:"Il Nilo e i Tritoni",action:"event",
        text:"Nel ninfeo del Tinello il Nilo riposa fra due Tritoni. La costruzione circolare conserva la memoria del giardino settecentesco degli Alberoni."});
      add("portinaia","guard",24,24,1,1,{name:"Portineria · Villa Alberoni",action:"dialog",
        text:"«La festa è sopra, nel cortile. Se siete in anticipo fate un giro al Tinello. Il Nilo almeno sa aspettare.»"});
      add("auto-parcheggiata","car",25,28,2,1,{name:"Auto del car sharing",color:"#527584"});
      for(const [i,x,y] of [[0,7,23],[1,12,6],[2,2,10],[3,5,6],[4,30,21],[5,37,21],[6,39,6],[7,40,24],[8,2,23]]){
        add("pino-"+i,"pine",x,y,3,3,{solid:false});
      }
      for(const [i,x,y] of [[0,17,13],[1,25,13],[2,17,21],[3,25,21],[4,5,21],[5,35,19]]){
        add("aiuola-"+i,"flowers",x,y,2,1);
      }
      for(const [i,x,y] of [[0,18,23],[1,24,20],[2,18,15],[3,24,12],[4,4,20],[5,36,16]]){
        add("lanterna-"+i,"lamp",x,y);
      }
      add("panca-tinello","bench",7,21,2,1);
      add("panca-terrazza","bench",28,10,2,1);
      add("panca-giardino","bench",37,19,2,1);
      add("terrazzo-ovest","hedge",3,12,10,1);
      add("terrazzo-est","hedge",30,20,9,1);
      objects.push(...entries);
    });
  }
  if(stock(courtyard,"pola-cortile",28,16)){
    const entries=[
      original(courtyard,"pola-cortile-arrive",13,19),
      original(courtyard,"pola-cortile-exit",13,21),
      original(courtyard,"pola-cortile-npc",13,6)
    ];
    courtyard.objects=[];
    build(courtyard,36,23,"Pola · Cortile della laurea",objects=>{
      const add=(id,...args)=>piece(objects,"pola-cortile-"+id,...args);
      add("terrazza","paving",3,4,30,13,{color:"#aa937c"});
      add("viale","path",11,16,5,6,{color:"#c1a582"});
      add("tappeto","paving",11,6,5,10,{color:"#905b51"});
      add("pedana","floor",10,3,7,3,{color:"#98704e"});
      add("festone-ovest","polaLights",3,5,8,1);
      add("festone-est","polaLights",17,5,15,1);
      add("festone-fondo","polaLights",5,15,24,1);
      add("buffet","polaBuffet",20,7,7,2,{name:"Tavolo del brindisi",action:"dialog",
        text:"Bicchieri in fila e una torta già tagliata. Il cartellino dice «Lasciarne un pezzo al laureando». Qualcuno ha sottolineato «un»."});
      add("foto","student",28,10,1,1,{name:"Fotografa della serata",action:"native",native:"pola-foto"});
      add("ospite","student",8,10,1,1,{name:"Compagno di corso",action:"dialog",text:"«Sono arrivato dieci minuti prima. È la prima volta in tre anni. Vale come crescita personale?»"});
      add("quartetto","student",17,7,1,1,{name:"Ospite vicino alla pedana",action:"dialog",text:"«Avevo detto musica d’ambiente. Ora mi stanno chiedendo la sigla del podcast.»"});
      for(const [i,x,y] of [[0,6,4],[1,28,4],[2,5,17],[3,25,17],[4,31,11]]){
        add("fioriera-"+i,"flowers",x,y,2,1,{color:"#be8668"});
      }
      for(const [i,x,y] of [[0,7,12],[1,20,12],[2,27,13]]){
        add("tavolo-"+i,"desk",x,y,2,1,{color:"#c6ad8d"});
      }
      add("fontana","fountain",4,7,2,2,{color:"#79a5a4"});
      for(const [i,x,y] of [[0,5,10],[1,8,14],[2,22,14],[3,28,16],[4,30,9]]){
        add("lanterna-"+i,"lamp",x,y,1,1,{color:"#bc9759"});
      }
      for(const [i,x,y] of [[0,3,18],[1,7,19],[2,29,18],[3,31,15]]){
        add("vaso-"+i,"bush",x,y,1,1,{color:"#547b60"});
      }
      add("siepe-ovest","hedge",2,3,1,13);
      add("siepe-est","hedge",33,3,1,13);
      add("gradino","stairs",12,18,3,1,{solid:false});
      objects.push(...entries);
    });
  }
  return map;
}

function paintPolaLandmark(c,o,box,now){
  if(o.kind==="polaVilla"){
    box("#373841",0,3,16,13);box("#a78464",1,5,14,10);
    box("#dec4a0",1,6,14,7);box("#c4a984",1,11,14,2);
    box("#7f5247",1,2,14,4);box("#aa6d57",2,1,12,3);box("#c68b6d",3,1,10,1);
    for(const x of [2,4,11,13]){
      box("#9d816c",x,7,1,4);box("#424b51",x,7,1,2);
      box("#7a999a",x,7,1,1);box("#f3d1a0",x,10,1,1);
    }
    box("#eacdab",6,5,4,8);box("#ae977b",6,7,4,1);box("#655451",7,8,2,5);
    box("#f4d9ab",6,6,1,7);box("#f4d9ab",9,6,1,7);
    box("#bca785",5,13,6,1);box("#cbb693",4,14,8,1);box("#a18e76",3,15,10,1);
    return;
  }
  if(o.kind==="polaNinfeo"){
    box("#3c4946",0,5,16,9);box("#8d806b",1,4,14,9);box("#b4a285",2,2,12,3);
    box("#cbb799",4,1,8,2);box("#dfc7a1",3,3,10,2);
    box("#514f49",3,5,10,6);box("#343e40",4,6,8,5);
    for(const x of [1,14]){
      box("#c5b595",x,4,1,8);box("#86765f",x,7,1,2);
    }
    const stone=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    // Reclining Nile, with small figures at either side of the basin.
    stone("#777464",5.2,9,6.2,1);
    stone("#b4a388",5.7,8.3,4.2,.8);
    stone("#c8b99c",6.6,7.5,3.1,1.2);
    stone("#e0c9a9",8.5,6.5,1.2,1.2);
    stone("#b9a389",8.4,7.4,.6,1);
    for(const x of [4.4,11]){
      stone("#c2ab8e",x,7.2,.7,.65);
      stone("#ae9c83",x-.15,7.9,1,1.5);
      stone("#dac5a5",x-.35,8.1,1.35,.45);
    }
    box("#445c5c",1,11,14,4);box("#6d9f9b",2,11,12,2);
    box("#b9aa8f",1,13,14,1);box("#d9c4a5",2,14,12,1);
    const phase=Math.floor(now/170)%3;
    box("#a9dcda",3+phase,11,2,1);box("#b6e3de",10-phase,12,2,1);
    box("#d2e6d8",4,10,1,1);box("#d2e6d8",11,10,1,1);
    return;
  }
  if(o.kind==="polaBuffet"){
    box("#56483f",0,6,16,9);box("#dad0b8",0,4,16,7);box("#ae9a8b",0,10,16,3);
    for(const x of [2,4,6,11,13]){
      box("#7d544b",x,6,1,2);box("#efcc8a",x,5,1,1);
    }
    box("#8c6757",8,5,2,3);box("#e6b99c",8,5,2,1);
    return;
  }
  c.fillStyle="#5f4940";
  c.fillRect(0,5,16,.6);
  for(let i=0;i<12;i++){
    c.fillStyle=Math.floor(now/420+i)%4===0?"#eab579":"#ffe1a1";
    c.fillRect(.5+i*1.25,5.4+(i%2)*.5,.55,1.4);
  }
}
