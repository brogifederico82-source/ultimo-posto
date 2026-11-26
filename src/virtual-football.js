const virtualFixtures=[
  ["Roma","Lazio",1.7,1.1],
  ["Inter","Milan",1.35,1.3],
  ["Juventus","Napoli",1.05,1.65]
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
  $("challengeStatus").textContent=local("Partita simulata","Simulated match");
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
  const totalGoals=score.home+score.away;
  const minutes=shuffleCards(Array.from({length:87-3*Math.max(0,totalGoals-1)},(_,index)=>index+3))
    .slice(0,totalGoals).sort((a,b)=>a-b).map((minute,index)=>minute+3*index);
  shuffleCards(minutes);
  const goals=[score.home,score.away].flatMap((count,team)=>
    Array.from({length:count},()=>({team,minute:minutes.pop(),lane:.46+Math.random()*.08}))).sort((a,b)=>a.minute-b.minute);
  Object.assign(g,{stake,payout,hit,started:performance.now(),goals,plays:buildVirtualPlays(goals)});
  for(const button of $("virtualMarkets").querySelectorAll("button"))button.disabled=true;
  $("virtualTicket").hidden=true;
  $("challengeStatus").textContent=local("Simulazione in corso","Simulation in progress");
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

// The same touches drive both a player's run and the ball at their feet.
const virtualFormation=[
  [.045,.5],[.18,.16],[.16,.39],[.16,.61],[.18,.84],
  [.32,.24],[.31,.5],[.32,.76],[.43,.2],[.44,.5],[.43,.8]
];
function buildVirtualPlays(goals){
  const plays=[];
  let time=0, x=.5, y=.5, owner=[0,9];
  function move(end,toX,toY,receiver,shot=false){
    plays.push({start:time,end,from:[x,y],to:[toX,toY],owner,receiver,shot});
    time=end;x=toX;y=toY;owner=receiver;
  }
  for(const goal of [...goals,{minute:90,lane:.5,team:null}]){
    const shooting=goal.team!==null;
    const buildupEnd=goal.minute-(shooting?2.35:0);
    while(time<buildupEnd-.01){
      const team=Math.floor(time/5)%2;
      const direction=team===0?1:-1;
      const index=[5,8,6,10,7,9][plays.length%6];
      const toX=Math.max(.14,Math.min(.86,x+direction*(.09+Math.random()*.14)));
      const toY=.17+Math.random()*.66;
      move(Math.min(buildupEnd,time+1.65+Math.random()*.75),toX,toY,[team,index]);
    }
    if(!shooting)break;
    const targetX=goal.team===0?.80:.20;
    move(goal.minute-.78,targetX,.5+(goal.lane-.5)*2,[goal.team,9]);
    move(goal.minute,goal.team===0?1.022:-.022,goal.lane,null,true);
    plays.push({start:time,end:Math.min(90,time+.42),from:[x,y],to:[x,y],owner:null,receiver:null,shot:true});
    time+=.42;x=.5;y=.5;owner=[1-goal.team,9];
  }
  return plays;
}
function virtualBallAt(g,clock){
  const play=g.plays?.find(event=>clock<event.end)??g.plays?.at(-1);
  if(!play)return {x:.5,y:.5,play:null,phase:0};
  const phase=Math.max(0,Math.min(1,(clock-play.start)/(play.end-play.start)));
  const carry=play.shot?0:.34;
  const carrying=phase<carry;
  const travel=carrying?phase*.34:carry*.34+(1-carry*.34)*(phase-carry)/(1-carry);
  const [sx,sy]=play.from,[ex,ey]=play.to;
  return {x:sx+(ex-sx)*travel,y:sy+(ey-sy)*travel,play,phase};
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
  const {x:bx,y:by,play,phase}=virtualBallAt(g,clock);
  for(const team of [0,1]){
    for(const [i,[x,y]] of virtualFormation.entries()){
      const base=team===0?x:1-x;
      const drift=clock===0?0:Math.sin(clock*.53+i*1.9+team)*.02;
      const advance=i===0?0:(bx-.5)*.24;
      let px=base+advance+drift;
      let py=y+(clock===0?0:(by-.5)*.14+Math.cos(clock*.38+i)*.025);
      const direction=team===0?1:-1;
      if(play?.receiver?.[0]===team&&play.receiver[1]===i){
        const run=Math.min(1,phase*2.3);
        px+=(play.to[0]-direction*.016-px)*run;
        py+=(play.to[1]-py)*run;
      }
      if(play?.owner?.[0]===team&&play.owner[1]===i){
        const carry=phase<.34&&!play.shot;
        const progress=carry?phase*.34:play.shot?0:.34*.34;
        px=play.from[0]+(play.to[0]-play.from[0])*progress-direction*.016;
        py=play.from[1]+(play.to[1]-play.from[1])*progress;
      }
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
