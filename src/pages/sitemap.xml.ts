import type { APIRoute } from 'astro';
import { getSortedPosts, postUrl, postDateISO } from '../lib/posts';

// 复刻原 jekyll-sitemap 的输出：全部文章 + 5 个页面（不含 404）
export const GET: APIRoute = async ({ site }) => {
  const posts = await getSortedPosts();
  const base = site ?? new URL('https://zmbad.me');

  const pages = ['/about/', '/archives/', '/category/', '/search/', '/tags/'];
  const entries = [
    ...posts.map((p) => ({ loc: new URL(postUrl(p), base).href, lastmod: postDateISO(p) })),
    ...pages.map((u) => ({ loc: new URL(u, base).href, lastmod: null as string | null })),
  ];

  const body = entries
    .map(({ loc, lastmod }) =>
      `  <url>\n    <loc>${loc}</loc>\n` +
      (lastmod ? `    <lastmod>${lastmod}T00:00:00+08:00</lastmod>\n` : '') +
      `  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
