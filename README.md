# 个人空间 · 张容纲

一片有风、有云、有羽毛的小天地。

---

## 文件结构

```
my_web/
├── index.html          # 主站入口（首页 = 当前唯一页面，子页待扩展）
├── styles.css          # 全局样式
├── script.js           # 主交互 + 动效 + 内容渲染
├── admin/              # 本地内容管理后台（Decap CMS local mode）
│   ├── index.html
│   └── config.yml      # 内容模型定义
├── content/            # 所有内容数据（admin 增删改这里）
│   ├── site.json       # 站点全局配置
│   ├── about.json      # 关于我
│   ├── skills.json     # 技能列表
│   ├── projects/
│   │   ├── _index.json # 项目清单（手动维护 slug 数组）
│   │   └── *.json      # 每个项目一个文件
│   └── certificates/
│       ├── _index.json
│       └── *.json
├── images/uploads/     # admin 上传图片落到这
├── docs/               # 设计方案 + 线框图
├── package.json
├── netlify.toml        # 部署配置（屏蔽 /admin）
├── robots.txt
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

- [ ] `npm run admin` → admin UI 正常打开，能看到 5 个 collection
- [ ] admin 里改任意字段保存 → 对应 JSON 文件被更新
- [ ] `npm run serve` 主站打开 → 内容来自 content/，不是硬编码
- [ ] Hero 显示当前的名字 + tagline
- [ ] 没有任何日文字符出现在界面上
- [ ] 没有"翼をください"歌名标签
- [ ] 控制台无报错
