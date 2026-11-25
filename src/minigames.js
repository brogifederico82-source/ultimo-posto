let minigame=null;
const court=$("challengeCourt");
const courtInk=court.getContext("2d");
court.tabIndex=0;
const arcadeRules={
  arm:"Premi Spazio o Spingi nella fascia verde. Ogni passaggio concede un tentativo. Vince chi prende due round.",
  dance:"Segui le frecce prima che scada il tempo. Servono almeno quattro mosse su cinque.",
  ping:"←/→ oppure A/D per muovere la racchetta. Mira con il bordo della racchetta. Premi Spazio o Schiaccia quando la pallina lampeggia. Vince chi fa 5 punti.",
  foos:"Muovi le due stecche con ←/→ o A/D. La stecca arretrata para anche senza tirare. Premi Spazio o Tira mentre la palla lampeggia: colpisci a sinistra o a destra dell’omino per cambiare angolo. Vince chi segna 3 gol.",
  bris:"Scegli una carta con il mouse o con i tasti 1, 2 e 3. La briscola batte gli altri semi. Nel seme di apertura e in quello di briscola l’ordine è Asso, Tre, Re, Cavallo, Fante, 7, 6, 5, 4, 2. Vince chi supera 60 punti."
};
const prizes={
  arm:["Rivincita di Riccardo","Riccardo ti fa i complimenti e chiede la rivincita."],
  ping:["Gettone limonata","Hai ottenuto una limonata al bar."],
  dance:["Trend superato","Il video è pronto."],
  foos:["Prenotazione Biliardino","Le scale del primo piano sono aperte. Parla con il barista del tavolo che si libera dopo pranzo.","biliardini","Il bar ti manda al piano di sopra"],
  bris:["Carta fortunata","Il posto studio alla pergola è disponibile.","briscola","Il tavolo dei Nullafacenti"]
};

const danceKeys=["arrowleft","arrowup","arrowdown","arrowright"];
const danceSymbols=["←","↑","↓","→"];
const armRounds=[
  {period:1450,left:.35,right:.64},
  {period:1270,left:.46,right:.69},
  {period:1130,left:.36,right:.55}
];
function startArm(){
  const now=performance.now();
  return {id:"arm",kind:"arm",you:0,them:0,round:0,attempts:0,leverage:0,
    start:now+800,feedback:"",result:null};
}
function armPhase(g,now){
  const round=armRounds[g.round];
  const cycle=Math.max(0,now-g.start)/round.period;
  const pass=Math.floor(cycle);
  return {round,pass,cursor:pass%2===0?cycle%1:1-cycle%1};
}
function armPush(){
  const g=minigame,now=performance.now();
  if(g?.kind!=="arm"||g.result||now<g.start)return;
  const {round,cursor,pass}=armPhase(g,now);
  if(pass!==g.attempts)return;
  const hit=cursor>=round.left&&cursor<=round.right;
  resolveArmPush(g,hit);
  paintArm(g,now);
}
function resolveArmPush(g,hit){
  g.attempts++;
  g.leverage+=hit?1:-1;
  g.feedback=hit?"Presa salda.":"Riccardo prende vantaggio.";
  if(hit)chime([65]);
  if(Math.abs(g.leverage)<2&&g.attempts<5)return;
  if(g.leverage>0)g.you++;
  else g.them++;
  if(g.you===2||g.them===2){endChallenge(g,g.you===2?"win":"loss");return;}
  g.round++;g.leverage=0;g.attempts=0;g.start=performance.now()+1150;
}
function tickArm(now){
  const g=minigame;
  if(!g.result&&now>=g.start){
    const {pass}=armPhase(g,now);
    if(pass>g.attempts)resolveArmPush(g,false);
  }
  paintArm(g,now);
}
function paintArm(g,now){
  const c=courtInk,{round,cursor,pass}=armPhase(g,now);
  rect(c,"#182b29",0,0,320,188);
  rect(c,"#3b5550",0,86,320,102);
  rect(c,"#6e5042",28,104,264,51);
  rect(c,"#af815c",28,98,264,47);
  for(const y of [115,130])rect(c,"#95674e",29,y,261,1);
  rect(c,"#53443d",104,108,24,12);rect(c,"#53443d",191,108,24,12);
  const tilt=g.result?(g.you===2?2:-2):g.leverage;
  const gripX=160+tilt*16,gripY=66+Math.abs(tilt)*5;
  c.lineCap="round";
  for(const [elbow,shoulder,color] of [[115,66,"#d39b72"],[204,253,"#b77f62"]]){
    c.beginPath();c.moveTo(shoulder,56);c.lineTo(elbow,110);c.lineTo(gripX,gripY);
    c.strokeStyle="#293332";c.lineWidth=20;c.stroke();
    c.strokeStyle=color;c.lineWidth=14;c.stroke();
  }
  rect(c,"#dfb087",gripX-6,gripY-6,12,11);
  const left=48,width=224;
  rect(c,"#24332d",left,159,width,13);
  rect(c,"#92bb82",left+round.left*width,160,(round.right-round.left)*width,11);
  if(!g.result&&now>=g.start){
    rect(c,pass>=g.attempts?"#fff0bd":"#909593",left+cursor*width-2,157,4,17);
  }
  $("challengeScore").textContent=tr("Tu")+" "+g.you+" · "+g.them+" Riccardo · Round "+(g.round+1);
  if(g.result)return;
  const prompt=now<g.start?g.feedback||"Gomiti sul tavolo. Preparati.":pass<g.attempts?g.feedback:"Spingi quando il cursore è nella fascia verde.";
  if($("challengeStatus").textContent!==tr(prompt))$("challengeStatus").textContent=tr(prompt);
}

