import pandas as pd, json, math
from shapely import wkb
from shapely.geometry import mapping
CLAT,CLON=41.9205,12.5040          # centro dell'area (tra le tre sedi)
KLAT=111320.0; KLON=111320.0*math.cos(math.radians(CLAT))
def proj(x,y): return ((x-CLON)*KLON, (y-CLAT)*KLAT)
def geo_m(g):
    s=wkb.loads(g)
    def tr(coords): return [[round(a,2),round(b,2)] for a,b in (proj(x,y) for x,y in coords)]
    t=s.geom_type
    if t=="Polygon": return {"type":"Polygon","coordinates":[tr(r) for r in [s.exterior.coords]+[i.coords for i in s.interiors]]}
    if t=="MultiPolygon": return {"type":"MultiPolygon","coordinates":[[tr(r) for r in [p.exterior.coords]+[i.coords for i in p.interiors]] for p in s.geoms]}
    if t=="LineString": return {"type":"LineString","coordinates":tr(s.coords)}
    if t=="MultiLineString": return {"type":"MultiLineString","coordinates":[tr(l.coords) for l in s.geoms]}
    if t=="Point": return {"type":"Point","coordinates":[round(v,2) for v in proj(s.x,s.y)]}
    return None
def nome(x):
    try:return x.get("primary")
    except Exception:return None
feat={}
b=pd.read_parquet("parioli_buildings.parquet")
feat["edifici"]=[]
for _,r in b.iterrows():
    g=geo_m(r.geometry)
    if g: feat["edifici"].append({"type":"Feature","geometry":g,"properties":{"id":r.id,"nome":nome(r.names),"altezza_m":None if pd.isna(r.height) else float(r.height),"piani":None if pd.isna(r.num_floors) else int(r.num_floors),"tipo":r.subtype,"classe":r["class"]}})
s=pd.read_parquet("area_type=segment_.parquet")
feat["strade"]=[]
for _,r in s.iterrows():
    g=geo_m(r.geometry)
    if not g: continue
    nm=r.names.get("primary") if hasattr(r.names,"get") and r.names else None
    feat["strade"].append({"type":"Feature","geometry":g,"properties":{"id":r.id,"nome":nm,"classe":r["class"],"sottoclasse":r.subclass}})
u=pd.read_parquet("area_type=land_use_.parquet")
feat["uso_suolo"]=[{"type":"Feature","geometry":geo_m(r.geometry),"properties":{"id":r.id,"nome":nome(r.names),"classe":r["class"],"tipo":r.subtype}} for _,r in u.iterrows() if geo_m(r.geometry)]
w=pd.read_parquet("area_type=water_.parquet")
feat["acqua"]=[{"type":"Feature","geometry":geo_m(r.geometry),"properties":{"id":r.id,"nome":nome(r.names),"classe":r["class"]}} for _,r in w.iterrows() if geo_m(r.geometry)]
p=pd.read_parquet("area_type=place_.parquet")
feat["luoghi"]=[]
for _,r in p.iterrows():
    nm=nome(r.names)
    if not nm:continue
    a=r.addresses[0].get("freeform") if r.addresses is not None and len(r.addresses) else None
    feat["luoghi"].append({"type":"Feature","geometry":geo_m(r.geometry),"properties":{"id":r.id,"nome":nm,"indirizzo":a,"confidenza":float(r.confidence) if r.confidence==r.confidence else None}})
import os
os.makedirs("out",exist_ok=True)
for k,v in feat.items():
    json.dump({"type":"FeatureCollection","features":v,"meta":{"centro":[CLAT,CLON],"unita":"metri (x est, y nord)","sorgente":"Overture Maps Foundation, release 2026-11-18.0"}},open(f"out/{k}.geojson","w"),ensure_ascii=False)
    print(k,len(v))
