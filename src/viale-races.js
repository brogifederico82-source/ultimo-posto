const vialeRunners=[
  {name:"Freccia di Panama",weight:40,payout:2,color:"#68d9ff"},
  {name:"Vento del Dome",weight:30,payout:3,color:"#fc9f72"},
  {name:"Lampone",weight:20,payout:4,color:"#f890c2"},
  {name:"Ultimo Treno",weight:10,payout:8,color:"#b4ec7f"}
];
function startVialeRace(){
  return {id:"cavalli",kind:"cavalli",pick:0,started:null,result:null};
}
function pickVialeWinner(roll){
  let boundary=0;
  return vialeRunners.findIndex(horse=>roll<(boundary+=horse.weight));
}
function raceReturn(g){
  const stake=$("raceStake").valueAsNumber;
  $("raceReturn").textContent=Number.isInteger(stake)&&stake>0&&stake<=Number($("raceStake").max)?
    local("Incasso se vince: ","Payout if your pick wins: ")+stake*vialeRunners[g.pick].payout:
    local("Corsa gratuita con puntata a zero","Set stake to zero for a free race");
}
function renderVialeRace(g){
  const rows=$("raceHorses");
  rows.replaceChildren();
  g.lanes=[];
  for(const [index,horse] of vialeRunners.entries()){
    const row=document.createElement("div");
    row.style.setProperty("--runner-color",horse.color);
    const button=document.createElement("button");
    const number=document.createElement("span");
    number.className="race-number";
    number.textContent=index+1;
    const name=document.createElement("span");
    name.textContent=horse.name;
    const odds=document.createElement("small");
    odds.textContent=horse.payout+"× · "+horse.weight+"%";
    button.append(number,name,odds);
    button.setAttribute("aria-pressed",String(index===g.pick));
    button.onclick=()=>{
      g.pick=index;
      raceReturn(g);
      for(const [i,lane] of g.lanes.entries())lane.button.setAttribute("aria-pressed",String(i===g.pick));
    };
    const track=document.createElement("div");
    track.className="race-track";
    const token=document.createElement("span");
    token.textContent="♞";token.setAttribute("aria-hidden","true");
    const place=document.createElement("span");
    place.className="race-place";place.hidden=true;
    track.append(token);row.append(button,track,place);rows.append(row);
    g.lanes.push({row,button,token,place});
  }
  const stake=$("raceStake");
  stake.value=0;stake.disabled=false;
  stake.max=testMode?0:Math.min(5,wallet().coins);
  $("raceStakeText").textContent=local("Puntata","Stake");
  $("raceStart").textContent=local("Fai partire la corsa","Start race");
  $("raceStart").disabled=false;
  $("raceSignal").textContent=local("Griglia di partenza","Starting grid");
  $("raceSignal").dataset.phase="grid";
  $("raceLeader").textContent=local("Quattro cavalli in pista","Four horses on track");
  stake.oninput=()=>raceReturn(g);
  raceReturn(g);
  $("challengeScore").textContent=local("Monete disponibili: ","Coins available: ")+(testMode?0:wallet().coins);
  $("challengeStatus").textContent=local("Scegli un cavallo.","Choose a horse.");
  g.lanes[0].button.focus();
}
$("raceStart").onclick=()=>{
  const g=minigame;
  const input=$("raceStake");
  const stake=input.valueAsNumber;
  if(g?.kind!=="cavalli"||g.started!==null||!input.reportValidity()||!Number.isInteger(stake)||
    stake<0||stake>5||stake>(testMode?0:wallet().coins))return;
  g.winner=pickVialeWinner(Math.random()*100);
  g.payout=g.winner===g.pick?stake*vialeRunners[g.winner].payout:0;
  g.stake=stake;
  if(stake){
    wallet().coins+=g.payout-stake;
    if(!save()){
      wallet().coins-=g.payout-stake;
      $("challengeStatus").textContent=local("Salvataggio non riuscito. Riprova.","Could not save. Try again.");
      return;
    }
  }
  g.order=[g.winner,...shuffleCards(vialeRunners.map((_,index)=>index).filter(index=>index!==g.winner))];
  g.paces=vialeRunners.map((_,index)=>{
    const finish=1-g.order.indexOf(index)*.035;
    return [0,.18+Math.random()*.15,.39+Math.random()*.17,.67+Math.random()*.16,finish];
  });
  g.started=performance.now();
  g.phase="";
  if(g.stake&&!testMode)refreshWallet();
  g.lanes.forEach(lane=>{lane.button.disabled=true;});
  input.disabled=$("raceStart").disabled=true;
  $("challengeStatus").textContent=local("Puntata chiusa.","Entry closed.");
};
function tickVialeRace(g,now){
  if(g.started===null||g.result)return;
  const countdown=reducedMotion?450:2100;
  const duration=reducedMotion?850:5200;
  const elapsed=now-g.started;
  const progress=Math.min(1,Math.max(0,(elapsed-countdown)/duration));
  const signal=$("raceSignal");
  const phase=elapsed<countdown?String(Math.ceil((countdown-elapsed)/(countdown/3))):
    progress===1?"finish":progress>=.73?"sprint":"race";
  if(phase!==g.phase){
    g.phase=phase;
    signal.dataset.phase=phase;
    signal.textContent=phase==="finish"?local("Traguardo","Finish"):
      phase==="sprint"?local("Rettilineo finale","Final stretch"):
      phase==="race"?local("Via!","Go!"):phase;
    if(phase!=="finish"&&phase!=="sprint")chime(phase==="race"?[65,72]:[55],.08);
  }
  const segment=Math.min(3,Math.floor(progress*4));
  const ratio=progress*4-segment;
  const positions=g.paces.map(pace=>pace[segment]+(pace[segment+1]-pace[segment])*ratio);
  const standings=positions.map((_,index)=>index).sort((a,b)=>positions[b]-positions[a]);
  if(progress>0&&(g.leader!==standings[0]||progress===1)){
    g.leader=standings[0];
    $("raceLeader").textContent=local(progress===1?"Vincitore · ":"In testa · ",progress===1?"Winner · ":"Leader · ")+vialeRunners[g.leader].name;
  }
  for(const [index,lane] of g.lanes.entries()){
    if(!reducedMotion||progress===1)lane.token.style.left=(positions[index]*100)+"%";
    lane.row.classList.toggle("race-leading",progress>0&&standings[0]===index);
    if(progress===1){
      lane.place.hidden=false;lane.place.textContent=(standings.indexOf(index)+1)+"°";
    }
  }
  if(progress<1)return;
  g.result=g.winner===g.pick?"win":"loss";
  const result=local("Vince ","Winner: ")+vialeRunners[g.winner].name;
  const change=g.stake?(g.payout?local("Incasso: ","Payout: ")+g.payout:local("Puntata persa: ","Stake lost: ")+g.stake):local("Corsa gratuita","Free race");
  $("challengeStatus").textContent=result+" · "+change;
  $("challengeScore").textContent=local("Monete disponibili: ","Coins available: ")+(testMode?0:wallet().coins);
  if(!testMode)refreshWallet();
  $("challengeReplay").textContent=local("Altra corsa","Race again");
  $("challengeReplay").hidden=false;
  $("challengeReplay").focus();
  chime(g.result==="win"?[60,67,72]:[55,48]);
}
