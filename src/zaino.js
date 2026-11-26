// Zaino: inventario censito e pannello a schermo intero, stile borsa dei videogiochi di ruolo.
// Gli oggetti restano stringhe in state.pockets (carry()/has()); qui li censiamo, li disegniamo (icone 16x16
// in codice) e li mostriamo. Nessun campo di stato nuovo, nessuna regola di gioco cambiata.
// Pubblico: zainoApri(), zainoChiudi(), zainoAperto(), iconaOggetto(nome,dimensione=16), iconaOggettoUrl(nome,dimensione).
// Ganci: tasto B (solo mentre si esplora) e le voci di menu che chiamano zainoApri().
// Le funzioni pubbliche sono dichiarazioni (visibili ovunque); le tabelle interne esistono dopo l'esecuzione del file.
var znCache=null,znOpen=false,znRoot=null,znCat=0,znSel=0,znPrevFocus=null,znSeen="",znLast=0;

// ---------------------------------------------------------------------------
// Icone pixel-art 16x16, disegnate con rettangoli
// ---------------------------------------------------------------------------
const ZN_OUT="#2b1d16";
function znPx(c,col,x,y,w=1,h=1){c.fillStyle=col;c.fillRect(x,y,w,h);}
function znBox(c,x,y,w,h,fill,edge=ZN_OUT){znPx(c,edge,x,y,w,h);znPx(c,fill,x+1,y+1,w-2,h-2);}
function znDisc(c,cx,cy,rad,fill,edge=ZN_OUT){
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){
    const d=Math.hypot(x+.5-cx,y+.5-cy);
    if(d<=rad)znPx(c,d>rad-1.15?edge:fill,x,y);
  }
}
function znGlyph(c,x,y,rows,col){
  rows.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]==="#")znPx(c,col,x+i,y+j);});
}
const ZN_HEART=[".#.#.","#####","#####",".###.","..#.."],ZN_SPADE=["..#..",".###.","#####","#####","..#.."],
  ZN_STAR=["..#..","..#..","#####",".###.","##.##"],ZN_SEVEN=["#####","....#","...#.","..#..","..#.."],
  ZN_QUEST=[".###.","#...#","...#.","..#..","..#.."],ZN_A=["..#..",".#.#.","#####","#...#","#...#"],
  ZN_BANG=["..#..","..#..","..#..",".....","..#.."];
