import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import { getSortedPosts, postUrl, postDateISO } from '../lib/posts';
import { site as cfg } from '../site';

// 复刻 jekyll-feed 的 Atom 输出（含全文）
export const GET: APIRoute = async ({ site }) => {
  const posts = await getSortedPosts();
  const base = (site ?? new URL('https://zmbad.me')).href.replace(/\/$/, '');
  const container = await AstroContainer.create();
  const now = new Date().toISOString();

  // 同 sitemap：URL 里的 & 不转义会让整份 feed 解析失败
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const entries = [];
  for (const p of posts) {
    const { Content } = await render(p);
    const html = await container.renderToString(Content);
    const url = `${base}${postUrl(p)}`;
    const d = postDateISO(p);
    entries.push(
      `<entry>` +
      `<title type="html">${esc(p.data.title)}</title>` +
      `<link href="${esc(url)}" rel="alternate" type="text/html" title="${esc(p.data.title)}" />` +
      `<published>${d}T00:00:00+08:00</published>` +
      `<updated>${d}T00:00:00+08:00</updated>` +
      `<id>${esc(base + postUrl(p).replace(/\/$/, ''))}</id>` +
      `<content type="html" xml:base="${esc(url)}"><![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]></content>` +
      `</entry>`
    );
  }

  const xml =
    `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom" >` +
    `<generator uri="https://astro.build/" version="5">Astro</generator>` +
    `<link href="${esc(base)}/feed.xml" rel="self" type="application/atom+xml" />` +
    `<link href="${esc(base)}/" rel="alternate" type="text/html" />` +
    `<updated>${now}</updated>` +
    `<id>${esc(base)}/feed.xml</id>` +
    `<title type="html">${esc(cfg.title)}</title>` +
    `<subtitle>${esc(cfg.description)}</subtitle>` +
    `<author><name>${esc(cfg.author)}</name></author>` +
    entries.join('') +
    `</feed>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
};
