/* SPA 伪路由：pushState + view 切换，不刷新页面 */

import { $, setupReveal } from './utils.js';
import { applyWindText, reapplySky } from './animations.js';

const ROUTES = {};
let currentView = null;
let firstNavigation = true;

/** 注册一个路由 */
export function registerRoute(path, view) {
  ROUTES[path] = view;
}

/** 切换到某条路由 */
export async function navigate(path, { push = true } = {}) {
  // 默认根路径就是 home
  const cleanPath = path.split('?')[0].split('#')[0];
  const matched = matchRoute(cleanPath);
  if (!matched) return;

  const { view, params } = matched;
  const container = $('#view-container');
  if (!container) return;

  // leave 旧 view
  if (currentView && currentView.leave) {
    try { await currentView.leave(); } catch (e) { console.warn(e); }
  }

  // 仪式感过场（首次进子页）
  const isFirstSubPage = firstNavigation && cleanPath !== '/' && cleanPath !== '/home';
  if (isFirstSubPage) {
    document.body.classList.add('cloud-transition');
    await sleep(500);
  } else {
    if (typeof gsap !== 'undefined') {
      gsap.to(container, { opacity: 0, y: 8, duration: 0.18, ease: 'power1.in' });
      await sleep(180);
    } else {
      container.classList.add('view-leaving');
      await sleep(180);
    }
  }

  // 渲染新 view
  container.innerHTML = '';
  container.classList.remove('view-leaving');
  if (typeof gsap !== 'undefined') gsap.set(container, { opacity: 1, y: 0 });
  await view.render(container, params);
  applyWindText(container);
  setupReveal(container);

  // enter
  if (view.enter) try { await view.enter(); } catch (e) { console.warn(e); }
  currentView = view;

  // pushState
  if (push) history.pushState({ path: cleanPath }, '', cleanPath);

  // 滚回顶
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (isFirstSubPage) {
    await sleep(400);
    document.body.classList.remove('cloud-transition');
  } else {
    if (typeof gsap !== 'undefined') {
      gsap.from(container, { opacity: 0, y: 8, duration: 0.25, ease: 'power2.out' });
    } else {
      container.classList.add('view-entering');
      requestAnimationFrame(() => container.classList.remove('view-entering'));
    }
  }

  // sky 重算（页面高度变了）
  reapplySky();

  // 高亮当前 nav 链接
  highlightNav(cleanPath);

  firstNavigation = false;
}

/** 路由匹配，支持 /works/:slug 这样的动态路径 */
function matchRoute(path) {
  const exact = ROUTES[path];
  if (exact) return { view: exact, params: {} };

  // 模糊匹配 :slug 形式
  for (const pattern of Object.keys(ROUTES)) {
    if (!pattern.includes(':')) continue;
    const re = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
    const m = path.match(re);
    if (m) {
      const keys = pattern.match(/:[^/]+/g).map((k) => k.slice(1));
      const params = Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return { view: ROUTES[pattern], params };
    }
  }

  // 没匹配上，回退到首页
  return { view: ROUTES['/'], params: {} };
}

function highlightNav(path) {
  document.querySelectorAll('[data-route]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
    else if (href === '/' && (path === '/' || path === '/home')) a.classList.add('active');
    else a.classList.remove('active');
  });
}

/** 拦截 [data-route] 链接的 click */
export function setupNavClicks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-route]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
    e.preventDefault();
    navigate(href);
  });

  window.addEventListener('popstate', () => {
    navigate(location.pathname, { push: false });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
