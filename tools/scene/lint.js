const SC = require("./lib.js"), fs = require("fs");
let n = 0, b = 0;
for (const f of process.argv.slice(2)) for (const line of fs.readFileSync(f, "utf8").split("\n")) {
  if (!line.trim()) continue; n++; const [th, sp] = line.split("\t"); const bad = SC.lint(sp || "");
  if (bad.length) { b++; console.log(f, th, bad.join(",")); }
}
console.log("checked", n, "bad", b);
{ const s = fs.readFileSync(__dirname + "/lib.js", "utf8"); const o = s.slice(s.indexOf("const O = {"), s.indexOf("const OS =")); const seen = {}; for (const m of o.matchAll(/^  ([a-z_0-9]+): `/gm)) { if (seen[m[1]]) console.log("DUP object", m[1]); seen[m[1]] = 1; } }
