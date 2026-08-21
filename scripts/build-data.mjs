import fs from 'fs';
import path from 'path';
import vm from 'vm';

const dataJs = fs.readFileSync('assets/js/data.js', 'utf8');
// Extract DATA definition via VM - run in sandbox
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(dataJs + '\nresult = {DATA, ICONS};', sandbox);
const { DATA, ICONS } = sandbox.result;

// Ensure output dir
fs.mkdirSync('assets/data', { recursive: true });

// 1. index manifest
const index = {
  categories: DATA.categories.map(c => ({ id: c.id, title: c.title, icon: c.icon, count: c.commands.length })),
  commandsBankCount: DATA.commandsBank.length,
  notes: Object.keys(DATA.notes || {}),
  ntiDays: Object.keys(DATA.nti?.days || {}),
  flashcardsCount: DATA.nti?.flashcards?.length || 0
};
fs.writeFileSync('assets/data/index.json', JSON.stringify(index, null, 2));

// 2. commands merged
fs.writeFileSync('assets/data/commands.json', JSON.stringify({ categories: DATA.categories, commandsBank: DATA.commandsBank }, null, 2));

// 3. nti canonical
fs.writeFileSync('assets/data/nti.json', JSON.stringify(DATA.nti, null, 2));

// 4. notes per author
for (const [k, v] of Object.entries(DATA.notes || {})) {
  fs.writeFileSync(`assets/data/notes-${k}.json`, JSON.stringify(v, null, 2));
}
fs.mkdirSync('assets/data/notes', { recursive: true });
for (const [k, v] of Object.entries(DATA.notes || {})) {
  fs.writeFileSync(`assets/data/notes/${k}.json`, JSON.stringify(v, null, 2));
}

// 5. labs
fs.writeFileSync('assets/data/labs.json', JSON.stringify(DATA.nti?.labs || DATA.labs || {}, null, 2));

// 6. flashcards
fs.writeFileSync('assets/data/flashcards.json', JSON.stringify(DATA.nti?.flashcards || [], null, 2));

// 7. exercises + links + course
fs.writeFileSync('assets/data/exercises.json', JSON.stringify(DATA.exercises || [], null, 2));
fs.writeFileSync('assets/data/links.json', JSON.stringify(DATA.links || {}, null, 2));
fs.writeFileSync('assets/data/course.json', JSON.stringify(DATA.course || {}, null, 2));

console.log('Generated assets/data/*');
console.log('index', index);
