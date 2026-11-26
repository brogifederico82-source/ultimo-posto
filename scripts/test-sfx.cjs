// Test Playwright dell'audio: stubba AudioContext, verifica che ogni nome di suono usato
// nel codice esista e che nessuna interazione produca errori.
// Uso: NODE_PATH=$(npm root -g) GAME_URL=file://$PWD/dist/index.html node scripts/test-sfx.cjs
const {chromium}=require("playwright");
const fs=require("node:fs");
const path=require("node:path");
const url=process.env.GAME_URL||"file://"+path.resolve(__dirname,"../dist/index.html");
const problems=[];
const fail=m=>{problems.push(m);console.log("FAIL",m);};
const ok=(m)=>console.log("ok  ",m);

// ---- 1. scansione statica dei nomi ----
const src=path.resolve(__dirname,"../src");
const channels=new Set(["map","interface","games","voices","master","music"]);
const used=new Map();
for(const file of fs.readdirSync(src).filter(f=>f.endsWith(".js"))){
  const text=fs.readFileSync(path.join(src,file),"utf8");
  const calls=[...text.matchAll(/\b(?:sound|sfxSound)\(([^;]*?)\)(?:;|\}|,|$)/gm)];
  for(const [,args] of calls){
    const clean=args.replace(/[!=]==?\s*"[^"]*"/g,"");
    for(const [,name] of clean.matchAll(/"([A-Za-z][\w-]*)"/g)){
      if(channels.has(name))continue;
      if(!used.has(name))used.set(name,new Set());
      used.get(name).add(file);
    }
  }
  for(const [,name] of text.matchAll(/\bev\("([A-Za-z]\w*)"/g)){
    if(!used.has(name))used.set(name,new Set());
    used.get(name).add(file);
  }
}

const stubScript=()=>{
  window.__audio={osc:0,noise:0,gains:0,resumed:0,errors:[]};
  const count=window.__audio;
  const param=()=>{const f=function(){};return new Proxy(f,{get:(t,k)=>k==="value"?0:param(),set:()=>true,apply:()=>undefined});};
  const node=type=>{
    const target={connect(){return target;},disconnect(){},start(){if(type==="osc")count.osc++;if(type==="noise")count.noise++;},
      stop(){setTimeout(()=>target.onended&&target.onended(),0);}};
    return new Proxy(target,{get:(t,k)=>k in t?t[k]:param(),set:(t,k,v)=>{t[k]=v;return true;}});
  };
  class FakeAudioContext{
    constructor(){this.sampleRate=44100;this.state="running";this.destination=node("dest");}
    get currentTime(){return performance.now()/1000;}
    resume(){count.resumed++;return Promise.resolve();}
    createOscillator(){return node("osc");}
    createBufferSource(){return node("noise");}
    createGain(){count.gains++;return node("gain");}
    createBiquadFilter(){return node("filter");}
    createConvolver(){return node("conv");}
    createDynamicsCompressor(){return node("comp");}
    createBuffer(c,n){return {getChannelData:()=>new Float32Array(n),length:n,duration:n/44100};}
  }
  window.touchGameplay??=matchMedia("(max-width: 760px)");
  window.AudioContext=FakeAudioContext;
  window.webkitAudioContext=FakeAudioContext;
};

