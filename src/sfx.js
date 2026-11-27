// Effetti sonori sintetizzati (nessun file audio), voci a blip dei personaggi e
// letto sonoro ambientale per zona. Si appoggia al mixer di audio.js: usa i canali
// "interface", "map", "games" e "voices" e rispetta mute, volumi e audioOn.
// Le funzioni esistenti vengono avvolte (installSfxHooks) per non toccare gli altri file.
const sfxBasePalette=Object.keys(soundPalette);
const sfxMissing=[];
let sfxActive=0, sfxFoot=0, sfxCtx=null, sfxQuietUntil=0, sfxNoiseCache=null, sfxReverbCache=null;
const sfxLast=new Map();
const sfxRand=(a,b)=>a+Math.random()*(b-a);
const sfxJit=(p=.04)=>1+(Math.random()*2-1)*p;
const sfxPick=list=>list[Math.floor(Math.random()*list.length)];
const sfxMidi=n=>440*2**((n-69)/12);
// t = tono (f, f2 glissando, d durata, type, lp, v volume, a attacco, at ritardo)
// n = rumore filtrato (ft, f, f2, q, d, v, a, at)
const T=(f,d,o={})=>({k:"t",f,d,...o});
const N=(d,o={})=>({k:"n",d,...o});
const sfxShift=(specs,dt)=>specs.map(s=>({...s,at:(s.at||0)+dt}));
const sfxNotes=(notes,gap,d,o={})=>notes.map((n,i)=>T(sfxMidi(n)*sfxJit(.006),d,{...o,at:(o.at||0)+i*gap}));

