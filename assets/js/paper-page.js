document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  let lastAnnouncedMsg = '';
  function announceStatus(statusEl, msg) {
    if (!statusEl) return;
    let out = msg;
    if (out === lastAnnouncedMsg) {
      out += '\u00A0';
    }
    lastAnnouncedMsg = out;
    statusEl.textContent = out;
  }

  function legacyCopy(text) {
    const field = Object.assign(document.createElement('textarea'), { value: text });
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
    document.body.append(field);
    field.select();
    try {
      return document.execCommand('copy');
    } finally {
      field.remove();
    }
  }

  async function writeClipboardText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return legacyCopy(text);
    }
  }

  // 1. Mobile sidebar toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      const isClosed = sidebar.classList.contains('-translate-x-full');
      sidebar.classList.toggle('-translate-x-full');
      mobileBtn.setAttribute('aria-expanded', String(isClosed));
    });

    sidebar.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
          sidebar.classList.add('-translate-x-full');
          mobileBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // 2. Scroll-spy for sidebar navigation
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  if (sections.length > 0 && navItems.length > 0) {
    const updateActiveNav = () => {
      let currentId = sections[0].id;
      const scrollY = window.scrollY + 140;
      for (const section of sections) {
        if (scrollY >= section.offsetTop) {
          currentId = section.id;
        }
      }
      navItems.forEach((item) => {
        const isActive = item.getAttribute('href') === `#${currentId}`;
        item.classList.toggle('active-nav', isActive);
      });
    };
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  // 3. Native <dialog> modal controllers + light-dismiss fallback
  const modal = document.getElementById('method-modal');
  const methodTriggers = document.querySelectorAll('[data-method-key]');
  const closeModalBtns = document.querySelectorAll('[data-close-modal]');

  if (modal) {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const isOutside = (e, dialogEl) => {
        const r = dialogEl.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      modal.addEventListener('pointerdown', (e) => {
        pressedOutside = isOutside(e, modal);
      });
      modal.addEventListener('pointerup', (e) => {
        if (pressedOutside && isOutside(e, modal)) {
          modal.close();
        }
      });
    }

    const openMethodModal = (key) => {
      const detailsMap = window.PAPER_METHOD_DETAILS || {};
      const data = detailsMap[key];
      if (!data) return;

      const titleEl = document.getElementById('modal-title');
      const subtitleEl = document.getElementById('modal-subtitle');
      const bodyEl = document.getElementById('modal-body');
      const iconEl = document.getElementById('modal-icon');

      if (titleEl) titleEl.textContent = data.title;
      if (subtitleEl) subtitleEl.textContent = data.subtitle;
      if (bodyEl) bodyEl.innerHTML = data.content;
      if (iconEl && data.icon) {
        iconEl.setAttribute('data-lucide', data.icon);
      }
      if (window.lucide) {
        window.lucide.createIcons();
      }
      modal.showModal();
    };

    methodTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        openMethodModal(trigger.getAttribute('data-method-key'));
      });
    });

    closeModalBtns.forEach((btn) => {
      btn.addEventListener('click', () => modal.close());
    });
  }

  // 4. Accessible Tabs (role="tablist" / role="tab" / role="tabpanel")
  const tablists = document.querySelectorAll('[role="tablist"]');
  tablists.forEach((tablist) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const container = tablist.closest('.tabs-container') || tablist.parentElement;
    const panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));

    const activateTab = (targetTab, shouldFocus = false) => {
      const targetPanelId = targetTab.getAttribute('data-panel');
      tabs.forEach((tab) => {
        const selected = tab === targetTab;
        tab.setAttribute('aria-selected', String(selected));
        tab.setAttribute('tabindex', selected ? '0' : '-1');
      });

      panels.forEach((panel) => {
        const isMatch = panel.id === targetPanelId;
        if (isMatch) {
          panel.removeAttribute('hidden');
          panel.setAttribute('tabindex', '0');
        } else {
          panel.setAttribute('hidden', 'onbeforematch' in HTMLElement.prototype ? 'until-found' : '');
          panel.removeAttribute('tabindex');
        }
      });

      if (shouldFocus) {
        targetTab.focus();
      }
      targetTab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab, false));
      tab.addEventListener('keydown', (e) => {
        let nextIndex = null;
        if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') nextIndex = 0;
        else if (e.key === 'End') nextIndex = tabs.length - 1;

        if (nextIndex !== null) {
          e.preventDefault();
          activateTab(tabs[nextIndex], true);
        }
      });
    });

    container.addEventListener('beforematch', (e) => {
      const matchedPanel = e.target.closest('[role="tabpanel"]');
      if (matchedPanel) {
        const matchingTab = tabs.find((t) => t.getAttribute('data-panel') === matchedPanel.id);
        if (matchingTab) activateTab(matchingTab, false);
      }
    });
  });

  // 5. Copy Elevator Pitch script helper
  const copyBtn = document.getElementById('btn-copy-pitch');
  const pitchStatus = document.getElementById('pitch-copy-status');
  const pitchScript = document.getElementById('elevator-pitch-script');
  if (copyBtn && pitchScript) {
    copyBtn.addEventListener('click', async () => {
      const text = pitchScript.innerText.trim();
      const ok = await writeClipboardText(text);
      announceStatus(pitchStatus, ok ? '已複製電梯簡報腳本！' : '無法自動複製，請手動選取。');
      setTimeout(() => {
        if (pitchStatus) pitchStatus.textContent = '';
      }, 2500);
    });
  }

  // ==========================================================================
  // 6. Paper 重點劃線系統 (AI 重點切換 + 讀者反白螢光筆 + LocalStorage 筆記本)
  // ==========================================================================
  const mainEl = document.getElementById('main-content');
  const toolbarEl = document.getElementById('highlight-toolbar');
  const toolbarStatus = document.getElementById('hl-toolbar-status');
  const toggleAiBtn = document.getElementById('btn-toggle-ai-hl');
  const clearUserHlBtn = document.getElementById('btn-clear-user-hl');
  const copyAllHlBtn = document.getElementById('btn-copy-all-hl');
  const selectionPopover = document.getElementById('selection-hl-popover');
  const userHlListEl = document.getElementById('user-highlights-list');
  const userHlCountEl = document.getElementById('user-hl-count');

  // Roving tabindex fallback for [role="toolbar"] when native focusgroup is absent
  if (toolbarEl && !('focusGroup' in HTMLElement.prototype)) {
    const items = Array.from(toolbarEl.querySelectorAll('button'));
    items.forEach((b, i) => {
      b.tabIndex = i === 0 ? 0 : -1;
    });
    toolbarEl.addEventListener('focusin', ({ target }) => {
      if (items.includes(target)) {
        items.forEach((b) => {
          b.tabIndex = b === target ? 0 : -1;
        });
      }
    });
    toolbarEl.addEventListener('keydown', (e) => {
      const idx = items.indexOf(document.activeElement);
      if (idx === -1) return;
      let next = null;
      if (e.key === 'ArrowRight') next = (idx + 1) % items.length;
      else if (e.key === 'ArrowLeft') next = (idx - 1 + items.length) % items.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = items.length - 1;
      if (next !== null) {
        e.preventDefault();
        items[next].focus();
      }
    });
  }

  const storageKey = `paper_highlights_${window.location.pathname.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  let savedHighlights = [];

  function loadSavedHighlights() {
    try {
      const raw = localStorage.getItem(storageKey);
      savedHighlights = raw ? JSON.parse(raw) : [];
    } catch {
      savedHighlights = [];
    }
  }

  function persistHighlights() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedHighlights));
    } catch {
      // Ignore quota errors
    }
  }

  // Toggle AI semantic highlights
  if (toggleAiBtn && mainEl) {
    toggleAiBtn.addEventListener('click', () => {
      const currentlyPressed = toggleAiBtn.getAttribute('aria-pressed') === 'true';
      const nextState = !currentlyPressed;
      toggleAiBtn.setAttribute('aria-pressed', String(nextState));
      mainEl.setAttribute('data-ai-highlights', nextState ? 'on' : 'off');
      announceStatus(toolbarStatus, nextState ? '已開啟 AI 重點劃線' : '已隱藏 AI 重點劃線');
    });
  }

  const colorLabels = {
    yellow: { name: '黃色核心重點', badge: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
    green: { name: '綠色關鍵數據', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    purple: { name: '紫色佳句/生字', badge: 'bg-purple-100 text-purple-900 border-purple-300' }
  };

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function unwrapHighlightMark(id) {
    if (!mainEl) return;
    mainEl.querySelectorAll(`mark.user-hl[data-hl-id="${id}"]`).forEach((mark) => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    });
  }

  function removeHighlightById(id) {
    unwrapHighlightMark(id);
    savedHighlights = savedHighlights.filter((item) => item.id !== id);
    persistHighlights();
    renderUserHighlightsList();
    announceStatus(toolbarStatus, '已移除一筆自訂劃線');
  }

  function bindMarkRemoval(markEl, id) {
    markEl.setAttribute('tabindex', '0');
    markEl.setAttribute('title', '點擊即可移除此筆劃線');
    markEl.addEventListener('click', (e) => {
      e.stopPropagation();
      removeHighlightById(id);
    });
    markEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeHighlightById(id);
      }
    });
  }

  // Restore saved highlights by matching text inside <main>
  function restoreHighlightInDom(item) {
    if (!mainEl || !item.text || item.text.length < 2) return;
    const walker = document.createTreeWalker(mainEl, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (
          parent.closest('#highlight-toolbar, #user-highlights-section, script, style, button') ||
          parent.classList.contains('user-hl')
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return node.nodeValue.includes(item.text)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });

    const matchNode = walker.nextNode();
    if (!matchNode) return;
    const startIdx = matchNode.nodeValue.indexOf(item.text);
    if (startIdx === -1) return;

    const range = document.createRange();
    range.setStart(matchNode, startIdx);
    range.setEnd(matchNode, startIdx + item.text.length);

    const mark = document.createElement('mark');
    mark.className = 'user-hl';
    mark.setAttribute('data-hl-color', item.color || 'yellow');
    mark.setAttribute('data-hl-id', item.id);
    bindMarkRemoval(mark, item.id);

    try {
      range.surroundContents(mark);
    } catch {
      // Skip if cross-boundary
    }
  }

  function renderUserHighlightsList() {
    if (userHlCountEl) {
      userHlCountEl.textContent = String(savedHighlights.length);
    }
    if (!userHlListEl) return;

    if (savedHighlights.length === 0) {
      userHlListEl.innerHTML = `
        <div class="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
          目前尚無個人自訂劃線。請在上方內文中<strong>用滑鼠反白任意文字</strong>，即可選擇螢光筆顏色畫重點並自動儲存於此！
        </div>
      `;
      return;
    }

    userHlListEl.innerHTML = savedHighlights
      .map((item) => {
        const meta = colorLabels[item.color] || colorLabels.yellow;
        return `
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
            <div class="space-y-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2 py-0.5 text-[11px] font-bold rounded-md border ${meta.badge}">${meta.name}</span>
                <span class="text-[11px] text-slate-400 font-semibold">${escapeHtml(item.section || '內文重點')}</span>
              </div>
              <p class="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed break-words">「${escapeHtml(item.text)}」</p>
            </div>
            <button
              type="button"
              data-remove-hl="${escapeHtml(item.id)}"
              aria-label="刪除此筆重點劃線"
              class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 flex-shrink-0"
            >
              <i data-lucide="trash-2" class="w-4 h-4" aria-hidden="true"></i>
            </button>
          </div>
        `;
      })
      .join('');

    userHlListEl.querySelectorAll('[data-remove-hl]').forEach((btn) => {
      btn.addEventListener('click', () => {
        removeHighlightById(btn.getAttribute('data-remove-hl'));
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function applySelectionHighlight(color) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      announceStatus(toolbarStatus, '請先在文章內反白選取一段文字，再點選螢光筆顏色！');
      return;
    }

    const range = sel.getRangeAt(0);
    if (!mainEl || !mainEl.contains(range.commonAncestorContainer)) {
      return;
    }
    if (
      range.commonAncestorContainer.parentElement &&
      range.commonAncestorContainer.parentElement.closest('#highlight-toolbar, #user-highlights-section')
    ) {
      return;
    }

    const text = sel.toString().trim();
    if (!text) return;

    const sectionEl =
      (range.startContainer.nodeType === 1
        ? range.startContainer
        : range.startContainer.parentElement
      )?.closest('section[id]');
    const headingEl = sectionEl ? sectionEl.querySelector('h1, h2') : null;
    const sectionTitle = headingEl ? headingEl.textContent.trim() : '論文重點';

    const id = `hl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const mark = document.createElement('mark');
    mark.className = 'user-hl';
    mark.setAttribute('data-hl-color', color);
    mark.setAttribute('data-hl-id', id);
    bindMarkRemoval(mark, id);

    try {
      range.surroundContents(mark);
    } catch {
      // If selection crosses multiple elements, wrap extracted contents safely
      const fragment = range.extractContents();
      mark.appendChild(fragment);
      range.insertNode(mark);
    }

    sel.removeAllRanges();
    if (selectionPopover) {
      selectionPopover.hidden = true;
    }

    savedHighlights.push({
      id,
      text,
      color,
      section: sectionTitle
    });
    persistHighlights();
    renderUserHighlightsList();
    announceStatus(toolbarStatus, `已加入${(colorLabels[color] || colorLabels.yellow).name}`);
  }

  // Bind color buttons in both top toolbar and floating selection popover
  document.querySelectorAll('[data-apply-hl]').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      // Prevent clearing current text selection when clicking a highlight button
      e.preventDefault();
    });
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-apply-hl') || 'yellow';
      applySelectionHighlight(color);
    });
  });

  // Show floating selection popover above selected text inside <main>
  if (selectionPopover && mainEl) {
    const updatePopoverPosition = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        selectionPopover.hidden = true;
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 2) {
        selectionPopover.hidden = true;
        return;
      }
      const range = sel.getRangeAt(0);
      if (!mainEl.contains(range.commonAncestorContainer)) {
        selectionPopover.hidden = true;
        return;
      }
      const parentEl =
        range.commonAncestorContainer.nodeType === 1
          ? range.commonAncestorContainer
          : range.commonAncestorContainer.parentElement;
      if (parentEl && parentEl.closest('#highlight-toolbar, #user-highlights-section, button')) {
        selectionPopover.hidden = true;
        return;
      }

      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        selectionPopover.hidden = true;
        return;
      }

      const top = Math.max(48, rect.top);
      const left = Math.min(window.innerWidth - 110, Math.max(110, rect.left + rect.width / 2));
      selectionPopover.style.top = `${top}px`;
      selectionPopover.style.left = `${left}px`;
      selectionPopover.hidden = false;
    };

    document.addEventListener('pointerup', () => {
      setTimeout(updatePopoverPosition, 20);
    });
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        selectionPopover.hidden = true;
      } else {
        updatePopoverPosition();
      }
    });
    window.addEventListener(
      'scroll',
      () => {
        if (!selectionPopover.hidden) selectionPopover.hidden = true;
      },
      { passive: true }
    );
  }

  // Clear all custom highlights on this page
  if (clearUserHlBtn) {
    clearUserHlBtn.addEventListener('click', () => {
      savedHighlights.forEach((item) => unwrapHighlightMark(item.id));
      savedHighlights = [];
      persistHighlights();
      renderUserHighlightsList();
      announceStatus(toolbarStatus, '已清除本頁所有自訂劃線');
    });
  }

  // Copy all highlights (AI + User) as Markdown notes
  if (copyAllHlBtn && mainEl) {
    copyAllHlBtn.addEventListener('click', async () => {
      const pageTitle = document.querySelector('h1')?.textContent.trim() || document.title;
      const lines = [`# ${pageTitle} — 重點劃線筆記`, ''];

      const aiMarks = Array.from(mainEl.querySelectorAll('mark.ai-hl'));
      if (aiMarks.length > 0) {
        lines.push('## AI 標註核心重點');
        aiMarks.forEach((m) => {
          lines.push(`- ${m.textContent.trim()}`);
        });
        lines.push('');
      }

      if (savedHighlights.length > 0) {
        lines.push('## 個人自訂重點劃線');
        savedHighlights.forEach((item) => {
          lines.push(`- [${item.section}] ${item.text}`);
        });
        lines.push('');
      }

      const ok = await writeClipboardText(lines.join('\n'));
      announceStatus(toolbarStatus, ok ? '已複製全部重點筆記 (Markdown)！' : '複製失敗，請手動選取');
    });
  }

  // Initialize saved highlights on page load
  loadSavedHighlights();
  savedHighlights.forEach((item) => restoreHighlightInDom(item));
  renderUserHighlightsList();
});
