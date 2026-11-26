const virtualFixtures=[
  ["Romania FC","Panama United",1.7,1.1],
  ["Dome Athletic","LOFT City",1.35,1.3],
  ["Parenzo Rovers","Pola Sporting",1.05,1.65]
];
const virtualMarkets=[
  {label:"1",wins:(home,away)=>home>away},
  {label:"X",wins:(home,away)=>home===away},
  {label:"2",wins:(home,away)=>home<away},
  {label:"Over 2,5",wins:(home,away)=>home+away>=3},
  {label:"Under 2,5",wins:(home,away)=>home+away<=2}
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
  for(const [label,indices] of [[local("Esito finale","Full-time result"),[0,1,2]],[local("Totale gol","Total goals"),[3,4]]]){
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
  virtualScoreboard(g,null);
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
  Object.assign(g,{stake,payout,hit,started:performance.now(),goals:[score.home,score.away].flatMap((count,team)=>
    Array.from({length:count},()=>({team,minute:1+Math.floor(Math.random()*89)}))).sort((a,b)=>a.minute-b.minute)});
  for(const button of $("virtualMarkets").querySelectorAll("button"))button.disabled=true;
  $("virtualTicket").hidden=true;
  $("challengeStatus").textContent=local("Partita in corso","Match in progress");
};
function tickVirtualFootball(g,now){
  if(g.started===null||g.result)return;
  const minute=Math.min(90,Math.floor((now-g.started)/(reducedMotion?18:93)));
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
