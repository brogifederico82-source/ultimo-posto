const virtualFixtures=[
  ["Romania FC","Panama United",1.7,1.1],
  ["Dome Athletic","LOFT City",1.35,1.3],
  ["Parenzo Rovers","Pola Sporting",1.05,1.65]
];
const virtualMarkets=[
  {label:"1",wins:(home,away)=>home>away},
  {label:"X",wins:(home,away)=>home===away},
  {label:"2",wins:(home,away)=>home<away},
  {label:"GG",wins:(home,away)=>home>0&&away>0},
  {label:"NG",wins:(home,away)=>home===0||away===0},
  ...[1.5,2.5,3.5,4.5].flatMap(line=>[
    {label:"Over "+String(line).replace(".",","),wins:(home,away)=>home+away>line},
    {label:"Under "+String(line).replace(".",","),wins:(home,away)=>home+away<line}
  ])
];
let virtualFixtureIndex=0;
function virtualGoalWeights(average){
  const weights=[Math.exp(-average)];
  for(let goals=1;goals<=8;goals++)weights.push(weights[goals-1]*average/goals);
  return weights;
}
function startVirtualFootball(){
  const [home,away,homeAverage,awayAverage]=virtualFixtures[virtualFixtureIndex++%virtualFixtures.length];
  const scores=virtualGoalWeights(homeAverage).flatMap((h,i)=>virtualGoalWeights(awayAverage).map((a,j)=>({home:i,away:j,weight:h*a})));
  const total=scores.reduce((sum,score)=>sum+score.weight,0);
  const odds=virtualMarkets.map(market=>Math.floor(100*.94*total/scores.reduce((sum,s)=>sum+(market.wins(s.home,s.away)?s.weight:0),0))/100);
  return {id:"virtuali",kind:"virtuali",teams:[home,away],scores,total,odds,pick:null,started:null,result:null,shown:[0,0],nextGoal:0};
}
function virtualScoreboard(g,minute){
  const [home,away]=g.teams;
  $("virtualScore").textContent=home+" "+g.shown.join(" – ")+" "+away+(minute===null?"":" · "+minute+"′");
}
function updateVirtualTicket(g){
  const stake=$("virtualStake").valueAsNumber;
  const valid=Number.isInteger(stake)&&stake>=0&&stake<=Number($("virtualStake").max);
  $("virtualStart").disabled=!valid||(stake>0&&g.pick===null);
  $("virtualReturn").textContent=!valid?local("Controlla la puntata.","Check your stake."):
    !stake?local("Visione gratuita","Free viewing"):g.pick===null?local("Scegli un esito","Pick an outcome"):
    local("Incasso possibile: ","Possible payout: ")+Math.floor(stake*g.odds[g.pick]);
}
function renderVirtualFootball(g){
  const markets=$("virtualMarkets");
  markets.replaceChildren();
  const rows=[
    [local("Esito finale","Full-time result"),[0,1,2]],
    [local("Entrambe a segno","Both teams to score"),[3,4]],
    ...[1,2,3,4].map((line,index)=>[local("Totale gol ","Total goals ")+line+",5",[5+index*2,6+index*2]])
  ];
  for(const [label,indices] of rows){
    const row=document.createElement("div"), title=document.createElement("strong");
    title.textContent=label;row.append(title);
    for(const index of indices){
      const button=document.createElement("button");
      button.textContent=virtualMarkets[index].label+" · "+g.odds[index].toFixed(2).replace(".",locale==="it"?",":".");
      button.setAttribute("aria-pressed","false");
      button.onclick=()=>{
        g.pick=index;
        for(const other of markets.querySelectorAll("button"))other.setAttribute("aria-pressed",String(other===button));
        updateVirtualTicket(g);
      };
      row.append(button);
    }
    markets.append(row);
  }
  $("virtualGoals").replaceChildren();
  $("virtualTicket").hidden=false;
  $("virtualStake").max=testMode?0:Math.min(5,wallet().coins);
  $("virtualStake").value=0;
  $("virtualStake").oninput=()=>updateVirtualTicket(g);
  $("virtualStakeText").textContent=local("Puntata","Stake");
  $("virtualStart").textContent=local("Avvia la partita","Start match");
  $("challengeScore").textContent=local("Monete disponibili: ","Coins available: ")+(testMode?0:wallet().coins);
  $("challengeStatus").textContent=local("Calcio virtuale","Virtual football");
  $("virtualLegend").textContent="🔵 "+g.teams[0]+" · 🟠 "+g.teams[1];
  $("virtualPitch").setAttribute("aria-label",local("Televisione della partita virtuale","Virtual match television"));
  virtualScoreboard(g,null);
  paintVirtualPitch(g,0);
  updateVirtualTicket(g);
  markets.querySelector("button").focus();
}
$("virtualStart").onclick=()=>{
  const g=minigame,stake=$("virtualStake").valueAsNumber;
  if(g?.kind!=="virtuali"||g.started!==null||!Number.isInteger(stake)||stake<0||stake>5||
    stake>(testMode?0:wallet().coins)||(stake>0&&g.pick===null))return;
  let roll=Math.random()*g.total;
  const score=g.scores.find(s=>(roll-=s.weight)<0)??g.scores.at(-1);
  const hit=g.pick!==null&&virtualMarkets[g.pick].wins(score.home,score.away);
  const payout=hit?Math.floor(stake*g.odds[g.pick]):0;
  if(stake){
    wallet().coins+=payout-stake;
    if(!save()){
      wallet().coins-=payout-stake;
      $("challengeStatus").textContent=local("Salvataggio non riuscito. Riprova.","Could not save. Try again.");
      return;
    }
  }
  const minutes=shuffleCards(Array.from({length:87},(_,index)=>index+3));
  const goals=[score.home,score.away].flatMap((count,team)=>
    Array.from({length:count},()=>({team,minute:minutes.pop(),lane:.28+Math.random()*.44}))).sort((a,b)=>a.minute-b.minute);
  Object.assign(g,{stake,payout,hit,started:performance.now(),goals});
  for(const button of $("virtualMarkets").querySelectorAll("button"))button.disabled=true;
  $("virtualTicket").hidden=true;
  $("challengeStatus").textContent=local("Partita in corso","Match in progress");
};
function tickVirtualFootball(g,now){
  if(g.started===null||g.result)return;
  const clock=Math.min(90,(now-g.started)/(reducedMotion?100:210));
  const minute=Math.floor(clock);
  if(!reducedMotion||g.minute!==minute)paintVirtualPitch(g,reducedMotion?minute:clock);
  if(g.minute===minute)return;
  g.minute=minute;
  while(g.goals[g.nextGoal]?.minute<=minute){
    const {team,minute:goalMinute}=g.goals[g.nextGoal++];
    g.shown[team]++;
    const event=document.createElement("li");
    event.textContent=goalMinute+"′ · "+local("Gol ","Goal for ")+g.teams[team];
    $("virtualGoals").prepend(event);
    chime([65,72],.07);
  }
  virtualScoreboard(g,minute);
  if(minute<90)return;
  g.result="finished";
  const result=g.stake?(g.hit?local("Incasso: ","Payout: ")+g.payout:local("Puntata persa: ","Stake lost: ")+g.stake):local("Visione gratuita","Free viewing");
  $("challengeStatus").textContent=local("Finale · ","Full time · ")+result;
  $("challengeScore").textContent=local("Monete disponibili: ","Coins available: ")+(testMode?0:wallet().coins);
  if(!testMode)refreshWallet();
  $("challengeReplay").textContent=local("Prossima partita","Next match");
  $("challengeReplay").hidden=false;
  $("challengeReplay").focus();
}

