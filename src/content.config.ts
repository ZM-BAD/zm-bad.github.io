import { defineCollection } from 'astro:content';
// Astro 7 起 `import { z } from 'astro:content'` 已废弃，Astro 8 将移除。用 astro/zod。
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  // 文件名即 URL：_posts/mr-robot.md → /posts/mr-robot/
  loader: glob({ pattern: '**/*.md', base: './_posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    category: z.string().optional(),
    keywords: z.string().optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
  }),
});

export const collections = { posts };
