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
