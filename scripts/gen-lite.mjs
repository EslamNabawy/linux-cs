import fs from 'fs';
import vm from 'vm';
const src = fs.readFileSync('assets/js/data.js','utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(src + '\nresult={DATA,ICONS};', sandbox);
const {DATA, ICONS} = sandbox.result;
const lite = {
  categories: DATA.categories,
  commandsBank: DATA.commandsBank,
  exercises: DATA.exercises,
  links: DATA.links,
  helpfulLinks: DATA.helpfulLinks,
  course: DATA.course,
  topicIndex: DATA.topicIndex
};
// Build lite file by stringifying then fixing ICONS manually from original source
let iconsSrc = src.slice(src.indexOf('const ICONS'));
iconsSrc = iconsSrc.slice(0, iconsSrc.indexOf('};')+2);
let liteJs = 'const DATA = ' + JSON.stringify(lite, null, 2) + ';\n\n' + iconsSrc + '\n';
fs.writeFileSync('assets/js/data-lite.js', liteJs);
console.log('lite size', Buffer.byteLength(liteJs)/1024, 'KB original', Buffer.byteLength(src)/1024);
