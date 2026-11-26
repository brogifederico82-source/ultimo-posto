// Interfaccia a schermo intero: layout della scena, riquadro di dialogo, menu di pausa e pannelli.
// Ganci negli altri file: schermoRender() (fine di renderScene), schermoCaptionDone() (fine della macchina da scrivere),
// schermoFocus() (focusScene), schermoPausato() (exploringCampus, villa-ada), schermoMinimapTop (minimappa sulla scena).
var schermoMinimapTop=5;
var gsModal=null; // "menu" | id del pannello | null
let gsRestore=null, gsOptionsHome=null, gsNoteTimer=0;

function gsEl(id){return document.getElementById(id);}
function gsLocal(it,en){return typeof local==="function"?local(it,en):it;}

// ---------- layout: la scena riempie la finestra, scala intera quando possibile ----------
function gsLayout(){
  const g=gsEl("game"),view=gsEl("gsView");
  if(!g||!view||g.hidden)return;
  const cs=getComputedStyle(view);
  const pad=side=>parseFloat(cs.getPropertyValue("padding-"+side))||0;
  const pl=pad("left"),pr=pad("right"),pt=pad("top"),pb=pad("bottom");
  const aw=Math.max(200,view.clientWidth-pl-pr),ah=Math.max(160,view.clientHeight-pt-pb);
  const portrait=aw<ah*.85;
  let scale=Math.min(aw/640,ah/384),bar=0;
  if(portrait){
    bar=Math.round(Math.max(52,Math.min(76,aw*.12)));
    scale=Math.min(aw/640,(ah-bar)/384);
  }
  const whole=Math.floor(scale);
  if(whole>=1&&whole/scale>=.84)scale=whole;
  const fw=Math.round(640*scale),fh=Math.round(384*scale);
  const fx=Math.round(pl+(aw-fw)/2);
  const fy=portrait?Math.round(pt+bar):Math.round(pt+(ah-fh)/2);
  let u=portrait?Math.max(15,Math.min(22,aw/24)):Math.max(15,Math.min(Math.min(fw/48,fh/24),Math.max(28,fh/40)));
  u=Math.round(u*2)/2;
  const set=(name,value)=>g.style.setProperty(name,typeof value==="number"?Math.round(value)+"px":value);
  set("--fx",fx);set("--fy",fy);set("--fw",fw);set("--fh",fh);set("--u",u);
  // rettangolo dell'interfaccia: la scena in orizzontale, tutta la finestra in verticale
  set("--ux",portrait?pl:fx);set("--uw",portrait?aw:fw);
  set("--uy",portrait?pt:fy);set("--uh",portrait?ah:fh);
  set("--bar",bar);
  g.classList.toggle("gs-portrait",portrait);
  const canvas=gsEl("stage");
  const density=Math.max(2,Math.min(6,Math.ceil(fw*(window.devicePixelRatio||1)/320)));
  if(canvas.width!==320*density){canvas.width=320*density;canvas.height=192*density;}
  schermoMinimapSync();
}
function schermoMinimapSync(){
  const top=gsEl("gsHud")?.querySelector(".gs-top"),box=gsEl("gsStagebox"),g=gsEl("game");
  if(!top||!box||g.hidden||typeof room!=="function")return;
  const fh=box.getBoundingClientRect().height;
  if(!fh)return;
  let logical=5;
  if(!g.classList.contains("gs-portrait")){
    const gap=top.getBoundingClientRect().bottom-box.getBoundingClientRect().top+4;
    logical=Math.max(5,Math.min(60,Math.ceil(gap/(fh/192))));
  }
  if(logical!==schermoMinimapTop){
    schermoMinimapTop=logical;
    try{minimapCache=new WeakMap();}catch{}
  }
}
addEventListener("resize",gsLayout);
addEventListener("orientationchange",()=>setTimeout(gsLayout,120));
window.visualViewport?.addEventListener("resize",gsLayout);
document.addEventListener("fullscreenchange",()=>{gsLayout();gsSyncMenuLabels();});
document.addEventListener("webkitfullscreenchange",()=>{gsLayout();gsSyncMenuLabels();});
addEventListener("pointerdown",event=>{if(event.pointerType==="touch")gsEl("game")?.classList.add("gs-touch-on");},{passive:true});
if(matchMedia?.("(pointer:coarse)").matches)gsEl("game")?.classList.add("gs-touch-on");

