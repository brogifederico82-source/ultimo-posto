const audioChannels=[
  ["master","Generale","Master",100],
  ["music","Musica","Music",65],
  ["interface","Interfaccia","Interface",60],
  ["map","Mappa","Map",65],
  ["games","Minigiochi","Minigames",75],
  ["voices","Voci","Voices",70]
];
const audioSettingsKey="ultimo-posto-mixer-v1";
const defaultMixer=()=>Object.fromEntries(audioChannels.map(([id,,,level])=>[id,{level,muted:false}]));
let mixer=defaultMixer(), effectsMaster=null;
const effectBuses=new Map(), activeTones=new Set(), lastEffects=new Map();
try{
  const saved=JSON.parse(localStorage.getItem(audioSettingsKey)||"null");
  const music=localStorage.getItem("ultimo-posto-volume");
  if(music!==null&&Number.isFinite(Number(music)))mixer.music.level=Math.max(0,Math.min(100,Number(music)));
  for(const [id] of audioChannels){
    const channel=saved?.[id];
    if(!channel)continue;
    if(Number.isFinite(channel.level))mixer[id].level=Math.max(0,Math.min(100,channel.level));
    mixer[id].muted=channel.muted===true;
  }
}catch{}
const channelLevel=id=>mixer[id].muted?0:mixer[id].level/100;
function syncMixer(){
  if(effectsMaster){
    const now=audioContext.currentTime;
    effectsMaster.gain.setTargetAtTime(channelLevel("master"),now,.015);
    for(const [id,bus] of effectBuses)bus.gain.setTargetAtTime(channelLevel(id),now,.015);
  }
  applyMusicVolume();
  syncBackgroundMusic();
  if(!channelLevel("voices")||!channelLevel("master"))window.speechSynthesis?.cancel();
}
function initEffects(){
  if(effectsMaster||!audioContext)return;
  const limiter=audioContext.createDynamicsCompressor();
  limiter.threshold.value=-15;
  limiter.ratio.value=6;
  limiter.connect(audioContext.destination);
  effectsMaster=audioContext.createGain();
  effectsMaster.connect(limiter);
  for(const [id] of audioChannels.slice(2)){
    const bus=audioContext.createGain();
    bus.connect(effectsMaster);effectBuses.set(id,bus);
  }
  syncMixer();
}
function stopEffects(){
  for(const tone of activeTones){try{tone.stop();}catch{}}
  lastEffects.clear();
  window.speechSynthesis?.cancel();
}
function playTones(notes,spacing,volume,channel,type="triangle",duration=.18){
  if(!audioOn||!audioContext||!channelLevel("master")||!channelLevel(channel))return;
  const bus=effectBuses.get(channel);
  if(!bus)return;
  for(const [index,note] of notes.entries()){
    if(activeTones.size>=16)break;
    const tone=audioContext.createOscillator(), envelope=audioContext.createGain();
    const at=audioContext.currentTime+.002+index*spacing;
    tone.type=type;tone.frequency.value=440*2**((note-69)/12);
    envelope.gain.setValueAtTime(.001,at);
    envelope.gain.linearRampToValueAtTime(Math.min(.1,volume),at+.014);
    envelope.gain.exponentialRampToValueAtTime(.001,at+duration);
    tone.connect(envelope);envelope.connect(bus);
    activeTones.add(tone);
    tone.onended=()=>{activeTones.delete(tone);tone.disconnect();envelope.disconnect();};
    tone.start(at);tone.stop(at+duration+.01);
  }
}
const soundPalette={
  talk:[[59,65],.10,"triangle"],inspect:[[68,72],.085,"sine"],choice:[[65,74],.10,"triangle"],
  click:[[67],.044,"sine"],menu:[[64,72],.10,"sine"],error:[[48,43],.13,"triangle"],
  pavement:[[48],.062,"triangle"],grass:[[43],.052,"sine"],floor:[[53],.055,"sine"],
  door:[[48,55],.11,"triangle"],stairs:[[53,57,60],.11,"sine"],gate:[[60,67,72],.13,"triangle"],
  coin:[[76,84],.13,"sine"],buy:[[55,70],.10,"triangle"],traffic:[[35],.15,"triangle"],objective:[[60,64,72],.15,"triangle"],
  whistle:[[88,93],.13,"sine"],pass:[[51],.06,"triangle"],shot:[[43,57],.11,"triangle"],
  bounce:[[52],.064,"sine"],save:[[49,61],.10,"triangle"],post:[[73,79],.105,"sine"],
  goal:[[60,67,72,79],.16,"triangle"],crowd:[[45,49,52],.23,"sine"],
  shuffle:[[50,55,47],.055,"triangle"],deal:[[61,57,54],.065,"sine"],card:[[63],.056,"sine"],
  trick:[[67,72],.09,"triangle"],scopa:[[64,72,76],.13,"triangle"],chips:[[74,71],.067,"sine"],
  hoof:[[42,48],.065,"triangle"],finish:[[72,79,84],.13,"triangle"],rhythm:[[72],.078,"sine"],
  pack:[[57,62],.07,"triangle"],lighter:[[66,51],.084,"triangle"],ember:[[47],.11,"sine"],exhale:[[49,44],.17,"sine"],extinguish:[[52,40],.10,"triangle"]
};
function sound(name,channel="games"){
  if(!audioOn||!channelLevel("master")||!channelLevel(channel))return;
  const now=performance.now(),key=channel+":"+name;
  if(now-(lastEffects.get(key)??-Infinity)<70)return;
  lastEffects.set(key,now);
  const [notes,duration,type]=soundPalette[name];
  playTones(notes,.046,.079,channel,type,duration);
}
function saveMixer(){
  try{
    localStorage.setItem(audioSettingsKey,JSON.stringify(mixer));
    localStorage.setItem("ultimo-posto-volume",String(mixer.music.level));
  }catch{}
}
function mixerPreview(channel){
  if(!audioOn||!channelLevel("master")||!channelLevel(channel))return false;
  if(channel==="music"){retryMusic();return true;}
  if(channel==="voices"&&window.speechSynthesis&&typeof SpeechSynthesisUtterance==="function"){
    const voice=new SpeechSynthesisUtterance(local("Prova voce","Voice test"));
    voice.lang=local("it-IT","en-GB");voice.volume=.55*channelLevel("voices")*channelLevel("master");
    window.speechSynthesis.cancel();window.speechSynthesis.speak(voice);
    return true;
  }
  playTones([60,67,72],.08,.08,channel==="master"?"interface":channel);
  return true;
}
function renderMixers(){
  for(const id of ["campusMixer","challengeMixer"]){
    const container=$(id);
    const focus=document.activeElement;
    const restore=container.contains(focus)?focus.dataset.mixerControl:null;
    container.replaceChildren();
    for(const [channel,it,en] of audioChannels){
      const row=document.createElement("div");row.className="mixer-row";
      const level=document.createElement("input"), mute=document.createElement("input");
      const caption=document.createElement("label"), muteCaption=document.createElement("label");
      const preview=document.createElement("button");
      level.type="range";level.min=0;level.max=100;level.value=mixer[channel].level;
      level.dataset.mixerControl=channel+"-level";
      mute.type="checkbox";mute.checked=mixer[channel].muted;mute.dataset.mixerControl=channel+"-mute";
      caption.append(local(it,en),level);
      mute.setAttribute("aria-label",local("Muto: ","Mute: ")+local(it,en));
      muteCaption.append(mute,local("Muto","Mute"));
      preview.textContent=local("Prova suono","Test sound");preview.dataset.mixerControl=channel+"-preview";
      preview.setAttribute("aria-label",preview.textContent+" · "+local(it,en));
      const update=()=>{
        mixer[channel]={level:Number(level.value),muted:mute.checked};
        syncMixer();saveMixer();
        for(const other of document.querySelectorAll("[data-mixer-control]")){
          if(other===level||other===mute)continue;
          if(other.dataset.mixerControl===channel+"-level")other.value=level.value;
          if(other.dataset.mixerControl===channel+"-mute")other.checked=mute.checked;
        }
      };
      level.oninput=update;mute.onchange=update;
      preview.onclick=()=>{container.querySelector("output").textContent=mixerPreview(channel)?
        local("Prova avviata","Playing test"):local("Canale silenziato o audio spento","Channel muted or audio off");};
      row.append(caption,muteCaption,preview);container.append(row);
    }
    if(id==="challengeMixer"){
      const toggle=document.createElement("button");
      toggle.textContent=tr(audioOn?"Audio acceso":"Audio spento");
      toggle.dataset.mixerControl="toggle";
      toggle.setAttribute("aria-pressed",String(audioOn));
      toggle.onclick=()=>{$("audio").onclick();renderMixers();};
      container.append(toggle);
    }
    const reset=document.createElement("button"),status=document.createElement("output");
    reset.textContent=local("Ripristina predefiniti","Restore defaults");
    reset.dataset.mixerControl="reset";
    reset.onclick=()=>{mixer=defaultMixer();syncMixer();saveMixer();renderMixers();};
    status.setAttribute("role","status");
    container.append(reset,status);
    if(restore)container.querySelector('[data-mixer-control="'+restore+'"]')?.focus();
  }
}

