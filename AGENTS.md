# ZM-BAD Blog — Project Guide

## Overview

Personal blog (燎原之火) built with **Astro**, deployed to GitHub Pages via GitHub Actions.
URL: https://zmbad.me | Custom domain via CNAME.

2026-09 从 Jekyll 迁到 Astro，2026-10 起**不再兼容旧 URL**。

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Astro | 7.x（内部用 zod v4） | 静态站点生成器 |
| Node | **24 LTS** | CI 与 `.nvmrc` 一致；`engines` 要求 `>=22.12.0` |
| Markdown | Astro 内置 (remark/rehype) | 原为 kramdown GFM |
| PureCSS | 3.0.0 | 网格框架（CSS 原样保留，内部已内嵌 normalize v8.0.1） |
| GLightbox | 3.3.1 | 图片灯箱 |
| 图片 | **WebP q88** | 最长边 1444px = 正文列 722px 的 2 倍（Retina） |
| 图标字体 | icomoon **woff2 + woff** | 只要这两种格式 |

## Commands

```bash
npm install        # 安装依赖
npm run dev        # 本地开发服务器 http://localhost:4321
npm run build      # 生产构建到 dist/
npm run preview    # 预览构建产物
```

## Project Structure

```
_posts/                      # 文章（文件名即 URL slug：mr-robot.md → /posts/mr-robot/）
about.md                     # 关于页正文
public/                      # 静态资源，原样拷贝到 dist/
  assets/css/style.css       # 主题样式表（Maupassant v2.0）
  assets/js/                 # totop.js / glightbox
  assets/fonts/              # icomoon.woff2 + icomoon.woff
  images/                    # 图片（全部 .webp）
  CNAME  robots.txt  favicon.ico  resume.pdf
src/
  site.ts                    # 站点配置
  content.config.ts          # 内容集合定义
  lib/posts.ts               # 取文章、URL、日期格式化
  lib/grouping.ts            # 标签/分类分组
  lib/excerpt.ts             # 首页摘要
  layouts/Base.astro         # 主布局（页头/侧栏/页脚）
  components/                # Header / Footer / Sidebar / PostListItem
  components/widgets/        # 7 个侧栏组件
  pages/                     # 路由
.github/workflows/deploy.yml # CI/CD
```

## Key Conventions

- **文章文件**：扔进 `_posts/`，**文件名就是 URL slug**（`mr-robot.md` → `/posts/mr-robot/`）。
  日期写在 front matter 的 `date:`，不在文件名里。
- **front matter**：`title`、`date` 必填；`description`、`category`、`keywords`、`tags` 可选。`tags` 可以是空格分隔的字符串，也可以是数组。
  - 多词标签必须用数组：`tags: ["Vibe Coding"]`，写成 `tags: Vibe Coding` 会被拆成两个标签。
  - `description` 不写会自动从正文截前 160 字，用于 `<meta name="description">` 和分享卡片。
- **插图片用裸 HTML，不要用 `![]()`**：markdown 语法塞不进 `loading` / `width` / `height` 这三个属性，
  少了 `width`/`height` 图片加载完会把正文往下推（布局跳动）。
  ```html
  <img src="/images/xxx.webp" alt="" loading="lazy" decoding="async" width="1444" height="670">
  ```
  尺寸必须和文件真实尺寸一致；图片先转 WebP，最长边 1444px（正文列 722px 的 2 倍）。
  转图命令：`cwebp -q 88 -resize 1444 0 原图.jpg -o 目标.webp`

  > ★ **`width`/`height` 属性和 `style.css:267` 的 `height: auto` 是一对，缺一不可。**
  > HTML 的 `height` 属性会被当成 `height:670px` 这样的实值应用，而 `max-width:100%`
  > 只压宽度、不压高度。少了 `height:auto`，1444 宽的图在 722px 的正文列里高度会是
  > 正确值的 2 倍 —— 图片被垂直拉长，看着又瘦又高。
  > 加上 `height:auto` 之后，浏览器仍会用属性里的宽高比先占位（防跳动），
  > 加载完再按真实比例显示。**改完记得量一遍实际渲染尺寸。**
- **资源路径**：直接用 `/assets/...` 绝对路径（不再有 `site.baseurl` 前缀问题）。
- **评论**：已移除。要加就用 Giscus 或 Utterances。
- **搜索**：`/assets/data/posts.json` 现在**由构建自动生成**（`src/pages/assets/data/posts.json.ts`），不再需要手工维护，也不会过期。
- **回顶部**：`totop.js`，纯原生 JS。

## Deployment

- **Branch**: `main` 触发自动部署。
- **Workflow**: `.github/workflows/deploy.yml` — `withastro/action@v6` 构建 + `actions/deploy-pages@v5` 部署。
- **注意**：`withastro/action` 会扫描 lockfile 判断包管理器，**`package-lock.json` 必须提交**。
- **Node 版本**：`.nvmrc`(24) / `deploy.yml` 的 `node-version: 24` / `package.json` 的 `engines`
  三处要一起改，别只改一处。