// ---------- schermata attiva ----------
new MutationObserver(()=>{
  const g=gsEl("game");
  document.body.classList.toggle("gs-on",!g.hidden);
  if(g.hidden){gsCloseAll(false);}
  else{requestAnimationFrame(()=>{gsLayout();schermoRender();});gsLayout();}
}).observe(gsEl("game"),{attributes:true,attributeFilter:["hidden"]});
document.body.classList.toggle("gs-on",!gsEl("game").hidden);

// ---------- riquadro di dialogo ----------
function gsTyping(){return !gsEl("skipCaption").hidden;}
function schermoRender(){
  const g=gsEl("game"),dlg=gsEl("gsDialog");
  if(!g||!dlg||typeof state==="undefined"||!state)return;
  const choices=gsEl("choices");
  const on=g.classList.contains("game-reading")||choices.children.length>0;
  dlg.hidden=!on;
  dlg.classList.toggle("has-portrait",!gsEl("speakerPortrait").hidden);
  const over=Boolean(state.ending&&(state.ending.guard||state.ending.traffic||state.ending.boar));
  g.classList.toggle("gs-over",over);
  const cut=gsEl("gsCut");
  g.classList.toggle("gs-cut-on",Boolean(cut&&[...cut.children].some(el=>!el.hidden)));
  gsEl("gsMenuLabel").textContent=gsLocal("Menu","Menu");
  gsTypingState();
  schermoMinimapSync();
}
function gsTypingState(){
  const dlg=gsEl("gsDialog");
  const typing=gsTyping();
  dlg.classList.toggle("gs-typing",typing);
  dlg.classList.toggle("gs-ready",!typing&&!dlg.hidden&&!gsEl("choices").children.length);
}
function schermoCaptionDone(){
  gsTypingState();
  if(!gsModal&&!gsEl("gsDialog").hidden&&gsEl("choices").children.length){
    const ae=document.activeElement;
    if(!ae||ae===document.body||ae.id==="sceneTitle"||ae.id==="skipCaption")gsEl("choices").querySelector("button")?.focus({preventScroll:true});
  }
}
// Con le scelte a schermo, il cursore e sempre su una voce.
function schermoFocus(){
  const dlg=gsEl("gsDialog");
  if(!dlg||dlg.hidden||gsModal||gsTyping())return false;
  const first=gsEl("choices").querySelector("button");
  if(!first)return false;
  first.focus({preventScroll:true});
  return true;
}
gsEl("choices").addEventListener("pointermove",event=>{
  const button=event.target.closest?.("button");
  if(button&&button!==document.activeElement&&event.pointerType!=="touch")button.focus({preventScroll:true});
});
// Un tocco sul riquadro completa il testo; a testo completo, senza scelte, prosegue.
gsEl("gsDialog").addEventListener("click",event=>{
  if(event.target.closest("button,a,input"))return;
  if(finishCaption()){schermoFocus();return;}
  if(!gsEl("choices").children.length&&!gsEl("closeConversation").hidden)gsEl("closeConversation").click();
});

