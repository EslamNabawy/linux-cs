import fs from 'fs';
import vm from 'vm';
const src = fs.readFileSync('assets/js/data.js','utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(src + '\nresult={DATA,ICONS};', sandbox);
const {DATA, ICONS} = sandbox.result;
// Authoritative guide metadata: content-meta.json is emitted by build-content.mjs
// (runs first in `npm run build:data`). Injecting it here guarantees DATA.content.sections
// always matches the real built guides — no more hand-synced drift with data.js.
let content = DATA.content;
try {
  const meta = JSON.parse(fs.readFileSync('assets/data/content-meta.json', 'utf8'));
  content = meta; // { tracks, sections:[{id,title,icon,category,track,level,order,preview,words,parts,commands}] }
} catch (_e) {
  console.warn('gen-lite: content-meta.json missing — falling back to stale DATA.content from data.js');
}
// Phase 1.5: ensure per-guide commands are present via cmd-guides.json fallback/inversion
try {
  if (content && Array.isArray(content.sections)) {
    const hasCmds = content.sections.some(s => Array.isArray(s.commands) && s.commands.length);
    if (!hasCmds) {
      const raw = JSON.parse(fs.readFileSync('assets/data/cmd-guides.json', 'utf8'));
      const guideToCmds = {};
      for (const [cmd, guides] of Object.entries(raw)) {
        for (const g of guides) {
          if (!guideToCmds[g.id]) guideToCmds[g.id] = [];
          guideToCmds[g.id].push(cmd);
        }
      }
      for (const sec of content.sections) {
        sec.commands = (guideToCmds[sec.id] || []).sort();
      }
    } else {
      // normalize: sort existing commands
      for (const sec of content.sections) {
        if (Array.isArray(sec.commands)) sec.commands = [...sec.commands].sort();
        else sec.commands = [];
      }
    }
  }
} catch (_e) {
  // ignore — build-content may not have emitted cmd-guides yet
}
const lite = {
  categories: DATA.categories,
  commandsBank: DATA.commandsBank,
  exercises: DATA.exercises,
  links: DATA.links,
  helpfulLinks: DATA.helpfulLinks,
  course: DATA.course,
  topicIndex: DATA.topicIndex,
  content
};
// Build lite file by stringifying then fixing ICONS manually from original source
let iconsSrc = src.slice(src.indexOf('const ICONS'));
iconsSrc = iconsSrc.slice(0, iconsSrc.indexOf('};')+2);
let liteJs = 'const DATA = ' + JSON.stringify(lite, null, 2) + ';\n\n' + iconsSrc + '\n';
fs.writeFileSync('assets/js/data-lite.js', liteJs);
console.log('lite size', Buffer.byteLength(liteJs)/1024, 'KB original', Buffer.byteLength(src)/1024);