function renderDance(){
  const g=minigame;
  $("danceCue").textContent=g.result?"":danceSymbols[g.steps[g.index]];
  $("challengeScore").textContent=local("Mosse riuscite: ","Moves landed: ")+g.score+" / "+g.steps.length;
  const sequence=$("danceSequence");sequence.replaceChildren();
  for(const [index,step] of g.steps.entries()){
    const marker=document.createElement("span");
    marker.textContent=danceSymbols[step];
    marker.className=g.hits[index]===true?"done":g.hits[index]===false?"miss":index===g.index?"current":"";
    sequence.append(marker);
  }
  if(!g.result)$("challengeStatus").textContent=g.index===0?local("Pronto al primo passo?","Ready for the first move?"):
    g.hits[g.index-1]?local("A tempo.","On beat."):local("Mossa mancata.","Missed move.");
}
function danceInput(move){
  const g=minigame;
  if(g?.kind!=="dance"||g.result||!g.deadline)return;
  const hit=move===g.steps[g.index]&&performance.now()<g.deadline;
  g.hits.push(hit);
  if(hit){g.score++;chime([67]);}
  g.index++;
  if(g.index===5){
    endChallenge(g,g.score>=4?"win":"loss");
    $("danceMeter").value=0;
  }
  else g.deadline=performance.now()+[1450,1300,1180,1080,1000][g.index];
  renderDance();
}
function tickDance(now){
  const g=minigame;
  if(g.result)return;
  if(!g.deadline)g.deadline=now+1450;
  $("danceMeter").value=Math.max(0,g.deadline-now);
  if(now>=g.deadline)danceInput(-1);
}
for(const [i,button] of [...$("dancePad").querySelectorAll("button")].entries())button.onclick=()=>danceInput(i);
function openChallenge(id){
  keys.clear();controls.clear();
  const isCards=id==="bris",isDance=id==="dance",isArm=id==="arm";
  $("dancePad").hidden=!isDance;
  if(isDance)minigame={id,kind:"dance",index:0,score:0,result:null,hits:[],steps:Array.from({length:5},()=>Math.floor(Math.random()*4)),deadline:0};
  else if(isArm)minigame=startArm();
  else minigame=isCards?startBriscola():startArcade(id);
  $("challengeTitle").textContent=tr(challengeNames[id]);
  $("challengeRules").textContent=tr(arcadeRules[id]);
  $("challengeReplay").hidden=true;
  $("cardGame").hidden=!isCards;
  $("brisLegend").hidden=!isCards;
  $("brisLegend").open=isCards;refreshLanguage();
  court.hidden=isCards||isDance;
  $("challengeLeft").hidden=$("challengeRight").hidden=isCards||isDance||isArm;
  $("challengeShot").hidden=isCards||isDance;
  $("challengeShot").textContent=tr(isArm?"Spingi":id==="ping"?"Schiaccia":"Tira");
  $("challengeStatus").textContent="";
  if(!$("challenge").open)$("challenge").showModal();
  if(isDance){renderDance();$("dancePad").querySelector("button").focus();}
  else if(isCards)renderBriscola(true);
  else{if(isArm)paintArm(minigame,performance.now());else paintCourt(minigame);court.focus();}
}
function closeChallenge(){
  if(!minigame)return;
  clearTimeout(minigame.timer);
  minigame=null;keys.clear();controls.clear();
  $("challenge").close();
  if(screen==="game"){renderScene();$("choices").querySelector("button")?.focus();}
}
$("challengeExit").onclick=closeChallenge;
$("challenge").addEventListener("cancel",event=>{event.preventDefault();closeChallenge();});
$("challengeReplay").onclick=()=>openChallenge(minigame.id);
$("challengeShot").onclick=()=>minigame?.kind==="arm"?armPush():arcadeAction();
for(const [id,direction] of [["challengeLeft","left"],["challengeRight","right"]]){
  const button=$(id);
  button.onpointerdown=event=>{button.setPointerCapture(event.pointerId);controls.add(direction);};
  button.onlostpointercapture=()=>controls.delete(direction);
  button.onpointerup=()=>controls.delete(direction);
  button.onpointercancel=()=>controls.delete(direction);
}