// Pitch animation illustrates the simulated match. The goal timeline drives both
// the score and the direction of each attack.
const virtualFormation=[
  [.045,.5],[.18,.16],[.16,.39],[.16,.61],[.18,.84],
  [.32,.24],[.31,.5],[.32,.76],[.43,.2],[.44,.5],[.43,.8]
];
function virtualBallAt(g,clock){
  if(clock===0)return [.5,.5,null];
  const goal=g.goals?.find(event=>clock>=event.minute-2.8&&clock<=event.minute+.8);
  if(goal){
    const direction=goal.team===0?1:-1;
    const progress=Math.min(1,(clock-goal.minute+2.8)/2.8);
    const x=.5+direction*(.48*progress+.035*progress**4);
    const y=.5+(goal.lane-.5)*Math.sin(Math.PI*progress);
    return [x,y,goal.team];
  }
  return [.5+.34*Math.sin(clock*.77)*Math.sin(clock*.22),
    .5+.31*Math.sin(clock*.59)*Math.sin(clock*.31),null];
}
function paintVirtualPitch(g,clock){
  const canvas=$("virtualPitch"),c=canvas.getContext("2d");
  const left=21,top=17,width=438,height=226;
  c.fillStyle="#0c1c29";c.fillRect(0,0,480,260);
  for(let col=0;col<12;col++){
    c.fillStyle=col%2?"#245846":"#27624b";
    c.fillRect(left+width*col/12,top,width/12,height);
  }
  c.strokeStyle="#cef0d1";c.lineWidth=1.4;
  c.strokeRect(left,top,width,height);
  c.beginPath();c.moveTo(240,top);c.lineTo(240,top+height);c.stroke();
  c.beginPath();c.arc(240,130,26,0,Math.PI*2);c.stroke();
  for(const side of [0,1]){
    c.strokeRect(side?left+width-59:left,82,59,96);
    c.strokeRect(side?left+width-23:left,106,23,48);
    c.strokeRect(side?left+width:left-13,115,13,30);
  }
  const [bx,by,attacking]=virtualBallAt(g,clock);
  for(const team of [0,1]){
    for(const [i,[x,y]] of virtualFormation.entries()){
      const base=team===0?x:1-x;
      const drift=clock===0?0:Math.sin(clock*.53+i*1.9+team)*.02;
      const advance=i===0?0:(bx-.5)*.24;
      let px=base+advance+drift;
      let py=y+(clock===0?0:(by-.5)*.14+Math.cos(clock*.38+i)*.025);
      if(attacking===team&&i===9){px=bx+(team===0?-.035:.035);py=by+.025;}
      c.beginPath();
      c.arc(left+width*Math.max(.025,Math.min(.975,px)),top+height*py,i===0?5:4.3,0,Math.PI*2);
      c.fillStyle=team===0?"#46b9ff":"#ff9c52";c.fill();
      c.strokeStyle="#102430";c.stroke();
    }
  }
  c.beginPath();
  c.arc(left+width*bx,top+height*by,3.6,0,Math.PI*2);
  c.fillStyle="#fffcef";c.fill();c.strokeStyle="#111b24";c.stroke();
}