// ---------- menu di pausa e pannelli ----------
function schermoPausato(){
  if(gsModal)return true;
  const outer=document.querySelector(".gp:not(.gs-owned)");
  if(!outer)return false;
  const style=getComputedStyle(outer);
  return !outer.hidden&&style.display!=="none"&&style.visibility!=="hidden";
}
function gsNote(text){
  const note=gsEl("gsMenuNote");
  note.textContent=text;
  clearTimeout(gsNoteTimer);
  if(text)gsNoteTimer=setTimeout(()=>{note.textContent="";},4000);
}
function gsFsSupported(){return Boolean(document.fullscreenEnabled||document.webkitFullscreenEnabled);}
function gsFsActive(){return Boolean(document.fullscreenElement||document.webkitFullscreenElement);}
function schermoSchermoIntero(){
  try{
    if(gsFsActive()){
      const exit=document.exitFullscreen||document.webkitExitFullscreen;
      Promise.resolve(exit?.call(document)).catch(()=>{});
      return true;
    }
    const root=document.documentElement;
    const enter=root.requestFullscreen||root.webkitRequestFullscreen;
    if(!gsFsSupported()||!enter){
      gsNote(gsLocal("Questo browser non offre lo schermo intero. Su iPhone: Condividi, poi Aggiungi alla schermata Home.",
        "This browser has no full screen. On iPhone: Share, then Add to Home Screen."));
      return false;
    }
    Promise.resolve(enter.call(root,{navigationUI:"hide"})).catch(()=>
      gsNote(gsLocal("Schermo intero non disponibile in questo momento.","Full screen is not available right now.")));
    return true;
  }catch{
    gsNote(gsLocal("Schermo intero non disponibile in questo momento.","Full screen is not available right now."));
    return false;
  }
}
function gsMenuItems(){
  const has=name=>typeof globalThis[name]==="function";
  const items=[];
  items.push({id:"zaino",label:gsLocal("Zaino","Backpack"),run:()=>has("zainoApri")?(gsCloseAll(false),zainoApri()):gsOpenPanel("gsPanelTasche")});
  items.push({id:"diario",label:gsLocal("Diario","Journal"),run:()=>gsOpenPanel("gsPanelDiario")});
  if(has("archivioApri"))items.push({id:"archivio",label:gsLocal("Archivio","Archive"),run:()=>{gsCloseAll(false);archivioApri();}});
  if(has("segretiApri"))items.push({id:"segreti",label:gsLocal("Segreti","Secrets"),run:()=>{gsCloseAll(false);segretiApri();}});
  items.push({id:"mappa",label:gsLocal("Mappa","Map"),run:()=>gsOpenPanel("gsPanelMappa")});
  items.push({id:"opzioni",label:gsLocal("Opzioni","Options"),run:()=>gsOpenPanel("gsPanelOpzioni")});
  items.push({id:"salva",label:gsLocal("Salva","Save"),run:()=>{
    if(testMode){gsNote(gsLocal("In prova non si salva.","Nothing is saved in test mode."));return;}
    gsNote(save()?gsLocal("Partita salvata.","Game saved."):gsLocal("Salvataggio non riuscito: memoria del browser non disponibile.","Save failed: browser storage is unavailable."));
    if(typeof sound==="function")sound("save","interface");
  }});
  items.push({id:"schermo",label:gsFsActive()?gsLocal("Esci da schermo intero","Exit full screen"):gsLocal("Schermo intero","Full screen"),run:()=>{schermoSchermoIntero();}});
  items.push({id:"audio",label:gsLocal("Audio: ","Audio: ")+gsLocal(audioOn?"acceso":"spento",audioOn?"on":"off"),run:()=>{gsEl("audio").click();gsBuildMenu("audio");}});
  if(testMode)items.push({id:"editor",label:gsLocal("Torna all’editor","Back to editor"),run:()=>{gsCloseAll(false);gsEl("testBack").click();}});
  else items.push({id:"home",label:gsLocal("Torna al menu","Back to menu"),run:()=>{gsCloseAll(false);gsEl("homeButton").click();}});
  return items;
}
function gsBuildMenu(focusId){
  const list=gsEl("gsMenuList");
  list.replaceChildren();
  gsEl("gsMenuTitle").textContent=gsLocal("Menu","Menu");
  for(const item of gsMenuItems()){
    const li=document.createElement("li"),button=document.createElement("button");
    li.setAttribute("role","none");
    button.type="button";button.setAttribute("role","menuitem");button.dataset.id=item.id;
    button.textContent=item.label;
    button.onclick=()=>item.run();
    li.append(button);list.append(li);
  }
  list.querySelector(`[data-id="${focusId}"]`)?.focus({preventScroll:true});
}
function gsSyncMenuLabels(){
  if(gsModal!=="menu")return;
  const fs=gsEl("gsMenuList").querySelector('[data-id="schermo"]');
  if(fs)fs.textContent=gsFsActive()?gsLocal("Esci da schermo intero","Exit full screen"):gsLocal("Schermo intero","Full screen");
}
function gsInert(on){
  const hud=gsEl("gsHud"),stage=gsEl("gsStagebox");
  for(const el of [hud,stage])if(el)el.inert=on;
}
function schermoMenuApri(){
  if(gsModal||screen!=="game"||minigame||gsEl("campusSurprise").open||schermoPausato())return false;
  if(typeof clearCampusInputs==="function")clearCampusInputs();
  gsRestore=document.activeElement instanceof HTMLElement?document.activeElement:null;
  gsModal="menu";
  gsNote("");
  gsInert(true);
  gsEl("gsMenu").hidden=false;
  gsBuildMenu("zaino");
  gsEl("game").classList.add("gs-modal");
  if(typeof sound==="function")sound("menu","interface");
  return true;
}
function gsCloseAll(refocus=true){
  const wasOpen=gsModal;
  gsEl("gsMenu").hidden=true;
  for(const panel of document.querySelectorAll(".gs-panel"))panel.hidden=true;
  gsOptionsRestore();
  gsInert(false);
  gsModal=null;
  gsEl("game").classList.remove("gs-modal");
  if(wasOpen&&typeof sound==="function")sound("menuClose","interface");
  if(refocus&&wasOpen&&screen==="game"){
    const target=gsRestore&&gsRestore.isConnected&&gsRestore.offsetParent!==null?gsRestore:null;
    if(target)target.focus({preventScroll:true});
    else if(typeof focusScene==="function")focusScene();
  }
  gsRestore=null;
}
function schermoMenuChiudi(){gsCloseAll(true);}
function gsOpenPanel(id){
  const panel=gsEl(id);
  gsEl("gsMenu").hidden=true;
  gsModal=id;
  if(id==="gsPanelMappa"){
    gsEl("campusOverviewPanel").open=true;
    if(typeof updateCampusOverview==="function"&&state)updateCampusOverview();
  }
  if(id==="gsPanelDiario"){
    for(const d of panel.querySelectorAll(":scope > .gs-panelbox > .gs-panelbody > details"))d.open=true;
  }
  if(id==="gsPanelOpzioni")gsOptionsAttach();
  if(id==="gsPanelTasche")gsEl("inventory").open=true;
  panel.hidden=false;
  panel.querySelector(".gs-panelbody")?.scrollTo?.(0,0);
  panel.querySelector(".gs-back")?.focus({preventScroll:true});
}
function gsBackToMenu(){
  const id=gsModal;
  gsOptionsRestore();
  for(const panel of document.querySelectorAll(".gs-panel"))panel.hidden=true;
  gsModal="menu";
  gsEl("gsMenu").hidden=false;
  gsBuildMenu({gsPanelTasche:"zaino",gsPanelDiario:"diario",gsPanelMappa:"mappa",gsPanelOpzioni:"opzioni"}[id]||"zaino");
  if(typeof sound==="function")sound("back","interface");
}
for(const back of document.querySelectorAll(".gs-back"))back.onclick=gsBackToMenu;
gsEl("gsMenuBtn").onclick=()=>{if(gsModal)gsCloseAll(true);else schermoMenuApri();};
gsEl("gsMenu").addEventListener("click",event=>{if(event.target===gsEl("gsMenu"))gsCloseAll(true);});

