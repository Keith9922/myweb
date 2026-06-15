/* 技能子页：星图 / 羽毛云 + hover 显示项目连线 */

import { CONTENT } from '../content.js';
import { escapeHTML, escapeAttr } from '../utils.js';

const CAT_COLORS = {
  '前端': '#b8d0e6',
  '后端': '#e8c8b8',
  '设计': '#c8d8b8',
  '工具': '#d8c8e6',
  '其他': '#cfd8e0',
};

export const view = {
  async render(container) {
    const items = CONTENT.skills?.items || [];
    container.innerHTML = `
      <section class="page skills-page">
        <div class="page-head reveal">
          <p class="page-eyebrow">Stack</p>
          <h1 class="page-title">羽 毛 云</h1>
          <p class="page-lede">每一根羽毛代表一项手艺。大小是熟练度，颜色是类别，鼠标靠近会亮起。</p>
        </div>

        <div class="skill-canvas" id="skillCanvas">
          ${items.length === 0 ? '<p class="muted center">技能星图等你去 admin 里慢慢添 ✦</p>' : ''}
          ${items.map((s, i) => renderStar(s, i)).join('')}
        </div>

        <div class="skill-legend reveal">
          ${Object.entries(CAT_COLORS).slice(0, 4).map(([cat, c]) =>
            `<span class="legend-item"><span class="legend-dot" style="background:${c}"></span>${cat}</span>`
          ).join('')}
        </div>
      </section>
    `;
  },
  async enter() {
    // 浮动动画用 CSS 已实现，这里只挂 hover 显示 tooltip
    const canvas = document.querySelector('#skillCanvas');
    if (!canvas) return;
    canvas.addEventListener('mouseover', (e) => {
      const star = e.target.closest('.skill-star');
      if (!star) return;
      star.classList.add('hovered');
    });
    canvas.addEventListener('mouseout', (e) => {
      const star = e.target.closest('.skill-star');
      if (!star) return;
      star.classList.remove('hovered');
    });
  },
  async leave() {},
};

function renderStar(s, i) {
  const cat = s.category || '其他';
  const color = CAT_COLORS[cat] || CAT_COLORS['其他'];
  const level = Math.max(1, Math.min(5, s.level || 3));
  const size = 36 + level * 12; // 48..96 px
  // 用伪随机散布
  const seed = hashCode(s.name + i);
  const top = 12 + (seed % 70);
  const left = 8 + ((seed >> 8) & 0xff) % 84;
  const dur = 12 + ((seed >> 4) & 0xf);
  return `
    <div class="skill-star reveal"
         data-cat="${escapeAttr(cat)}"
         style="top:${top}%; left:${left}%; --size:${size}px; --color:${color}; --dur:${dur}s; --delay:${(i % 8) * 0.08}s">
      <span class="star-glow"></span>
      <span class="star-name">${escapeHTML(s.name)}</span>
      <div class="star-tip">
        <strong>${escapeHTML(s.name)}</strong>
        <span>${escapeHTML(cat)} · ${s.years || 0} 年</span>
      </div>
    </div>`;
}

function hashCode(str) {
  let h = 0;
  for (const ch of str) h = ((h << 5) - h + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}
