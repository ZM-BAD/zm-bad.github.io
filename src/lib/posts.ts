import { getCollection, type CollectionEntry } from 'astro:content';
import { idToPath } from './slug';

export type Post = CollectionEntry<'posts'>;

/** 按日期倒序（与原 jekyll-paginate-v2 的 sort_reverse: true 一致） */
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => idToPath(b.id).date.localeCompare(idToPath(a.id).date));
}

export function postUrl(post: Post): string {
  const p = idToPath(post.id);
  return `/${p.year}/${p.month}/${p.day}/${p.slug}/`;
}

/** Jekyll 的 %Y年%m月%d日 */
export function postDateCN(post: Post): string {
  const [y, m, d] = idToPath(post.id).date.split('-');
  return `${y}年${m}月${d}日`;
}

/** Jekyll 的 %Y-%m-%d（归档/标签/分类页用的那套） */
export function postDateISO(post: Post): string {
  return idToPath(post.id).date;
}

/** 把 markdown 正文压成纯文本，近似 Jekyll 的 `content | strip_html` */
export function bodyToText(body: string): string {
  return body
    .replace(/^---[\s\S]*?---/, '')            // front matter（正常不会有）
    .replace(/```[\s\S]*?```/g, ' ')           // 代码块
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')     // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // 链接保留文字
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')        // 标题
    .replace(/^\s{0,3}>\s?/gm, '')             // 引用
    .replace(/^\s{0,3}[-*+]\s+/gm, '')         // 无序列表
    .replace(/^\s{0,3}\d+\.\s+/gm, '')         // 有序列表
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 近似 Liquid 的 truncate: 300（超长则截断并加 …） */
export function truncate(text: string, n: number): string {
  return text.length <= n ? text : text.slice(0, n) + '…';
}
