/* 作品集子页：错落瀑布流 + 项目详情 zoom */

import { CONTENT, sortProjects, projectBySlug } from '../content.js';
import { escapeHTML, escapeAttr, pickIcon, mdRender, formatDate } from '../utils.js';

export const view = {
  async render(container) {
    const projects = sortProjects();
    container.innerHTML = `
      <section class="page works-page">
        <div class="page-head reveal">
          <p class="page-eyebrow">Works</p>
          <h1 class="page-title">散 落 的 片 羽</h1>
          <p class="page-lede">每一只都曾真的飞过 —— 一些做完的、做了一半的、为兴趣做的。</p>
        </div>

        <div class="works-waterfall">
          ${projects.map(renderCard).join('') || '<p class="muted center">作品集尚未起飞，去 admin 添加 ✦</p>'}
        </div>
      </section>
    `;
  },
  async enter() { /* nothing extra */ },
  async leave() { /* nothing */ },
};

/** 项目详情 view（动态 :slug）*/
export const detailView = {
  async render(container, params) {
    const p = projectBySlug(params.slug);
    if (!p) {
      container.innerHTML = `
        <section class="page works-detail">
          <div class="page-head"><h1 class="page-title">这朵云后面什么都没有</h1></div>
          <a class="lost-back" href="/works" data-route>← 回到作品集</a>
        </section>`;
      return;
    }
    const tags = (p.stack || []).map((t) => `<span class="card-tag">${escapeHTML(t)}</span>`).join('');
    const links = (p.links || []).map((l) =>
      `<a class="link-btn" href="${escapeAttr(l.url)}" target="_blank" rel="noopener">${escapeHTML(l.label || l.url)} ↗</a>`
    ).join('');

    container.innerHTML = `
      <article class="page works-detail">
        <a class="back-link" href="/works" data-route>← 回到作品集</a>

        <div class="detail-head reveal">
          <p class="detail-date">${formatDate(p.date)}</p>
          <h1 class="detail-title">${escapeHTML(p.title || '')}</h1>
          <div class="card-tags">${tags}</div>
        </div>

        ${p.cover ? `<div class="detail-cover reveal" style="background-image:url('${escapeAttr(p.cover)}')"></div>` : ''}

        <div class="detail-summary reveal">
          <p>${escapeHTML(p.summary || '')}</p>
        </div>

        <div class="detail-body reveal">
          ${mdRender(p.body_md || '')}
        </div>

        ${links ? `<div class="detail-links reveal">${links}</div>` : ''}

        <a class="back-link bottom" href="/works" data-route>← 回到作品集</a>
      </article>
    `;
  },
};

function renderCard(p, i) {
  const cover = p.cover
    ? `<div class="card-cover" style="background-image:url('${escapeAttr(p.cover)}')"></div>`
    : `<div class="card-icon">${pickIcon(p.title)}</div>`;
  const tags = (p.stack || []).map((t) => `<span class="card-tag">${escapeHTML(t)}</span>`).join('');
  // 错落瀑布流通过随机变量打乱卡片大小
  const variant = ['', 'tall', 'short', ''][i % 4];
  return `
    <a class="work-card waterfall-card reveal ${variant}" href="/works/${escapeAttr(p.slug)}" data-route style="--delay:${(i % 6) * 0.08}s">
      ${cover}
      <p class="card-date">${formatDate(p.date)}</p>
      <h3>${escapeHTML(p.title || '')}</h3>
      <p class="card-summary">${escapeHTML(p.summary || '')}</p>
      <div class="card-tags">${tags}</div>
    </a>`;
}
