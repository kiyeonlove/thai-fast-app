/* 예문 장면 그림 — 부품을 조립해서 400×120 흑백 선화를 그려요.
   장면 글: "배경; 부품; 부품; …"
   부품: 이름[.변형…][@x[,높이[,크기]]][!][+손에 든 것][=글/그림]
     예) "room; woman.sit.grin@150,0,1+phone; sofa@150; cat.sleep@230,28"
   p@x,y,s:path데이터  (직접 그린 선, 원점=바닥 가운데, 위쪽이 음수)  pg=회색 칠, pk=검정 칠, pw=흰색 칠 */
(function (root) {
const GY = 112, K = "#222", L = "#bbb", GR = "#ddd";
const f = n => Math.round(n * 10) / 10;
const pts = a => a.map(p => f(p[0]) + " " + f(p[1])).join(" L");
const limb = (a, w) => { const d = "M" + pts(a); return `<path d="${d}" fill="none" stroke="${K}" stroke-width="${w + 4.4}"/><path d="${d}" fill="none" stroke="#fff" stroke-width="${w}"/>`; };
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const tx = (x, y, s, size, o) => `<text x="${x}" y="${y}" font-size="${size || 12}" text-anchor="middle" fill="${(o && o.fill) || K}" stroke="none" font-weight="${(o && o.w) || 700}" font-family="Noto Sans Thai,Noto Sans KR,sans-serif">${esc(s)}</text>`;

/* ---------- 사람 ---------- */
const POSE = {
  stand: {a: [[[-13, -62], [-17, -48], [-16, -35]], [[13, -62], [17, -48], [16, -35]]]},
  walk: {a: [[[-13, -62], [-19, -50], [-23, -40]], [[13, -62], [16, -50], [21, -41]]], l: [[[-5, -36], [-10, -18], [-15, 0]], [[5, -36], [8, -18], [13, 0]]]},
  run: {a: [[[-13, -62], [-22, -56], [-27, -64]], [[13, -62], [21, -53], [29, -57]]], l: [[[-5, -36], [-17, -24], [-24, -7]], [[5, -36], [15, -20], [11, 0]]]},
  wave: {a: [[[-13, -62], [-17, -48], [-16, -35]], [[13, -62], [22, -74], [25, -90]]]},
  up: {a: [[[-13, -62], [-22, -76], [-24, -92]], [[13, -62], [22, -76], [24, -92]]]},
  point: {a: [[[-13, -62], [-17, -48], [-16, -35]], [[13, -62], [26, -62], [38, -65]]], h: [40, -66]},
  hold: {a: [[[-13, -62], [-15, -48], [-5, -46]], [[13, -62], [15, -48], [5, -46]]], h: [0, -46]},
  holdr: {a: [[[-13, -62], [-17, -48], [-16, -35]], [[13, -62], [21, -50], [27, -47]]], h: [28, -47]},
  give: {a: [[[-13, -62], [-17, -48], [-16, -35]], [[13, -62], [26, -57], [37, -53]]], h: [39, -53]},
  eat: {a: [[[-13, -62], [-17, -48], [-16, -35]], [[13, -62], [22, -58], [7, -71]]], h: [7, -72]},
  phone: {a: [[[-13, -62], [-17, -48], [-16, -35]], [[13, -62], [21, -66], [13, -80]]], h: [14, -81]},
  think: {a: [[[-13, -62], [-17, -48], [-16, -35]], [[13, -62], [19, -57], [5, -67]]]},
  wai: {a: [[[-13, -62], [-9, -52], [0, -63]], [[13, -62], [9, -52], [0, -63]]]},
  carry: {a: [[[-13, -62], [-17, -50], [-12, -40]], [[13, -62], [17, -50], [12, -40]]], h: [0, -40]},
  push: {a: [[[-13, -62], [2, -58], [18, -56]], [[13, -62], [24, -58], [34, -56]]], h: [36, -56]},
  dance: {a: [[[-13, -62], [-24, -70], [-30, -84]], [[13, -62], [24, -56], [32, -46]]], l: [[[-5, -36], [-8, -18], [-9, 0]], [[5, -36], [16, -24], [18, -12]]]},
  shrug: {a: [[[-13, -62], [-24, -58], [-26, -66]], [[13, -62], [24, -58], [26, -66]]]},
  hips: {a: [[[-13, -62], [-24, -52], [-14, -42]], [[13, -62], [24, -52], [14, -42]]]},
  cover: {a: [[[-13, -62], [-16, -66], [-6, -80]], [[13, -62], [16, -66], [6, -80]]]},
};
const SIT_A = {stand: [[[-13, -62], [-17, -50], [-12, -40]], [[13, -62], [17, -50], [12, -40]]]};
const HAIR = {
  m: `<path d="M-12 -80C-14 -98 14 -98 12 -80C9 -88 3 -90 0 -90C-5 -90 -10 -86 -12 -80Z" fill="${K}"/>`,
  w: `<path d="M-12.5 -79C-15 -97 15 -97 12.5 -79C9 -86 -2 -88 -12.5 -79Z" fill="${K}"/>`,
  wb: `<path d="M-11 -82C-10 -96 10 -96 11 -82C6 -88 -6 -88 -11 -82Z" fill="${K}"/>`,
  g: `<path d="M-12 -80C-14 -98 14 -98 12 -80C8 -86 -8 -86 -12 -80Z" fill="${K}"/><path d="M-12 -82q-8 4 -6 14M12 -82q8 4 6 14" stroke-width="4.5" fill="none"/>`,
  ob: `<path d="M-11 -82C-10 -96 10 -96 11 -82C6 -87 -6 -87 -11 -82Z" fill="${GR}"/><circle cx="0" cy="-95" r="4.5" fill="${GR}"/>`,
  om: `<path d="M-12 -82q-1 -6 3 -6M12 -82q1 -6 -3 -6" fill="none" stroke-width="2"/>`,
  bald: ``,
};
const HATS = {
  cap: `<path d="M-12 -86C-12 -98 12 -98 12 -86Z" fill="${K}"/><path d="M8 -87h12" stroke-width="3"/>`,
  police: `<path d="M-13 -88h26l-3 -8h-20Z" fill="${K}"/><path d="M-14 -87h28" stroke-width="2.6"/>`,
  chef: `<path d="M-10 -88v-6c-8 -2 -6 -12 2 -10c2 -6 14 -6 16 0c8 -2 10 8 2 10v6Z"/>`,
  straw: `<path d="M-22 -86h44M-12 -86c0 -12 24 -12 24 0" fill="#fff"/>`,
  helmet: `<path d="M-14 -84c0 -18 28 -18 28 0Z" fill="${GR}"/><path d="M-16 -84h32" stroke-width="2.6"/>`,
  sun: `<path d="M-20 -86h40M-11 -86c0 -11 22 -11 22 0" fill="${GR}"/>`,
  winter: `<path d="M-13 -84c0 -16 26 -16 26 0Z" fill="${GR}"/><circle cx="0" cy="-99" r="3.5" fill="${GR}"/>`,
};
const TYPE = { // 머리, 옷, 크기, 기본 모자/안경
  man: {h: "m"}, woman: {h: "w", d: 1}, boy: {h: "m", s: .74}, girl: {h: "g", d: 1, s: .74},
  oldman: {h: "om", gl: 1}, oldwoman: {h: "ob", d: 1, gl: 1}, grandpa: {h: "om", gl: 1}, grandma: {h: "ob", d: 1, gl: 1},
  monk: {h: "bald", robe: 1}, police: {h: "m", hat: "police", dark: 1}, doctor: {h: "m", coat: 1, gl: 1}, nurse: {h: "wb", d: 1, coat: 1},
  chef: {h: "m", hat: "chef", coat: 1}, farmer: {h: "m", hat: "straw"}, worker: {h: "m", hat: "helmet"}, student: {h: "m", s: .86, tie: 1},
  teacher: {h: "wb", d: 1, gl: 1}, driver: {h: "m", hat: "cap"}, baby: {h: "bald", s: .5, baby: 1}, soldier: {h: "m", hat: "helmet", dark: 1},
  boss: {h: "om", tie: 1, gl: 1}, guard: {h: "m", hat: "police"}, seller: {h: "wb", d: 1, apron: 1}, kid: {h: "g", d: 1, s: .74},
};
const FACE = {
  smile: `<path d="M-4 -74q4 4 8 0" fill="none" stroke-width="1.8"/>`,
  grin: `<path d="M-5 -75q5 7 10 0Z" stroke-width="1.8"/>`,
  sad: `<path d="M-4 -72q4 -4 8 0" fill="none" stroke-width="1.8"/>`,
  angry: `<path d="M-4 -73h8" stroke-width="1.8"/><path d="M-8 -86l5 2M8 -86l-5 2" stroke-width="2"/>`,
  wow: `<ellipse cx="0" cy="-73" rx="2.6" ry="3.4" stroke-width="1.8"/>`,
  flat: `<path d="M-3.5 -73h7" stroke-width="1.8"/>`,
  sick: `<path d="M-5 -73q2.5 -2 5 0q2.5 2 5 0" fill="none" stroke-width="1.8"/>`,
};
const EYES = { open: `<circle cx="-4.5" cy="-81" r="1.7" fill="${K}" stroke="none"/><circle cx="4.5" cy="-81" r="1.7" fill="${K}" stroke="none"/>`,
  shut: `<path d="M-7 -81q2.5 2 5 0M2 -81q2.5 2 5 0" fill="none" stroke-width="1.6"/>`,
  happy: `<path d="M-7 -80q2.5 -3 5 0M2 -80q2.5 -3 5 0" fill="none" stroke-width="1.6"/>` };
function person(type, mods, held, txt, lift) {
  const T = TYPE[type] || TYPE.man; let pose = "stand", face = "smile", eyes = "open", sit = 0, extra = "", hat = T.hat, gl = T.gl;
  for (const m of mods) {
    if (POSE[m]) pose = m; else if (FACE[m]) face = m;
    else if (m === "sleep") { eyes = "shut"; face = "flat"; extra += zzz(14, -96); }
    else if (m === "happy") { eyes = "happy"; face = "grin"; } else if (m === "cry") { face = "sad"; extra += `<path d="M-5 -78q-2 5 0 7q2 -2 0 -7M5 -78q-2 5 0 7q2 -2 0 -7" fill="#9cd" stroke-width="1"/>`; }
    else if (m === "sweat") extra += `<path d="M14 -92q-3 5 0 7q3 -2 0 -7" fill="#fff" stroke-width="1.4"/>`;
    else if (m === "sit") sit = 1; else if (m === "floor") sit = 2; else if (m === "lie") return lying(T, mods, txt);
    else if (m === "glasses") gl = 1; else if (HATS[m]) hat = m;
    else if (m === "love") extra += heart(16, -96, .7);
  }
  const P = POSE[pose], C = 8, sc = T.s || 1, L = (lift || 0) / sc;
  // 2등신 느낌: 다리 짧게(36→28), 상체를 C만큼 내리고 머리 1.25배
  let legs = (P.l || [[[-6, -36], [-7, -18], [-7, 0]], [[6, -36], [7, -18], [7, 0]]]).map(l => l.map(p => [p[0], p[1] * 28 / 36]));
  let up = C;
  if (sit === 1 && L >= 8) { up = C + 26; legs = [[[-6, -4], [-15, 1], [-12, L]], [[6, -4], [15, 1], [12, L]]]; }
  else if (sit) { up = C + 22; legs = [[[-6, -8], [-19, -4], [3, -2]], [[6, -8], [19, -4], [-3, -2]]]; }
  const arms = P.a.map(l => l.map(p => [p[0], p[1] + up]));
  const g = `<g transform="translate(0 ${up})">`, hg = `<g transform="translate(0 -80) scale(1.25) translate(0 80)">`;
  let s = "";
  if (!T.robe || sit) s += legs.map(l => limb(l, 4.2)).join("") + legs.map(l => `<ellipse cx="${f(l[2][0] + (l[2][0] < 0 ? -1 : 1))}" cy="${f(l[2][1] - 1)}" rx="4.6" ry="2.4" fill="${K}"/>`).join("");
  let body;
  if (T.robe) body = `<path d="M-12 -66Q-16 -66 -16 -60L-18 ${sit ? -34 : -8}H18L16 -60Q16 -66 12 -66Z" fill="${GR}"/><path d="M-10 -64L12 -36" stroke-width="1.6" fill="none"/>`;
  else if (T.d) body = `<path d="M-10 -66Q-14 -66 -14 -61L-19 -30H19L14 -61Q14 -66 10 -66Z" fill="${T.dark ? GR : "#fff"}"/>`;
  else body = `<path d="M-11 -66Q-15 -66 -15 -61L-14 -34H14L15 -61Q15 -66 11 -66Z" fill="${T.dark ? GR : "#fff"}"/>`;
  if (T.coat) body += `<path d="M0 -66V-34M-4 -60l4 4 4 -4" fill="none" stroke-width="1.5"/>`;
  if (T.tie) body += `<path d="M0 -65l-2 10 2 4 2 -4Z" fill="${K}"/>`;
  if (T.apron) body += `<path d="M-9 -54H9V-32H-9Z" fill="${GR}" stroke-width="1.5"/>`;
  let head = `<circle cx="0" cy="-80" r="12"/>` + (HAIR[T.h] || "") + EYES[eyes] + FACE[face];
  if (T.baby) head = `<circle cx="0" cy="-80" r="13"/><path d="M-2 -93q2 -4 4 0" fill="none" stroke-width="1.6"/>` + EYES[eyes] + FACE[face];
  if (gl) head += `<circle cx="-4.5" cy="-81" r="3.6" fill="none" stroke-width="1.3"/><circle cx="4.5" cy="-81" r="3.6" fill="none" stroke-width="1.3"/><path d="M-1 -81h2" stroke-width="1.2"/>`;
  if (hat && HATS[hat]) head += HATS[hat];
  const back = T.h === "w" ? `${g}${hg}<path d="M-13 -80C-17 -99 17 -99 13 -80L15 -64H-15Z" fill="${K}"/></g></g>` : "";
  const hands = arms.map(a => `<circle cx="${f(a[2][0])}" cy="${f(a[2][1])}" r="3.3" stroke-width="1.6"/>`).join("");
  let hs = "";
  if (held) { const h = P.h || [0, -46]; const [hn, hsc] = held.split("*"); hs = `<g transform="translate(${h[0]} ${h[1] + up})">${obj(hn, [], .72 * (+hsc || 1), txt, 1)}</g>`; }
  s = back + s + g + body + hg + head + "</g></g>" + arms.map(a => limb(a, 3.6)).join("") + hands + hs + g + extra + "</g>";
  return sc === 1 ? s : `<g transform="scale(${sc})">${s}</g>`;
}
function lying(T, mods) {
  const sl = mods.includes("sleep") || !mods.includes("awake");
  return `<path d="M-30 -2H34V-14H-30Z" fill="#fff"/><path d="M-20 -14V-4H34" fill="${GR}" stroke-width="1.8"/>` +
    `<circle cx="-34" cy="-12" r="11"/>` + (T.h === "w" || T.h === "g" ? `<path d="M-44 -14c0 -12 14 -14 20 -6c-6 -2 -12 0 -20 6Z" fill="${K}"/>` : `<path d="M-45 -12c0 -10 10 -14 18 -10c-6 0 -12 4 -18 10Z" fill="${K}"/>`) +
    (sl ? `<path d="M-38 -13q2 2 4 0M-31 -13q2 2 4 0" fill="none" stroke-width="1.5"/>` + zzz(-24, -26) : `<circle cx="-36" cy="-13" r="1.5" fill="${K}" stroke="none"/><circle cx="-30" cy="-13" r="1.5" fill="${K}" stroke="none"/>`);
}
const zzz = (x, y) => tx(x, y, "z", 8) + tx(x + 6, y - 6, "z", 10) + tx(x + 13, y - 13, "Z", 12);
const heart = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s || 1})" d="M0 6C-10 -2 -7 -10 0 -5C7 -10 10 -2 0 6Z" fill="${GR}" stroke-width="1.6"/>`;

