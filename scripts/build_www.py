# 웹앱 템플릿 + 단어 + 발음(ogg 파일)을 www 폴더로 만듭니다
import json, os, shutil, sys
SRC = '/home/claude/fastapp'; OGG = '/tmp/claude-0/off/ogg'; OUT = '/home/claude/thai-fast-app/www'
W = json.load(open(f'{SRC}/words_uniq.json')); idx = json.load(open('/tmp/claude-0/off/idx.json'))
th2i = {th: i for i, th in idx.items()}
os.makedirs(f'{OUT}/audio', exist_ok=True)
A = {}
for w in W:
    i = th2i[w['th']]; A[w['th']] = int(i)
    dst = f'{OUT}/audio/{i}.ogg'
    if not os.path.exists(dst): shutil.copyfile(f'{OGG}/{i}.ogg', dst)
t = open(f'{SRC}/fast.tpl.html').read()
t = t.replace('__WORDS__', json.dumps(W, ensure_ascii=False)).replace('__GLOSS__', open(f'{SRC}/gloss.json').read())
def R(a, b):
    global t
    assert t.count(a) == 1, a; t = t.replace(a, b)
R('const AUDIO_PARTS = __AUDIO_PARTS__;', 'const AUDIO_PARTS = 0;')
R('let AUDIO = null, audioState = "loading";', 'let AUDIO = ' + json.dumps(A, ensure_ascii=False, separators=(',', ':')) + ', audioState = "ok";')
R('if (!left) { audioState = "none"; return; }', 'if (!left) { return; }')
R('player.src = "data:audio/mpeg;base64," + AUDIO[th];', 'player.src = "audio/" + AUDIO[th] + ".ogg";')
open(f'{OUT}/index.html', 'w').write(t)
print('words', len(W), 'audio files', len(os.listdir(f'{OUT}/audio')), 'index', os.path.getsize(f'{OUT}/index.html') // 1024, 'KB')
