/* SPA 入口：装载所有 view，启动路由，跑全局动效 */

import { loadAllContent, CONTENT } from './content.js';
import { spawnFeathers, setupScrollBehavior, setupParallax } from './animations.js';
import { initParticles } from './particles.js';
import { setupMusic } from './music.js';
import { registerRoute, navigate, setupNavClicks } from './router.js';
import { $ } from './utils.js';

import { view as homeView } from './views/home.js';
import { view as worksView, detailView as worksDetail } from './views/works.js';
import { view as skillsView } from './views/skills.js';
import { view as certsView } from './views/certificates.js';
import { view as aboutView } from './views/about.js';
import { view as contactView } from './views/contact.js';
import { view as blogView, detailView as blogDetail } from './views/blog.js';

async function main() {
  // 初始化 Lenis 平滑滚动（CDN 依赖，缺失则降级为原生滚动）
  let lenis = null;
  try {
    lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      lerp: 0.08,
      duration: 1.4,
      wheelMultiplier: 0.9,
    });
    // 同步 Lenis 到 GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  } catch (e) {
    console.warn('Lenis 初始化失败，降级为原生滚动：', e);
  }

  // 全局视觉与装饰：每一项都独立 try/catch，任一失败都不能拖垮路由/内容
  try { spawnFeathers(); } catch (e) { console.warn('feathers init failed', e); }
  try { setupScrollBehavior(); } catch (e) { console.warn('scroll init failed', e); }
  try { setupParallax(); } catch (e) { console.warn('parallax init failed', e); }

  // 初始化 Three.js 粒子背景（WebGL 不可用时内部已降级，这里再兜一层）
  try { initParticles(); } catch (e) { console.warn('particles init failed', e); }

  // 拉数据
  try { await loadAllContent(); } catch (e) { console.warn('content load failed', e); }

  // 应用全局信息（title / nav 名字 / footer copyright）
  if (CONTENT.site?.title) document.title = CONTENT.site.title;
  const navName = $('#navName');
  if (navName && CONTENT.about?.name) navName.textContent = CONTENT.about.name;
  const footerCopy = $('#footerCopy');
  if (footerCopy && CONTENT.site?.copyright) footerCopy.textContent = CONTENT.site.copyright;

  // 注册路由（注意 detail 路由要放在普通路由之后才能被精确匹配）
  registerRoute('/', homeView);
  registerRoute('/home', homeView);
  registerRoute('/about', aboutView);
  registerRoute('/works', worksView);
  registerRoute('/works/:slug', worksDetail);
  registerRoute('/skills', skillsView);
  registerRoute('/certificates', certsView);
  registerRoute('/blog', blogView);
  registerRoute('/blog/:slug', blogDetail);
  registerRoute('/contact', contactView);

  // 拦截 nav 链接的 click
  setupNavClicks();

  // 启动音乐（含 gate）
  setupMusic();

  // 渲染当前路由
  const initial = location.pathname || '/';
  await navigate(initial, { push: false });
}

main();