let pausedChallenge=null, pausedAt=0;
$("challengeAudio").ontoggle=()=>{
  if($("challengeAudio").open&&minigame){
    pausedChallenge=minigame;pausedAt=performance.now();
    if(minigame.pendingMove)clearTimeout(minigame.timer);
    keys.clear();controls.clear();
    return;
  }
  if(pausedChallenge&&pausedChallenge===minigame){
    const elapsed=performance.now()-pausedAt;
    if(minigame.replay)minigame.replay.started+=elapsed;
    if(minigame.pendingMove){
      const {run,ends}=minigame.pendingMove;
      scheduleChallenge(minigame,run,Math.max(0,ends-pausedAt));
    }
    for(const field of ["start","started","deadline","last"]){
      if(Number.isFinite(minigame[field])&&minigame[field]>0)minigame[field]+=elapsed;
    }
  }
  pausedChallenge=null;
};
document.addEventListener("click",event=>{
  const button=event.target.closest?.("button,summary");
  if(!button||button.disabled)return;
  if(button.closest("#challenge")&&$("challengeAudio").open&&
    !button.closest("#challengeAudio")&&button.id!=="challengeExit"){
    event.preventDefault();event.stopImmediatePropagation();
    return;
  }
  if(button.id==="audio")return;
  resumeEffects();
  if(button.closest("[data-move],.challenge-controls,.hand,#scopaChoices,#holdemActions")||button.id==="interact")return;
  sound(button.closest("#choices")?"choice":button.matches("summary,#homeButton,#edOpen")?"menu":"click","interface");
},true);

// iOS can interrupt Web Audio when Safari goes into the background.
function resumeEffects(){
  if(audioOn&&audioContext&&audioContext.state!=="running")audioContext.resume().catch(()=>{});
}
document.addEventListener("pointerdown",resumeEffects,{passive:true});
document.addEventListener("keydown",resumeEffects);