const sfxLib={
  // passi: pavimenti, erba, strada, ghiaia; i piedi si alternano
  pavement:()=>{const p=(sfxFoot^=1)?1.07:.94;return [N(.05,{f:1900*p*sfxJit(.15),q:1.2,v:.04}),T(115*p*sfxJit(.08),.05,{f2:72,v:.05})];},
  floor:()=>{const p=(sfxFoot^=1)?1.06:.95;return [T(190*p*sfxJit(.06),.035,{f2:140,v:.03}),N(.03,{f:2600*p,q:2,v:.025})];},
  grass:()=>{const p=(sfxFoot^=1)?1.08:.93;return [N(.09,{f:3200*p,f2:2300,q:.7,a:.02,v:.04}),T(85*p,.06,{f2:60,v:.025})];},
  road:()=>{const p=(sfxFoot^=1)?1.05:.95;return [N(.055,{ft:"lowpass",f:1300*p*sfxJit(.1),q:.7,v:.055}),T(100*p,.05,{f2:65,v:.04})];},
  gravel:()=>{const p=(sfxFoot^=1)?1.05:.95;return [N(.04,{f:4600*p,q:.6,v:.045}),N(.04,{f:3800*p,q:.7,v:.04,at:.035}),N(.04,{f:5200*p,q:.6,v:.03,at:.07})];},
  // porte, scale, tornello
  door:()=>[N(.06,{ft:"lowpass",f:420,v:.1}),T(150*sfxJit(.05),.14,{f2:85,v:.12}),T(220,.28,{f2:310,type:"sawtooth",lp:650,v:.025,at:.03}),N(.02,{f:3200,q:2,v:.05,at:.22})],
  stairs:()=>[0,1,2,3].flatMap(i=>[T(105+i*7,.05,{f2:70,v:.05,at:i*.095}),N(.035,{f:1700+i*90,q:1.1,v:.035,at:i*.095})]),
  gate:()=>[N(.03,{f:1500,q:1.5,v:.09}),T(300,.06,{f2:190,type:"square",lp:900,v:.04}),N(.03,{f:1300,q:1.5,v:.08,at:.17}),T(260,.06,{f2:170,type:"square",lp:900,v:.04,at:.17}),T(1320,.09,{v:.04,at:.32})],
  // monete, acquisti, obiettivi, interfaccia
  coin:()=>{const f=sfxJit(.03);return [T(1318*f,.1,{type:"triangle",v:.06}),T(2093*f,.3,{v:.065,at:.075}),T(4186*f,.18,{v:.012,at:.08})];},
  buy:()=>[N(.03,{f:2500,q:1.5,v:.06}),T(2637,.6,{v:.045,at:.03}),T(3520,.4,{v:.022,at:.035}),T(1568*sfxJit(.02),.2,{type:"triangle",v:.035,at:.12})],
  objective:()=>sfxNotes([72,76,79],.095,.3,{v:.055,type:"triangle"}).concat(sfxNotes([84],0,.5,{v:.03,at:.3})),
  error:()=>[T(190,.16,{f2:130,type:"square",lp:650,v:.04}),T(150,.2,{f2:100,type:"square",lp:600,v:.04,at:.1})],
  click:()=>[T(1250*sfxJit(.05),.03,{v:.03}),N(.012,{f:4200,q:1,v:.018})],
  choice:()=>[T(660*sfxJit(.03),.07,{type:"triangle",v:.045}),T(990*sfxJit(.03),.09,{type:"triangle",v:.04,at:.05})],
  menu:()=>[T(520,.1,{f2:790,v:.045}),T(1040,.12,{v:.015,at:.04})],
  menuClose:()=>[T(790,.09,{f2:500,v:.04})],
  back:()=>[T(640,.09,{f2:420,type:"triangle",v:.04})],
  save:()=>[T(880,.2,{v:.04}),T(1320,.35,{v:.04,at:.11}),N(.08,{f:3500,q:.8,a:.03,v:.015,at:.02})],
  start:()=>sfxNotes([60,64,67,72],.075,.22,{type:"triangle",v:.05}).concat([T(1046,.4,{v:.03,at:.3})]),
  talk:()=>[T(330*sfxJit(.08),.05,{f2:380,type:"triangle",v:.02})],
  inspect:()=>{
    switch(sfxCtx){
      case"sign":case"board":return [N(.14,{f:2300*sfxJit(.1),q:.7,a:.02,v:.045}),T(230,.06,{f2:160,v:.05,at:.02})];
      case"desk":case"chair":case"bench":case"booth":return [T(210,.08,{f2:110,v:.09}),N(.03,{ft:"lowpass",f:900,v:.05}),T(190,.08,{f2:105,v:.07,at:.11})];
      case"bin":case"lamp":return [T(540*sfxJit(.05),.22,{type:"triangle",v:.04}),T(830,.18,{type:"triangle",v:.025,at:.01}),N(.04,{f:3000,q:1,v:.04})];
      case"window":return [T(1850*sfxJit(.05),.12,{v:.04}),T(2780,.1,{v:.015,at:.01})];
      case"tree":case"pine":case"cypress":case"flowers":case"grass":return [N(.22,{f:3600,q:.6,a:.05,v:.04}),T(420,.05,{f2:520,v:.025,at:.04})];
      default:return [T(740*sfxJit(.04),.1,{f2:880,v:.045}),T(1480,.12,{v:.018,at:.03})];
    }
  },
  surprise:()=>[T(200,.28,{f2:820,v:.07}),N(.08,{f:900,q:.6,v:.05,at:.25}),...sfxNotes([79,84,88,91],.1,.28,{v:.045,at:.3})],
  discovery:()=>sfxNotes([76,80,83,88],.08,.35,{v:.04}),
  arrive:()=>[N(.6,{f:700,f2:1700,q:.5,a:.22,v:.03}),T(sfxMidi(55),.7,{v:.02,a:.2})],
  pickup:()=>[T(740*sfxJit(.03),.08,{f2:1100,v:.045}),T(1480,.16,{v:.03,at:.06})],
  // traffico e clacson
  traffic:()=>{
    const out=[N(.7,{f:260,f2:900,q:.9,a:.25,v:.08}),N(.6,{f:900,f2:260,q:.9,a:.05,v:.06,at:.5})];
    const r=Math.random();
    if(r<.14)out.push(...sfxHorn("car"));else if(r<.22)out.push(...sfxHorn("scooter"));else if(r<.27)out.push(...sfxHorn("bus"));
    return out;
  },
  carPass:()=>[N(1.1,{f:300,f2:1000,q:.8,a:.45,v:.07}),N(.9,{f:1000,f2:280,q:.8,v:.05,at:1})],
  horn:()=>sfxHorn(sfxPick(["car","car","scooter","bus"])),
  // minigiochi
  whistle:()=>[T(2860*sfxJit(.02),.16,{v:.04}),T(2900*sfxJit(.02),.16,{v:.04}),N(.16,{f:3000,q:2,v:.012})],
  pass:()=>[T(190,.06,{f2:125,v:.05}),N(.03,{f:2400,q:1,v:.02})],
  shot:()=>[N(.05,{ft:"lowpass",f:900,v:.1}),T(160,.14,{f2:60,v:.11})],
  bounce:()=>[T(320*sfxJit(.1),.07,{f2:210,v:.06}),N(.015,{f:2000,q:1,v:.02})],
  post:()=>[T(1230*sfxJit(.02),.3,{type:"triangle",v:.05}),T(1830,.22,{v:.025}),N(.03,{f:3500,q:1.5,v:.04})],
  goal:()=>[T(392,.5,{type:"sawtooth",lp:1200,v:.04}),T(523,.5,{type:"sawtooth",lp:1300,v:.035,at:.01}),T(659,.5,{type:"sawtooth",lp:1400,v:.03,at:.02}),N(.7,{f:900,q:.4,a:.2,v:.05})],
  crowd:()=>[N(1.1,{f:700,f2:1100,q:.4,a:.35,v:.06}),N(1,{f:1500,q:.5,a:.4,v:.025})],
  shuffle:()=>[0,1,2,3,4,5].map(i=>N(.035,{f:3600+i*160,q:.9,v:.03,at:i*.05})),
  deal:()=>[N(.05,{ft:"highpass",f:2800,v:.045}),T(240,.05,{f2:160,v:.025})],
  card:()=>[N(.05,{ft:"highpass",f:2600*sfxJit(.1),v:.04}),T(210,.05,{f2:150,v:.03})],
  trick:()=>[N(.04,{ft:"highpass",f:2400,v:.045}),T(300,.07,{f2:200,v:.06}),T(sfxMidi(72),.2,{v:.03,at:.05})],
  scopa:()=>[N(.05,{ft:"highpass",f:2400,v:.05}),...sfxNotes([72,76,79,84],.07,.25,{type:"triangle",v:.04,at:.05})],
  chips:()=>[T(2300*sfxJit(.04),.04,{type:"triangle",v:.04}),N(.03,{f:3500,q:2,v:.03}),T(1900,.04,{type:"triangle",v:.03,at:.05})],
  hoof:()=>[N(.05,{ft:"lowpass",f:700,v:.1}),T(95*sfxJit(.1),.07,{f2:60,v:.08})],
  finish:()=>sfxNotes([72,76,79,84],.09,.3,{type:"triangle",v:.05}).concat([T(2093,.5,{v:.02,at:.3})]),
  rhythm:()=>[T(sfxMidi(72+Math.floor(Math.random()*5)*2),.12,{v:.055}),T(sfxMidi(84),.1,{v:.015,at:.02})],
  gameStart:()=>[T(1568,.1,{v:.04}),T(2093,.25,{v:.04,at:.07}),...sfxNotes([60,64,67,72,76],.07,.18,{type:"square",lp:2400,v:.028,at:.2})],
  win:()=>[...sfxNotes([72,76,79,84,88],.09,.28,{type:"triangle",v:.055}),T(sfxMidi(84),.7,{v:.04,at:.5}),T(sfxMidi(79),.7,{v:.03,at:.5}),T(sfxMidi(88),.8,{v:.025,at:.5})],
  lose:()=>[T(392,.55,{f2:196,type:"triangle",lp:1100,v:.06}),T(311,.6,{f2:156,type:"triangle",lp:900,v:.04,at:.18})],
  tie:()=>[...sfxNotes([67,64],.14,.3,{type:"triangle",v:.045})],
  victory:()=>sfxNotes([67,72,76,79,84],.1,.3,{type:"triangle",v:.05}).concat([T(sfxMidi(91),.8,{v:.025,at:.5})]),
  gameOver:()=>[...sfxNotes([60,57,53,48],.27,.55,{type:"triangle",lp:1200,v:.06}),T(70,.9,{f2:38,v:.14,at:.75})],
  thud:()=>[T(125,.28,{f2:45,v:.18}),N(.1,{ft:"lowpass",f:650,v:.1})],
  crash:()=>[N(.35,{f:2700,f2:1500,q:5,v:.035}),N(.35,{ft:"lowpass",f:1100,f2:180,q:.7,v:.15,at:.28}),T(90,.4,{f2:35,v:.2,at:.28}),T(1400,.2,{type:"triangle",v:.03,at:.3})],
  endTraffic:()=>[...sfxLib.crash(),...sfxShift(sfxLib.gameOver(),.7)],
  endGuard:()=>[...sfxLib.guardWhistle2(),...sfxShift(sfxLib.thud(),.55),...sfxShift(sfxLib.gameOver(),1.05)],
  endBoar:()=>[...sfxLib.thud(),T(1000,.3,{f2:520,type:"sawtooth",lp:2000,v:.04,at:.05}),...sfxShift(sfxLib.gameOver(),.5)],
  // guardia e tornello
  guardWhistle1:()=>[T(2780,.4,{v:.045}),T(2812,.4,{v:.045}),N(.4,{f:3100,q:2,v:.012})],
  guardWhistle2:()=>[0,.3].flatMap(at=>[T(3080,.22,{v:.05,at}),T(3118,.22,{v:.05,at}),N(.22,{f:3300,q:2,v:.014,at})]),
  // Villa Ada
  boarGrunt:()=>[T(98*sfxJit(.1),.2,{f2:68,type:"sawtooth",lp:420,v:.12}),N(.14,{f:520,q:1,v:.055}),T(140*sfxJit(.1),.16,{f2:88,type:"sawtooth",lp:520,v:.1,at:.16})],
  boarCharge:()=>[N(.28,{f:650,f2:1300,q:2,a:.05,v:.09}),T(82,.34,{f2:55,type:"sawtooth",lp:320,v:.11}),T(960,.32,{f2:520,type:"sawtooth",lp:2000,v:.03,at:.1})],
  boarChew:()=>[0,1,2,3,4].flatMap(i=>{const at=i*.15+Math.random()*.03;return [N(.05,{f:1500*sfxJit(.1),q:1.5,v:.055,at}),T(92,.05,{f2:62,v:.04,at})];}),
  boarRelief:()=>[T(125,.4,{f2:85,lp:400,type:"sawtooth",v:.05}),N(.35,{ft:"lowpass",f:600,q:.6,a:.1,v:.04})],
  applePick:()=>[N(.22,{ft:"highpass",f:3200,q:.6,a:.05,v:.04}),T(480,.07,{f2:720,v:.045,at:.12}),T(1100,.1,{v:.02,at:.14})],
  throw:()=>[N(.28,{f:400,f2:2200,q:1,a:.08,v:.06})],
  // fumo
  pack:()=>[N(.16,{f:3100,q:.8,a:.05,v:.05}),T(210,.05,{f2:130,v:.03,at:.14})],
  lighter:()=>[N(.02,{f:4200,q:2,v:.06}),N(.02,{f:3600,q:2,v:.06,at:.08}),N(.2,{ft:"highpass",f:1500,q:.5,a:.05,v:.03,at:.1})],
  ember:()=>[0,1,2].map(i=>N(.02,{ft:"highpass",f:5000,v:.025,at:i*.05+Math.random()*.02})),
  exhale:()=>[N(.9,{f:900,f2:520,q:.5,a:.25,v:.055})],
  extinguish:()=>[N(.3,{f:3000,f2:1100,q:.8,v:.05}),T(150,.1,{f2:90,v:.03})],
  // ambiente: uccelli (varianti), richiami, tintinnii
  bird:()=>{
    const base=sfxRand(3000,4800),type=Math.random();
    if(type<.4)return [0,1,2].map(i=>T(base*(1+i*.07),.07,{f2:base*(1.2+i*.05),v:.03,at:i*.1}));
    if(type<.7)return Array.from({length:7},(_,i)=>T(base*(i%2?1.09:1),.04,{v:.022,at:i*.055}));
    const scale=[0,2,4,7,9].map(s=>sfxMidi(88+s)),up=Math.random()<.5;
    return scale.slice(0,4).map((f,i)=>T(up?f:scale[3-i],.1,{v:.025,at:i*.12}));
  },
  cuckoo:()=>[T(690,.2,{f2:670,v:.04}),T(550,.3,{f2:535,v:.04,at:.26})],
  clink:()=>{const f=sfxRand(2400,3800);return [T(f,.25,{v:.035}),T(f*1.5,.18,{v:.015,at:.01}),N(.02,{f:5000,q:2,v:.02})];},
  distantHorn:()=>sfxHorn(sfxPick(["car","scooter"]))
};
function sfxHorn(kind){
  if(kind==="bus")return [T(190,.55,{type:"sawtooth",lp:520,v:.05}),T(238,.55,{type:"sawtooth",lp:560,v:.04})];
  if(kind==="scooter")return [T(880,.13,{f2:760,type:"square",lp:1500,v:.025}),T(880,.1,{f2:740,type:"square",lp:1500,v:.02,at:.17})];
  return [T(420,.17,{type:"square",lp:1200,v:.03}),T(530,.17,{type:"square",lp:1300,v:.025}),T(420,.17,{type:"square",lp:1200,v:.03,at:.22}),T(530,.17,{type:"square",lp:1300,v:.025,at:.22})];
}
// Ogni nome ha comunque una voce di riserva nella tavolozza di audio.js.
for(const name of Object.keys(sfxLib))if(!soundPalette[name])soundPalette[name]=[[60],.06,"sine"];

