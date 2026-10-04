import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import { getSortedPosts, postUrl } from '../lib/posts';
import { site as cfg } from '../site';

// RSS 2.0（含全文）。文件仍叫 feed.xml，订阅地址不变。
export const GET: APIRoute = async (context) => {
  const posts = await getSortedPosts();
  const container = await AstroContainer.create();

  const items = [];
  for (const p of posts) {
    const { Content } = await render(p);
    const html = await container.renderToString(Content);
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    const rawTags = p.data.tags;
    const categories = !rawTags ? [] : Array.isArray(rawTags) ? rawTags : rawTags.split(/\s+/).filter(Boolean);

    items.push({
      title: p.data.title,
      link: postUrl(p),
      pubDate: p.data.date,
      description: p.data.description ?? (text.length > 160 ? text.slice(0, 160) + '…' : text),
      content: html,
      categories,
    });
  }

  return rss({
    title: cfg.title,
    description: cfg.description,
    site: context.site ?? 'https://zmbad.me',
    items,
    customData: '<language>zh-cn</language>',
  });
};
