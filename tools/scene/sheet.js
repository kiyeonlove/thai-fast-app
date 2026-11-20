// 미리보기 시트: node sheet.js specs/0.txt out.png [chunk번호]   또는  node sheet.js --parts out.png
const fs = require("fs"), path = require("path");
const SC = require("./lib.js");
const [, , inp, out] = process.argv;
let cells = [];
if (inp === "--parts") {
  for (const o of SC.objects) cells.push({cap: o, svg: SC.render(`none; ${o}@200,10`)});
  for (const p of SC.people) cells.push({cap: p, svg: SC.render(`none; ${p}@120; ${p}.walk@170; ${p}.sit@230,24; chair@230; ${p}.floor@290; ${p}.happy.wave@340`)});
  for (const p of SC.poses) cells.push({cap: "pose " + p, svg: SC.render(`none; man.${p}@140; woman.${p}@260+cup`)});
  for (const b of SC.bgs) cells.push({cap: "bg " + b, svg: SC.render(`${b}`)});
} else {
  const ch = +(process.argv[4] ?? path.basename(inp).split(".")[0]);
  const ex = JSON.parse(fs.readFileSync(`${__dirname}/../../www/exc${ch}.json`, "utf8"));
  for (const line of fs.readFileSync(inp, "utf8").split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const [th, spec] = line.split("\t");
    const e = ex[th] || {};
    cells.push({cap: `<b>${th}</b> ${e.k || "??"}`, svg: SC.render(spec)});
  }
}
const html = `<html><head><meta charset="utf-8"><style>body{margin:8px;font:13px sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:1600px}
.c svg{width:100%;border:1.5px solid #bbb;border-radius:8px;display:block}.c div{padding:2px 4px;height:34px;overflow:hidden}</style></head><body>
${cells.map((c, i) => `<div class="c"><svg-holder>${c.svg}</svg-holder><div>${i}. ${c.cap}</div></div>`).join("")}</body></html>`;
fs.writeFileSync(out.replace(/\.png$/, ".html"), html);
(async () => {
  const {chromium} = require("playwright");
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1616, height: 800}});
  await p.setContent(html); await p.screenshot({path: out, fullPage: true}); await b.close();
  console.log("ok", cells.length, out, "avg svg", Math.round(cells.reduce((a, c) => a + c.svg.length, 0) / cells.length));
})();