/* ---------- 사물 (원점 = 바닥 가운데) ---------- */
const O = {
  // 집·가구
  table: `<path d="M-34 -36H34M-30 -36V0M30 -36V0" fill="none" stroke-width="3"/><rect x="-36" y="-39" width="72" height="5" rx="2"/>`,
  desk: `<rect x="-38" y="-40" width="76" height="6" rx="2"/><path d="M-34 -34V0M34 -34V0" fill="none" stroke-width="3"/><rect x="14" y="-34" width="18" height="22"/>`,
  ctable: `<rect x="-32" y="-22" width="64" height="5" rx="2"/><path d="M-26 -17V0M26 -17V0" fill="none" stroke-width="3"/>`,
  chair: `<path d="M-16 -24V-62H16V-24" fill="none" stroke-width="3"/><path d="M-16 -50H16" stroke-width="2"/><rect x="-19" y="-27" width="38" height="5" rx="2"/><path d="M-16 -22V0M16 -22V0" fill="none" stroke-width="3"/>`,
  schair: `<path d="M-10 -24H12M-8 -24V0M10 -24V0M-10 -24V-52" fill="none" stroke-width="3"/>`,
  stool: `<rect x="-12" y="-26" width="24" height="5" rx="2"/><path d="M-9 -21L-11 0M9 -21L11 0" fill="none" stroke-width="3"/>`,
  sofa: `<rect x="-48" y="-50" width="96" height="30" rx="9"/><rect x="-56" y="-32" width="112" height="24" rx="6"/><rect x="-62" y="-42" width="16" height="36" rx="7"/><rect x="46" y="-42" width="16" height="36" rx="7"/><path d="M-54 -6v6M54 -6v6" stroke-width="3"/>`,
  bed: `<rect x="-60" y="-30" width="120" height="16" rx="4"/><path d="M-60 -30V-56M-60 -14V0M60 -14V0" fill="none" stroke-width="3"/><rect x="-56" y="-40" width="26" height="10" rx="4" fill="${GR}"/><path d="M-26 -30h82v-8h-82z" fill="${GR}" stroke-width="1.8"/>`,
  rchair: `<path d="M-14 -26H14M-12 -26V-62M-16 4Q0 -6 16 4M-10 -26L-12 0M10 -26L12 0" fill="none" stroke-width="3"/>`,
  mchair: `<path d="M-16 -60Q-20 -30 -14 -24H18Q24 -24 22 -10H-16V-60Z" fill="${GR}"/><path d="M-16 -10V0M20 -10V0" stroke-width="3"/>`,
  cab: `<rect x="-26" y="-70" width="52" height="70" rx="2"/><path d="M0 -70V0M-4 -36v4M4 -36v4" fill="none"/>`,
  shoecab: `<rect x="-28" y="-56" width="56" height="56" rx="2"/><path d="M-28 -38H28M-28 -20H28" fill="none" stroke-width="1.8"/><path d="M-22 -40h10v-4h-10zM-6 -40h10v-4h-10zM10 -40h12v-4h-12zM-22 -22h10v-4h-10zM-6 -22h12v-4h-12zM10 -22h10v-4h-10z" fill="${K}" stroke-width="1"/>`,
  shelf: `<rect x="-30" y="-80" width="60" height="80" rx="2"/><path d="M-30 -54H30M-30 -28H30" fill="none" stroke-width="2"/><path d="M-24 -56v-16M-19 -56v-18M-14 -56v-14M-6 -56v-17M10 -30v-16M15 -30v-18M20 -30v-14" stroke-width="3.2"/>`,
  wshelf: `<path d="M-28 0H28M-20 0V6M20 0V6" stroke-width="3"/>`,
  fridge: `<rect x="-22" y="-92" width="44" height="92" rx="5"/><path d="M-22 -60H22M14 -84V-70M14 -52V-36" fill="none"/>`,
  tv: `<rect x="-34" y="-50" width="68" height="40" rx="3"/><rect x="-30" y="-46" width="60" height="32" fill="${GR}" stroke-width="1.4"/><path d="M-10 -10H10L6 0H-6Z" fill="#fff"/>`,
  tvstand: `<rect x="-44" y="-20" width="88" height="20" rx="2"/><path d="M-14 -10h28" stroke-width="1.8"/>`,
  lamp: `<path d="M-12 -70H12L8 -86H-8Z" fill="${GR}"/><path d="M0 -70V0M-10 0H10" fill="none" stroke-width="3"/>`,
  dlamp: `<path d="M-14 0H14M0 0V-26L14 -40" fill="none" stroke-width="3"/><path d="M8 -46L24 -36L18 -30Z" fill="${GR}"/>`,
  window: `<rect x="-26" y="-60" width="52" height="46" rx="2"/><path d="M0 -60V-14M-26 -37H26" fill="none" stroke-width="1.8"/>`,
  curtain: `<path d="M-32 -96H32" stroke-width="3"/><path d="M-30 -94q4 30 0 84h12q-4 -54 0 -84ZM30 -94q-4 30 0 84h-12q4 -54 0 -84Z" fill="${GR}"/>`,
  door: `<rect x="-20" y="-78" width="40" height="78" rx="2"/><circle cx="12" cy="-38" r="2.6" fill="${K}"/>`,
  mirror: `<rect x="-14" y="-90" width="28" height="86" rx="12"/><rect x="-10" y="-85" width="20" height="76" rx="9" fill="${GR}" stroke-width="1"/><path d="M-14 -4l-4 4M14 -4l4 4" stroke-width="2.6"/>`,
  rug: `<ellipse cx="0" cy="-2" rx="44" ry="5" fill="${GR}"/>`,
  mat: `<rect x="-22" y="-4" width="44" height="5" rx="2" fill="${GR}"/>`,
  cushion: `<path d="M-12 -4Q-14 -24 0 -22Q14 -24 12 -4Q0 -1 -12 -4Z" fill="${GR}"/>`,
  pillow: `<rect x="-16" y="-10" width="32" height="10" rx="5" fill="${GR}"/>`,
  blanket: `<path d="M-20 0V-20H20V0" fill="${GR}"/>`,
  box: `<rect x="-16" y="-24" width="32" height="24" fill="#e8d9b8"/><path d="M-16 -16H16M0 -24V-16" fill="none" stroke-width="1.6"/>`,
  parcel: `<rect x="-18" y="-26" width="36" height="26"/><path d="M-18 -18H18M-6 -26V-18M6 -26V-18" fill="none" stroke-width="1.6"/><rect x="-14" y="-12" width="14" height="7" fill="${GR}" stroke-width="1"/>`,
  basket: `<path d="M-18 -18H18L14 0H-14Z" fill="${GR}"/><path d="M-16 -10H16M-8 -18V0M2 -18V0M10 -18V0" fill="none" stroke-width="1.2"/>`,
  bin: `<path d="M-12 -30H12L9 0H-9Z"/><path d="M-14 -32H14M-4 -24V-6M4 -24V-6" fill="none" stroke-width="1.8"/>`,
  plant: `<path d="M-10 -18H10L7 0H-7Z"/><path d="M0 -18c-2 -14 -12 -20 -18 -20c4 8 8 16 18 20M0 -18c2 -16 10 -24 18 -24c-4 10 -8 18 -18 24M0 -18c0 -12 0 -22 2 -30c3 10 2 20 -2 30" fill="${GR}" stroke-width="1.8"/>`,
  vase: `<path d="M-6 0Q-12 -12 -5 -22V-26H5V-22Q12 -12 6 0Z"/><path d="M0 -26V-40M-3 -26L-9 -38M3 -26L9 -37" fill="none" stroke-width="1.6"/><circle cx="0" cy="-43" r="4" fill="${GR}"/><circle cx="-10" cy="-41" r="3.5" fill="${GR}"/><circle cx="10" cy="-40" r="3.5" fill="${GR}"/>`,
  flower: `<path d="M0 0V-18" stroke-width="2"/><circle cx="0" cy="-22" r="4" fill="${GR}"/><circle cx="-5" cy="-22" r="3" /><circle cx="5" cy="-22" r="3"/><circle cx="0" cy="-27" r="3"/><circle cx="0" cy="-22" r="2.5" fill="${GR}"/>`,
  frame: `<rect x="-16" y="-24" width="32" height="24" rx="1"/><rect x="-12" y="-20" width="24" height="16" fill="${GR}" stroke-width="1"/><circle cx="-4" cy="-13" r="2.5" fill="#fff" stroke-width="1"/><circle cx="4" cy="-13" r="2.5" fill="#fff" stroke-width="1"/>`,
  picture: `<rect x="-18" y="-26" width="36" height="26" rx="1"/><path d="M-14 -4l9 -10 6 6 5 -5 8 9Z" fill="${GR}" stroke-width="1.2"/><circle cx="8" cy="-19" r="3" stroke-width="1.2"/>`,
  clock: `<circle cx="0" cy="-14" r="14"/><path d="M0 -14V-23M0 -14l6 4" fill="none" stroke-width="2"/>`,
  aclock: `<circle cx="0" cy="-13" r="11"/><path d="M0 -13V-20M0 -13l5 2" fill="none" stroke-width="1.8"/><circle cx="-9" cy="-24" r="4" fill="${GR}"/><circle cx="9" cy="-24" r="4" fill="${GR}"/><path d="M-8 -1l-3 2M8 -1l3 2" stroke-width="2"/>`,
  calendar: `<rect x="-16" y="-30" width="32" height="30" rx="2"/><path d="M-16 -22H16" stroke-width="1.8"/><rect x="-16" y="-30" width="32" height="8" fill="${GR}"/><path d="M-10 -15h4M-2 -15h4M6 -15h4M-10 -8h4M-2 -8h4M6 -8h4" stroke-width="2.4"/>`,
  candle: `<rect x="-4" y="-18" width="8" height="18"/><path d="M0 -18v-3" stroke-width="1.4"/><path d="M0 -30q-5 6 0 9q5 -3 0 -9Z" fill="${GR}" stroke-width="1.4"/>`,
  sconce: `<path d="M-10 0H10M0 0V-10M-8 -10H8" stroke-width="3"/><rect x="-3" y="-24" width="6" height="14"/><path d="M0 -32q-4 5 0 7q4 -2 0 -7Z" fill="${GR}" stroke-width="1.4"/>`,
  diffuser: `<path d="M-7 0V-14Q-7 -18 -3 -18V-22H3V-18Q7 -18 7 -14V0Z"/><path d="M-1 -22L-8 -46M0 -22L0 -48M1 -22L8 -46" fill="none" stroke-width="1.4"/>`,
  doll: `<circle cx="0" cy="-22" r="7"/><path d="M-6 -24l-2 -5 4 2M6 -24l2 -5 -4 2" stroke-width="1.6"/><path d="M-7 -15Q-9 0 0 0Q9 0 7 -15Z" fill="${GR}"/><circle cx="-2.5" cy="-23" r="1" fill="${K}"/><circle cx="2.5" cy="-23" r="1" fill="${K}"/>`,
  teddy: `<circle cx="0" cy="-24" r="8"/><circle cx="-6" cy="-31" r="3"/><circle cx="6" cy="-31" r="3"/><ellipse cx="0" cy="-8" rx="9" ry="9"/><circle cx="-2.5" cy="-25" r="1" fill="${K}"/><circle cx="2.5" cy="-25" r="1" fill="${K}"/>`,
  tissue: `<rect x="-12" y="-12" width="24" height="12" fill="${GR}"/><path d="M-3 -12q3 -8 6 0" fill="#fff"/>`,
  tp: `<rect x="-8" y="-16" width="16" height="16" rx="3"/><circle cx="0" cy="-8" r="3" fill="${GR}"/>`,
  socket: `<rect x="-8" y="-12" width="16" height="12" rx="2"/><path d="M-3 -8v4M3 -8v4" stroke-width="2"/>`,
  mtap: `<rect x="-18" y="-6" width="36" height="6" rx="2"/><path d="M-12 -3h2M-4 -3h2M4 -3h2M12 -3h2" stroke-width="2"/><path d="M18 -3q10 0 14 3" fill="none" stroke-width="1.8"/>`,
  cable: `<path d="M-30 0q10 -6 20 0t20 0t20 0" fill="none" stroke-width="2"/>`,
  router: `<rect x="-16" y="-8" width="32" height="8" rx="2"/><path d="M-10 -8V-20M10 -8V-20" stroke-width="2"/><path d="M-4 -18q4 -4 8 0M-7 -21q7 -7 14 0" fill="none" stroke-width="1.5"/>`,
  switch: `<rect x="-6" y="-16" width="12" height="16" rx="2"/><rect x="-2" y="-12" width="4" height="7" fill="${K}" stroke="none"/>`,
  bulb: `<path d="M-6 -8Q-12 -16 -8 -24Q0 -32 8 -24Q12 -16 6 -8Z" fill="#fff"/><path d="M-4 -8V-2H4V-8" fill="${GR}" stroke-width="1.6"/>`,
  clamp: `<path d="M0 -40V-26" stroke-width="2"/><path d="M-14 -12Q0 -32 14 -12Z" fill="${GR}"/>`,
  fan: `<circle cx="0" cy="-46" r="14"/><path d="M0 -46q-8 -10 0 -12q2 6 0 12q10 -2 10 6q-6 0 -10 -6q0 10 -8 8q2 -6 8 -8" fill="${GR}" stroke-width="1.2"/><path d="M0 -32V0M-10 0H10" stroke-width="3"/>`,
  ac: `<rect x="-26" y="-16" width="52" height="16" rx="4"/><path d="M-20 -4H20" stroke-width="1.6"/><path d="M-16 4q2 4 0 8M0 4q2 4 0 8M16 4q2 4 0 8" fill="none" stroke-width="1.4" stroke="${L}"/>`,
  remote: `<rect x="-4" y="-18" width="8" height="18" rx="2"/><circle cx="0" cy="-13" r="1.6" fill="${K}"/><path d="M-1.5 -7h3M-1.5 -4h3" stroke-width="1.2"/>`,
  speaker: `<rect x="-10" y="-30" width="20" height="30" rx="2"/><circle cx="0" cy="-10" r="6" fill="${GR}"/><circle cx="0" cy="-23" r="3"/>`,
  heater: `<rect x="-14" y="-34" width="28" height="34" rx="4"/><path d="M-8 -26h16M-8 -20h16M-8 -14h16" stroke-width="1.6"/><path d="M-6 -42q2 -4 0 -6M2 -42q2 -4 0 -6" fill="none" stroke-width="1.4"/>`,
  purifier: `<rect x="-12" y="-40" width="24" height="40" rx="5"/><path d="M-6 -32h12M-6 -28h12M-6 -24h12" stroke-width="1.2"/><circle cx="0" cy="-12" r="3" fill="${GR}"/>`,
  humid: `<path d="M-10 0V-22Q-10 -28 0 -28Q10 -28 10 -22V0Z"/><path d="M-2 -32q-4 -6 0 -10M3 -32q4 -6 0 -12" fill="none" stroke-width="1.4" stroke="${L}"/>`,
  console: `<rect x="-16" y="-12" width="32" height="12" rx="6"/><circle cx="-8" cy="-6" r="2.4" fill="${K}"/><path d="M6 -6h6M9 -9v6" stroke-width="2"/>`,
  // 부엌
  micro: `<rect x="-24" y="-26" width="48" height="26" rx="3"/><rect x="-20" y="-22" width="30" height="18" fill="${GR}" stroke-width="1.4"/><circle cx="17" cy="-16" r="2" fill="${K}"/><circle cx="17" cy="-9" r="2" fill="${K}"/>`,
  oven: `<rect x="-24" y="-46" width="48" height="46" rx="3"/><rect x="-18" y="-32" width="36" height="22" fill="${GR}" stroke-width="1.4"/><path d="M-14 -40h4M-4 -40h4M6 -40h4" stroke-width="2.4"/>`,
  airfryer: `<path d="M-14 0V-30Q-14 -38 0 -38Q14 -38 14 -30V0Z"/><rect x="-10" y="-22" width="20" height="14" rx="2" fill="${GR}" stroke-width="1.4"/>`,
  ricecooker: `<path d="M-16 0V-20H16V0Z"/><path d="M-18 -20Q0 -34 18 -20Z" fill="#fff"/><circle cx="0" cy="-30" r="2.4" fill="${K}"/><rect x="-5" y="-14" width="10" height="5" fill="${GR}" stroke-width="1"/>`,
  waterp: `<rect x="-12" y="-46" width="24" height="46" rx="3"/><rect x="-7" y="-36" width="14" height="10" fill="${GR}" stroke-width="1.2"/><path d="M0 -26v4" stroke-width="2"/>`,
  coffeem: `<path d="M-14 0V-40H14V-30H-6V0Z"/><path d="M-12 0h26" stroke-width="2"/><path d="M2 -20h8l-1 8h-6Z" stroke-width="1.6"/>`,
  kettle: `<path d="M-12 0V-16Q-12 -24 0 -24Q12 -24 12 -16V0Z"/><path d="M12 -18q8 -2 8 -8M-12 -14q-6 0 -6 -6" fill="none" stroke-width="2"/><path d="M-2 -28q-3 -4 0 -8M3 -28q3 -4 0 -8" fill="none" stroke-width="1.3" stroke="${L}"/>`,
  toaster: `<rect x="-16" y="-20" width="32" height="20" rx="4"/><path d="M-8 -20V-30h6v10M2 -20V-32h6v12" fill="#e8d9b8" stroke-width="1.6"/>`,
  blender: `<path d="M-8 -10L-10 -40H10L8 -10Z" fill="#fff"/><path d="M-8 -26H8" stroke-width="1.2"/><rect x="-11" y="-10" width="22" height="10" rx="2"/><path d="M-6 -22h12l-1 10h-10Z" fill="${GR}" stroke="none"/>`,
  dishwasher: `<rect x="-24" y="-46" width="48" height="46" rx="2"/><path d="M-24 -38H24" stroke-width="1.6"/><path d="M-10 -42h20" stroke-width="2.4"/>`,
  stove: `<rect x="-30" y="-8" width="60" height="8" rx="2"/><path d="M-22 -8q8 -6 16 0M6 -8q8 -6 16 0" fill="none" stroke-width="1.6"/><path d="M-14 -12q-3 -4 0 -7q3 3 0 7M14 -12q-3 -4 0 -7q3 3 0 7" fill="${GR}" stroke-width="1.2"/>`,
  hood: `<path d="M-30 0H30L18 -16H-18Z"/><path d="M-8 -16V-40H8V-16" fill="#fff"/>`,
  vfan: `<circle cx="0" cy="-14" r="14"/><circle cx="0" cy="-14" r="10" fill="${GR}" stroke-width="1.2"/><path d="M0 -14L0 -23M0 -14L8 -9M0 -14L-8 -9" stroke-width="2.4"/>`,
  sink: `<path d="M-26 -30H26V0H-26Z"/><path d="M-20 -30q20 12 40 0" fill="${GR}" stroke-width="1.4"/><path d="M10 -30V-42H2" fill="none" stroke-width="2.6"/>`,
  counter: `<rect x="-50" y="-36" width="100" height="36"/><path d="M-50 -30H50M-16 -30V0M18 -30V0" fill="none" stroke-width="1.6"/>`,
  pot: `<path d="M-16 0V-18H16V0Z"/><path d="M-20 -18H20M-16 -12h-5M16 -12h5" stroke-width="2.4"/><path d="M-6 -22q-3 -5 0 -9M4 -22q3 -5 0 -9" fill="none" stroke-width="1.3" stroke="${L}"/>`,
  pan: `<path d="M-16 -8H16Q14 0 0 0Q-14 0 -16 -8Z"/><path d="M16 -6H36" stroke-width="3.4"/>`,
  knife: `<path d="M-14 0H6L14 -5H-14Z" fill="#fff" stroke-width="1.6"/><rect x="-24" y="-4" width="10" height="5" fill="${K}"/>`,
  board: `<rect x="-24" y="-6" width="48" height="6" rx="2" fill="#e8d9b8"/>`,
  // 그릇·음식·음료
  cup: `<path d="M-7 0L-8 -16H8L7 0Z"/><path d="M8 -12q6 0 5 5q-1 4 -6 3" fill="none" stroke-width="1.8"/>`,
  mug: `<path d="M-8 0V-16H8V0Z"/><path d="M8 -12q7 0 6 5q-1 4 -6 3" fill="none" stroke-width="1.8"/><path d="M-2 -20q-3 -4 0 -8M3 -20q3 -4 0 -8" fill="none" stroke-width="1.2" stroke="${L}"/>`,
  glass: `<path d="M-7 0L-8 -20H8L7 0Z"/><path d="M-7 -12H7L6 -1H-6Z" fill="${GR}" stroke="none"/>`,
  bottle: `<path d="M-6 0V-18Q-6 -22 -3 -24V-30H3V-24Q6 -22 6 -18V0Z"/><rect x="-6" y="-16" width="12" height="7" fill="${GR}" stroke-width="1"/>`,
  water: `<path d="M-6 0V-18Q-6 -22 -3 -24V-30H3V-24Q6 -22 6 -18V0Z" fill="#fff"/><path d="M-5 -12H5" stroke-width="1"/>`,
  can: `<rect x="-6" y="-18" width="12" height="18" rx="2"/><rect x="-6" y="-13" width="12" height="7" fill="${GR}" stroke-width="1"/>`,
  bowl: `<path d="M-14 -10H14Q12 0 0 0Q-12 0 -14 -10Z"/>`,
  rice: `<path d="M-14 -10H14Q12 0 0 0Q-12 0 -14 -10Z"/><path d="M-12 -10Q0 -20 12 -10Z" fill="#fff" stroke-width="1.6"/>`,
  noodle: `<path d="M-15 -10H15Q13 0 0 0Q-13 0 -15 -10Z"/><path d="M-10 -10q2 -6 4 0q2 -6 4 0q2 -6 4 0q2 -6 4 0" fill="none" stroke-width="1.3"/><path d="M4 -10L18 -26M7 -10L20 -24" stroke-width="1.6"/>`,
  soup: `<path d="M-15 -10H15Q13 0 0 0Q-13 0 -15 -10Z"/><path d="M-12 -10H12" stroke-width="1"/><path d="M-4 -14q-3 -4 0 -8M4 -14q3 -4 0 -8" fill="none" stroke-width="1.3" stroke="${L}"/>`,
  plate: `<ellipse cx="0" cy="-2" rx="16" ry="3.5"/>`,
  dish: `<ellipse cx="0" cy="-2" rx="16" ry="3.5"/><path d="M-10 -4Q0 -16 10 -4Z" fill="${GR}" stroke-width="1.6"/>`,
  spoon: `<ellipse cx="0" cy="-20" rx="3.5" ry="5"/><path d="M0 -15V0" stroke-width="2"/>`,
  chop: `<path d="M-3 0L-1 -26M3 0L1 -26" stroke-width="1.8"/>`,
  fork: `<path d="M0 0V-16M-3 -16V-24M0 -16V-24M3 -16V-24M-3 -16H3" fill="none" stroke-width="1.6"/>`,
  egg: `<ellipse cx="0" cy="-8" rx="6" ry="8"/>`,
  fegg: `<ellipse cx="0" cy="-2" rx="12" ry="3.5"/><circle cx="0" cy="-4" r="4" fill="${GR}"/>`,
  bread: `<path d="M-14 0V-12Q-16 -22 0 -22Q16 -22 14 -12V0Z" fill="#e8d9b8"/>`,
  cake: `<path d="M-14 0V-14H14V0Z"/><path d="M-14 -14q4 4 7 0q4 4 7 0q4 4 7 0q4 4 7 0" fill="${GR}" stroke-width="1.4"/><path d="M0 -14V-22" stroke-width="2"/><path d="M0 -26q-3 2 0 4q3 -2 0 -4" fill="${GR}" stroke-width="1"/>`,
  icecream: `<path d="M-6 -14L0 0L6 -14Z" fill="#e8d9b8"/><circle cx="0" cy="-18" r="7"/>`,
  apple: `<path d="M0 -14q-10 -6 -10 4q0 10 10 10q10 0 10 -10q0 -10 -10 -4Z"/><path d="M0 -14q0 -4 3 -6" fill="none" stroke-width="1.6"/>`,
  banana: `<path d="M-14 -16Q-12 0 4 0Q14 0 16 -6Q4 -4 -6 -16Z" fill="#fff"/>`,
  mango: `<path d="M-12 -6Q-14 -20 0 -20Q14 -18 12 -6Q8 2 -4 0Q-10 -1 -12 -6Z"/>`,
  durian: `<ellipse cx="0" cy="-12" rx="12" ry="12" fill="${GR}"/><path d="M-12 -12l-4 0M12 -12l4 0M0 -24v-4M-8 -21l-3 -3M8 -21l3 -3M-8 -3l-3 3M8 -3l3 3" stroke-width="1.8"/><path d="M0 -24v-6" stroke-width="2"/>`,
  watermelon: `<path d="M-16 -2Q0 -26 16 -2Z" fill="#fff"/><path d="M-12 -4Q0 -20 12 -4Z" fill="${GR}" stroke-width="1"/>`,
  orange: `<circle cx="0" cy="-9" r="9"/><path d="M0 -18q2 -4 5 -4" fill="none" stroke-width="1.6"/>`,
  grapes: `<circle cx="-4" cy="-18" r="4"/><circle cx="4" cy="-18" r="4"/><circle cx="0" cy="-12" r="4"/><circle cx="-4" cy="-6" r="4"/><circle cx="4" cy="-6" r="4"/><circle cx="0" cy="0" r="3.5"/><path d="M0 -22v-5" stroke-width="1.6"/>`,
  coconut: `<circle cx="0" cy="-12" r="12" fill="${GR}"/><path d="M2 -24V-34" stroke-width="2"/><path d="M-6 -20a8 4 0 0 1 12 0" fill="#fff" stroke-width="1.4"/>`,
  fish: `<path d="M-14 -8Q0 -20 12 -8Q0 4 -14 -8Z"/><path d="M12 -8l8 -6v12Z"/><circle cx="-7" cy="-9" r="1.4" fill="${K}"/>`,
  chicken: `<path d="M-12 -4Q-14 -18 0 -18Q12 -18 10 -4Q0 2 -12 -4Z" fill="#e8d9b8"/><path d="M10 -10l8 -4M10 -7l8 0" stroke-width="2.4"/>`,
  meat: `<path d="M-14 -4Q-16 -16 -2 -18Q14 -18 14 -6Q10 2 -14 -4Z" fill="${GR}"/><path d="M-6 -10q6 -4 12 0" fill="none" stroke-width="1.2"/>`,
  veg: `<path d="M0 0V-12" stroke-width="2"/><path d="M0 -10Q-14 -14 -12 -26Q-2 -24 0 -10Q2 -26 12 -26Q14 -14 0 -10Z" fill="${GR}"/>`,
  chili: `<path d="M-12 -2Q4 -2 10 -14Q8 -18 4 -14Q0 -6 -12 -6Z" fill="${GR}"/><path d="M8 -16l4 -6" stroke-width="1.8"/>`,
  candy: `<ellipse cx="0" cy="-6" rx="7" ry="5"/><path d="M-7 -6l-6 -4v8ZM7 -6l6 -4v8Z" stroke-width="1.4"/>`,
  pizza: `<path d="M-14 -4L0 -26L14 -4Z" fill="#e8d9b8"/><circle cx="0" cy="-12" r="2.5" fill="${GR}" stroke-width="1"/><circle cx="-5" cy="-7" r="2" fill="${GR}" stroke-width="1"/>`,
  // 옷·신발·소지품
  shoe: `<path d="M-14 0V-8Q-14 -12 -6 -12Q0 -8 6 -8Q14 -8 14 -2V0Z"/><path d="M-14 -3H14" stroke-width="1.4"/>`,
  sneaker: `<path d="M-14 0V-9Q-14 -13 -6 -13Q0 -8 8 -8Q15 -7 15 -2V0Z"/><path d="M-14 -3H15M-6 -11l4 3M-2 -12l4 3" fill="none" stroke-width="1.4"/>`,
  heels: `<path d="M-12 -2Q-10 -14 -2 -12Q6 -6 14 -2H-6V0" fill="${K}"/><path d="M-12 -2V4" stroke-width="2.4"/>`,
  slipper: `<path d="M-14 0H14Q14 -4 10 -4H-14Z" fill="${GR}"/><path d="M-4 -4Q0 -12 6 -4" fill="none" stroke-width="2.4"/>`,
  sandal: `<path d="M-14 0H14V-3H-14Z" fill="${K}"/><path d="M-11 -3L-3 -10L5 -3M-3 -3L5 -10L12 -3" fill="none" stroke-width="2.2"/>`,
  boot: `<path d="M-8 0V-26H4V-8Q14 -8 14 -2V0Z" fill="${GR}"/>`,
  hat: `<path d="M-18 -4H18M-10 -4Q-10 -18 0 -18Q10 -18 10 -4" fill="#fff"/>`,
  cap: `<path d="M-10 -4Q-10 -16 0 -16Q10 -16 10 -4Z" fill="${GR}"/><path d="M8 -4H20" stroke-width="3"/>`,
  glove: `<path d="M-8 0V-14l-4 -6q2 -3 5 1V-24q2 -2 4 0v-2q2 -2 4 0v2q2 -2 4 0V0Z" fill="${GR}"/>`,
  scarf: `<path d="M-14 -20Q0 -12 14 -20L14 -14Q0 -6 -14 -14Z" fill="${GR}"/><path d="M6 -12L8 0H14L12 -14" fill="${GR}"/>`,
  mask: `<rect x="-10" y="-10" width="20" height="10" rx="3"/><path d="M-10 -8l-6 -2M10 -8l6 -2M-6 -6h12M-6 -3h12" fill="none" stroke-width="1.2"/>`,
  shirt: `<path d="M-8 -26L-18 -20L-14 -12L-10 -14V0H10V-14L14 -12L18 -20L8 -26Q0 -20 -8 -26Z"/>`,
  tshirt: `<path d="M-8 -26L-18 -20L-14 -12L-10 -14V0H10V-14L14 -12L18 -20L8 -26Q0 -20 -8 -26Z" fill="${GR}"/>`,
  pants: `<path d="M-10 -28H10L12 0H3L0 -16L-3 0H-12Z"/>`,
  skirt: `<path d="M-8 -20H8L16 0H-16Z" fill="${GR}"/>`,
  dress: `<path d="M-6 -30H6L8 -20L16 0H-16L-8 -20Z" fill="${GR}"/>`,
  coat: `<path d="M-8 -34L-18 -26V0H18V-26L8 -34L0 -28Z" fill="${GR}"/><path d="M0 -28V0" stroke-width="1.4"/>`,
  hanger: `<path d="M0 -24v-4q4 0 4 -4" fill="none" stroke-width="1.8"/><path d="M-16 -16L0 -24L16 -16Z" fill="none" stroke-width="2"/>`,
  coatrack: `<path d="M0 0V-80M-12 0H12M0 -74L-10 -82M0 -74L10 -82M0 -64L-10 -70M0 -64L10 -70" fill="none" stroke-width="3"/>`,
  bag: `<path d="M-14 0V-20H14V0Z"/><path d="M-7 -20Q-7 -30 0 -30Q7 -30 7 -20" fill="none" stroke-width="2.4"/>`,
  backpack: `<rect x="-12" y="-30" width="24" height="30" rx="7"/><rect x="-8" y="-16" width="16" height="10" rx="2" fill="${GR}" stroke-width="1.4"/>`,
  purse: `<rect x="-10" y="-12" width="20" height="12" rx="2" fill="${GR}"/><path d="M-10 -8H10" stroke-width="1.2"/>`,
  wallet: `<rect x="-10" y="-14" width="20" height="14" rx="2" fill="${GR}"/><path d="M4 -9h6v5h-6Z" stroke-width="1.2"/>`,
  suitcase: `<rect x="-14" y="-34" width="28" height="32" rx="4"/><path d="M-6 -34V-40H6V-34M-6 -26V-10M6 -26V-10" fill="none" stroke-width="1.8"/><circle cx="-8" cy="-1" r="2.2" fill="${K}"/><circle cx="8" cy="-1" r="2.2" fill="${K}"/>`,
  umbrella: `<path d="M-22 -24Q0 -50 22 -24Q16 -28 11 -24Q6 -28 0 -24Q-6 -28 -11 -24Q-16 -28 -22 -24Z"/><path d="M0 -24V-2q0 3 -4 3q-3 0 -3 -3" fill="none" stroke-width="1.8"/>`,
  cumbrella: `<path d="M0 -40V-4q0 4 -4 4" fill="none" stroke-width="1.8"/><path d="M-4 -34L0 -42L4 -34L2 -10H-2Z" fill="${GR}" stroke-width="1.6"/>`,
  ustand: `<path d="M-10 0V-28H10V0Z"/><path d="M-4 -28V-46M3 -28L6 -44" stroke-width="2"/><path d="M-4 -46q-3 0 -3 3M6 -44q3 0 3 3" fill="none" stroke-width="1.6"/>`,
  key: `<circle cx="-8" cy="-6" r="5"/><path d="M-3 -6H12M8 -6v4M11 -6v3" fill="none" stroke-width="2"/>`,
  keyring: `<circle cx="0" cy="-18" r="5" fill="none" stroke-width="1.8"/><path d="M0 -13V-4M-3 -6l-4 4" stroke-width="1.8"/><path d="M-6 -2q3 3 6 0q-3 -3 -6 0Z" fill="${GR}" stroke-width="1"/>`,
  phone: `<rect x="-6" y="-20" width="12" height="20" rx="2"/><rect x="-4" y="-17" width="8" height="13" fill="${GR}" stroke-width="1"/>`,
  laptop: `<rect x="-16" y="-24" width="32" height="20" rx="2"/><rect x="-13" y="-21" width="26" height="14" fill="${GR}" stroke-width="1"/><path d="M-20 0H20L16 -4H-16Z" fill="#fff"/>`,
  computer: `<rect x="-20" y="-36" width="40" height="28" rx="2"/><rect x="-16" y="-32" width="32" height="20" fill="${GR}" stroke-width="1"/><path d="M-4 -8L-6 0H6L4 -8" fill="#fff"/>`,
  camera: `<rect x="-12" y="-14" width="24" height="14" rx="2"/><circle cx="0" cy="-7" r="4.5" fill="${GR}"/><path d="M-6 -14l2 -4h8l2 4" fill="#fff"/>`,
  glasses: `<circle cx="-7" cy="-5" r="5" fill="none"/><circle cx="7" cy="-5" r="5" fill="none"/><path d="M-2 -5h4" stroke-width="1.6"/>`,
  watch: `<circle cx="0" cy="-8" r="6"/><path d="M-3 -14V-18H3V-14M-3 -2V2H3V-2" fill="none" stroke-width="1.6"/><path d="M0 -8v-3M0 -8h2" stroke-width="1.2"/>`,
  ring: `<circle cx="0" cy="-6" r="6" fill="none" stroke-width="2"/><path d="M-3 -12l3 -4l3 4Z" fill="${GR}" stroke-width="1.2"/>`,
  book: `<path d="M-14 -20L0 -16L14 -20V0L0 4L-14 0Z"/><path d="M0 -16V4" stroke-width="1.6"/>`,
  cbook: `<rect x="-10" y="-26" width="20" height="26" rx="1" fill="${GR}"/><path d="M-6 -26V0" stroke-width="1.4"/>`,
  magazine: `<rect x="-11" y="-28" width="22" height="28" rx="1"/><rect x="-7" y="-24" width="14" height="10" fill="${GR}" stroke-width="1"/><path d="M-7 -10h14M-7 -6h10" stroke-width="1.2"/>`,
  news: `<rect x="-14" y="-22" width="28" height="22" rx="1"/><rect x="-10" y="-18" width="9" height="7" fill="${GR}" stroke-width="1"/><path d="M2 -18h8M2 -14h8M-10 -7h20M-10 -3h20" stroke-width="1.2"/>`,
  paper: `<path d="M-10 0V-26H6L10 -22V0Z"/><path d="M-6 -18h12M-6 -13h12M-6 -8h8" stroke-width="1.2"/>`,
  letter: `<rect x="-14" y="-18" width="28" height="18" rx="1"/><path d="M-14 -18L0 -8L14 -18" fill="none" stroke-width="1.6"/>`,
  pen: `<path d="M-2 0L-4 -4V-28H4V-4Z" fill="#fff"/><path d="M-4 -24H4" stroke-width="1.4"/>`,
  pencil: `<path d="M0 0L-3 -6V-28H3V-6Z" fill="${GR}"/><path d="M-3 -6H3" stroke-width="1.2"/>`,
  notebook: `<rect x="-11" y="-28" width="22" height="28" rx="2"/><path d="M-11 -22h-3M-11 -14h-3M-11 -6h-3M-5 -20h12M-5 -14h12M-5 -8h12" stroke-width="1.4"/>`,
  ticket: `<path d="M-16 -14H16V-10Q12 -7 16 -4V0H-16V-4Q-12 -7 -16 -10Z"/><path d="M6 -14V0" stroke-width="1.2" stroke-dasharray="2 2"/>`,
  card: `<rect x="-14" y="-18" width="28" height="18" rx="2"/><rect x="-14" y="-14" width="28" height="4" fill="${K}"/>`,
  money: `<rect x="-16" y="-14" width="32" height="14" rx="2" fill="${GR}"/><circle cx="0" cy="-7" r="4" fill="#fff" stroke-width="1.2"/>`,
  coin: `<circle cx="0" cy="-7" r="7" fill="${GR}"/><circle cx="0" cy="-7" r="4" fill="none" stroke-width="1"/>`,
  passport: `<rect x="-10" y="-26" width="20" height="26" rx="2" fill="${GR}"/><circle cx="0" cy="-15" r="4" fill="none" stroke-width="1.2"/>`,
  map: `<path d="M-18 0V-22L-6 -26L6 -22L18 -26V-4L6 0L-6 -4Z"/><path d="M-6 -26V-4M6 -22V0" stroke-width="1.2"/>`,
  gift: `<rect x="-14" y="-20" width="28" height="20"/><path d="M0 -20V0M-14 -12H14" stroke-width="2.4"/><path d="M0 -20q-10 -10 -10 -4q0 4 10 4q10 0 10 -4q0 -6 -10 4" fill="none" stroke-width="1.8"/>`,
  ball: `<circle cx="0" cy="-10" r="10"/><path d="M-10 -10Q0 -4 10 -10M0 -20Q-6 -10 0 0" fill="none" stroke-width="1.4"/>`,
  guitar: `<path d="M0 -8q-12 0 -10 -10q2 -6 6 -6q-4 -8 4 -10q8 2 4 10q4 0 6 6q2 10 -10 10Z" fill="#fff"/><circle cx="0" cy="-16" r="3" fill="${K}"/><path d="M0 -34V-52" stroke-width="3"/>`,
  mic: `<rect x="-5" y="-26" width="10" height="14" rx="5" fill="${GR}"/><path d="M0 -12V0" stroke-width="2.4"/>`,
  toothbrush: `<path d="M-2 0V-24" stroke-width="3"/><rect x="-3" y="-30" width="6" height="7" fill="${GR}" stroke-width="1.2"/>`,
  towel: `<path d="M-10 -26H10V0H-10Z" fill="${GR}"/><path d="M-10 -6H10" stroke-width="1.2"/>`,
  soap: `<rect x="-9" y="-8" width="18" height="8" rx="3" fill="${GR}"/>`,
  broom: `<path d="M0 -60V-16" stroke-width="2.6"/><path d="M-8 -16H8L12 0H-12Z" fill="${GR}"/>`,
  bucket: `<path d="M-12 -20H12L9 0H-9Z"/><path d="M-12 -20Q0 -36 12 -20" fill="none" stroke-width="1.6"/>`,
  medicine: `<rect x="-8" y="-20" width="16" height="20" rx="2"/><rect x="-8" y="-24" width="16" height="5" fill="${GR}"/><path d="M0 -14v8M-4 -10h8" stroke-width="2"/>`,
  pill: `<rect x="-9" y="-6" width="18" height="6" rx="3"/><path d="M0 -6V0" stroke-width="1.2"/><rect x="0" y="-6" width="9" height="6" fill="${GR}" stroke="none"/>`,
  thermo: `<rect x="-3" y="-26" width="6" height="20" rx="3"/><circle cx="0" cy="-5" r="5" fill="${GR}"/>`,
  syringe: `<path d="M-14 -4H8V-10H-14Z"/><path d="M8 -7H16M-14 -7H-20M-20 -11V-3" stroke-width="2"/>`,
  // 사람 밖 큰 것: 집·탈것·자연
  house: `<path d="M-30 0V-34H30V0Z"/><path d="M-36 -32L0 -56L36 -32Z" fill="${GR}"/><rect x="-6" y="-20" width="12" height="20"/><rect x="-24" y="-26" width="12" height="10" stroke-width="1.6"/><rect x="12" y="-26" width="12" height="10" stroke-width="1.6"/>`,
  building: `<rect x="-22" y="-90" width="44" height="90"/><path d="M-14 -80h8M6 -80h8M-14 -66h8M6 -66h8M-14 -52h8M6 -52h8M-14 -38h8M6 -38h8" stroke-width="3"/><rect x="-6" y="-16" width="12" height="16"/>`,
  shop: `<rect x="-34" y="-46" width="68" height="46"/><path d="M-38 -46H38L34 -58H-34Z" fill="${GR}"/><path d="M-38 -46q6 6 12 0q6 6 12 0q6 6 12 0q6 6 12 0q6 6 12 0q6 6 14 0" fill="#fff" stroke-width="1.6"/><rect x="-26" y="-32" width="24" height="18" stroke-width="1.6"/><rect x="8" y="-30" width="16" height="30"/>`,
  stall: `<path d="M-34 0V-40M34 0V-40" stroke-width="3"/><path d="M-40 -40H40L32 -54H-32Z" fill="${GR}"/><rect x="-32" y="-22" width="64" height="8"/><path d="M-26 -22q4 -8 8 0M-12 -22q4 -8 8 0M2 -22q4 -8 8 0M16 -22q4 -8 8 0" fill="${GR}" stroke-width="1.4"/>`,
  temple: `<path d="M-40 0V-26H40V0Z"/><path d="M-46 -26L0 -60L46 -26Z" fill="${GR}"/><path d="M-30 -38L0 -76L30 -38" fill="${GR}"/><path d="M-46 -26l-6 -6M46 -26l6 -6M0 -76V-88" fill="none" stroke-width="2.4"/><rect x="-8" y="-20" width="16" height="20"/>`,
  pagoda: `<path d="M-20 0L-14 -20H14L20 0Z"/><path d="M-12 -20Q-10 -40 0 -46Q10 -40 12 -20" fill="${GR}"/><path d="M0 -46V-74" stroke-width="3"/>`,
  buddha: `<path d="M-20 0Q-22 -20 -10 -24H10Q22 -20 20 0Z" fill="${GR}"/><circle cx="0" cy="-32" r="9" fill="${GR}"/><path d="M0 -41v-6" stroke-width="2.4"/><path d="M-4 -32q2 1 4 0M1 -32q2 1 4 0" fill="none" stroke-width="1.2"/>`,
  school: `<path d="M-44 0V-40H44V0Z"/><path d="M-50 -40L0 -58L50 -40Z" fill="${GR}"/><path d="M-34 -30h10v10h-10zM-12 -30h10v10h-10zM10 -30h10v10h-10zM28 -30h10v10h-10z" stroke-width="1.6"/><circle cx="0" cy="-48" r="4" fill="#fff" stroke-width="1.4"/>`,
  hospital: `<rect x="-36" y="-64" width="72" height="64"/><rect x="-10" y="-60" width="20" height="20" fill="${GR}"/><path d="M0 -56v12M-6 -50h12" stroke-width="3"/><path d="M-28 -30h10M-28 -18h10M18 -30h10M18 -18h10" stroke-width="3"/><rect x="-7" y="-14" width="14" height="14"/>`,
  car: `<path d="M-30 -8V-18Q-28 -22 -20 -22L-12 -32H14L22 -22Q30 -22 30 -16V-8Z"/><path d="M-10 -30L-6 -22H18L12 -30Z" fill="${GR}" stroke-width="1.4"/><circle cx="-16" cy="-6" r="6" fill="${K}"/><circle cx="18" cy="-6" r="6" fill="${K}"/><circle cx="-16" cy="-6" r="2" fill="#fff" stroke="none"/><circle cx="18" cy="-6" r="2" fill="#fff" stroke="none"/>`,
  taxi: `<path d="M-30 -8V-18Q-28 -22 -20 -22L-12 -32H14L22 -22Q30 -22 30 -16V-8Z" fill="${GR}"/><rect x="-5" y="-37" width="12" height="5" fill="${K}"/><circle cx="-16" cy="-6" r="6" fill="${K}"/><circle cx="18" cy="-6" r="6" fill="${K}"/>`,
  bus: `<rect x="-44" y="-44" width="88" height="38" rx="5"/><path d="M-38 -38h14v12h-14zM-20 -38h14v12h-14zM-2 -38h14v12h-14zM16 -38h14v12h-14z" fill="${GR}" stroke-width="1.4"/><path d="M34 -38v30" stroke-width="1.6"/><circle cx="-28" cy="-6" r="6" fill="${K}"/><circle cx="26" cy="-6" r="6" fill="${K}"/>`,
  truck: `<rect x="-40" y="-40" width="54" height="32" fill="${GR}"/><path d="M14 -30H30L38 -18V-8H14Z"/><circle cx="-26" cy="-6" r="6" fill="${K}"/><circle cx="26" cy="-6" r="6" fill="${K}"/>`,
  tuktuk: `<path d="M-26 -8V-30Q-26 -38 -18 -38H16L22 -24V-8Z"/><path d="M-30 -40H18" stroke-width="3"/><path d="M-20 -32h14v10h-14z" fill="${GR}" stroke-width="1.2"/><circle cx="-18" cy="-6" r="6" fill="${K}"/><circle cx="16" cy="-6" r="6" fill="${K}"/>`,
  moto: `<circle cx="-18" cy="-8" r="8"/><circle cx="18" cy="-8" r="8"/><path d="M-18 -8L-4 -20H10L18 -8M10 -20L14 -30H20M-10 -22H6" fill="none" stroke-width="3"/>`,
  bike: `<circle cx="-16" cy="-10" r="10" fill="none"/><circle cx="16" cy="-10" r="10" fill="none"/><path d="M-16 -10L-4 -26H10L16 -10M-4 -26L2 -10L10 -26M-6 -30h6M10 -26l-2 -6h6" fill="none" stroke-width="2.4"/>`,
  train: `<rect x="-50" y="-44" width="100" height="36" rx="8"/><path d="M-42 -36h16v12h-16zM-20 -36h16v12h-16zM2 -36h16v12h-16zM24 -36h16v12h-16z" fill="${GR}" stroke-width="1.4"/><path d="M-56 0H56" stroke-width="2.4"/><circle cx="-34" cy="-6" r="4" fill="${K}"/><circle cx="34" cy="-6" r="4" fill="${K}"/>`,
  plane: `<path d="M-40 -14Q-40 -22 -26 -22H34Q42 -22 44 -18Q40 -14 30 -14Z"/><path d="M-4 -22L8 -40H16L12 -22M-4 -14L8 2H16L12 -14M-34 -22L-40 -34H-32L-24 -22" fill="#fff"/><path d="M-20 -18h40" stroke-width="1.4" stroke-dasharray="3 3"/>`,
  boat: `<path d="M-34 -14H34L24 0H-24Z"/><path d="M0 -14V-50L24 -18H0" fill="${GR}"/>`,
  lboat: `<path d="M-40 -16Q0 -6 40 -18L32 0H-30Z" fill="#fff"/><path d="M-12 -14V-28H12V-12" fill="none" stroke-width="2"/>`,
  tree: `<path d="M-4 0V-26H4V0Z"/><circle cx="0" cy="-44" r="20" fill="${GR}"/><circle cx="-14" cy="-34" r="11" fill="${GR}"/><circle cx="14" cy="-34" r="11" fill="${GR}"/>`,
  palm: `<path d="M-2 0Q2 -30 0 -60" fill="none" stroke-width="4"/><path d="M0 -60q-16 -6 -28 4q14 -10 28 -4M0 -60q16 -6 28 4q-14 -10 -28 -4M0 -60q-10 -12 -22 -14q12 4 22 14M0 -60q10 -12 22 -14q-12 4 -22 14" fill="${GR}" stroke-width="1.8"/>`,
  mountain: `<path d="M-60 0L-20 -50L0 -30L20 -60L60 0Z" fill="${GR}"/><path d="M14 -52l6 -8 6 8-6 4z" fill="#fff" stroke-width="1.2"/>`,
  sun: `<circle cx="0" cy="-20" r="10"/><path d="M0 -36v-6M0 -4v6M16 -20h6M-16 -20h-6M11 -31l4 -4M-11 -31l-4 -4M11 -9l4 4M-11 -9l-4 4" stroke-width="2.2"/>`,
  moon: `<path d="M4 -30A12 12 0 1 0 10 -6A10 10 0 1 1 4 -30Z" fill="${GR}"/>`,
  star: `<path d="M0 -14l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="${GR}" stroke-width="1.4"/>`,
  cloud: `<path d="M-20 0a10 10 0 0 1 4 -18a13 13 0 0 1 24 -2a10 10 0 0 1 12 20Z" fill="${GR}"/>`,
  raincloud: `<path d="M-20 -14a10 10 0 0 1 4 -18a13 13 0 0 1 24 -2a10 10 0 0 1 12 20Z" fill="${GR}"/><path d="M-12 -8l-3 6M0 -8l-3 6M12 -8l-3 6" stroke-width="1.8"/>`,
  snowman: `<circle cx="0" cy="-12" r="12"/><circle cx="0" cy="-32" r="8"/><circle cx="-3" cy="-33" r="1.2" fill="${K}"/><circle cx="3" cy="-33" r="1.2" fill="${K}"/>`,
  fire: `<path d="M0 0Q-14 -4 -10 -18Q-6 -12 -4 -14Q-6 -26 4 -32Q2 -22 8 -18Q10 -24 12 -22Q16 -4 0 0Z" fill="${GR}"/>`,
  water_drop: `<path d="M0 -24Q-10 -10 -8 -6Q-6 0 0 0Q6 0 8 -6Q10 -10 0 -24Z" fill="#fff"/>`,
  puddle: `<ellipse cx="0" cy="-2" rx="24" ry="4" fill="${GR}"/>`,
  rock: `<path d="M-14 0Q-16 -12 -4 -14Q12 -16 14 -4V0Z" fill="${GR}"/>`,
  river: `<path d="M-60 -2q15 -6 30 0t30 0t30 0t30 0" fill="none" stroke-width="2"/><path d="M-50 -10q10 -4 20 0M10 -10q10 -4 20 0" fill="none" stroke-width="1.4" stroke="${L}"/>`,
  wave: `<path d="M-40 0q10 -10 20 0t20 0t20 0t20 0" fill="none" stroke-width="2.2"/>`,
  // 동물
  cat: `<ellipse cx="4" cy="-10" rx="14" ry="10"/><circle cx="-10" cy="-18" r="8"/><path d="M-16 -23l1 -8 5 5M-9 -26l4 -6 2 7" fill="#fff" stroke-width="1.8"/><circle cx="-13" cy="-19" r="1.1" fill="${K}"/><circle cx="-7" cy="-19" r="1.1" fill="${K}"/><path d="M18 -10q10 -2 8 -14" fill="none" stroke-width="2.6"/>`,
  dog: `<ellipse cx="4" cy="-14" rx="15" ry="9"/><path d="M-6 -6V0M14 -6V0M-2 -6V0M10 -6V0" stroke-width="3"/><circle cx="-12" cy="-22" r="8"/><path d="M-19 -26q-4 8 2 10" fill="${K}"/><circle cx="-13" cy="-23" r="1.2" fill="${K}"/><circle cx="-19" cy="-20" r="1.6" fill="${K}"/><path d="M19 -18q6 -6 4 -12" fill="none" stroke-width="2.4"/>`,
  bird: `<path d="M-8 -8Q-6 -18 4 -16Q10 -14 8 -8Q2 0 -8 -8Z"/><path d="M-8 -10l-5 -1 5 -2" fill="${K}" stroke-width="1"/><path d="M0 -12q4 -6 10 -4" fill="none" stroke-width="1.6"/><circle cx="-4" cy="-12" r="1" fill="${K}"/>`,
  elephant: `<ellipse cx="6" cy="-30" rx="24" ry="18" fill="${GR}"/><path d="M-6 -16V0H2V-14M14 -16V0H22V-16" fill="${GR}"/><circle cx="-18" cy="-36" r="12" fill="${GR}"/><path d="M-28 -32q-6 16 2 28" fill="none" stroke-width="5"/><path d="M-28 -32q-6 16 2 28" fill="none" stroke="${GR}" stroke-width="1"/><path d="M-14 -46q12 -2 12 12q-4 8 -12 2" fill="#fff" stroke-width="1.8"/><circle cx="-22" cy="-38" r="1.4" fill="${K}"/>`,
  cow: `<ellipse cx="4" cy="-24" rx="20" ry="11"/><path d="M-8 -14V0M16 -14V0" stroke-width="3.2"/><path d="M-14 -34q-8 0 -8 8q0 8 8 8q6 0 6 -8q0 -8 -6 -8Z"/><path d="M-20 -34l-4 -4M-10 -34l2 -5" stroke-width="2"/><path d="M4 -32q6 4 0 8M14 -28q4 4 0 8" fill="${K}" stroke-width="1"/>`,
  buffalo: `<ellipse cx="4" cy="-24" rx="22" ry="12" fill="${GR}"/><path d="M-8 -14V0M16 -14V0" stroke-width="3.2"/><path d="M-14 -34q-8 0 -8 8q0 8 8 8q6 0 6 -8q0 -8 -6 -8Z" fill="${GR}"/><path d="M-22 -36q-6 -2 -6 -8M-8 -36q6 -2 6 -8" fill="none" stroke-width="3"/>`,
  pig: `<ellipse cx="2" cy="-14" rx="16" ry="11"/><circle cx="-14" cy="-16" r="4" fill="#fff"/><path d="M-6 -4V0M10 -4V0" stroke-width="3"/><path d="M18 -16q4 -2 2 -6" fill="none" stroke-width="1.6"/><circle cx="-8" cy="-20" r="1.2" fill="${K}"/>`,
  hen: `<path d="M-10 -10Q-12 -24 0 -22Q4 -30 10 -24Q14 -18 10 -10Q0 -2 -10 -10Z"/><path d="M8 -26l2 -4 2 4" fill="${GR}" stroke-width="1"/><path d="M14 -20l4 1-4 2" fill="${K}" stroke-width="1"/><path d="M-2 -8V0M4 -8V0" stroke-width="1.6"/>`,
  monkey: `<circle cx="0" cy="-30" r="10" fill="${GR}"/><ellipse cx="0" cy="-28" rx="6" ry="5"/><ellipse cx="0" cy="-10" rx="9" ry="10" fill="${GR}"/><path d="M8 -6q14 0 10 -18" fill="none" stroke-width="2.4"/>`,
  snake: `<path d="M-30 -4q10 -10 20 0t20 0t16 -6" fill="none" stroke-width="6"/><path d="M-30 -4q10 -10 20 0t20 0t16 -6" fill="none" stroke="${GR}" stroke-width="2"/><circle cx="26" cy="-10" r="4" fill="${GR}"/>`,
  mosquito: `<ellipse cx="0" cy="-10" rx="5" ry="2.4"/><path d="M-5 -10h-7M0 -12l-4 -6M0 -12l4 -6M-2 -8l-4 6M2 -8l4 6" fill="none" stroke-width="1.2"/>`,
  ant: `<circle cx="-6" cy="-4" r="2.6" fill="${K}"/><circle cx="0" cy="-4" r="2.2" fill="${K}"/><circle cx="6" cy="-4" r="3" fill="${K}"/>`,
  dlock: `<rect x="-20" y="-78" width="40" height="78" rx="2"/><rect x="8" y="-50" width="9" height="16" rx="2" fill="${GR}" stroke-width="1.6"/><path d="M10 -46h1M14 -46h1M10 -42h1M14 -42h1M10 -38h1M14 -38h1" stroke-width="1.6"/>`,
  intercom: `<rect x="-10" y="-22" width="20" height="22" rx="3"/><rect x="-6" y="-18" width="12" height="9" fill="${GR}" stroke-width="1.2"/><path d="M-4 -5h8" stroke-width="1.6"/>`,
  shoehorn: `<path d="M-2 -40Q-3 -10 -5 -2Q0 2 5 -2Q3 -10 2 -40Z" fill="${GR}"/><circle cx="0" cy="-36" r="1.5" fill="#fff" stroke-width="1"/>`,
  insole: `<path d="M-14 -3Q-16 -9 -8 -10Q0 -8 8 -9Q16 -9 15 -4Q14 0 6 -1Q-2 0 -8 0Q-14 1 -14 -3Z" fill="${GR}" stroke-width="1.8"/>`,
  hlamp: `<path d="M0 0V18" stroke-width="2"/><path d="M-14 32Q0 12 14 32Z" fill="${GR}"/><path d="M-4 36q4 4 8 0" fill="none" stroke-width="1.6"/>`,
  blind: `<path d="M-26 -60H26" stroke-width="3"/><rect x="-24" y="-58" width="48" height="40" fill="#fff" stroke-width="1.8"/><path d="M-24 -50h48M-24 -42h48M-24 -34h48M-24 -26h48M18 -58v44" fill="none" stroke-width="1.2"/>`,
  showcase: `<rect x="-26" y="-80" width="52" height="80" rx="2"/><rect x="-22" y="-76" width="44" height="50" fill="#fff" stroke-width="1.4"/><path d="M-22 -51h44M-26 -22H26" stroke-width="1.6"/><path d="M-16 -55l1 -8h6l1 8ZM-4 -55l1 -8h6l1 8ZM8 -55l1 -8h6l1 8ZM-16 -30l1 -8h6l1 8ZM2 -30q0 -8 6 -8q6 0 6 8Z" fill="${GR}" stroke-width="1.2"/>`,
  ornament: `<circle cx="0" cy="-9" r="9" fill="${GR}"/><rect x="-3" y="-21" width="6" height="4" fill="#fff" stroke-width="1.2"/><path d="M-8 -11q8 4 16 0" fill="none" stroke-width="1.2"/>`,
  xtree: `<path d="M0 -70L-14 -48H-6L-22 -26H-10L-28 0H28L10 -26H22L6 -48H14Z" fill="${GR}"/><path d="M0 -70l2 -4 -2 -4 -2 4Z" stroke-width="1.4"/><circle cx="-8" cy="-14" r="2.5" fill="#fff" stroke-width="1"/><circle cx="8" cy="-30" r="2.5" fill="#fff" stroke-width="1"/><circle cx="12" cy="-10" r="2.5" fill="#fff" stroke-width="1"/>`,
  kfridge: `<rect x="-28" y="-60" width="56" height="60" rx="4"/><path d="M-28 -40H28M-28 -20H28M0 -60V-40" stroke-width="1.6"/><text x="0" y="-26" font-size="9" text-anchor="middle" fill="${K}" stroke="none" font-weight="700">김치</text>`,
  juicer: `<path d="M-12 0V-14H12V0Z"/><path d="M-16 -14H16L10 -20H-10Z" fill="#fff"/><path d="M-8 -20Q0 -36 8 -20Z" fill="${GR}"/><path d="M12 -8h6v8" fill="none" stroke-width="1.8"/>`,
  induction: `<rect x="-30" y="-6" width="60" height="6" rx="2" fill="${K}"/><ellipse cx="-14" cy="-6" rx="10" ry="2" fill="none" stroke="#fff" stroke-width="1.2"/><ellipse cx="14" cy="-6" rx="10" ry="2" fill="none" stroke="#fff" stroke-width="1.2"/>`,
  smoothie: `<path d="M-7 0L-9 -24H9L7 0Z"/><path d="M-8 -16H8L7 -1H-7Z" fill="${GR}" stroke="none"/><path d="M2 -24L8 -34" stroke-width="2"/>`,
  toilet: `<path d="M-16 -36H-2V-24H18Q18 -12 6 -10L8 0H-8L-6 -10Q-16 -14 -16 -24Z" fill="#fff"/>`,
  wcan: `<path d="M-12 0V-18H8V0Z" fill="${GR}"/><path d="M8 -14L22 -24M-12 -16q-8 0 -6 8" fill="none" stroke-width="2.4"/><path d="M24 -22l2 4M27 -24l3 3" stroke-width="1.4"/>`,
  rose: `<path d="M0 0V-20" stroke-width="2"/><path d="M0 -12q-6 -2 -8 2" fill="${GR}" stroke-width="1.4"/><path d="M-5 -22Q-6 -30 0 -30Q6 -30 5 -22Q0 -18 -5 -22Z" fill="${GR}"/><path d="M-2 -26q2 -2 4 0" fill="none" stroke-width="1.2"/>`,
  sbox: `<rect x="-24" y="-10" width="48" height="10" rx="2"/><circle cx="16" cy="-5" r="1.6" fill="${K}"/><path d="M-18 -5h12" stroke-width="1.4"/>`,
  multitap: `<rect x="-22" y="-7" width="44" height="7" rx="2"/><path d="M-15 -4h2M-6 -4h2M3 -4h2M12 -4h2" stroke-width="2"/><path d="M-22 -3q-10 0 -14 3" fill="none" stroke-width="1.8"/>`,
  rosebush: `<path d="M-10 0H10L8 -14H-8Z"/>`,
  keypad: `<rect x="-8" y="-14" width="16" height="14" rx="2" fill="${GR}"/><path d="M-4 -10h1M3 -10h1M-4 -6h1M3 -6h1" stroke-width="1.6"/>`,
  fist: `<circle cx="0" cy="0" r="5"/>`,
  wclock: `<circle cx="0" cy="-14" r="14"/><path d="M0 -14V-23M0 -14l6 4" fill="none" stroke-width="2"/>`,
  dust: `<circle cx="-8" cy="-6" r="2" fill="${GR}" stroke-width="1"/><circle cx="0" cy="-10" r="1.6" fill="${GR}" stroke-width="1"/><circle cx="8" cy="-5" r="2.4" fill="${GR}" stroke-width="1"/><circle cx="3" cy="-2" r="1.4" fill="${GR}" stroke-width="1"/>`,
  // 기호
  heart: `<path d="M0 0C-14 -10 -10 -22 0 -14C10 -22 14 -10 0 0Z" fill="${GR}" stroke-width="1.8"/>`,
  check: `<path d="M-8 -10l6 6l10 -12" fill="none" stroke-width="3.4"/>`,
  cross: `<path d="M-7 -16l14 14M7 -16l-14 14" fill="none" stroke-width="3.4"/>`,
  music: `<path d="M-4 -4V-20L8 -24V-8" fill="none" stroke-width="1.8"/><circle cx="-7" cy="-4" r="3" fill="${K}"/><circle cx="5" cy="-8" r="3" fill="${K}"/>`,
  ring2: `<path d="M-10 -10q-4 4 0 8M10 -10q4 4 0 8M-15 -14q-6 8 0 16M15 -14q6 8 0 16" fill="none" stroke-width="1.6"/>`,
  steam: `<path d="M-4 0q-4 -6 0 -12q4 -6 0 -12M4 0q-4 -6 0 -12q4 -6 0 -12" fill="none" stroke-width="1.4" stroke="${L}"/>`,
  rays: `<path d="M0 -10v-8M10 -6l6 -5M-10 -6l-6 -5M12 4h8M-12 4h-8" fill="none" stroke-width="2"/>`,
  sparkle: `<path d="M0 -14l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" fill="${GR}" stroke-width="1.2"/>`,
  arrow: `<path d="M-14 -6H10M4 -12l6 6-6 6" fill="none" stroke-width="2.6"/>`,
  dust: `<circle cx="-8" cy="-6" r="2" fill="${GR}" stroke-width="1"/><circle cx="0" cy="-10" r="1.6" fill="${GR}" stroke-width="1"/><circle cx="8" cy="-5" r="2.4" fill="${GR}" stroke-width="1"/><circle cx="3" cy="-2" r="1.4" fill="${GR}" stroke-width="1"/>`,
  sign: `<rect x="-16" y="-50" width="32" height="20" rx="2"/><path d="M0 -30V0" stroke-width="3"/>`,
  board_: `<rect x="-34" y="-60" width="68" height="40" fill="${GR}"/><path d="M-30 -20v20M30 -20v20" stroke-width="3"/>`,
};
const OS = {table: 1, desk: 1}; // 기본 크기 외
function obj(name, mods, sc, txt, inHand) {
  let s = O[name];
  if (s === undefined) return "";
  if (txt !== undefined && (name === "sign" || name === "board_" || name === "money" || name === "paper" || name === "calendar" || name === "card")) {
    const y = name === "sign" ? -36 : name === "board_" ? -36 : name === "calendar" ? -6 : name === "money" ? -3 : -8;
    s += tx(0, y, txt, name === "board_" ? 14 : 9);
  }
  if (name === "clock" && txt && /^\d+(:\d+)?$/.test(txt)) { const [h, m] = txt.split(":").map(Number); const ha = ((h % 12) + (m || 0) / 60) * 30 * Math.PI / 180, ma = (m || 0) * 6 * Math.PI / 180;
    s = `<circle cx="0" cy="-14" r="14"/><path d="M0 -14L${f(Math.sin(ha) * 7)} ${f(-14 - Math.cos(ha) * 7)}M0 -14L${f(Math.sin(ma) * 10)} ${f(-14 - Math.cos(ma) * 10)}" fill="none" stroke-width="2"/>`; }
  return sc && sc !== 1 ? `<g transform="scale(${sc})">${s}</g>` : s;
}

