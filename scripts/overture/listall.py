import requests,re,json,sys
base="https://overturemaps-us-west-2.s3.amazonaws.com/"
R="release/2026-11-18.0/"
out={}
for pre in ["theme=transportation/type=segment/","theme=places/type=place/","theme=base/type=land_use/","theme=base/type=water/"]:
    keys=[];tok=None
    while True:
        p={"list-type":2,"prefix":R+pre,"max-keys":1000}
        if tok:p["continuation-token"]=tok
        r=requests.get(base,params=p,timeout=60);r.raise_for_status()
        keys+=re.findall(r"<Key>([^<]+)</Key>",r.text)
        m=re.search(r"<NextContinuationToken>([^<]+)</NextContinuationToken>",r.text)
        if not m:break
        tok=m.group(1)
    out[pre]=keys;print(pre,len(keys),flush=True)
json.dump(out,open("keys_all.json","w"))
