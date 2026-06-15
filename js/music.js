/* BGM 播放器 + 跨页续播 + 副歌触发 */

import { $, $$ } from './utils.js';
import { CONTENT } from './content.js';

let musicLoaded = false;
let musicVisible = false;

export function setupMusic() {
  const musicWrap = $('#musicWrap');
  const musicToggle = $('#musicToggle');
  const musicFrame = $('#musicFrame');
  if (!musicWrap || !musicToggle || !musicFrame) return;

  const id = CONTENT.site?.music_id || '2163191091';
  const MUSIC_SRC = `https://music.163.com/outchain/player?type=2&id=${id}&auto=1&height=66`;

  function loadMusic() {
    if (musicLoaded) return;
    musicFrame.src = MUSIC_SRC;
    musicLoaded = true;
    musicToggle.classList.add('active');
    if (!sessionStorage.getItem('bgm_started_at')) {
      sessionStorage.setItem('bgm_started_at', String(Date.now()));
    }
    scheduleChorus();
  }

  musicToggle.addEventListener('click', () => {
    if (!musicLoaded) loadMusic();
    musicVisible = !musicVisible;
    musicWrap.classList.toggle('show', musicVisible);
  });

  // 入口门
  const enterGate = $('#enterGate');
  const enterBtn = $('#enterBtn');
  const gatePassed = sessionStorage.getItem('gate_passed') === '1';
  if (gatePassed && enterGate) {
    enterGate.style.display = 'none';
    loadMusic();
  } else if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      sessionStorage.setItem('gate_passed', '1');
      loadMusic();
      enterGate.classList.add('hide');
      setTimeout(() => { enterGate.style.display = 'none'; }, 1500);
    });
  }
}

/* 副歌触发调度 */
function scheduleChorus() {
  if (sessionStorage.getItem('chorus_triggered') === '1') return;
  const offset = CONTENT.site?.music_chorus_offset_ms || 58000;
  const startedAt = parseInt(sessionStorage.getItem('bgm_started_at') || `${Date.now()}`, 10);
  const elapsed = Date.now() - startedAt;
  const wait = offset - elapsed;
  if (wait <= 0) return;
  setTimeout(() => {
    triggerChorus();
    sessionStorage.setItem('chorus_triggered', '1');
  }, wait);
}

export function triggerChorus() {
  const body = document.body;
  body.classList.add('chorus-burst');
  $$('.feather').forEach((f, i) => {
    f.style.animationDirection = 'reverse';
    f.style.animationDuration = '6s';
    setTimeout(() => {
      f.style.animationDirection = '';
      f.style.animationDuration = '';
    }, 3000 + i * 30);
  });
  setTimeout(() => body.classList.remove('chorus-burst'), 3000);
  console.log('%c♪ 副歌升起，云被推开 ✦', 'color:#b8d0e6; font-size: 16px; letter-spacing: 0.3em;');
}