/* ---------- 배경 (연한 선) ---------- */
const BG = {
  none: ``,
  room: `<rect x="22" y="16" width="56" height="44" rx="2"/><path d="M50 16V60M22 38H78"/><rect x="346" y="18" width="40" height="30" rx="1"/><path d="M352 42l10-12 8 8 6-6 8 10"/>`,
  living: `<rect x="22" y="16" width="56" height="44" rx="2"/><path d="M50 16V60M22 38H78"/><rect x="318" y="20" width="40" height="30" rx="1"/><path d="M324 44l10-12 8 8 6-6 8 10"/><path d="M200 4V14M188 24q12 -14 24 0Z"/>`,
  bedroom: `<rect x="300" y="14" width="64" height="48" rx="2"/><path d="M300 14q16 22 0 48M364 14q-16 22 0 48"/><path d="M30 30h16l4 -14h-24z"/><path d="M38 30v30M30 60h16"/>`,
  kitchen: `<path d="M0 46H400"/><rect x="10" y="8" width="70" height="30" rx="2"/><path d="M45 8V38M300 8h90v30h-90zM345 8v30"/><path d="M40 28v4M50 28v4M335 28v4M355 28v4"/>`,
  bath: `<path d="M0 30H400M0 60H400M0 90H400M40 0V112M120 0V112M200 0V112M280 0V112M360 0V112" stroke-width="1"/>`,
  office: `<rect x="20" y="14" width="60" height="44"/><path d="M20 24h60M20 34h60M20 44h60"/><rect x="330" y="20" width="40" height="40"/><path d="M340 32h20M340 40h20M340 48h12"/>`,
  class: `<rect x="110" y="8" width="180" height="56" rx="2"/><path d="M130 24h40M130 36h60M130 48h30"/><path d="M110 66h180"/>`,
  shop: `<rect x="10" y="10" width="80" height="80"/><path d="M10 36h80M10 62h80M20 36v-12h10v12M40 36v-16h10v16M60 36v-10h14v10M20 62v-14h12v14M46 62v-10h20v10"/><rect x="310" y="10" width="80" height="80"/><path d="M310 36h80M310 62h80M320 36v-12h10v12M342 36v-16h10v16M362 36v-10h14v10M322 62v-12h16v12M348 62v-14h12v14"/>`,
  market: `<path d="M4 50H96L88 34H12Z"/><path d="M10 50v62M90 50v62M14 70h72"/><path d="M304 50H396L388 34H312Z"/><path d="M310 50v62M390 50v62M314 70h72"/>`,
  street: `<path d="M0 112H400"/><path d="M6 112V40h34v72M46 112V60h28v52M326 112V54h30v58M360 112V34h36v78"/><path d="M14 50h6M28 50h6M14 64h6M28 64h6M52 70h6M64 70h6M334 64h6M346 64h6M368 44h6M382 44h6M368 58h6M382 58h6"/>`,
  city: `<path d="M0 112V80h22V62h18v50M40 92h20v20M66 112V70l14-10 14 10v42M100 112V86h24v26M280 112V84h22v28M308 112V60h20v52M334 112V76l16-12 16 12v36M372 112V90h28"/><path d="M28 70h4M28 80h4M72 76h4M84 76h4M314 70h8M314 82h8M342 84h4M354 84h4"/>`,
  park: `<path d="M30 112V84M30 84a18 18 0 1 1 0.1 0ZM370 112V80M370 80a20 20 0 1 1 0.1 0Z"/><path d="M60 100h40M64 100v12M96 100v12M60 94h40"/><path d="M0 112H400"/>`,
  beach: `<path d="M0 84q20 -6 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0"/><path d="M0 96q20 -6 40 0t40 0" /><circle cx="360" cy="24" r="12"/><path d="M30 112q2 -40 0 -70M30 42q-14 -4 -24 4M30 42q14 -4 24 4M30 42q-6 -10 -16 -12M30 42q6 -10 16 -12"/>`,
  sea: `<path d="M0 70q20 -6 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0M0 90q20 -6 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0"/><circle cx="360" cy="24" r="12"/>`,
  mount: `<path d="M0 90L50 40L80 64L120 30L170 90M230 90L290 36L320 60L360 30L400 80"/>`,
  temple: `<path d="M10 112V80H90V112M4 80L50 50L96 80M20 64L50 30L80 64M50 30V18M310 112V80H390V112M304 80L350 50L396 80M320 64L350 30L380 64M350 30V18"/>`,
  rest: `<path d="M60 0V18M48 30q12 -16 24 0ZM200 0V14M188 26q12 -16 24 0ZM340 0V18M328 30q12 -16 24 0Z"/>`,
  hosp: `<rect x="20" y="14" width="50" height="40"/><path d="M45 22v24M33 34h24"/><path d="M330 20h50v30h-50zM330 30h50"/>`,
  station: `<path d="M0 92H400M0 100H400"/><rect x="170" y="10" width="60" height="18" rx="2"/><path d="M200 28V40M30 40v52M370 40v52M20 40h20M360 40h20"/>`,
  airport: `<path d="M0 60H400"/><path d="M40 30l20 -6h30l6 4-6 4h-30z M60 24l8 -10h6l-4 10M60 36l8 8h6l-4-8"/><rect x="300" y="12" width="80" height="20" rx="2"/><path d="M310 22h60"/>`,
  night: `<path d="M360 14A12 12 0 1 0 366 38A10 10 0 1 1 360 14Z"/><path d="M40 20l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1zM100 40l1.5 3 3 .8-2 2 .5 3-3-1.5-3 1.5.5-3-2-2 3-.8zM300 50l1.5 3 3 .8-2 2 .5 3-3-1.5-3 1.5.5-3-2-2 3-.8zM250 16l1.5 3 3 .8-2 2 .5 3-3-1.5-3 1.5.5-3-2-2 3-.8z"/>`,
  field: `<path d="M0 80q100 -20 200 0t200 0"/><path d="M0 96H400M20 112l10 -16M60 112l10 -16M100 112l10 -16M140 112l10 -16M180 112l10 -16M220 112l10 -16M260 112l10 -16M300 112l10 -16M340 112l10 -16M380 112l10 -16"/><circle cx="350" cy="26" r="11"/>`,
  sky: `<path d="M30 40a10 10 0 0 1 8-16a13 13 0 0 1 24 2a10 10 0 0 1 10 14ZM310 34a10 10 0 0 1 8-16a13 13 0 0 1 24 2a10 10 0 0 1 10 14Z"/>`,
  rain: `<path d="M30 40a10 10 0 0 1 8-16a13 13 0 0 1 24 2a10 10 0 0 1 10 14ZM310 34a10 10 0 0 1 8-16a13 13 0 0 1 24 2a10 10 0 0 1 10 14Z"/><path d="M36 50l-3 7M52 52l-3 7M30 70l-3 7M58 74l-3 7M40 92l-3 7M316 46l-3 7M334 48l-3 7M350 66l-3 7M322 72l-3 7M340 92l-3 7M370 80l-3 7M110 30l-3 7M290 30l-3 7M130 60l-3 7M270 60l-3 7"/>`,
  snow: `<path d="M30 30l0 8M26 34h8M80 60l0 8M76 64h8M330 24l0 8M326 28h8M370 70l0 8M366 74h8M140 20v8M136 24h8M260 40v8M256 44h8"/>`,
  farm: `<path d="M0 80q100 -20 200 0t200 0"/><path d="M20 112V70h40v42M14 72l26-20 26 20M320 112V92h60M330 92v-8M350 92v-8M370 92v-8"/>`,
  gym: `<path d="M20 40h60M30 30v20M70 30v20M320 40h60M330 30v20M370 30v20"/>`,
  stage: `<path d="M0 30H400M20 0q20 30 40 30M380 0q-20 30 -40 30"/><path d="M100 0l20 30M300 0l-20 30"/>`,
  road: `<path d="M0 112H400M0 100H400"/><path d="M20 106h30M90 106h30M160 106h30M230 106h30M300 106h30M370 106h30"/>`,
  river: `<path d="M0 96q20 -6 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0"/><path d="M0 104q20 -6 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0"/>`,
};

