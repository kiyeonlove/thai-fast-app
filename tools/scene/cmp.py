import json,sys
c=sys.argv[1]; a=int(sys.argv[2]); b=int(sys.argv[3])
S=open(f'specs/{c}.raw').read().split('\n'); ex=json.load(open(f'../../www/exc{c}.json'))
for i,(k,v) in enumerate(list(ex.items())[a:b],a): print(i,v['k'][:22],'|',S[i][:60] if i<len(S) else '')
