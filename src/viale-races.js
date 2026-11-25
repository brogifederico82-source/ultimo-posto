const vialeRunners=[
  {name:"Freccia di Panama",weight:40,payout:2},
  {name:"Vento del Dome",weight:30,payout:3},
  {name:"Lampone",weight:20,payout:4},
  {name:"Ultimo Treno",weight:10,payout:8}
];
function startVialeRace(){
  return {id:"cavalli",kind:"cavalli",pick:0,started:null,result:null};
}
function pickVialeWinner(roll){
  let boundary=0;
  return vialeRunners.findIndex(horse=>roll<(boundary+=horse.weight));
}
function renderVialeRace(g){
  const rows=$("raceHorses");
  rows.replaceChildren();
  g.lanes=[];
  for(const [index,horse] of vialeRunners.entries()){
    const row=document.createElement("div");
    const button=document.createElement("button");
    button.textContent=horse.name+" · "+horse.payout+"×";
    button.setAttribute("aria-pressed",String(index===g.pick));
    button.onclick=()=>{
      g.pick=index;
      for(const [i,lane] of g.lanes.entries())lane.button.setAttribute("aria-pressed",String(i===g.pick));
    };
    const track=document.createElement("div");
    track.className="race-track";
    const token=document.createElement("span");
    token.textContent="♞";token.setAttribute("aria-hidden","true");
    track.append(token);row.append(button,track);rows.append(row);
    g.lanes.push({button,token});
  }
  const stake=$("raceStake");
  stake.value=0;stake.disabled=false;
  stake.max=testMode?0:Math.min(5,wallet().coins);
  $("raceStakeText").textContent=local("Puntata","Stake");
  $("raceStart").textContent=local("Fai partire la corsa","Start race");
  $("raceStart").disabled=false;
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
  g.started=performance.now();
  g.lanes.forEach(lane=>{lane.button.disabled=true;});
  input.disabled=$("raceStart").disabled=true;
  $("challengeStatus").textContent=local("Sono partiti!","They’re off!");
  chime([60,65,72],.09);
};
function tickVialeRace(g,now){
  if(g.started===null||g.result)return;
  const progress=Math.min(1,Math.max(0,(now-g.started)/(reducedMotion?700:4200)));
  for(const [index,lane] of g.lanes.entries()){
    const position=progress*(index===g.winner?1:.91-index*.022)+Math.sin(progress*9+index)*.05*Math.sin(progress*Math.PI);
    if(!reducedMotion||progress===1)lane.token.style.left=(Math.max(0,position)*100)+"%";
  }
  if(progress<1)return;
  g.result=g.winner===g.pick?"win":"loss";
  const result=local("Vince ","Winner: ")+vialeRunners[g.winner].name;
  const change=g.stake?(g.payout?local("Incasso: ","Payout: ")+g.payout:local("Puntata persa: ","Stake lost: ")+g.stake):local("Corsa gratuita","Free race");
  $("challengeStatus").textContent=result+" · "+change;
  $("challengeScore").textContent=local("Monete disponibili: ","Coins available: ")+(testMode?0:wallet().coins);
  if(!testMode)refreshWallet();
  $("challengeReplay").hidden=false;
  $("challengeReplay").focus();
  chime(g.result==="win"?[60,67,72]:[55,48]);
}
