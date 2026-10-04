import type { Post } from './posts';

const namesOf = (p: Post, key: 'tags' | 'category'): string[] => {
  const raw = p.data[key];
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return key === 'tags' ? raw.split(/\s+/).filter(Boolean) : [raw];
};

/** 按标签/分类分组。组按文章数倒序（同数按名称），组内文章按日期倒序。 */
export function groupPosts(posts: Post[], key: 'tags' | 'category') {
  const map = new Map<string, Post[]>();
  for (const p of posts) {          // posts 本身已是新 → 旧
    for (const n of namesOf(p, key)) {
      if (!map.has(n)) map.set(n, []);
      map.get(n)!.push(p);
    }
  }
  return new Map(
    [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh'))
  );
}