// ---------- motore di sintesi ----------
const sfxChannelOn=channel=>Boolean(audioOn&&audioContext&&effectsMaster&&channelLevel("master")&&channelLevel(channel)&&effectBuses.get(channel));
function sfxNoise(ctx){
  if(sfxNoiseCache?.ctx===ctx)return sfxNoiseCache.buffer;
  const length=Math.floor(ctx.sampleRate*1.5),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<length;i++)data[i]=Math.random()*2-1;
  sfxNoiseCache={ctx,buffer};return buffer;
}
function sfxReverb(ctx){
  if(sfxReverbCache?.ctx===ctx)return sfxReverbCache.input;
  const length=Math.floor(ctx.sampleRate*.85),buffer=ctx.createBuffer(2,length,ctx.sampleRate);
  for(let c=0;c<2;c++){const data=buffer.getChannelData(c);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length)**2.6;}
  const input=ctx.createGain(),convolver=ctx.createConvolver(),out=ctx.createGain();
  convolver.buffer=buffer;out.gain.value=.8;
  input.connect(convolver);convolver.connect(out);out.connect(effectsMaster);
  sfxReverbCache={ctx,input};return input;
}
function sfxIndoors(){
  try{
    if(!state||screen!=="game")return false;
    return room(state.zone).ground==="floor"&&state.zone!=="pola-cortile"&&state.zone!==villaZone;
  }catch{return false;}
}
function sfxVoiceNode(ctx,bus,wet,at,s,vol,channel){
  const d=s.d,top=Math.min(.14,(s.v??.05)*vol);
  const g=ctx.createGain(),attack=Math.min(s.a??.006,d*.6);
  let src,tail;
  if(s.k==="n"){
    src=ctx.createBufferSource();src.buffer=sfxNoise(ctx);src.loop=true;
    const f=ctx.createBiquadFilter();f.type=s.ft||"bandpass";
    f.frequency.setValueAtTime(s.f||1500,at);
    if(s.f2)f.frequency.exponentialRampToValueAtTime(s.f2,at+d);
    f.Q.value=s.q||1;src.connect(f);tail=f;
  }else{
    src=ctx.createOscillator();src.type=s.type||"sine";
    src.frequency.setValueAtTime(s.f,at);
    if(s.f2)src.frequency.exponentialRampToValueAtTime(Math.max(20,s.f2),at+d);
    tail=src;
    if(s.lp){const f=ctx.createBiquadFilter();f.type="lowpass";f.frequency.value=s.lp;src.connect(f);tail=f;}
  }
  g.gain.setValueAtTime(.0001,at);
  g.gain.linearRampToValueAtTime(Math.max(.0002,top),at+attack);
  g.gain.exponentialRampToValueAtTime(.0001,at+d);
  tail.connect(g);g.connect(bus);
  let send=null;
  if(wet){send=ctx.createGain();send.gain.value=.35*channelLevel(channel);g.connect(send);send.connect(wet);}
  sfxActive++;
  src.onended=()=>{
    sfxActive--;
    try{src.disconnect();tail.disconnect();g.disconnect();send?.disconnect();}catch{}
  };
  if(s.k==="n")src.start(at,Math.random()*1.2);else src.start(at);
  src.stop(at+d+.03);
}
// opts: vol (moltiplicatore), ambient (niente limite di ripetizione)
function sfxSound(name,channel="games",opts={}){
  if(!sfxChannelOn(channel))return;
  const make=sfxLib[name];
  if(!make)return;
  const key=channel+":"+name;
  if(!opts.ambient){
    const now=performance.now(),gap=opts.gap??70;
    if(now-(sfxLast.get(key)??-Infinity)<gap)return;
    sfxLast.set(key,now);
  }
  const ctx=audioContext,bus=effectBuses.get(channel),at=ctx.currentTime+.003;
  const wet=channel!=="games"&&sfxIndoors()?sfxReverb(ctx):null;
  const vol=opts.vol??1;
  for(const s of make()){
    if(sfxActive>=60)break;
    sfxVoiceNode(ctx,bus,wet,at+(s.at||0),s,vol,channel);
  }
}
function sfxQuiet(ms){sfxQuietUntil=performance.now()+ms;}
// Nome del passo in base alla superficie (usato da dialogue.js).
function footstepSound(surface){
  return surface==="grass"?"grass":surface==="floor"?"floor":surface==="road"?"road":surface==="path"?"gravel":"pavement";
}
// Suono dei pulsanti dell'interfaccia (usato da audio.js).
function uiClickSound(button){
  if(button.closest("#choices"))return "choice";
  if(button.matches("summary"))return button.parentElement?.open?"menuClose":"menu";
  if(button.id==="homeButton")return screen==="game"?"save":"menu";
  if(button.id==="closeConversation"||button.id==="challengeExit"||button.id==="testBack")return "back";
  if(["start","free","play","resume"].includes(button.id))return "start";
  if(button.id==="edOpen")return "menu";
  return "click";
}

