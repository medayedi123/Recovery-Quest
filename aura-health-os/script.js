/* ─────────────────────────────────────────────────────────
   Memory Map — script.js  (section-safe version)
   ───────────────────────────────────────────────────────── */

'use strict';

function initMemoryMap() {

  // ── STATE ──────────────────────────────────────────────────
  const state = {
    viewYear:  new Date().getFullYear(),
    viewMonth: new Date().getMonth(),   // 0-indexed
    memories:  {},                       // { 'YYYY-MM-DD': { image: base64 } }
    pendingDate: null,                   // date string for file upload
    player: {
      frames:   [],
      index:    0,
      timer:    null,
      duration: 0,
      loop:     false,
      kenBurns: false,
      playing:  false
    }
  };

  // ── STORAGE ────────────────────────────────────────────────
  const STORAGE_KEY = 'memorymap_v1';

  function loadMemories() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state.memories = JSON.parse(raw);
    } catch { state.memories = {}; }
  }

  function saveMemories() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.memories));
    } catch {
      toast('Storage full – try deleting older memories');
    }
  }

  function setMemory(dateStr, imageBase64) {
    state.memories[dateStr] = { image: imageBase64 };
    saveMemories();
  }

  function deleteMemory(dateStr) {
    delete state.memories[dateStr];
    saveMemories();
  }

  function getMemory(dateStr) {
    return state.memories[dateStr] || null;
  }

  // ── DOM HELPERS ────────────────────────────────────────────
  // Scope all queries to the section so we never clash with the
  // rest of the page.
  const root = document.getElementById('memory-view');

  function $(id)  { return document.getElementById(id); }
  function $r(sel){ return root.querySelector(sel); }

  // ── DATE UTILS ─────────────────────────────────────────────
  function toDateStr(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function parseDateStr(str) {
    const [y, m, d] = str.split('-').map(Number);
    return { year: y, month: m - 1, day: d };
  }

  function todayStr() {
    const t = new Date();
    return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
  }

  function formatDateLabel(dateStr) {
    const { year, month, day } = parseDateStr(dateStr);
    const d = new Date(year, month, day);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function monthName(month, year) {
    return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function firstWeekday(year, month) {
    return new Date(year, month, 1).getDay(); // 0 = Sun
  }

  function dateRangeArray(startStr, endStr) {
    const dates = [];
    const start = new Date(startStr + 'T00:00:00');
    const end   = new Date(endStr   + 'T00:00:00');
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(toDateStr(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    return dates;
  }

  // ── RENDER HEADER ──────────────────────────────────────────
  function renderMonthLabel() {
    $('current-month-label').textContent = monthName(state.viewMonth, state.viewYear);
  }

  // ── RENDER HEATMAP ─────────────────────────────────────────
  function renderHeatmap() {
    const container = $('heatmap-container');
    container.innerHTML = '';
    const today = todayStr();

    for (let m = 0; m < 12; m++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'heatmap-month';

      const lbl = document.createElement('div');
      lbl.className = 'heatmap-month-label';
      lbl.textContent = new Date(state.viewYear, m, 1)
        .toLocaleDateString('en-US', { month: 'short' });
      wrapper.appendChild(lbl);

      const numDays = daysInMonth(state.viewYear, m);
      const weeks   = Math.ceil((firstWeekday(state.viewYear, m) + numDays) / 7);

      for (let w = 0; w < Math.min(weeks, 5); w++) {
        const row = document.createElement('div');
        row.className = 'heatmap-row';
        for (let wd = 0; wd < 7; wd++) {
          const dayNum = w * 7 + wd - firstWeekday(state.viewYear, m) + 1;
          const dot = document.createElement('div');
          dot.className = 'heatmap-dot';
          if (dayNum >= 1 && dayNum <= numDays) {
            const ds = toDateStr(state.viewYear, m, dayNum);
            if (ds === today)      dot.classList.add('today');
            else if (getMemory(ds)) dot.classList.add('filled');
            dot.title = ds;
            dot.addEventListener('click', () => {
              state.viewMonth = m;
              renderMonthLabel();
              renderCalendar();
            });
          }
          row.appendChild(dot);
        }
        wrapper.appendChild(row);
      }
      container.appendChild(wrapper);
    }
  }

  // ── RENDER CALENDAR ────────────────────────────────────────
  function renderCalendar() {
    const grid = $('calendar-grid');
    grid.innerHTML = '';

    const year     = state.viewYear;
    const month    = state.viewMonth;
    const numDays  = daysInMonth(year, month);
    const startWd  = firstWeekday(year, month);
    const today    = todayStr();

    // Padding days from previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear  = month === 0 ? year - 1 : year;
    const prevDays  = daysInMonth(prevYear, prevMonth);
    for (let i = 0; i < startWd; i++) {
      const d = prevDays - startWd + 1 + i;
      grid.appendChild(buildTile(toDateStr(prevYear, prevMonth, d), d, true));
    }

    let filledCount = 0;
    for (let d = 1; d <= numDays; d++) {
      const ds = toDateStr(year, month, d);
      if (getMemory(ds)) filledCount++;
      grid.appendChild(buildTile(ds, d, false));
    }

    // Padding to complete last row
    const total    = startWd + numDays;
    const rem      = total % 7 === 0 ? 0 : 7 - (total % 7);
    const nextMonth = month === 11 ? 0  : month + 1;
    const nextYear  = month === 11 ? year + 1 : year;
    for (let d = 1; d <= rem; d++) {
      grid.appendChild(buildTile(toDateStr(nextYear, nextMonth, d), d, true));
    }

    // Stats
    const totalFilled = Object.keys(state.memories).length;
    $('stat-filled').textContent = `${filledCount} memories`;
    $('stat-month').textContent  =
      new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' });
    $('stat-total').textContent  = `${totalFilled} total`;
  }

  function buildTile(dateStr, dayNum, isOtherMonth) {
    const today = todayStr();
    const mem   = getMemory(dateStr);

    const tile = document.createElement('div');
    tile.className    = 'day-tile';
    tile.dataset.date = dateStr;
    if (isOtherMonth)   tile.classList.add('other-month');
    else if (mem)        tile.classList.add('filled');
    else                 tile.classList.add('empty');
    if (dateStr === today) tile.classList.add('today');

    const num = document.createElement('span');
    num.className   = 'tile-num';
    num.textContent = dayNum;
    tile.appendChild(num);

    if (mem) {
      const img = document.createElement('img');
      img.className = 'tile-img';
      img.src       = mem.image;
      img.alt       = dateStr;
      tile.appendChild(img);

      const badge = document.createElement('div');
      badge.className = 'tile-filled-badge';
      tile.appendChild(badge);
    } else {
      const icon = document.createElement('div');
      icon.className   = 'tile-empty-icon';
      icon.textContent = '＋';
      tile.appendChild(icon);
    }

    tile.addEventListener('click', () => {
      if (isOtherMonth) return;
      if (mem) openPreviewModal(dateStr);
      else     triggerUpload(dateStr);
    });

    tile.addEventListener('contextmenu', (e) => {
      if (isOtherMonth) return;
      e.preventDefault();
      if (getMemory(dateStr)) {
        deleteMemory(dateStr);
        refresh();
        toast('Memory removed');
      }
    });

    return tile;
  }

  // ── FILE UPLOAD ────────────────────────────────────────────
  const fileInput = $('file-input');

  function triggerUpload(dateStr) {
    state.pendingDate = dateStr;
    fileInput.value   = '';
    fileInput.click();
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file || !state.pendingDate) return;
    if (!file.type.startsWith('image/')) { toast('Please select an image file'); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      setMemory(state.pendingDate, e.target.result);
      state.pendingDate = null;
      refresh();
      toast('Memory saved ✦');
    };
    reader.readAsDataURL(file);
  });

  // ── PREVIEW MODAL ──────────────────────────────────────────
  let previewCurrentDate = null;

  function openPreviewModal(dateStr) {
    previewCurrentDate = dateStr;
    const mem = getMemory(dateStr);
    if (!mem) return;
    $('modal-date-label').textContent = formatDateLabel(dateStr);
    $('modal-image').src = mem.image;
    $('modal-preview').classList.remove('hidden');
  }

  function closePreviewModal() {
    $('modal-preview').classList.add('hidden');
    previewCurrentDate = null;
  }

  $('preview-backdrop').addEventListener('click', closePreviewModal);
  $('preview-close').addEventListener('click', closePreviewModal);

  $('modal-replace').addEventListener('click', () => {
    if (previewCurrentDate) {
      closePreviewModal();
      triggerUpload(previewCurrentDate);
    }
  });

  $('modal-delete').addEventListener('click', () => {
    if (previewCurrentDate) {
      deleteMemory(previewCurrentDate);
      closePreviewModal();
      refresh();
      toast('Memory deleted');
    }
  });

  // ── HEADER BUTTONS ─────────────────────────────────────────
  $('btn-upload-day').addEventListener('click', () => triggerUpload(todayStr()));

  $('btn-prev-month').addEventListener('click', () => {
    if (state.viewMonth === 0) { state.viewMonth = 11; state.viewYear--; }
    else state.viewMonth--;
    renderMonthLabel();
    renderCalendar();
  });

  $('btn-next-month').addEventListener('click', () => {
    if (state.viewMonth === 11) { state.viewMonth = 0; state.viewYear++; }
    else state.viewMonth++;
    renderMonthLabel();
    renderCalendar();
  });

  // ── GENERATOR MODAL ────────────────────────────────────────
  let selectedDuration = 10;

  function openGeneratorModal() {
    const year    = state.viewYear;
    const month   = state.viewMonth;
    const numDays = daysInMonth(year, month);
    $('gen-start').value = toDateStr(year, month, 1);
    $('gen-end').value   = toDateStr(year, month, numDays);
    updateGenPreview();
    $('modal-generator').classList.remove('hidden');
  }

  function closeGeneratorModal() {
    $('modal-generator').classList.add('hidden');
  }

  $('btn-generate-video').addEventListener('click', openGeneratorModal);
  $('generator-close').addEventListener('click', closeGeneratorModal);
  $('generator-backdrop').addEventListener('click', closeGeneratorModal);
  $('generator-cancel').addEventListener('click', closeGeneratorModal);

  root.querySelectorAll('.gen-dur-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.gen-dur-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDuration = parseInt(btn.dataset.sec, 10);
      $('gen-custom-dur').value = '';
      updateGenPreview();
    });
  });

  $('gen-custom-dur').addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      selectedDuration = val;
      root.querySelectorAll('.gen-dur-btn').forEach(b => b.classList.remove('active'));
    }
    updateGenPreview();
  });

  $('gen-start').addEventListener('change', updateGenPreview);
  $('gen-end').addEventListener('change', updateGenPreview);

  function updateGenPreview() {
    const start = $('gen-start').value;
    const end   = $('gen-end').value;
    const el    = $('gen-preview-count');
    if (!start || !end || start > end) {
      el.textContent = 'Select a valid range';
      el.classList.remove('has-images');
      return;
    }
    const dates    = dateRangeArray(start, end);
    const filled   = dates.filter(d => getMemory(d)).length;
    const perFrame = filled > 0 ? (selectedDuration / filled).toFixed(1) : 0;
    el.textContent = filled > 0
      ? `${filled} memories · ${selectedDuration}s total · ~${perFrame}s per frame`
      : 'No memories in this range';
    el.classList.toggle('has-images', filled > 0);
  }

  $('generator-start').addEventListener('click', () => {
    const start     = $('gen-start').value;
    const end       = $('gen-end').value;
    const showEmpty = $('opt-placeholders').checked;
    const loop      = $('opt-loop').checked;
    const kenBurns  = $('opt-kenburns').checked;

    if (!start || !end || start > end) { toast('Select a valid date range'); return; }

    const dates  = dateRangeArray(start, end);
    const frames = [];
    dates.forEach(ds => {
      const mem = getMemory(ds);
      if (mem) {
        frames.push({ date: ds, image: mem.image, placeholder: false });
      } else if (showEmpty) {
        frames.push({ date: ds, image: null, placeholder: true });
      }
    });

    if (frames.length === 0) { toast('No memories found in this range'); return; }

    closeGeneratorModal();
    startPlayer(frames, selectedDuration, loop, kenBurns);
  });

  // ── VIDEO PLAYER ───────────────────────────────────────────
  function startPlayer(frames, totalSec, loop, kenBurns) {
    const p   = state.player;
    p.frames   = frames;
    p.index    = 0;
    p.duration = Math.max(1, totalSec / frames.length);
    p.loop     = loop;
    p.kenBurns = kenBurns;
    p.playing  = true;
    if (p.timer) clearTimeout(p.timer);

    $('video-player').classList.remove('hidden');
    renderFrame(0);
    scheduleNext();
  }

  function renderFrame(idx) {
    const p   = state.player;
    const frm = p.frames[idx];
    if (!frm) return;

    const img      = $('player-img');
    const dateLbl  = $('player-date-label');
    const counter  = $('player-counter');
    const fill     = $('player-progress-fill');
    const info     = $('ctrl-info');

    img.style.opacity = '0';
    img.classList.remove('kb-active');

    setTimeout(() => {
      if (frm.placeholder) {
        img.src = '';
        img.style.background = '#111';
      } else {
        img.src = frm.image;
        img.style.background = 'transparent';
      }
      img.style.opacity = '1';
      if (p.kenBurns && !frm.placeholder) {
        void img.offsetWidth;
        img.classList.add('kb-active');
      }
    }, 80);

    dateLbl.textContent = formatDateLabel(frm.date);
    counter.textContent = `${idx + 1} / ${p.frames.length}`;
    fill.style.width    = `${((idx + 1) / p.frames.length) * 100}%`;
    info.textContent    = `${Math.round(p.duration)}s/frame`;
  }

  function scheduleNext() {
    const p = state.player;
    if (p.timer) clearTimeout(p.timer);
    if (!p.playing) return;

    p.timer = setTimeout(() => {
      const next = p.index + 1;
      if (next >= p.frames.length) {
        if (p.loop) {
          p.index = 0;
          renderFrame(0);
          scheduleNext();
        } else {
          p.playing = false;
          $('ctrl-play').textContent = '▶';
        }
        return;
      }
      p.index = next;
      renderFrame(next);
      scheduleNext();
    }, p.duration * 1000);
  }

  $('ctrl-play').addEventListener('click', () => {
    const p   = state.player;
    const btn = $('ctrl-play');
    p.playing = !p.playing;
    btn.textContent = p.playing ? '⏸' : '▶';
    if (p.playing) scheduleNext();
    else if (p.timer) clearTimeout(p.timer);
  });

  $('ctrl-prev').addEventListener('click', () => {
    const p = state.player;
    if (p.timer) clearTimeout(p.timer);
    p.index = Math.max(0, p.index - 1);
    renderFrame(p.index);
    if (p.playing) scheduleNext();
  });

  $('ctrl-next').addEventListener('click', () => {
    const p = state.player;
    if (p.timer) clearTimeout(p.timer);
    p.index = Math.min(p.frames.length - 1, p.index + 1);
    renderFrame(p.index);
    if (p.playing) scheduleNext();
  });

  $('ctrl-close').addEventListener('click', stopPlayer);

  function stopPlayer() {
    const p = state.player;
    p.playing = false;
    if (p.timer) clearTimeout(p.timer);
    $('video-player').classList.add('hidden');
    $('player-img').src = '';
    $('ctrl-play').textContent = '⏸';
  }

  // ── KEYBOARD SUPPORT ───────────────────────────────────────
  // Use a named handler so it can be removed if the section is
  // ever torn down (avoids duplicate listeners on re-init).
  function onKeyDown(e) {
    const playerOpen = !$('video-player').classList.contains('hidden');
    if (playerOpen) {
      if (e.key === 'Escape')     { stopPlayer(); return; }
      if (e.key === ' ')          { e.preventDefault(); $('ctrl-play').click(); return; }
      if (e.key === 'ArrowRight') { $('ctrl-next').click(); return; }
      if (e.key === 'ArrowLeft')  { $('ctrl-prev').click(); return; }
    }
    if (e.key === 'Escape') {
      closePreviewModal();
      closeGeneratorModal();
    }
  }
  document.addEventListener('keydown', onKeyDown);

  // ── CLEAR RANGE MODAL ──────────────────────────────────────
  function openClearModal() {
    const year  = state.viewYear;
    const month = state.viewMonth;
    $('clear-start').value = toDateStr(year, month, 1);
    $('clear-end').value   = toDateStr(year, month, daysInMonth(year, month));
    $('modal-clear').classList.remove('hidden');
  }

  function closeClearModal() {
    $('modal-clear').classList.add('hidden');
  }

  $('btn-clear-range').addEventListener('click', openClearModal);
  $('clear-close').addEventListener('click', closeClearModal);
  $('clear-backdrop').addEventListener('click', closeClearModal);
  $('clear-cancel').addEventListener('click', closeClearModal);

  $('clear-confirm').addEventListener('click', () => {
    const start = $('clear-start').value;
    const end   = $('clear-end').value;
    if (!start || !end || start > end) { toast('Select a valid range'); return; }
    const dates = dateRangeArray(start, end);
    let count = 0;
    dates.forEach(d => { if (getMemory(d)) { deleteMemory(d); count++; } });
    closeClearModal();
    refresh();
    toast(`Cleared ${count} memories`);
  });

  // ── TOAST ──────────────────────────────────────────────────
  let toastTimer = null;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 2400);
  }

  // ── GLOBAL REFRESH ─────────────────────────────────────────
  function refresh() {
    renderMonthLabel();
    renderCalendar();
    renderHeatmap();
  }

  // ── INIT ───────────────────────────────────────────────────
  loadMemories();
  const now = new Date();
  state.viewYear  = now.getFullYear();
  state.viewMonth = now.getMonth();
  refresh();

} // end initMemoryMap


// ── BOOT ───────────────────────────────────────────────────
// Works whether the script loads before or after the DOM.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMemoryMap);
} else {
  // DOM already parsed (script is deferred or at bottom of body)
  initMemoryMap();
}