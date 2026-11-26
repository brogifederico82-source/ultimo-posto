const calcettoGround=160, calcettoBar=107, calcettoRadius=6;
function startCalcetto(){
  const g={id:"calcetto",kind:"calcetto",score:[0,0],seconds:55,last:null,delay:1,result:null};
  resetCalcetto(g);
  return g;
}
function resetCalcetto(g){
  const player=x=>({x,y:calcettoGround,vx:0,vy:0,kick:0,jumpBuffer:0,shotBuffer:0});
  g.you=player(79);g.rival=player(241);
  g.ball={x:160,y:75,vx:0,vy:0};
  g.rivalTarget=241;g.rivalRead=0;
}
function jumpCalcetto(player){
  if(!minigame.result)player.jumpBuffer=.16;
}
function kickCalcetto(player){
  if(!minigame.result)player.shotBuffer=.19;
}
function calcettoShot(player,ball,direction){
  if(player.kick>0||player.shotBuffer<=0)return;
  const dx=(ball.x-player.x)*direction;
  if(dx< -8||dx>29||ball.y>player.y+3||ball.y<player.y-34)return;
  player.shotBuffer=0;
  player.kick=.23;
  const aerial=player.y<calcettoGround-10;
  ball.vx=direction*((aerial?252:207)+Math.abs(player.vx)*.24);
  ball.vy=aerial?Math.max(-70,Math.min(98,ball.vy*.26+28)):-111;
  ball.flash=.18;
  sound("shot");
}
function stepCalcettoPlayer(player,move,speed,dt){
  if(player.jumpBuffer>0&&player.y===calcettoGround){
    player.vy=-242;player.jumpBuffer=0;
  }
  player.jumpBuffer=Math.max(0,player.jumpBuffer-dt);
  player.vx=approach(player.vx,move*speed,(move?940:1300)*dt);
  player.x=clamp(player.x+player.vx*dt,16,304);
  player.vy+=620*dt;
  player.y=Math.min(calcettoGround,player.y+player.vy*dt);
  if(player.y===calcettoGround)player.vy=0;
  player.kick=Math.max(0,player.kick-dt);
}
function calcettoContact(player,ball){
  const dx=ball.x-player.x,dy=ball.y-(player.y-17);
  const distance=Math.hypot(dx,dy);
  if(distance>=17)return;
  const nx=distance?dx/distance:1,ny=distance?dy/distance:0;
  ball.x=player.x+nx*17;ball.y=player.y-17+ny*17;
  const dot=(ball.vx-player.vx)*nx+(ball.vy-player.vy)*ny;
  if(dot<0){
    ball.vx-=1.72*dot*nx;
    ball.vy-=1.72*dot*ny;
    if(dot< -38){ball.flash=.13;sound("bounce");}
    if(player.y<calcettoGround-7&&ny<-.35)ball.vy+=player.vy*.32;
  }
}
function stepCalcetto(g,dt){
  if(g.delay>0){g.delay=Math.max(0,g.delay-dt);return;}
  g.goal=null;
  g.seconds=Math.max(0,g.seconds-dt);
  const [left,right]=[keys.has("arrowleft")||keys.has("a")||controls.has("left"),keys.has("arrowright")||keys.has("d")||controls.has("right")];
  stepCalcettoPlayer(g.you,Number(right)-Number(left),135,dt);
  const b=g.ball,r=g.rival;
  g.rivalRead-=dt;
  if(g.rivalRead<=0){
    const defending=b.vx>45&&b.x>160;
    const intercept=b.x+b.vx*(defending?.23:.13);
    g.rivalTarget=clamp(intercept+(g.practice?30:16),defending?154:89,292);
    g.rivalRead=g.practice?.22:.12;
    if(b.vy> -85&&b.y>r.y-65&&b.y<r.y-27&&Math.abs(b.x-r.x)<29)jumpCalcetto(r);
  }
  if(b.x<r.x+5&&Math.abs(b.x-r.x)<27&&b.y>r.y-34&&b.y<r.y+1)kickCalcetto(r);
  stepCalcettoPlayer(r,Math.abs(g.rivalTarget-r.x)<4?0:Math.sign(g.rivalTarget-r.x),g.practice?77:114,dt);
  calcettoShot(g.you,b,1);calcettoShot(r,b,-1);
  for(const player of [g.you,r])player.shotBuffer=Math.max(0,player.shotBuffer-dt);
  b.flash=Math.max(0,(b.flash??0)-dt);
  b.vy=Math.min(300,b.vy+440*dt);
  b.vx=clamp(b.vx,-330,330);
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  calcettoContact(g.you,b);calcettoContact(r,b);
  if(b.y<calcettoRadius+5){b.y=calcettoRadius+5;b.vy=Math.abs(b.vy)*.78;}
  if(b.y>calcettoGround-calcettoRadius){
    if(b.vy>60)sound("bounce");
    b.y=calcettoGround-calcettoRadius;b.vy=-Math.abs(b.vy)*.61;b.vx*=.89;
  }
  for(const x of [10,310]){
    if(Math.hypot(b.x-x,b.y-calcettoBar)>=calcettoRadius+2)continue;
    const nx=(b.x-x)/(Math.hypot(b.x-x,b.y-calcettoBar)||1);
    const ny=(b.y-calcettoBar)/(Math.hypot(b.x-x,b.y-calcettoBar)||1);
    const impact=b.vx*nx+b.vy*ny;
    if(impact>=0)continue;
    b.vx-=1.82*impact*nx;b.vy-=1.82*impact*ny;
    b.x=x+nx*(calcettoRadius+2);b.y=calcettoBar+ny*(calcettoRadius+2);
    b.flash=.2;sound("post");
  }
  if(b.x<10||b.x>310){
    if(b.y>calcettoBar+calcettoRadius){
      const side=b.x>310?0:1;
      g.score[side]++;g.goal=side;
      sound("goal");sound("crowd");
      resetCalcetto(g);
      g.delay=.8;
    }else{
      b.x=clamp(b.x,10,310);
      b.vx*=-.83;
    }
  }
  if(g.seconds===0||Math.max(...g.score)>=(g.practice?3:5)){
    endChallenge(g,g.score[0]===g.score[1]?"tie":g.score[0]>g.score[1]?"win":"loss");
  }
}
function tickCalcetto(g,now){
  let dt=Math.min(.05,(g.last===null?0:now-g.last)/1000);
  g.last=now;
  while(dt>0&&!g.result){
    const step=Math.min(dt,1/120);
    stepCalcetto(g,step);dt-=step;
  }
  paintCalcetto(g);
}
function paintCalcetto(g){
  const c=courtInk;
  rect(c,"#14233b",0,0,320,188);
  for(let i=0;i<8;i++)rect(c,i%2?"#253c57":"#293e5a",i*40,18,40,105);
  rect(c,"#26645c",0,160,320,28);
  rect(c,"#9fcec0",0,160,320,2);
  rect(c,"#d7e8e3",159,160,2,28);
  for(const x of [2,299]){
    rect(c,"#829eac",x,calcettoBar,19,3);
    for(let i=0;i<17;i+=4)rect(c,"#688698",x+i,calcettoBar+3,1,50);
    for(let y=calcettoBar+6;y<160;y+=7)rect(c,"#688698",x,y,17,1);
  }
  for(const [player,color,direction] of [[g.you,"#61d8f4",1],[g.rival,"#fb8966",-1]]){
    const {x,y}=player;
    rect(c,"#163f4077",x-9,calcettoGround+2,18,3);
    rect(c,color,x-8,y-18,16,14);
    rect(c,"#f2c08d",x-9,y-29,18,13);
    rect(c,"#223048",x-9,y-31,18,4);
    rect(c,"#202737",x+direction*4,y-24,2,2);
    const stride=reducedMotion?0:Math.sin(x*.35)*Math.min(4,Math.abs(player.vx)/35);
    rect(c,"#dae7ed",x-8,y-5+stride,7,4);
    rect(c,"#dae7ed",x,y-5-stride,player.kick?13:7,4);
  }
  const b=g.ball;
  rect(c,"#103635aa",b.x-5,calcettoGround+3,10,2);
  if(b.flash&&!reducedMotion)for(const [dx,dy] of [[-1,0],[1,0],[-.7,-.7],[.7,.7]]){
    const spread=9+(1-b.flash/.2)*9;
    rect(c,"#ffc975",b.x+dx*spread,b.y+dy*spread,2,2);
  }
  c.beginPath();c.arc(g.ball.x,g.ball.y,calcettoRadius,0,Math.PI*2);
  c.fillStyle="#fff0c2";c.fill();
  rect(c,"#4d5263",g.ball.x-2,g.ball.y-2,4,4);
  if(g.delay&&g.goal!==null&&g.goal!==undefined){
    rect(c,"#0c182ddd",86,57,148,38);
    c.font="bold 18px monospace";c.fillStyle=g.goal===0?"#61d8f4":"#fb8966";
    c.textAlign="center";c.fillText(g.goal===0?"GOL!":"MATTEO!",160,82);
  }
  $("challengeScore").textContent=local("Tu ","You ")+g.score[0]+" – "+g.score[1]+" Matteo · "+Math.ceil(g.seconds)+" s";
  if(!g.result)$("challengeStatus").textContent=g.goal===0?local("Gol tuo!","Your goal!"):g.goal===1?local("Gol di Matteo!","Matteo scores!"):g.delay?local("Palla al centro","Kickoff"):local("In gioco","In play");
}