// Le Opzioni riusano i nodi esistenti (mixer, colori vivaci, sorprese...): si spostano nel pannello e tornano al loro posto.
function gsOptionsNode(){
  return document.querySelector(".campus-options")||gsEl("campusMixer")?.parentElement||null;
}
function gsOptionsAttach(){
  const node=gsOptionsNode();
  gsSyncLang();
  if(!node||gsEl("gsOptionsBody").contains(node))return;
  gsOptionsHome={parent:node.parentNode,next:node.nextSibling};
  if(node instanceof HTMLDetailsElement)node.open=true;
  gsEl("gsOptionsBody").prepend(node);
  if(typeof renderMixers==="function")renderMixers();
}
function gsOptionsRestore(){
  const node=gsOptionsNode();
  if(!node||!gsOptionsHome||!gsEl("gsOptionsBody").contains(node))return;
  const {parent,next}=gsOptionsHome;
  if(parent&&parent.isConnected)parent.insertBefore(node,next&&next.parentNode===parent?next:null);
  gsOptionsHome=null;
}
function gsSyncLang(){
  gsEl("gsLangLabel").textContent=gsLocal("Lingua","Language");
  gsEl("gsLangIt").setAttribute("aria-pressed",String(locale==="it"));
  gsEl("gsLangEn").setAttribute("aria-pressed",String(locale==="en"));
  for(const [id,it,en] of [["gsTitleTasche","Tasche","Pockets"],["gsTitleDiario","Diario","Journal"],["gsTitleMappa","Mappa","Map"],["gsTitleOpzioni","Opzioni","Options"]])gsEl(id).textContent=gsLocal(it,en);
  for(const back of document.querySelectorAll(".gs-back"))back.textContent=gsLocal("Indietro","Back");
}
for(const [id,value] of [["gsLangIt","it"],["gsLangEn","en"]]){
  gsEl(id).onclick=()=>{chooseLanguage(value);gsSyncLang();if(state)renderScene();};
}

