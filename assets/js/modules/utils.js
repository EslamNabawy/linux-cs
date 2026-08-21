// utils.js — pure helpers
export function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
export function escapeCopyAttr(s) { return escapeHtml(s).replace(/\n/g, '&#10;').replace(/\r/g, ''); }
export function stripHtml(s) { return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
export function getNoteText(blocks) {
  return blocks.map(b => {
    if (b.t === 'text' || b.t === 'callout') return stripHtml(b.html || '');
    if (b.t === 'arabic') return b.text || '';
    if (b.t === 'code') return b.code || '';
    if (b.t === 'table') return (b.head || []).concat(...(b.rows || [])).join(' ');
    if (b.t === 'list' || b.t === 'steps') return (b.items || []).join(' ');
    return '';
  }).join(' ').toLowerCase();
}
export function escId(s) { return String(s).replace(/[^a-zA-Z0-9_-]/g, '_'); }
export function copyText(text, btn) {
  const onSuccess = () => {
    btn.classList.add('copied');
    const original = btn.getAttribute('aria-label') || 'Copy';
    btn.setAttribute('aria-label', 'Copied!');
    showToast('Copied to clipboard');
    setTimeout(() => { btn.classList.remove('copied'); btn.setAttribute('aria-label', original); }, 1500);
  };
  const fallback = (t) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = t; ta.setAttribute('readonly','');
      ta.style.position = 'absolute'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      onSuccess();
    } catch(_e) { showToast('Copy failed'); }
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallback(text));
  } else fallback(text);
}
export function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'toast';
    t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
    Object.assign(t.style, {position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%) translateY(20px)',background:'var(--bg-elevated)',color:'var(--text)',border:'1px solid var(--border)',padding:'10px 16px',borderRadius:'999px',fontSize:'13px',zIndex:'9999',opacity:'0',transition:'opacity 180ms, transform 180ms',pointerEvents:'none',boxShadow:'var(--shadow)'});
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._hide); t._hide = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(10px)'; }, 1800);
}