function znCard(c,glyph,col,edge=ZN_OUT,fill="#f6f0dc"){
  znBox(c,3,1,10,14,fill,edge);znGlyph(c,5,5,glyph,col);znPx(c,col,4,2,1,1);znPx(c,col,11,12,1,1);
}
function znToken(c,col,hi,glyph){
  znDisc(c,8,8,7,col);znDisc(c,8,8,4.6,hi,"#00000033");glyph?.(c);
}
function znTray(c,tint="#8e949a"){
  znBox(c,1,8,14,5,tint);znPx(c,"#f1ece0",3,6,10,2);znPx(c,"#d85a3a",5,4,3,2);znPx(c,"#e9c95a",8,4,3,2);znPx(c,"#00000033",2,12,12,1);
}
function znBubble(c,fill,glyph,col){
  znBox(c,2,2,12,9,fill);znPx(c,ZN_OUT,5,11,3,3);znPx(c,fill,5,11,2,2);znGlyph(c,5,4,glyph,col);
}
function znPhone(c,screen){
  znBox(c,4,1,8,14,"#2b2b3a");znPx(c,screen,5,3,6,9);znPx(c,"#fff",7,14,2,1);
}
const ZN_ICONS={
  badge(c){znPx(c,"#2b5aa8",7,0,2,3);znBox(c,3,3,10,12,"#f2ead2");znPx(c,"#6b8fb5",5,5,4,4);znPx(c,"#f2c9a0",6,6,2,2);znPx(c,"#2b5aa8",10,5,2,1);znPx(c,"#2b5aa8",10,7,2,1);znPx(c,"#1d3a6b",4,11,8,3);znPx(c,"#e5ad62",5,12,3,1);},
  coin(c){znDisc(c,8,8,6.5,"#e5ad62","#7a4a1c");znDisc(c,8,8,4,"#f8d782","#c38b45");znPx(c,"#fff0b3",6,5,1,3);znPx(c,"#a8741e",8,6,2,5);},
  apple(c){znDisc(c,8,9.5,5.6,"#d33a2c","#6e1a1a");znPx(c,"#6e1a1a",7,3,2,1);znPx(c,"#5a3b1e",8,1,1,3);znPx(c,"#4f9a3a",9,1,3,2);znPx(c,"#2b6a2a",11,2,1,1);znPx(c,"#f5846f",5,8,2,3);},
  pack(c){znBox(c,4,5,8,10,"#f1ece0");znPx(c,"#c33a2e",4,5,8,3);znPx(c,"#f4ead0",5,1,2,4);znPx(c,"#f4ead0",8,2,2,3);znPx(c,"#d9954f",5,1,2,1);znPx(c,"#d9954f",8,2,2,1);znPx(c,ZN_OUT,5,0,2,1);znPx(c,ZN_OUT,8,1,2,1);znPx(c,"#c33a2e",6,10,4,3);znPx(c,"#f1ece0",7,11,2,1);znPx(c,ZN_OUT,4,14,8,1);},
  packEmpty(c){znBox(c,4,5,8,10,"#d9d4c4");znPx(c,"#8a8578",4,5,8,3);znPx(c,"#8a8578",6,10,4,3);znPx(c,"#d9d4c4",7,11,2,1);znPx(c,ZN_OUT,4,14,8,1);},
  lighter(c){znBox(c,5,6,6,9,"#2f7fa0");znBox(c,5,4,6,3,"#b8bcc0");znPx(c,"#f6b83c",7,0,2,4);znPx(c,"#fff2a8",8,1,1,2);znPx(c,"#e8683a",7,3,1,1);znPx(c,"#6fb6d0",6,8,1,5);},
  iqos(c){znBox(c,6,3,4,12,"#e9e9ec");znBox(c,6,1,4,3,"#2b2b30");znPx(c,"#4fb5a0",7,6,2,2);znPx(c,"#9aa0a8",7,11,2,1);znPx(c,"#fff",7,4,1,1);},
  panino(c){znPx(c,ZN_OUT,2,4,12,11);znPx(c,"#d99a4e",3,5,10,3);znPx(c,"#f0b86a",4,5,6,1);znPx(c,"#f6e3b0",5,6,1,1);znPx(c,"#f6e3b0",8,6,1,1);znPx(c,"#f6e3b0",10,6,1,1);znPx(c,"#7aa84a",3,8,10,2);znPx(c,"#c24b3a",3,10,10,1);znPx(c,"#f0c35a",3,11,10,1);znPx(c,"#c98a40",3,12,10,2);},
  suppli(c){znPx(c,"#f6e08a",7,0,1,5);znPx(c,"#f6e08a",9,2,1,3);znBox(c,3,5,10,9,"#d9852e");znPx(c,"#f2b25a",4,6,7,2);znPx(c,"#f9d48a",5,6,3,1);znPx(c,"#a85a1c",4,12,8,1);},
  caffe(c){znPx(c,"#cfd8d8",6,2,1,3);znPx(c,"#cfd8d8",8,0,1,4);znPx(c,"#cfd8d8",10,2,1,3);znBox(c,2,13,12,2,"#e9e4d6");znBox(c,4,7,7,7,"#f4f0e6");znBox(c,11,8,3,4,"#f4f0e6");znPx(c,"#f4f0e6",12,9,1,2);znPx(c,"#4a2a18",5,8,5,2);},
  limonata(c){znPx(c,"#d33a2c",10,0,1,6);znBox(c,4,3,8,12,"#f7f2b0");znPx(c,"#fffbd0",5,4,2,8);znPx(c,"#fff",8,7,2,2);znPx(c,"#fff",6,11,2,2);znDisc(c,12.5,3.5,2.6,"#f0d33a","#a8941c");},
  vassoio(c){znTray(c);},
  vassoioOk(c){znTray(c,"#5a9a6a");znPx(c,"#fff",6,9,1,1);znPx(c,"#fff",7,10,1,1);znPx(c,"#fff",8,9,1,1);znPx(c,"#fff",9,8,1,1);},
  gettoneCalcetto(c){znToken(c,"#2f8a4a","#4fb06a",k=>{znDisc(k,8,8,3.3,"#fff","#9aa");znPx(k,ZN_OUT,7,7,2,2);});},
  gettoneMattoni(c){znToken(c,"#c0452e","#e0644a",k=>{znPx(k,"#f6d2a0",5,6,3,2);znPx(k,"#f6d2a0",9,6,2,2);znPx(k,"#f6d2a0",6,9,4,2);});},
  gettoneNastri(c){znToken(c,"#6a4a8c","#8a6aac",k=>{znPx(k,"#f1e6c4",5,6,6,4);znPx(k,ZN_OUT,6,7,1,2);znPx(k,ZN_OUT,9,7,1,2);});},
  gettoneLimonata(c){znToken(c,"#d6b92a","#f0d848",k=>{znDisc(k,8,8,3.4,"#fff6a0","#a8941c");});},
  cartaFortunata(c){znCard(c,ZN_STAR,"#c9941a","#c9941a","#fff6d0");znPx(c,"#2b6a2a",6,10,4,1);},
  cartaGiardino(c){znCard(c,ZN_SPADE,"#2b3138","#3f7a4a");},
  settebello(c){znCard(c,ZN_SEVEN,"#a8741e");znDisc(c,8,12,2,"#e5ad62","#a8741e");},
  biglietto(c){znBox(c,1,4,14,9,"#f1e0a8");c.clearRect(0,7,1,3);c.clearRect(15,7,1,3);znPx(c,"#c33a2e",2,5,12,1);znPx(c,"#8a5a2b",3,7,5,1);znPx(c,"#8a5a2b",3,9,4,1);znPx(c,"#8a5a2b",3,11,6,1);znPx(c,"#b89155",10,6,1,1);znPx(c,"#b89155",10,8,1,1);znPx(c,"#b89155",10,10,1,1);znPx(c,"#2b5aa8",12,7,2,3);},
  tessera(c){znBox(c,2,2,12,12,"#cfe6e0");for(let j=0;j<3;j++)for(let i=0;i<3;i++)znPx(c,"#8fb6ad",4+i*3,4+j*3,2,2);c.clearRect(10,10,2,2);znPx(c,ZN_OUT,9,9,1,1);znPx(c,"#c33a2e",3,3,3,1);},
  pass(c){znPx(c,"#e5ad62",7,0,2,3);znBox(c,2,3,12,11,"#2c2c3a");znPx(c,"#e04a3a",4,5,2,2);znPx(c,"#f1c45a",4,9,1,3);znPx(c,"#f1c45a",6,8,1,4);znPx(c,"#f1c45a",8,7,1,5);znPx(c,"#f1c45a",10,6,1,6);znPx(c,"#f1c45a",12,8,1,3);},
  viaLibera(c){znBox(c,3,3,10,10,"#4aa86a");[[5,8],[6,9],[7,10],[8,9],[9,8],[10,7],[11,6]].forEach(([x,y])=>znPx(c,"#fff",x-1,y-1,1,1));znPx(c,"#2b6a3a",4,4,8,1);},
  green(c){znBox(c,1,3,14,10,"#e9f3e4");znPx(c,"#3f9a5a",2,4,12,3);znPx(c,"#6b8fb5",3,8,4,4);znPx(c,"#6b8fb5",9,9,4,1);znPx(c,"#8a8578",9,11,3,1);znPx(c,"#fff",10,5,3,1);},
  attestato(c){znBox(c,2,3,12,9,"#f4efe0");znPx(c,"#8a5a2b",4,5,6,1);znPx(c,"#8a5a2b",4,7,5,1);znPx(c,"#8a5a2b",4,9,3,1);znDisc(c,11.5,11.5,3,"#c33a2e","#6e1a1a");znPx(c,"#c33a2e",10,13,1,2);znPx(c,"#c33a2e",12,13,1,2);},
  agenda(c){znBox(c,2,3,12,11,"#f4efe0");znPx(c,"#c33a2e",3,4,10,3);znPx(c,ZN_OUT,5,1,1,3);znPx(c,ZN_OUT,10,1,1,3);for(let j=0;j<2;j++)for(let i=0;i<3;i++)znPx(c,"#8a8578",4+i*3,9+j*2,2,1);znPx(c,"#2f8a4a",10,11,2,1);},
  libro(c){znBox(c,2,2,12,12,"#2f6aa8");znPx(c,"#1d4a7a",2,2,2,12);znPx(c,"#f4efe0",5,3,7,10);znGlyph(c,6,5,ZN_A,"#2f6aa8");znPx(c,"#e5ad62",12,2,1,12);},
  microfono(c){znBox(c,6,0,4,8,"#8a8f96");znPx(c,"#cfd3d8",7,1,1,5);znPx(c,ZN_OUT,7,3,2,1);znPx(c,ZN_OUT,4,6,1,5);znPx(c,ZN_OUT,11,6,1,5);znPx(c,ZN_OUT,5,11,6,1);znPx(c,ZN_OUT,7,11,2,3);znPx(c,ZN_OUT,5,14,6,1);znPx(c,"#e04a3a",7,5,2,1);},
  alloro(c){
    for(let a=35;a<=325;a+=18){const r=a*Math.PI/180,x=Math.round(8+5.4*Math.sin(r)),y=Math.round(8-5.4*Math.cos(r));znPx(c,"#2b6a2a",x-1,y-1,3,2);znPx(c,"#4f9a3a",x-1,y-1,2,1);}
    znPx(c,"#c33a2e",6,13,4,2);znPx(c,"#e5ad62",7,13,2,1);
  },
  taccuino(c){znBox(c,3,1,10,14,"#6a4a8c");znPx(c,"#4a3068",3,1,2,14);znPx(c,"#f1e6c4",6,4,5,4);znPx(c,"#6a4a8c",7,5,3,1);znPx(c,"#6a4a8c",7,6,2,1);znPx(c,"#e5ad62",11,1,1,14);},
  nota(c){znBox(c,3,3,10,10,"#f6df6a");znPx(c,"#d4b83a",10,10,3,3);znPx(c,"#a6882c",5,6,6,1);znPx(c,"#a6882c",5,8,5,1);znPx(c,"#a6882c",5,10,3,1);znPx(c,"#e04a3a",6,2,4,2);},
  presa(c){znBox(c,3,5,10,6,"#e9e6dc");znPx(c,"#b0b4b8",5,2,2,3);znPx(c,"#b0b4b8",9,2,2,3);znPx(c,ZN_OUT,7,11,2,4);znPx(c,"#f1c45a",7,7,2,2);znPx(c,ZN_OUT,7,7,1,1);},
  piuma(c){const blade=[[9,1,3],[7,2,6],[6,3,7],[5,4,8],[5,5,7],[4,6,7],[4,7,6],[4,8,5],[4,9,4],[5,10,3]];blade.forEach(([x,y,w],i)=>{znPx(c,ZN_OUT,x-1,y,1,1);znPx(c,i%2?"#d9d4c7":"#f1ede4",x,y,w,1);znPx(c,"#b8b2a2",x+w-2,y,2,1);znPx(c,ZN_OUT,x+w,y,1,1);});znPx(c,ZN_OUT,9,0,3,1);for(let i=0;i<6;i++){znPx(c,"#8a8578",4+i,10+i*0+0,1,0);}for(let i=0;i<5;i++){znPx(c,ZN_OUT,5-i,11+i,1,1);}znPx(c,"#8a8578",6,10,1,1);znPx(c,"#8a8578",5,11,1,1);znPx(c,"#8a8578",4,12,1,1);},
  trend(c){znPhone(c,"#e8537a");znPx(c,"#fff",7,5,1,5);znPx(c,"#fff",8,6,1,3);znPx(c,"#fff",9,7,1,1);znPx(c,"#f6c35a",10,3,1,1);},
  telefonoMuto(c){znPhone(c,"#2f6aa8");znPx(c,"#fff",6,6,4,1);znPx(c,"#fff",8,7,1,1);znPx(c,"#fff",7,8,1,1);znPx(c,"#fff",6,9,4,1);for(let i=0;i<8;i++)znPx(c,"#e04a3a",4+i,2+i,1,1);},
  prenotazione(c){znBox(c,3,2,10,12,"#f4efe0");znPx(c,"#3f9a5a",5,5,6,5);znPx(c,"#fff",5,7,6,1);znPx(c,"#8a8a8a",6,4,1,7);znPx(c,"#8a8a8a",9,4,1,7);znPx(c,"#c33a2e",7,6,1,1);znPx(c,"#2c5aa8",8,8,1,1);znPx(c,"#c33a2e",6,12,5,1);},
  rivincita(c){znPx(c,"#2c5aa8",5,0,2,6);znPx(c,"#c33a2e",9,0,2,6);znDisc(c,8,9.5,5.5,"#e5ad62","#7a4a1c");znGlyph(c,6,7,ZN_STAR,"#7a4a1c");},
  nastro(c){znBox(c,1,3,14,10,"#d8c9a3");znPx(c,"#f4efe0",3,4,10,4);znPx(c,"#c33a2e",3,4,10,1);znPx(c,ZN_OUT,4,10,3,3);znPx(c,ZN_OUT,9,10,3,3);znPx(c,"#f4efe0",5,11,1,1);znPx(c,"#f4efe0",10,11,1,1);znPx(c,"#7a6a50",7,11,2,1);},
  dritta(c){znBubble(c,"#f4efe0",ZN_BANG,"#c33a2e");},
  drittaBar(c){znBubble(c,"#e8d4b0",ZN_QUEST,"#5a3b1e");},
  lista(c){znBox(c,3,2,10,13,"#b58a54");znPx(c,"#f4efe0",4,4,8,10);znPx(c,"#8a8f96",6,1,4,3);znPx(c,"#2f8a4a",5,6,1,1);znPx(c,"#888",7,6,4,1);znPx(c,"#2f8a4a",5,9,1,1);znPx(c,"#888",7,9,4,1);znPx(c,"#2f8a4a",5,12,1,1);znPx(c,"#888",7,12,3,1);},
  scopa(c){for(let i=0;i<11;i++)znPx(c,"#5a3b1e",12-i,1+i,1,1);znBox(c,2,10,7,5,"#d9a84e");znPx(c,"#a8741e",4,11,1,3);znPx(c,"#a8741e",6,11,1,3);znPx(c,"#f0c878",3,11,1,2);},
  piatto(c){znDisc(c,8,8,6,"#f1ece0");znDisc(c,8,8,3.4,"#dfd8c6","#bfb8a4");znPx(c,ZN_OUT,1,2,1,12);znPx(c,ZN_OUT,14,2,1,12);znPx(c,"#b0b4b8",1,2,1,5);znPx(c,"#b0b4b8",14,2,1,5);},
  ricordo(c){znBox(c,2,2,12,12,"#f4efe0");znPx(c,"#7a8aa8",4,4,8,6);znPx(c,"#cfd8e8",6,5,4,4);znPx(c,ZN_OUT,7,6,1,1);znPx(c,ZN_OUT,9,6,1,1);znPx(c,ZN_OUT,7,8,3,1);znPx(c,"#8a8578",4,11,5,1);},
  chiave(c){znDisc(c,5,5,3.6,"#e5ad62","#7a4a1c");znDisc(c,5,5,1.4,"#10181a","#10181a");znPx(c,"#7a4a1c",7,7,7,3);znPx(c,"#e5ad62",8,8,5,1);znPx(c,"#7a4a1c",11,10,2,3);znPx(c,"#7a4a1c",8,10,2,2);},
  zaino(c){znBox(c,3,4,10,11,"#8a6a44");znPx(c,"#5a4026",5,1,6,4);znPx(c,"#10181a",6,2,4,2);znBox(c,5,9,6,5,"#a8844f");znPx(c,"#e5ad62",7,10,2,1);znPx(c,"#5a4026",3,6,1,5);znPx(c,"#5a4026",12,6,1,5);},
  ignoto(c){znBox(c,3,5,10,10,"#8a6a44");znPx(c,"#5a4026",6,3,4,2);znPx(c,"#5a4026",7,1,2,2);znGlyph(c,5,7,ZN_QUEST,"#f1deb4");}
};

