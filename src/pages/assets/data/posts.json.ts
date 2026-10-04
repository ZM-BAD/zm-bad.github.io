import type { APIRoute } from 'astro';
import { getSortedPosts, postUrl, postDateISO, bodyToText, truncate } from '../../../lib/posts';

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
