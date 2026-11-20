"""태블릿 가로 화면(갤럭시 탭 A7 등)에서만 카드를 좌우 2단·큰 글씨로.  사용: python3 patch_tablet.py index.html"""
import sys
path = sys.argv[1]; s = open(path, encoding="utf-8").read()
if "/* 태블릿 가로 */" in s: print("already"); sys.exit(0)
Q = "(orientation:landscape) and (min-width:960px) and (min-height:540px)"
CSS = """/* 태블릿 가로 */
@media %s{
html{font-size:20px}body{font-size:22px}
#app{max-width:1240px;margin:0 auto;padding:10px 20px 0}
#app:has(> .flash){display:grid;grid-template-columns:1fr 330px;column-gap:16px}
#app:has(> .flash)>*{grid-column:1/-1}
.ptop,.ptop .back{font-size:1.15rem}
.flash{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);column-gap:30px;align-items:start;padding:22px 30px 18px;min-height:0}
.flash>*{grid-column:1;justify-self:center}
.flash .cat,.flash .star{justify-self:auto}.flash .cat{font-size:1rem}
.fth,.flash.fit1 .fth{font-size:4.4rem;line-height:1.25;margin-top:26px}
.fsy .sy b{font-size:1.55rem}.fsy .sy i,.fsy .sy em,.flash.fit2 .fsy .sy i{font-size:1rem;display:inline}
.fkr,.fko,.flash.fit1 .fkr,.flash.fit1 .fko{font-size:2.1rem;line-height:1.4}
.part .pt,.flash.fit2 .part .pt{font-size:1.4rem}.part .pk,.part .pm{font-size:1.05rem}.part{padding:4px 12px}
.exs{justify-self:stretch;grid-column:2;grid-row:1/span 12;margin:0;padding:4px 0 0 30px;border-top:0;border-left:2px dashed #ddd2bf;align-self:stretch;display:flex;flex-direction:column;justify-content:center}
.exs .el{font-size:1rem;align-self:center}
.eimg,.flash.fit1 .eimg,.flash.fit2 .eimg,.flash.fit3 .eimg{width:100%%;margin:6px 0 10px}
.exs .ex,.flash.fit3 .exs .ex{font-size:2.1rem;line-height:1.45}
.exs .ep,.flash.fit2 .exs .ep{font-size:1.15rem;line-height:1.5}
.exs .ek{font-size:1.6rem;line-height:1.5}
.exs .eb{margin-top:10px}.exs .eb button,.flash.fit3 .exs .eb button{font-size:1.15rem;padding:6px 22px}
.hph{display:none}
.ctrl{grid-column:1!important;margin-top:12px}
.ctrl button,.ctrl .play{font-size:1.7rem;padding:14px 0}
.know{grid-column:2!important;margin-top:12px;font-size:1.3rem;align-self:stretch}
}
""" % Q
def rep(old, new):
    global s
    if s.count(old) != 1: raise SystemExit(f"not found x{s.count(old)}: {old[:60]!r}")
    s = s.replace(old, new)
rep("@media (prefers-reduced-motion", CSS + "@media (prefers-reduced-motion")
# 큰 단어 맞춤: 태블릿 가로에선 왼쪽 칸 폭 기준
rep("const box = e.parentElement.clientWidth - 20;",
    'const box = (matchMedia("%s").matches ? e.parentElement.clientWidth * 0.44 : e.parentElement.clientWidth) - 20;' % Q)
open(path, "w", encoding="utf-8").write(s); print("patched", path)