// ---------- voci dei personaggi ----------
let sfxVoiceToken=0;
function sfxSeed(uid){
  if(typeof characterSeed==="function")return characterSeed(uid);
  let h=2166136261;for(const ch of uid)h=Math.imul(h^ch.codePointAt(0),16777619);return h>>>0;
}
function sfxVoiceProfile(uid,kind){
  const seed=sfxSeed(uid),bits=n=>(seed>>n)&7;
  const low=["professor","bartender","guard"].includes(kind),mid=["heatedStudent","athlete","cleaner"].includes(kind);
  const base=low?105+bits(0)*9:mid?150+bits(0)*13:195+bits(0)*21;
  return {base,type:["square","triangle","sawtooth","sine","square"][bits(3)%5],len:.045+bits(6)*.004,cut:1300+bits(9)*180,lilt:[0,2,4,7,9][bits(12)%5]};
}
const sfxVowels={a:0,e:3,i:7,o:-2,u:-5,à:0,è:3,é:3,ì:7,ò:-2,ù:-5};
function sfxBlip(profile,semi,vol){
  if(!sfxChannelOn("voices"))return;
  const ctx=audioContext,bus=effectBuses.get("voices"),at=ctx.currentTime+.002,d=profile.len;
  const f=profile.base*2**((semi+profile.lilt/3)/12)*sfxJit(.015);
  const osc=ctx.createOscillator(),lp=ctx.createBiquadFilter(),g=ctx.createGain();
  osc.type=profile.type;osc.frequency.setValueAtTime(f,at);osc.frequency.exponentialRampToValueAtTime(f*(semi>4?1.04:.97),at+d);
  lp.type="lowpass";lp.frequency.value=profile.cut;
  g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(.05*vol,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+d);
  osc.connect(lp);lp.connect(g);g.connect(bus);
  const wet=sfxIndoors()?sfxReverb(ctx):null;let send=null;
  if(wet){send=ctx.createGain();send.gain.value=.3*channelLevel("voices");g.connect(send);send.connect(wet);}
  sfxActive++;
  osc.onended=()=>{sfxActive--;try{osc.disconnect();lp.disconnect();g.disconnect();send?.disconnect();}catch{}};
  osc.start(at);osc.stop(at+d+.02);
}
function sfxVoiceCancel(){sfxVoiceToken++;}
function sfxSpeak(text,animate){
  sfxVoiceCancel();
  if(!text||!state||screen!=="game"||!activeScene||state.ending||!sfxChannelOn("voices"))return;
  const o=currentObject();
  if(!o)return;
  const isGate=o.uid==="viale-ingresso-varco"&&Boolean(state.gateConfrontation);
  if(!isGate&&(kindLayer(o)!=="persone"||isVehicle(o)))return;
  const profile=sfxVoiceProfile(isGate?"guardia-tornello":o.uid,isGate?"guard":o.kind);
  const speed=16,events=[];
  let last=-99,count=0;
  const chars=[...text];
  for(let i=0;i<chars.length&&count<34;i++){
    const ch=chars[i].toLowerCase();
    if(!(ch in sfxVowels))continue;
    const t=(animate&&!reducedMotion?i*speed:count*85);
    if(t-last<72)continue;
    if(t>2300)break;
    const nextWord=chars.slice(i+1,i+4).join("");
    const end=/[?!]/.test(nextWord)?5:0;
    events.push({t,semi:sfxVowels[ch]+end+Math.round(sfxRand(-1,1))});last=t;count++;
  }
  const quick=!animate||reducedMotion;
  const list=quick?events.slice(0,3):events;
  if(!list.length)return;
  const token=sfxVoiceToken,start=performance.now();
  const step=i=>{
    if(token!==sfxVoiceToken||i>=list.length)return;
    sfxBlip(profile,list[i].semi,i===0?1.1:sfxRand(.75,1));
    if(i+1<list.length)setTimeout(()=>step(i+1),Math.max(0,list[i+1].t-(performance.now()-start)));
  };
  step(0);
}

