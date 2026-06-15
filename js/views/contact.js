/* 联系子页：信纸 + 联系图标 + 夜空背景 */

import { CONTENT } from '../content.js';
import { escapeHTML, escapeAttr } from '../utils.js';

export const view = {
  async render(container) {
    const c = CONTENT.site?.contact || {};
    const a = CONTENT.about || {};

    container.innerHTML = `
      <section class="page contact-page night-mode">
        <div class="stars-layer" aria-hidden="true">
          ${Array.from({length: 30}).map((_, i) => {
            const top = (i * 37) % 100;
            const left = (i * 53) % 100;
            const size = 4 + (i % 4);
            const delay = (i * 0.13) % 4;
            return `<span class="bg-star" style="top:${top}%;left:${left}%;width:${size}px;height:${size}px;animation-delay:${delay}s"></span>`;
          }).join('')}
          <span class="moon"></span>
        </div>

        <div class="page-head reveal">
          <p class="page-eyebrow">Contact</p>
          <h1 class="page-title">来 一 封 信</h1>
        </div>

        <div class="letter-paper night reveal">
          <p class="letter-line">致 · 偶然来到这里的你：</p>
          <p>能走到这里，已经是一种缘分。</p>
          <p>有时候我会希望，这片小空间不只是被路过，<br />还能让你愿意停下来，留几个字给我。</p>
          <p class="letter-sign">—— ${escapeHTML(a.name || '')}</p>
        </div>

        <div class="contact-icons reveal">
          ${c.email ? renderIcon('email', '邮箱', c.email, true) : ''}
          ${c.github ? renderIcon('github', 'GitHub', c.github, false) : ''}
          ${c.blog ? renderIcon('blog', '博客', c.blog, false) : ''}
          ${c.resume ? renderIcon('resume', '简历下载', c.resume, false) : ''}
          ${(!c.email && !c.github && !c.blog && !c.resume) ? '<p class="empty-state" style="color:rgba(244,238,228,0.78)">联系方式还留空着。等你在 admin 里填上 ✦</p>' : ''}
        </div>

        <p class="contact-coda reveal">夜 深 了 · 旅 程 结 束 — 晚 安</p>
      </section>
    `;
  },
  async enter() {
    // 邮箱点击复制
    document.querySelectorAll('.contact-icon[data-copy]').forEach((el) => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        const v = el.dataset.copy;
        try {
          await navigator.clipboard.writeText(v);
          const old = el.querySelector('.icon-text').textContent;
          el.querySelector('.icon-text').textContent = '已复制 ✓';
          setTimeout(() => { el.querySelector('.icon-text').textContent = old; }, 1600);
        } catch (err) {
          alert(v);
        }
      });
    });

    // BGM 在联系页声音变弱（用 CSS 让 toggle 视觉变弱；真正的音量我们改不了 iframe）
    document.body.classList.add('bgm-soft');
  },
  async leave() {
    document.body.classList.remove('bgm-soft');
  },
};

const ICON_SVG = {
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"/></svg>',
  blog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  resume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></svg>',
};

function renderIcon(name, label, value, isEmail) {
  const href = isEmail ? `mailto:${value}` : value;
  const dataCopy = isEmail ? `data-copy="${escapeAttr(value)}"` : '';
  return `
    <a class="contact-icon" href="${escapeAttr(href)}" target="${isEmail ? '_self' : '_blank'}" rel="noopener" ${dataCopy} aria-label="${escapeAttr(label)}">
      <span class="icon-glyph">${ICON_SVG[name] || ICON_SVG.email}</span>
      <span class="icon-text">${escapeHTML(label)}</span>
    </a>`;
}
