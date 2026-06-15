/* Three.js 轻量级粒子背景：萤火虫/星光漂浮效果 */

let scene, camera, renderer, particles;
let animationId = null;
let isVisible = true;

const PARTICLE_COUNT = 80;
const SPREAD_X = 40;
const SPREAD_Y = 30;
const SPREAD_Z = 20;

export function initParticles() {
  // 装饰性粒子：任何环节（尤其 WebGL 不可用）失败都安静降级，绝不能抛错拖垮整站
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded, skipping particles');
    return;
  }
  try {
  // 创建场景
  scene = new THREE.Scene();

  // 创建相机
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 15;

  // 创建渲染器（透明背景，叠加在现有背景上）
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // 限制像素比以保性能
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '-8';
  renderer.domElement.style.pointerEvents = 'none';
  document.body.appendChild(renderer.domElement);

  // 创建粒子纹理（圆形渐变，柔和发光）
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 250, 240, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 245, 230, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 240, 220, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);

  // 创建粒子几何体
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const speeds = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * SPREAD_X;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
    sizes[i] = 0.5 + Math.random() * 1.5;
    speeds[i] = 0.2 + Math.random() * 0.8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.15,
    map: texture,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    color: 0xfff8f0,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // 存储速度数据
  particles.userData.speeds = speeds;
  particles.userData.originalPositions = new Float32Array(positions);

  // 监听窗口大小变化
  window.addEventListener('resize', onResize);

  // 监听页面可见性（切到后台暂停）
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    if (isVisible) animate();
  });

  // 开始动画
  animate();
  } catch (err) {
    console.warn('粒子背景初始化失败，已降级（不影响主站）：', err);
    destroyParticles();
  }
}

function animate() {
  if (!isVisible) return;
  animationId = requestAnimationFrame(animate);

  const time = Date.now() * 0.001;
  const positions = particles.geometry.attributes.position.array;
  const speeds = particles.userData.speeds;
  const originals = particles.userData.originalPositions;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const speed = speeds[i];
    const i3 = i * 3;

    // 缓慢漂浮（正弦波运动）
    positions[i3] = originals[i3] + Math.sin(time * speed * 0.3 + i) * 1.5;
    positions[i3 + 1] = originals[i3 + 1] + Math.cos(time * speed * 0.2 + i * 0.7) * 1.0;
    positions[i3 + 2] = originals[i3 + 2] + Math.sin(time * speed * 0.15 + i * 1.3) * 0.5;

    // 缓慢上升 + 循环
    positions[i3 + 1] += time * speed * 0.02;
    if (positions[i3 + 1] > SPREAD_Y / 2) {
      positions[i3 + 1] = -SPREAD_Y / 2;
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;

  // 整体缓慢旋转
  particles.rotation.y = time * 0.02;
  particles.rotation.x = Math.sin(time * 0.01) * 0.05;

  renderer.render(scene, camera);
}

function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function destroyParticles() {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) {
    renderer.domElement.remove();
    renderer.dispose();
  }
  if (particles) {
    particles.geometry.dispose();
    particles.material.dispose();
    if (particles.material.map) particles.material.map.dispose();
  }
  window.removeEventListener('resize', onResize);
  scene = camera = renderer = particles = null;
}
