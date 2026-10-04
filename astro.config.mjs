import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// 文章日期 → 让 sitemap 的 lastmod 用文章自身的 date，而不是构建时间
// （构建时间会让每次部署都声称全站都变了，爬虫会忽略这个字段）
const postDates = new Map();
for (const f of readdirSync('_posts')) {
  const m = readFileSync(`_posts/${f}`, 'utf8').match(/^date:\s*(\S+)/m);
  if (m) postDates.set(`/posts/${f.replace(/\.md$/, '')}/`, m[1]);
}

export default defineConfig({
  site: 'https://zmbad.me',
  // base 刻意不配：仓库名命中 <username>.github.io 特例，且用自定义域名，站点在根路径
  build: { format: 'directory' },
  integrations: [
    sitemap({
      serialize: (item) => {
        // pathname 是百分号编码的（中文文件名），解码后才能和 postDates 的键对上
        const lastmod = postDates.get(decodeURIComponent(new URL(item.url).pathname));
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
