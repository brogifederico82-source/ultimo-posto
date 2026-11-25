const loftGames={
  mattoni:{name:"Pixel Mattoni",rules:"Sposta la racchetta con A/D o ←/→. Spazio lancia la pallina. Elimina tutti i mattoni con tre vite."},
  nastri:{name:"Salva i nastri",rules:"Muoviti con A/D o ←/→ e raccogli 12 cassette. La partita finisce al terzo errore."}
};
function startLoftGame(id){
  const bricks=[];
  if(id==="mattoni")for(let row=0;row<4;row++)for(let column=0;column<8;column++){
    bricks.push({x:22+column*35,y:23+row*14,row});
  }
  return {id,kind:"loft",x:160,bricks,ball:{x:160,y:159,vx:0,vy:0},lives:3,score:0,last:0,
    ready:true,drops:[],spawn:.35,dropIndex:0,result:null};
}
function launchLoftBall(g){
  if(g?.id!=="mattoni"||!g.ready||g.result)return;
  g.ready=false;
  Object.assign(g.ball,{x:g.x,y:159,vx:g.x<160?61:-61,vy:-108});
  chime([64,72]);
}
function stepLoftBricks(g,dt){
  const b=g.ball;
  if(g.ready){b.x=g.x;return;}
  const oldY=b.y;
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<12||b.x>308){b.x=clamp(b.x,12,308);b.vx*=-1;}
  if(b.y<12){b.y=12;b.vy=Math.abs(b.vy);}
  if(b.vy>0&&oldY<165&&b.y>=165&&Math.abs(b.x-g.x)<=24){
    b.y=164;b.vy=-Math.min(162,b.vy+3);
    b.vx=clamp((b.x-g.x)*4.2,-111,111);
    chime([58]);
  }
  const hit=g.bricks.findIndex(o=>b.x>=o.x-2&&b.x<=o.x+32&&b.y>=o.y-2&&b.y<=o.y+12);
  if(hit>=0){
    const brick=g.bricks[hit];
    g.bricks.splice(hit,1);g.score++;
    if(oldY<brick.y||oldY>brick.y+10)b.vy*=-1;else b.vx*=-1;
    chime([72+brick.row]);
    if(!g.bricks.length)endChallenge(g,"win");
  }
  if(b.y>187){
    if(--g.lives===0){endChallenge(g,"loss");return;}
    g.ready=true;b.y=159;b.vx=0;b.vy=0;chime([46,41]);
  }
}
function stepLoftTapes(g,dt){
  g.spawn-=dt;
  if(g.spawn<=0){
    const lanes=[160,95,215,132,243,82,185,122,260,65,143,222,100,187];
    g.drops.push({x:lanes[g.dropIndex++%lanes.length],y:12});
    g.spawn=Math.max(.52,.86-g.score*.023);
  }
  for(let i=g.drops.length-1;i>=0;i--){
    const tape=g.drops[i],oldY=tape.y;
    tape.y+=(77+g.score*3)*dt;
    if(oldY<=165&&tape.y>=165&&Math.abs(tape.x-g.x)<=25){
      g.drops.splice(i,1);chime([72]);
      if(++g.score===12){endChallenge(g,"win");return;}
    }else if(tape.y>185){
      g.drops.splice(i,1);chime([43]);
      if(--g.lives===0){endChallenge(g,"loss");return;}
    }
  }
}
function tickLoftGame(now){
  const g=minigame;
  const dt=g.last?Math.min((now-g.last)/1000,.033):0;
  g.last=now;
  if(!g.result){
    g.x=g.pointerAim==null?clamp(g.x+foosDirection()*245*dt,32,288):clamp(g.pointerAim,32,288);
    if(g.id==="mattoni")stepLoftBricks(g,dt);
    else stepLoftTapes(g,dt);
  }
  paintLoftGame(g);
}
function paintLoftGame(g){
  const c=courtInk;
  rect(c,"#12182f",0,0,320,188);
  for(let y=12;y<188;y+=12)rect(c,"#253152",9,y,302,1);
  rect(c,"#293c63",10,8,2,166);rect(c,"#293c63",308,8,2,166);
  rect(c,"#f8cb80",g.x-22,165,44,5);rect(c,"#7bd7cf",g.x-16,163,32,2);
  if(g.id==="mattoni"){
    for(const brick of g.bricks){
      rect(c,["#d678a4","#ec9e69","#e6cc79","#69bfb5"][brick.row],brick.x,brick.y,30,10);
      rect(c,"#fff3d480",brick.x+1,brick.y+1,28,1);
    }
    rect(c,"#f9efd4",g.ball.x-2,g.ball.y-2,4,4);
  }else for(const tape of g.drops){
    rect(c,"#d284af",tape.x-8,tape.y-4,16,9);rect(c,"#253152",tape.x-5,tape.y-2,10,4);
    rect(c,"#f8cb80",tape.x-3,tape.y-1,2,2);rect(c,"#f8cb80",tape.x+2,tape.y-1,2,2);
  }
  $("challengeScore").textContent=(g.id==="mattoni"?"Mattoni ":"Cassette ")+g.score+"/"+(g.id==="mattoni"?32:12)+" · Vite "+g.lives;
  if(!g.result)$("challengeStatus").textContent=g.id==="mattoni"&&g.ready?"Spazio o Lancia":"";
}
