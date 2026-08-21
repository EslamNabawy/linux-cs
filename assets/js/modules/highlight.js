// highlight.js — pure syntax highlighting
import { escapeHtml } from './utils.js';
export function highlightCode(code) {
  let s = String(code).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/(#.*$)/gm, '<span class="comment-token">$1</span>');
  s = s.replace(/"([^"]*)"/g, '<span class="str-token">"$1"</span>');
  s = s.replace(/(~\/[^\s<>"'|]*)/g, '<span class="path-token">$1</span>');
  s = s.replace(/(?<![~\w"'>])(\/[^\s<>"'|]*)/g, '<span class="path-token">$1</span>');
  s = s.replace(/(\s)(-{1,2}[a-zA-Z][\w-]*)/g, '$1<span class="flag-token">$2</span>');
  return s;
}
export function highlightCommandName(cmd) {
  if (!cmd) return '';
  const parts = String(cmd).split(' ');
  return `<span class="cmd-token">${escapeHtml(parts[0])}</span>` + (parts.length > 1 ? ' ' + escapeHtml(parts.slice(1).join(' ')) : '');
}
export function highlightMatch(text, term) {
  if (!term || !text) return text;
  const escTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escTerm})`, 'gi');
  if (text.includes('<')) {
    return text.split(/(<[^>]*>)/g).map(part => {
      if (part.startsWith('<')) return part;
      return part.replace(regex, '<mark>$1</mark>');
    }).join('');
  }
  return text.replace(regex, '<mark>$1</mark>');
}
