/* 内容加载层：所有 JSON 一次性拉到内存，路由切换时直接查 */

export const CONTENT = {
  site: null,
  about: null,
  projects: [],
  certificates: [],
  blog: [],
  skills: null,
  loaded: false,
};

async function loadJSON(path) {
  // 始终用绝对路径，避免在 /works/:slug 这种深层路由下相对路径解析错
  const abs = path.startsWith('/') ? path : '/' + path;
  const res = await fetch(abs, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${abs}`);
  // 防御 SPA fallback 返回 HTML 的情况
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('json')) {
    const text = await res.text();
    if (text.trim().startsWith('<')) throw new Error(`Got HTML instead of JSON at ${abs}`);
    return JSON.parse(text);
  }
  return res.json();
}

async function loadList(folder) {
  const idx = await loadJSON(`/content/${folder}/_index.json`).catch(() => ({ slugs: [] }));
  const items = await Promise.all(
    (idx.slugs || []).map((slug) =>
      loadJSON(`/content/${folder}/${slug}.json`)
        .then((data) => ({ slug, ...data }))
        .catch(() => null)
    )
  );
  return items.filter(Boolean);
}

export async function loadAllContent() {
  if (CONTENT.loaded) return CONTENT;
  const [site, about, skills, projects, certificates, blog] = await Promise.all([
    loadJSON('/content/site.json').catch(() => ({})),
    loadJSON('/content/about.json').catch(() => ({})),
    loadJSON('/content/skills.json').catch(() => ({ items: [] })),
    loadList('projects'),
    loadList('certificates'),
    loadList('blog'),
  ]);
  CONTENT.site = site;
  CONTENT.about = about;
  CONTENT.skills = skills;
  CONTENT.projects = projects;
  CONTENT.certificates = certificates;
  CONTENT.blog = blog;
  CONTENT.loaded = true;
  return CONTENT;
}

/** 找一个项目（按 slug）*/
export function projectBySlug(slug) {
  return CONTENT.projects.find((p) => p.slug === slug);
}

/** 找一篇博客（按 slug）*/
export function blogBySlug(slug) {
  return CONTENT.blog.find((p) => p.slug === slug);
}

/** 项目排序：featured 优先，再按 date 倒序 */
export function sortProjects(arr = CONTENT.projects) {
  return [...arr].sort((a, b) => {
    if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
    return new Date(b.date || 0) - new Date(a.date || 0);
  });
}

export function sortByDateDesc(arr) {
  return [...arr].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}
