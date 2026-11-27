import json,math
import numpy as np
from shapely.geometry import shape,Polygon,box,Point
from shapely import affinity
import os
S=os.path.dirname(os.path.abspath(__file__))+'/'
D='data/mappa/overture/'
F=json.load(open(S+'fit_poly.json'))
s,th,tx,ty,gcx,gcy=F['s'],F['th'],F['tx'],F['ty'],F['gcx'],F['gcy']
c,sn=math.cos(th),math.sin(th)
def g2r(x,y):
    x-=gcx;y=-(y-gcy)
    return (s*(c*x-sn*y)+tx,s*(sn*x+c*y)+ty)
def r2g(X,Y):
    X=(X-tx)/s;Y=(Y-ty)/s
    x=c*X+sn*Y;y=-sn*X+c*Y
    return (x+gcx,-y+gcy)
def rect_real(o):
    return Polygon([g2r(o['x'],o['y']),g2r(o['x']+o['w'],o['y']),g2r(o['x']+o['w'],o['y']+o['h']),g2r(o['x'],o['y']+o['h'])])
def rect_dims(poly):
    r=poly.minimum_rotated_rectangle
    xs=list(r.exterior.coords)
    a=math.dist(xs[0],xs[1]);b=math.dist(xs[1],xs[2])
    ang=math.degrees(math.atan2(xs[1][1]-xs[0][1],xs[1][0]-xs[0][0]))%180 if a>=b else math.degrees(math.atan2(xs[2][1]-xs[1][1],xs[2][0]-xs[1][0]))%180
    return max(a,b),min(a,b),ang
def load_real():
    us=json.load(open(D+'uso_suolo.geojson'))['features']
    camp=[f for f in us if f['properties'].get('nome') and 'LUISS' in f['properties']['nome'] and shape(f['geometry']).centroid.x<-700][0]
    realpoly=shape(camp['geometry'])
    ed=[]
    for f in json.load(open(D+'edifici.geojson'))['features']:
        g=shape(f['geometry'])
        if g.intersects(realpoly.buffer(15)):
            ed.append((f,g))
    return realpoly,ed
def load_game():
    return json.load(open(S+'giardino.json'))
