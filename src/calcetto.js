const calcettoGround=160, calcettoBar=107, calcettoRadius=6;
function startCalcetto(){
  const g={id:"calcetto",kind:"calcetto",score:[0,0],seconds:55,last:null,delay:1,result:null};
  resetCalcetto(g);
  return g;
}
function resetCalcetto(g){
  const player=x=>({x,y:calcettoGround,vx:0,vy:0,kick:0});
  g.you=player(79);g.rival=player(241);
  g.ball={x:160,y:75,vx:0,vy:0};
}
function jumpCalcetto(player){
  if(!minigame.result&&!minigame.delay&&player.y===calcettoGround)player.vy=-227;
}
function kickCalcetto(player,ball,direction){
  if(minigame.result||minigame.delay||player.kick>0)return;
  player.kick=.27;
  if(Math.abs(ball.x-player.x)>26||ball.y>player.y+3||ball.y<player.y-32)return;
  ball.vx=direction*(195+Math.abs(player.vx)*.35);
  ball.vy=player.y<calcettoGround-9?-51:-131;
  chime([67,76],.04);
}
function stepCalcettoPlayer(player,move,speed,dt){
  player.vx=approach(player.vx,move*speed,760*dt);
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
  if(dot<0){ball.vx-=1.58*dot*nx;ball.vy-=1.58*dot*ny;}
}
function stepCalcetto(g,dt){
  if(g.delay>0){g.delay=Math.max(0,g.delay-dt);return;}
  g.seconds=Math.max(0,g.seconds-dt);
  const [left,right]=[keys.has("arrowleft")||keys.has("a")||controls.has("left"),keys.has("arrowright")||keys.has("d")||controls.has("right")];
  stepCalcettoPlayer(g.you,Number(right)-Number(left),135,dt);
  const b=g.ball,r=g.rival;
  const target=clamp(b.x+(g.practice?25:12)+b.vx*.12,95,287);
  if(b.y>r.y-63&&b.y<r.y-24&&Math.abs(b.x-r.x)<26)jumpCalcetto(r);
  if(Math.abs(b.x-r.x)<23&&b.x<r.x+6&&b.y>r.y-30&&b.y<r.y+1)kickCalcetto(r,b,-1);
  stepCalcettoPlayer(r,Math.abs(target-r.x)<4?0:Math.sign(target-r.x),g.practice?80:112,dt);
  b.vy=Math.min(300,b.vy+440*dt);
  b.vx=clamp(b.vx,-330,330);
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  calcettoContact(g.you,b);calcettoContact(r,b);
  if(b.y<calcettoRadius+5){b.y=calcettoRadius+5;b.vy=Math.abs(b.vy)*.78;}
  if(b.y>calcettoGround-calcettoRadius){
    b.y=calcettoGround-calcettoRadius;b.vy=-Math.abs(b.vy)*.61;b.vx*=.89;
  }
  if(b.x<10||b.x>310){
    if(b.y>calcettoBar+calcettoRadius){
      const side=b.x>310?0:1;
      g.score[side]++;
      chime(side===0?[67,76,79]:[48,55],.05);
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
    rect(c,color,x-8,y-18,16,14);
    rect(c,"#f2c08d",x-9,y-29,18,13);
    rect(c,"#223048",x-9,y-31,18,4);
    rect(c,"#202737",x+direction*4,y-24,2,2);
    rect(c,"#dae7ed",x-8,y-5,player.kick?22:15,5);
  }
  c.beginPath();c.arc(g.ball.x,g.ball.y,calcettoRadius,0,Math.PI*2);
  c.fillStyle="#fff0c2";c.fill();
  rect(c,"#4d5263",g.ball.x-2,g.ball.y-2,4,4);
  $("challengeScore").textContent=local("Tu ","You ")+g.score[0]+" – "+g.score[1]+" Matteo · "+Math.ceil(g.seconds)+" s";
  if(!g.result)$("challengeStatus").textContent=g.delay?local("Palla al centro","Kickoff"):local("In gioco","In play");
}
