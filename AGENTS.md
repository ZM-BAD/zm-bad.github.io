# ZM-BAD Blog — Project Guide

## Overview

Personal blog (燎原之火) built with **Astro**, deployed to GitHub Pages via GitHub Actions.
URL: https://zmbad.me | Custom domain via CNAME.

2026-09 从 Jekyll 迁移到 Astro。**所有 URL 保持不变**（10 篇文章 + 5 个页面 + 分页 + feed + sitemap，共 32 条）。

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Astro | 5.x | 静态站点生成器 |
| Node | 22 (CI) | 不再需要 Ruby |
| Markdown | Astro 内置 (remark/rehype) | 原为 kramdown GFM |
| PureCSS | 3.0.0 | 网格框架（CSS 原样保留） |
| GLightbox | 3.3.1 | 图片灯箱 |
| icomoon | — | 图标字体（CSS 原样保留） |

## Commands

```bash
npm install        # 安装依赖
npm run dev        # 本地开发服务器 http://localhost:4321
npm run build      # 生产构建到 dist/
npm run preview    # 预览构建产物
```

## Project Structure

```
_posts/                      # 文章（文件名必须是 YYYY-MM-DD-标题.md）
about.md                     # 关于页正文
public/                      # 静态资源，原样拷贝到 dist/
  assets/css/style.css       # 主题样式表（Maupassant v2.0，未改动）
  assets/js/                 # totop.js / glightbox
  assets/fonts/              # icomoon 图标字体
  images/                    # 图片
  CNAME  robots.txt  favicon.ico  resume.pdf  search.html
src/
  site.ts                    # 站点配置（原 _config.yml）
  content.config.ts          # 内容集合定义 ★ 见下方陷阱
  lib/slug.ts                # ★ Jekyll slug 算法复刻，URL 兼容的关键
  lib/posts.ts               # 取文章、URL、日期格式化
  lib/grouping.ts            # 标签/分类分组（复刻 Jekyll 的顺序）
  lib/excerpt.ts             # 首页摘要（复刻 `content | strip_html | truncate: 300`）
  layouts/Base.astro         # 主布局（页头/侧栏/页脚）
  components/                # Header / Footer / Sidebar / PostListItem
  components/widgets/        # 7 个侧栏组件（原 _includes/widgets/）
  pages/                     # 路由
.github/workflows/deploy.yml # CI/CD
```

## Key Conventions

- **文章位置不变**：还是扔进 `_posts/`，文件名 `YYYY-MM-DD-标题.md`。日期从文件名取，不在 front matter 里写。
- **front matter**：`title` 必填；`category`、`keywords`、`tags` 可选。`tags` 可以是空格分隔的字符串，也可以是数组。
  - 多词标签必须用数组：`tags: ["Vibe Coding"]`，写成 `tags: Vibe Coding` 会被拆成两个标签。
- **资源路径**：直接用 `/assets/...` 绝对路径（不再有 `site.baseurl` 前缀问题）。
- **评论**：已移除。要加就用 Giscus 或 Utterances。
- **搜索**：`/assets/data/posts.json` 现在**由构建自动生成**（`src/pages/assets/data/posts.json.ts`），不再需要手工维护，也不会过期。
- **回顶部**：`totop.js`，纯原生 JS。

## Deployment

- **Branch**: `main` 触发自动部署。
- **Workflow**: `.github/workflows/deploy.yml` — `withastro/action@v6` 构建 + `actions/deploy-pages@v5` 部署。
- **注意**：`withastro/action` 会扫描 lockfile 判断包管理器，**`package-lock.json` 必须提交**。
- **Custom domain**: `public/CNAME` 内容为 `zmbad.me`。

## Common Gotchas

### ★ URL 兼容性（最重要，改错会让所有外链 404）

URL 结构 `/YYYY/MM/DD/标题/` 必须与 Jekyll 时代完全一致。有**两个**地方共同保证这一点：

1. **`src/content.config.ts` 里的 `generateId`** —— Astro 的内容加载器**默认会 slug 化文件名**
   （小写化、去标点）。不覆盖的话 `Mr. Robot` 会变成 `mr-robot`、`DAG-chat` 变成 `dag-chat`，
   4 篇文章的 URL 就变了。必须保留 `generateId: ({ entry }) => entry.replace(/\.md$/, '')`。

2. **`src/lib/slug.ts` 里的 `jekyllTitleSlug()`** —— 复刻 Jekyll `UrlDrop#title` 的算法：
   `mode: "pretty"` + `cased: true`，即正则 `/[^\p{M}\p{L}\p{Nd}._~!$&'()+,;=@]+/gu` 替换为 `-`，
   保留大小写，再剥首尾连字符。所以 `Mr. Robot` → `Mr.-Robot`（**句点保留**）、
   `假期很短，放空大脑` → `假期很短-放空大脑`、`DAG-chat` 不变小写。

   改这两处之前，先拿 `_posts/` 里全部文章跑一遍 URL 回归。

### 其他

- **`getStaticPaths` 作用域**：它会被 Astro 提升到独立模块作用域，**不能引用组件作用域里的变量**
  （模块级 import 可以）。正则、常量要写在函数内部。
- **Astro 5 content layer**：用 `render(entry)`，不是 `entry.render()`。
- **`about.md` 的 front matter**：不能有 `layout:` 字段 —— Astro 直接 import markdown 时会把它
  当组件名去解析。也不要有 `permalink:`（路由由文件位置决定）。
- **`public/search.html`** 是个跳转桩：Jekyll 的 `permalink: /search` 输出的是 `/search.html`，
  而 Astro 的目录格式输出 `/search/`。为了保住老地址才留了这个文件。
- **`tools/create-post.py`** 仍可用（它只依赖 `_posts/` 的命名约定）。
- **摘要截断点**：`src/lib/excerpt.ts` 已经做了两处归一化（kramdown 的块间空行、模板缩进空白）
  来贴近原输出，但仍有约 3 个字符的差异 —— Astro 与 kramdown 渲染 HTML 的空白不同，
  除非重写 kramdown 否则无法 100% 一致。只影响摘要"…"出现的位置。
- **智能引号**：kramdown 与 Astro 的 smartypants 在「句末标点后紧跟引号」时判断不同。
  Headroom 一篇有 2 处会从 `”` 变成 `“`（Astro 那个是正确写法）。
