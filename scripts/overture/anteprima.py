import json,math
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as P
from matplotlib.collections import LineCollection
CLAT,CLON=41.9205,12.5040;KLAT=111320.0;KLON=111320.0*math.cos(math.radians(CLAT))
def pm(lon,lat):return ((lon-CLON)*KLON,(lat-CLAT)*KLAT)
L=lambda n:json.load(open(f"out/{n}.geojson"))["features"]
E_=L("edifici");S=L("strade");U=L("uso_suolo");A=L("acqua")
sites={"Viale Romania 32":(12.4933,41.9250),"Viale Pola 12":(12.5119,41.9183),"Via Parenzo 11":(12.5131,41.9218)}
W={"motorway":3.2,"trunk":3,"primary":2.6,"secondary":2.2,"tertiary":1.8,"residential":1.2,"living_street":1.1,"service":0.9,"footway":0.5,"pedestrian":0.8,"path":0.4,"steps":0.4,"track":0.5,"cycleway":0.5,"unclassified":1.0}
def draw(ax,cx,cy,r):
    ax.set_facecolor("#e8e4da");ax.set_xlim(cx-r,cx+r);ax.set_ylim(cy-r,cy+r);ax.set_aspect("equal");ax.set_xticks([]);ax.set_yticks([])
    for f in U:
        if f["properties"]["classe"] in("park","grass","garden","recreation_ground","forest","wood","meadow") or f["properties"]["classe"] in("park","grass"):
            g=f["geometry"]
            if g["type"]=="Polygon":
                ax.add_patch(P(g["coordinates"][0],closed=True,fc="#c9dcb0",ec="none",zorder=1))
    for f in A:
        g=f["geometry"]
        if g["type"]=="Polygon":ax.add_patch(P(g["coordinates"][0],closed=True,fc="#a9cfe0",ec="none",zorder=1))
    lines=[];wid=[]
    for f in S:
        g=f["geometry"];c=f["properties"]["classe"]
        if g["type"]=="LineString":lines.append(g["coordinates"]);wid.append(W.get(c,0.8))
        elif g["type"]=="MultiLineString":
            for l in g["coordinates"]:lines.append(l);wid.append(W.get(c,0.8))
    ax.add_collection(LineCollection(lines,colors="#fbf8ef",linewidths=wid,zorder=2,capstyle="round"))
    for f in E_:
        g=f["geometry"]
        if g["type"]=="Polygon":ax.add_patch(P(g["coordinates"][0],closed=True,fc="#b59d86",ec="#6b5a4b",lw=0.5,zorder=3))
        elif g["type"]=="MultiPolygon":
            for poly in g["coordinates"]:ax.add_patch(P(poly[0],closed=True,fc="#b59d86",ec="#6b5a4b",lw=0.5,zorder=3))
    for name,(lo,la) in sites.items():
        x,y=pm(lo,la)
        if abs(x-cx)<r and abs(y-cy)<r:ax.plot(x,y,"o",color="#c0392b",ms=6,zorder=5);ax.text(x+8,y+8,name,fontsize=8,zorder=6,color="#222")
fig,axs=plt.subplots(2,2,figsize=(13,13))
draw(axs[0,0],0,0,1500)
axs[0,0].set_title("Area completa (±1,5 km) — edifici, strade, verde, acqua")
for ax,(n,(lo,la)) in zip([axs[0,1],axs[1,0],axs[1,1]],sites.items()):
    x,y=pm(lo,la);draw(ax,x,y,220);ax.set_title(n+" (±220 m)")
fig.tight_layout();fig.savefig("anteprima.png",dpi=110)
print("ok")