// ---------- letto sonoro ambientale ----------
let sfxAmb=null;
const sfxProfiles={
  villa:{wind:.85,leaves:1,traffic:.1,murmur:0,room:0,birds:.55,cuckoo:.012},
  campus:{wind:.3,leaves:.3,traffic:.16,murmur:.55,room:0,birds:.24},
  viale:{wind:.08,leaves:0,traffic:1,murmur:.3,room:0,birds:.04,cars:.14},
  street:{wind:.1,leaves:0,traffic:.5,murmur:.42,room:0,birds:.07,cars:.06},
  courtyard:{wind:.2,leaves:.2,traffic:.05,murmur:.8,room:0,birds:.28},
  busy:{wind:0,leaves:0,traffic:0,murmur:1,room:.6,birds:0,clink:.08},
  hall:{wind:0,leaves:0,traffic:0,murmur:.1,room:.9,birds:0},
  indoor:{wind:0,leaves:0,traffic:0,murmur:.22,room:1,birds:0}
};
function sfxZoneKind(){
  const z=state.zone;
  if(z===villaZone)return "villa";
  if(z==="ingresso")return "viale";
  if(z==="giardino")return atViale(state)?"viale":"campus";
  if(z==="parenzo"||z==="pola"||z.startsWith("pq-"))return "street";
  if(z==="pola-cortile")return "courtyard";
  if(["caffe","mensa","primo"].includes(z))return "busy";
  if(["aula-chiesa","dome","dome2","aula-toti","polivalente","parenzo-interno"].includes(z))return "hall";
  return room(z).ground==="floor"?"indoor":"campus";
}
function sfxBed(ctx,out,filters){
  const src=ctx.createBufferSource();src.buffer=sfxNoise(ctx);src.loop=true;
  const nodes=filters.map(([type,freq,q])=>{const f=ctx.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;return f;});
  const gain=ctx.createGain();gain.gain.value=0;
  let tail=src;for(const f of nodes){tail.connect(f);tail=f;}
  tail.connect(gain);gain.connect(out);
  src.start(0,Math.random()*1.2);
  return {src,gain,nodes};
}
function sfxAmbStart(){
  const ctx=audioContext,out=ctx.createGain();
  out.gain.value=1;out.connect(effectBuses.get("map"));
  sfxAmb={ctx,out,duck:0,
    wind:sfxBed(ctx,out,[["lowpass",520,.5]]),
    leaves:sfxBed(ctx,out,[["highpass",3400,.5],["lowpass",7500,.5]]),
    traffic:sfxBed(ctx,out,[["lowpass",230,.6]]),
    hiss:sfxBed(ctx,out,[["bandpass",950,.7]]),
    murmurA:sfxBed(ctx,out,[["bandpass",620,.9]]),
    murmurB:sfxBed(ctx,out,[["bandpass",1350,1.4]]),
    room:sfxBed(ctx,out,[["lowpass",150,.7]])};
}
function sfxAmbStop(){
  if(!sfxAmb)return;
  const old=sfxAmb;sfxAmb=null;
  try{old.out.gain.setTargetAtTime(0,old.ctx.currentTime,.08);}catch{}
  setTimeout(()=>{
    for(const key of ["wind","leaves","traffic","hiss","murmurA","murmurB","room"]){
      try{old[key].src.stop();old[key].src.disconnect();old[key].gain.disconnect();}catch{}
    }
    try{old.out.disconnect();}catch{}
  },600);
}
function sfxAmbTick(){
  const active=audioOn&&audioContext&&effectsMaster&&screen==="game"&&state&&!document.hidden&&
    channelLevel("master")&&channelLevel("map");
  if(!active){sfxAmbStop();return;}
  if(!sfxAmb||sfxAmb.ctx!==audioContext){sfxAmbStop();sfxAmbStart();}
  const kind=sfxZoneKind(),p=sfxProfiles[kind]||sfxProfiles.campus;
  const duck=minigame?0:state.ending?.12:activeScene?.55:1;
  const now=sfxAmb.ctx.currentTime,tau=.7,calm=reducedMotion?.4:1;
  const flutter=()=>sfxRand(.55,1);
  const set=(bed,level)=>bed.gain.gain.setTargetAtTime(Math.max(0,level*duck),now,tau);
  set(sfxAmb.wind,p.wind*.05*(calm<1?1:sfxRand(.6,1.2)));
  set(sfxAmb.leaves,p.leaves*.02*(calm<1?.7:sfxRand(.3,1.3)));
  set(sfxAmb.traffic,p.traffic*.075);
  set(sfxAmb.hiss,p.traffic*.014);
  set(sfxAmb.murmurA,p.murmur*.035*flutter());
  set(sfxAmb.murmurB,p.murmur*.02*flutter());
  set(sfxAmb.room,p.room*.05);
  if(duck<.5)return;
  const ev=(name,chance,vol=1)=>{if(Math.random()<chance)sfxSound(name,"map",{ambient:true,vol:vol*duck});};
  ev("bird",(p.birds||0)*calm);
  if(p.cuckoo)ev("cuckoo",p.cuckoo,.8);
  if(p.cars)ev("carPass",p.cars,.5);
  if(p.cars)ev("distantHorn",p.cars*.12,.4);
  if(p.clink)ev("clink",p.clink,.8);
  if(kind==="villa"&&typeof villaBoars!=="undefined"&&Math.random()<.07){
    const near=villaBoars.filter(b=>b.mode==="graze").map(b=>Math.hypot(state.x-b.x,state.y-b.y)).sort((a,b)=>a-b)[0];
    if(near!==undefined&&near<14)sfxSound("boarGrunt","map",{ambient:true,vol:Math.max(.2,1.1-near/14)*.7*duck});
  }
}
function sfxTick(){try{sfxAmbTick();}catch{}}