// ---------------------------------------------------------------------------
// Censimento: nome in state.pockets (o voce speciale) -> categoria, icona, testi
// ---------------------------------------------------------------------------
const ZN_CATS=[
  {id:"chiave",it:"Oggetti chiave",en:"Key items",ic:"chiave",vuota:"Nessun oggetto chiave. Il campus, per ora, non ti ha affidato niente di importante."},
  {id:"cibo",it:"Cibo e bevande",en:"Food & drink",ic:"panino",vuota:"Stomaco vuoto, tasche vuote. La mensa chiude alle due."},
  {id:"carte",it:"Carte e premi",en:"Cards & prizes",ic:"cartaFortunata",vuota:"Nessun premio. Qualcuno al tavolo del giardino è ancora in attesa di un avversario."},
  {id:"tessere",it:"Tessere e biglietti",en:"Passes & tickets",ic:"biglietto",vuota:"Nessuna tessera. Si spera che la guardia non controlli."},
  {id:"fumo",it:"Fumo",en:"Smoking",ic:"pack",vuota:"Niente fumo. Il tuo fiato ringrazia, l’accendino di Viale Romania un po’ meno."},
  {id:"varie",it:"Varie",en:"Misc",ic:"zaino",vuota:"Nessuna cianfrusaglia. Un’impresa notevole, per uno studente."}
];
// [nome, categoria, icona, descrizione, osservazione]
const ZN_CATALOGO=[
  ["Badge LUISS","tessere","badge","Il tuo badge da studente. La foto è di tre anni fa e sembri più riposato di adesso.","Sul retro c’è un codice a barre che il tornello legge solo al terzo tentativo."],
  ["Via libera","tessere","viaLibera","Il badge ha convinto la guardia. Il tornello si apre, la tua autostima un po’ meno.","Il timbro verde è ancora fresco. La guardia ti guarda come se dovesse rifarsi."],
  ["Abilitazione Green Mobility","tessere","green","Patente verificata, prenotazione fatta: puoi guidare un mezzo condiviso. In teoria.","Sotto la foto: «Il mezzo va restituito». Una frase di rara ambizione."],
  ["Pass Radio Luiss","tessere","pass","Un pass per la redazione. Ti dà accesso a microfoni, caffè freddo e leggende metropolitane.","Il cordino ha il sapore di tutte le dirette che nessuno ha ascoltato."],
  ["Biglietto del 360 bis","tessere","biglietto","Un biglietto per una corsa che esiste una sola volta, quando tutto il campus è in ritardo.","Scadenza: «quando passa». Nessun orario, solo fiducia."],
  ["Tessera della corsa fantasma","tessere","tessera","Obliterata con una pinzatrice. Il buco a forma di tazza significa che manca il caffè.","Se la inclini si vede il buco. Se la guardi troppo a lungo, anche l’autobus."],
  ["Prenotazione Biliardino","tessere","prenotazione","Un tagliando per il tavolo del biliardino, firmato da qualcuno che non esiste più sul registro presenze.","Il campione in carica ha scritto accanto: «Ci rivediamo al torneo»."],
  ["Seminario Parenzo","chiave","attestato","Hai assistito al seminario di Parenzo. Ricordi a metà, appunti a un quarto.","Il sigillo rosso è molto più convincente del contenuto delle slide."],
  ["Colloquio tutor","chiave","agenda","Il piano del semestre firmato dal tutorato. Ha l’aria di una promessa.","Le caselle sono ordinate. Tu un po’ meno, ma si lavora."],
  ["Lezione A200","chiave","libro","Hai seguito la lezione in Aula Chiesa. Il quaderno ha tre pagine di appunti e un disegno di un gatto.","Il gatto è venuto meglio dell’argomento."],
  ["Progetto LOFT","chiave","microfono","Il podcast di fine triennale è consegnato. Un minuto di vita a Romania, con tanto di sottofondo di biliardino.","Sulla cuffia è rimasto un adesivo: «Registrando». Mai più tolto."],
  ["Festa a Pola","chiave","alloro","La corona d’alloro della laurea. Pesa come un trofeo e profuma di spritz.","Qualche foglia manca. È andata in brindisi."],
  ["Taccuino di Goffman","chiave","taccuino","Un taccuino per annotare il retroscena della macchinetta del caffè e di tutto il resto.","Prima pagina: «La fila è un rito». Seconda: «Il rito è in ritardo»."],
  ["Nota del Dome","chiave","nota","Un biglietto giallo con un indizio sul posto dietro il ficus.","La calligrafia è di chi ha già litigato con una presa."],
  ["Presa condivisa","chiave","presa","La tua ciabatta ha salvato un portatile al 4% e creato un’amicizia inattesa.","Tre buchi, sette dispositivi. Il vero lavoro di gruppo."],
  ["Piuma del piccione","chiave","piuma","Il risarcimento di un piccione dopo una trattativa al ribasso sul tuo panino.","Per lui è una firma notarile. Per te è una piuma."],
  ["Dritta sul Matroneo","chiave","dritta","Qualcuno ti ha indicato dove si studia in silenzio, e dove invece no.","Il consiglio più prezioso del campus: «Fai piano»."],
  ["Dritta del barista","chiave","drittaBar","Il barista sa quando si libera il tavolo sotto i portici. L’ha detto sottovoce.","Il barista parla poco e sa tutto. Come i migliori consulenti."],
  ["Lista controllata","chiave","lista","L’elenco degli ospiti, ricontrollato due volte. La prima volta non l’aveva fatto nessuno.","Un nome è cancellato a penna. Non è il tuo, almeno finché non lo scrivi."],
  ["Telefono silenziato","chiave","telefonoMuto","Il telefono è in silenzioso. Per una volta le notifiche si vendicano in privato.","Sullo schermo: 47 messaggi del gruppo di Diritto privato."],
  ["Spazzata","chiave","scopa","Hai tenuto aperto il sacco e fatto una pulizia straordinaria. Il campus non lo sa, ma ti deve un favore.","La scopa è più professionale di certi professori."],
  ["Pranzo finito","chiave","piatto","Il pranzo è passato. Il tavolo sotto i portici dovrebbe essere libero.","Briciole sulla manica: la prova di un pasto onesto."],
  ["Panino","cibo","panino","Un panino di bar. Lo scontrino è più lungo del panino.","Profumo sospetto di piccione nei dintorni. Tienilo stretto."],
  ["Supplì","cibo","suppli","Un supplì al telefono, caldo e leggermente sleale con le dita.","Il filo di mozzarella regge il peso di tre esami di diritto."],
  ["Caffè ristretto","cibo","caffe","Un caffè a regime di massima sicurezza. Una dose, due decisioni, zero rimpianti.","Il fondo disegna una mappa del campus. Forse è l’aula giusta."],
  ["Limonata","cibo","limonata","La limonata del bar, vinta a ping pong. Sa di trionfo e un po’ di sciroppo.","Una fetta di limone fa il bagno nel ghiaccio. Tu no, ma ci pensi."],
  ["Vassoio","cibo","vassoio","Il vassoio della mensa, con pasta, un frutto e la dignità che rimane.","Pesa meno del conto morale del pranzo."],
  ["Vassoio restituito","varie","vassoioOk","Hai riportato il vassoio. Un gesto minuscolo che salva il karma della mensa.","Un addetto ti sorride. È la quinta volta che ti accade in tre anni."],
  ["Gettone Calcetto","carte","gettoneCalcetto","Hai battuto Matteo a calcetto. Il gettone brilla più della sua autostima.","Sul retro: «Non vale ai rigori». Valeva a calcetto."],
  ["Gettone Pixel Mattoni","carte","gettoneMattoni","Il tabellone del LOFT è ripulito. Un gettone per ogni mattone che non hai rotto.","I bordi sono smussati da generazioni di studenti che dovevano studiare."],
  ["Gettone Salva i nastri","carte","gettoneNastri","Le cassette sono in salvo. Il gettone no, perché è in tasca con le chiavi.","Una linea ondulata dice: «Riavvolgi». Non è un consiglio, è un ordine."],
  ["Gettone limonata","carte","gettoneLimonata","Vale una limonata al bar, se il barista è di buon umore.","Il giallo è un po’ pallido. Come il saldo del conto."],
  ["Carta fortunata","carte","cartaFortunata","Una carta della briscola che porta bene. Il posto studio alla pergola è tuo.","Il quadrifoglio è stampato storto. La fortuna, appunto."],
  ["Carta del giardino","carte","cartaGiardino","Il trofeo del tavolo di poker del giardino. Nessuno ti ha chiesto di restituirlo.","Sul dorso: «A chi vince, il resto non conta». Anche tu hai capito che è falso."],
  ["Settebello del campus","carte","settebello","Il settebello del tavolo di Scopa. Una tessera che vale più di un punto in diritto.","L’oro è usurato. Come la memoria del primo anno."],
  ["Rivincita di Riccardo","carte","rivincita","Riccardo ti ha fatto i complimenti e ha già chiesto la rivincita. Un medaglione per chi non sa perdere.","Il nastro è blu e rosso. Le braccia, meno."],
  ["Trend superato","carte","trend","Il video del passo finale è pronto e già a quota cinque visualizzazioni, tutte tue.","La clip dura 11 secondi e un’eternità di imbarazzo."],
  ["Nastro di Radio Luiss","carte","nastro","Il nastro della sigla: rubinetto, biliardino e una sedia nei titoli di coda.","La sedia è la vera protagonista. Lo sa e se la tira."],
  ["Fantasma del fuoricorso","varie","ricordo","Un incontro notturno: il fuoricorso ti ha lasciato una cartellina e un brivido.","Nella cartellina: gli appunti del 2009. Sono ancora attuali."],
  ["Custode delle zucchine","varie","ricordo","L’orto del campus ha un custode con una torcia. Tu hai un ricordo e una zucchina in meno.","Un orto, una torcia, nessun testimone."],
  ["Tecnico del Dome","varie","ricordo","Il tecnico era dietro l’ultima fila. Il microfono era acceso. Il resto lo sai.","L’eco ripete ancora quello che hai detto."],
  ["Conduttore fantasma","varie","ricordo","Un programma radiofonico che nessuno ha acceso, con ospite e pubblico invisibili.","In onda, per sempre, senza sponsor."],
  ["Ospite del brindisi","varie","ricordo","Un compagno uscito da dietro il tavolo con una corona d’alloro. Un ricordo di Pola.","Il bicchiere era vuoto. L’alloro no."]
];
const ZN_ALIAS={"Sigarette":"pacchetto","Pacchetto di sigarette":"pacchetto","Accendino":"accendino","IQOS":"iqos","Mele":"mele","Mela":"mele","Monete":"monete","Moneta":"monete"};
const ZN_SPECIALI={
  pacchetto:{nome:"Pacchetto di sigarette",cat:"fumo",icona:"pack"},
  accendino:{nome:"Accendino",cat:"fumo",icona:"lighter"},
  iqos:{nome:"IQOS",cat:"fumo",icona:"iqos"},
  mele:{nome:"Mele di Villa Ada",cat:"cibo",icona:"apple"},
  monete:{nome:"Monete del campus",cat:"varie",icona:"coin"}
};
const ZN_GENERICA={chiave:"Un oggetto che hai in tasca e che, a quanto pare, conta.",cibo:"Qualcosa da mangiare o da bere. In questo campus è già una vittoria.",carte:"Un premio conquistato sul campo. O meglio, al tavolo.",tessere:"Un documento ufficiale, il che spiega la fila.",fumo:"Un articolo da fumatore, come esiste solo fuori dalle aule.",varie:"Una cianfrusaglia. Non sai bene come sia finita in tasca, ma ti sembrava importante."};
const ZN_ICONA_NOME=Object.fromEntries([...ZN_CATALOGO.map(v=>[v[0].toLowerCase(),v[2]]),
  ...Object.entries(ZN_ALIAS).map(([k,v])=>[k.toLowerCase(),ZN_SPECIALI[v].icona])]);

