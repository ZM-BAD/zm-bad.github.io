import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** 按日期倒序 */
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function postUrl(post: Post): string {
  return `/posts/${post.id}/`;
}

/** 2026年08月02日 */
export function postDateCN(post: Post): string {
  const d = post.data.date;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}年${p(d.getUTCMonth() + 1)}月${p(d.getUTCDate())}日`;
}

/** 2026-08-02 */
export function postDateISO(post: Post): string {
  return post.data.date.toISOString().slice(0, 10);
}

/** 把 markdown 正文压成纯文本（用于搜索摘要） */
export function bodyToText(body: string): string {
  return body
    .replace(/^---[\s\S]*?---/, '')            // front matter（正常不会有）
    .replace(/```[\s\S]*?```/g, ' ')           // 代码块
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')     // 图片（markdown 语法）
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // 链接保留文字
    .replace(/<[^>]*>/g, ' ')                  // 裸 HTML 标签（插图按约定写 <img>）
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')        // 标题
    .replace(/^\s{0,3}>\s?/gm, '')             // 引用
    .replace(/^\s{0,3}[-*+]\s+/gm, '')         // 无序列表
    .replace(/^\s{0,3}\d+\.\s+/gm, '')         // 有序列表
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 截断到 n 个字符（省略号计入总长） */
export function truncate(text: string, n: number): string {
  return text.length <= n ? text : text.slice(0, n - 3) + '...';
}