// ---------- osservatore dello stato (eventi senza ganci nei file altrui) ----------
const sfxPrev={state:null,zone:null,ending:null,mele:0,pockets:0,moment:null,warned:false,gate:0};
function sfxWatch(){
  if(!state||screen!=="game"){sfxPrev.state=null;return;}
  if(sfxPrev.state!==state){
    Object.assign(sfxPrev,{state,zone:state.zone,ending:state.ending,mele:state.mele||0,pockets:state.pockets.length,
      moment:state.freeMoment,warned:Boolean(state.guardWarned),gate:state.gateConfrontation||0});
    return;
  }
  if(sfxPrev.zone!==state.zone){sfxPrev.zone=state.zone;sfxSound("arrive","map",{gap:300});}
  if(sfxPrev.ending!==state.ending){
    sfxPrev.ending=state.ending;
    const e=state.ending;
    if(e)sfxSound(e.traffic?"endTraffic":e.guard?"endGuard":e.boar?"endBoar":"victory","map",{gap:0});
  }
  if(sfxPrev.moment!==state.freeMoment){
    const had=Boolean(sfxPrev.moment);sfxPrev.moment=state.freeMoment;
    if(state.freeMoment&&!had)sfxSound("victory","map",{vol:.8});
  }
  const mele=state.mele||0;
  if(mele>sfxPrev.mele)sfxSound("applePick","map");
  else if(mele<sfxPrev.mele)sfxSound("throw","map");
  sfxPrev.mele=mele;
  const pockets=state.pockets.length;
  if(pockets>sfxPrev.pockets&&performance.now()>sfxQuietUntil)setTimeout(()=>sfxSound("pickup","map"),90);
  sfxPrev.pockets=pockets;
  const gate=state.gateConfrontation||0;
  if(gate===2&&sfxPrev.gate!==2)sfxSound("guardWhistle2","map",{gap:0});
  sfxPrev.gate=gate;
}