/* ---------- 말풍선 · 글 ---------- */
function bubble(kind, x, y, content) {
  let inner = "", w = 40, h = 26;
  if (content !== undefined && content !== "") {
    const m = /^([a-z_]+\w*)$/.exec(content);
    if (m && O[content] !== undefined) { w = 46; h = 34; inner = `<g transform="translate(0 ${h / 2 - 4}) scale(.85)">${obj(content, [])}</g>`; }
    else { w = Math.max(30, Math.min(140, 8 + [...content].length * 9)); inner = tx(0, 4, content, 12); }
  }
  const sh = kind === "think"
    ? `<ellipse cx="0" cy="0" rx="${w / 2 + 4}" ry="${h / 2 + 2}"/><circle cx="-8" cy="${h / 2 + 7}" r="3"/><circle cx="-13" cy="${h / 2 + 13}" r="2"/>`
    : `<path d="M${-w / 2} ${-h / 2 + 6}Q${-w / 2} ${-h / 2} ${-w / 2 + 6} ${-h / 2}H${w / 2 - 6}Q${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 6}V${h / 2 - 6}Q${w / 2} ${h / 2} ${w / 2 - 6} ${h / 2}H-2L-10 ${h / 2 + 8}L-8 ${h / 2}H${-w / 2 + 6}Q${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - 6}Z"/>`;
  return `<g transform="translate(${x} ${y})" stroke-width="1.8">${sh}<g transform="translate(0 ${content && O[content] !== undefined ? -h / 2 : 0})">${inner}</g></g>`;
}

