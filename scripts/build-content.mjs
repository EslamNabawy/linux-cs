// Build assets/data/content-library.json from "Linux 101 Content/*.md"
// Output shape per section:
//   { id, title, icon, category, preview, source, words,
//     parts: [ { id, title, blocks: [...] } ] }
// Block types match app.js renderBlock(): text | list | table | code | callout
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const SRC_DIR = 'Linux 101 Content';
const OUT = 'assets/data/content-library.json';

// id -> source file (authoritative metadata; gen-lite injects this into DATA.content)
// track: foundations | system-ops | network-security | ops-automation
const TRACKS = [
  { id: 'foundations',       label: 'Start Here — Foundations' },
  { id: 'system-ops',        label: 'System Operations' },
  { id: 'network-security',  label: 'Networking & Security' },
  { id: 'ops-automation',    label: 'Servers & Automation' },
];
const SECTIONS = [
  { id: 'linux-rules',            file: 'linux-rules-reference.md',               icon: 'book',      category: 'reference',       track: 'foundations',      level: 'beginner',     preview: 'The mental model behind Linux — everything is a file, one tree, plain-text config. Read this first.' },
  { id: 'important-files',        file: 'important-files-to-generate.md',         icon: 'file',      category: 'system',          track: 'foundations',      level: 'beginner',     preview: '/etc, /var, /proc — the key files every admin reads and maintains, and what breaks when they vanish.' },
  { id: 'vim-nano',               file: 'vim-nano-complete-guide.md',             icon: 'file',      category: 'editing',         track: 'foundations',      level: 'beginner',     preview: 'Survive and then thrive in vim and nano — the editors you will find on every server you ever SSH into.' },
  { id: 'bash-scripting',         file: 'bash-scripting-deep-dive.md',            icon: 'terminal',  category: 'development',     track: 'foundations',      level: 'intermediate', preview: 'Functions, arrays, loops, and error handling for writing robust bash scripts that fail loudly.' },
  { id: 'disk-storage',           file: 'disk-storage-management.md',             icon: 'database',  category: 'storage',         track: 'system-ops',       level: 'intermediate', preview: 'Partitions, mounts, LVM and df/du — understand disk layout and never run out of space by surprise.' },
  { id: 'linux-boot',             file: 'linux-boot-process.md',                  icon: 'zap',       category: 'system',          track: 'system-ops',       level: 'intermediate', preview: 'From BIOS/UEFI to login prompt — every stage of boot, and how to diagnose a machine that won\u2019t come up.' },
  { id: 'systemd-deep-dive',      file: 'systemd-deep-dive.md',                   icon: 'cpu',       category: 'system',          track: 'system-ops',       level: 'intermediate', preview: 'Units, targets, journalctl and timers — run services properly on any modern distro.' },
  { id: 'process-monitoring',     file: 'process-performance-monitoring.md',      icon: 'activity',  category: 'monitoring',      track: 'system-ops',       level: 'intermediate', preview: 'ps, top, htop and load averages — find the process eating your CPU and read performance signals with confidence.' },
  { id: 'failure-scenarios',      file: 'linux-failure-scenarios.md',             icon: 'alert',     category: 'troubleshooting', track: 'system-ops',       level: 'advanced',     preview: 'Disk full at 3am? Server unresponsive? Walk through common failure scenarios and their rescue playbooks.' },
  { id: 'log-management',         file: 'Log Management.md',                      icon: 'eye',       category: 'logging',         track: 'system-ops',       level: 'intermediate', preview: 'journald, rsyslog and log rotation — find the signal in /var/log before the noise buries it.' },
  { id: 'network-troubleshooting',file: 'Networking Troubleshooting Toolkit .md', icon: 'network',   category: 'networking',      track: 'network-security', level: 'intermediate', preview: 'ping to tcpdump — a layered toolkit for diagnosing \u201cthe network is down\u201d, from cable to DNS.' },
  { id: 'ssh-guide',              file: 'ssh-remote-access-guide.md',             icon: 'network',   category: 'networking',      track: 'network-security', level: 'intermediate', preview: 'Keys, agents, tunnels and ssh_config — remote access done securely without password fatigue.' },
  { id: 'firewall',               file: 'firewall-deep-dive.md',                  icon: 'check',     category: 'security',        track: 'network-security', level: 'advanced',     preview: 'firewalld and nftables in depth — zones, rules and the exact commands that open (or close) a port safely.' },
  { id: 'server-hardening',       file: 'server-hardening-guide.md',              icon: 'check',     category: 'security',        track: 'network-security', level: 'advanced',     preview: 'A practical hardening checklist — users, sudo, SSH, updates and auditing for internet-facing servers.' },
  { id: 'docker-containers',      file: 'docker-containers-guide.md',             icon: 'layers',    category: 'containers',      track: 'ops-automation',   level: 'intermediate', preview: 'Images, containers, volumes and networking — run services in Docker without cargo-culting Dockerfiles.' },
  { id: 'ansible-basics',         file: 'ansible-basics-guide.md',                icon: 'clipboard', category: 'automation',      track: 'ops-automation',   level: 'intermediate', preview: 'Playbooks, inventories and idempotency — automate ten servers as easily as one.' },
  { id: 'monitoring-stack',       file: 'prometheus-grafana-monitoring-stack.md', icon: 'eye',       category: 'monitoring',      track: 'ops-automation',   level: 'advanced',     preview: 'Prometheus + Grafana + alerting rules — see server health before your users do.' },
  { id: 'tmux-screen',            file: 'tmux-screen-guide.md',                   icon: 'terminal',  category: 'terminal',        track: 'ops-automation',   level: 'beginner',     preview: 'Sessions that survive disconnects — tmux basics that pay off the first time your SSH drops mid-task.' },
  { id: 'data-engineers',         file: 'overview_Linux_for_Data_Engineers.md',   icon: 'cpu',       category: 'data',            track: 'ops-automation',   level: 'intermediate', preview: 'The Linux concepts data pipelines actually touch — filesystems, processes, cron and resource limits.' },
  { id: 'user-group-management',  file: 'linux-user-group-management.md',         icon: 'clipboard', category: 'security',        track: 'network-security', level: 'beginner',     preview: 'Users, groups, permissions, sudo and ACLs — create accounts safely, avoid the usermod -G trap, and control access properly.' },
  { id: 'directory-permissions',  file: 'linux-directory-permissions.md',         icon: 'check',     category: 'security',        track: 'network-security', level: 'intermediate', preview: 'What rwx really means on directories, SGID + sticky bits, umask, and namei -l for tracing permission denied up the path.' },
  { id: 'user-group-extended',    file: 'linux-user-group-extended.md',           icon: 'eye',       category: 'security',        track: 'ops-automation',   level: 'advanced',     preview: 'PAM, LDAP/AD via SSSD, /etc/skel, disk quotas, newgrp and login auditing — identity management at scale.' },
];