function installSfxHooks(){
  const wrap=(name,make)=>{try{make();}catch{sfxMissing.push("hook:"+name);}};
  const safe=fn=>{try{fn();}catch{}};
  const baseSound=sound;
  wrap("sound",()=>{sound=function(name,channel="games"){
    if(sfxLib[name]){safe(()=>sfxSound(name,channel));return;}
    if(!soundPalette[name]){sfxMissing.push(name);return;}
    return baseSound(name,channel);
  };});
  const baseStop=stopEffects;
  wrap("stopEffects",()=>{stopEffects=function(){sfxVoiceCancel();sfxAmbStop();return baseStop.apply(this,arguments);};});
  const baseRender=renderScene;
  wrap("renderScene",()=>{renderScene=function(){const r=baseRender.apply(this,arguments);safe(sfxWatch);return r;};});
  const baseCaption=showCaption;
  wrap("showCaption",()=>{showCaption=function(text,animate){const r=baseCaption.apply(this,arguments);safe(()=>sfxSpeak(text,animate));return r;};});
  const baseFinish=finishCaption;
  wrap("finishCaption",()=>{finishCaption=function(){const r=baseFinish.apply(this,arguments);if(r)sfxVoiceCancel();return r;};});
  const baseInteract=interact;
  wrap("interact",()=>{interact=function(){
    safe(()=>{sfxCtx=exploringCampus()?(nearby()?.kind??null):null;});
    try{return baseInteract.apply(this,arguments);}finally{sfxCtx=null;}
  };});
  const baseAuto=autoEncounter;
  wrap("autoEncounter",()=>{autoEncounter=function(o){
    sfxCtx=o?.kind??null;
    try{return baseAuto.apply(this,arguments);}finally{sfxCtx=null;}
  };});
  const baseWarn=warnAtGate;
  wrap("warnAtGate",()=>{warnAtGate=function(){
    const was=Boolean(state?.guardWarned);
    const r=baseWarn.apply(this,arguments);
    safe(()=>{if(!was&&state.guardWarned&&state.gateConfrontation!==2)sfxSound("guardWhistle1","map",{gap:0});});
    return r;
  };});
  const baseCheckpoint=checkpoint;
  wrap("checkpoint",()=>{checkpoint=function(){sfxQuiet(500);return baseCheckpoint.apply(this,arguments);};});
  const baseOpen=openChallenge;
  wrap("openChallenge",()=>{openChallenge=function(){const r=baseOpen.apply(this,arguments);safe(()=>sfxSound("gameStart","games",{gap:0}));return r;};});
  const baseEnd=endChallenge;
  wrap("endChallenge",()=>{endChallenge=function(g,result){
    sfxQuiet(700);
    const r=baseEnd.apply(this,arguments);
    safe(()=>sfxSound(result==="win"?"win":result==="tie"?"tie":"lose","games",{gap:0}));
    return r;
  };});
  const baseVilla=tickVillaAda;
  wrap("tickVillaAda",()=>{tickVillaAda=function(now){
    const before=villaBoars.map(b=>b.mode);
    const r=baseVilla.apply(this,arguments);
    safe(()=>{
      villaBoars.forEach((b,i)=>{
        const was=before[i];
        if(!was||was===b.mode)return;
        const vol=Math.max(.3,1.15-Math.hypot(state.x-b.x,state.y-b.y)/16);
        if(b.mode==="alert")sfxSound("boarGrunt","map",{vol,gap:250});
        else if(b.mode==="charge")sfxSound("boarCharge","map",{vol,gap:250});
        else if(b.mode==="eat")sfxSound("boarChew","map",{vol,gap:250});
        else if(was==="charge"&&b.mode==="graze")sfxSound("boarRelief","map",{vol:vol*.8,gap:250});
      });
      sfxWatch();
    });
    return r;
  };});
  // sorprese: la finestra modale si apre dentro checkCampusSurprise
  const baseSurprise=checkCampusSurprise;
  wrap("checkCampusSurprise",()=>{checkCampusSurprise=function(){
    const was=$("campusSurprise").open;
    const r=baseSurprise.apply(this,arguments);
    safe(()=>{if(!was&&$("campusSurprise").open)sfxSound("surprise","interface",{gap:0});});
    return r;
  };});
  // Esc: chiude conversazione o minigioco
  window.addEventListener("keydown",event=>{
    if(event.key!=="Escape"||screen!=="game"||!state)return;
    if((activeScene&&!state.ending)||(minigame&&!$("challengeAudio").open))safe(()=>sfxSound("back","interface"));
  },true);
  setInterval(sfxTick,400);
}
installSfxHooks();
