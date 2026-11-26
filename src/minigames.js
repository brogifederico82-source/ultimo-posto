let minigame=null;
const touchGameplay=window.matchMedia?.("(max-width: 760px), (pointer: coarse) and (max-height: 600px)")??{matches:false};
const court=$("challengeCourt");
const courtInk=court.getContext("2d");
court.tabIndex=0;
const arcadeRules={
  arm:"Premi Spazio o Spingi nella fascia verde. Ogni passaggio concede un tentativo. Vince chi prende due round.",
  dance:"Segui le frecce prima che scada il tempo. Servono almeno quattro mosse su cinque.",
  ping:"Muovi la racchetta con ←/→ o A/D. Premi Spazio o il pulsante per servire. Durante lo scambio il bordo della racchetta cambia la direzione del tiro. Premi Schiaccia quando compare il mirino. Si gioca a 7 punti, con due di vantaggio.",
  foos:"Muovi le stecche con ←/→ o A/D. La difesa para da sola. Premi Spazio o Tira quando si accende l’omino vicino alla palla. Tieni una direzione mentre tiri con il tempo giusto per usare la sponda. Vince chi segna 3 gol.",
  bris:"Scegli una carta con il mouse o con i tasti 1, 2 e 3. La briscola batte gli altri semi. Nel seme di apertura e in quello di briscola l’ordine è Asso, Tre, Re, Cavallo, Fante, 7, 6, 5, 4, 2. Vince chi supera 60 punti."
};
const prizes={
  calcetto:["Gettone Calcetto","Hai battuto Matteo a calcetto."],
  mattoni:["Gettone Pixel Mattoni","Hai ripulito il tabellone del LOFT."],
  nastri:["Gettone Salva i nastri","Le cassette sono tutte in salvo."],
  poker:["Carta del giardino","Hai conquistato il tavolo del giardino."],
  scopa:["Settebello del campus","Tessera del tavolo di Scopa aggiunta al diario."],
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
  sound(hit?"rhythm":"bounce");
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
  const zoneX=left+round.left*width,zoneW=(round.right-round.left)*width;
  rect(c,"#92bb82",zoneX,160,zoneW,11);
  rect(c,"#e2f4ac",zoneX,160,zoneW,1);
  for(let n=0;n<5;n++)rect(c,n<g.attempts?"#5d8076":"#e6d7ac",139+n*9,178,6,2);
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
  $("danceCue").dataset.beat=g.hits.at(-1)===true?"hit":g.hits.at(-1)===false?"miss":"";
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
  if(hit){g.score++;sound("rhythm");}
  else sound("bounce");
  g.index++;
  if(g.index===5){
    endChallenge(g,g.score>=4?"win":"loss");
    $("danceMeter").value=0;
  }
  else{
    const duration=[1450,1300,1180,1080,1000][g.index];
    g.deadline=performance.now()+duration;
    $("danceMeter").max=duration;
    $("danceMeter").value=duration;
  }
  renderDance();
}
function tickDance(now){
  const g=minigame;
  if(g.result)return;
  if(!g.deadline){$("danceMeter").max=1450;g.deadline=now+1450;sound("whistle");}
  $("danceMeter").value=Math.max(0,g.deadline-now);
  if(now>=g.deadline)danceInput(-1);
}
for(const [i,button] of [...$("dancePad").querySelectorAll("button")].entries())button.onclick=()=>danceInput(i);
function openChallenge(id,practice=false){
  keys.clear();controls.clear();
  $("challengeAudio").open=false;
  const isLoft=Object.hasOwn(loftGames,id);
  const isVirtual=id==="virtuali",isCalcetto=id==="calcetto",isRace=id==="cavalli",isScopa=id==="scopa",isPoker=id==="poker",isCards=id==="bris"||isScopa||isPoker,isDance=id==="dance",isArm=id==="arm";
  $("dancePad").hidden=!isDance;
  if(isDance)minigame={id,kind:"dance",index:0,score:0,result:null,hits:[],steps:Array.from({length:5},()=>Math.floor(Math.random()*4)),deadline:0};
  else if(isArm)minigame=startArm();
  else if(isLoft)minigame=startLoftGame(id);
  else if(isPoker)minigame=startHoldem();
  else if(isRace)minigame=startVialeRace();
  else if(isVirtual)minigame=startVirtualFootball();
  else if(isCalcetto)minigame=startCalcetto();
  else minigame=isScopa?startScopa():isCards?startBriscola():startArcade(id);
  minigame.practice=practice;
  $("challengeTitle").textContent=tr(challengeNames[id])+(practice?" · Allenamento":"");
  $("challengeRules").textContent=isScopa?local(
    "Gioca con mouse, tocco o tasti 1, 2, 3. Se puoi fare più prese, scegli quella che preferisci.",
    "Play with mouse, touch, or keys 1, 2, 3. If there are several captures, choose the one you want."
  ):isCalcetto?local("←/→ o A/D per muoverti, ↑ o W per saltare, Spazio per tirare. Vince chi arriva a "+(practice?3:5)+" gol o è avanti allo scadere.",
    "Use ←/→ or A/D to move, ↑ or W to jump and Space to shoot. Reach "+(practice?3:5)+" goals or lead when time runs out."):
    isVirtual?local("Scegli un esito e punta fino a 5 monete del campus. A zero guardi gratis.",
      "Pick one outcome and stake up to 5 campus coins. Set zero to watch for free."):
    isRace?local("Scegli il vincente. Puoi puntare da 0 a 5 monete del campus. La quota indica il totale restituito in caso di vittoria.",
    "Pick the winner. Stake 0 to 5 campus coins. The odds are the total payout if your horse wins."):
    isPoker?local("Bui 1/2. Parti con 100 fiches. Usa la migliore combinazione di cinque carte tra le tue due e le cinque comuni.",
    "Blinds 1/2. Start with 100 chips. Make the best five-card hand from your two cards and the five community cards."):
    isLoft?loftGames[id].rules:tr(arcadeRules[id]);
  if(practice&&id==="ping")$("challengeRules").textContent=local(
    "Allenamento a 3 punti. Trascina o usa le frecce per muovere la racchetta. Premi Spazio per servire o schiacciare.",
    "Practice to 3 points. Drag or use arrow keys to move the paddle. Press Space to serve or smash.");
  if(practice&&id==="foos")$("challengeRules").textContent=local(
    "Allenamento a 2 gol. Trascina o usa le frecce per muovere le stecche. Premi Spazio quando si accende l’omino.",
    "Practice to 2 goals. Drag or use arrow keys to move the rods. Press Space when the player lights up.");
  if(isLoft||(!practice&&(id==="ping"||id==="foos")))$("challengeRules").textContent+=" "+local(
    "Puoi anche trascinare sul campo con il mouse o col dito.",
    "You can also drag on the court with a mouse or your finger."
  );
  $("challengeReplay").textContent=tr("Rivincita");
  $("challengeReplay").hidden=true;
  delete $("challenge").dataset.result;
  $("cardGame").hidden=!isCards;
  $("racePanel").hidden=!isRace;
  $("virtualPanel").hidden=!isVirtual;
  $("brisLegend").hidden=id!=="bris";
  $("brisLegend").open=id==="bris"&&!touchGameplay.matches;
  $("scopaLegend").hidden=!isScopa;
  $("scopaLegend").open=isScopa&&!touchGameplay.matches;
  $("brisTable").hidden=id!=="bris";
  $("scopaTable").hidden=!isScopa;
  $("pokerTable").hidden=!isPoker;
  $("cardHand").hidden=isPoker;
  if(isScopa){
    $("scopaHelpTitle").textContent=local("Come si gioca a Scopa","How to play Scopa");
    $("scopaHelpCapture").textContent=local(
      "Prendi una carta dello stesso valore, oppure carte che sommate danno quel valore. Asso vale 1, fante 8, cavallo 9, re 10. Una carta uguale ha la precedenza sulla somma. Se non puoi prendere, lasci la carta sul tavolo.",
      "Capture a card of equal value, or cards that add to that value. Ace is 1, jack 8, knight 9, and king 10. An equal card takes precedence. If you cannot capture, leave your card on the table."
    );
    $("scopaHelpScore").textContent=local(
      "Svuotare il tavolo vale una scopa, salvo all’ultima giocata. Più carte, più denari, settebello e primiera valgono un punto ciascuno. Vince chi arriva ad almeno 11 con più punti dell’avversario.",
      "Clearing the table scores a sweep, except on the final play. Most cards, most coins, the seven of coins, and the best prime each score one. Reach at least 11 and outscore your opponent to win."
    );
  }
  refreshLanguage();
  court.hidden=isCards||isDance||isRace||isVirtual;
  $("challengeLeft").hidden=$("challengeRight").hidden=isCards||isDance||isArm||isRace||isVirtual;
  $("calcettoJump").hidden=!isCalcetto;
  $("calcettoJump").textContent=local("Salta","Jump");
  $("challengeShot").classList.remove("shot-ready");
  $("challengeShot").hidden=isCards||isDance||isRace||isVirtual||id==="nastri";
  $("challengeShot").textContent=tr(id==="mattoni"?"Lancia":isArm?"Spingi":id==="ping"?"Schiaccia":"Tira");
  $("challengeStatus").textContent="";
  if(!$("challenge").open){
    $("challenge").showModal();
    if(typeof transizione==="function")transizione("battaglia",null,{subito:true});
  }
  if(isCards)sound("deal");
  if(isPoker)advanceHoldem(minigame);
  if(isDance){renderDance();$("dancePad").querySelector("button").focus();}
  else if(isScopa)renderScopa(true);
  else if(isPoker)$("holdemCall").focus();
  else if(isRace)renderVialeRace(minigame);
  else if(isVirtual)renderVirtualFootball(minigame);
  else if(isCalcetto){paintCalcetto(minigame);court.focus();}
  else if(isCards)renderBriscola(true);
  else{if(isArm)paintArm(minigame,performance.now());else if(isLoft)paintLoftGame(minigame);else paintCourt(minigame);court.focus();}
}
function scheduleChallenge(g,run,delay){
  clearTimeout(g.timer);
  g.pendingMove={run,ends:performance.now()+delay};
  g.timer=setTimeout(()=>{
    if(g!==minigame)return;
    g.pendingMove=null;
    run();
  },delay);
}
function closeChallenge(){
  if(!minigame)return;
  clearTimeout(minigame.timer);
  minigame=null;keys.clear();controls.clear();
  $("challenge").close();
  if(typeof transizione==="function"&&screen==="game")transizione("battaglia",null,{subito:true});
  if(screen==="game"){renderScene();$("choices").querySelector("button")?.focus();}
}
$("challengeExit").onclick=closeChallenge;
$("challenge").addEventListener("cancel",event=>{event.preventDefault();closeChallenge();});
$("challengeReplay").onclick=()=>openChallenge(minigame.id,minigame.practice);
$("challengeShot").onclick=()=>minigame?.kind==="arm"?armPush():minigame?.kind==="calcetto"?kickCalcetto(minigame.you):arcadeAction();
$("calcettoJump").onclick=()=>{if(minigame?.kind==="calcetto")jumpCalcetto(minigame.you);};
for(const [id,direction] of [["challengeLeft","left"],["challengeRight","right"]]){
  const button=$(id);
  button.onpointerdown=event=>{button.setPointerCapture(event.pointerId);controls.add(direction);};
  button.onlostpointercapture=()=>controls.delete(direction);
  button.onpointerup=()=>controls.delete(direction);
  button.onpointercancel=()=>controls.delete(direction);
}

