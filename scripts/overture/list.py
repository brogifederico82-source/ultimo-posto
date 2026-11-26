import requests,re,json
base="https://overturemaps-us-west-2.s3.amazonaws.com/"
pre="release/2026-11-18.0/theme=buildings/type=building/"
keys=[];tok=None
while True:
    p={"list-type":2,"prefix":pre,"max-keys":1000}
    if tok:p["continuation-token"]=tok
    r=requests.get(base,params=p,timeout=60);r.raise_for_status()
    keys+=re.findall(r"<Key>([^<]+)</Key>",r.text)
    m=re.search(r"<NextContinuationToken>([^<]+)</NextContinuationToken>",r.text)
    if not m:break
    tok=m.group(1)
open("keys.json","w").write(json.dumps(keys))
print(len(keys),keys[:2])
