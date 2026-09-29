/**
 * 复刻 Jekyll 的 slug 算法，保证迁移后 URL 一字不差。
 *
 * 依据（Jekyll 4.4.1 源码）：
 *   lib/jekyll/drops/url_drop.rb
 *     def title
 *       Utils.slugify(@obj.data["slug"], :mode => "pretty", :cased => true)
 *     end
 *   lib/jekyll/utils.rb
 *     SLUGIFY_PRETTY_REGEXP = /[^\p{M}\p{L}\p{Nd}._~!$&'()+,;=@]+/
 *   lib/jekyll/document.rb#populate_title
 *     slug.gsub!(/\.*\z/, "")   # 尾部句点先剥掉
 *
 * 含义：保留字母/数字/组合符 + ._~!$&'()+,;=@ ，大小写不转换。
 * 所以 'Mr. Robot' → 'Mr.-Robot'（句点被保留），'DAG-chat' 不会变小写。
 */
const PRETTY = /[^\p{M}\p{L}\p{Nd}._~!$&'()+,;=@]+/gu;

export function jekyllTitleSlug(raw: string): string {
  return raw
    .replace(/\.*$/, '')       // Jekyll: 先剥尾部句点
    .replace(PRETTY, '-')
    .replace(/^-|-$/gi, '');
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/;

export interface PostPath {
  year: string; month: string; day: string;
  slug: string; date: string;
}

/** 把 `_posts/2022-03-05-假期很短，放空大脑.md` 的 id 解析成 URL 参数 */
export function idToPath(id: string): PostPath {
  const m = id.match(DATE_RE);
  if (!m) throw new Error(`文件名不符合 Jekyll 约定（需 YYYY-MM-DD-标题.md）: ${id}`);
  const [, year, month, day, raw] = m;
  return { year, month, day, slug: jekyllTitleSlug(raw), date: `${year}-${month}-${day}` };
}