/* ---------- 조립 ---------- */
const SURF = {table: 39, desk: 40, ctable: 22, chair: 24, stool: 26, sofa: 30, bed: 30, counter: 36, shelf: 54, tvstand: 20, cab: 70, wshelf: 0};
const PEOPLE = new Set(Object.keys(TYPE));
function parse(tok) {
  tok = tok.trim(); if (!tok) return null;
  let m = /^(p[gkw]?)(@[^:]*)?:(.*)$/.exec(tok);
  if (m) { const pos = (m[2] || "@").slice(1).split(","); return {name: m[1], mods: [], txt: m[3], x: pos[0] ? +pos[0] : 200, lift: pos[1] ? +pos[1] : 0, s: pos[2] ? +pos[2] : 1}; }
  let txt; const ei = tok.indexOf("="); if (ei >= 0) { txt = tok.slice(ei + 1); tok = tok.slice(0, ei); }
  let held; const hi = tok.indexOf("+"); if (hi >= 0) { held = tok.slice(hi + 1); tok = tok.slice(0, hi); }
  let flip = false; if (tok.endsWith("!")) { flip = true; tok = tok.slice(0, -1); }
  let pos = []; const ai = tok.indexOf("@"); if (ai >= 0) { pos = tok.slice(ai + 1).split(","); tok = tok.slice(0, ai); }
  const [name, ...mods] = tok.split(".");
  return {name, mods, held, txt, flip, x: pos[0] === undefined || pos[0] === "" ? 200 : +pos[0], lift: pos[1] === undefined || pos[1] === "" ? 0 : (isNaN(+pos[1]) ? (SURF[pos[1]] || 0) : +pos[1]), s: pos[2] ? +pos[2] : 1};
}
function render(spec) {
  const parts = String(spec || "").split(";"); const bg = (parts.shift() || "").trim();
  let body = "";
  for (const raw of parts) {
    const p = parse(raw); if (!p) continue;
    let g = "";
    if (p.name === "p" || p.name === "pg" || p.name === "pk" || p.name === "pw") {
      const fill = p.name === "pg" ? GR : p.name === "pk" ? K : p.name === "pw" ? "#fff" : "none";
      g = `<path d="${p.txt || ""}" fill="${fill}"/>`; p.txt = undefined;
    }
    else if (p.name === "say" || p.name === "think") { body += bubble(p.name, p.x, GY - p.lift, p.txt); continue; }
    else if (p.name === "txt") { body += tx(p.x, GY - p.lift, p.txt || "", 12 * p.s, {w: 800}); continue; }
    else if (p.name === "zzz") g = zzz(0, 0);
    else if (PEOPLE.has(p.name)) g = person(p.name, p.mods, p.held, p.txt, p.lift);
    else g = obj(p.name, p.mods, 1, p.txt);
    const tr = `translate(${p.x} ${GY - p.lift})${p.s !== 1 ? ` scale(${p.s})` : ""}${p.flip ? " scale(-1 1)" : ""}`;
    body += `<g transform="${tr}">${g}</g>`;
  }
  const back = BG[bg] !== undefined ? BG[bg] : "";
  const floor = /^(bath|kitchen|office|class|shop|room|living|bedroom|rest|hosp|station|gym|stage)$/.test(bg) || !bg ? `<path d="M0 ${GY}H400" stroke="${K}" stroke-width="2"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" fill="#fff" stroke="${K}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><g fill="none" stroke="${L}" stroke-width="2">${back}</g>${floor}${body}</svg>`;
}
const SC = {render, objects: Object.keys(O), people: Object.keys(TYPE), poses: Object.keys(POSE), bgs: Object.keys(BG)};
if (typeof module !== "undefined") module.exports = SC; else root.SC = SC;
})(typeof window !== "undefined" ? window : globalThis);
/* 검사: 모르는 부품 이름 찾기 */
(function (root) {
  const SC = typeof module !== "undefined" ? module.exports : root.SC;
  SC.lint = function (spec) {
    const bad = [], parts = String(spec).split(";"), bg = parts.shift().trim();
    if (!SC.bgs.includes(bg)) bad.push("bg:" + bg);
    const MODS = new Set([...SC.poses, "smile", "grin", "sad", "angry", "wow", "flat", "sick", "sleep", "happy", "cry", "sweat", "sit", "floor", "lie", "awake", "glasses", "love", "cap", "police", "chef", "straw", "helmet", "sun", "winter"]);
    for (let t of parts) {
      t = t.trim(); if (!t || /^p[gkw]?(@[^:]*)?:/.test(t)) continue;
      const head = t.split("=")[0]; const [main, held] = head.split("+");
      const nm = main.split("@")[0].replace(/!$/, ""); const [name, ...mods] = nm.split(".");
      if (["say", "think", "txt", "zzz"].includes(name)) continue;
      if (SC.people.includes(name)) { for (const m of mods) if (!MODS.has(m)) bad.push("mod:" + m); }
      else if (!SC.objects.includes(name)) bad.push(name);
      if (held && !SC.objects.includes(held.split("*")[0].replace(/!$/, ""))) bad.push("held:" + held);
    }
    return bad;
  };
})(typeof window !== "undefined" ? window : globalThis);
