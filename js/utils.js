/* 公共小工具 */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function escapeHTML(str = '') {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[m]));
}

export function escapeAttr(str = '') {
  return String(str).replace(/["']/g, (m) => ({ '"': '&quot;', "'": '&#39;' }[m]));
}

export function pickIcon(seed = '') {
  const icons = ['⌘', '✎', '♪', '✈', '◌', '✦', '𓆩', '☼', '◍', '✧'];
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return icons[Math.abs(h) % icons.length];
}

export function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  } catch { return ''; }
}

export function mdRender(md = '') {
  if (window.marked && md) return window.marked.parse(md);
  return `<p>${escapeHTML(md)}</p>`;
}

/** 页面进入视口时给 .reveal 加 .in（统一动画入口）
 *  保险措施：1.5 秒后没触发的强制显示，避免出现"内容卡在 opacity:0"的情况
 */
export function setupReveal(root = document) {
  const targets = $$('.reveal:not(.in)', root);
  if (!targets.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.06, rootMargin: '0px 0px 0px 0px' }
  );
  targets.forEach((el) => io.observe(el));

  // 兜底：1.5 秒后所有还没 .in 的强制 .in
  setTimeout(() => {
    targets.forEach((el) => {
      if (!el.classList.contains('in')) {
        el.classList.add('in');
        io.unobserve(el);
      }
    });
  }, 1500);
}

/** 简单事件委托 */
export function delegate(root, eventName, selector, handler) {
  root.addEventListener(eventName, (e) => {
    const t = e.target.closest(selector);
    if (t && root.contains(t)) handler(e, t);
  });
}