(async()=>{
  const browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:900,height:900}});
  await context.addInitScript(stubScript);
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push("pageerror: "+e));
  page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  await page.goto(url);await page.waitForTimeout(500);
  const run=(label,fn,arg)=>page.evaluate(async([src,a])=>{
    try{return await (0,eval)("("+src+")")(a);}catch(e){return {__error:String(e&&e.stack||e)};}
  },[fn.toString(),arg]).then(r=>{if(r&&r.__error)fail(label+": "+r.__error);return r;});

  // ---- 2. i nomi usati esistono ----
  const names=await run("names",()=>({palette:sfxBasePalette,lib:Object.keys(sfxLib)}));
  const known=new Set([...names.palette,...names.lib]);
  const unknown=[...used.keys()].filter(n=>!known.has(n));
  if(unknown.length)fail("nomi suono inesistenti: "+unknown.map(n=>n+" ("+[...used.get(n)].join(",")+")").join("; "));
  else ok(used.size+" nomi usati nel codice, tutti definiti");
  const dynamic=await run("dynamic",()=>{
    const out=[];
    for(const s of ["grass","floor","road","path","paving","pavement",undefined,"x"])out.push(footstepSound(s));
    for(const html of ['<button id="x"></button>','<summary></summary>','<button id="homeButton"></button>','<button id="start"></button>']){
      const d=document.createElement("div");d.innerHTML=html;document.body.append(d);out.push(uiClickSound(d.firstElementChild));d.remove();
    }
    return out;
  });
  const bad=(dynamic||[]).filter(n=>!known.has(n));
  if(bad.length)fail("nomi dinamici inesistenti: "+bad); else ok("nomi dinamici (passi, pulsanti) validi");

  // ---- 3. nessun suono prima di un gesto utente ----
  await run("pre-gesture",()=>{
    selectedMode="story";resetGame();state.prologue=0;
    for(const n of Object.keys(sfxLib))sound(n,"map");
    sfxTick();
  });
  let counts=await page.evaluate(()=>({...window.__audio}));
  if(counts.osc||counts.noise||counts.gains)fail("audio creato prima del gesto utente: "+JSON.stringify(counts)); else ok("nessun suono prima del gesto utente");

  // ---- 4. accendi l'audio e suona ogni nome su ogni canale ----
  await page.click("#audio");
  await page.waitForTimeout(100);
  await run("each name",()=>{
    const before=window.__audio.osc+window.__audio.noise;
    for(const n of Object.keys(sfxLib))for(const ch of ["map","interface","games"]){sfxLast.clear();sound(n,ch);}
    for(const n of sfxBasePalette){lastEffects.clear();sound(n,"map");}
    return window.__audio.osc+window.__audio.noise-before;
  }).then(n=>{if(!(n>40))fail("troppo pochi nodi creati: "+n);else ok("tutti i nomi suonano ("+n+" nodi)");});
  await run("unknown",()=>{sound("nome-che-non-esiste","map");return true;});
  const missing=await page.evaluate(()=>sfxMissing.filter(n=>n==="nome-che-non-esiste").length);
  if(missing!==1)fail("sound() con nome sconosciuto non e' stato gestito"); else ok("nome sconosciuto: nessun errore, registrato");

  // ---- 5. mute / canali / audioOn ----
  const gated=await run("gating",()=>{
    const delta=fn=>{const b=window.__audio.osc+window.__audio.noise;fn();return window.__audio.osc+window.__audio.noise-b;};
    const r={};
    mixer.map.muted=true;sfxLast.clear();r.mutedMap=delta(()=>sound("coin","map"));mixer.map.muted=false;
    mixer.master.muted=true;sfxLast.clear();r.mutedMaster=delta(()=>sound("coin","map"));mixer.master.muted=false;
    mixer.voices.muted=true;r.mutedVoices=delta(()=>sfxBlip(sfxVoiceProfile("x","student"),0,1));mixer.voices.muted=false;
    sfxLast.clear();r.audible=delta(()=>sound("coin","map"));
    audioOn=false;sfxLast.clear();r.off=delta(()=>sound("coin","map"));audioOn=true;
    return r;
  });
  if(gated.mutedMap||gated.mutedMaster||gated.mutedVoices||gated.off||!gated.audible)fail("gating canali: "+JSON.stringify(gated)); else ok("mute, canale, master e audioOn rispettati");

  // ---- 6. ambiente per zona + voci + interazioni ----
  const zones=await run("zones",async()=>{
    const out=[];
    selectedMode="story";resetGame();state.prologue=0;state.campusGateOpen=true;
    for(const id of Object.keys(campus.zones)){
      state.zone=id;[state.x,state.y]=reachEntry(id);activeScene=null;
      sfxTick();sfxTick();renderScene();
      out.push([id,sfxZoneKind(),Boolean(sfxAmb)]);
    }
    return out;
  });
  if(!zones||zones.some(z=>!z[2]))fail("ambiente non attivo in alcune zone"); else ok("ambiente avviato in "+zones.length+" zone: "+[...new Set(zones.map(z=>z[1]))].join(", "));

  const interactions=await run("interactions",async()=>{
    let n=0,failed=[];
    const pause=ms=>new Promise(r=>setTimeout(r,ms));
    for(const [id,zone] of Object.entries(campus.zones)){
      for(const o of zone.objects){
        if(!o.action&&kindLayer(o)!=="persone")continue;
        try{
          state.ending=null;state.zone=id;minigame&&closeChallenge();$("campusSurprise").open&&$("campusSurprise").close();
          activeScene=null;state.prologue=0;state.campusGateOpen=true;
          [state.x,state.y]=freeTile(id,o.x,o.y+1);
          interact();n++;
          await pause(15);
          for(const b of [...document.querySelectorAll("#choices button")].slice(0,2)){b.click();n++;}
          if(minigame)closeChallenge();
          if(activeScene)closeScene();
        }catch(e){failed.push(id+"/"+o.uid+": "+e);}
      }
    }
    return {n,failed:failed.slice(0,5)};
  });
  if(interactions?.failed?.length)fail("interazioni con errori: "+interactions.failed.join(" | ")); else ok((interactions?.n||0)+" interazioni, nessun errore");

  const voices=await run("voices",async()=>{
    state.ending=null;state.zone="giardino";state.prologue=0;
    const person=room("giardino").objects.find(o=>kindLayer(o)==="persone"&&!isVehicle(o)&&o.action)
      ||Object.values(campus.zones).flatMap(z=>z.objects).find(o=>kindLayer(o)==="persone"&&!isVehicle(o));
    const zone=Object.entries(campus.zones).find(([,z])=>z.objects.includes(person))[0];
    state.zone=zone;[state.x,state.y]=freeTile(zone,person.x,person.y+1);activeScene=null;
    const b=window.__audio.osc;interact();
    await new Promise(r=>setTimeout(r,900));
    return {uid:person.uid,blips:window.__audio.osc-b,profiles:["a","b","c","prof-storia","tutor-viola"].map(u=>JSON.stringify(sfxVoiceProfile(u,"student")))};
  });
  if(!voices||voices.blips<3)fail("voce NPC: blip insufficienti "+JSON.stringify(voices)); else ok("voce NPC "+voices.uid+": "+voices.blips+" blip, profili distinti: "+new Set(voices.profiles).size);

  // ---- 7. finali, tornello, Villa Ada, minigiochi, sorprese, salvataggio ----
  await run("endings",async()=>{
    const pause=ms=>new Promise(r=>setTimeout(r,ms));
    selectedMode="story";resetGame();state.prologue=0;state.zone="giardino";[state.x,state.y]=reachEntry("giardino");activeScene=null;renderScene();
    const play=async(label,fn,wait=30)=>{sfxLast.clear();const b=window.__audio.osc+window.__audio.noise;fn();renderScene();await pause(wait);
      if(window.__audio.osc+window.__audio.noise<=b)throw new Error("nessun suono per "+label+" "+JSON.stringify({w:state.guardWarned,via:has("Via libera"),free:isFree(),act:sfxActive,ch:sfxChannelOn("map"),gate:state.gateConfrontation}));};
    await play("warn1",()=>{state.pockets=state.pockets.filter(i=>i!=="Via libera");state.guardWarned=false;state.campusGateOpen=false;warnAtGate();});
    await play("warn2",()=>{state.gateConfrontation=2;});
    state.gateConfrontation=0;
    await play("game over tornello",()=>{state.ending={guard:true,armed:true,title:"Game Over · Tornello",text:"x"};});
    state.ending=null;renderScene();
    await play("game over traffico",()=>{state.ending={traffic:true,title:"Game Over",text:"x"};});
    state.ending=null;renderScene();
    await play("game over cinghiale",()=>{state.ending={boar:true,title:"Game Over · Villa Ada",text:"x"};});
    state.ending=null;renderScene();
    await play("pickup",()=>{state.pockets.push("Oggetto di prova");sfxQuietUntil=0;},200);
    await play("mele",()=>{state.mele=(state.mele||0)+2;});
    await play("tiro mela",()=>{state.mele--;});
    return true;
  });
  await run("villa",async()=>{
    const pause=ms=>new Promise(r=>setTimeout(r,ms));
    state.ending=null;villaBoars.length=0;villaHerdSpawned=false;state.zone="villa-ada";
    [state.x,state.y]=reachEntry("villa-ada","ada-entry");activeScene=null;renderScene();
    await pause(300);
    const modes=new Set();
    const b=villaBoars[0];
    if(!b)throw new Error("nessun cinghiale");
    for(const m of ["alert","charge","eat","graze"]){
      sfxLast.clear();const before=window.__audio.osc+window.__audio.noise;
      b.mode=m==="graze"?"charge":b.mode;
      tickVillaAda(performance.now());
      b.mode=m;
      sfxLib.boarGrunt();sfxSound("boarGrunt","map",{gap:0});
      if(window.__audio.osc+window.__audio.noise>before)modes.add(m);
    }
    for(let i=0;i<20;i++){sfxTick();}
    state.zone="giardino";[state.x,state.y]=reachEntry("giardino");
    return true;
  });
  await run("minigames",async()=>{
    const pause=ms=>new Promise(r=>setTimeout(r,ms));
    state.ending=null;state.zone="giardino";activeScene=null;
    for(const id of Object.keys(challengeNames)){
      for(const result of ["win","loss","tie"]){
        const practice=result==="tie"||!prizes[id];openChallenge(id,practice);await pause(10);
        if(minigame){endChallenge(minigame,result);await pause(5);closeChallenge();}
      }
    }
    return true;
  });
  await run("surprise+save+esc",async()=>{
    state.zone="giardino";state.x=13;state.y=39;activeScene=null;state.secrets=[];state.pockets=state.pockets.filter(i=>i!=="Fantasma del fuoricorso");
    checkCampusSurprise();if($("campusSurprise").open)$("campusSurprise").close();
    $("homeButton").click();$("start").click();
    window.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}));
    document.querySelector("details summary")?.click();
    return true;
  });
  await run("audio off",async()=>{$("audio").click();await new Promise(r=>setTimeout(r,500));return sfxAmb;}).then(a=>{
    if(a!==null)fail("ambiente ancora attivo con audio spento"); else ok("ambiente fermato con audio spento");
  });
  await page.waitForTimeout(300);

  // ---- 8. senza AudioContext ----
  const bare=await browser.newContext({viewport:{width:900,height:900}});
  await bare.addInitScript(()=>{delete window.AudioContext;delete window.webkitAudioContext;});
  const p2=await bare.newPage();
  p2.on("pageerror",e=>errors.push("no-audio pageerror: "+e));
  p2.on("console",m=>{if(m.type()==="error")errors.push("no-audio: "+m.text());});
  await p2.goto(url);await p2.waitForTimeout(400);
  const bareResult=await p2.evaluate(async()=>{
    try{
      $("audio").click();
      selectedMode="story";resetGame();state.prologue=0;
      for(const n of Object.keys(sfxLib))sound(n,"map");
      sfxTick();renderScene();
      const o=room(state.zone).objects.find(o=>kindLayer(o)==="persone");
      if(o){[state.x,state.y]=freeTile(state.zone,o.x,o.y+1);interact();}
      await new Promise(r=>setTimeout(r,700));
      return "ok";
    }catch(e){return String(e);}
  });
  if(bareResult!=="ok")fail("senza AudioContext: "+bareResult); else ok("senza AudioContext nessun errore");

  if(errors.length)fail("errori di pagina/console: "+errors.slice(0,6).join(" | ")); else ok("nessun errore in pagina o console");
  await browser.close();
  if(problems.length){console.log("\n"+problems.length+" problemi");process.exit(1);}
  console.log("\ntutto ok");
})();
