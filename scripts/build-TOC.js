// scripts/build-toc.js
const fs = require('fs/promises');
const path = require('path');
const fg = require('fast-glob');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');

(async function build() {
  try {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });

    const files = await fg('content/**/*.md');
    const items = [];

    for (const f of files) {
      const raw = await fs.readFile(f, 'utf-8');
      const { data, content } = matter(raw);
      const section = (data.section || path.basename(path.dirname(f))).toLowerCase();
      const slug = (data.slug || path.basename(f, '.md')).toLowerCase();
      const title = data.title || slug;
      const excerpt = data.excerpt || '';
      const date = data.date || null;

      const id = `${section}-${slug}`.replace(/\s+/g, '-').toLowerCase();

      // convert md -> html using markdown-it (CommonJS-friendly)
      const htmlContent = md.render(content);

      // write article HTML into public/articles/<id>.html
      const outDir = path.join(process.cwd(), 'public', 'articles');
      await fs.mkdir(outDir, { recursive: true });
      const outFile = path.join(outDir, `${id}.html`);
      const htmlWrapped = `<div class="article-content" data-id="${id}">\n${htmlContent}\n</div>`;
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
      items: items.filter(it => it.section === sec).sort((a,b)=> {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date < b.date ? 1 : -1;
      })
    }));

    // include any other sections not in order at the end
    const otherSections = Array.from(new Set(items.map(i=>i.section))).filter(s=>!order.includes(s));
    for (const sec of otherSections) {
      grouped.push({ id: sec, items: items.filter(it=>it.section===sec) });
    }

    // ensure output public exists
    await fs.mkdir(path.join(process.cwd(), 'public'), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), 'public', 'toc.json'), JSON.stringify(grouped, null, 2), 'utf-8');

    console.log('Wrote public/toc.json and article HTML files for', items.length, 'articles.');
  } catch (err) {
    console.error('Error in build-toc:', err);
    process.exit(1);
  }
})();
