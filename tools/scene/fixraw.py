# python3 fixraw.py N idx "spec"  : raw 파일 idx 위치에 줄 끼워 넣고 저장
import sys,json
c,i,sp=sys.argv[1],int(sys.argv[2]),sys.argv[3]
S=open(f'specs/{c}.raw').read().split('\n'); S.insert(i,sp)
ex=json.load(open(f'../../www/exc{c}.json')); ks=list(ex)
assert len(S)==len(ks),len(S)
open(f'specs/{c}.txt','w').write('\n'.join(f'{k}\t{s}' for k,s in zip(ks,S))+'\n'); print('ok')
