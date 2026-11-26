import json,fsspec,pyarrow.parquet as pq,time,sys
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
K=json.load(open("keys_all.json"))
X0,X1,Y0,Y1=12.478,12.522,41.912,41.948
R="https://overturemaps-us-west-2.s3.amazonaws.com/"
def work(args):
    k,cols=args
    fs=fsspec.filesystem("https")
    try:
        with fs.open(R+k,"rb") as f:
            pf=pq.ParquetFile(f);md=pf.metadata;hit=[]
            for g in range(md.num_row_groups):
                rg=md.row_group(g);st={}
                for i in range(rg.num_columns):
                    c=rg.column(i);p=c.path_in_schema
                    if p.startswith("bbox.") and c.statistics is not None:st[p]=(c.statistics.min,c.statistics.max)
                if len(st)<4 or (st["bbox.xmax"][1]>=X0 and st["bbox.xmin"][0]<=X1 and st["bbox.ymax"][1]>=Y0 and st["bbox.ymin"][0]<=Y1):hit.append(g)
            if not hit:return k,0,None
            df=pf.read_row_groups(hit,columns=cols+["bbox"]).to_pandas()
            b=pd.json_normalize(df["bbox"])
            m=(b["xmax"]>=X0)&(b["xmin"]<=X1)&(b["ymax"]>=Y0)&(b["ymin"]<=Y1)
            return k,int(m.sum()),df[m.values].drop(columns=["bbox"])
    except Exception as e:return k,-1,str(e)[:200]
for theme,cols in [("theme=transportation/type=segment/",["id","names","class","subtype","road_flags","width_rules","geometry","subclass","sources"]),
                   ("theme=places/type=place/",["id","names","categories","confidence","geometry","addresses","sources"]),
                   ("theme=base/type=land_use/",["id","names","class","subtype","geometry","sources"]),
                   ("theme=base/type=water/",["id","names","class","subtype","geometry","sources"])]:
    keys=[k for k in K[theme]]
    parts=[];errs=0;t0=time.time()
    with ThreadPoolExecutor(16) as ex:
        for k,n,df in ex.map(work,[(k,cols) for k in keys]):
            if n<0:errs+=1
            elif n>0:parts.append(df)
    out=pd.concat(parts,ignore_index=True) if parts else pd.DataFrame()
    name=theme.split("/")[-2]+"_"+theme.split("/")[-1].rstrip("/").replace("=","-")
    out.to_parquet(f"area_{name}.parquet",index=False)
    print(theme,"rows",len(out),"errors",errs,"secs",round(time.time()-t0),flush=True)