// ---------------------------------------------------------------------------
// Icone pubbliche
// ---------------------------------------------------------------------------
function znBase(nome){
  znCache??={};
  const k=String(nome??"");
  if(znCache[k])return znCache[k];
  const canvas=document.createElement("canvas");canvas.width=canvas.height=16;
  const c=canvas.getContext("2d");
  const raw=String(nome??"").trim(),low=raw.toLowerCase();
  const key=Object.hasOwn(ZN_ICONS,raw)?raw:(ZN_ICONA_NOME[low]??"ignoto");
  ZN_ICONS[key](c);
  return znCache[k]=canvas;
}
// Restituisce un canvas pixel-art quadrato (dimensione x dimensione, default 16) con l'icona dell'oggetto.
// Per nomi sconosciuti disegna un sacchetto con il punto interrogativo.
function iconaOggetto(nome,dimensione=16){
  const size=Math.max(8,Math.round(Number(dimensione))||16);
  const canvas=document.createElement("canvas");canvas.width=canvas.height=size;
  canvas.className="zn-icona";canvas.setAttribute("aria-hidden","true");
  canvas.style.cssText="width:"+size+"px;height:"+size+"px;image-rendering:pixelated";
  const c=canvas.getContext("2d");c.imageSmoothingEnabled=false;
  try{c.drawImage(znBase(nome),0,0,size,size);}catch{}
  return canvas;
}
function iconaOggettoUrl(nome,dimensione=16){return iconaOggetto(nome,dimensione).toDataURL("image/png");}

