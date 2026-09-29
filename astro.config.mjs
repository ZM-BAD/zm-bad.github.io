import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://zmbad.me',
  // base 刻意不配：
  //   ① 仓库名 zm-bad.github.io 命中 <username>.github.io 特例
  //   ② 使用自定义域名 zmbad.me，站点在域名根路径
  build: { format: 'directory' },   // 对齐原 Jekyll 的 /path/index.html 结构
  markdown: {
    shikiConfig: { theme: 'github-light' },  // 暂用，语法高亮后续再调
  },
});
