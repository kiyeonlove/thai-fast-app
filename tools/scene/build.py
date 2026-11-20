"""장면 글 → scN.json, 그림 부품 → scene.js 를 앱(www)과 웹 폴더에 써요.
사용: python3 build.py [웹폴더]"""
import json, os, sys, subprocess, glob
D = os.path.dirname(os.path.abspath(__file__))
outs = [os.path.join(D, "..", "..", "www")] + sys.argv[1:]
# 그림 부품: 검사 함수는 빼고 줄여서
src = open(f"{D}/lib.js", encoding="utf-8").read()
src = src[:src.index("/* 검사:")]
tmp = "/tmp/scene_src.js"; open(tmp, "w").write(src)
mini = subprocess.run(["npx", "-y", "terser", tmp, "-c", "-m"], capture_output=True, text=True, check=True).stdout
n = 0
for f in sorted(glob.glob(f"{D}/specs/*.txt"), key=lambda p: int(os.path.basename(p).split(".")[0])):
    c = os.path.basename(f).split(".")[0]
    m = {}
    for line in open(f, encoding="utf-8"):
        if "\t" in line: th, sp = line.rstrip("\n").split("\t", 1); m[th] = sp
    for o in outs: json.dump(m, open(f"{o}/sc{c}.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    n += len(m)
for o in outs: open(f"{o}/scene.js", "w", encoding="utf-8").write(mini)
print("scenes", n, "scene.js", len(mini), "->", outs)