// ---------------------------------------------------------------------------
// Elenco degli oggetti posseduti
// ---------------------------------------------------------------------------
function znTrova(nome){return ZN_CATALOGO.find(v=>v[0]===nome);}
function znElenco(){
  const out=[];
  if(typeof state==="undefined"||!state)return out;
  const pockets=Array.isArray(state.pockets)?state.pockets:[];
  const left=typeof cigarettesLeft==="function"?cigarettesLeft():0;
  const push=o=>out.push(o);
  // Badge, sempre presente
  const badge=znTrova("Badge LUISS");
  push({id:"Badge LUISS",nome:"Badge LUISS",cat:"tessere",icona:badge[2],desc:badge[3],oss:badge[4],qta:null});
  const ord=new Map(ZN_CATALOGO.map((v,i)=>[v[0],i]));
  const noti=[],altri=[];
  for(const nome of pockets){
    const alias=ZN_ALIAS[nome];
    if(alias)continue;
    const voce=znTrova(nome);
    if(voce)noti.push(voce);else altri.push(nome);
  }
  noti.sort((a,b)=>ord.get(a[0])-ord.get(b[0]));
  for(const v of noti)if(v[0]!=="Badge LUISS")push({id:v[0],nome:v[0],cat:v[1],icona:v[2],desc:v[3],oss:v[4],qta:null});
  for(const nome of altri)push({id:nome,nome:tr(nome),cat:"varie",icona:"ignoto",desc:ZN_GENERICA.varie,oss:"Non è catalogato in nessuna scheda. Sicuramente è importante, o almeno ingombrante.",qta:null});
  // Mele
  const mele=Number(state.mele)||0;
  if(mele>0)push({id:"mele",nome:"Mele di Villa Ada",cat:"cibo",icona:"apple",qta:mele,
    desc:"Mele rosse del parco, raccolte due alla volta. Utili per distrarre un cinghiale, o un barista di Villa Ada.",
    oss:"Hanno la targhetta rossa: «uso del parco». Il cinghiale, a quanto pare, legge."});
  // Monete
  const monete=state.wallet?Number(state.wallet.coins)||0:0;
  if(monete>0)push({id:"monete",nome:"Monete del campus",cat:"varie",icona:"coin",qta:monete,
    desc:"Le monete raccolte nel campus e vinte ai minigiochi. Bastano per un supplì, o per un’idea migliore.",
    oss:"Una moneta è più rumorosa quando non ne hai. Le tue, per ora, fanno un bel tintinnio."});
  // Fumo
  const sigarette=pockets.includes("Sigarette");
  if(sigarette){
    push({id:"pacchetto",nome:"Pacchetto di sigarette",cat:"fumo",icona:left>0?"pack":"packEmpty",qta:left,qtaFmt:left+"/10",
      desc:left>0?"Il pacchetto della tabaccheria di Viale Romania. Sigarette rimaste: "+left+" su 10.":"Il pacchetto della tabaccheria di Viale Romania, ormai vuoto. Resta solo l’odore e il rimorso.",
      oss:left>0?"Avvertenza sul retro: «Il fumo uccide». Lo hai già letto, ma ti piace il carattere.":"Dentro c’è solo la stagnola. La nostalgia è gratis.",
      fuma:true});
    push({id:"accendino",nome:"Accendino",cat:"fumo",icona:"lighter",qta:null,
      desc:"Compagno del pacchetto. Scatta al primo tentativo, come mai nulla in università.",
      oss:"Una rotella, una scintilla, una piccola fiamma. Più affidabile della connessione di Aula T04.",
      fuma:true});
  }
  if(pockets.includes("IQOS"))push({id:"IQOS",nome:"IQOS",cat:"fumo",icona:"iqos",qta:null,
    desc:"Il dispositivo elettronico della tabaccheria. Zero cenere, luce verde e un’aria da laboratorio.",
    oss:"Il led lampeggia come un esame in sospeso. Nel gioco non si usa: è un oggetto da collezione."});
  return out;
}

