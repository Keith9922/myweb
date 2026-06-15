/* 关于子页：飞行轨迹时间线 + 我喜欢的 */

import { CONTENT } from '../content.js';
import { escapeHTML, mdRender } from '../utils.js';

export const view = {
  async render(container) {
    const a = CONTENT.about || {};
    const tl = a.timeline || [];
    const interests = a.interests || [];
    container.innerHTML = `
      <section class="page about-page">
        <div class="page-head reveal">
          <p class="page-eyebrow">About</p>
          <h1 class="page-title">关 于 我</h1>
        </div>

        <div class="about-hero reveal">
          <div class="portrait-frame large"><div class="portrait-circle"></div><div class="portrait-feather">𓆩</div></div>
          <div class="about-name-block">
            <p class="self-desc">— ${escapeHTML(a.self_description || '一个仍在追风的人')} —</p>
            ${a.quote ? `<p class="about-quote">"${escapeHTML(a.quote)}"</p>` : ''}
            <div class="about-intro">${mdRender(a.intro_md || '')}</div>
            <ul class="about-tags">${(a.tags || []).map((t) => `<li>${escapeHTML(t)}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="section-divider reveal">
          <span class="divider-mark">𓆩</span>
        </div>

        <h2 class="subsection-title reveal">来 时 的 路</h2>
        <p class="subsection-lede reveal">飞行轨迹，按时间倒序。</p>

        <div class="flight-path">
          <svg class="path-svg" viewBox="0 0 100 ${Math.max(60, tl.length * 18)}" preserveAspectRatio="none">
            <path d="M 50 0 ${tl.map((_, i) => `Q ${i % 2 === 0 ? '20' : '80'} ${i * 18 + 6}, 50 ${i * 18 + 12}`).join(' ')}"
                  fill="none" stroke="rgba(43,58,74,0.35)" stroke-width="0.4"
                  stroke-dasharray="0.8 1.6" />
          </svg>
          ${tl.map((node, i) => renderTLNode(node, i)).join('') || '<p class="muted center">飞行轨迹尚未起飞，去 admin 添加 ✦</p>'}
        </div>

        <div class="section-divider reveal">
          <span class="divider-mark">✦</span>
        </div>

        <h2 class="subsection-title reveal">我 喜 欢 的</h2>
        <div class="interests-grid">
          ${interests.map((it) => `
            <div class="interest-card reveal">
              <p class="interest-cat">${escapeHTML(it.category || '')}</p>
              <p class="interest-val">${escapeHTML(it.value || '')}</p>
            </div>
          `).join('') || '<p class="muted center">还没在这里放东西。等等再来 ◌</p>'}
        </div>
      </section>
    `;
  },
  async enter() {},
  async leave() {},
};

function renderTLNode(node, i) {
  const side = i % 2 === 0 ? 'left' : 'right';
  return `
    <div class="tl-node ${side} reveal" style="--delay:${i * 0.08}s">
      <div class="tl-dot"></div>
      <div class="tl-card">
        <p class="tl-year">${escapeHTML(node.year || '')}</p>
        <h4>${escapeHTML(node.title || '')}</h4>
        ${node.description ? `<p>${escapeHTML(node.description)}</p>` : ''}
      </div>
    </div>`;
}
