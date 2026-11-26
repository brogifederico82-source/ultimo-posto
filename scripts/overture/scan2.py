import json,fsspec,pyarrow.parquet as pq,pyarrow as pa,time
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
keys=json.load(open("keys.json"))
X0,X1,Y0,Y1=12.478,12.522,41.912,41.948
COLS=["id","names","height","num_floors","subtype","class","geometry","bbox"]
def work(k):
    fs=fsspec.filesystem("https")
    try:
        with fs.open("https://overturemaps-us-west-2.s3.amazonaws.com/"+k,"rb") as f:
            pf=pq.ParquetFile(f);md=pf.metadata;hit=[]
            for g in range(md.num_row_groups):
                rg=md.row_group(g);st={}
                for i in range(rg.num_columns):
                    c=rg.column(i);p=c.path_in_schema
                    if p.startswith("bbox.") and c.statistics is not None:st[p]=(c.statistics.min,c.statistics.max)
                if len(st)<4 or (st["bbox.xmax"][1]>=X0 and st["bbox.xmin"][0]<=X1 and st["bbox.ymax"][1]>=Y0 and st["bbox.ymin"][0]<=Y1):
                    hit.append(g)
            if not hit:return k,0,None
            df=pf.read_row_groups(hit,columns=COLS).to_pandas()
            b=pd.json_normalize(df["bbox"])
            m=(b["xmax"]>=X0)&(b["xmin"]<=X1)&(b["ymax"]>=Y0)&(b["ymin"]<=Y1)
            df=df[m.values].drop(columns=["bbox"])
            return k,len(df),df
    except Exception as e:return k,-1,str(e)[:200]
parts=[];res=[];t0=time.time()
with ThreadPoolExecutor(16) as ex:
    for i,(k,n,df) in enumerate(ex.map(work,keys)):
        res.append((k[-45:],n))
        if n>0:parts.append(df)
        if i%64==0:print(i,round(time.time()-t0),flush=True)
print("errors",[r for r in res if r[1]<0][:3],"files",sum(1 for r in res if r[1]>0),"rows",sum(max(0,r[1]) for r in res),flush=True)
if parts:
    out=pd.concat(parts,ignore_index=True)
    out.to_parquet("parioli_buildings.parquet",index=False)
    print("saved",len(out),out.columns.tolist(),flush=True)