function aimCourt(event){
  if(minigame?.kind!=="arcade"&&minigame?.kind!=="loft")return;
  const bounds=court.getBoundingClientRect();
  if(bounds.width)minigame.pointerAim=clamp((event.clientX-bounds.left)/bounds.width*320,0,320);
}
court.onpointerdown=event=>{court.setPointerCapture(event.pointerId);aimCourt(event);};
court.onpointermove=event=>{if(court.hasPointerCapture(event.pointerId))aimCourt(event);};
court.onlostpointercapture=()=>{if(minigame)minigame.pointerAim=null;};

function endChallenge(g,result){
  g.result=result;
  segretiFineSfida(g,result);
  $("challenge").dataset.result=result;
  if(g.practice){
    $("challengeStatus").textContent=result==="win"?local("Allenamento vinto. Premi Rivincita per riprovare.","Practice won. Select Rematch to play again."):local("Allenamento concluso. Premi Rivincita per riprovare.","Practice finished. Select Rematch to play again.");
    $("challengeReplay").hidden=false;
    $("challengeReplay").focus();
    return;
  }
  const [item,unlock,secret,description]=prizes[g.id];
  if(result==="win"){
    if(!won(g.id)){
      state.wins[g.id]=true;
      awardCoins(3);
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
  if(g.id==="ping"){
    g.pingPlayerServe=(g.you+g.them<12?Math.floor((g.you+g.them)/2):g.you+g.them)%2===0;
    g.ball={x:g.pingPlayerServe?g.player:g.rival,y:g.pingPlayerServe?bounds.player-5:bounds.rival+5,vx:0,vy:0};
    g.wait=g.pingPlayerServe?0:.76;g.rally=0;g.kick=0;g.impact=0;g.powerHit=false;
    return;
  }
  g.ball={x:160,y:94,vx:[39,-32,24,-45][(g.you+g.them)%4],vy:towardPlayer?100:-100};
  g.wait=.72;g.rally=0;g.kick=0;g.guardX=160;g.rivalGuard=160;g.impact=0;g.powerHit=false;
}
function arcadeAction(){
  const g=minigame;
  if(g?.kind==="loft"){launchLoftBall(g);return;}
  if(g?.id==="ping"&&!g.result&&g.pingPlayerServe){
    const aim=clamp(160+(g.player-160)*1.15,48,272);
    Object.assign(g.ball,{x:g.player,y:bounds.player-5,vx:(aim-g.player)*130/109,vy:-130});
    g.pingPlayerServe=false;
    chime([62,69]);
    return;
  }
  if(g?.kind!=="arcade"||g.result||g.wait>0||g.kick!==0)return;
  g.kick=g.id==="ping"?(g.practice?.23:.18):.25;
}
function arcadePoint(g,player){
  if(player)g.you++;else g.them++;
  g.lastPoint=player;
  const matchOver=g.id==="ping"?Math.max(g.you,g.them)>=(g.practice?3:7)&&Math.abs(g.you-g.them)>=(g.practice?1:2):Math.max(g.you,g.them)>=(g.practice?2:3);
  if(matchOver){
    g.ball.vx=0;g.ball.vy=0;
    endChallenge(g,player?"win":"loss");
  }else{
    sound(g.id==="foos"?"goal":"finish");
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
    g.player=g.pointerAim==null?clamp(g.player+(Number(right)-Number(left))*227*dt,54,266):clamp(g.pointerAim,54,266);
    if(g.id==="ping")tickPing(g,dt);
    else if(g.wait>0)g.wait=Math.max(0,g.wait-dt);
    else if(g.id==="foos"){
      let remaining=dt;
      while(remaining>0&&g.wait===0&&!g.result){
        const step=Math.min(remaining,1/120);
        stepFoos(g,step);remaining-=step;
      }
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
function foosDirection(){
  const left=keys.has("a")||keys.has("arrowleft")||controls.has("left");
  const right=keys.has("d")||keys.has("arrowright")||controls.has("right");
  return Number(right)-Number(left);
}
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
  // Leave a short reaction window after possession changes, even on a bank shot.
  const tracking=g.impact<.09;
  const attackAim=attacking?(tracking?predicted(foosRows.rivalAttack)+slip:g.rival):160;
  const defenseAim=defending?(tracking?predicted(foosRows.rivalDefense)-slip:g.rivalGuard):160;
  g.rival=approach(g.rival,clamp(attackAim,63,257),(g.practice?70:102)*dt);
  g.rivalGuard=approach(g.rivalGuard,clamp(defenseAim,105,215),(g.practice?43:64)*dt);
  if(g.kick>0){
    g.kick=Math.max(0,g.kick-dt);
    if(g.kick===0)g.kick=-.16;
  }else if(g.kick<0)g.kick=Math.min(0,g.kick+dt);
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<bounds.left||b.x>bounds.right){b.x=reflectCourt(b.x);b.vx*=-1;sound("bounce");}
  if(b.vy>0){
    for(const [row,rod,defender] of [[foosRows.attack,g.player,false],[foosRows.defense,g.guardX,true]]){
      const offset=meetRow(g,row,previousY,rod,defender?10:12);
      if(offset===null||(!defender&&g.kick<=0))continue;
      const perfect=g.kick>=.055&&g.kick<=.15;
      const power=g.kick>0?(perfect?265:196):145;
      const aim=clamp(160+offset*7+(g.player-160)*.13,114,206);
      const direction=perfect&&!defender?foosDirection():0;
      const wall=direction<0?bounds.left:bounds.right;
      const targetX=direction?2*wall-aim:aim;
      b.y=row-.4;b.vy=-power;
      b.vx=(targetX-b.x)*power/(b.y-bounds.top);
      if(g.kick>0)g.kick=-.17;
      g.rally++;g.impact=perfect?.28:.13;g.powerHit=perfect;g.bankHit=Boolean(direction);chime(perfect?[61,73]:[61]);return;
    }
  }else{
    for(const [row,rod,radius] of [[foosRows.rivalAttack,g.rival,6],[foosRows.rivalDefense,g.rivalGuard,7]]){
      const offset=meetRow(g,row,previousY,rod,radius);
      if(offset===null)continue;
      const aim=[122,200,145,178,130][g.rally%5];
      b.y=row+.4;b.vy=175+Math.min(g.rally*5,34);
      b.vx=(aim-b.x)*b.vy/(bounds.bottom-row);
      g.rally++;g.impact=.13;g.powerHit=false;g.bankHit=false;chime([53]);return;
    }
  }
  if(b.y<bounds.top||b.y>bounds.bottom){
    if(Math.abs(b.x-160)<=goalHalf){arcadePoint(g,b.y<bounds.top);return;}
    b.y=b.y<bounds.top?bounds.top+(bounds.top-b.y):bounds.bottom-(b.y-bounds.bottom);
    b.vy*=-1;sound("post");
    b.vx=clamp(b.vx+(160-b.x)*.20,-170,170);
  }
}
function tickPing(g,dt){
  if(g.pingPlayerServe){g.ball.x=g.player;return;}
  if(g.wait>0){
    g.wait=Math.max(0,g.wait-dt);
    if(g.wait===0){
      const aim=[110,204,155,224,94][(g.you+g.them)%5];
      g.ball.vy=123;g.ball.vx=(aim-g.ball.x)*123/(bounds.player-g.ball.y);
      chime([55,60]);
    }
    return;
  }
  while(dt>0&&!g.wait&&!g.result&&!g.pingPlayerServe){
    const step=Math.min(dt,1/120);
    stepPingBall(g,step);
    dt-=step;
  }
}
function pingIntercept(b,row){
  return reflectCourt(b.x+b.vx*((row-b.y)/b.vy));
}
function stepPingBall(g,dt){
  const b=g.ball,previousY=b.y,previousX=b.x;
  g.impact=Math.max(0,g.impact-dt);
  g.kick=Math.max(0,g.kick-dt);
  const rivalCanRead=b.vy<0&&b.y<108&&b.y>bounds.rival;
  const error=[-10,12,-17,8,16][(g.rally+g.you+g.them)%5];
  const target=rivalCanRead?pingIntercept(b,bounds.rival)+error:160;
  g.rival=approach(g.rival,clamp(target,56,264),(rivalCanRead?(g.practice?88:140):72)*dt);
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<bounds.left||b.x>bounds.right){b.x=reflectCourt(b.x);b.vx*=-1;sound("bounce");}
  const row=b.vy>0?bounds.player:bounds.rival;
  const crossed=b.vy>0?previousY<row&&b.y>=row:previousY>row&&b.y<=row;
  const hitX=crossed?previousX+(b.x-previousX)*(row-previousY)/(b.y-previousY):b.x;
  if(crossed&&b.vy>0&&Math.abs(hitX-g.player)<=23){
    const smash=g.kick>0;
    const aim=clamp(hitX+(hitX-g.player)*(smash?6.5:4.5),46,274);
    b.x=hitX;b.y=row-.1;b.vy=-Math.min(smash?263:195,b.vy+(smash?76:10));
    b.vx=(aim-hitX)*-b.vy/(bounds.player-bounds.rival);
    g.kick=0;g.powerHit=smash;g.impact=smash?.34:.12;
    g.rally++;chime(smash?[66,78]:[66]);
  }else if(crossed&&b.vy<0&&Math.abs(hitX-g.rival)<=18){
    const aim=clamp(160+(g.player<160?1:-1)*(43+g.rally%4*11),53,267);
    b.x=hitX;b.y=row+.1;b.vy=Math.min(200,-b.vy+9);
    b.vx=(aim-hitX)*b.vy/(bounds.player-bounds.rival);
    g.powerHit=false;
    g.rally++;chime([54]);
  }
  if(b.y<bounds.top||b.y>bounds.bottom)arcadePoint(g,b.y<bounds.top);
}
function foosReady(g){
  const b=g.ball;
  if(b.vy<=0||g.wait!==0||g.kick!==0)return null;
  for(const [row,rod,radius] of [[foosRows.attack,g.player,12],[foosRows.defense,g.guardX,10]]){
    const time=(row-b.y)/b.vy;
    if(time<.10||time>.18)continue;
    const x=reflectCourt(b.x+b.vx*time);
    const offset=rodOffset(x,rod);
    if(Math.abs(offset)<=radius)return {x:x-offset,row};
  }
  return null;
}
function pingReady(g){
  const b=g.ball,time=(bounds.player-b.y)/b.vy;
  return !g.result&&b.vy>0&&g.wait===0&&time>=0&&time<=(g.practice?.23:.18)&&Math.abs(pingIntercept(b,bounds.player)-g.player)<=23;
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
    rect(c,"#172e3eb5",g.rival-17,bounds.rival-1,35,5);
    rect(c,"#d67561",g.rival-16,bounds.rival-5,32,5);
    rect(c,"#172e3eb5",g.player-22,bounds.player+3,45,5);
    rect(c,"#e7b567",g.player-21,bounds.player,42,5);
    if(g.ball.vy>0&&g.ball.y>94){
      const landing=pingIntercept(g.ball,bounds.player);
      rect(c,pingReady(g)?"#ffd782":"#c9e4d18f",landing-3,bounds.player+8,7,2);
    }
  }else{
    for(const y of [9,174]){
      rect(c,"#172626",160-goalHalf,y,goalHalf*2,5);
      for(let col=160-goalHalf;col<160+goalHalf;col+=7)rect(c,"#809776",col,y,1,5);
    }
    for(const [x,y,player] of [[g.rival,foosRows.rivalAttack,false],[g.rivalGuard,foosRows.rivalDefense,false],[g.player,foosRows.attack,true],[g.guardX,foosRows.defense,true]]){
      rect(c,"#102925aa",29,y+2,262,2);
      rect(c,"#aeb7ac",25,y-1,270,3);
      rect(c,"#e3e7d4",25,y-1,270,1);
      rect(c,player?"#247e91":"#99554e",player?284:17,y-3,18,6);
      for(const offset of [-37,0,37]){
        const turn=player&&g.kick!==0?Math.sin(Math.abs(g.kick)*9):0;
        const shift=reducedMotion?0:turn*4;
        rect(c,"#173a36aa",x+offset-4,y+3,8,5);
        rect(c,player?"#73d9f5":"#eea065",x+offset-4,y-4-shift,8,8);
        rect(c,"#f2dfbd",x+offset-2,y-7-shift,4,4);
        rect(c,"#26313d",x+offset-3,y+3+shift,6,2);
      }
    }
  }
  const ready=!ping&&foosReady(g);
  rect(c,"#14272488",g.ball.x-1,g.ball.y,6,4);
  if(!ping&&(g.impact>0||ready)){
    rect(c,ready?"#ffd364":"#fff1bc88",g.ball.x-4,g.ball.y-4,8,1);
    rect(c,ready?"#ffd364":"#fff1bc88",g.ball.x-4,g.ball.y+4,8,1);
  }
  if(ready){
    rect(c,"#ffd364",ready.x-7,ready.row-10,14,1);
    rect(c,"#ffd364",ready.x-7,ready.row+7,14,1);
  }
  if(ping&&pingReady(g))rect(c,"#efba62",g.ball.x-4,g.ball.y-4,8,8);
  if(ping&&!reducedMotion&&g.wait===0&&!g.pingPlayerServe&&!g.result){
    for(let i=3;i>0;i--)rect(c,"#c9eff544",g.ball.x-g.ball.vx*i*.015-1,g.ball.y-g.ball.vy*i*.015-1,3,3);
  }
  if(ping&&g.powerHit&&g.impact>0){
    rect(c,"#b4d7ce99",g.ball.x-1,g.ball.y+3,3,6);
    rect(c,"#b4d7ce55",g.ball.x,g.ball.y+10,2,4);
  }
  rect(c,"#fff1bc",g.ball.x-2,g.ball.y-2,4,4);
  if(!ping){c.font="bold 7px monospace";c.fillStyle="#fff0ba";c.textAlign="center";c.fillText(local("DIFESA","DEFENCE"),160,167);}
  $("challengeShot").classList.toggle("shot-ready",Boolean(ready||g.pingPlayerServe||(ping&&pingReady(g)))&&!g.result);
  const score=tr("Tu")+" "+g.you+" · "+g.them+" "+tr("Avversario");
  let detail="";
  if(!g.result&&g.rally>0)detail=local("Scambio: ","Rally: ")+g.rally;
  else if(!g.result&&g.lastPoint!==undefined)detail=g.lastPoint?
    local(ping?"Punto tuo":"Gol tuo",ping?"Your point":"Your goal"):
    local(ping?"Punto avversario":"Gol avversario",ping?"Opponent’s point":"Opponent’s goal");
  else if(g.result)detail=local("Risultato finale","Final score");
  $("challengeScore").textContent=detail?score+" · "+detail:score;
  if(!g.result){
    let prompt=g.wait>0?"Servizio…":"Rimanda la pallina.";
    if(ping){
      $("challengeShot").textContent=g.pingPlayerServe?local("Servi","Serve"):local("Schiaccia","Smash");
      if(g.pingPlayerServe)prompt=local("Servizio tuo · Spazio o Servi","Your serve · Space or Serve");
      else if(g.wait>0)prompt=local("Serve l’avversario","Opponent serves");
      else if(g.impact>0&&g.powerHit)prompt=local("Schiacciata!","Smash!");
      else if(pingReady(g))prompt=local("Ora · Spazio o Schiaccia","Now · Space or Smash");
      else prompt=local("Segui la tacca sotto la racchetta","Follow the mark below the paddle");
    }
    if(!ping&&g.wait===0){
      prompt=g.impact>0?(g.bankHit?local("Tiro di sponda!","Bank shot!"):g.powerHit?"Timing perfetto!":"Palla colpita!"):g.kick>0?"Tiro!":ready?"Ora · Spazio o Tira":"Intercetta la palla con una delle due stecche.";
    }
    if($("challengeStatus").textContent!==tr(prompt))$("challengeStatus").textContent=tr(prompt);
  }
}

const suits=["Denari","Coppe","Spade","Bastoni"];
const ranks=[
  ["Asso",11],["Tre",10],["Re",4],["Cavallo",3],["Fante",2],
  ["Sette",0],["Sei",0],["Cinque",0],["Quattro",0],["Due",0]
];
const scopaValues=[1,3,10,9,8,7,6,5,4,2];
const suitMarks={Denari:"●",Coppe:"♥",Spade:"♠",Bastoni:"♣"};
function shuffleCards(deck){
  for(let i=deck.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [deck[i],deck[j]]=[deck[j],deck[i]];
  }
  return deck;
}
function makeCardDeck(){
  sound("shuffle");
  return shuffleCards(suits.flatMap(suit=>ranks.map(([name,points],order)=>({suit,name,points,order,value:scopaValues[order]}))));
}
function startBriscola(){
  const deck=makeCardDeck();
  const hands=[[],[]];
  for(let i=0;i<3;i++)for(const hand of hands)hand.push(deck.shift());
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
  if(g?.id==="scopa"){
    if(side===0)chooseScopaCard(g,index);
    return;
  }
  if(g!==minigame||g.phase!=="playing"||g.turn!==side||!g.hands[side][index])return;
  sound("card");
  g.table[side]=g.hands[side].splice(index,1)[0];
  if(!g.table[1-side]){
    g.turn=1-side;
    g.note=g.turn===0?"Tocca a te.":"L’avversario sceglie…";
    renderBriscola(g.turn===0);
    if(g.turn===1)scheduleChallenge(g,()=>rivalCard(g),320);
    return;
  }
  const follower=1-g.leader;
  const taker=takesTrick(g.table[g.leader],g.table[follower],g.trump.suit)?follower:g.leader;
  const points=g.table[0].points+g.table[1].points;
  g.score[taker]+=points;sound("trick");
  g.tricks++;
  g.phase="trick";
  g.note=(taker===0?"Prendi tu":"Prende l’avversario")+" · "+points+(points===1?" punto":" punti");
  renderBriscola();
  if(g.tricks===20){
    endChallenge(g,g.score[0]>60?"win":g.score[0]<60?"loss":"tie");
    return;
  }
  scheduleChallenge(g,()=>{
    if(g.deck.length){
      g.hands[taker].push(g.deck.shift());
      g.hands[1-taker].push(g.deck.shift());
    }
    g.table=[null,null];g.leader=taker;g.turn=taker;g.phase="playing";
    g.note=taker===0?"Tocca a te.":"L’avversario apre la mano…";
    renderBriscola(taker===0);
    if(taker===1)scheduleChallenge(g,()=>rivalCard(g),400);
  },820);
}
function rivalCard(g){
  if(g!==minigame)return;
  const hand=g.hands[1],lead=g.table[0],trump=g.trump.suit;
  const cost=card=>card.points*3+(card.suit===trump?24:0)+(9-card.order);
  const sorted=[...hand].sort((a,b)=>cost(a)-cost(b));
  const winning=lead&&sorted.find(card=>takesTrick(lead,card,trump));
  const losing=lead&&sorted.find(card=>!takesTrick(lead,card,trump));
  const chosen=winning&&(lead.points>=4||winning.suit!==trump||!g.deck.length||!losing)?winning:losing||sorted[0];
  playCard(g,1,hand.indexOf(chosen));
}
function renderBriscola(focus=false){
  const g=minigame;
  const score=tr("Tu")+" "+g.score[0]+" · "+g.score[1]+" "+tr("Avversario");
  $("challengeScore").textContent=g.score[0]<61&&!g.result?
    score+" · "+(61-g.score[0])+local(" punti per vincere"," points to win"):score;
  $("trump").textContent=g.deck.length?cardName(g.trump):tr(g.trump.suit);
  $("deckCount").textContent=g.deck.length+local(" da pescare · Mano "," left · Trick ")+Math.min(g.tricks+(g.phase==="trick"?0:1),20)+"/20";
  $("playedPlayer").textContent=cardName(g.table[0]);
  $("playedRival").textContent=cardName(g.table[1]);
  $("rivalCardCount").textContent=local("Carte in mano: ","Cards in hand: ")+g.hands[1].length;
  $("challengeStatus").textContent=tr(g.note.split(" · ")[0])+(g.note.includes(" · ")?" · "+local(g.note.split(" · ")[1],g.note.split(" · ")[1].replace(/punt[oi]/,"pt")):"");
  const hand=$("cardHand");
  hand.replaceChildren();
  for(const [index,card] of g.hands[0].entries()){
    const button=document.createElement("button");
    const suit=document.createElement("span");
    button.textContent=(index+1)+". "+tr(card.name);
    suit.textContent=suitMarks[card.suit]+" "+tr(card.suit)+" · "+card.points+" pt";
    suit.className="card-suit";
    button.dataset.suit=card.suit;
    button.classList.toggle("trump-card",card.suit===g.trump.suit);
    button.append(suit);
    button.disabled=g.turn!==0||g.phase!=="playing";
    button.onclick=()=>playCard(g,0,index);
    hand.append(button);
  }
  if(focus)hand.querySelector("button:not(:disabled)")?.focus();
}

function startScopa(score=[0,0],leader=0,round=1){
  const deck=makeCardDeck();
  const board=deck.splice(0,4);
  // Redeal three or four kings, which prevent a normal opening.
  while(board.filter(card=>card.value===10).length>=3){
    deck.push(...board.splice(0));
    shuffleCards(deck);
    board.push(...deck.splice(0,4));
  }
  return {id:"scopa",kind:"cards",deck,board,hands:[deck.splice(0,3),deck.splice(0,3)],
    taken:[[],[]],sweeps:[0,0],score,leader,round,turn:leader,lastCapture:1-leader,
    selected:-1,options:[],result:null,last:null,breakdown:null};
}
function scopaCaptures(board,value){
  const matches=board.flatMap((card,i)=>card.value===value?[[i]]:[]);
  if(matches.length)return matches;
  const options=[];
  function add(from,remaining,indices){
    if(remaining===0){options.push(indices);return;}
    for(let i=from;i<board.length;i++){
      const difference=remaining-board[i].value;
      if(difference>=0)add(i+1,difference,[...indices,i]);
    }
  }
  add(0,value,[]);
  return options;
}
function chooseScopaCard(g,index){
  if(g!==minigame||g.result||g.breakdown||g.turn!==0||!g.hands[0][index])return;
  const options=scopaCaptures(g.board,g.hands[0][index].value);
  if(options.length<=1){playScopa(g,0,index,options[0]??[]);return;}
  g.selected=index;g.options=options;renderScopa(false,true);
}
function playScopa(g,side,index,capture){
  if(g!==minigame||g.result||g.breakdown||g.turn!==side||!g.hands[side][index])return;
  const [card]=g.hands[side].splice(index,1);sound("card");
  g.selected=-1;g.options=[];
  const captured=capture.map(i=>g.board[i]);
  const lastPlay=!g.deck.length&&g.hands.every(hand=>!hand.length);
  let sweep=false;
  if(captured.length){
    g.taken[side].push(card,...captured);
    const indices=new Set(capture);
    g.board=g.board.filter((_,i)=>!indices.has(i));
    g.lastCapture=side;
    sweep=!g.board.length&&!lastPlay;
    if(sweep){g.sweeps[side]++;sound("scopa");}
    else sound("trick");
  }else g.board.push(card);
  g.last={side,card,captured,sweep};
  if(lastPlay){finishScopaRound(g);return;}
  if(g.hands.every(hand=>!hand.length)){
    g.hands=[g.deck.splice(0,3),g.deck.splice(0,3)];
  }
  g.turn=1-side;
  renderScopa(g.turn===0);
  if(g.turn===1)scheduleChallenge(g,()=>rivalScopa(g),540);
}
function rivalScopa(g){
  if(g!==minigame||g.result||g.breakdown||g.turn!==1)return;
  const actions=g.hands[1].flatMap((card,index)=>{
    const options=scopaCaptures(g.board,card.value);
    return (options.length?options:[[]]).map(capture=>{
      const cards=capture.map(i=>g.board[i]);
      const quality=cards.length?cards.length*2+(cards.length===g.board.length?8:0)+
        [card,...cards].reduce((sum,item)=>sum+(item.suit==="Denari"?1:0)+(item.value===7?2:0)+
          (item.value===7&&item.suit==="Denari"?7:0),0):
        -card.value*.15-(card.suit==="Denari"?1:0)-(card.value===7?2:0);
      return {index,capture,quality};
    });
  });
  actions.sort((a,b)=>b.quality-a.quality);
  const move=actions[0];
  if(move)playScopa(g,1,move.index,move.capture);
}
function scopaPrimiera(cards){
  const strengths=[0,16,12,13,14,15,18,21,10,10,10];
  const maxima=suits.map(suit=>Math.max(0,...cards.filter(card=>card.suit===suit).map(card=>strengths[card.value])));
  return maxima.every(Boolean)?maxima.reduce((a,b)=>a+b,0):0;
}
function finishScopaRound(g){
  g.taken[g.lastCapture].push(...g.board.splice(0));
  const totals=g.taken.map(cards=>[cards.length,cards.filter(card=>card.suit==="Denari").length,
    Number(cards.some(card=>card.suit==="Denari"&&card.value===7)),scopaPrimiera(cards)]);
  const calculated=g.sweeps.slice();
  for(let i=0;i<4;i++){
    if(totals[0][i]>totals[1][i])calculated[0]++;
    if(totals[1][i]>totals[0][i])calculated[1]++;
  }
  g.breakdown={totals,calculated};
  g.score=g.score.map((score,i)=>score+calculated[i]);
  renderScopa();
  if(Math.max(...g.score)>=11&&g.score[0]!==g.score[1])endChallenge(g,g.score[0]>g.score[1]?"win":"loss");
  else $("scopaNext").focus();
}
function scopaCardButton(card,label){
  const button=document.createElement("button");
  const suit=document.createElement("span");
  button.textContent=label;
  suit.textContent=suitMarks[card.suit]+" "+tr(card.suit);
  suit.className="card-suit";
  button.dataset.suit=card.suit;
  button.append(suit);
  return button;
}
function renderScopa(focusHand=false,focusCapture=false){
  const g=minigame;
  $("challengeScore").textContent=local("Tu ","You ")+g.score[0]+" · "+g.score[1]+" "+tr("Avversario")+" · "+local("a 11 punti","to 11 points");
  $("scopaCount").textContent=local("Smazzata ","Deal ")+g.round+" · "+local("Mazzo: ","Deck: ")+g.deck.length+
    " · "+local("Avversario: ","Opponent: ")+g.hands[1].length+local(" carte"," cards");
  const layout=$("scopaBoard");layout.replaceChildren();
  for(const card of g.board){
    const tile=document.createElement("span");
    tile.className="scopa-face";tile.dataset.suit=card.suit;
    tile.textContent=suitMarks[card.suit]+" "+cardName(card);
    layout.append(tile);
  }
  if(!g.board.length)layout.textContent=local("Tavolo vuoto","Empty table");
  $("scopaLast").textContent=g.last?
    (g.last.side===0?local("Tu: ","You: "):local("Avversario: ","Opponent: "))+cardName(g.last.card)+
    (g.last.captured.length?" → "+g.last.captured.map(cardName).join(", "):local(" resta sul tavolo"," stays on the table"))+
    (g.last.sweep?local(" · Scopa!"," · Sweep!"):""):"";
  const details=$("scopaBreakdown");details.hidden=!g.breakdown;details.replaceChildren();
  if(g.breakdown){
    const header=document.createElement("strong");
    header.textContent=local("Punti della smazzata","Deal points")+" · "+g.breakdown.calculated.join("–");details.append(header);
    const names=[local("Carte","Cards"),local("Denari","Coins"),"Settebello",local("Primiera","Prime")];
    for(const [index,name] of names.entries()){
      const line=document.createElement("span");
      line.textContent=name+" · "+g.breakdown.totals.map(side=>side[index]).join("–");details.append(line);
    }
    const sweeps=document.createElement("span");sweeps.textContent=local("Scope","Sweeps")+" · "+g.sweeps.join("–");details.append(sweeps);
  }
  $("scopaNext").hidden=!g.breakdown||Math.max(...g.score)>=11&&g.score[0]!==g.score[1];
  $("scopaNext").textContent=local("Prossima smazzata","Next deal");
  $("scopaNext").onclick=()=>{
    if(minigame!==g||!g.breakdown||g.result)return;
    minigame=startScopa(g.score,1-g.leader,g.round+1);renderScopa(minigame.turn===0);
    if(minigame.turn===1){
      const next=minigame;
      scheduleChallenge(next,()=>rivalScopa(next),540);
      $("challengeStatus").focus();
    }
  };
  const captures=$("scopaChoices");captures.replaceChildren();
  for(const option of g.options){
    const button=document.createElement("button");
    button.textContent=option.map(index=>cardName(g.board[index])).join(" + ");
    button.onclick=()=>playScopa(g,0,g.selected,option);
    captures.append(button);
  }
  const hand=$("cardHand");hand.replaceChildren();
  for(const [index,card] of g.hands[0].entries()){
    const button=scopaCardButton(card,(index+1)+". "+tr(card.name));
    button.disabled=g.turn!==0||Boolean(g.breakdown);
    button.setAttribute("aria-pressed",String(g.selected===index));
    button.onclick=()=>chooseScopaCard(g,index);
    hand.append(button);
  }
  $("challengeStatus").textContent=g.breakdown?local("Smazzata conclusa.","Deal complete."):
    g.options.length?local("Scegli quali carte prendere.","Choose which cards to capture."):
      tr(g.turn===0?"Tocca a te.":"L’avversario sceglie…");
  if(focusCapture)captures.querySelector("button")?.focus();
  else if(focusHand)hand.querySelector("button:not(:disabled)")?.focus();
}
