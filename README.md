# 个人空间 · 张容纲

一片有风、有云、有羽毛的小天地。

---

## 文件结构

```
my_web/
├── index.html          # SPA 外壳（天空/云/羽毛背景 + 导航 + 音乐 + 路由容器）
├── styles.css          # 全局样式 + 设计 token（字号阶梯 / 对比 / 间距）
├── js/                 # ES 模块（无构建步骤，CDN 引 GSAP/Three/Lenis）
│   ├── main.js         # 入口：初始化 + 注册路由 + 全局动效（各 init 独立 try/catch）
│   ├── router.js       # SPA 伪路由（pushState + 站内切换 + 云朵过场）
│   ├── content.js      # 一次性 fetch 所有 content/*.json 到内存
│   ├── animations.js   # 羽毛 / 滚动天空渐变 / 视差 / 风吹文字
│   ├── particles.js    # Three.js 萤火粒子（WebGL 不可用时自动降级，不报错）
│   ├── music.js        # 网易云 BGM + 入口门 + 副歌触发
│   ├── utils.js        # 公共工具（转义 / markdown / reveal）
│   └── views/          # 每个路由一个视图
│       ├── home.js  about.js  works.js  skills.js
│       └── certificates.js  blog.js  contact.js
├── admin/              # 本地内容后台（Decap CMS local mode，生产环境被 netlify 屏蔽）
│   ├── index.html
│   └── config.yml      # 6 个 collection 的内容模型
├── content/            # 所有内容数据（admin 增删改这里）
│   ├── site.json   about.json   skills.json
│   ├── projects/      { _index.json（slug 清单） + *.json }
│   ├── certificates/  { _index.json + *.json }
│   └── blog/          { _index.json + *.json }
├── images/             # 配图（hero / portrait / 项目封面 / blog 封面 等）
├── vendor/marked.min.js
├── docs/               # 设计方案 + 线框图
├── 404.html  _redirects  netlify.toml  robots.txt
├── package.json
└── README.md
```

---

## 第一次使用

```bash
# 安装依赖（一次性）
npm install
```

---

## 日常工作流

### 修改内容（增加项目、改文案、加证书等）

```bash
npm run admin
```

这会：
1. 启动本地 Decap CMS 代理（端口 8081）
2. 启动本地静态服务器（端口 8000）
3. 自动打开浏览器到 http://localhost:8000/admin/

在 admin UI 里增删改保存 → 文件自动写入 `content/`。

**新建项目 / 证书后**，需要手动把 slug 加到 `content/projects/_index.json` 或 `content/certificates/_index.json`。

完成后：
```bash
git add .
git commit -m "新增 XX 项目"
git push
```

线上 1-2 分钟自动重新部署。

### 仅预览主站

```bash
npm run serve
```

打开 http://localhost:8000/ 看主站效果。

---

## 关键设计原则（务必遵守）

详见 [`docs/portfolio-design-plan.md`](./docs/portfolio-design-plan.md)。

> **核心约束**：意境靠"感"不靠"说"。整站不出现日文/和风字样、不用樱花鸟居等 stereotyped 符号、不显示 BGM 歌名。让懂的人会心一笑，让不懂的人也觉得"很安静很美"。

---

## 安全说明

- `admin/` 永远只能在本地运行（依赖 `decap-server` 这个本地代理）
- 生产部署到 Netlify 时，`netlify.toml` 会把 `/admin/*` 路径全部 404
- 即便 `netlify.toml` 失效，没有 `decap-server` 跑着的话 admin UI 也无法写入任何文件
- `robots.txt` 阻止搜索引擎收录 `/admin/` 和 `/content/`

---

## 自检清单（每次大改后跑一遍）

- [ ] `npm run admin` → admin UI 正常打开，能看到 6 个 collection（site / about / projects / certificates / blog / skills）
- [ ] admin 里改任意字段保存 → 对应 JSON 文件被更新
- [ ] `npm run serve` 主站打开 → 内容来自 content/，不是硬编码
- [ ] Hero 显示当前的名字 + tagline
- [ ] 没有任何日文字符出现在界面上
- [ ] 没有"翼をください"歌名标签
- [ ] 控制台无报错
