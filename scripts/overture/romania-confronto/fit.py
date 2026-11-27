# Eseguire dalla radice del repository: python3 scripts/overture/romania-confronto/<script>.py
import json,math
import numpy as np
from shapely.geometry import shape,Polygon,Point
from shapely import affinity
from scipy.optimize import minimize
D='data/mappa/overture/'
us=json.load(open(D+'uso_suolo.geojson'))['features']
camp=[f for f in us if f['properties'].get('nome') and 'LUISS' in f['properties']['nome'] and shape(f['geometry']).centroid.x<-700][0]
real=shape(camp['geometry'])
print('reale area',real.area,'bounds',real.bounds,real.geom_type)
if real.geom_type!='Polygon': real=max(real.geoms,key=lambda g:g.area)
print('perimetro',real.length)
print('coords reali',[(round(x),round(y)) for x,y in real.exterior.coords])
B=[[22,8],[26,11],[32,12],[41,14],[48,16],[55,18],[59,23],[63,27],[68,34],[73,41],[78,46],[80,49],[82,52],[85,57],[83,62],[79,70],[77,76],[73,83],[70,90],[61,87],[49,83],[38,79],[28,78],[26,75],[23,75],[20,75],[8,72],[6,69],[7,60],[7,55],[7,49],[9,41],[13,29],[17,18]]
game=Polygon(B)
print('gioco area tessere',game.area,'perimetro',game.length)
print('scala per area',math.sqrt(real.area/game.area))
# game y down, real y up: transform p_real = s*R(theta)*(gx-cx, gy-cy)+t, allow mirror flag
def tf(params,mirror):
    s,th,tx,ty=params
    c,sn=math.cos(th),math.sin(th)
    out=[]
    for x,y in B:
        x-=game.centroid.x;y-=game.centroid.y
        if mirror:y=-y
        out.append((s*(c*x-sn*y)+tx,s*(sn*x+c*y)+ty))
    return Polygon(out)
def iou(params,mirror):
    p=tf(params,mirror)
    if not p.is_valid:p=p.buffer(0)
    i=p.intersection(real).area;u=p.union(real).area
    return i/u
best=None
rc=real.centroid
for mirror in (0,1):
    for th0 in np.arange(0,360,15):
        for s0 in (2.5,3.0,3.5):
            x0=[s0,math.radians(th0),rc.x,rc.y]
            r=minimize(lambda p:-iou(p,mirror),x0,method='Nelder-Mead',options={'xatol':1e-3,'fatol':1e-6,'maxiter':600})
            if best is None or -r.fun>best[0]:best=(-r.fun,r.x,mirror)
    print('mirror',mirror,'best so far',best[0],best[1],best[2])
print('MIGLIORE IoU',best[0],'scala',best[1][0],'rot deg',math.degrees(best[1][1])%360,'tr',best[1][2:],'mirror',best[2])
json.dump({'iou':best[0],'s':best[1][0],'th':best[1][1],'tx':best[1][2],'ty':best[1][3],'mirror':best[2],'gcx':game.centroid.x,'gcy':game.centroid.y},open(''+os.path.dirname(os.path.abspath(__file__))+'/fit_poly.json','w'))
