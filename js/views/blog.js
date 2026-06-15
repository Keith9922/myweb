/* 博客子页：飞书文档卡片列表 + 单篇详情（external 默认 / inline fallback）*/

import { CONTENT, sortByDateDesc, blogBySlug } from '../content.js';
import { escapeHTML, escapeAttr, formatDate } from '../utils.js';

export const view = {
  async render(container) {
    const items = sortByDateDesc(CONTENT.blog);
    container.innerHTML = `
      <section class="page blog-page">
        <div class="page-head reveal">
          <p class="page-eyebrow">Notes</p>
          <h1 class="page-title">飞 起 的 字</h1>
          <p class="page-lede">写在飞书里的一些经验、笔记、思考。点击进入查看。</p>
        </div>

        <div class="blog-grid">
          ${items.map(renderCard).join('') || '<div class="empty-state reveal"><span class="empty-mark">𓆩</span><p>这片云上还没有字。<br/>等等再来 ✎</p></div>'}
        </div>
      </section>
    `;
  },
};

export const detailView = {
  async render(container, params) {
    const b = blogBySlug(params.slug);
    if (!b) {
      container.innerHTML = `
        <section class="page blog-detail">
          <div class="page-head"><h1 class="page-title">这朵云后面什么都没有</h1></div>
          <a class="lost-back" href="/blog" data-route>← 回到博客</a>
        </section>`;
      return;
    }

    const isInline = b.embed_mode === 'inline';
    const url = b.feishu_url;

    container.innerHTML = `
      <article class="page blog-detail">
        <a class="back-link" href="/blog" data-route>← 回到博客</a>

        <div class="detail-head reveal">
          <p class="detail-date">${formatDate(b.date)}</p>
          <h1 class="detail-title">${escapeHTML(b.title || '')}</h1>
          <p class="detail-summary">${escapeHTML(b.summary || '')}</p>
          ${(b.tags || []).length ? `<div class="card-tags">${b.tags.map((t) => `<span class="card-tag">${escapeHTML(t)}</span>`).join('')}</div>` : ''}
        </div>

        ${isInline ? `
          <div class="feishu-embed reveal" id="feishuEmbed" data-loading="1">
            <div class="embed-loading">
              <span class="loading-feather">𓆩</span>
              <p>正在打开飞书文档…</p>
            </div>
            <iframe class="embed-iframe"
                    src="${escapeAttr(url)}"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    referrerpolicy="origin-when-cross-origin"
                    loading="lazy"></iframe>
            <div class="embed-fallback" hidden>
              <p>这篇文档没法在页面里直接展示——</p>
              <a class="link-btn primary" href="${escapeAttr(url)}" target="_blank" rel="noopener">在飞书中打开 ↗</a>
            </div>
          </div>
        ` : `
          <div class="external-card reveal">
            ${b.cover ? `<div class="external-cover"><img src="${escapeAttr(b.cover)}" alt="${escapeAttr(b.title || '')}" loading="lazy" /></div>` : ''}
            <p class="external-hint">这篇文章在飞书里。</p>
            <a class="link-btn primary big" href="${escapeAttr(url)}" target="_blank" rel="noopener">
              <span>在 飞 书 中 阅 读</span>
              <span style="font-family:serif">↗</span>
            </a>
            <p class="muted small">将在新窗口打开</p>
          </div>
        `}

        <a class="back-link bottom" href="/blog" data-route>← 回到博客</a>
      </article>
    `;
  },
  async enter() {
    // inline 模式的 8 秒超时 fallback
    const wrap = document.querySelector('#feishuEmbed');
    if (!wrap) return;
    const iframe = wrap.querySelector('.embed-iframe');
    const loading = wrap.querySelector('.embed-loading');
    const fb = wrap.querySelector('.embed-fallback');

    let succeeded = false;
    iframe.addEventListener('load', () => {
      // 飞书的 iframe load 事件即便被 X-Frame 拦也会触发，所以我们看 contentDocument 是不是空的
      try {
        const doc = iframe.contentDocument;
        if (doc && doc.body && doc.body.children.length === 0) {
          // 通常 X-Frame 拦截后是空的
          showFallback();
          return;
        }
      } catch {
        // 跨域是正常的（说明真的载到了飞书的 origin）
        succeeded = true;
        loading.style.display = 'none';
      }
    });

    setTimeout(() => {
      if (!succeeded && wrap.dataset.loading === '1') showFallback();
    }, 8000);

    function showFallback() {
      iframe.style.display = 'none';
      loading.style.display = 'none';
      fb.hidden = false;
      wrap.dataset.loading = '0';
    }
  },
};

function renderCard(b, i) {
  return `
    <a class="blog-card reveal" href="/blog/${escapeAttr(b.slug)}" data-route style="--delay:${(i % 6) * 0.08}s">
      ${b.cover ? `<div class="card-cover"><img src="${escapeAttr(b.cover)}" alt="${escapeAttr(b.title || '')}" loading="lazy" /></div>` : ''}
      <p class="card-date">${formatDate(b.date)}</p>
      <h3>${escapeHTML(b.title || '')}</h3>
      <p class="card-summary">${escapeHTML(b.summary || '')}</p>
      <div class="card-tags">${(b.tags || []).map((t) => `<span class="card-tag">${escapeHTML(t)}</span>`).join('')}</div>
    </a>`;
}
