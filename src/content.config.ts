import { defineCollection, z } from 'astro:content';
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
    category: z.string().optional(),
    keywords: z.string().optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
  }),
});

export const collections = { posts };
