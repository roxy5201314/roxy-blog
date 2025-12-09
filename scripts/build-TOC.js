// scripts/build-toc.js
const fs = require('fs/promises');
const path = require('path');
const fg = require('fast-glob');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');

// require the katex plugin (install markdown-it-katex and katex)
const mdKatex = require('markdown-it-katex');

(function sanitizeSlug(s) {
    return s;
})();

(async function build() {
    try {
        // create markdown-it instance and use the katex plugin
        const md = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true,
        }).use(mdKatex);

        const files = await fg('content/**/*.md');
        const items = [];

        for (const f of files) {
            const raw = await fs.readFile(f, 'utf-8');
            const { data, content: rawContent } = matter(raw);

            // === 预处理：只在非代码区域把 \( ... \) / \[ ... \] -> $...$ / $$...$$
            // 1) 把文档分割为 code-fence 块和非 code 区块，确保不替换代码中的内容
            const splitter = /(```[\s\S]*?```|`[^`]*`)/g; // 捕获 ```...``` 或 行内 `...`
            const parts = rawContent.split(splitter);
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                // 如果匹配到 code 块（以 ``` 或 ` 开头），跳过替换
                if (part && (part.startsWith('```') || part.startsWith('`'))) {
                    continue;
                }

                let s = part;

                // 避免对已经用 $ 包围的表达式重复处理：
                // 简单策略：先把 \$（转义的美元）恢复为占位，防止误处理
                s = s.replace(/\\\$/g, '__ESCAPED_DOLLAR__');

                // 将 \( ... \) -> $ ... $  (inline)
                s = s.replace(/\\\(([\s\S]*?)\\\)/g, (_m, g1) => {
                    // trim 保持整洁；若内容本身包含行首/尾空白，保留关键内部换行已经 OK
                    return `$${g1.trim()}$`;
                });

                // 将 \[ ... \] -> $$ ... $$ (display)
                s = s.replace(/\\\[(\s*[\s\S]*?\s*)\\\]/g, (_m, g1) => {
                    return `$$\n${g1.trim()}\n$$`;
                });

                // 恢复被占位的 \$ 
                s = s.replace(/__ESCAPED_DOLLAR__/g, '\\$');

                parts[i] = s;
            }

            // 重建内容
            let content = parts.join('');

            // === 另一个安全检查：将单独行的 $...$ 或 $$...$$ 留给 markdown-it-katex
            // （上面已把 \( \) 和 \[ \] 转换完毕，尽量不要再做其它全局替换）

            // sanitize section and slug: lower-case, replace non-alnum with '-'
            const rawSection = (data.section || path.basename(path.dirname(f))).toLowerCase();
            const section = String(rawSection).replace(/[^a-z0-9\-]/gi, '-').replace(/-+/g, '-').replace(/(^-|-$$)/g,'') || 'misc';
            const rawSlug = (data.slug || path.basename(f, '.md')).toLowerCase();
            const slug = String(rawSlug).replace(/[^a-z0-9\-]/gi, '-').replace(/-+/g, '-').replace(/(^-|-$$)/g,'') || 'post';
            const title = data.title || slug;
            const excerpt = data.excerpt || '';
            const date = data.date || null;
            const id = `${section}-${slug}`.replace(/\s+/g, '-').toLowerCase();

            // convert md -> html using markdown-it with katex support
            const htmlContent = md.render(content);

            // write article HTML into public/articles/<id>.html
            const outDir = path.join(process.cwd(), 'public', 'articles');
            await fs.mkdir(outDir, { recursive: true });
            const outFile = path.join(outDir, `${id}.html`);

            // 注意：这里把 KaTeX 的 CSS 链接加入到每篇文章的头部，保证公式样式正确。
            // 如果你的网站全局模板已经引入了 KaTeX（preferred），可以删掉下面的 <link>.
            const katexCssCdn = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">';
            const htmlWrapped = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
${katexCssCdn}
</head>
<body>
<div class="article-content" data-id="${id}">
${htmlContent}
</div>
</body>
</html>`;

            await fs.writeFile(outFile, htmlWrapped, 'utf-8');

            items.push({
                section,
                slug,
                title,
                excerpt,
                date,
                id,
                path: `/articles/${id}.html`
            });
        }

        // group by desired order
        const order = ['introduction', 'pwn', 'web', 'reverse', 'crypto', 'misc'];
        const grouped = order.map(sec => ({
            id: sec,
            items: items.filter(it => it.section === sec).sort((a, b) => {
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;
                return a.date < b.date ? 1 : -1;
            })
        }));

        // include any other sections not in order at the end
        const otherSections = Array.from(new Set(items.map(i => i.section))).filter(s => !order.includes(s));
        for (const sec of otherSections) {
            grouped.push({
                id: sec,
                items: items.filter(it => it.section === sec)
            });
        }

        // ensure output public exists
        await fs.mkdir(path.join(process.cwd(), 'public'), { recursive: true });
        await fs.writeFile(path.join(process.cwd(), 'public', 'toc.json'), JSON.stringify(grouped, null, 2), 'utf-8');

        console.log('Wrote public/toc.json and article HTML files for', items.length, 'articles.');
        process.exit(0);
    } catch (err) {
        console.error('Error in build-toc:', err);
        process.exit(1);
    }
})();

// 小 helper：防止 title 中的 <>&" 导致 HTML 问题
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
