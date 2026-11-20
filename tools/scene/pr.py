import json,sys
for c in sys.argv[1:]:
    d=json.load(open(f'../../www/exc{c}.json'))
    print('##',c)
    for i,(k,v) in enumerate(d.items()): print(i,k,'|',v['k'])
