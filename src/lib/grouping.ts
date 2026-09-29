import type { Post } from './posts';

/**
 * 复刻 Jekyll 的 site.tags / site.categories 顺序。
 * 实测是「按文章从旧到新、标签首次出现的顺序」——
 * 例如 tags 渲染为 写心情 → 美剧 → Vibe Coding → AI → 独立开发。
 */
export function groupsInJekyllOrder(posts: Post[], key: 'tags' | 'category') {
  const namesOf = (p: Post): string[] => {
    const raw = p.data[key];
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return key === 'tags' ? raw.split(/\s+/).filter(Boolean) : [raw];
  };

  // ① 分组顺序：按文章「旧 → 新」里标签首次出现的次序
  //    （实测 tags 页是 写心情 → 美剧 → Vibe Coding → AI → 独立开发）
  const order = new Map<string, number>();
  for (const p of [...posts].reverse()) {
    for (const n of namesOf(p)) if (!order.has(n)) order.set(n, order.size);
  }

  // ② 组内文章：Jekyll 的 post_attr_hash 是 posts.sort!.reverse! → 新 → 旧
  const map = new Map<string, Post[]>();
  for (const p of posts) {                    // posts 本身就是新 → 旧
    for (const n of namesOf(p)) {
      if (!map.has(n)) map.set(n, []);
      map.get(n)!.push(p);
    }
  }

  // ③ 按 ① 的顺序重排
  return new Map([...map.entries()].sort((a, b) => order.get(a[0])! - order.get(b[0])!));
}
