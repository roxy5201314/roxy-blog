'use client';

import React, { useEffect, useRef, useState } from 'react';

const COVER_IMAGE = '/cover.jpg';

type TocItem = {
  section?: string;
  slug: string;
  title: string;
  excerpt?: string;
  date?: string | null;
  path?: string;
  id?: string;
};

type Grouped = {
  id: string;
  items: TocItem[];
};

const FALLBACK: Grouped[] = [
  { id: 'introduction', items: [{ slug: 'intro', title: 'Introduction', excerpt: 'Why I write and what this blog covers.' }] },
  { id: 'pwn', items: [] },
  { id: 'web', items: [] },
  { id: 'reverse', items: [] },
  { id: 'crypto', items: [] },
  { id: 'misc', items: [] },
];

export default function Page() {
  const [sectionsData, setSectionsData] = useState<TocItem[]>([]);
  const [groupedToc, setGroupedToc] = useState<Grouped[]>(FALLBACK);
  const [activeId, setActiveId] = useState<string>('intro');
  const [tocOpen, setTocOpen] = useState<boolean>(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const navRef = useRef<HTMLDivElement | null>(null);
  const [markerStyle, setMarkerStyle] = useState<{ top: number; height: number } | null>(null);
  const [preview, setPreview] = useState<{ text: string; y: number } | null>(null);
  const previewTimerRef = useRef<number | null>(null);
  const [articleHtml, setArticleHtml] = useState<Record<string, string>>({});

  // load toc.json
  useEffect(() => {
    let mounted = true;
    fetch('/toc.json')
      .then(res => {
        if (!res.ok) throw new Error('no toc.json');
        return res.json();
      })
      .then((grouped: Grouped[]) => {
        if (!mounted) return;
        setGroupedToc(grouped && grouped.length ? grouped : FALLBACK);
        const flat: TocItem[] = [];
        grouped.forEach(g => {
          if (g.items && g.items.length > 0) {
            g.items.forEach(it => flat.push({ ...it, section: g.id }));
          } else {
            flat.push({ slug: `${g.id}-index`, title: g.id === 'introduction' ? 'Introduction' : g.id, excerpt: '', section: g.id });
          }
        });
        setSectionsData(flat);
        if (flat.length > 0) {
          const first = flat[0];
          const id = makeId(first);
          setActiveId(id);
        }
      })
      .catch(() => {
        setGroupedToc(FALLBACK);
        const flat: TocItem[] = FALLBACK.flatMap(g => g.items.map(it => ({ ...it, section: g.id })));
        setSectionsData(flat);
      });
    return () => { mounted = false; };
  }, []);

  // fetch article html files for sections
  useEffect(() => {
    sectionsData.forEach(item => {
      const id = makeId(item);
      if (articleHtml[id]) return;
      fetch(`/articles/${id}.html`)
        .then(r => {
          if (!r.ok) throw new Error('no article html');
          return r.text();
        })
        .then(html => {
          setArticleHtml(prev => ({ ...prev, [id]: html }));
        })
        .catch(() => {
          // no-op if not found
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsData]);

  // IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = visible.target.getAttribute('id') || '';
          setActiveId(id);
        }
      },
      { rootMargin: '0px 0px -40% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    sectionsData.forEach(s => {
      const id = makeId(s);
      const el = document.getElementById(id);
      if (el) {
        sectionRefs.current[id] = el;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [sectionsData]);

  // marker positioning
  useEffect(() => {
    const updateMarker = () => {
      const btn = buttonRefs.current[activeId];
      const nav = navRef.current;
      if (!btn || !nav) {
        setMarkerStyle(null);
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const rect = btn.getBoundingClientRect();
      const top = rect.top - navRect.top + nav.scrollTop;
      setMarkerStyle({ top: Math.round(top), height: Math.round(rect.height) });
    };
    updateMarker();
    window.addEventListener('resize', updateMarker);
    const ro = new ResizeObserver(updateMarker);
    if (navRef.current) ro.observe(navRef.current);
    return () => {
      window.removeEventListener('resize', updateMarker);
      ro.disconnect();
    };
  }, [activeId, tocOpen, sectionsData]);

  function makeId(item: TocItem) {
    const section = item.section ? item.section.replace(/\s+/g, '-') : '';
    const slug = item.slug || (item.title || '').toLowerCase().replace(/\s+/g, '-');
    return section ? `${section}-${slug}` : slug;
  }

  const triggerRipple = (btn: HTMLButtonElement | null, x?: number, y?: number) => {
    if (!btn) return;
    const circle = document.createElement('span');
    circle.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const left = (x ?? (rect.left + rect.width / 2)) - rect.left - 8;
    const top = (y ?? (rect.top + rect.height / 2)) - rect.top - 8;
    circle.style.left = `${left}px`;
    circle.style.top = `${top}px`;
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  const handleJump = (groupId: string, item?: TocItem, e?: React.MouseEvent<HTMLButtonElement>) => {
    setTocOpen(false);
    const id = item ? makeId(item) : groupId;
    const el = document.getElementById(id);
    const btn = buttonRefs.current[id] ?? buttonRefs.current[groupId];

    if (btn) {
      const cx = e?.clientX;
      const cy = e?.clientY;
      triggerRipple(btn, cx, cy);
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 220);
    }

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { try { el.focus({ preventScroll: true }); } catch {} }, 300);
    }

    const sectionText = item ? item.excerpt || item.title : '';
    if (sectionText && navRef.current && btn) {
      const navRect = navRef.current.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const y = btnRect.top - navRect.top + btnRect.height / 2;
      setPreview({ text: sectionText, y });
      if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = window.setTimeout(() => setPreview(null), 1600);
    }
  };

  const renderNav = () => (
    <nav className="bg-white/70 backdrop-blur rounded-lg p-3 shadow-sm relative overflow-hidden">
      <h2 className="font-semibold mb-3">目录</h2>
      <ul className="space-y-2 relative">
        <div
          aria-hidden
          className="absolute left-0 w-1 rounded-full bg-indigo-600 shadow-md transition-all duration-300"
          style={{
            top: markerStyle ? markerStyle.top : -9999,
            height: markerStyle ? markerStyle.height : 0,
            transform: markerStyle ? 'translateX(-6px)' : undefined,
          }}
        />
        {groupedToc.map(group => {
          if (group.items && group.items.length > 0) {
            return (
              <li key={group.id} className="mb-2">
                <div className="text-xs uppercase font-medium text-gray-500 mb-1 px-1">{group.id}</div>
                <ul className="space-y-1">
                  {group.items.map(it => {
                    const id = makeId({ ...it, section: group.id });
                    return (
                      <li key={id} className="relative">
                        <button
                          ref={el => { buttonRefs.current[id] = el; }}
                          onClick={e => handleJump(group.id, { ...it, section: group.id }, e)}
                          aria-current={activeId === id ? 'true' : undefined}
                          aria-label={`Jump to ${it.title}`}
                          className={`w-full text-left px-2 py-1 rounded-md text-sm relative overflow-hidden transition
                            ${activeId === id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <span className="inline-block transform transition-transform duration-150">{it.title}</span>
                          <span className="sr-only">{it.excerpt}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          } else {
            const placeholderId = `${group.id}-index`;
            return (
              <li key={group.id} className="relative">
                <button
                  ref={el => (buttonRefs.current[placeholderId] = el)}
                  onClick={e => handleJump(placeholderId, undefined, e)}
                  aria-current={activeId === placeholderId ? 'true' : undefined}
                  aria-label={`Jump to ${group.id}`}
                  className={`w-full text-left px-2 py-1 rounded-md text-sm relative overflow-hidden transition
                    ${activeId === placeholderId ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="inline-block transform transition-transform duration-150">
                    {group.id === 'introduction' ? 'Introduction' : group.id}
                  </span>
                </button>
              </li>
            );
          }
        })}
      </ul>

      {preview && (
        <div
          className="absolute right-2 top-0 transform translate-y-0 p-3 rounded-md bg-white shadow-lg text-xs max-w-xs animate-slide-in"
          style={{ top: preview.y }}
        >
          <div className="font-medium text-gray-800">Preview</div>
          <div className="text-gray-600 mt-1">{preview.text}</div>
        </div>
      )}
    </nav>
  );

  const renderSections = () =>
    sectionsData.map(item => {
      const id = makeId(item);
      return (
        <section key={id} id={id} tabIndex={-1} className="scroll-mt-20">
          <h2 className="text-2xl font-bold">{item.title}</h2>
          <p className="text-gray-600 text-sm mt-1">{item.excerpt}</p>
          <p className="mt-4">enjoy your read!😎😎😎</p>
          <div className="mt-4 bg-white/40 rounded-lg p-4">
            {articleHtml[id] ? (
              <div dangerouslySetInnerHTML={{ __html: articleHtml[id] }} />
            ) : (
              <p className="text-sm text-gray-600">文章正在创作中...</p>
            )}
          </div>
        </section>
      );
    });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <img src={COVER_IMAGE} alt="cover" className="absolute inset-0 w-full h-full object-cover scale-105" style={{ filter: 'blur(4px) brightness(0.85)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex items-center">
          <div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-md">roxy&apos;s blog</h1>
            <p className="mt-2 text-white/90">Notes, projects and things I care about.</p>
          </div>
        </div>
      </header>

      <aside className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 w-64 z-40">
        <div ref={navRef} className="w-full max-h-[74vh] overflow-auto">{renderNav()}</div>
      </aside>

      <div className="md:hidden px-4 py-4">
        <button onClick={() => setTocOpen(!tocOpen)} className="mb-4 px-3 py-1 rounded-md bg-indigo-600 text-white text-sm">
          {tocOpen ? '收起目录' : '展开目录'}
        </button>
        {tocOpen && <div className="mb-4">{renderNav()}</div>}
      </div>

      <main className="max-w-6xl mx-auto px-4 md:pl-[18rem] lg:pl-[20rem] py-10 space-y-12">{renderSections()}</main>

      <style jsx>{`
        :root { scroll-behavior: smooth; }
        .ripple {
          position: absolute;
          width: 16px;
          height: 16px;
          background: rgba(99,102,241,0.22);
          border-radius: 9999px;
          transform: scale(0);
          pointer-events: none;
          animation: ripple 560ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes ripple { to { transform: scale(18); opacity: 0; } }
        button.pressed { transform: translateY(1px) scale(0.996); transition: transform 160ms ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(8px) translateY(-6px) scale(0.98); } to { opacity: 1; transform: translateX(0) translateY(0) scale(1); } }
        .animate-slide-in { animation: slideIn 260ms ease; }
      `}</style>
    </div>
  );
}