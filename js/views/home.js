/* 首页：玄关。每节都是子页的引子 */

import { CONTENT, sortProjects } from '../content.js';
import { escapeHTML, escapeAttr, pickIcon, mdRender } from '../utils.js';

export const view = {
  async render(container) {
    const a = CONTENT.about || {};
    const featured = sortProjects().filter((p) => p.featured).slice(0, 3);
    const recentBlog = [...CONTENT.blog]
      .sort((x, y) => new Date(y.date || 0) - new Date(x.date || 0))
      .slice(0, 3);
    const skills = (CONTENT.skills?.items || []).slice(0, 6);

    container.innerHTML = `
      <section class="hero" id="hero">
        <div class="hero-inner">
          <h1 class="hero-title">
            <span class="title-line" data-wind>风过留声</span>
            <span class="title-line title-line--alt" data-wind>云自悠然</span>
          </h1>
          <div class="hero-byline reveal">
            <span class="byline-dot">·</span>
            <span class="byline-name">${escapeHTML(a.name || '')}</span>
            <span class="byline-dot">·</span>
            <span class="byline-tag">${escapeHTML(a.tagline || '')}</span>
            <span class="byline-dot">·</span>
          </div>
          <div class="scroll-hint">
            <span>向 下 滚 动</span>
            <div class="scroll-line"></div>
          </div>
        </div>
      </section>

      <section class="section about-teaser" id="about-teaser">
        <div class="section-head reveal">
          <span class="section-num">01</span>
          <p class="section-eyebrow">About</p>
          <h2 class="section-title">关 于 我</h2>
        </div>
        <div class="teaser-row reveal">
          <div class="teaser-portrait">
            <div class="portrait-frame"><div class="portrait-circle"></div><div class="portrait-feather">𓆩</div></div>
          </div>
          <div class="teaser-text">
            ${a.quote ? `<p class="about-quote">"${escapeHTML(a.quote)}"</p>` : ''}
            <div class="teaser-intro">${mdRender(a.intro_md || '')}</div>
            <ul class="about-tags">${(a.tags || []).map((t) => `<li>${escapeHTML(t)}</li>`).join('')}</ul>
            <a class="teaser-more" href="/about" data-route>关于我 →</a>
          </div>
        </div>
      </section>

      <section class="section works-teaser" id="works-teaser">
        <div class="section-head reveal">
          <span class="section-num">02</span>
          <p class="section-eyebrow">Fragments</p>
          <h2 class="section-title">散 落 的 片 羽</h2>
        </div>
        <div class="works-grid">
          ${featured.map((p, i) => renderWorkCard(p, i)).join('') || renderWorksEmpty()}
        </div>
        <a class="teaser-more center" href="/works" data-route>查看全部作品 →</a>
      </section>

      <section class="section skills-teaser" id="skills-teaser">
        <div class="section-head reveal">
          <span class="section-num">03</span>
          <p class="section-eyebrow">Stack</p>
          <h2 class="section-title">羽 毛 云</h2>
        </div>
        <div class="skill-cloud reveal">
          ${skills.map((s) => `<span class="skill-bubble" data-cat="${escapeAttr(s.category || '')}">${escapeHTML(s.name)}</span>`).join('') || '<p class="muted">技能星图将在 admin 里慢慢填上 ✦</p>'}
        </div>
        <a class="teaser-more center" href="/skills" data-route>完整技能树 →</a>
      </section>

      <section class="section blog-teaser" id="blog-teaser">
        <div class="section-head reveal">
          <span class="section-num">04</span>
          <p class="section-eyebrow">Notes</p>
          <h2 class="section-title">近 期 笔 记</h2>
        </div>
        <div class="blog-row">
          ${recentBlog.map(renderBlogTeaser).join('') || '<p class="muted center">尚未飞起的字。等等再来 ✎</p>'}
        </div>
        <a class="teaser-more center" href="/blog" data-route>所有文章 →</a>
      </section>

      <section class="section letter" id="letter-teaser">
        <div class="section-head reveal">
          <span class="section-num">05</span>
          <p class="section-eyebrow">A Letter</p>
          <h2 class="section-title">写 给 你 的 信</h2>
        </div>
        <div class="letter-paper reveal">
          <p class="letter-line">致 · 偶然来到这里的你：</p>
          <p>如果你也喜欢这一刻正在播放的旋律，那么我们大概拥有过同一片天空。</p>
          <p>副歌升起的那一瞬，像是有人轻轻把云推开，让一束光照下来。</p>
          <p>愿你今天也能拥有这样一束光。<br />愿你的翅膀，从未折叠。</p>
          <p class="letter-sign">—— ${escapeHTML(a.name || '')}，于一个有风的午后</p>
          <a class="teaser-more letter-cta" href="/contact" data-route>给我写信 →</a>
        </div>
      </section>
    `;
  },

  async enter() {
    // GSAP 风吹文字动画
    if (typeof gsap !== 'undefined') {
      const chars = document.querySelectorAll('.wind-char');
      gsap.from(chars, {
        opacity: 0,
        x: 40,
        y: -10,
        rotation: 8,
        filter: 'blur(8px)',
        stagger: 0.06,
        duration: 0.9,
        ease: 'power2.out',
      });
    }
  },
  async leave() { /* nothing */ },
};

function renderWorkCard(p, i) {
  const tags = (p.stack || []).map((t) => `<span class="card-tag">${escapeHTML(t)}</span>`).join('');
  const cover = p.cover
    ? `<div class="card-cover" style="background-image:url('${escapeAttr(p.cover)}')"></div>`
    : `<div class="card-icon">${pickIcon(p.title)}</div>`;
  return `
    <article class="work-card reveal" style="--delay:${i * 0.1}s">
      <a href="/works/${escapeAttr(p.slug)}" data-route style="text-decoration:none;color:inherit;display:block">
        ${cover}
        <h3>${escapeHTML(p.title || '未命名')}</h3>
        <p>${escapeHTML(p.summary || '')}</p>
        <div class="card-tags">${tags}</div>
      </a>
    </article>`;
}

function renderWorksEmpty() {
  return '<p class="muted center">作品集尚未起飞，去 admin 加几个吧 ✦</p>';
}

function renderBlogTeaser(b) {
  return `
    <a class="blog-teaser-card reveal" href="/blog/${escapeAttr(b.slug)}" data-route>
      <p class="blog-date">${(b.date || '').slice(0, 10)}</p>
      <h4>${escapeHTML(b.title || '')}</h4>
      <p class="blog-summary">${escapeHTML(b.summary || '')}</p>
    </a>`;
}
