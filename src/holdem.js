const holdemSuits=["♣","♦","♥","♠"];
const holdemStreets=[["Preflop","Preflop"],["Flop","Flop"],["Turn","Turn"],["River","River"]];
const holdemHands=[
  ["Carta alta","High card"],["Coppia","Pair"],["Doppia coppia","Two pair"],["Tris","Three of a kind"],
  ["Scala","Straight"],["Colore","Flush"],["Full","Full house"],["Poker","Four of a kind"],["Scala colore","Straight flush"]
];
const holdemNames=()=>[local("Tu","You"),"Nina","Benedetta"];
function rankHoldemFive(cards){
  const ranks=cards.map(card=>card.rank).sort((a,b)=>b-a);
  const unique=[...new Set(ranks)];
  const groups=unique.map(rank=>({rank,count:ranks.filter(value=>value===rank).length}))
    .sort((a,b)=>b.count-a.count||b.rank-a.rank);
  const flush=cards.every(card=>card.suit===cards[0].suit);
  const straight=unique.length===5&&(ranks[0]-ranks[4]===4?ranks[0]:ranks.join(",")==="14,5,4,3,2"?5:0);
  if(flush&&straight)return [8,straight];
  if(groups[0].count===4)return [7,...groups.map(group=>group.rank)];
  if(groups[0].count===3&&groups[1].count===2)return [6,...groups.map(group=>group.rank)];
  if(flush)return [5,...ranks];
  if(straight)return [4,straight];
  const category=groups[0].count===3?3:groups[1].count===2?2:groups[0].count===2?1:0;
  return [category,...groups.map(group=>group.rank)];
}
function compareHoldem(a,b){
  for(let index=0;index<a.length;index++)if(a[index]!==b[index])return a[index]-b[index];
  return 0;
}
function bestHoldem(cards){
  let best=[-1];
  for(let a=0;a<cards.length-4;a++)
    for(let b=a+1;b<cards.length-3;b++)
      for(let c=b+1;c<cards.length-2;c++)
        for(let d=c+1;d<cards.length-1;d++)
          for(let e=d+1;e<cards.length;e++){
            const candidate=rankHoldemFive([cards[a],cards[b],cards[c],cards[d],cards[e]]);
            if(compareHoldem(candidate,best)>0)best=candidate;
          }
  return best;
}
function nextHoldemSeat(g,after,eligible){
  for(let step=1;step<=3;step++){
    const index=(after+step+3)%3;
    if(eligible(g.seats[index]))return index;
  }
  return -1;
}
function startHoldem(){
  const g={id:"poker",kind:"poker",seats:Array.from({length:3},()=>({stack:100})),dealer:-1,hand:0,result:null};
  dealHoldem(g);
  return g;
}
function holdemPay(seat,amount){
  const chips=Math.min(seat.stack,amount);
  seat.stack-=chips;
  seat.bet+=chips;
  seat.paid+=chips;
}
function dealHoldem(g){
  g.hand++;
  g.deck=shuffleCards(holdemSuits.flatMap(suit=>Array.from({length:13},(_,index)=>({suit,rank:index+2}))));
  g.dealer=nextHoldemSeat(g,g.dealer,seat=>seat.stack>0);
  g.board=[];g.street=0;g.price=2;g.raiseSize=2;g.complete=false;g.showdown=false;g.log=[];g.note="";
  for(const seat of g.seats)Object.assign(seat,{cards:[],folded:seat.stack===0,bet:0,paid:0,actedAt:null,rank:null});
  const headsUp=g.seats.filter(seat=>!seat.folded).length===2;
  const small=headsUp?g.dealer:nextHoldemSeat(g,g.dealer,seat=>!seat.folded);
  const big=nextHoldemSeat(g,small,seat=>!seat.folded);
  g.small=small;g.big=big;
  let index=g.dealer;
  for(let card=0;card<(headsUp?4:6);card++){
    index=nextHoldemSeat(g,index,seat=>!seat.folded);
    g.seats[index].cards.push(g.deck.pop());
  }
  holdemPay(g.seats[small],1);
  holdemPay(g.seats[big],2);
  g.cursor=big;
}
function holdemOptions(g,index){
  const seat=g.seats[index];
  const max=seat.bet+seat.stack;
  const call=Math.min(seat.stack,g.price-seat.bet);
  const min=Math.min(max,g.price+g.raiseSize);
  const canRaise=max>g.price&&g.seats.some((other,i)=>i!==index&&!other.folded&&other.stack>0)&&
    (seat.actedAt===null||g.price-seat.actedAt>=g.raiseSize);
  return {call,min,max,canRaise};
}
function holdemAction(g,index,action,to){
  const seat=g.seats[index], options=holdemOptions(g,index);
  let message;
  if(action==="fold"){
    seat.folded=true;
    message=local("passa","folds");
  }else if(action==="raise"){
    if(!options.canRaise||!Number.isInteger(to)||to<options.min||to>options.max)return false;
    const opening=g.price===0;
    const increment=to-g.price;
    if(increment>=g.raiseSize)g.raiseSize=increment;
    g.price=to;
    holdemPay(seat,to-seat.bet);
    message=local(opening?"punta ":"rilancia a ",opening?"bets ":"raises to ")+to;
  }else{
    holdemPay(seat,options.call);
    message=options.call?local("vede ","calls ")+options.call:local("fa check","checks");
  }
  seat.actedAt=g.price;
  g.cursor=index;
  g.log.push(holdemNames()[index]+" "+message+(seat.stack===0&&!seat.folded?" · all-in":""));
  return true;
}
function holdemBot(g,index){
  const seat=g.seats[index], options=holdemOptions(g,index);
  const [a,b]=seat.cards.map(card=>card.rank).sort((x,y)=>y-x);
  let strength=a===b?.54+a/36:(a+b)/44+(seat.cards[0].suit===seat.cards[1].suit?.08:0);
  if(g.board.length){
    const rank=bestHoldem([...seat.cards,...g.board]);
    strength=[.20,.48,.66,.75,.87,.91,.96,.98,1][rank[0]];
    if(rank[0]===1&&seat.cards.some(card=>card.rank===rank[1]))strength+=.12;
    if(rank[0]===0)strength+=a/100;
  }
  strength+=(Math.random()-.5)*(index===1?.19:.32);
  const pot=g.seats.reduce((sum,player)=>sum+player.paid,0);
  const odds=options.call/(pot+options.call||1);
  if(options.call&&strength<.27+odds*.9){holdemAction(g,index,"fold");return;}
  if(options.canRaise&&strength>(index===1?.73:.65)&&Math.random()<.53){
    const target=Math.min(options.max,Math.max(options.min,g.price+Math.floor(pot*.45)));
    holdemAction(g,index,"raise",target);return;
  }
  holdemAction(g,index,"call");
}
function settleHoldem(g){
  const active=g.seats.filter(seat=>!seat.folded);
  g.showdown=active.length>1;
  if(g.showdown)for(const seat of active)seat.rank=bestHoldem([...seat.cards,...g.board]);
  const awards=[0,0,0];
  const refunds=[0,0,0];
  const levels=[...new Set(g.seats.map(seat=>seat.paid))].filter(Boolean).sort((a,b)=>a-b);
  let prior=0;
  for(const level of levels){
    const contributors=g.seats.map((seat,index)=>seat.paid>=level?index:-1).filter(index=>index>=0);
    const amount=(level-prior)*contributors.length;
    prior=level;
    if(contributors.length===1){refunds[contributors[0]]+=amount;continue;}
    const eligible=contributors.filter(index=>!g.seats[index].folded);
    if(g.showdown)eligible.sort((a,b)=>compareHoldem(g.seats[b].rank,g.seats[a].rank));
    const winners=g.showdown?eligible.filter(index=>compareHoldem(g.seats[index].rank,g.seats[eligible[0]].rank)===0):eligible;
    winners.sort((a,b)=>((a-g.dealer+2)%3)-((b-g.dealer+2)%3));
    for(const [position,index] of winners.entries())awards[index]+=Math.floor(amount/winners.length)+(position<amount%winners.length?1:0);
  }
  const names=holdemNames();
  for(const [index,seat] of g.seats.entries()){
    seat.stack+=awards[index]+refunds[index];
    if(refunds[index])g.log.push(names[index]+local(" recupera "," gets back ")+refunds[index]+local(" non coperte"," uncalled"));
  }
  g.note=awards.map((chips,index)=>chips?names[index]+": +"+chips:"").filter(Boolean).join(" · ");
  g.complete=true;
}
function advanceHoldem(g){
  while(!g.complete){
    const active=g.seats.filter(seat=>!seat.folded);
    if(active.length===1){settleHoldem(g);break;}
    const funded=active.filter(seat=>seat.stack>0);
    g.turn=nextHoldemSeat(g,g.cursor,seat=>!seat.folded&&seat.stack>0&&
      (seat.bet<g.price||(funded.length>1&&seat.actedAt===null)));
    if(g.turn===0){renderHoldem(g);return;}
    if(g.turn>0){holdemBot(g,g.turn);continue;}
    if(g.street===3){settleHoldem(g);break;}
    g.street++;
    g.deck.pop();
    g.board.push(...g.deck.splice(0,g.street===1?3:1));
    g.price=0;g.raiseSize=2;g.cursor=g.dealer;
    for(const seat of g.seats){seat.bet=0;seat.actedAt=null;}
    g.log.push(local(...holdemStreets[g.street]));
  }
  const won=g.seats[0].stack===300, lost=g.seats[0].stack===0;
  if(won||lost)endChallenge(g,won?"win":"loss");
  renderHoldem(g);
}
function holdemCard(card){
  const face=document.createElement("span");
  face.className="holdem-card";
  if(card){
    const rank=({11:"J",12:"Q",13:"K",14:"A"})[card.rank]??card.rank;
    face.textContent=rank+card.suit;
    face.classList.toggle("red",card.suit==="♥"||card.suit==="♦");
  }else{
    face.classList.add("covered");
    face.textContent="◆";
    face.setAttribute("aria-label",local("Carta coperta","Face-down card"));
  }
  return face;
}
function renderHoldem(g){
  const names=holdemNames();
  const seats=$("holdemSeats");
  seats.replaceChildren();
  for(const [index,seat] of g.seats.entries()){
    const tile=document.createElement("div");
    tile.className="holdem-seat";
    const heading=document.createElement("strong");
    heading.textContent=names[index]+" · "+seat.stack+local(" fiches"," chips");
    const tags=document.createElement("p");
    tags.textContent=[
      index===g.dealer?"D":"",index===g.small?"SB":"",index===g.big?"BB":"",
      seat.folded?local(seat.cards.length?"Passa":"Eliminata",seat.cards.length?"Folded":"Out"):
        !seat.stack&&!g.complete?"All-in":"",
      seat.bet&&!g.complete?local("Sul tavolo: ","Bet: ")+seat.bet:""
    ].filter(Boolean).join(" · ");
    const cards=seat.cards.map(card=>holdemCard(index===0||(g.showdown&&!seat.folded)?card:null));
    tile.append(heading,...cards,tags);seats.append(tile);
  }
  $("holdemBoard").replaceChildren(...Array.from({length:5},(_,index)=>holdemCard(g.board[index])));
  $("challengeScore").textContent=local("Mano ","Hand ")+g.hand+" · "+local(...holdemStreets[g.street])+
    (g.complete?"":" · "+local("Piatto: ","Pot: ")+g.seats.reduce((sum,seat)=>sum+seat.paid,0));
  const rank=g.board.length?bestHoldem([...g.seats[0].cards,...g.board]):null;
  const shown=g.showdown?g.seats.slice(1).map((seat,index)=>seat.rank?names[index+1]+": "+local(...holdemHands[seat.rank[0]]):"").filter(Boolean):[];
  $("holdemHand").textContent=[rank?local("La tua mano: ","Your hand: ")+local(...holdemHands[rank[0]]):"",...shown].filter(Boolean).join(" · ");
  const log=$("holdemLog");
  log.replaceChildren(...g.log.slice(-6).map(action=>{const item=document.createElement("li");item.textContent=action;return item;}));
  const actions=$("holdemActions");
  actions.hidden=g.complete;
  const next=$("holdemNext");
  next.hidden=!g.complete||Boolean(g.result);
  next.textContent=local("Prossima mano","Next hand");
  if(g.complete){
    $("challengeStatus").textContent=[g.note,g.result?$("challengeStatus").textContent:""].filter(Boolean).join(" · ");
    if(!g.result)next.focus();
    return;
  }
  const {call,min,max,canRaise}=holdemOptions(g,0);
  $("holdemFold").textContent=local("Passa","Fold");
  $("holdemCall").textContent=call?local("Vedi ","Call ")+call+(call===g.seats[0].stack?" · all-in":""):"Check";
  $("holdemRaise").textContent=g.price?local("Rilancia","Raise"):local("Punta","Bet");
  $("holdemRaiseLabel").hidden=$("holdemRaise").hidden=!canRaise;
  $("holdemRaiseText").textContent=local("Totale","Total");
  Object.assign($("holdemRaiseTo"),{min,max,value:min});
  $("challengeStatus").textContent=local("Tocca a te.","Your turn.");
}
function playHoldem(action,to){
  const g=minigame;
  if(g?.kind!=="poker"||g.complete||g.turn!==0||!holdemAction(g,0,action,to))return;
  advanceHoldem(g);
  if(!g.complete)$("holdemCall").focus();
}
$("holdemFold").onclick=()=>playHoldem("fold");
$("holdemCall").onclick=()=>playHoldem("call");
$("holdemRaise").onclick=()=>{
  const input=$("holdemRaiseTo");
  if(input.reportValidity())playHoldem("raise",input.valueAsNumber);
};
$("holdemNext").onclick=()=>{
  const g=minigame;
  if(g?.kind!=="poker"||!g.complete||g.result)return;
  dealHoldem(g);advanceHoldem(g);
  if(!g.complete)$("holdemCall").focus();
};
