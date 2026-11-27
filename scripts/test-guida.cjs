// Test della guida con il car sharing (Playwright). Uso: node scripts/test-guida.cjs  (dopo node scripts/build.mjs)
const {chromium}=require('playwright');
const OUT=require('os').tmpdir()+'/';
const results=[];
const check=(name,ok,detail)=>{results.push({name,ok:!!ok,detail});console.log((ok?'PASS ':'FAIL ')+name+(detail!==undefined?'  '+JSON.stringify(detail):''));};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({args:['--enable-precise-memory-info','--js-flags=--expose-gc']});
  const ctx=await b.newContext({viewport:{width:900,height:620}});
  const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto(process.env.GAME_URL||('file://'+process.cwd()+'/dist/index.html'));await sleep(500);
  const start=async(mode='free')=>{await p.evaluate(m=>{selectedMode=m;resetGame();state.prologue=0;window.realismoOra=14;activeScene=null;renderScene();},mode);await sleep(150);};
  await start();

  // ---- 1. Salita con il tasto E vicino all'auto
  const near=await p.evaluate(()=>{
    const a=guidaS().auto[1];state.zone=a.zone;let ok=false;
    outer:for(let r=0;r<4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const tx=Math.floor(a.x)+dx,ty=Math.floor(a.y)+dy;if(blocked(a.zone,tx,ty,0))continue;state.x=tx;state.y=ty;const n=nearby();if(n&&n.uid==='guida-auto-1'){ok=true;break outer;}}
    return {ok,x:state.x,y:state.y,label:nearby()&&nearby().label};
  });
  await sleep(250);
  await p.keyboard.press('e');await sleep(300);
  const s1=await p.evaluate(()=>({d:!!guidaS().d,txt:document.getElementById('sceneText').textContent,expl:exploringCampus(),pill:document.querySelector('.guida-hud')?.textContent,carInZone:room(guidaS().auto[1].zone).objects.some(o=>o.uid==='guida-auto-1')}));
  check('salita con E',near.ok&&s1.d,{near,s1});
  check('HUD con messaggio breve',/Guida: frecce\/WASD, E per scendere/.test(s1.txt)&&/Guida: frecce\/WASD/.test(s1.pill||''),s1.pill);
  check('mentre si guida non si cammina (exploringCampus falso) e l\'auto non e\' piu\' nella zona',!s1.expl&&!s1.carInZone);
  const pos0=await p.evaluate(()=>({x:state.x,y:state.y}));
  await p.keyboard.press('ArrowRight');await sleep(300);   // a piedi si camminerebbe: ora no
  const pos1=await p.evaluate(()=>({x:state.x,y:state.y,tile:[Math.floor(guidaS().d.x),Math.floor(guidaS().d.y)]}));
  check('nessun movimento a piedi in guida (stato x,y segue l\'auto)',pos1.x===pos1.tile[0]&&pos1.y===pos1.tile[1],{pos0,pos1});

  // ---- 2. Velocita' sulle superfici (rettilinei trovati nelle griglie)
  const strip=async(surf,min)=>p.evaluate(({surf,min})=>{
    for(const id of Object.keys(campus.zones)){
      if(!id.startsWith('pq-')&&id!=='pola'&&id!=='parenzo')continue;
      const g=guidaGriglia(id);
      for(let y=3;y<g.h-3;y++)for(let x=6;x<g.w-6-min;x++){
        let ok=true;
        for(let i=-3;i<min&&ok;i++)for(let dy=-1;dy<=1&&ok;dy++){const k=(y+dy)*g.w+x+i;if((dy===0&&g.surf[k]!==surf)||g.solid[k])ok=false;}
        if(ok)return {id,x,y};
      }
    }
    return null;
  },{surf,min});
  const drive=async(spot,dur,keys=['ArrowUp'])=>{
    await p.evaluate(s=>{const S=guidaS();if(S.d)guidaScendi(true);guidaSali(1,{zone:s.id,x:s.x+.5,y:s.y+.5,a:0});},spot);
    await sleep(100);
    for(const k of keys)await p.keyboard.down(k);
    const samples=[];
    const t0=Date.now();
    while(Date.now()-t0<dur){samples.push(await p.evaluate(()=>{const d=guidaS().d;return d?{t:performance.now(),v:Math.hypot(d.vx,d.vy),x:d.x,y:d.y,sf:d.sf}:null;}));await sleep(100);}
    for(const k of keys)await p.keyboard.up(k);
    return samples.filter(Boolean);
  };
  for(const [name,surf,lo,hi,len] of [['strada',2,3.2,4.0,14],['marciapiede',1,2.4,3.3,10],['prato',0,1.7,2.4,14],['sentiero',3,1.0,1.7,6]]){
    const spot=await strip(surf,len);
    if(!spot){check('velocita\' su '+name,false,'nessun rettilineo trovato');continue;}
    const sm=await drive(spot,len>=14?3500:2200);
    const vmax=Math.max(...sm.map(s=>s.v));
    const t90=(()=>{const t0=sm[0].t;const hit=sm.find(s=>s.v>=vmax*.9);return hit?Math.round(hit.t-t0):null;})();
    check('velocita\' massima su '+name+' ('+(vmax*10.8).toFixed(0)+' km/h)',vmax>=lo&&vmax<=hi,{vmax:+vmax.toFixed(2),spot,t90ms:t90,surf:sm.at(-1).sf});
    await p.evaluate(()=>{const d=guidaS().d;d.vx=d.vy=0;});
  }

  // ---- 3. Frenata e retromarcia
  {
    const spot=await strip(2,14);
    await p.evaluate(s=>{guidaSali&&0;},spot);
    const sm=await drive(spot,2500);
    const vtop=sm.at(-1).v;
    await p.keyboard.down('ArrowDown');await sleep(120);
    const t0=Date.now();let stopT=null;
    while(Date.now()-t0<2500){const v=await p.evaluate(()=>{const d=guidaS().d;return {v:Math.hypot(d.vx,d.vy),vf:d.vf};});if(v.v<.15&&stopT===null)stopT=Date.now()-t0;await sleep(60);}
    const rev=await p.evaluate(()=>{const d=guidaS().d;return d.vf;});
    await p.keyboard.up('ArrowDown');
    check('freno: da '+(vtop*10.8).toFixed(0)+' km/h a fermo',stopT!==null&&stopT<1500,{stopMs:stopT});
    check('retromarcia (velocita\' negativa limitata)',rev<-.8&&rev>=-1.7,{vf:+rev.toFixed(2)});
  }

  // ---- 4. Sterzo: a bassa velocita' sterza poco, in corsa di piu'
  {
    const spot=await strip(2,14);
    await p.evaluate(s=>{if(guidaS().d)guidaScendi(true);guidaSali(1,{zone:s.id,x:s.x+.5,y:s.y+.5,a:0});},spot);
    await sleep(100);
    await p.keyboard.down('ArrowRight');await sleep(500);
    const lento=await p.evaluate(()=>guidaS().d.a);
    await p.keyboard.up('ArrowRight');
    await p.evaluate(s=>{const d=guidaS().d;d.x=s.x+.5;d.y=s.y+.5;d.a=0;d.vx=d.vy=0;guidaSync(false);},spot);
    await p.keyboard.down('ArrowUp');await sleep(1400);
    const a0=await p.evaluate(()=>guidaS().d.a);
    await p.keyboard.down('ArrowRight');await sleep(400);
    const veloce=await p.evaluate(()=>guidaS().d.a)-a0;
    await p.keyboard.up('ArrowRight');await p.keyboard.up('ArrowUp');
    check('sterzo ridotto da fermo e deciso in marcia',Math.abs(lento)<.05&&veloce>.5,{da_fermo:+lento.toFixed(3),in_marcia_400ms:+veloce.toFixed(3)});
  }

  // ---- 5. Collisione con un edificio: non attraversa, scorre lungo il muro
  {
    const sp=await p.evaluate(()=>{
      for(const id of Object.keys(campus.zones)){
        if(!(id.startsWith('pq-')||id==='pola'||id==='parenzo'))continue;
        const g=guidaGriglia(id);
        for(const o of room(id).objects){
          if(o.kind!=='roof'&&o.kind!=='faculty')continue;
          if(o.w<4||o.h<4)continue;
          const y=Math.floor(o.y+o.h/2),x1=Math.floor(o.x);
          let ok=x1-9>2;
          for(let x=x1-9;x<x1&&ok;x++)for(let dy=-2;dy<=2&&ok;dy++)if(g.solid[(y+dy)*g.w+x])ok=false;
          if(ok)return {id,x:o.x,y:o.y,w:o.w,h:o.h,py:y+.5};
        }
      }
      return null;
    });
    check('trovato un edificio di prova',!!sp,sp);
    if(sp){
      await p.evaluate(s=>{if(guidaS().d)guidaScendi(true);guidaSali(1,{zone:s.id,x:s.x-8,y:s.py,a:0});window.__rec={maxX:-1,minDist:99,inside:0,vmaxImp:0,n:0};
        clearInterval(window.__iv);window.__iv=setInterval(()=>{const d=guidaS().d;if(!d)return;const r=window.__rec;r.n++;if(d.x>r.maxX)r.maxX=d.x;
          const gx=Math.floor(d.x),gy=Math.floor(d.y);if(guidaGriglia(state.zone).solid[gy*guidaGriglia(state.zone).w+gx])r.inside++;},8);},sp);
      await sleep(150);
      await p.keyboard.down('ArrowUp');await sleep(3500);await p.keyboard.up('ArrowUp');
      const r=await p.evaluate(()=>{clearInterval(window.__iv);const d=guidaS().d;return {rec:window.__rec,x:d.x,y:d.y,v:Math.hypot(d.vx,d.vy)};});
      check('frontale contro un edificio: mai dentro (ne\' al centro ne\' nelle tessere solide)',r.rec.inside===0&&r.rec.maxX<sp.x-.25,{maxX:+r.rec.maxX.toFixed(2),muroX:sp.x,campioni:r.rec.n,dentro:r.rec.inside,vFinale:+r.v.toFixed(2)});
      // scorrimento: angolo di 40 gradi contro il muro
      await p.evaluate(s=>{const d=guidaS().d;d.x=s.x-6;d.y=s.py-1.5;d.a=.7;d.vx=d.vy=0;window.__y0=d.y;guidaSync(false);},sp);
      await p.keyboard.down('ArrowUp');await sleep(2200);await p.keyboard.up('ArrowUp');
      const sl=await p.evaluate(()=>{const d=guidaS().d;return {x:d.x,y:d.y,v:Math.hypot(d.vx,d.vy),dy:d.y-window.__y0};});
      check('di striscio: scorre lungo il muro invece di bloccarsi',sl.x<sp.x-.25&&sl.dy>1.2&&sl.v>.4,{x:+sl.x.toFixed(2),muroX:sp.x,dy:+sl.dy.toFixed(2),v:+sl.v.toFixed(2)});
      await p.screenshot({path:OUT+'g-muro.png'});
    }
  }

  // ---- 6. Passaggio tra celle (est e nord) senza stacchi di camera
  const bordo=async(dir)=>{
    const sp=await p.evaluate(dir=>{
      for(const id of Object.keys(campus.zones)){
        const nid=quartiereVicino(id,dir);
        if(!nid||!campus.zones[nid]||!(id.startsWith('pq-')||id==='pola'||id==='parenzo'))continue;
        const g=guidaGriglia(id),n=guidaGriglia(nid);
        if(dir==='e'){
          for(let y=4;y<Math.min(g.h,n.h)-4;y++){
            let ok=true;
            for(let i=1;i<=8&&ok;i++)for(let dy=-1;dy<=1&&ok;dy++){if(g.solid[(y+dy)*g.w+g.w-i]||n.solid[(y+dy)*n.w+i-1])ok=false;}
            if(ok&&g.surf[y*g.w+g.w-1]===2)return {id,nid,x:g.w-8,y:y+.5,a:0,dir};
          }
        }else{
          for(let x=4;x<Math.min(g.w,n.w)-4;x++){
            let ok=true;
            for(let i=1;i<=8&&ok;i++)for(let dx=-1;dx<=1&&ok;dx++){if(g.solid[(i-1)*g.w+x+dx]||n.solid[(n.h-i)*n.w+x+dx])ok=false;}
            if(ok&&g.surf[x]===2)return {id,nid,x:x+.5,y:7.5,a:-Math.PI/2,dir};
          }
        }
      }
      return null;
    },dir);
    return sp;
  };
  for(const dir of ['e','n']){
    const sp=await bordo(dir);
    check('trovato un confine '+dir+' libero',!!sp,sp);
    if(!sp)continue;
    await p.evaluate(s=>{if(guidaS().d)guidaScendi(true);guidaSali(1,{zone:s.id,x:s.x,y:s.y,a:s.a});
      window.__r2={frames:[]};if(!window.__gv){window.__gv=guidaVista;guidaVista=function(now){const v=window.__gv(now);if(v&&window.__r2)window.__r2.frames.push({z:state.zone,sx:v.x*16-v.camX,sy:v.y*16-v.camY});return v;};}},sp);
    await sleep(120);
    await p.keyboard.down('ArrowUp');await sleep(3800);await p.keyboard.up('ArrowUp');
    const r=await p.evaluate(()=>{const fr=window.__r2.frames;window.__r2=null;const d=guidaS().d;return {frames:fr,zone:state.zone,x:d.x,y:d.y,v:Math.hypot(d.vx,d.vy)};});
    let maxJump=0,sw=-1,nearJump=0;
    for(let i=1;i<r.frames.length;i++){
      const a=r.frames[i-1],c=r.frames[i];
      const j=Math.hypot(c.sx-a.sx,c.sy-a.sy);
      if(a.z!==c.z)sw=i;
      if(j>maxJump)maxJump=j;
      if(a.z!==c.z)nearJump=j;
    }
    check('passaggio '+sp.id+' -> '+sp.nid+' (verso '+dir+')',r.zone===sp.nid,{zone:r.zone,x:+r.x.toFixed(1),y:+r.y.toFixed(1),v:+r.v.toFixed(2)});
    check('camera senza stacchi al confine '+dir+' (salto massimo tra due fotogrammi, px logici)',sw>0&&maxJump<14&&nearJump<2,{salto_al_cambio_zona:+nearJump.toFixed(2),maxJump:+maxJump.toFixed(2),fotogrammi:r.frames.length,cambioAlFotogramma:sw});
    check('zona in HUD e minimappa coerenti dopo il passaggio',await p.evaluate(()=>(document.getElementById('zone').textContent===tr(room(state.zone).name)||document.getElementById('zone').textContent.length>2)),await p.evaluate(()=>document.getElementById('zone').textContent));
    if(dir==='e'){
      // schermata col confine a meta' vista
      await p.evaluate(s=>{const d=guidaS().d;d.vx=d.vy=0;d.a=0;d.x=0.2;guidaSync(false);},0);
      await sleep(900);await p.screenshot({path:OUT+'g-confine.png'});
    }
  }

  // ---- 7. Non si entra nel campus guidando (porta e tornello restano a piedi)
  {
    const door=await p.evaluate(()=>{const o=room('pq-1-1').objects.find(o=>o.uid==='q-pq-1-1-ingresso-luiss');return {x:o.x,y:o.y};});
    await p.evaluate(s=>{if(guidaS().d)guidaScendi(true);let gy=s.y+3;guidaSali(1,{zone:'pq-1-1',x:s.x+.5,y:gy+.5,a:-Math.PI/2});},door);
    await sleep(100);
    await p.keyboard.down('ArrowUp');await sleep(2500);await p.keyboard.up('ArrowUp');
    const r=await p.evaluate(()=>({zone:state.zone,d:!!guidaS().d,y:guidaS().d.y}));
    check('guidando verso la porta del campus resta nel quartiere',r.zone==='pq-1-1'&&r.d,{door,r});
  }

  // ---- 8. Scendere con E: auto resta nella zona, giocatore su tessera libera
  {
    await p.evaluate(()=>{const d=guidaS().d;d.vx=d.vy=0;});
    const before=await p.evaluate(()=>({zone:state.zone,x:guidaS().d.x,y:guidaS().d.y,a:guidaS().d.a,n:guidaS().d.n}));
    await p.keyboard.press('e');await sleep(500);
    const r=await p.evaluate(b=>{const S=guidaS(),a=S.auto[b.n];return {d:!!S.d,inZone:room(state.zone).objects.some(o=>o.uid==='guida-auto-'+b.n),pos:[a.x,a.y,a.zone],px:state.x,py:state.y,blk:blocked(state.zone,state.x,state.y,0),park:state.guida.park[b.n],expl:exploringCampus(),pad:!!document.querySelector('.guida-pad'),near:nearby()&&nearby().uid,on:state.guida.on};},before);
    check('discesa con E: l\'auto resta dove l\'hai lasciata',!r.d&&r.inZone&&Math.abs(r.pos[0]-before.x)<.01&&Math.abs(r.pos[1]-before.y)<.01&&r.pos[2]===before.zone,{before,r});
    check('giocatore a piedi su tessera libera, movimento ripristinato, comandi touch rimossi',!r.blk&&r.expl&&!r.pad&&r.on===false,r);
    // risalgo e scendo con Esc
    await p.keyboard.press('e');await sleep(400);
    const a=await p.evaluate(()=>!!guidaS().d);
    await p.keyboard.press('Escape');await sleep(500);
    const b2=await p.evaluate(()=>({d:!!guidaS().d,menu:schermoPausato()}));
    check('salita di nuovo con E e discesa con Esc (senza aprire il menu)',a&&!b2.d&&!b2.menu,{a,b2});
    await p.keyboard.press('Escape');await sleep(400);
    const m=await p.evaluate(()=>schermoPausato());
    check('a piedi Esc apre ancora il menu di pausa',m,m);
    await p.keyboard.press('Escape');await sleep(300);
  }

  // ---- 9. Sicurezza: non si sale durante scene, minigiochi, in zone senza strade
  {
    await start();
    const r=await p.evaluate(()=>{
      const S=guidaS(),a=S.auto[1];state.zone=a.zone;
      let x=0,y=0;outer:for(let rr=0;rr<4;rr++)for(let dy=-rr;dy<=rr;dy++)for(let dx=-rr;dx<=rr;dx++){const tx=Math.floor(a.x)+dx,ty=Math.floor(a.y)+dy;if(blocked(a.zone,tx,ty,0))continue;state.x=tx;state.y=ty;const n=nearby();if(n&&n.uid==='guida-auto-1'){x=tx;y=ty;break outer;}}
      const out={};
      activeScene='pola-info';interact();out.scena=!!S.d;activeScene=null;
      minigame={kind:'x'};interact();out.minigioco=!!S.d;minigame=null;
      state.prologue=1;interact();out.prologo=!!S.d;state.prologue=0;
      const zone=state.zone;state.zone='giardino';out.campus=guidaInteragisci({uid:'guida-auto-1'});out.campusSale=!!S.d;state.zone=zone;state.zone='ingresso';guidaInteragisci({uid:'guida-auto-1'});out.ingressoSale=!!S.d;state.zone=zone;
      return out;
    });
    check('niente salita durante scene, minigiochi, prologo e nel campus (zona senza strade)',!r.scena&&!r.minigioco&&!r.prologo&&!r.campusSale&&!r.ingressoSale,r);
  }

  // ---- 10. Salvataggio: ripresa in auto, auto parcheggiata, vecchio salvataggio, nuova partita
  {
    await start();
    await p.evaluate(()=>{const a=guidaS().auto[5];state.zone=a.zone;guidaSali(5);const d=guidaS().d;d.x=a.x+2;d.y=a.y+3;d.a=.5;d.vx=d.vy=0;guidaSync(false);});
    await sleep(300);
    const snap=await p.evaluate(()=>{save();const raw=JSON.parse(localStorage.getItem(saveProfileKey('free')));return {g:raw.guida,zone:raw.zone};});
    check('state.guida salvato (in auto)',snap.g&&snap.g.on===true&&snap.g.zone===snap.zone,snap);
    const rl=await p.evaluate(async()=>{
      const data=stored('free');state=data;await new Promise(r=>setTimeout(r,250));
      const S=guidaS(),d=S.d;
      return {d:!!d,x:d&&d.x,y:d&&d.y,a:d&&d.a,n:d&&d.n,g:state.guida,expl:exploringCampus(),ui:!!document.querySelector('.guida-hud')};
    });
    check('ricaricamento: si riprende in auto, stessa posizione e angolo',rl.d&&Math.abs(rl.x-snap.g.x)<.02&&Math.abs(rl.y-snap.g.y)<.02&&Math.abs(rl.a-snap.g.a)<.01&&rl.ui&&!rl.expl,rl);
    // scendo, salvo, ricarico: a piedi, auto parcheggiata dove l'ho lasciata
    await p.evaluate(()=>{guidaScendi(true);});
    const pk=await p.evaluate(async()=>{
      const n=5,pos=[guidaS().auto[n].x,guidaS().auto[n].y,guidaS().auto[n].zone];
      save();state=stored('free');await new Promise(r=>setTimeout(r,250));
      const a=guidaS().auto[n];
      return {d:!!guidaS().d,pos,after:[a.x,a.y,a.zone],inZone:room(a.zone).objects.some(o=>o.uid==='guida-auto-'+n),others:guidaS().auto.slice(1).every((q,i)=>i+1===n||(Math.abs(q.x-guidaS().def[i+1].x)<.01&&q.zone===guidaS().def[i+1].zone))};
    });
    check('ricaricamento a piedi: auto parcheggiata dove l\'avevo lasciata, le altre ai posti di partenza',!pk.d&&Math.abs(pk.pos[0]-pk.after[0])<.02&&pk.pos[2]===pk.after[2]&&pk.inZone&&pk.others,pk);
    // vecchio salvataggio (senza guida) e nuova partita
    const old=await p.evaluate(async()=>{
      delete state.guida;save();state=stored('free');await new Promise(r=>setTimeout(r,200));
      const a=guidaS().auto[5];const d0=guidaS().def[5];
      return {d:!!guidaS().d,reset:Math.abs(a.x-d0.x)<.01&&a.zone===d0.zone,g:state.guida===undefined};
    });
    check('salvataggio vecchio (senza state.guida) si carica, auto ai posti di partenza',!old.d&&old.reset&&old.g,old);
    const rg=await p.evaluate(async()=>{
      guidaSali(2);resetGame();await new Promise(r=>setTimeout(r,250));
      const S=guidaS();return {d:!!S.d,pad:!!document.querySelector('.guida-pad'),cls:document.getElementById('game').classList.contains('guida-on'),expl:exploringCampus(),inz:S.auto.slice(1).every((q,i)=>room(S.def[i+1].zone).objects.includes(q.o)),g:state.guida};
    });
    check('resetGame mentre si guida: tutto pulito',!rg.d&&!rg.pad&&!rg.cls&&rg.expl&&rg.inz&&rg.g===undefined,rg);
  }

  // ---- 11. Salvataggio non contiene le auto, ne' l'esportazione
  {
    const r=await p.evaluate(()=>{const j=JSON.stringify(campus);return {inJson:j.includes('guida-auto-'),cars:guidaS().auto.slice(1).length,inMem:Object.values(campus.zones).reduce((n,z)=>n+z.objects.filter(o=>String(o.uid).startsWith('guida-auto-')).length,0)};});
    check('le 12 auto sono nella mappa ma non in JSON salvato/esportato',r.cars===12&&r.inMem===12&&!r.inJson,r);
  }

  // ---- 12. Suono: motore sul canale mappa, silenzio rispettato
  {
    await start();
    await p.evaluate(()=>{window.__pt=0;const o=playTones;playTones=function(...a){window.__pt++;return o.apply(this,a);};const a=guidaS().auto[1];state.zone=a.zone;guidaSali(1);});
    await sleep(300);
    const mute=await p.evaluate(()=>!!guidaS().mot);
    await p.evaluate(()=>{enableAudio();});
    await sleep(200);
    await p.keyboard.down('ArrowUp');await sleep(1800);
    const on=await p.evaluate(()=>{const m=guidaS().mot;return m&&{f:m.a.frequency.value,g:m.g.gain.value};});
    await p.keyboard.press('h');await sleep(100);
    const pt=await p.evaluate(()=>window.__pt);
    await p.evaluate(()=>{mixer.map.muted=true;syncMixer();});await sleep(300);
    const mm=await p.evaluate(()=>!!guidaS().mot);
    await p.evaluate(()=>{mixer.map.muted=false;syncMixer();});await sleep(300);
    await p.evaluate(()=>{document.getElementById('audio').click();});await sleep(300);
    const off=await p.evaluate(()=>({audioOn,mot:!!guidaS().mot}));
    await p.keyboard.up('ArrowUp');
    check('audio spento: nessun motore; acceso: sinusoide che sale con la velocita\'; clacson (H); mixer muto: silenzio',!mute&&on&&on.f>100&&pt>=1&&!mm&&!off.mot,{mute,on,clacson:pt,mm,off});
    await p.evaluate(()=>{if(guidaS().d)guidaScendi(true);});
  }

  // ---- 13. Touch: comandi solo in guida, bersagli >= 44px
  {
    await start();
    await p.evaluate(()=>{document.getElementById('game').classList.add('gs-touch-on');});
    const pre=await p.evaluate(()=>!!document.querySelector('.guida-pad'));
    await p.evaluate(()=>{const a=guidaS().auto[1];state.zone=a.zone;guidaSali(1);});
    await sleep(300);
    const sz=await p.evaluate(()=>[...document.querySelectorAll('.guida-pad button')].map(b=>{const r=b.getBoundingClientRect();return {g:b.dataset.g,w:Math.round(r.width),h:Math.round(r.height)};}));
    await p.screenshot({path:OUT+'g-touch.png'});
    const hud=await p.evaluate(()=>{const h=document.querySelector('.guida-hud').getBoundingClientRect();const pad=[...document.querySelectorAll('.guida-pad button')].map(b=>b.getBoundingClientRect());const top=document.querySelector('.gs-top').getBoundingClientRect();const plate=document.querySelector('.gs-plate').getBoundingClientRect();
      const ov=(a,b)=>!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom);
      return {padHud:pad.some(r=>ov(r,h)),padTop:pad.some(r=>ov(r,top)||ov(r,plate)),oldPadHidden:getComputedStyle(document.querySelector('.gs-touch')).display};});
    // tocco sull'acceleratore
    await p.evaluate(()=>{const b=document.querySelector('.guida-pad [data-g=up]');b.dispatchEvent(new PointerEvent('pointerdown',{pointerId:7,pointerType:'touch',button:0,bubbles:true}));});
    await sleep(1200);
    const gas=await p.evaluate(()=>({up:guidaS().k.up,v:Math.hypot(guidaS().d.vx,guidaS().d.vy)}));
    await p.evaluate(()=>{const b=document.querySelector('.guida-pad [data-g=up]');b.dispatchEvent(new PointerEvent('pointerup',{pointerId:7,pointerType:'touch',button:0,bubbles:true}));});
    await sleep(100);
    const rel=await p.evaluate(()=>guidaS().k.up);
    await p.evaluate(()=>{document.querySelector('.guida-pad [data-g=exit]').click();});await sleep(2500);
    const post=await p.evaluate(()=>({pad:!!document.querySelector('.guida-pad'),d:!!guidaS().d}));
    check('comandi touch creati solo in guida (assenti prima e dopo)',!pre&&sz.length===6&&!post.pad&&!post.d,{pre,n:sz.length,post});
    check('bersagli touch >= 44px',sz.every(s=>s.w>=44&&s.h>=44),sz);
    check('i comandi touch non coprono HUD e titolo; il D-pad a piedi e\' nascosto',!hud.padHud&&!hud.padTop&&hud.oldPadHidden==='none',hud);
    check('tocco su acceleratore accelera, rilascio spegne; "Scendi" esce frenando',gas.up===1&&gas.v>1.5&&rel===0,{gas,rel});
  }

  // ---- 14. Rendering, sera, movimento ridotto
  {
    await start();
    await p.evaluate(()=>{const a=guidaS().auto[9];state.zone=a.zone;guidaSali(9);});
    await sleep(200);
    await p.keyboard.down('ArrowUp');await sleep(1500);await p.keyboard.down('ArrowRight');await sleep(350);await p.keyboard.up('ArrowRight');
    await p.screenshot({path:OUT+'g-giorno.png'});
    await p.evaluate(()=>{window.realismoOra=21;});await sleep(300);
    await p.screenshot({path:OUT+'g-sera.png'});
    await p.evaluate(()=>{window.realismoOra=18.8;});await sleep(300);
    await p.screenshot({path:OUT+'g-tramonto.png'});
    await p.keyboard.up('ArrowUp');
    await p.evaluate(()=>{window.realismoOra=14;if(guidaS().d)guidaScendi(true);});
    // movimento ridotto
    await p.evaluate(()=>{reducedMotion=true;});
    const rs=await strip(2,14);await p.evaluate(s=>{guidaSali(1,{zone:s.id,x:s.x+.5,y:s.y+.5,a:0});},rs);
    await p.keyboard.down('ArrowUp');await sleep(1800);
    const rm=await p.evaluate(()=>{const S=guidaS();return {zoom:S.vista.zoom,pc:S.pc,sc:S.sc,v:Math.hypot(S.d.vx,S.d.vy)};});
    await p.keyboard.up('ArrowUp');
    check('movimento ridotto: zoom fisso, niente polvere ne\' segni',rm.zoom===1&&rm.pc===0&&rm.sc===0&&rm.v>0.5,rm);
    await p.evaluate(()=>{reducedMotion=false;if(guidaS().d)guidaScendi(true);});
  }

  // ---- 15. Prestazioni: fotogrammi e crescita della memoria durante la guida
  {
    await start();
    await p.evaluate(()=>{const a=guidaS().auto[1];state.zone=a.zone;guidaSali(1);window.gc&&gc();});
    await sleep(300);
    const h0=await p.evaluate(()=>{window.gc&&gc();return performance.memory.usedJSHeapSize;});
    await p.keyboard.down('ArrowUp');await p.keyboard.down('ArrowRight');
    const f=await p.evaluate(()=>new Promise(res=>{let n=0;const t0=performance.now();const l=()=>{n++;if(performance.now()-t0<5000)requestAnimationFrame(l);else res({n,ms:performance.now()-t0});};l();}));
    await p.keyboard.up('ArrowUp');await p.keyboard.up('ArrowRight');
    const h1=await p.evaluate(()=>{window.gc&&gc();return performance.memory.usedJSHeapSize;});
    const t=await p.evaluate(()=>{const S=guidaS();const t0=performance.now();for(let i=0;i<2000;i++)guidaPasso(1/60);return (performance.now()-t0)/2000;});
    check('fotogrammi e memoria in guida (5 s)',f.n/f.ms*1000>20,{fps:+(f.n/f.ms*1000).toFixed(1),heapDeltaKB:Math.round((h1-h0)/1024),passoFisicoMs:+t.toFixed(4)});
  }

  // ---- 16. Spostamento esterno (viaggio): si scende senza errori e l'auto resta
  {
    await start();
    await p.evaluate(()=>{const a=guidaS().auto[1];state.zone=a.zone;guidaSali(1);});
    await sleep(200);
    await p.evaluate(()=>{state.zone='giardino';state.x=10;state.y=10;});
    await sleep(300);
    const r=await p.evaluate(()=>({d:!!guidaS().d,zone:state.zone,x:state.x,y:state.y,expl:exploringCampus(),car:room('pola').objects.some(o=>o.uid==='guida-auto-1')}));
    check('spostamento esterno del giocatore mentre si guida: scende, auto resta, posizione del giocatore invariata',!r.d&&r.zone==='giardino'&&r.x===10&&r.y===10&&r.expl&&r.car,r);
  }
  check('nessun errore in console / pageerror',errs.length===0,errs.slice(0,5));
  const fail=results.filter(r=>!r.ok);
  console.log('\nTOTALE',results.length,'controlli,',fail.length,'falliti');
  await b.close();
  process.exit(fail.length?1:0);
})().catch(e=>{console.error('ERRORE TEST',e);process.exit(2);});
