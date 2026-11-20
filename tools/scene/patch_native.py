"""앱(네이티브 재생) 고침: 예문을 다 불러온 뒤 재생 시작 + 한국어 음성 없음 안내.  사용: python3 patch_native.py index.html"""
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
if "/* 한국어 음성 안내 */" in s: print("already"); sys.exit(0)
def rep(a, b):
    global s
    if s.count(a) != 1: raise SystemExit(f"x{s.count(a)}: {a[:60]!r}")
    s = s.replace(a, b)
rep("""function nativeLoop(){
  ++PL.token; renderPlay(); PL.base = PL.i;""", """async function nativeLoop(){
  const my = ++PL.token; renderPlay();
  // 예문 소리 파일 이름은 예문 묶음에 있어서, 묶음이 다 올 때까지 잠깐 기다렸다 시작해요 (느린 기기 대비)
  if (S.exPlay) { const cs = [...new Set(PL.list.slice(PL.i).map(w => exChunk(w.th)))].filter(c => c >= 0 && c < EX_CHUNKS);
    await Promise.race([Promise.all(cs.map(c => loadExChunk(c))), wait(8000)]);
    if (!PL || my !== PL.token || !PL.playing) return; }
  PL.base = PL.i;""")
rep("""  Player.addListener("paused",""", """  /* 한국어 음성 안내 */
  Player.addListener("tts", d => {
    if (d && d.ko === false && !window.__koWarned) { window.__koWarned = true;
      const m = document.createElement("div"); m.className = "dim";
      m.innerHTML = `<div class="dlg"><p>이 기기에 <b>한국어 음성</b>이 설치되어 있지 않아서 한국어 뜻과 한국어 예문을 소리로 읽을 수 없어요.</p><p style="font-size:.9em">설정 → 일반 → 언어 및 입력 → <b>텍스트 음성 변환(TTS)</b>에서 기본 엔진의 언어를 <b>한국어</b>로 바꾸거나 한국어 음성 데이터를 내려받아 주세요. 태국어 소리와 예문은 그대로 나와요.</p><div class="btns"><button class="btn" id="kook">확인</button></div></div>`;
      document.body.append(m); m.querySelector("#kook").onclick = () => m.remove(); }
  });
  Player.addListener("paused",""")
open(p, "w", encoding="utf-8").write(s); print("patched", p)
