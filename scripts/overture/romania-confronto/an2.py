import sys
import os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from lib import *
from shapely.ops import unary_union
realpoly,ed=load_real()
E={f['properties']['id'][:6]:g for f,g in ed}
G=load_game()
O={o['uid']:o for o in G['objs']}
B=[[22,8],[26,11],[32,12],[41,14],[48,16],[55,18],[59,23],[63,27],[68,34],[73,41],[78,46],[80,49],[82,52],[85,57],[83,62],[79,70],[77,76],[73,83],[70,90],[61,87],[49,83],[38,79],[28,78],[26,75],[23,75],[20,75],[8,72],[6,69],[7,60],[7,55],[7,49],[9,41],[13,29],[17,18]]
gp=Polygon([g2r(x,y) for x,y in B])
print('IoU perimetro',gp.intersection(realpoly).area/gp.union(realpoly).area)
# distanza bordo-bordo
from shapely.geometry import LineString
a=LineString(list(gp.exterior.coords));b=LineString(list(realpoly.exterior.coords))
d1=[b.distance(Point(p)) for p in [a.interpolate(t,normalized=True) for t in np.linspace(0,1,400)]]
d2=[a.distance(Point(p)) for p in [b.interpolate(t,normalized=True) for t in np.linspace(0,1,400)]]
print('distanza bordo gioco->reale medio %.1f m, mediana %.1f, 90p %.1f, max %.1f'%(np.mean(d1),np.median(d1),np.percentile(d1,90),max(d1)))
print('distanza bordo reale->gioco medio %.1f m, max %.1f'%(np.mean(d2),max(d2)))
print('area gioco %.0f m2 reale %.0f m2'%(gp.area,realpoly.area))
def rect_game(o):return rect_real(o)
pairs=[
 ('Edificio principale (4 corpi)',['main-front','main-east','main-spine','main-north'],'45edbf'),
 ('The Dome (nel gioco "The Dome 2")',['dome-building'],'3772b6'),
 ('Radio Luiss (etichetta del gioco)',['radio-building'],'451b66'),
 ('Corpo aule e servizi',['services-building'],'4d70f6'),
 ('Bar del campus',['bar-building'],'1051c1'),
 ('Serra / Padiglione ovest',['polivalente'],'06a4b9'),
 ('Copertura prese d\'aria (vecchio campo)',['sport-court'],'f01029'),
 ('LUISS Shop (ex guardiola)',['main-gatehouse'],'4d7fc9'),
]
rows=[]
for name,uids,rid in pairs:
    gpoly=unary_union([rect_game(O[u]) for u in uids]);rp=E[rid]
    gc=gpoly.centroid;rc=rp.centroid
    off=math.dist((gc.x,gc.y),(rc.x,rc.y))
    iou=gpoly.intersection(rp).area/gpoly.union(rp).area
    gl,gw,ga=rect_dims(gpoly);rl,rw,ra=rect_dims(rp)
    da=(ga-ra+90)%180-90
    gcg=r2g(rc.x,rc.y)
    gtiles=[(O[u]['x'],O[u]['y'],O[u]['w'],O[u]['h']) for u in uids]
    print(f"{name:42s} off {off:5.1f} m ({off/s:4.1f} tess) IoU {iou:.2f} area g {gpoly.area:5.0f} r {rp.area:5.0f} ratio {gpoly.area/rp.area:.2f} dim g {gl:.0f}x{gw:.0f} r {rl:.0f}x{rw:.0f} dAng {da:.0f} | reale in tessere c({gcg[0]:.1f},{gcg[1]:.1f}) dim {rl/s:.1f}x{rw/s:.1f}")
    rows.append((name,uids,rid,gtiles,off,iou,gpoly.area,rp.area,(gl,gw),(rl,rw),da,gcg))
json.dump([[r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9],r[10],r[11]] for r in rows],open(S+'pairs.json','w'))
offs=[r[4] for r in rows if r[0]!='Edificio principale (4 corpi)']
print('RMS offset campione (senza principale): %.1f m, mediana %.1f, max %.1f'%(np.sqrt(np.mean(np.square(offs))),np.median(offs),max(offs)))
# A200, palazzina rosa, guardiola: dentro il principale?
for u in ['chiesa-building','viale-romania-256','viale-romania-255']:
    pr=rect_game(O[u]);print(u,'dentro impronta principale reale:',round(pr.intersection(E['45edbf']).area/pr.area,2),'centro reale',round(pr.centroid.x),round(pr.centroid.y),'distanza dal bordo del principale %.1f m'%E['45edbf'].distance(pr.centroid))
print('Radio POI dentro edificio 4d70f6?',E['4d70f6'].contains(Point(-806,468)),'distanza',E['4d70f6'].distance(Point(-806,468)),' da 451b66',E['451b66'].distance(Point(-806,468)))
print('Language Cafe POI in principale?',E['45edbf'].contains(Point(-841,438)),E['45edbf'].distance(Point(-841,438)))
print('Fondazione Guido Carli POI in Dome reale?',E['3772b6'].contains(Point(-811,413)))
print('LFC/Summer POI nel principale?',E['45edbf'].contains(Point(-865,475)))
# anisotropia: scale x,y separata sui centroidi delle coppie
src=np.array([[ (lambda t:(t[0],t[1]))( ( (lambda gp:(gp.centroid.x,gp.centroid.y))(rect_game(O[uids[0]])) ) ) for uids in [r[1]]][0] for r in rows])
# tornello e varchi
for u in ['viale-ingresso-varco','panama-varco','giardino-uscita' if 'giardino-uscita' in O else 'viale-ingresso-start','viale-ingresso-start','giardino-from-ingresso','entry-from-panama','ada-gate','romania-mobility']:
    o=O.get(u)
    if o:
        X,Y=g2r(o['x']+.5,o['y']+.5);print(u,o['x'],o['y'],'-> reale',round(X,1),round(Y,1),'dist da bordo campus reale %.1f m'%realpoly.exterior.distance(Point(X,Y)),'dentro' if realpoly.contains(Point(X,Y)) else 'fuori')
