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
          ${c.email ? renderIcon('✉', '邮箱', c.email, true) : ''}
          ${c.github ? renderIcon('⌂', 'GitHub', c.github, false) : ''}
          ${c.blog ? renderIcon('☵', '博客', c.blog, false) : ''}
          ${c.resume ? renderIcon('⤓', '简历下载', c.resume, false) : ''}
          ${(!c.email && !c.github && !c.blog && !c.resume) ? '<p class="muted center" style="color:rgba(255,255,255,0.7)">联系方式留空中。等你去 admin 里填上 ✦</p>' : ''}
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

function renderIcon(symbol, label, value, isEmail) {
  const href = isEmail ? `mailto:${value}` : value;
  const dataCopy = isEmail ? `data-copy="${escapeAttr(value)}"` : '';
  return `
    <a class="contact-icon" href="${escapeAttr(href)}" target="${isEmail ? '_self' : '_blank'}" rel="noopener" ${dataCopy}>
      <span class="icon-glyph">${symbol}</span>
      <span class="icon-text">${escapeHTML(label)}</span>
    </a>`;
}
