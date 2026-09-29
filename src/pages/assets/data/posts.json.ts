import type { APIRoute } from 'astro';
import { getSortedPosts, postUrl, postDateISO, bodyToText, truncate } from '../../../lib/posts';

// 移植自 assets/data/posts.json —— 原来是 Jekyll 渲染的 Liquid 模板，
// 现在从内容集合直接生成，索引永远和文章同步（原来那份是渲染产物，容易过期）
export const GET: APIRoute = async () => {
  const posts = await getSortedPosts();
  const data = posts.map((p) => ({
    title: p.data.title,
    url: postUrl(p),
    date: postDateISO(p),
    keywords: p.data.keywords ?? (Array.isArray(p.data.tags) ? p.data.tags.join(' ') : (p.data.tags ?? '')),
    summary: truncate(bodyToText(p.body ?? ''), 120),
  }));
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
