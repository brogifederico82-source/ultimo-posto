const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+process.env.WT+'/dist/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const z=room('giardino');const T=['paving','path','road','grass'];return {w:z.width,h:z.height,objs:z.objects.filter(o=>!T.includes(o.kind)).map(o=>({uid:o.uid,kind:o.kind,name:o.name,x:o.x,y:o.y,w:o.w||1,h:o.h||1,target:o.target||'',action:o.action||''})),terr:z.objects.filter(o=>T.includes(o.kind)).map(o=>[o.kind,o.x,o.y,o.w||1,o.h||1])}});
require('fs').writeFileSync(process.env.OUT,JSON.stringify(r));console.log(r.objs.length,r.terr.length);await b.close()})()
