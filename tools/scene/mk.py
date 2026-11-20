# 사용: python3 mk.py N < specs.txt (100줄, 순서대로)
import json,sys
c=sys.argv[1]
ex=json.load(open(f'../../www/exc{c}.json')); ks=list(ex)
S=[l.strip() for l in sys.stdin.read().strip().split('\n') if l.strip()]
if len(S)!=len(ks): sys.exit(f'count {len(S)} != {len(ks)}')
open(f'specs/{c}.txt','w').write('\n'.join(f'{k}\t{s}' for k,s in zip(ks,S))+'\n')
print('wrote',c,len(S))
