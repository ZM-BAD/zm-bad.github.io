import { defineCollection } from 'astro:content';
// Astro 7 起 `import { z } from 'astro:content'` 已废弃，Astro 8 将移除。
// 正确来源是 astro/zod（Astro 7 内部用的是 zod v4）。
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './_posts',           // 保持你原来的位置：文章还是扔进 _posts/
    // ★ 必须覆盖：Astro 默认会 slug 化文件名（小写、去标点），
    //   那会让 4 篇文章的 URL 变化、外链全断。
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    layout: z.string().optional(),
    // 可选：手写摘要，用于 <meta name="description"> 和分享卡片。
    // 不写则由正文自动截取（见 src/lib/excerpt.ts）。
    // 注意：以前这里没有这个字段，写了也会被 Zod 静默丢弃。
    description: z.string().optional(),
    category: z.string().optional(),
    keywords: z.string().optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
  }),
});

export const collections = { posts };