// compound-name alias expansion — bank commands like 'head/tail', 'docker compose', 'nano/vim' need explicit resolution
const ALIAS_TABLE = {
  'head/tail': ['head', 'tail'],
  'docker compose': ['docker', 'compose'],
  'nano/vim': ['nano', 'vim'],
  'top/htop': ['top', 'htop'],
  'free -h': ['free'],
};

// helper: extract first token from a line, stripping sudo, env, prompts, comments
function extractFirstToken(text) {
  const raw = String(text || '');
  // skip lines that are clearly descriptive with arrow (e.g., "dd   → delete...")
  if (raw.includes('→') || raw.includes('->') || raw.includes('→')) {
    // if line is "cmd  → description" it's not a shell invocation; skip
    // but still allow "vim file.txt          # open" which has no arrow
    // heuristic: if arrow appears before a comment or after first token, it's description
    if (raw.includes('→')) return null;
  }
  let s = raw.trim();
  if (!s) return null;
  // ignore full-line comments or markdown artifacts
  if (/^#\s*$/.test(s)) return null;
  // skip lines that start with uppercase (English sentences) — real commands are lower case
  const firstChar = s.replace(/^[\s$#>→]+/, '').trim().charAt(0);
  if (firstChar && firstChar >= 'A' && firstChar <= 'Z') return null;
  if (/^\s*#\s/.test(s) && !s.includes(' ')) {} // allow '# something' as comment but will be filtered below
  // remove leading shell prompts like $, #, >, →
  s = s.replace(/^[\s$#>→]+\s*/, '');
  // remove leading sudo chains
  s = s.replace(/^(sudo\s+)+/i, '');
  // strip env assignments at start: FOO=bar BAR="baz" 
  s = s.replace(/^([A-Za-z_][A-Za-z0-9_]*=[^\s'"]+|'[^']*'|"[^"]*")(\s+[A-Za-z_][A-Za-z0-9_]*=[^\s'"]+)*\s*/, (m) => {
    // if the leading segment looks like assignments, remove it
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(m.trim())) return '';
    return m;
  });
  // handle assignment chains more simply
  const assignmentStrip = s.match(/^((?:[A-Za-z_][A-Za-z0-9_]*=[^\s]+\s+)+)(.*)$/);
  if (assignmentStrip) s = assignmentStrip[2];
  s = s.trim();
  if (!s) return null;
  // ignore comment-only lines after stripping
  if (s.startsWith('#')) return null;
  // take first word up to whitespace, pipe, semicolon, &, >, <, ", ', `
  const first = s.split(/\s+/)[0] || '';
  let tok = first.split(/[|;&()<>`'"]+/)[0] || first;
  // strip trailing punctuation like , : ;
  tok = tok.replace(/[.,:;]+$/, '');
  // remove path prefix: /usr/bin/ls -> ls
  if (tok.includes('/')) {
    const parts = tok.split('/').filter(Boolean);
    tok = parts[parts.length - 1] || tok;
  }
  tok = tok.toLowerCase();
  if (!tok) return null;
  if (/^\d+$/.test(tok)) return null;
  if (/^[-]/.test(tok)) return null;
  if (/^[@$]/.test(tok)) return null;
  // filter pure flag-like or empty
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(tok)) return null;
  // ignore extremely noisy generic words that aren't linux commands
  const IGNORE = new Set(['file', 'directory', 'string', 'command', 'option', 'example']);
  if (IGNORE.has(tok)) return null;
  return tok;
}

// detect two-word compound commands at line start (e.g., docker compose, git clone)
function detectTwoWord(line, knownTwoWord) {
  let s = String(line || '').trim();
  s = s.replace(/^[\s$#>→]+\s*/, '');
  s = s.replace(/^(sudo\s+)+/i, '');
  const assignStrip = s.match(/^((?:[A-Za-z_][A-Za-z0-9_]*=[^\s]+\s+)+)(.*)$/);
  if (assignStrip) s = assignStrip[2];
  s = s.trim().toLowerCase();
  for (const kw of knownTwoWord) {
    if (s === kw || s.startsWith(kw + ' ') || s.startsWith(kw + '\t')) return kw;
  }
  return null;
}

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

    // Blockquotes: '> text' — rendered as callouts. A leading ⚠️ marks it as a warning.
    if (/^>\s?/.test(line)) {
      flushPara();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      if (cur && buf.length) {
        const inner = buf.join(' ').replace(/^⚠️\s*/, '').trim();
        const isWarn = /^\s*⚠️/.test(buf[0]);
        cur.blocks.push({ t: 'callout', kind: isWarn ? 'warn' : 'tip', html: inlineMd(inner) });
      }
      continue;
    }

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

// ===== Build KNOWN command universe from assets/js/data.js =====
let KNOWN = new Set();
let KNOWN_TWO_WORD = [];
try {
  const dataJs = fs.readFileSync('assets/js/data.js', 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(dataJs + '\nresult={DATA};', sandbox);
  const DATA = sandbox.result.DATA;
  const bankCmds = (DATA.commandsBank || []).map(c => String(c.command).toLowerCase().trim());
  const catCmds = [];
  for (const cat of (DATA.categories || [])) {
    for (const c of (cat.commands || [])) catCmds.push(String(c.command).toLowerCase().trim());
  }
  KNOWN = new Set([...bankCmds, ...catCmds]);
  KNOWN_TWO_WORD = [...KNOWN].filter(k => k.includes(' ')).sort((a,b)=> b.length - a.length);
  console.log(`known universe: ${KNOWN.size} commands (${bankCmds.length} bank + ${catCmds.length} categories), ${KNOWN_TWO_WORD.length} two-word`);
} catch (e) {
  console.warn('build-content: could not load KNOWN universe from data.js:', e.message);
  // fallback minimal
  KNOWN = new Set(['ls','cd','pwd','grep','chmod','chown','ssh','docker','git','vim','nano','head','tail','top','htop','free','ps','df','du','ip','curl','wget','tar','systemctl','journalctl']);
}

const out = [];
// temporary store per-guide raw command sets
const guideToCmdsRaw = {};
for (let i = 0; i < SECTIONS.length; i++) {
  const meta = SECTIONS[i];
  const fp = path.join(SRC_DIR, meta.file);
  if (!fs.existsSync(fp)) { console.error('MISSING SOURCE:', fp); process.exit(1); }
  const { title, parts } = parseMd(fs.readFileSync(fp, 'utf8'));
  out.push({
    id: meta.id, title, icon: meta.icon, category: meta.category,
    track: meta.track, level: meta.level, order: i + 1,
    preview: meta.preview, source: meta.file,
    words: wordCount({ parts }), parts,
  });
  // ===== Auto-extract commands from code blocks =====
  const guideCmds = new Set();
  for (const part of parts) {
    for (const block of part.blocks) {
      if (block.t !== 'code') continue;
      const lines = String(block.code || '').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (/^#\s*$/.test(trimmed)) continue;
        // detect two-word compound first
        const two = detectTwoWord(line, KNOWN_TWO_WORD);
        if (two) guideCmds.add(two);
        const tok = extractFirstToken(line);
        if (tok) guideCmds.add(tok);
      }
    }
  }
  // apply curated override if present (SECTIONS.commands)
  // SECTIONS may optionally define commands: ['ls','grep']
  if (Array.isArray(meta.commands) && meta.commands.length) {
    for (const c of meta.commands) {
      const lc = String(c).toLowerCase().trim();
      if (!lc) continue;
      // validation gate: must be in KNOWN
      if (!KNOWN.has(lc)) {
        console.error(`Unknown curated command "${c}" in guide ${meta.id} — not in KNOWN universe`);
        console.error(`Known sample: ${[...KNOWN].slice(0,20).join(', ')}`);
        process.exit(1);
      }
      guideCmds.add(lc);
    }
  }
  // intersect with KNOWN (filter noise)
  const filtered = new Set();
  for (const c of guideCmds) {
    const lc = String(c).toLowerCase().trim();
    if (KNOWN.has(lc)) filtered.add(lc);
    // also allow alias parts that are in KNOWN via direct match already
  }
  // alias expansion: compound -> parts, and slash-compound reverse
  const expanded = new Set(filtered);
  for (const [compound, partsArr] of Object.entries(ALIAS_TABLE)) {
    const lcCompound = compound.toLowerCase();
    if (filtered.has(lcCompound)) {
      for (const p of partsArr) {
        const lc = p.toLowerCase();
        if (KNOWN.has(lc)) expanded.add(lc);
      }
    }
    // reverse: slash compounds like head/tail, nano/vim, top/htop
    if (compound.includes('/')) {
      for (const p of partsArr) {
        const lc = p.toLowerCase();
        if (filtered.has(lc) && KNOWN.has(lcCompound)) expanded.add(lcCompound);
      }
    }
  }
  guideToCmdsRaw[meta.id] = [...expanded].sort();
}

// Build reverse index: cmd -> [guides]
const guidesForCmd = {};
const guideOrder = {};
const guideTitleMap = {};
out.forEach(s => { guideOrder[s.id] = s.order; guideTitleMap[s.id] = s.title; });
for (const [guideId, cmds] of Object.entries(guideToCmdsRaw)) {
  for (const cmd of cmds) {
    if (!guidesForCmd[cmd]) guidesForCmd[cmd] = [];
    guidesForCmd[cmd].push({ id: guideId, title: guideTitleMap[guideId] || guideId });
  }
}
// sort each command's guide list by guide order, and sort keys
for (const cmd of Object.keys(guidesForCmd)) {
  guidesForCmd[cmd].sort((a,b)=> (guideOrder[a.id]||0) - (guideOrder[b.id]||0));
}
const sortedGuidesForCmd = {};
Object.keys(guidesForCmd).sort().forEach(k => { sortedGuidesForCmd[k] = guidesForCmd[k]; });

// Validation gate already done for curated; also validate auto-extract didn't create unknown (shouldn't)
for (const k of Object.keys(sortedGuidesForCmd)) {
  if (!KNOWN.has(k)) {
    console.error(`Validation failed: cmd-guides.json contains unknown command "${k}"`);
    process.exit(1);
  }
}

// Attach per-guide commands to out entries
for (const sec of out) {
  sec.commands = guideToCmdsRaw[sec.id] || [];
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const payload = { sections: out };
fs.writeFileSync(OUT, JSON.stringify(payload, null, 1));
// Script fallback for file:// (fetch/XHR blocked) — loaded by app.js last resort
fs.writeFileSync('assets/js/data-library.js', 'window.DATA_CONTENT_LIBRARY = ' + JSON.stringify(payload) + ';\n');
// Small metadata manifest (no body text) consumed by gen-lite.mjs -> DATA.content.sections
const metaOut = {
  tracks: TRACKS,
  sections: out.map(({ id, title, icon, category, track, level, order, preview, words, commands }) =>
    ({ id, title, icon, category, track, level, order, preview, words, commands: commands || [], parts: undefined })),
};
// recompute part counts without pulling bodies into the manifest
out.forEach((s, i) => { metaOut.sections[i].parts = s.parts.length; });
fs.writeFileSync('assets/data/content-meta.json', JSON.stringify(metaOut, null, 2));
// Emit reverse index
fs.mkdirSync('assets/data', { recursive: true });
fs.writeFileSync('assets/data/cmd-guides.json', JSON.stringify(sortedGuidesForCmd, null, 2));
// Also emit a data-guide-commands.js fallback for file://
fs.writeFileSync('assets/js/data-cmd-guides.js', 'window.DATA_CMD_GUIDES = ' + JSON.stringify(sortedGuidesForCmd) + ';\n');
const kb = (Buffer.byteLength(JSON.stringify(payload))/1024).toFixed(1);
console.log(`content-library.json (+ data-library.js, content-meta.json): ${out.length} sections, ${out.reduce((a,s)=>a+s.parts.length,0)} parts, ${kb} KB`);
for (const s of out) console.log(`  - ${s.order}. [${s.track}/${s.level}] ${s.id}: ${s.parts.length} parts, ~${s.words} words, ${s.commands.length} cmds [${s.commands.slice(0,6).join(', ')}${s.commands.length>6?' +'+(s.commands.length-6):''}]`);
const totalMappings = Object.values(sortedGuidesForCmd).reduce((a,b)=> a+b.length, 0);
console.log(`cmd-guides.json: ${Object.keys(sortedGuidesForCmd).length} commands mapped, ${totalMappings} total guide→command links`);
if (Object.keys(sortedGuidesForCmd).length < 10) console.warn('WARN: very few cmd-guide mappings — check extractor');
for (const [cmd, guides] of Object.entries(sortedGuidesForCmd).slice(0, 8)) {
  console.log(`  ${cmd}: ${guides.map(g=>g.id).join(', ')}`);
}