function endChallenge(g,result){
  g.result=result;
  const [item,unlock,secret,description]=prizes[g.id];
  if(result==="win"){
    if(!won(g.id)){
      state.wins[g.id]=true;
      carry(item);
      if(secret)discover(secret,description);
      record("Vittoria a "+challengeNames[g.id].toLowerCase()+" · "+unlock);
    }
    chime([60,64,67,72]);
  }else{
    record(challengeNames[g.id]+" · "+(result==="tie"?"Pareggio.":"Sconfitta."));
    chime([55,48]);
  }
  save();
  $("challengeStatus").textContent=result==="win"?local("Hai vinto. ","You won. ")+tr(unlock):tr(result==="tie"?"Pareggio. Puoi giocare la rivincita.":"Hai perso. Puoi giocare la rivincita.");
  $("challengeReplay").hidden=false;
  $("challengeReplay").focus();
}

const bounds={left:35,right:285,top:14,bottom:174,player:151,rival:37};
const clamp=(n,low,high)=>Math.max(low,Math.min(high,n));
const approach=(value,target,step)=>value+clamp(target-value,-step,step);
function startArcade(id){
  const g={kind:"arcade",id,you:0,them:0,player:160,rival:160,result:null,last:0,wait:.7,rally:0,kick:0};
  serve(g,true);
  return g;
}
function serve(g,towardPlayer){
  g.ball={x:160,y:94,vx:[39,-32,24,-45][(g.you+g.them)%4],vy:(towardPlayer?1:-1)*(g.id==="ping"?108:100)};
  g.wait=.72;g.rally=0;g.kick=0;g.guardX=160;g.rivalGuard=160;g.impact=0;g.powerHit=false;
}
function arcadeAction(){
  const g=minigame;
  if(g?.kind!=="arcade"||g.result||g.wait>0||g.kick!==0)return;
  g.kick=g.id==="ping"?.15:.25;
}
function arcadePoint(g,player){
  if(player)g.you++;else g.them++;
  const target=g.id==="ping"?5:3;
  if(g.you===target||g.them===target){
    g.ball.vx=0;g.ball.vy=0;
    endChallenge(g,player?"win":"loss");
  }else{
    chime(player?[67,72]:[48]);
    serve(g,g.id==="foos"||player);
  }
}
function tickArcade(now){
  const g=minigame;
  const dt=g.last?Math.min((now-g.last)/1000,.032):0;
  g.last=now;
  if(!g.result){
    const left=keys.has("a")||keys.has("arrowleft")||controls.has("left");
    const right=keys.has("d")||keys.has("arrowright")||controls.has("right");
    g.player=clamp(g.player+(Number(right)-Number(left))*227*dt,54,266);
    if(g.wait>0)g.wait=Math.max(0,g.wait-dt);
    else if(g.id==="foos"){
      let remaining=dt;
      while(remaining>0&&g.wait===0&&!g.result){
        const step=Math.min(remaining,1/120);
        stepFoos(g,step);remaining-=step;
      }
    }else{
      if(g.kick>0)g.kick=Math.max(0,g.kick-dt);
      stepBall(g,dt);
    }
  }
  paintCourt(g);
}
function rodOffset(ballX,rodX){
  return [-37,0,37].reduce((nearest,x)=>{
    const offset=ballX-rodX-x;
    return Math.abs(offset)<Math.abs(nearest)?offset:nearest;
  },Infinity);
}
const foosRows={attack:128,defense:154,rivalAttack:60,rivalDefense:34};
const goalHalf=49;
function reflectCourt(x){
  const width=bounds.right-bounds.left;
  const folded=((x-bounds.left)%(width*2)+width*2)%(width*2);
  return bounds.left+(folded<=width?folded:width*2-folded);
}
function meetRow(g,row,oldY,rod,radius){
  const b=g.ball;
  const offset=rodOffset(b.x,rod);
  const crossed=(oldY<row&&b.y>=row)||(oldY>row&&b.y<=row);
  return crossed&&Math.abs(offset)<=radius?offset:null;
}
function stepFoos(g,dt){
  const b=g.ball,previousY=b.y;
  g.impact=Math.max(0,g.impact-dt);
  g.guardX=approach(g.guardX,clamp(160+(g.player-160)*.67,87,233),193*dt);
  const predicted=row=>reflectCourt(b.x+b.vx*((row-b.y)/b.vy));
  const attacking=b.vy<0&&b.y>foosRows.rivalAttack;
  const defending=b.vy<0&&b.y>foosRows.rivalDefense;
  const slip=[-14,8,19,-8,4][(g.rally+g.you+g.them)%5];
  const attackAim=attacking?predicted(foosRows.rivalAttack)+slip:160;
  const defenseAim=defending?predicted(foosRows.rivalDefense)-slip:160;
  g.rival=approach(g.rival,clamp(attackAim,63,257),102*dt);
  g.rivalGuard=approach(g.rivalGuard,clamp(defenseAim,105,215),64*dt);
  if(g.kick>0){
    g.kick=Math.max(0,g.kick-dt);
    if(g.kick===0)g.kick=-.16;
  }else if(g.kick<0)g.kick=Math.min(0,g.kick+dt);
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<bounds.left||b.x>bounds.right){b.x=reflectCourt(b.x);b.vx*=-1;}
  if(b.vy>0){
    for(const [row,rod,defender] of [[foosRows.attack,g.player,false],[foosRows.defense,g.guardX,true]]){
      const offset=meetRow(g,row,previousY,rod,defender?10:12);
      if(offset===null||(!defender&&g.kick<=0))continue;
      const perfect=g.kick>=.055&&g.kick<=.15;
      const power=g.kick>0?(perfect?265:196):145;
      const aim=clamp(160+offset*7+(g.player-160)*.13,114,206);
      b.y=row-.4;b.vy=-power;
      b.vx=(aim-b.x)*power/(row-bounds.top);
      if(g.kick>0)g.kick=-.17;
      g.rally++;g.impact=perfect?.28:.13;g.powerHit=perfect;chime(perfect?[61,73]:[61]);return;
    }
  }else{
    for(const [row,rod,radius] of [[foosRows.rivalAttack,g.rival,6],[foosRows.rivalDefense,g.rivalGuard,7]]){
      const offset=meetRow(g,row,previousY,rod,radius);
      if(offset===null)continue;
      const aim=[122,200,145,178,130][g.rally%5];
      b.y=row+.4;b.vy=175+Math.min(g.rally*5,34);
      b.vx=(aim-b.x)*b.vy/(bounds.bottom-row);
      g.rally++;g.impact=.13;g.powerHit=false;chime([53]);return;
    }
  }
  if(b.y<bounds.top||b.y>bounds.bottom){
    if(Math.abs(b.x-160)<=goalHalf){arcadePoint(g,b.y<bounds.top);return;}
    b.y=b.y<bounds.top?bounds.top+(bounds.top-b.y):bounds.bottom-(b.y-bounds.bottom);
    b.vy*=-1;
    b.vx=clamp(b.vx+(160-b.x)*.20,-170,170);
  }
}
function stepBall(g,dt){
  const b=g.ball,previousY=b.y;
  g.impact=Math.max(0,g.impact-dt);
  const target=b.vy<0?b.x+[19,-21,3,-11,16][g.rally%5]:160;
  g.rival=approach(g.rival,clamp(target,70,250),125*dt);
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<bounds.left||b.x>bounds.right){b.x=reflectCourt(b.x);b.vx*=-1;}
  if(b.vy>0&&previousY<bounds.player&&b.y>=bounds.player&&Math.abs(b.x-g.player)<=23){
    const smash=g.kick>0;
    b.vx=(b.x-g.player)*(smash?8:6);b.vy=-Math.min(smash?251:195,b.vy+(smash?76:9));
    g.kick=0;g.powerHit=smash;g.impact=smash?.34:0;
    g.rally++;chime(smash?[66,78]:[66]);
  }
  if(b.vy<0&&previousY>bounds.rival&&b.y<=bounds.rival&&Math.abs(b.x-g.rival)<=18){
    const aim=[116,204,150,187,130][g.rally%5];
    b.vy=Math.min(195,-b.vy+7);b.vx=(aim-b.x)*b.vy/(bounds.player-bounds.rival);
    g.rally++;chime([54]);
  }
  if(b.y<bounds.top||b.y>bounds.bottom)arcadePoint(g,b.y<bounds.top);
}
function foosReady(g){
  const b=g.ball;
  return b.vy>0&&g.wait===0&&g.kick===0&&
    [foosRows.attack,foosRows.defense].some(row=>{
      const time=(row-b.y)/b.vy;
      const rod=row===foosRows.attack?g.player:g.guardX;
      return time>=0&&time<.19&&Math.abs(rodOffset(reflectCourt(b.x+b.vx*time),rod))<=12;
    });
}
function pingReady(g){
  const b=g.ball,time=(bounds.player-b.y)/b.vy;
  return b.vy>0&&g.wait===0&&time>=0&&time<.15&&Math.abs(reflectCourt(b.x+b.vx*time)-g.player)<=23;
}
function paintCourt(g){
  const c=courtInk,ping=g.id==="ping";
  rect(c,"#152522",0,0,320,188);
  rect(c,ping?"#d1ac71":"#b78553",27,7,266,174);
  rect(c,ping?"#285d67":"#2c6952",32,11,256,166);
  for(let y=13;y<176;y+=12)rect(c,ping?"#2b626b":"#306f56",34,y,252,5);
  for(const x of [34,285])rect(c,"#e2d7a4",x,13,1,163);
  rect(c,"#aabf9c",34,93,252,1);
  if(ping){
    rect(c,"#abc6b17b",159,13,1,163);
    for(let x=35;x<285;x+=5)rect(c,"#e8ddab",x,93,2,2);
    rect(c,"#d67561",g.rival-16,bounds.rival-5,32,5);
    rect(c,"#e7b567",g.player-21,bounds.player,42,5);
  }else{
    for(const y of [9,174]){
      rect(c,"#172626",160-goalHalf,y,goalHalf*2,5);
      for(let col=160-goalHalf;col<160+goalHalf;col+=7)rect(c,"#809776",col,y,1,5);
    }
    for(const [x,y,player] of [[g.rival,foosRows.rivalAttack,false],[g.rivalGuard,foosRows.rivalDefense,false],[g.player,foosRows.attack,true],[g.guardX,foosRows.defense,true]]){
      rect(c,"#bcb9a0",29,y-1,262,2);
      for(const offset of [-37,0,37]){
        const lift=player&&g.kick>0?-4:0;
        rect(c,player?"#edb960":"#d66d64",x+offset-5,y-5+lift,10,10);
        rect(c,"#f2dfbd",x+offset-2,y-6+lift,4,3);
      }
    }
  }
  const ready=!ping&&foosReady(g);
  rect(c,"#14272488",g.ball.x-1,g.ball.y,6,4);
  if(!ping&&(g.impact>0||ready)){
    rect(c,ready?"#ffd364":"#fff1bc88",g.ball.x-4,g.ball.y-4,8,1);
    rect(c,ready?"#ffd364":"#fff1bc88",g.ball.x-4,g.ball.y+4,8,1);
  }
  if(ping&&pingReady(g))rect(c,"#efba62",g.ball.x-4,g.ball.y-4,8,8);
  if(ping&&g.powerHit&&g.impact>0){
    rect(c,"#b4d7ce99",g.ball.x-1,g.ball.y+3,3,6);
    rect(c,"#b4d7ce55",g.ball.x,g.ball.y+10,2,4);
  }
  rect(c,"#fff1bc",g.ball.x-2,g.ball.y-2,4,4);
  if(!ping){c.font="bold 7px monospace";c.fillStyle="#fff0ba";c.textAlign="center";c.fillText(local("DIFESA","DEFENCE"),160,167);}
  $("challengeScore").textContent=tr("Tu")+" "+g.you+" · "+g.them+" "+tr("Avversario");
  if(!g.result){
    let prompt=g.wait>0?"Servizio…":"Rimanda la pallina.";
    if(ping&&g.wait===0){
      if(g.impact>0)prompt="Schiacciata!";
      else if(pingReady(g))prompt=local("Ora · Spazio o Schiaccia","Now · Space or Smash");
    }
    if(!ping&&g.wait===0){
      prompt=g.impact>0?(g.powerHit?"Timing perfetto!":"Palla colpita!"):g.kick>0?"Tiro!":ready?"Ora · Spazio o Tira":"Intercetta la palla con una delle due stecche.";
    }
    if($("challengeStatus").textContent!==tr(prompt))$("challengeStatus").textContent=tr(prompt);
  }
}

