# ZM-BAD Blog — Project Guide

## Overview

Personal blog (燎原之火) built with **Astro**, deployed to GitHub Pages via GitHub Actions.
URL: https://zmbad.me | Custom domain via CNAME.

2026-09 从 Jekyll 迁移到 Astro。**所有 URL 保持不变**（10 篇文章 + 5 个页面 + 分页 + feed + sitemap，共 32 条）。

## Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Astro | 7.x（内部用 zod v4） | 静态站点生成器 |
| Node | **24 LTS** | CI 与 `.nvmrc` 一致；`engines` 要求 `>=22.12.0`。不再需要 Ruby |
| Markdown | Astro 内置 (remark/rehype) | 原为 kramdown GFM |
| PureCSS | 3.0.0 | 网格框架（CSS 原样保留，内部已内嵌 normalize v8.0.1） |
| GLightbox | 3.3.1 | 图片灯箱 |
| 图片 | **WebP q88** | 最长边 1444px = 正文列 722px 的 2 倍（Retina） |
| 图标字体 | icomoon **woff2 + woff** | 2026-09 从 4 格式精简到 2 |

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
  assets/css/style.css       # 主题样式表（Maupassant v2.0，仅动过 @font-face）
  assets/js/                 # totop.js / glightbox
  assets/fonts/              # icomoon.woff2 + icomoon.woff
  images/                    # 图片（全部 .webp）
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
- **front matter**：`title` 必填；`description`、`category`、`keywords`、`tags` 可选。`tags` 可以是空格分隔的字符串，也可以是数组。
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
  > 加载完再按真实比例显示。**2026-09 犯过这个错，改完记得量一遍实际渲染尺寸。**
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

### ★ `is:inline` 里的模板表达式不会被求值

`<script is:inline>` 是原样输出，Astro **不处理里面的 `${...}`**。

2026-09 发现百度统计就是这么坏的：源码里写 `` `hm.js?${site.baiduAnalytics}` ``，
上线后浏览器请求的是字面量 `hm.js?${site.baiduAnalytics}`，统计从迁移那天起一直是死的。
（这个 bug 在 `dist/` 里一眼可见，光看源码看不出来。）

要往 `is:inline` 脚本里传值，用 `define:vars`：

```astro
<script is:inline define:vars={{ baiduId: site.baiduAnalytics }}>
  hm.src = "https://hm.baidu.com/hm.js?" + baiduId;
</script>
```

**改完任何 `is:inline` 脚本，去 `dist/` 里 grep 一下 `${` 确认没有未求值的残留。**

### 其他

- **`getStaticPaths` 作用域**：它会被 Astro 提升到独立模块作用域，**不能引用组件作用域里的变量**
  （模块级 import 可以）。正则、常量要写在函数内部。
- **content layer**：用 `render(entry)`（从 `astro:content` 导入），不是 `entry.render()`。
- **`z` 的来源**：Astro 7 起 `import { z } from 'astro:content'` 已废弃（Astro 8 将移除），
  正确写法是 `import { z } from 'astro/zod'`（Astro 7 内部用的是 zod v4）。
- **normalize.css 已删除**：`pure-min.css` 内部已内嵌 normalize v8.0.1，原来外面又单独引了一份 v3.0.2。
  删除前逐条比对过层叠 —— 被丢掉的只有 table / `input[type=search]` / mark / svg / media 这几类规则，
  本站都没用到（表格另有 `style.css:915` 自己声明）。**要加回来之前，先确认这几类元素确实没用到。**
- **favicon.ico**：2026-09 重建过，只保留 16/32/48 三个尺寸（127KB → 4.5KB），
  16/32/48 与原图逐像素一致。要改的话注意别再用会重新塞进 256×256 的工具导出。
- **`about.md` 的 front matter**：不能有 `layout:` 字段 —— Astro 直接 import markdown 时会把它
  当组件名去解析。也不要有 `permalink:`（路由由文件位置决定）。
- **`public/search.html`** 是个跳转桩：Jekyll 的 `permalink: /search` 输出的是 `/search.html`，
  而 Astro 的目录格式输出 `/search/`。为了保住老地址才留了这个文件。
- **404 页必须套 `Base` 布局**（`src/pages/404.astro`）。GitHub Pages 用 `dist/404.html`
  兜所有未命中的路径。曾经这里是个裸 HTML，只写了几行内联样式 —— 不加载 style.css，
  没有页头/导航/侧栏/页脚，和站点完全脱节。**别退回裸 HTML。**
- **`tools/create-post.py`** 仍可用（它只依赖 `_posts/` 的命名约定）。
  2026-09 已把生成的 front matter 里的 `layout: post` 去掉（Jekyll 遗留，Astro 下无意义）。
  `tools/` 下其余 5 个脚本（nginx / supervisor / githook / runserver / pushm）已删除 ——
  都是 2016 年自建服务器时代的产物，且 `pushm.sh` 推的还是已经不存在的 `master` 分支。
- **摘要截断点**：`src/lib/excerpt.ts` 已经做了两处归一化（kramdown 的块间空行、模板缩进空白）
  来贴近原输出，但仍有约 3 个字符的差异 —— Astro 与 kramdown 渲染 HTML 的空白不同，
  除非重写 kramdown 否则无法 100% 一致。只影响摘要"…"出现的位置。
- **智能引号**：kramdown 与 Astro 的 smartypants 在「句末标点后紧跟引号」时判断不同。
  Headroom 一篇有 2 处会从 `”` 变成 `“`（Astro 那个是正确写法）。
