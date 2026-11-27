const smokingOutdoors=new Set(["ingresso","giardino","parenzo","pola","pola-cortile"]);
function smokingZona(z){return smokingOutdoors.has(z)||String(z).startsWith("pq-");}
const smokingOption=$("smokingEnabled");
try{smokingOption.checked=localStorage.getItem("ultimo-posto-smoking")!=="off";}catch{}
let cigarette=null, smokingHold=null, smokingMessage="";
function cigarettesLeft(s=state){
  return s?.pockets.includes("Sigarette")?
    Number.isInteger(s.cigarettes)?Math.max(0,Math.min(10,s.cigarettes)):10:0;
}
function smokingAllowed(){
  return screen==="game"&&state&&smokingOption.checked&&smokingZona(state.zone)&&
    !state.prologue&&!activeScene&&!state.ending&&!minigame&&!$("campusSurprise").open&&!testMode;
}
function updateSmokingUI(){
  const left=cigarettesLeft();
  const button=$("smokingAction");
  button.textContent=cigarette?.phase==="ready"?local("Tieni premuto per accendere","Hold to light"):
    cigarette?.phase==="lit"?local("Tieni premuto per aspirare","Hold to inhale"):local("Fuma","Smoke");
  button.setAttribute("aria-disabled",String(!smokingAllowed()||(!left&&!cigarette)));
  $("smokingLabel").textContent=local("Mostra il comando Fuma","Show the Smoke command");
  $("smokingTools").hidden=!smokingOption.checked||(!left&&!cigarette);
  $("smokingAsh").hidden=cigarette?.phase!=="lit";
  $("smokingEnd").hidden=!cigarette;
  $("smokingAsh").textContent=local("Fai cadere la cenere","Tap off ash");
  $("smokingEnd").textContent=cigarette&&smokingAtBin()?local("Spegni nel cestino","Put out at the bin"):local("Interrompi","Stop");
  $("smokingStatus").textContent=smokingMessage||local("Sigarette: ","Cigarettes: ")+left+"/10";
}
function stopSmoking(message="",noise=false){
  if(noise&&cigarette?.phase==="lit")sound("extinguish","map");
  cigarette=null;smokingHold=null;smokingMessage=message;
  updateSmokingUI();
}
function pressSmoking(){
  if(!smokingAllowed()){
    smokingMessage=local("Puoi fumare solo all’aperto mentre esplori.","Smoking is available only while exploring outdoors.");
    updateSmokingUI();return;
  }
  if(!cigarette){
    const count=cigarettesLeft();
    if(!count){smokingMessage=local("Pacchetto vuoto o assente.","No cigarettes left.");updateSmokingUI();return;}
    const prior=state.cigarettes;
    state.cigarettes=count-1;
    if(!save()){
      state.cigarettes=prior;
      sound("error","interface");return;
    }
    cigarette={phase:"ready",remaining:1,exhaleUntil:0};
    smokingMessage=local("Sigaretta estratta.","Cigarette taken from the pack.");
    sound("pack","map");renderScene();return;
  }
  if(smokingHold!==null)return;
  smokingHold=performance.now();
}
function releaseSmoking(cancelled=false){
  if(smokingHold===null)return;
  const duration=performance.now()-smokingHold;
  smokingHold=null;
  if(cigarette)cigarette.emberSound=false;
  if(cancelled||!cigarette||!smokingAllowed())return;
  if(cigarette.phase==="lit"&&duration>=170){
    cigarette.emberSound=false;
    cigarette.remaining=Math.max(0,cigarette.remaining-Math.min(.22,duration/9000));
    if(!cigarette.remaining){
      stopSmoking(local("La sigaretta è finita.","The cigarette is finished."),true);
      return;
    }
    cigarette.exhaleUntil=performance.now()+1650;
    sound("exhale","map");
    smokingMessage=local("Soffi il fumo.","You exhale.");
  }else if(cigarette.phase==="lit"){
    dropSmokingAsh();return;
  }
  updateSmokingUI();
}
function dropSmokingAsh(){
  if(!smokingAllowed()||cigarette?.phase!=="lit")return;
  cigarette.ashUntil=performance.now()+500;
  sound("bounce","map");
  smokingMessage=local("La cenere cade.","You tap off the ash.");
  updateSmokingUI();
}
function smokingAtBin(){
  return sceneObjects(room(state.zone)).some(o=>o.kind==="bin"&&Math.abs(o.x-state.x)+Math.abs(o.y-state.y)<=2);
}
function endSmokingAtBin(){
  const bin=smokingAtBin();
  stopSmoking(bin?local("Sigaretta spenta nel cestino.","Cigarette put out at the bin."):
    local("Sessione interrotta.","Session stopped."),bin);
}
function tickSmoking(now){
  if(!cigarette)return;
  if(!smokingAllowed()){
    if(cigarette.phase==="ready"&&activeScene&&smokingZona(state.zone)&&!minigame&&!state.ending){
      smokingHold=null;return;
    }
    stopSmoking();return;
  }
  if(smokingHold===null)return;
  if(cigarette.phase==="ready"&&now-smokingHold>=560){
    cigarette.phase="lit";smokingHold=null;
    sound("lighter","map");
    smokingMessage=local("Accesa. Tieni premuto per aspirare.","Lit. Hold to inhale.");
    updateSmokingUI();
  }else if(cigarette.phase==="lit"&&now-smokingHold>230&&!cigarette.emberSound){
    cigarette.emberSound=true;sound("ember","map");
  }
}
function paintSmoking(c,x,y,now){
  if(!cigarette||!smokingAllowed())return;
  const direction=state.look==="left"?-1:1;
  const length=2+Math.ceil(cigarette.remaining*4);
  const tip=x+direction*(5+length);
  rect(c,"#faf0d6",direction===1?x+5:tip,y-7,length,1.6);
  if(cigarette.phase!=="lit")return;
  rect(c,smokingHold===null?"#f19a57":"#ffc66f",tip,y-7,smokingHold===null?1:2,2);
  if(reducedMotion)return;
  const puff=cigarette.exhaleUntil>now;
  for(let index=0;index<(puff?5:2);index++){
    const rise=(now/85+index*3)%15;
    rect(c,"#dfedf18c",tip+direction*(rise*.55+Math.sin(index+rise)*2),y-9-rise,puff?3:1.5,1);
  }
  if(cigarette.ashUntil>now)rect(c,"#bcb8ac",tip,y-7+(500-cigarette.ashUntil+now)/58,1,1);
}
const smokingAction=$("smokingAction");
smokingAction.onpointerdown=event=>{
  if(event.button!==0)return;
  event.preventDefault();smokingAction.setPointerCapture(event.pointerId);
  pressSmoking();
};
smokingAction.onpointerup=()=>releaseSmoking();
smokingAction.onpointercancel=()=>releaseSmoking(true);
smokingAction.onclick=event=>{if(event.detail===0){pressSmoking();releaseSmoking();}};
$("smokingAsh").onclick=dropSmokingAsh;
$("smokingEnd").onclick=()=>{if(cigarette)endSmokingAtBin();};
smokingOption.onchange=()=>{
  try{localStorage.setItem("ultimo-posto-smoking",smokingOption.checked?"on":"off");}catch{}
  if(!smokingOption.checked)stopSmoking();else updateSmokingUI();
};
window.addEventListener("keydown",event=>{
  if(screen!=="game"||event.key.toLowerCase()!=="f"||event.repeat||event.ctrlKey||event.metaKey||
    event.target.closest?.("input,select,textarea,[contenteditable]"))return;
  if(minigame){
    $("challengeStatus").textContent=local("Il comando Fuma è disattivato durante la sfida.","Smoking is disabled during minigames.");
    return;
  }
  event.preventDefault();pressSmoking();
});
window.addEventListener("keyup",event=>{if(event.key.toLowerCase()==="f")releaseSmoking();});
window.addEventListener("blur",()=>releaseSmoking(true));
