/* 证书子页：时间线 + 卡片 + lightbox */

import { CONTENT, sortByDateDesc } from '../content.js';
import { escapeHTML, escapeAttr, formatDate } from '../utils.js';

export const view = {
  async render(container) {
    const items = sortByDateDesc(CONTENT.certificates);
    container.innerHTML = `
      <section class="page certs-page">
        <div class="page-head reveal">
          <p class="page-eyebrow">Certificates</p>
          <h1 class="page-title">收 集 的 证 据</h1>
          <p class="page-lede">认真做过的事情，会留下痕迹。</p>
        </div>

        <div class="cert-timeline">
          <div class="timeline-line"></div>
          ${items.map((c, i) => renderCert(c, i)).join('') || '<div class="empty-state reveal"><span class="empty-mark">𓆩</span><p>认真做过的事，会留下痕迹。<br/>去 admin 添加第一张证书 ✦</p></div>'}
        </div>

        <div class="lightbox" id="certLightbox" hidden>
          <span class="lightbox-close" id="lightboxClose">×</span>
          <img id="lightboxImg" alt="" />
          <p class="lightbox-caption" id="lightboxCap"></p>
        </div>
      </section>
    `;
  },
  async enter() {
    const lb = document.querySelector('#certLightbox');
    const img = document.querySelector('#lightboxImg');
    const cap = document.querySelector('#lightboxCap');
    const close = document.querySelector('#lightboxClose');

    document.querySelectorAll('.cert-card').forEach((card) => {
      card.addEventListener('click', () => {
        const full = card.dataset.full || card.dataset.thumb;
        const title = card.dataset.title || '';
        if (!full) return;
        img.src = full;
        cap.textContent = title;
        lb.hidden = false;
        document.body.classList.add('lightbox-open');
      });
    });

    function dismiss() {
      lb.hidden = true;
      img.src = '';
      document.body.classList.remove('lightbox-open');
    }
    close?.addEventListener('click', dismiss);
    lb?.addEventListener('click', (e) => { if (e.target === lb) dismiss(); });
    document.addEventListener('keydown', _escListener);
  },
  async leave() {
    document.removeEventListener('keydown', _escListener);
  },
};

function _escListener(e) {
  if (e.key !== 'Escape') return;
  const lb = document.querySelector('#certLightbox');
  if (lb && !lb.hidden) {
    lb.hidden = true;
    document.body.classList.remove('lightbox-open');
  }
}

function renderCert(c, i) {
  const thumb = c.thumbnail || c.image || '';
  const full = c.image || c.thumbnail || '';
  const side = i % 2 === 0 ? 'left' : 'right';
  return `
    <article class="cert-row reveal ${side}" style="--delay:${(i % 6) * 0.08}s">
      <div class="timeline-dot"></div>
      <div class="cert-card"
           data-thumb="${escapeAttr(thumb)}"
           data-full="${escapeAttr(full)}"
           data-title="${escapeAttr(c.title || '')}">
        ${thumb ? `<div class="cert-thumb" style="background-image:url('${escapeAttr(thumb)}')"></div>` : ''}
        <div class="cert-meta">
          <p class="cert-date">${formatDate(c.date)}</p>
          <h3>${escapeHTML(c.title || '')}</h3>
          <p class="cert-issuer">${escapeHTML(c.issuer || '')}</p>
          ${c.description ? `<p class="cert-desc">${escapeHTML(c.description)}</p>` : ''}
        </div>
      </div>
    </article>`;
}