// ---------------------------------------------------------------------------
// Pannello
// ---------------------------------------------------------------------------
function znStili(){
  if(document.getElementById("zainoStili"))return;
  const css=`
.gp-zaino{position:fixed;inset:0;z-index:9000;display:flex;flex-direction:column;gap:10px;color:var(--cream,#f1deb4);
  font-family:var(--font-ui,"Pixelify Sans",monospace);font-size:17px;line-height:1.3;
  padding:max(12px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));
  background:radial-gradient(120% 90% at 50% 0,#27403a 0,#16211f 55%,#0d1413 100%);overflow:hidden}
.gp-zaino::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.35;
  background:repeating-linear-gradient(0deg,#0000 0 3px,#0000002b 3px 4px)}
.gp-zaino[hidden]{display:none}
.gp-zaino.zn-entra{animation:znEntra .16s steps(4) both}
@keyframes znEntra{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.gp-zaino *{box-sizing:border-box}
.gp-zaino button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation}
.gp-zaino :focus-visible{outline:3px solid #fff3c4;outline-offset:2px;box-shadow:0 0 0 6px #b4472f}
.zn-head{position:relative;display:flex;align-items:center;gap:12px;min-height:52px}
.zn-titolo{font-family:var(--font-title,"Press Start 2P",monospace);font-size:clamp(14px,2.6vw,22px);margin:0;color:#ffd49e;text-shadow:3px 3px #0d1413;letter-spacing:.04em}
.zn-sotto{flex:1;min-width:0;opacity:.8;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zn-indietro{min-width:44px;min-height:44px;padding:8px 16px 8px 12px;background:#3a2218;border:3px solid #e5ad62;box-shadow:0 4px #1a0f0a;display:flex;align-items:center;gap:8px;font-weight:700}
.zn-indietro:active{transform:translateY(3px);box-shadow:0 1px #1a0f0a}
.zn-indietro i{display:inline-block;width:0;height:0;border:7px solid transparent;border-right:10px solid currentColor;border-left:0}
.zn-corpo{position:relative;flex:1;min-height:0;display:grid;gap:12px;grid-template-columns:minmax(168px,220px) minmax(0,1fr) minmax(280px,380px)}
.zn-pannello{background:#1d2b29;border:4px solid #6f5a3e;box-shadow:inset 0 0 0 3px #101a19,0 6px #0a0f0f;min-height:0;min-width:0}
.zn-schede{display:flex;flex-direction:column;gap:8px;padding:10px;overflow:auto}
.zn-scheda{display:flex;align-items:center;gap:10px;min-height:56px;padding:6px 10px;text-align:left;background:#243634;border:3px solid #43534d;border-radius:0;font-weight:700}
.zn-scheda canvas{flex:none;width:28px;height:28px}
.zn-scheda span{flex:1;min-width:0;overflow-wrap:anywhere;line-height:1.15}
.zn-scheda b{flex:none;min-width:24px;padding:2px 6px;background:#101a19;border:2px solid #43534d;font-size:14px;text-align:center}
.zn-scheda[aria-selected=true]{background:#5a3a1e;border-color:#ffd49e;color:#fff3d6}
.zn-scheda[aria-selected=true] b{border-color:#ffd49e;background:#2a1a0d}
.zn-elenco{display:flex;flex-direction:column;overflow:auto;padding:8px;gap:6px;scroll-padding:8px}
.zn-riga{position:relative;display:flex;align-items:center;gap:12px;min-height:54px;padding:6px 12px 6px 30px;text-align:left;background:#243634;border:3px solid #34443f;border-radius:0}
.zn-riga canvas{flex:none;width:32px;height:32px}
.zn-riga .zn-nome{flex:1;min-width:0;overflow-wrap:anywhere;font-weight:700;line-height:1.15}
.zn-riga .zn-qta{flex:none;padding:2px 8px;background:#101a19;border:2px solid #6f5a3e;color:#ffd49e;font-weight:700}
.zn-riga[aria-selected=true]{background:#46341e;border-color:#ffd49e;color:#fff3d6}
.zn-riga[aria-selected=true]::before{content:"";position:absolute;left:9px;top:50%;margin-top:-8px;width:0;height:0;
  border:8px solid transparent;border-left:12px solid #ffd49e;border-right:0;animation:znCursore .7s steps(2) infinite}
@keyframes znCursore{50%{transform:translateX(4px)}}
.zn-vuoto{margin:auto;padding:24px;text-align:center;opacity:.85;max-width:34ch}
.zn-vuoto canvas{width:64px!important;height:64px!important;margin:0 auto 12px;display:block;opacity:.55}
.zn-dettaglio{display:flex;flex-direction:column;gap:10px;padding:14px;overflow:auto}
.zn-grande{align-self:center;width:112px;height:112px;display:grid;place-items:center;background:radial-gradient(#3b4f49,#16211f);border:4px solid #6f5a3e;box-shadow:inset 0 0 0 3px #101a19;flex:none}
.zn-grande canvas{width:96px!important;height:96px!important}
.zn-dnome{font-family:var(--font-title,"Press Start 2P",monospace);font-size:clamp(11px,1.5vw,14px);line-height:1.6;margin:0;color:#ffd49e;text-align:center;overflow-wrap:anywhere}
.zn-dcat{align-self:center;padding:2px 10px;font-size:14px;background:#101a19;border:2px solid #43534d;color:#cdb98c}
.zn-ddesc{margin:0;font-size:17px}
.zn-doss{margin:0;min-height:3.6em;padding:8px 10px;background:#101a19;border:2px dashed #6f5a3e;font-size:16px;color:#f3e7c4}
.zn-doss:empty{display:none}
.zn-azioni{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto}
.zn-azione{flex:1 1 110px;min-height:48px;padding:8px 14px;background:#3a2218;border:3px solid #e5ad62;box-shadow:0 4px #1a0f0a;font-weight:700;border-radius:0}
.zn-azione:active{transform:translateY(3px);box-shadow:0 1px #1a0f0a}
.zn-azione[aria-disabled=true]{opacity:.55;border-color:#6f5a3e}
.zn-guida{position:relative;display:flex;flex-wrap:wrap;gap:4px 16px;font-size:14px;opacity:.75}
.zn-guida kbd{font:inherit;font-weight:700;padding:0 6px;background:#101a19;border:2px solid #43534d;margin-right:4px}
@media (max-width:820px),(max-height:520px) and (max-width:1000px){
  .gp-zaino{gap:8px;font-size:16px}
  .zn-corpo{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) minmax(0,auto);gap:8px}
  .zn-schede{flex-direction:row;overflow-x:auto;overflow-y:hidden;padding:6px;gap:6px}
  .zn-scheda{flex:0 0 auto;min-height:52px;padding:4px 10px}
  .zn-scheda span{white-space:nowrap}
  .zn-dettaglio{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;max-height:38dvh;padding:10px;align-items:start}
  .zn-grande{grid-row:1/4;width:84px;height:84px}.zn-grande canvas{width:68px!important;height:68px!important}
  .zn-dnome,.zn-dcat{text-align:left;align-self:start}.zn-dcat{justify-self:start}
  .zn-ddesc,.zn-doss,.zn-azioni{grid-column:1/-1}
  .zn-ddesc{font-size:16px}.zn-doss{min-height:0}
  .zn-guida{display:none}
}
@media (max-height:520px) and (min-width:821px){.zn-dettaglio{gap:6px;padding:10px}.zn-grande{width:72px;height:72px}.zn-grande canvas{width:56px!important;height:56px!important}.zn-guida{display:none}}
@media (min-width:1700px){.gp-zaino{font-size:20px;padding:28px 44px}.zn-corpo{grid-template-columns:260px minmax(0,1fr) 460px}.zn-riga{min-height:64px}.zn-riga canvas{width:40px!important;height:40px!important}}
@media (prefers-reduced-motion:reduce){.gp-zaino.zn-entra,.zn-riga[aria-selected=true]::before{animation:none}}
`;
  const st=document.createElement("style");st.id="zainoStili";st.textContent=css;document.head.append(st);
}
function znCostruisci(){
  if(znRoot)return znRoot;
  znStili();
  const r=document.createElement("div");
  r.className="gp gp-zaino";r.hidden=true;r.setAttribute("role","dialog");r.setAttribute("aria-modal","true");r.setAttribute("aria-labelledby","znTitolo");
  r.innerHTML=`<div class="zn-head"><h2 class="zn-titolo" id="znTitolo"></h2><div class="zn-sotto" id="znSotto"></div>
    <button type="button" class="zn-indietro" id="znIndietro"><i aria-hidden="true"></i><span></span></button></div>
    <div class="zn-corpo">
      <div class="zn-pannello zn-schede" role="tablist" aria-orientation="vertical" id="znSchede"></div>
      <div class="zn-pannello zn-elenco" role="listbox" id="znElenco" aria-labelledby="znTitolo"></div>
      <div class="zn-pannello zn-dettaglio" id="znDettaglio" aria-live="polite"></div>
    </div>
    <div class="zn-guida" id="znGuida"></div>`;
  document.body.append(r);
  znRoot=r;
  r.querySelector("#znIndietro").onclick=()=>zainoChiudi();
  r.addEventListener("pointerdown",e=>{e.stopPropagation();},true);
  return r;
}
function znNomeCat(cat){return local(cat.it,cat.en);}
function znVoci(){
  const lista=znElenco();
  return ZN_CATS.map(cat=>({cat,voci:lista.filter(v=>v.cat===cat.id)}));
}
function znRender(focus){
  const r=znCostruisci();
  const gruppi=znVoci();
  if(znCat>=gruppi.length)znCat=0;
  const voci=gruppi[znCat].voci;
  if(znSel>=voci.length)znSel=Math.max(0,voci.length-1);
  r.querySelector("#znTitolo").textContent=local("ZAINO","BAG");
  r.querySelector("#znSotto").textContent=znNomeCat(gruppi[znCat].cat)+" · "+local("Tasche","Pockets")+" "+gruppi.reduce((n,g)=>n+g.voci.length,0);
  r.querySelector("#znIndietro span").textContent=local("Indietro","Back");
  const schede=r.querySelector("#znSchede");
  schede.replaceChildren();
  gruppi.forEach((g,i)=>{
    const b=document.createElement("button");b.type="button";b.className="zn-scheda";b.setAttribute("role","tab");
    b.setAttribute("aria-selected",String(i===znCat));b.tabIndex=i===znCat?0:-1;b.dataset.i=i;
    const nome=document.createElement("span");nome.textContent=znNomeCat(g.cat);
    const n=document.createElement("b");n.textContent=g.voci.length;
    b.append(iconaOggetto(g.cat.ic,28),nome,n);
    b.onclick=()=>znScheda(i);
    schede.append(b);
  });
  const el=r.querySelector("#znElenco");
  el.replaceChildren();
  el.setAttribute("aria-label",znNomeCat(gruppi[znCat].cat));
  if(!voci.length){
    const v=document.createElement("div");v.className="zn-vuoto";
    v.append(iconaOggetto("zaino",64));
    const p=document.createElement("p");p.textContent=gruppi[znCat].cat.vuota;v.append(p);
    el.append(v);
  }
  voci.forEach((v,i)=>{
    const b=document.createElement("button");b.type="button";b.className="zn-riga";b.setAttribute("role","option");
    b.setAttribute("aria-selected",String(i===znSel));b.tabIndex=i===znSel?0:-1;b.dataset.i=i;b.dataset.id=v.id;
    const nome=document.createElement("span");nome.className="zn-nome";nome.textContent=v.nome;
    b.append(iconaOggetto(v.icona,32),nome);
    if(v.qta!=null){const q=document.createElement("span");q.className="zn-qta";q.textContent="×"+(v.qtaFmt?v.qtaFmt:v.qta);b.append(q);}
    b.onclick=()=>{if(znSel!==i){znSel=i;sound("click","interface");znRender(true);}else znOsserva();};
    el.append(b);
  });
  znDettaglio(voci[znSel]);
  r.querySelector("#znGuida").innerHTML=
    "<span><kbd>↑↓</kbd>"+local("Oggetti","Items")+"</span><span><kbd>←→</kbd>"+local("Tasche","Pockets")+"</span><span><kbd>E</kbd>"+local("Osserva","Examine")+"</span><span><kbd>B</kbd> / <kbd>Esc</kbd>"+local("Indietro","Back")+"</span>";
  if(focus){
    const t=voci.length?el.children[znSel]:schede.children[znCat];
    t?.focus({preventScroll:false});t?.scrollIntoView?.({block:"nearest"});
  }
}
function znDettaglio(v){
  const d=znRoot.querySelector("#znDettaglio");
  d.replaceChildren();
  if(!v){d.hidden=false;const p=document.createElement("p");p.className="zn-ddesc";p.textContent=local("Niente da mostrare qui.","Nothing to show here.");d.append(p);return;}
  const g=document.createElement("div");g.className="zn-grande";g.append(iconaOggetto(v.icona,96));
  const n=document.createElement("h3");n.className="zn-dnome";n.textContent=v.nome+(v.qta!=null?"  ×"+(v.qtaFmt??v.qta):"");
  const c=document.createElement("div");c.className="zn-dcat";c.textContent=znNomeCat(ZN_CATS.find(x=>x.id===v.cat));
  const desc=document.createElement("p");desc.className="zn-ddesc";desc.textContent=v.desc;
  const oss=document.createElement("p");oss.className="zn-doss";oss.id="znOss";
  const az=document.createElement("div");az.className="zn-azioni";
  const osserva=document.createElement("button");osserva.type="button";osserva.className="zn-azione";osserva.textContent=local("Osserva","Examine");
  osserva.onclick=()=>znOsserva();az.append(osserva);
  if(v.fuma){
    const f=document.createElement("button");f.type="button";f.className="zn-azione";f.id="znFuma";
    f.textContent=v.id==="accendino"?local("Usa","Use"):local("Fuma","Smoke");
    const ok=znPuoFumare();
    if(!ok.ok)f.setAttribute("aria-disabled","true");
    f.onclick=()=>znFuma();
    az.append(f);
  }
  d.append(g,n,c,desc,oss,az);
}
function znOsserva(){
  const voci=znVoci()[znCat].voci,v=voci[znSel];
  if(!v)return;
  sound("choice","interface");
  const o=znRoot.querySelector("#znOss");
  if(o)o.textContent=v.oss||ZN_GENERICA[v.cat];
}
function znPuoFumare(){
  if(typeof smokingAllowed!=="function"||typeof pressSmoking!=="function")return {ok:false,msg:"Qui non c’è niente da fumare."};
  if(typeof cigarettesLeft==="function"&&!cigarettesLeft())return {ok:false,msg:local("Pacchetto vuoto. Dovrai tornare dal tabaccaio.","The pack is empty.")};
  if(typeof cigarette!=="undefined"&&cigarette)return {ok:true,msg:""};
  if(!smokingAllowed())return {ok:false,msg:local("Puoi fumare solo all’aperto mentre esplori, e con il comando Fuma attivo nelle opzioni.","You can only smoke outdoors while exploring, with the Smoke option enabled.")};
  return {ok:true,msg:""};
}
function znFuma(){
  const ok=znPuoFumare();
  const o=znRoot.querySelector("#znOss");
  if(!ok.ok){sound("error","interface");if(o)o.textContent=ok.msg;return;}
  sound("choice","interface");
  zainoChiudi();
  // Usa il sistema di smoking.js: estrae la sigaretta (se non è già in mano); poi si tiene premuto Fuma/F come sempre.
  if(typeof cigarette!=="undefined"&&cigarette){updateSmokingUI();return;}
  pressSmoking();
}
function znScheda(i){
  const n=ZN_CATS.length;
  i=(i+n)%n;
  if(i!==znCat){znCat=i;znSel=0;sound("menu","interface");}
  znRender(true);
}
function znSposta(d){
  const voci=znVoci()[znCat].voci;
  if(!voci.length)return;
  const n=(znSel+d+voci.length)%voci.length;
  if(n!==znSel){znSel=n;sound("click","interface");}
  znRender(true);
}
function zainoAperto(){return znOpen;}
function zainoApri(){
  if(znOpen||typeof screen==="undefined"||screen!=="game"||!state)return false;
  const r=znCostruisci();
  znPrevFocus=document.activeElement;
  keys.clear();controls.clear();
  znOpen=true;
  znRender(false);
  r.hidden=false;
  if(!reducedMotion&&!navigator.webdriver){r.classList.remove("zn-entra");void r.offsetWidth;r.classList.add("zn-entra");}
  sound("menu","interface");
  const voci=znVoci()[znCat].voci;
  (voci.length?r.querySelector("#znElenco").children[znSel]:r.querySelector("#znSchede").children[znCat])?.focus();
  return true;
}
function zainoChiudi(){
  if(!znOpen)return false;
  znOpen=false;
  if(znRoot)znRoot.hidden=true;
  keys.clear();controls.clear();
  sound("click","interface");
  const prev=znPrevFocus;znPrevFocus=null;
  try{
    if(prev&&document.contains(prev)&&!prev.hidden&&prev!==document.body)prev.focus();
    else if(typeof focusScene==="function")focusScene();
  }catch{}
  return true;
}
// Tastiera: mentre lo zaino è aperto cattura tutto (il gioco non deve muoversi); B lo apre durante l'esplorazione.
window.addEventListener("keydown",event=>{
  const key=event.key.toLowerCase();
  if(znOpen){
    if(event.ctrlKey||event.metaKey||event.altKey)return;
    event.stopImmediatePropagation();
    const su=event.target instanceof Element?event.target:null;
    const suBottone=su?.closest?.(".zn-azione,.zn-indietro");
    if(key==="escape"||key==="b"||key==="backspace"){event.preventDefault();zainoChiudi();return;}
    if(key==="tab"){
      const f=[...znRoot.querySelectorAll("button:not([aria-disabled=true])")].filter(b=>b.tabIndex>=0&&!b.hidden);
      const all=[...znRoot.querySelectorAll("button")].filter(b=>b.tabIndex>=0);
      const lista=all.length?all:f;
      if(!lista.length)return;
      const i=lista.indexOf(document.activeElement);
      event.preventDefault();
      lista[(i+(event.shiftKey?-1:1)+lista.length)%lista.length].focus();
      return;
    }
    if(["arrowup","w"].includes(key)){event.preventDefault();znSposta(-1);return;}
    if(["arrowdown","s"].includes(key)){event.preventDefault();znSposta(1);return;}
    if(["arrowleft","a"].includes(key)){event.preventDefault();znScheda(znCat-1);return;}
    if(["arrowright","d"].includes(key)){event.preventDefault();znScheda(znCat+1);return;}
    if(key==="enter"||key===" "||key==="e"){
      if(suBottone)return; // il bottone gestisce da sé il click
      event.preventDefault();
      if(su?.closest?.(".zn-scheda")){const l=znVoci()[znCat].voci;if(l.length)znRender(true);return;}
      if(!event.repeat)znOsserva();
      return;
    }
    event.preventDefault();
    return;
  }
  if(key!=="b"||event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
  if(typeof screen==="undefined"||screen!=="game"||!state)return;
  if(event.target instanceof Element&&event.target.closest("input,select,textarea,[contenteditable]:not([contenteditable=false])"))return;
  if(typeof exploringCampus!=="function"||!exploringCampus())return;
  if(document.querySelector(".gp:not([hidden]),dialog[open]"))return;
  event.preventDefault();
  zainoApri();
},true);
// Se la partita finisce o si torna al menu con lo zaino aperto, lo chiudiamo.
setInterval(()=>{if(znOpen&&(typeof screen==="undefined"||screen!=="game"||!state))zainoChiudi();},500);
