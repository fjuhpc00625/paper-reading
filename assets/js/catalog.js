document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('papers-grid');
  const searchInput = document.getElementById('paper-search');
  const tagFilterContainer = document.getElementById('tag-filters');
  const totalCountEl = document.getElementById('stat-total-papers');
  const resultStatusEl = document.getElementById('filter-status');

  let papers = [];
  let activeTag = 'ALL';

  async function loadPapers() {
    try {
      const res = await fetch('./data/papers.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Network error');
      papers = await res.json();
    } catch {
      const fallbackEl = document.getElementById('papers-fallback');
      if (fallbackEl) {
        try {
          papers = JSON.parse(fallbackEl.textContent);
        } catch {
          papers = [];
        }
      }
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function renderTags() {
    if (!tagFilterContainer) return;
    const allTags = new Set();
    papers.forEach((p) => (p.tags || []).forEach((t) => allTags.add(t)));

    const buttons = [
      `<button type="button" data-tag="ALL" aria-pressed="${activeTag === 'ALL'}" class="tag-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
        activeTag === 'ALL'
          ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
      }">全部文獻 (${papers.length})</button>`
    ];

    allTags.forEach((tag) => {
      const isSelected = activeTag === tag;
      buttons.push(
        `<button type="button" data-tag="${escapeHtml(tag)}" aria-pressed="${isSelected}" class="tag-filter-btn px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
          isSelected
            ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
        }">${escapeHtml(tag)}</button>`
      );
    });

    tagFilterContainer.innerHTML = buttons.join('');
    tagFilterContainer.querySelectorAll('.tag-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTag = btn.getAttribute('data-tag') || 'ALL';
        renderTags();
        renderCards();
      });
    });
  }

  function renderCards() {
    if (!grid) return;
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

    const filtered = papers.filter((p) => {
      const matchesTag = activeTag === 'ALL' || (p.tags || []).includes(activeTag);
      const haystack = [
        p.title_zh,
        p.title_en,
        p.authors,
        p.journal,
        p.elevator_hook,
        ...(p.tags || [])
      ]
        .join(' ')
        .toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesTag && matchesQuery;
    });

    if (totalCountEl) {
      totalCountEl.textContent = String(papers.length);
    }

    if (resultStatusEl) {
      resultStatusEl.textContent = `目前顯示 ${filtered.length} 篇文獻導讀`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-2">
          <p class="text-sm font-bold text-slate-800">找不到符合條件的文獻導讀</p>
          <p class="text-xs text-slate-500">請嘗試清除搜尋關鍵字或切換其他領域標籤。</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered
      .map((paper) => {
        const tagsHtml = (paper.tags || [])
          .map(
            (tag) =>
              `<span class="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11px] font-semibold">${escapeHtml(tag)}</span>`
          )
          .join('');

        const metricsHtml = (paper.key_metrics || [])
          .slice(0, 3)
          .map(
            (m) => `
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div class="text-[10px] text-slate-500 font-semibold">${escapeHtml(m.label)}</div>
              <div class="text-xs font-extrabold text-slate-900 mt-0.5 font-mono-metric">${escapeHtml(m.value)}</div>
            </div>
          `
          )
          .join('');

        return `
          <article class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-5">
            <div class="space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg">${escapeHtml(paper.journal)} &bull; ${escapeHtml(paper.year)}</span>
                <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-lg">${escapeHtml(paper.quartile)} | IF ${escapeHtml(paper.impact_factor)}</span>
              </div>

              <div>
                <h3 class="text-lg font-extrabold text-slate-900 leading-snug">${escapeHtml(paper.title_zh)}</h3>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed" lang="en">${escapeHtml(paper.title_en)}</p>
              </div>

              <div class="flex flex-wrap gap-1.5">
                ${tagsHtml}
              </div>

              <div class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-slate-700 leading-relaxed">
                <span class="font-bold text-amber-900">電梯簡報一句話：</span>
                ${escapeHtml(paper.elevator_hook)}
              </div>

              <div class="grid grid-cols-3 gap-2">
                ${metricsHtml}
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <span class="text-[11px] text-slate-400 font-mono-metric">DOI: ${escapeHtml(paper.doi)}</span>
              <a href="${escapeHtml(paper.url)}" class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors">
                <span>進入四大模組導讀</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5" aria-hidden="true"></i>
              </a>
            </div>
          </article>
        `;
      })
      .join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  await loadPapers();
  renderTags();
  renderCards();

  if (searchInput) {
    searchInput.addEventListener('input', renderCards);
  }
});
