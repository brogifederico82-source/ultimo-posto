import sys
import os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from lib import *
realpoly,ed=load_real()
G=load_game()
# tessere terreno
road=set();pav=set();path=set()
for k,x,y,w,h in G['terr']:
    for i in range(w):
        for j in range(h):
            (road if k=='road' else pav if k=='paving' else path).add((x+i,y+j))
print('tessere road %d paving %d path %d'%(len(road),len(pav),len(path)))
roads=json.load(open(D+'strade.geojson'))['features']
def stats(name,geom_filter):
    pts=[]
    for f in roads:
        g=shape(f['geometry']);p=f['properties']
        if geom_filter(f,p):
            inter=g.intersection(realpoly.buffer(3)) if name.startswith('interne') else g
            if inter.is_empty:continue
            for gg in (inter.geoms if hasattr(inter,'geoms') else [inter]):
                if gg.geom_type!='LineString':continue
                n=max(2,int(gg.length/2))
                for t in np.linspace(0,1,n):
                    q=gg.interpolate(t,normalized=True);pts.append(r2g(q.x,q.y))
    return pts
def dist_tiles(pts,tiles,maxd=None):
    arr=np.array(list(tiles))+.5
    out=[]
    for x,y in pts:
        d=np.sqrt(((arr-[x,y])**2).sum(1)).min();out.append(d)
    return np.array(out)
# Via Panama reale vicino al campus
pan=[]
for f in roads:
    p=f['properties']
    if p['nome']=='Via Panama':
        g=shape(f['geometry'])
        for t in np.linspace(0,1,int(g.length/2)+2):
            q=g.interpolate(t,normalized=True)
            gx,gy=r2g(q.x,q.y)
            if 0<=gx<144 and 0<=gy<100 and realpoly.buffer(60).contains(q):pan.append((gx,gy))
d=dist_tiles(pan,road)*s
print('Via Panama reale: %d punti, distanza dalla strada del gioco: media %.1f m, mediana %.1f, 90p %.1f'%(len(pan),d.mean(),np.median(d),np.percentile(d,90)))
# strada interna reale (service/driveway dentro il campus)
ints=stats('interne',lambda f,p:p['classe'] in('service','footway','unknown') and f['properties']['sottoclasse']!='sidewalk')
inside=[(x,y) for x,y in ints if True]
mov=path|road
print("paving tiles dentro campus reale:",sum(1 for (x,y) in pav if realpoly.contains(Point(*g2r(x+.5,y+.5)))),"su area campus tessere",round(realpoly.area/s/s))
d2=dist_tiles(inside,mov)*s
print('percorsi reali interni (service/footway non marciapiede): %d campioni; entro 2.8 m da una tessera pavimentata/sentiero/strada del gioco: %.0f%%; entro 5.6 m: %.0f%%'%(len(d2),100*(d2<=2.8).mean(),100*(d2<=5.6).mean()))
# solo service
ints=stats('interne-service',lambda f,p:p['classe']=='service')
d3=dist_tiles(ints,mov)*s
print('strade service interne: %d campioni; entro 2.8 m: %.0f%%, entro 5.6: %.0f%%'%(len(d3),100*(d3<=2.8).mean(),100*(d3<=5.6).mean()))
# Viale Romania reale: tessere road del gioco entro
vr=[]
for f in roads:
    p=f['properties']
    if p['nome']=='Viale Romania':
        g=shape(f['geometry'])
        for t in np.linspace(0,1,int(g.length/2)+2):
            q=g.interpolate(t,normalized=True);gx,gy=r2g(q.x,q.y)
            if 0<=gx<144 and 0<=gy<144 and realpoly.buffer(80).contains(q):vr.append((gx,gy))
d4=dist_tiles(vr,road)*s
print('Viale Romania reale: %d punti, distanza dalla strada del gioco: media %.1f m, mediana %.1f, 90p %.1f'%(len(vr),d4.mean(),np.median(d4),np.percentile(d4,90)))
print('esempi Viale Romania in tessere:',[ (round(a,1),round(b,1)) for a,b in vr[::12]])
# alberi del gioco dentro il campus vs verde: skip
# larghezza strada reale Panama non disponibile
