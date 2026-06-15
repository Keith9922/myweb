/* 技能子页：按类别分组 + 熟练度，默认全部可见（不再藏在 hover）*/

import { CONTENT } from '../content.js';
import { escapeHTML } from '../utils.js';

const CAT_COLOR = {
  '前端': '#6f9bc4',
  '后端': '#c98f73',
  '设计': '#7fae8f',
  '工具': '#a98fc4',
  '其他': '#76828f',
};

export const view = {
  async render(container) {
    const items = CONTENT.skills?.items || [];
    // 按首次出现的类别顺序分组
    const order = [];
    const map = new Map();
    for (const s of items) {
      const cat = s.category || '其他';
      if (!map.has(cat)) { map.set(cat, []); order.push(cat); }
      map.get(cat).push(s);
    }

    container.innerHTML = `
      <section class="page skills-page">
        <div class="page-head reveal">
          <p class="page-eyebrow">Stack</p>
          <h1 class="page-title">手 艺 与 工 具</h1>
          <p class="page-lede">每一项都是真的用过、踩过坑的。实心点越多越熟，右边的数字是用过的年数。</p>
        </div>

        ${items.length === 0
          ? `<div class="empty-state reveal"><span class="empty-mark">𓆩</span><p>技能星图等你去 admin 里慢慢添。</p></div>`
          : `<div class="skill-groups">
              ${order.map((cat, gi) => renderGroup(cat, map.get(cat), gi)).join('')}
            </div>`}
      </section>
    `;
  },
  async enter() {},
  async leave() {},
};

function renderGroup(cat, list, gi) {
  const color = CAT_COLOR[cat] || CAT_COLOR['其他'];
  return `
    <div class="skill-group reveal" style="--cat-color:${color}; --delay:${gi * 0.08}s">
      <div class="skill-group-head">
        <span class="skill-group-mark">𓆩</span>
        <h2 class="skill-group-title">${escapeHTML(cat)}</h2>
        <span class="skill-group-line"></span>
        <span class="skill-group-count">${list.length}</span>
      </div>
      <ul class="skill-list">
        ${list.map(renderRow).join('')}
      </ul>
    </div>`;
}

function renderRow(s) {
  const level = Math.max(1, Math.min(5, s.level || 3));
  const dots = Array.from({ length: 5 }, (_, i) =>
    `<i class="${i < level ? 'on' : ''}"></i>`).join('');
  const years = s.years ? `${s.years} 年` : '';
  return `
    <li class="skill-row">
      <span class="skill-name">${escapeHTML(s.name)}</span>
      <span class="skill-meta">
        <span class="skill-dots" role="img" aria-label="熟练度 ${level} / 5">${dots}</span>
        ${years ? `<span class="skill-years">${years}</span>` : ''}
      </span>
    </li>`;
}
