// state.js — centralized state, persistence, migration
export const STORAGE_KEY = 'linuxcs_state_v2';
const LEGACY_KEY = 'linuxcs_state_v1';

function loadState() {
  try {
    let saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') return saved;
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (legacy && typeof legacy === 'object') {
      try { localStorage.removeItem(LEGACY_KEY); } catch(_e) {}
      return legacy;
    }
  } catch (e) { /* ignore */ }
  return {};
}
export function pruneCollapsed(obj, validKeys) {
  if (!obj || typeof obj !== 'object') return {};
  const out = {};
  const set = new Set(validKeys);
  for (const k of Object.keys(obj)) if (set.has(k)) out[k] = obj[k];
  return out;
}
const savedState = loadState();
export const THEMES = ['dark', 'midnight', 'light', 'paper'];
export const THEME_LABELS = { dark: 'Dark', midnight: 'Midnight', light: 'Light', paper: 'Paper' };
const _validTheme = THEMES.includes(savedState.theme) ? savedState.theme : 'dark';
export const state = {
  tab: savedState.tab || 'general',
  view: savedState.view || 'cheatsheet',
  searchTerm: '',
  cmdTerm: savedState.cmdTerm || '',
  cmdCats: savedState.cmdCats || [],
  theme: _validTheme,
  collapsedCategories: savedState.collapsedCategories || {},
  collapsedExercises: savedState.collapsedExercises || {},
  collapsedDeepDives: savedState.collapsedDeepDives || {},
  collapsedRH124: savedState.collapsedRH124 || {},
  collapsedBank: savedState.collapsedBank || {},
  collapsedNotes: savedState.collapsedNotes || {},
  collapsedGroups: savedState.collapsedGroups || {},
  recentViews: savedState.recentViews || [],
  completedLab: savedState.completedLab || {},
  completedModules: savedState.completedModules || {},
  expandedModules: savedState.expandedModules || {},
  quizScores: savedState.quizScores || {}
};
export function saveState() {
  const persist = {
    tab: state.tab, view: state.view, cmdTerm: state.cmdTerm, cmdCats: state.cmdCats, theme: state.theme,
    collapsedCategories: state.collapsedCategories, collapsedExercises: state.collapsedExercises, collapsedDeepDives: state.collapsedDeepDives,
    collapsedRH124: state.collapsedRH124, collapsedBank: state.collapsedBank, collapsedNotes: state.collapsedNotes,
    collapsedGroups: state.collapsedGroups, recentViews: state.recentViews, completedLab: state.completedLab,
    completedModules: state.completedModules, expandedModules: state.expandedModules, quizScores: state.quizScores
  };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(persist)); } catch (e) { /* ignore */ }
}
export function pushRecent(view) {
  if (!view) return;
  state.recentViews = [view, ...state.recentViews.filter(v => v !== view)].slice(0, 10);
}