const suits=["Denari","Coppe","Spade","Bastoni"];
const ranks=[
  ["Asso",11],["Tre",10],["Re",4],["Cavallo",3],["Fante",2],
  ["Sette",0],["Sei",0],["Cinque",0],["Quattro",0],["Due",0]
];
function startBriscola(){
  const deck=suits.flatMap(suit=>ranks.map(([name,points],order)=>({suit,name,points,order})));
  for(let i=deck.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [deck[i],deck[j]]=[deck[j],deck[i]];
  }
  const hands=[deck.splice(0,3),deck.splice(0,3)];
  return {id:"bris",kind:"cards",deck,hands,trump:deck.at(-1),table:[null,null],score:[0,0],
    leader:0,turn:0,tricks:0,phase:"playing",result:null,note:"Tocca a te."};
}
function takesTrick(lead,reply,trump){
  return lead.suit===reply.suit?reply.order<lead.order:reply.suit===trump;
}
function cardName(card){
  return card?tr(card.name)+local(" di "," of ")+tr(card.suit):"—";
}
function playCard(g,side,index){
  if(g!==minigame||g.phase!=="playing"||g.turn!==side||!g.hands[side][index])return;
  g.table[side]=g.hands[side].splice(index,1)[0];
  if(!g.table[1-side]){
    g.turn=1-side;
    g.note=g.turn===0?"Tocca a te.":"L’avversario sceglie…";
    renderBriscola(g.turn===0);
    if(g.turn===1)g.timer=setTimeout(()=>rivalCard(g),440);
    return;
  }
  const follower=1-g.leader;
  const taker=takesTrick(g.table[g.leader],g.table[follower],g.trump.suit)?follower:g.leader;
  const points=g.table[0].points+g.table[1].points;
  g.score[taker]+=points;
  g.tricks++;
  g.phase="trick";
  g.note=(taker===0?"Prendi tu":"Prende l’avversario")+" · "+points+(points===1?" punto":" punti");
  renderBriscola();
  if(g.tricks===20){
    endChallenge(g,g.score[0]>60?"win":g.score[0]<60?"loss":"tie");
    return;
  }
  g.timer=setTimeout(()=>{
    if(g!==minigame)return;
    if(g.deck.length){
      g.hands[taker].push(g.deck.shift());
      g.hands[1-taker].push(g.deck.shift());
    }
    g.table=[null,null];g.leader=taker;g.turn=taker;g.phase="playing";
    g.note=taker===0?"Tocca a te.":"L’avversario apre la mano…";
    renderBriscola(taker===0);
    if(taker===1)g.timer=setTimeout(()=>rivalCard(g),400);
  },630);
}
function rivalCard(g){
  if(g!==minigame)return;
  const hand=g.hands[1],lead=g.table[0],trump=g.trump.suit;
  const cost=card=>card.points*3+(card.suit===trump?21:0)+(9-card.order);
  const sorted=[...hand].sort((a,b)=>cost(a)-cost(b));
  const winning=lead&&sorted.find(card=>takesTrick(lead,card,trump));
  const chosen=winning&&(lead.points>=2||winning.suit===lead.suit||!g.deck.length)?winning:sorted[0];
  playCard(g,1,hand.indexOf(chosen));
}
function renderBriscola(focus=false){
  const g=minigame;
  $("challengeScore").textContent=tr("Tu")+" "+g.score[0]+" · "+g.score[1]+" "+tr("Avversario");
  $("trump").textContent=g.deck.length?cardName(g.trump):tr(g.trump.suit);
  $("deckCount").textContent=g.deck.length+local(" da pescare · Mano "," left · Trick ")+Math.min(g.tricks+(g.phase==="trick"?0:1),20)+"/20";
  $("playedPlayer").textContent=cardName(g.table[0]);
  $("playedRival").textContent=cardName(g.table[1]);
  $("challengeStatus").textContent=tr(g.note.split(" · ")[0])+(g.note.includes(" · ")?" · "+local(g.note.split(" · ")[1],g.note.split(" · ")[1].replace(/punt[oi]/,"pt")):"");
  const hand=$("cardHand");
  hand.replaceChildren();
  for(const [index,card] of g.hands[0].entries()){
    const button=document.createElement("button");
    const suit=document.createElement("span");
    button.textContent=(index+1)+". "+tr(card.name);
    suit.textContent=tr(card.suit)+" · "+card.points+" pt";
    suit.className="card-suit";
    button.classList.toggle("trump-card",card.suit===g.trump.suit);
    button.append(suit);
    button.disabled=g.turn!==0||g.phase!=="playing";
    button.onclick=()=>playCard(g,0,index);
    hand.append(button);
  }
  if(focus)hand.querySelector("button:not(:disabled)")?.focus();
}
