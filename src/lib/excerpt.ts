import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import type { Post } from './posts';

let containerPromise: Promise<AstroContainer> | null = null;
const cache = new Map<string, string>();

/**
 * 精确复刻 Jekyll 首页摘要：`{{ post.content | strip_html | truncate: 300 }}`
 *   - post.content 是「渲染后的 HTML」
 *   - strip_html 把 <...> 整体删掉（不补空格）
 *   - Liquid 的 truncate 超出时截断并追加 '...'（三个点，不是 …）
 */
export async function getExcerpt(post: Post): Promise<string> {
  const hit = cache.get(post.id);
  if (hit !== undefined) return hit;

  containerPromise ??= AstroContainer.create();
  const container = await containerPromise;
  const { Content } = await render(post);
  const html = await container.renderToString(Content);

  // kramdown 的块级元素之间是空行（\n\n），Astro 只输出单个 \n。
  // 这会让「截到第 300 个字符」落在不同位置，所以先归一化成 kramdown 的约定。
  const spaced = html.replace(/>\n</g, '>\n\n<');
  const text = spaced.replace(/<[^>]*>/g, '');
  const out = text.length <= 300 ? text : text.slice(0, 300) + '...';
  cache.set(post.id, out);
  return out;
}
