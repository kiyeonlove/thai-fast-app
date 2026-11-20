"""예문 장면 그림을 index.html(앱/웹)에 넣기.  사용: python3 patch_scene.py index.html
- scene.js(그림 부품)는 같은 폴더에 따로 두고 불러와요.
- 장면 글은 scN.json(단어 100개씩)에 있고, 예문 묶음을 부를 때 같이 불러와요."""
import sys
path = sys.argv[1]
s = open(path, encoding="utf-8").read()
if "/* 연상 그림 */" in s:
    print("already patched"); sys.exit(0)

def rep(old, new):
    global s
    n = s.count(old)
    if n != 1: raise SystemExit(f"not found x{n}: {old[:70]!r}")
    s = s.replace(old, new)

CSS = """/* 연상 그림 */
.eimg{width:92%;margin:3px auto 1px}
.eimg svg{display:block;width:100%;height:auto;border:1.5px solid #bbb;border-radius:8px;background:#fff}
/* 그림이 들어가도 재생 버튼까지 한 화면에 — 전체를 조금씩 줄임 */
.flash{padding:20px 10px 10px}
.fth{font-size:2.3rem;line-height:1.3}
.fsy{margin:0}.fsy .sy{line-height:1.18}.fsy .sy b{font-size:.98rem}.fsy .sy i,.fsy .sy em{font-size:.7rem}
.fkr{font-size:1.25rem;line-height:1.4}.fko{font-size:1.2rem;line-height:1.4}
.parts{margin-top:3px}.part{padding:1px 7px;line-height:1.22}.part .pt{font-size:.98rem;line-height:1.28}.part .pk,.part .pm{font-size:.76rem}
.exs{margin-top:6px;padding-top:5px}.exs .el{font-size:.68rem;margin-bottom:1px}
.exs .ex{font-size:1.08rem;line-height:1.4}.exs .ep{font-size:.76rem;line-height:1.4}.exs .ek{font-size:.9rem;line-height:1.4}
.exs .eb{margin-top:3px}.exs .eb button{padding:1px 12px;font-size:.8rem}
.flash.fit1 .fth{font-size:2rem}.flash.fit1 .eimg{width:84%}.flash.fit1 .fkr,.flash.fit1 .fko{font-size:1.12rem}
.flash.fit2 .eimg{width:74%}.flash.fit2 .fsy .sy i{display:none}.flash.fit2 .exs .ep{font-size:.7rem}.flash.fit2 .part .pt{font-size:.88rem}
.flash.fit3 .eimg{width:62%}.flash.fit3 .exs .ex{font-size:.98rem}.flash.fit3 .exs .eb button{padding:0 10px}.flash.fit3{padding-top:18px}
.flash.sp .eimg{display:none}
"""
rep("@media (prefers-reduced-motion", CSS + "@media (prefers-reduced-motion")
# 그림 부품 불러오기
rep("<script>\n", '<script src="scene.js"></script>\n<script>\n')
# 예문 칸에 그림
rep('<span class="el">예문</span>\n', '<span class="el">예문</span>\n    ${scImg(th)}\n')
rep("function exBlock(th){", '''const SCN = {}, SCL = {};
function scImg(th){ const sp = SCN[th]; if (!sp || typeof SC === "undefined") return ""; try { return `<div class="eimg" aria-hidden="true">${SC.render(sp)}</div>`; } catch(e) { return ""; } }
function loadSc(c){ if (c < 0 || c >= EX_CHUNKS) return Promise.resolve(); return SCL[c] ||= (async () => {
  for (let t = 0; t < 3; t++) { try { const r = await fetch(`sc${c}.json`); if (r.ok) { Object.assign(SCN, await r.json()); scRefresh(); return; } if (r.status === 404) return; } catch(e) {} await wait(1500 * (t + 1)); }
  delete SCL[c]; })(); }
function scRefresh(){ const b = typeof app !== "undefined" && app.querySelector("#exs"); if (!b || !b.innerHTML || b.querySelector(".eimg")) return;
  const im = scImg(b.dataset.th); if (!im) return; b.querySelector(".el")?.insertAdjacentHTML("afterend", im); if (typeof fitTh === "function") fitTh(); }
function exBlock(th){''')
rep("  return EXL[c] ||= (async () => {", "  loadSc(c);\n  return EXL[c] ||= (async () => {")
# 한 화면 맞춤
rep('function fitTh(){ const e = app.querySelector(".fth"); if (!e) return; e.style.fontSize = "";',
    '''function fitFlash(){ const f = app.querySelector("#flash"), c = app.querySelector(".ctrl"); if (!f || !c || view !== "play") return;
  f.classList.remove("fit1", "fit2", "fit3");
  for (const k of ["fit1", "fit2", "fit3"]) { if (c.getBoundingClientRect().bottom + scrollY <= innerHeight - 4) break; f.classList.add(k); } }
function fitTh(){ const e = app.querySelector(".fth"); if (!e) return; e.style.fontSize = ""; fitFlash();''')
rep('b.outerHTML = exBlock(b.dataset.th); } }', 'b.outerHTML = exBlock(b.dataset.th); if (typeof fitTh === "function") fitTh(); } }')
open(path, "w", encoding="utf-8").write(s)
print("patched", path)
