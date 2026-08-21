// Build assets/data/content-library.json from "Linux 101 Content/*.md"
// Output shape per section:
//   { id, title, icon, category, preview, source, words,
//     parts: [ { id, title, blocks: [...] } ] }
// Block types match app.js renderBlock(): text | list | table | code | callout
import fs from 'fs';
import path from 'path';

const SRC_DIR = 'Linux 101 Content';
const OUT = 'assets/data/content-library.json';

// id -> source file (ids MUST match DATA.content.sections in assets/js/data.js)
const SECTIONS = [
  { id: 'bash-scripting',         file: 'bash-scripting-deep-dive.md',            icon: 'terminal', category: 'development' },
  { id: 'disk-storage',           file: 'disk-storage-management.md',             icon: 'database', category: 'storage' },
  { id: 'firewall',               file: 'firewall-deep-dive.md',                  icon: 'shield',   category: 'networking' },
  { id: 'important-files',        file: 'important-files-to-generate.md',         icon: 'file',     category: 'system' },
  { id: 'linux-boot',             file: 'linux-boot-process.md',                  icon: 'zap',      category: 'system' },
  { id: 'failure-scenarios',      file: 'linux-failure-scenarios.md',             icon: 'alert',    category: 'troubleshooting' },
  { id: 'linux-rules',            file: 'linux-rules-reference.md',               icon: 'book',     category: 'reference' },
  { id: 'log-management',         file: 'Log Management.md',                      icon: 'file',     category: 'logging' },
  { id: 'network-troubleshooting',file: 'Networking Troubleshooting Toolkit .md', icon: 'zap',      category: 'networking' },
  { id: 'data-engineers',         file: 'overview_Linux_for_Data_Engineers.md',   icon: 'book',     category: 'overview' },
  { id: 'process-monitoring',     file: 'process-performance-monitoring.md',      icon: 'activity', category: 'monitoring' },
  { id: 'ssh-guide',              file: 'ssh-remote-access-guide.md',             icon: 'terminal', category: 'networking' },
  { id: 'vim-nano',               file: 'vim-nano-complete-guide.md',             icon: 'edit',     category: 'editing' },
];

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inlineMd(s) {
  let t = escHtml(s.trim());
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // drop lone emphasis markers left over (avoid raw asterisks in prose)
  t = t.replace(/(^|\s)\*(?!\s)([^*<]+?)\*(?=\s|$|[,.;:!?])/g, '$1$2');
  return t;
}

function parseMd(raw) {
  const src = raw.replace(/\r\n?/g, '\n');
  const lines = src.split('\n');

  // Title = first H1
  let title = '';
  let i = 0;
  while (i < lines.length && !/^#\s+/.test(lines[i])) i++;
  if (i < lines.length) { title = lines[i].replace(/^#\s+/, '').trim(); i++; }

  const parts = [];
  let cur = null;
  let para = [];      // pending paragraph lines
  let listItems = null;

  const flushPara = () => {
    if (!para.length || !cur) { para = []; return; }
    const text = para.join(' ').trim();
    para = [];
    if (!text) return;
    const m = text.match(/^\*\*([^*]+):\*\*\s*(.*)$/s);
    if (m) {
      cur.blocks.push({ t: 'callout', kind: 'tip', html: `<strong>${inlineMd(m[1])}:</strong> ${inlineMd(m[2])}` });
    } else {
      cur.blocks.push({ t: 'text', html: `<p>${inlineMd(text)}</p>` });
    }
  };
  const flushList = () => {
    if (listItems && cur && listItems.length) cur.blocks.push({ t: 'list', items: listItems.map(inlineMd) });
    listItems = null;
  };
  const flushAll = () => { flushPara(); flushList(); };

  const startPart = (rawTitle) => {
    flushAll();
    const clean = rawTitle.replace(/^#+\s*/, '').replace(/^\d+(?:\.\d+)*[.)]?\s+/, '').trim();
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || ('part-' + (parts.length + 1));
    cur = { id: slug, title: clean, blocks: [] };
    parts.push(cur);
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      flushAll();
      const lang = line.replace(/^```/, '').trim() || 'bash';
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // closing fence
      if (cur) cur.blocks.push({ t: 'code', lang, code: buf.join('\n') });
      continue;
    }

    if (/^#{1,2}\s+/.test(line)) { startPart(line); i++; continue; }

    if (/^###\s+/.test(line)) {
      flushAll();
      const sub = line.replace(/^###\s+/, '').trim();
      if (cur) cur.blocks.push({ t: 'text', html: `<h6>${escHtml(sub)}</h6>` });
      i++; continue;
    }

    if (/^\s*\|/.test(line)) {
      flushAll();
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      if (rows.length >= 2 && /^\s*\|[\s:|-]+\|\s*$/.test(rows[1])) {
        const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        const head = cells(rows[0]).map(c => c.replace(/\*\*/g, ''));
        const body = rows.slice(2).map(r => cells(r).map(inlineMd));
        if (cur) cur.blocks.push({ t: 'table', head, rows: body });
      } else if (rows.length && cur) {
        // malformed table — fall back to plain paragraph
        cur.blocks.push({ t: 'text', html: '<p>' + rows.map(inlineMd).join('<br>') + '</p>' });
      }
      continue;
    }

    if (/^---\s*$/.test(line)) { flushAll(); i++; continue; }

    if (/^\s*[-*]\s+/.test(line)) {
      flushPara();
      if (!listItems) listItems = [];
      listItems.push(line.replace(/^\s*[-*]\s+/, '').trim());
      i++; continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      flushPara();
      if (!listItems) listItems = [];
      listItems.push(line.replace(/^\s*\d+[.)]\s+/, '').trim());
      i++; continue;
    }

    if (!line.trim()) { flushAll(); i++; continue; }

    // ordinary text
    if (!cur) startPart('Introduction');
    para.push(line.trim());
    i++;
  }
  flushAll();

  // drop empty intro-only trailing bits
  const cleaned = parts.filter(p => p.blocks.length);
  return { title, parts: cleaned };
}

const wordCount = (sec) => sec.parts.reduce((a, p) => a + p.blocks.reduce((b, bl) => {
  const grab = bl.html ? bl.html : (bl.code || '') + ' ' + ((bl.items || []).join(' ') || '') + ' ' + ((bl.rows || []).flat().join(' ') || '');
  return b + String(grab).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}, 0), 0);

const out = [];
for (const meta of SECTIONS) {
  const fp = path.join(SRC_DIR, meta.file);
  if (!fs.existsSync(fp)) { console.error('MISSING SOURCE:', fp); process.exit(1); }
  const { title, parts } = parseMd(fs.readFileSync(fp, 'utf8'));
  out.push({
    id: meta.id, title, icon: meta.icon, category: meta.category,
    preview: '', source: meta.file, words: wordCount({ parts }), parts,
  });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const payload = { sections: out };
fs.writeFileSync(OUT, JSON.stringify(payload, null, 1));
// Script fallback for file:// (fetch/XHR blocked) — loaded by app.js last resort
fs.writeFileSync('assets/js/data-library.js', 'window.DATA_CONTENT_LIBRARY = ' + JSON.stringify(payload) + ';\n');
const kb = (Buffer.byteLength(JSON.stringify(payload))/1024).toFixed(1);
console.log(`content-library.json (+ data-library.js): ${out.length} sections, ${out.reduce((a,s)=>a+s.parts.length,0)} parts, ${kb} KB`);
for (const s of out) console.log(`  - ${s.id}: ${s.parts.length} parts, ~${s.words} words`);