// ---------- tastiera ----------
addEventListener("keydown",event=>{
  if(typeof screen==="undefined"||screen!=="game"||event.ctrlKey||event.altKey||event.metaKey)return;
  const key=event.key.toLowerCase();
  if(typeof resumeEffects==="function")resumeEffects();
  if(gsModal){
    if(key==="escape"||(key==="backspace"&&gsModal!=="menu"&&!event.target.closest?.("input,textarea"))){
      event.preventDefault();event.stopPropagation();
      if(gsModal==="menu")gsCloseAll(true);else gsBackToMenu();
      return;
    }
    if(key==="tab"){
      const scope=gsModal==="menu"?gsEl("gsMenu"):gsEl(gsModal);
      const nodes=[...scope.querySelectorAll("button,summary,input,select,a[href]")].filter(el=>!el.disabled&&el.offsetParent!==null);
      if(nodes.length){
        const at=nodes.indexOf(document.activeElement);
        const next=event.shiftKey?(at<=0?nodes.length-1:at-1):(at<0||at===nodes.length-1?0:at+1);
        event.preventDefault();nodes[next].focus();
      }
      event.stopPropagation();return;
    }
    if(gsModal==="menu"){
      const buttons=[...gsEl("gsMenuList").querySelectorAll("button")];
      const at=buttons.indexOf(document.activeElement);
      const move=["arrowdown","s"].includes(key)?1:["arrowup","w"].includes(key)?-1:0;
      if(move||key==="home"||key==="end"){
        event.preventDefault();
        buttons[key==="home"?0:key==="end"?buttons.length-1:(at+move+buttons.length)%buttons.length]?.focus();
      }else if(key==="e"&&!event.repeat&&at>=0){event.preventDefault();buttons[at].click();}
    }
    event.stopPropagation();
    return;
  }
  if(minigame||gsEl("campusSurprise").open||schermoPausato())return;
  const field=event.target instanceof Element&&event.target.closest("input,select,textarea");
  if(field)return;
  if(key==="escape"&&!activeScene){event.preventDefault();event.stopPropagation();schermoMenuApri();return;}
  if(key==="enter"&&!activeScene&&!event.repeat&&exploringCampus()){
    const tag=document.activeElement?.tagName;
    if(!["BUTTON","A","SUMMARY"].includes(tag)){event.preventDefault();schermoMenuApri();return;}
  }
},true);
addEventListener("keydown",event=>{
  if(typeof screen==="undefined"||screen!=="game"||gsModal||minigame||event.ctrlKey||event.altKey||event.metaKey)return;
  const dlg=gsEl("gsDialog");
  if(dlg.hidden)return;
  const key=event.key.toLowerCase();
  const field=event.target instanceof Element&&event.target.closest("input,select,textarea");
  if(field)return;
  const buttons=[...gsEl("choices").querySelectorAll("button")];
  const active=document.activeElement;
  if(gsTyping()){
    if((key==="enter"||key===" ")&&!event.repeat&&!event.defaultPrevented){
      event.preventDefault();finishCaption();schermoFocus();
    }
    return;
  }
  if(event.defaultPrevented)return;
  if(buttons.length&&["w","s","home","end"].includes(key)){
    event.preventDefault();
    const at=buttons.indexOf(active);
    const next=key==="home"?0:key==="end"?buttons.length-1:at<0?(key==="w"?buttons.length-1:0):(at+(key==="w"?-1:1)+buttons.length)%buttons.length;
    buttons[next].focus({preventScroll:true});
    return;
  }
  if(key==="e"&&!event.repeat&&buttons.length&&buttons.includes(active)){event.preventDefault();active.click();return;}
  if((key==="e"||key==="enter"||key===" ")&&!event.repeat&&!buttons.length&&!gsEl("closeConversation").hidden&&!["BUTTON","A","SUMMARY"].includes(active?.tagName)){
    event.preventDefault();gsEl("closeConversation").click();
  }
  if(buttons.length&&!buttons.includes(active)&&["enter"," "].includes(key)&&!["BUTTON","A","SUMMARY"].includes(active?.tagName)){
    event.preventDefault();buttons[0].focus({preventScroll:true});
  }
});

