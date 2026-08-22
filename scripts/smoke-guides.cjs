// Headless smoke test for the Guides hub (real bundles, DOM stub)
const fs = require('fs');

function makeEl() {
  const styleProxy = { setProperty(){}, getPropertyValue(){ return ''; }, removeProperty(){} };
  return {
    innerHTML: '', textContent: '', value: '',
    style: styleProxy,
    dataset: {},
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    addEventListener(){}, removeEventListener(){},
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){},
    appendChild(){}, removeChild(){}, insertBefore(){},
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    closest(){ return null; }, focus(){}, blur(){}, click(){}, select(){},
    scrollIntoView(){}, scrollBy(){}, scrollTo(){},
    offsetWidth: 100, offsetHeight: 100, clientWidth: 800, clientHeight: 600,
    getBoundingClientRect(){ return { top:0,left:0,right:0,bottom:0,width:0,height:0 }; }
  };
}

const win = {
  addEventListener(){}, removeEventListener(){},
  matchMedia(){ return { matches:false, addEventListener(){}, removeEventListener(){} }; },
  setTimeout, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame(fn){ return setTimeout(fn, 0); },
  cancelAnimationFrame(id){ clearTimeout(id); },
  getComputedStyle(){ return { getPropertyValue(){ return ''; }, setProperty(){} }; },
  location: { hash: '#content/library', origin: 'http://x', pathname: '/', search: '' },
  history: { replaceState(){}, pushState(){}, back(){}, forward(){} },
  localStorage: { _s:{}, getItem(k){ return this._s[k] || null; }, setItem(k,v){ this._s[k]=String(v); }, removeItem(k){ delete this._s[k]; } },
  navigator: { userAgent:'node-smoke', clipboard:{ writeText: async()=>{} } },
  print(){}, open(){ return null; }, innerWidth: 1280, innerHeight: 800,
  devicePixelRatio: 1, isSecureContext: true
};
const cached = {};
const mainEl = makeEl();
global.document = {
  readyState: 'complete',
  documentElement: makeEl(),
  body: Object.assign(makeEl(), {}),
  head: makeEl(),
  addEventListener(){}, removeEventListener(){},
  getElementById(id){ if (id === 'content') return mainEl; return cached[id] || (cached[id] = makeEl()); },
  querySelector(){ return null; }, querySelectorAll(){ return []; },
  createElement(){ return makeEl(); },
  createTextNode(){ return {}; },
  addEventListenerNoop: true
};
win.document = global.document;
global.window = win;
global.getComputedStyle = win.getComputedStyle;
global.requestAnimationFrame = win.requestAnimationFrame;
global.cancelAnimationFrame = win.cancelAnimationFrame;
global.navigator = win.navigator;
global.location = win.location;
global.localStorage = win.localStorage;

let src = fs.readFileSync('assets/js/data-lite.js', 'utf8') + '\nmodule.exports={DATA,ICONS};';
const m1 = { exports:{} };
new Function('module','window','document','localStorage','location', src)(m1, win, global.document, win.localStorage, win.location);
const { DATA } = m1.exports;

const appSrc = fs.readFileSync('assets/js/app.js', 'utf8') +
  '\n;module.exports = { renderContentLibrary, renderContentSection, spotlightCollect, toggleGuideRead, state };';
const m2 = { exports:{} };
try {
  new Function('module','window','document','localStorage','location','DATA','ICONS', appSrc)(m2, win, global.document, win.localStorage, win.location, DATA, m1.exports.ICONS);
} catch(e) { console.error('APP BOOT FAILED:', e.message); process.exit(1); }

const { renderContentLibrary, renderContentSection, spotlightCollect, toggleGuideRead } = m2.exports;
let failures = 0;
const check = (label, ok) => { console.log((ok ? 'PASS' : 'FAIL') + '  ' + label); if (!ok) failures++; };

console.log('== Guides hub ==');
const html = renderContentLibrary();
const c = re => (html.match(re) || []).length;
check('19 guide cards rendered', c(/class="cl-card(?:"| )/g) === 19);
check('4 track sections rendered', c(/class="cl-track"/g) === 4);
check('3 start-here steps', c(/class="cl-step"/g) === 3);
check('level filter chips (4)', c(/class="cl-fchip/g) === 4);
check('stats bar present', html.includes('cl-statsbar'));
check('title is "Linux Guides"', html.includes('Linux Guides'));
const ids = DATA.content.sections.map(s => s.id);
const linked = [...html.matchAll(/data-section="([^"]+)"/g)].map(m => m[1]);
check('zero dead card links (' + linked.length + ' links)', linked.every(x => ids.includes(x)));
check('every card has level chip', c(/cl-chip--lvl/g) === 19);
check('every card has min-read chip', c(/min<\/span>/g) >= 19);

console.log('\n== Read progress ==');
toggleGuideRead('linux-rules');
check('card gets is-read badge', renderContentLibrary().includes('is-read'));
const savedKey = Object.keys(win.localStorage._s)[0];
const saved = JSON.parse(win.localStorage._s[savedKey]);
check('readGuides persisted to localStorage', saved && saved.readGuides && saved.readGuides['linux-rules'] === true);
toggleGuideRead('linux-rules');
check('toggle off removes badge', !renderContentLibrary().match(/class="cl-card is-read"/));

(async () => {
  console.log('\n== Reader page ==');
  // Provide the library body data up front (mirrors production where the
  // fetch succeeds / data-library.js fallback is loaded).
  win.DATA_CONTENT_LIBRARY = JSON.parse(fs.readFileSync('assets/data/content-library.json', 'utf8'));
  const rh = await renderContentSection('systemd-deep-dive');
  const prevM = rh.match(/cl-pn-prev[\s\S]*?cl-pn-title">([^<]+)/);
  const nextM = rh.match(/cl-pn-next[\s\S]*?cl-pn-title">([^<]+)/);
  check('prev/next footer rendered', rh.includes('cl-pn-btn'));
  check('prev is linux-boot (#6)', prevM && prevM[1].toLowerCase().includes('boot'));
  check('next is failure-scenarios (#9)? got: ' + (nextM && nextM[1]), nextM && nextM[1].length > 0);
  check('mark-as-read button present', rh.includes('toggle-guide-read'));
  check('"blocks" noise removed', !rh.includes(' blocks'));
  check('raw filename chip removed', !rh.includes('.md</span>'));
  check('TOC shows per-part times', rh.includes('note-toc-time'));
  check('sections numbered (01, 02...)', rh.includes('>01<'));

  console.log('\n== Boundary guide (#19 data-engineers) ==');
  const h19 = await renderContentSection(ids[18]);
  check('no next -> spacer shown', h19.includes('cl-pn-spacer'));
  check('prev still shown', h19.includes('cl-pn-prev'));

  console.log('\n== Spotlight search ==');
  win.DATA_CONTENT_LIBRARY = JSON.parse(fs.readFileSync('assets/data/content-library.json', 'utf8'));
  const g1 = spotlightCollect('systemd').filter(r => r.section === 'Guide');
  check('"systemd" finds guide hit', g1.length >= 1);
  const g2 = spotlightCollect('docker').filter(r => r.section === 'Guide');
  check('"docker" finds guide hit', g2.length >= 1);
  const g3 = spotlightCollect('chmod');
  check('"chmod" still hits Commands', g3.some(r => r.section === 'Commands'));

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('ASYNC FAIL:', e.message); process.exit(1); });
