/* 全局动效：羽毛、滚动天空渐变、视差、风吹文字 */

import { $, $$ } from './utils.js';

/* ---------- 羽毛 ---------- */
export function spawnFeathers() {
  const featherChars = ['𓆩', '✦', '◌', '𓆪', '·', '✧'];
  const container = $('#feathers');
  if (!container) return;
  // GSAP 是 CDN 依赖：没加载到就跳过羽毛动效，不能让它抛错拖垮整站
  if (typeof gsap === 'undefined') return;
  const COUNT = 18;
  for (let i = 0; i < COUNT; i++) {
    const f = document.createElement('span');
    f.className = 'feather';
    f.textContent = featherChars[Math.floor(Math.random() * featherChars.length)];
    f.style.left = Math.random() * 100 + 'vw';
    f.style.fontSize = (14 + Math.random() * 18) + 'px';
    f.style.opacity = 0.5 + Math.random() * 0.5;
    f.style.top = '-50px';
    container.appendChild(f);

    // GSAP 驱动的自然飘落
    const dur = 16 + Math.random() * 18;
    const xDrift = (Math.random() - 0.5) * 200;
    gsap.set(f, { y: -50, rotation: 0 });
    gsap.to(f, {
      y: window.innerHeight + 100,
      x: xDrift,
      rotation: (Math.random() - 0.5) * 720,
      duration: dur,
      ease: 'none',
      repeat: -1,
      delay: -(Math.random() * dur),
    });
  }
}

/* ---------- 滚动驱动的天空渐变 + 滚动方向感知 ---------- */
let scrollDir = 1;
let lastY = 0;

function lerpColor(c1, c2, t) {
  const p1 = hexToRGB(c1), p2 = hexToRGB(c2);
  const r = Math.round(p1.r + (p2.r - p1.r) * t);
  const g = Math.round(p1.g + (p2.g - p1.g) * t);
  const b = Math.round(p1.b + (p2.b - p1.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
function hexToRGB(hex) {
  const h = hex.replace('#', '');
  const num = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

const SKY_STOPS = [
  { top: '#fdfaf3', mid: '#f4eee4', bot: '#d9e6f2' },
  { top: '#f7f0e3', mid: '#dde7f0', bot: '#a8c5e0' },
  { top: '#f3d9c2', mid: '#e7c5b6', bot: '#a8a4c4' },
  { top: '#1d2942', mid: '#243556', bot: '#0d162b' },
];

export function setupScrollBehavior() {
  const sky = $('#skyBg');
  const nav = $('#nav');
  const feather = $('#scrollFeather');

  function totalH() {
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  function applySky(ratio) {
    if (!sky) return;
    const seg = ratio * (SKY_STOPS.length - 1);
    const i = Math.floor(seg);
    const t = seg - i;
    const a = SKY_STOPS[i];
    const b = SKY_STOPS[Math.min(i + 1, SKY_STOPS.length - 1)];
    const top = lerpColor(a.top, b.top, t);
    const mid = lerpColor(a.mid, b.mid, t);
    const bot = lerpColor(a.bot, b.bot, t);
    sky.style.background = `radial-gradient(ellipse at top, ${top} 0%, transparent 55%), linear-gradient(180deg, ${top} 0%, ${mid} 50%, ${bot} 100%)`;
  }

  function onScroll() {
    const y = window.scrollY;
    const ratio = Math.min(1, Math.max(0, y / totalH()));
    scrollDir = y > lastY ? 1 : -1;
    lastY = y;

    if (nav) {
      if (y > 60) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
      if (scrollDir === 1 && y > 200) nav.classList.add('hide'); else nav.classList.remove('hide');
    }
    applySky(ratio);
    if (feather) feather.style.setProperty('--scroll-ratio', ratio.toFixed(3));
    document.documentElement.style.setProperty('--feather-speed', scrollDir === 1 ? '0.7' : '1.4');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // initial
  onScroll();

  // GSAP ScrollTrigger 驱动的增强效果
  if (typeof ScrollTrigger !== 'undefined') {
    // 章节渐入动画增强
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    });

    // 云朵视差增强
    gsap.utils.toArray('.cloud').forEach((cloud, i) => {
      gsap.to(cloud, {
        yPercent: -15 * (i + 1),
        ease: 'none',
        scrollTrigger: {
          trigger: cloud,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });
  }
}

/** 在路由切换后强制刷一次（页面高度变了）*/
export function reapplySky() {
  const sky = $('#skyBg');
  if (!sky) return;
  const ratio = Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)));
  applySkyHelper(sky, ratio);
}
function applySkyHelper(sky, ratio) {
  const seg = ratio * (SKY_STOPS.length - 1);
  const i = Math.floor(seg);
  const t = seg - i;
  const a = SKY_STOPS[i];
  const b = SKY_STOPS[Math.min(i + 1, SKY_STOPS.length - 1)];
  const top = lerpColor(a.top, b.top, t);
  const mid = lerpColor(a.mid, b.mid, t);
  const bot = lerpColor(a.bot, b.bot, t);
  sky.style.background = `radial-gradient(ellipse at top, ${top} 0%, transparent 55%), linear-gradient(180deg, ${top} 0%, ${mid} 50%, ${bot} 100%)`;
}

/* ---------- 鼠标视差 ---------- */
export function setupParallax() {
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5);
    const y = (e.clientY / window.innerHeight - 0.5);
    const portrait = $('.portrait-circle');
    if (portrait) portrait.style.transform = `translate(${x * 14}px, ${y * 14}px)`;
    $$('.cloud').forEach((c, i) => {
      const depth = (i + 1) * 4;
      c.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });
}

/* ---------- 风吹文字 ---------- */
export function applyWindText(root = document) {
  const targets = $$('[data-wind]:not([data-wind-applied])', root);
  targets.forEach((el) => {
    const text = el.textContent || '';
    el.innerHTML = '';
    el.setAttribute('data-wind-applied', '1');
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'wind-char';
      span.textContent = char === ' ' ? ' ' : char;
      span.style.setProperty('--i', i);
      el.appendChild(span);
    });
  });
  // 让所有 hero 触发 wind-on
  requestAnimationFrame(() => $$('.hero', root).forEach((h) => h.classList.add('wind-on')));
}

/* ---------- 序曲（首次访问用一次）---------- */
export function maybePlayPrelude() {
  const KEY = 'prelude_played';
  if (sessionStorage.getItem(KEY) === '1') return Promise.resolve();
  if (localStorage.getItem(KEY) === '1') return Promise.resolve();
  const overlay = document.createElement('div');
  overlay.className = 'prelude-overlay';
  overlay.innerHTML = `
    <div class="prelude-feather">𓆩</div>
    <button class="prelude-skip">跳 过 →</button>
  `;
  document.body.appendChild(overlay);
  // 点击跳过
  overlay.querySelector('.prelude-skip').addEventListener('click', () => fadeOut());
  // 自动 4 秒后淡出
  let done = false;
  function fadeOut() {
    if (done) return; done = true;
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 1200);
    sessionStorage.setItem(KEY, '1');
    localStorage.setItem(KEY, '1');
  }
  setTimeout(fadeOut, 4000);
  return new Promise((resolve) => setTimeout(resolve, 1200));
}