- **Custom domain**: `public/CNAME` 内容为 `zmbad.me`。

## Common Gotchas

### ★ URL 结构

文章 URL 是 `/posts/<文件名>/` —— **文件名直接当 slug**。
Astro 默认会把它小写化、去标点，所以文件名要写成最终想要的 slug
（`mr-robot.md`，不是 `Mr. Robot.md`）。中文原样保留：`假期很短-放空大脑.md` → `/posts/假期很短-放空大脑/`。

**改文件名 = 改 URL，没有跳转。**

### ★ `is:inline` 里的模板表达式不会被求值

`<script is:inline>` 是原样输出，Astro **不处理里面的 `${...}`**。要传值必须用 `define:vars`：

```astro
<script is:inline define:vars={{ foo: site.bar }}>
  console.log(foo);
</script>
```

**改完任何 `is:inline` 脚本，去 `dist/` 里 grep 一下 `${` 确认没有未求值的残留** ——
这个 bug 在 `dist/` 里一眼可见，光看源码看不出来。

### ★ `.map()` 不产生 HTML 空白，靠空白撑开的排版会塌

Astro 的 `{arr.map(...)}` 紧挨着输出元素，元素之间**没有空白**。凡是靠"元素之间的空白"
撑开间距的 `inline-block` / `inline` 布局，都会**静默贴死**（渲染成「🏷AI」「AI独立开发」）。

所以间距一律写进 CSS：

| 位置 | 间距来源 |
|---|---|
| `tags.astro` → `#label_box li` | `margin-right` |
| `posts/[slug].astro` → `.post-meta` 的图标与标签 | `margin-left`（**日期图标不加**，那边本来就紧贴） |
| `Header.astro` → `#nav-menu a` | 靠自身 `padding: 3px 20px`，够用 |
| `.page-navigator` / `.post-nav` | `float`，忽略空白，无需处理 |

**新增任何 `display: inline-block` 列表时**，先确认间距来自元素自身的 margin/padding，
而不是元素之间的空白 —— 后者配上 `.map()` 就会塌。

验证要真渲染量：临时在 `public/` 放个同源页，iframe 加载目标页后 `getBoundingClientRect()`
读间隙，用 `chrome --headless --dump-dom` 取出来。用完删掉，别提交。

### 其他

- **`deploy.yml` 权限是分级的**：工作流级只有 `contents: read`，`pages: write` / `id-token: write`
  只在 `deploy` job。别挪回工作流级 —— build 要跑 `npm install` 全部依赖，给它 OIDC 签发权，
  一个被投毒的传递依赖就能往 Pages 部署任意内容。
- **`getStaticPaths` 作用域**：它会被 Astro 提升到独立模块作用域，**不能引用组件作用域里的变量**
  （模块级 import 可以）。正则、常量要写在函数内部。
- **content layer**：用 `render(entry)`（从 `astro:content` 导入），不是 `entry.render()`。
- **`z` 的来源**：Astro 7 起 `import { z } from 'astro:content'` 已废弃（Astro 8 将移除），
  正确写法是 `import { z } from 'astro/zod'`（Astro 7 内部用的是 zod v4）。
- **不要单独引 normalize.css**：`pure-min.css` 内部已内嵌 normalize v8.0.1。
  不引它只丢 table / `input[type=search]` / mark / svg / media 这几类规则，本站都没用到
  （表格另有 `style.css:915` 自己声明）。**要加回来之前先确认这几类元素确实没用到。**
- **favicon.ico 只有 16/32/48 三个尺寸**（4.5KB）。要改的话别用会重新塞进 256×256 的工具导出。
- **`about.md` 的 front matter**：不能有 `layout:` 字段 —— Astro 直接 import markdown 时会把它
  当组件名去解析。也不要有 `permalink:`（路由由文件位置决定）。
- **404 页必须套 `Base` 布局**（`src/pages/404.astro`）。GitHub Pages 用 `dist/404.html`
  兜所有未命中的路径 —— **裸 HTML 会导致它不加载 style.css，和站点完全脱节**。
- **摘要截断**：`excerpt.ts` 和 `posts.ts` 的 `truncate()` 都是**省略号计入总长**
  （`n` → 保留 `n-3` 再拼 `...`）。写成 `slice(0, n) + '...'` 会多 3 个字符。
- **`posts.ts` 的 `bodyToText()` 要剥裸 HTML**：本站插图按约定写 `<img>`，只剥 `![]()` 不够 ——
  标签会整段漏进搜索摘要，在侧栏搜索框里原样显示给访客。
- **feed / sitemap 里插 URL 要过 `esc()`**：裸 `&` 会让**整份**文档解析失败（不是单条坏）。
  Headroom 一篇有 2 处会从 `”` 变成 `“`（Astro 那个是正确写法）。