// ---------- gamepad (frecce, A = conferma, B = indietro, Start = menu) ----------
let gsPadFrame=0;const gsPadHeld=new Map();
function gsPadKey(type,key){dispatchEvent(new KeyboardEvent(type,{key,bubbles:true,cancelable:true}));}
function gsPadTick(now){
  const pad=[...(navigator.getGamepads?.()||[])].find(Boolean);
  if(!pad){gsPadFrame=0;return;}
  const axis=(i)=>pad.axes[i]||0;
  const down=i=>Boolean(pad.buttons[i]?.pressed);
  const map=[
    ["ArrowUp",down(12)||axis(1)<-.55],["ArrowDown",down(13)||axis(1)>.55],
    ["ArrowLeft",down(14)||axis(0)<-.55],["ArrowRight",down(15)||axis(0)>.55],
    ["a",down(0)],["b",down(1)||down(8)],["start",down(9)]
  ];
  for(const [name,pressed] of map){
    const held=gsPadHeld.get(name);
    if(pressed&&!held){
      gsPadHeld.set(name,{at:now,rep:now+380});
      gsPadPress(name,true,false);
    }else if(pressed&&held&&gsModal||pressed&&held&&!gsEl("gsDialog").hidden){
      if(now>=held.rep&&name.startsWith("Arrow")){held.rep=now+150;gsPadPress(name,true,true);}
    }else if(!pressed&&held){
      gsPadHeld.delete(name);
      gsPadPress(name,false,false);
    }
  }
  gsPadFrame=requestAnimationFrame(gsPadTick);
}
function gsPadPress(name,isDown,repeat){
  const nav=Boolean(gsModal)||!gsEl("gsDialog").hidden;
  if(name.startsWith("Arrow")){
    if(nav&&!isDown)return;
    if(nav&&repeat)gsPadKey("keydown",name);
    else gsPadKey(isDown?"keydown":"keyup",name);
    if(nav&&isDown&&!repeat)gsPadKey("keyup",name);
    return;
  }
  if(!isDown)return;
  if(name==="a"){
    const ae=document.activeElement;
    if(ae instanceof HTMLButtonElement&&(gsModal||!gsEl("gsDialog").hidden))ae.click();
    else{gsPadKey("keydown","e");gsPadKey("keyup","e");}
  }else if(name==="b"){gsPadKey("keydown","Escape");gsPadKey("keyup","Escape");}
  else if(name==="start"){if(gsModal)gsCloseAll(true);else schermoMenuApri();}
}
addEventListener("gamepadconnected",()=>{if(!gsPadFrame)gsPadFrame=requestAnimationFrame(gsPadTick);});
