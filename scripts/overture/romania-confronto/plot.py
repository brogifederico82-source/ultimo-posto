import sys
import os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from lib import *
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle,Polygon as MPoly
realpoly,ed=load_real()
G=load_game()
pairs=json.load(open(S+'pairs.json'))
fig,axs=plt.subplots(1,2,figsize=(22,11.5))
def to_game_poly(g):
    return [r2g(x,y) for x,y in g.exterior.coords]
roads=json.load(open(D+'strade.geojson'))['features']
xlim=(0,100);ylim=(100,0)
for k,ax in enumerate(axs):
    ax.set_xlim(*xlim);ax.set_ylim(*ylim);ax.set_aspect('equal')
    ax.set_xticks(range(0,101,10));ax.set_yticks(range(0,101,10));ax.grid(alpha=.25,lw=.4)
    # terreno gioco
    col={'road':'#6b7480','paving':'#d9d2c3','path':'#e6cf9f'}
    for kind in ('paving','path','road'):
        for kk,x,y,w,h in G['terr']:
            if kk==kind and x<105 and y<105:
                ax.add_patch(Rectangle((x,y),w,h,fc=col[kind],ec='none',zorder=1))
    # edifici gioco
    for o in G['objs']:
        if o['kind'] in ('faculty','roof','chapel','domeHall','booth','court') and not o['uid'].startswith('quartiere'):
            ax.add_patch(Rectangle((o['x'],o['y']),o['w'],o['h'],fc='#7fa7d6',ec='#1c4f8a',lw=1.2,alpha=.75,zorder=3))
            if k==1 and o['w']*o['h']>=20:
                ax.text(o['x']+o['w']/2,o['y']+o['h']/2,o['name'].split(' · ')[0][:18],ha='center',va='center',fontsize=6.5,color='#0b2a50',zorder=6)
        if o['kind']=='wall' and o['uid'].startswith('cinta'):
            ax.add_patch(Rectangle((o['x'],o['y']),1,1,fc='#444',ec='none',zorder=2))
    # perimetro reale
    ax.add_patch(MPoly(to_game_poly(realpoly),fc='none',ec='#1a8f3c',lw=2.2,zorder=5))
    # edifici reali
    for f,g in ed:
        if g.area<40:continue
        inside=g.intersection(realpoly).area/g.area
        if inside<.5:continue
        ax.add_patch(MPoly(to_game_poly(g),fc='#e7413c',ec='#8a0f0b',lw=1.4,alpha=.45 if k==0 else .6,zorder=4))
    # strade reali
    for f in roads:
        g=shape(f['geometry']);p=f['properties']
        if not g.intersects(realpoly.buffer(60)):continue
        pts=[r2g(x,y) for x,y in g.coords]
        xs,ys=zip(*pts)
        cl=p['classe']
        ax.plot(xs,ys,color='#222' if cl not in('footway','cycleway') else '#7a5a00',lw=1.5 if cl not in('footway',) else .8,ls='-' if cl!='footway' else '--',zorder=5,alpha=.85)
        if p['nome'] and k==0:
            m=g.interpolate(.5,normalized=True);gx,gy=r2g(m.x,m.y)
            if 0<gx<100 and 0<gy<100:ax.text(gx,gy,p['nome'],fontsize=7,color='navy',zorder=7)
    # POI
    if k==1:
        for f in json.load(open(D+'luoghi.geojson'))['features']:
            x,y=f['geometry']['coordinates'];p=f['properties']
            if realpoly.contains(Point(x,y)) and p['nome']:
                gx,gy=r2g(x,y);ax.plot(gx,gy,'k.',ms=5,zorder=8);ax.text(gx+.5,gy-.3,p['nome'][:22],fontsize=6,zorder=8)
    # etichette reali
    if k==1:
        for f,g in ed:
            if g.area<80 or g.intersection(realpoly).area/g.area<.5:continue
            c=g.centroid;gx,gy=r2g(c.x,c.y)
            ax.text(gx,gy+3.2,'%d m²'%g.area,fontsize=6,color='#8a0f0b',ha='center',zorder=8)
    # tornello e varchi
    for o in G['objs']:
        if o['uid'] in('viale-ingresso-varco','panama-varco'):
            ax.plot(o['x']+.5,o['y']+.5,marker='*',color='gold',mec='k',ms=14,zorder=9)
axs[0].set_title('Sovrapposizione: blu = gioco (tessere), rosso = impronte vere, verde = perimetro vero del campus\n(allineamento: perimetro, 2,79 m/tessera, nord vero a sinistra; stella = tornelli)',fontsize=10)
axs[1].set_title('Dettaglio edifici: nomi gioco, area vera, POI vere (punti neri)',fontsize=10)
for ax in axs:ax.set_xlabel('x (tessere del gioco)');ax.set_ylabel('y (tessere del gioco)')
# freccia nord
ax=axs[0]
nx,ny=-35.8/100*1.0,-2.1/100
ax.annotate('N',xy=(8,92),xytext=(30,92),arrowprops=dict(arrowstyle='->',lw=2),fontsize=14,ha='center',va='center',zorder=10)
plt.tight_layout()
plt.savefig(sys.argv[1],dpi=100)
print('ok')
