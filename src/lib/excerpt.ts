import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import type { Post } from './posts';

let containerPromise: Promise<AstroContainer> | null = null;
const cache = new Map<string, string>();

/** 首页摘要：把渲染后的正文压成单行纯文本，截 300 字（省略号计入总长） */
export async function getExcerpt(post: Post): Promise<string> {
  const hit = cache.get(post.id);
  if (hit !== undefined) return hit;

  containerPromise ??= AstroContainer.create();
  const container = await containerPromise;
  const { Content } = await render(post);
  const html = await container.renderToString(Content);

  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const out = text.length <= 300 ? text : text.slice(0, 297) + '...';
  cache.set(post.id, out);
  return out;
}
