/* =========================================================
   回声日记 v0.1 · app logic (vanilla, no dependencies)
   Flow: 写 → 存 → 聊 → 回看
   ========================================================= */
(function () {
  "use strict";

  const M = window.EchoMock;
  const API = window.EchoAPI;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const TODAY_KEY = M.TODAY_KEY;
  const ECHO_AVATAR = '<span class="avatar"><svg class="icon"><use href="#i-echo"/></svg></span>';

  /* ---------------- 插画 / 动图素材（内联 SVG，全部本地） ---------------- */
  const ART_LIBRARY = {
    sunset: {
      label: "江边日落",
      svg:
        '<svg viewBox="0 0 240 150" class="media-art-svg" aria-hidden="true">' +
          '<circle cx="120" cy="76" r="23" fill="#F3D8B4"/>' +
          '<path d="M20 96h200" opacity=".22"/>' +
          '<path d="M12 110c22-8 40 8 62 0s40-8 62 0 40 8 62 0"/>' +
          '<path d="M12 128c20-6 36 6 56 0s36-6 56 0 36 6 56 0" opacity=".5"/>' +
          '<path d="M48 50c10-6 20-6 30 0M166 42c12-8 24-8 36 0" opacity=".5"/>' +
          '<path d="M72 62c5-3 10-3 15 0M94 70c5-3 10-3 15 0" opacity=".65"/>' +
        "</svg>"
    },
    "river-wind": {
      label: "河边的风",
      svg:
        '<svg viewBox="0 0 240 150" class="media-art-svg" aria-hidden="true">' +
          '<circle cx="198" cy="34" r="9" fill="#F3E3C4"/>' +
          '<path d="M26 40c16-10 28-10 44 0M70 28c10-6 18-6 28 0" opacity=".6"/>' +
          '<path d="M56 96V64M184 96V64M46 64h148"/>' +
          '<path d="M70 74c16 10 84 10 100 0" opacity=".45"/>' +
          '<path d="M12 112c22-8 40 8 62 0s40-8 62 0 40 8 62 0"/>' +
          '<path d="M12 130c20-6 36 6 56 0s36-6 56 0 36 6 56 0" opacity=".5"/>' +
          '<path d="M180 104c8-6 16-6 24 0" opacity=".4"/>' +
        "</svg>"
    },
    "window-green": {
      label: "窗边的绿萝",
      svg:
        '<svg viewBox="0 0 240 150" class="media-art-svg" aria-hidden="true">' +
          '<rect x="28" y="18" width="84" height="76" rx="4"/>' +
          '<path d="M70 18v76M28 56h84" opacity=".55"/>' +
          '<circle cx="104" cy="34" r="8" fill="#F3E3C4"/>' +
          '<path d="M152 124h44l-6 18h-32Z" fill="#E7F4F3"/>' +
          '<path d="M174 124c0-28-12-46-26-58M174 124c4-24 18-38 30-46M174 124c-2-18 2-34 10-48"/>' +
          '<path d="M148 66c-11-6-17 2-12 11 8 2 13-3 12-11ZM203 78c11-4 14 5 7 12-7 1-10-5-7-12ZM184 80c-11-4-16 4-10 12 7 0 11-5 10-12Z" fill="#CFE8E4"/>' +
        "</svg>"
    }
  };

  const GIF_LIBRARY = {
    ripple: {
      label: "水面的涟漪",
      svg:
        '<svg viewBox="0 0 240 150" class="media-art-svg gif-ripple" aria-hidden="true">' +
          '<path d="M12 118c22-8 40 8 62 0s40-8 62 0 40 8 62 0" opacity=".45"/>' +
          '<ellipse class="ripple-ring r1" cx="120" cy="84" rx="36" ry="12"/>' +
          '<ellipse class="ripple-ring r2" cx="120" cy="84" rx="36" ry="12"/>' +
          '<ellipse class="ripple-ring r3" cx="120" cy="84" rx="36" ry="12"/>' +
          '<path d="M70 44c8-6 16-6 24 0" opacity=".4"/>' +
        "</svg>"
    },
    steam: {
      label: "热汤的白气",
      svg:
        '<svg viewBox="0 0 240 150" class="media-art-svg gif-steam" aria-hidden="true">' +
          '<path d="M82 104h76l-9 32H91Z" fill="#F6F0E4"/>' +
          '<path d="M82 104h76" opacity=".6"/>' +
          '<path class="steam-line s1" d="M106 92c-9-10 9-16 0-26"/>' +
          '<path class="steam-line s2" d="M122 92c-9-10 9-16 0-26"/>' +
          '<path class="steam-line s3" d="M138 92c-9-10 9-16 0-26"/>' +
          '<path d="M62 142h116" opacity=".2" stroke-dasharray="2 6"/>' +
        "</svg>"
    },
    lights: {
      label: "对面楼的灯",
      svg:
        '<svg viewBox="0 0 240 150" class="media-art-svg gif-lights" aria-hidden="true">' +
          '<rect x="44" y="26" width="152" height="98" rx="4"/>' +
          '<path d="M44 56h152M44 86h152M82 26v98M122 26v98M162 26v98" opacity=".4"/>' +
          '<rect class="lit l1" x="54" y="34" width="12" height="14" fill="#F3E3C4" stroke="none"/>' +
          '<rect class="lit l2" x="94" y="64" width="12" height="14" fill="#F3E3C4" stroke="none"/>' +
          '<rect class="lit l3" x="134" y="34" width="12" height="14" fill="#F3E3C4" stroke="none"/>' +
          '<rect class="lit l4" x="174" y="94" width="12" height="14" fill="#F3E3C4" stroke="none"/>' +
          '<rect class="lit l5" x="54" y="94" width="12" height="14" fill="#F3E3C4" stroke="none"/>' +
        "</svg>"
    }
  };

  const state = {
    entries: M.deepClone(M.ENTRIES),
    selectedDate: TODAY_KEY,
    viewYear: 2026,
    viewMonth: 9,
    pickerYear: 2026,
    currentEntryId: null,
    chatEntryId: null,
    detailEntryId: null,
    editingId: null,
    draftMedia: [],
    sheetMode: null,
    screen: "home",
    flowStep: 1,
    draft: { date: TODAY_KEY, time: "21:48" },
    chat: {
      origin: "home",
      turn: 0,
      busy: false,
      ctaShown: false,
      messages: []
    }
  };

  let toastTimer = null;

  /* ---------------- date helpers ---------------- */
  function dateFromKey(key) {
    const parts = key.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  function weekdayLong(key) { return M.WEEKDAYS[dateFromKey(key).getDay()]; }
  function weekdayShort(key) { return "周" + "日一二三四五六".charAt(dateFromKey(key).getDay()); }
  function monthDay(key) {
    const d = dateFromKey(key);
    return (d.getMonth() + 1) + "月" + d.getDate() + "日";
  }
  function fullDate(key) {
    const d = dateFromKey(key);
    return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
  }
  function seasonOf(month) {
    if (month >= 3 && month <= 5) return "春";
    if (month >= 6 && month <= 8) return "夏";
    if (month >= 9 && month <= 11) return "秋";
    return "冬";
  }
  function isFuture(key) { return dateFromKey(key) > dateFromKey(TODAY_KEY); }
  function isToday(key) { return key === TODAY_KEY; }
  function getEntry(id) { return state.entries.find((entry) => entry.id === id) || null; }
  function getEntryByDate(key) { return state.entries.find((entry) => entry.date === key) || null; }
  function sortedEntries() {
    return state.entries.slice().sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.time < b.time ? 1 : -1;
    });
  }
  function latestEntry() {
    const list = sortedEntries();
    return list.length ? list[0] : null;
  }
  function snippet(text, max) {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    const limit = max || 46;
    return clean.length > limit ? clean.slice(0, limit) + "…" : clean;
  }
  function escapeHTML(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ---------------- media helpers ---------------- */
  function mediaDef(item) {
    if (!item) return null;
    if (item.type === "art") return ART_LIBRARY[item.key] || ART_LIBRARY.sunset;
    if (item.type === "gif") return GIF_LIBRARY[item.key] || GIF_LIBRARY.ripple;
    return null;
  }
  function mediaTypeLabel(item) {
    if (item.type === "art") return "插画";
    if (item.type === "gif") return "动图";
    return "视频链接";
  }
  function mediaTitle(item) {
    if (item.type === "video") return item.title || hostOf(item.url);
    const def = mediaDef(item);
    return (def && def.label) || item.title || mediaTypeLabel(item);
  }
  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch (err) { return "视频链接"; }
  }
  function mediaCardHTML(item, opts) {
    const compact = Boolean(opts && opts.compact);
    const cls = "media-card is-" + item.type + (compact ? " is-compact" : "");
    if (item.type === "video") {
      return (
        '<div class="' + cls + '">' +
          '<span class="media-card-icon"><svg class="icon"><use href="#i-play"/></svg></span>' +
          '<span class="media-card-body">' +
            '<span class="media-card-kicker">视频链接</span>' +
            '<span class="media-card-title">' + escapeHTML(mediaTitle(item)) + "</span>" +
            '<span class="media-card-url">' + escapeHTML(hostOf(item.url)) + "</span>" +
          "</span>" +
          (compact ? "" : '<span class="media-card-tip">静态原型仅展示链接</span>') +
        "</div>"
      );
    }
    const def = mediaDef(item);
    return (
      '<figure class="' + cls + '">' +
        '<div class="media-card-art">' + (def ? def.svg : "") + "</div>" +
        '<figcaption><span class="media-card-kicker">' + mediaTypeLabel(item) + "</span>" +
        '<span class="media-card-title">' + escapeHTML(mediaTitle(item)) + "</span></figcaption>" +
      "</figure>"
    );
  }

  function renderMediaPreview() {
    const box = $("#mediaPreview");
    if (!box) return;
    const media = state.draftMedia || [];
    box.classList.toggle("has-items", media.length > 0);
    box.innerHTML = media.map((item, index) => {
      const def = item.type === "video" ? null : mediaDef(item);
      const thumb = def
        ? '<span class="media-thumb">' + def.svg + "</span>"
        : '<span class="media-thumb is-video"><svg class="icon"><use href="#i-play"/></svg></span>';
      return (
        '<div class="media-item" data-media-index="' + index + '">' +
          thumb +
          '<span class="media-info">' +
            '<span class="media-item-kicker">' + mediaTypeLabel(item) + "</span>" +
            '<span class="media-item-title">' + escapeHTML(mediaTitle(item)) + "</span>" +
          "</span>" +
          '<button class="media-remove" type="button" data-remove-media="' + index +
            '" aria-label="移除' + mediaTypeLabel(item) + '">' +
            '<svg class="icon"><use href="#i-x"/></svg>' +
          "</button>" +
        "</div>"
      );
    }).join("");
  }

  function addMedia(item) {
    state.draftMedia.push(item);
    renderMediaPreview();
    closeMediaSheet();
    toast("已添加" + mediaTypeLabel(item) + "「" + mediaTitle(item) + "」");
  }

  function openMediaSheet(mode) {
    const layer = $("#mediaSheet");
    const title = $("#sheetTitle");
    const body = $("#sheetBody");
    if (!layer || !title || !body) return;
    state.sheetMode = mode;

    if (mode === "art" || mode === "gif") {
      const lib = mode === "art" ? ART_LIBRARY : GIF_LIBRARY;
      title.textContent = mode === "art" ? "选一张插画" : "选一个动图";
      body.innerHTML =
        '<p class="sheet-desc">' +
          (mode === "art" ? "插画会跟着这一篇日记一起保存。" : "动图用本地循环动画演示，不依赖外部 GIF 文件。") +
        "</p>" +
        '<div class="sheet-grid">' +
          Object.keys(lib).map((key) => (
            '<button type="button" class="sheet-card" data-pick-' + mode + '="' + key + '">' +
              '<span class="sheet-card-art">' + lib[key].svg + "</span>" +
              '<span class="sheet-card-label">' + lib[key].label + "</span>" +
            "</button>"
          )).join("") +
        "</div>";
    } else {
      title.textContent = "添加视频链接";
      body.innerHTML =
        '<p class="sheet-desc">粘贴一条视频链接，回看时能看到它。静态原型不会真正播放视频。</p>' +
        '<input id="videoUrl" class="sheet-input" type="url" inputmode="url" autocomplete="off"' +
          ' placeholder="https://..." aria-label="视频链接">' +
        '<p class="sheet-error" id="videoError" role="alert"></p>' +
        '<div class="sheet-examples"><span>试试示例</span>' +
          '<button type="button" class="example-chip" data-example-video="https://www.bilibili.com/video/BV1GJ411x7h7">B 站 · 江边日落</button>' +
        "</div>" +
        '<div class="sheet-actions"><button class="btn-primary" type="button" id="videoConfirm">添加链接</button></div>';
    }

    layer.hidden = false;
    void layer.offsetWidth;
    layer.classList.add("is-open");
  }

  function closeMediaSheet() {
    const layer = $("#mediaSheet");
    if (!layer || layer.hidden) return;
    layer.classList.remove("is-open");
    state.sheetMode = null;
    setTimeout(() => {
      if (!layer.classList.contains("is-open")) layer.hidden = true;
    }, 220);
  }

  function confirmVideo() {
    const input = $("#videoUrl");
    const error = $("#videoError");
    if (!input) return;
    const url = input.value.trim();
    if (!/^https?:\/\/[^\s]+$/i.test(url)) {
      input.classList.add("is-invalid");
      if (error) error.textContent = "请填写以 http:// 或 https:// 开头的视频链接";
      input.focus();
      return;
    }
    input.classList.remove("is-invalid");
    if (error) error.textContent = "";
    addMedia({ type: "video", url: url, title: hostOf(url) });
  }

  /* ---------------- shared UI ---------------- */
  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 2200);
  }

  function setFlow(step) {
    state.flowStep = step;
    $$("#railSteps li").forEach((li) => {
      li.classList.toggle("is-active", Number(li.dataset.step) === step);
    });
  }

  function updateRailCurrent() {
    $$("#railScreens button").forEach((btn) => {
      btn.classList.toggle("is-current", btn.dataset.go === state.screen);
    });
  }

  function navigate(name, options) {
    const opts = options || {};
    state.screen = name;
    $$(".screen").forEach((section) => {
      section.classList.toggle("is-active", section.dataset.screen === name);
    });
    const screen = $('.screen[data-screen="' + name + '"]');
    if (screen) {
      const body = $(".screen-body", screen);
      if (body && opts.keepScroll !== true) body.scrollTop = 0;
      if (name === "chat") {
        const scroller = $("#chatScroll");
        if (scroller) scroller.scrollTop = 0;
      }
    }
    if (opts.step) setFlow(opts.step);
    updateRailCurrent();
  }

  /* ---------------- home ---------------- */
  function pad2(value) { return String(value).padStart(2, "0"); }
  function monthKey(year, monthIndex) { return year + "-" + pad2(monthIndex + 1); }

  function renderCalendar() {
    const grid = $("#calendarGrid");
    if (!grid) return;
    const year = state.viewYear;
    const monthIndex = state.viewMonth;
    const isDemoMonth = year === 2026 && monthIndex === 9;
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const prefix = monthKey(year, monthIndex) + "-";
    const parts = [];
    let i = 0;
    for (let blank = 0; blank < firstWeekday; blank += 1) {
      parts.push('<span class="cal-blank" aria-hidden="true"></span>');
      i += 1;
    }
    for (let day = 1; day <= totalDays; day += 1) {
      const key = prefix + pad2(day);
      const lunar = isDemoMonth ? (M.OCT_LUNAR[day] || "") : "";
      const entry = getEntryByDate(key);
      const classes = ["cal-day"];
      if (entry) classes.push("has-entry");
      if (isToday(key)) classes.push("is-today");
      if (state.selectedDate === key) classes.push("is-selected");
      if (isFuture(key)) classes.push("is-future");
      if (isDemoMonth && M.HOLIDAYS.indexOf(day) !== -1) classes.push("is-holiday");
      const label = fullDate(key) + " " + weekdayLong(key) + (lunar ? " " + lunar : "");
      const current = isToday(key) ? ' aria-current="date"' : "";
      parts.push(
        '<button type="button" class="' + classes.join(" ") + '"' +
        ' data-date="' + key + '" style="--i:' + i + '"' +
        ' aria-label="' + label + '" aria-pressed="' + (state.selectedDate === key) + '"' +
        current + ">" +
        '<span class="num">' + day + "</span>" +
        '<span class="lunar">' + lunar + "</span>" +
        "</button>"
      );
      i += 1;
    }
    grid.innerHTML = parts.join("");
    grid.setAttribute("aria-label", year + "年" + (monthIndex + 1) + "月日历");
    const label = $("#monthLabel");
    if (label) label.textContent = year + "年" + (monthIndex + 1) + "月";
  }

  function setCalendarMonth(year, monthIndex) {
    state.viewYear = year;
    state.viewMonth = monthIndex;
    if (year === 2026 && monthIndex === 9) {
      state.selectedDate = TODAY_KEY;
    } else {
      state.selectedDate = monthKey(year, monthIndex) + "-01";
    }
    renderHome();
  }

  /* ---------------- month picker ---------------- */
  function renderMonthPicker() {
    const body = $("#monthSheetBody");
    if (!body) return;
    const year = state.pickerYear;
    const minYear = 2020;
    const maxYear = 2026;
    body.innerHTML =
      '<div class="year-nav">' +
        '<button class="year-arrow" type="button" data-year-step="-1" aria-label="上一年"' +
          (year <= minYear ? " disabled" : "") + ">‹</button>" +
        '<span class="year-label">' + year + "年</span>" +
        '<button class="year-arrow" type="button" data-year-step="1" aria-label="下一年"' +
          (year >= maxYear ? " disabled" : "") + ">›</button>" +
      "</div>" +
      '<div class="month-grid">' +
        Array.from({ length: 12 }, (_, index) => {
          const future = year > 2026 || (year === 2026 && index > 9);
          const selected = year === state.viewYear && index === state.viewMonth;
          return (
            '<button class="month-cell' + (selected ? " is-current" : "") + '"' +
              ' type="button" data-pick-month="' + index + '"' +
              (future ? " disabled" : "") + ">" + (index + 1) + "月</button>"
          );
        }).join("") +
      "</div>" +
      '<div class="month-today-wrap"><button class="text-link" type="button" id="pickerToday">回到今天 · 10月27日</button></div>';
  }

  function openMonthPicker() {
    const layer = $("#monthSheet");
    if (!layer) return;
    state.pickerYear = state.viewYear;
    renderMonthPicker();
    layer.hidden = false;
    void layer.offsetWidth;
    layer.classList.add("is-open");
  }

  function closeMonthPicker() {
    const layer = $("#monthSheet");
    if (!layer || layer.hidden) return;
    layer.classList.remove("is-open");
    setTimeout(() => {
      if (!layer.classList.contains("is-open")) layer.hidden = true;
    }, 220);
  }

  function renderDayPanel() {
    const panel = $("#dayPanel");
    if (!panel) return;
    const key = state.selectedDate;
    const entry = getEntryByDate(key);
    const html = [];

    html.push(
      '<div class="day-topline">' +
        '<span class="day-label">' + monthDay(key) + "<em>" + weekdayLong(key) + "</em></span>" +
        '<span class="day-state">' + (entry ? "已记录" : (isFuture(key) ? "未到来" : "待记录")) + "</span>" +
      "</div>"
    );

    if (entry) {
      const mediaCount = (entry.media || []).length;
      html.push(
        '<button type="button" class="day-card" data-entry-id="' + entry.id + '">' +
          '<span class="entry-time"><span>' + entry.time + "</span><i></i><span>已归档</span></span>" +
          '<span class="entry-excerpt">' + escapeHTML(snippet(entry.text, 96)) + "</span>" +
          '<span class="entry-foot">' +
            '<span class="ai-hint"><svg class="icon"><use href="#i-echo"/></svg>' +
              (entry.echoNote ? "回声已读过这一篇" : "回声在等你来聊") + "</span>" +
            (mediaCount
              ? '<span class="entry-attach"><svg class="icon"><use href="#i-image"/></svg>' + mediaCount + "</span>"
              : "") +
            '<span class="entry-arrow"><svg class="icon"><use href="#i-arrow-right"/></svg></span>' +
          "</span>" +
        "</button>"
      );
    } else if (isFuture(key)) {
      html.push(
        '<div class="empty-day is-future-day">' +
          '<p class="empty-title">这一天，还没到</p>' +
          '<p class="empty-sub">未来还没发生，先写今天吧。</p>' +
          '<button type="button" class="btn-soft" data-action="today">回到今天</button>' +
        "</div>"
      );
    } else {
      const isTodaySel = isToday(key);
      html.push(
        '<div class="empty-day">' +
          '<p class="empty-title">' + (isTodaySel ? "今天，还空着" : "这一天，还空着") + "</p>" +
          '<p class="empty-sub">写下一句话，留给以后的自己。</p>' +
          '<button type="button" class="btn-soft" data-action="write">' +
            '<svg class="icon icon-sm"><use href="#i-pen"/></svg>' +
            (isTodaySel ? "写下今天" : "写下这一天") +
          "</button>" +
        "</div>"
      );
    }
    panel.innerHTML = html.join("");
  }

  function renderTimeline() {
    const list = $("#timelineList");
    if (!list) return;
    const entries = sortedEntries();
    if (!entries.length) {
      list.innerHTML = '<p class="empty-sub" style="padding:16px 2px;">还没有日记。写下第一篇，时间线就会从这里开始。</p>';
      return;
    }
    list.innerHTML = entries.map((entry) => {
      const selected = entry.date === state.selectedDate ? " is-selected-day" : "";
      return (
        '<button type="button" class="timeline-item' + selected + '" data-entry-id="' + entry.id + '">' +
          '<span class="t-date">' + monthDay(entry.date).replace("月", "/").replace("日", "") + "</span>" +
          '<span class="t-body"><span class="t-week">' + weekdayShort(entry.date) + "</span>" +
            '<span class="t-text">' + escapeHTML(snippet(entry.text, 64)) + "</span></span>" +
          '<span class="t-arrow"><svg class="icon"><use href="#i-arrow-right"/></svg></span>' +
        "</button>"
      );
    }).join("");
  }

  function renderHome() {
    const body = $("#homeBody");
    const top = body ? body.scrollTop : 0;
    renderCalendar();
    renderDayPanel();
    renderTimeline();
    if (body) body.scrollTop = top;
  }

  function goHome(step) {
    if (state.selectedDate) {
      const d = dateFromKey(state.selectedDate);
      state.viewYear = d.getFullYear();
      state.viewMonth = d.getMonth();
    }
    renderHome();
    navigate("home", { step: step || (state.currentEntryId ? 4 : 1) });
  }

  /* ---------------- rail ---------------- */
  function handleRailJump(target) {
    if (target === "home") {
      goHome();
      return;
    }
    if (target === "write") {
      openWrite(state.selectedDate);
      return;
    }
    if (target === "saved") {
      if (state.currentEntryId && getEntry(state.currentEntryId)) {
        renderSaved(getEntry(state.currentEntryId));
      } else {
        toast("先写一篇，保存后就会来到这里");
        openWrite(TODAY_KEY);
      }
      return;
    }
    if (target === "chat") {
      const entry = (state.currentEntryId && getEntry(state.currentEntryId)) ||
        getEntryByDate(TODAY_KEY) || latestEntry();
      if (entry) openChat(entry.id, "home");
      else openWrite(TODAY_KEY);
      return;
    }
    if (target === "detail") {
      const entry = (state.currentEntryId && getEntry(state.currentEntryId)) ||
        getEntryByDate(state.selectedDate) || latestEntry();
      if (entry) openDetail(entry.id);
    }
  }

  /* ---------------- write / save / saved ---------------- */
  function openWrite(dateKey) {
    const key = dateKey || state.selectedDate || TODAY_KEY;
    if (isFuture(key)) {
      toast("还没到这一天，先写今天吧");
      return;
    }
    const existing = getEntryByDate(key);
    state.editingId = existing ? existing.id : null;
    state.draft = { date: key, time: existing ? existing.time : "21:48" };
    state.draftMedia = existing && existing.media ? M.deepClone(existing.media) : [];

    const d = dateFromKey(key);
    $("#writeYear").textContent = d.getFullYear() + "年 · " + seasonOf(d.getMonth() + 1);
    $("#writeDate").textContent = (d.getMonth() + 1) + "月" + d.getDate() + "日";
    $("#writeWeek").textContent = weekdayLong(key);
    $("#writeTime").textContent = state.draft.time;
    const title = $("#writeTitle");
    if (title) title.textContent = existing ? "编辑日记" : "写日记";
    const input = $("#diaryInput");
    input.value = existing ? existing.text : "";
    updateCharCount();

    const saveBtn = $("#saveBtn");
    saveBtn.textContent = existing ? "保存修改" : "保存";
    saveBtn.classList.remove("is-saving");
    saveBtn.disabled = false;
    renderMediaPreview();
    navigate("write", { step: 1 });
    if (window.innerWidth > 700) {
      setTimeout(() => { try { input.focus(); } catch (err) {} }, 380);
    }
  }

  function updateCharCount() {
    const input = $("#diaryInput");
    const count = input.value.trim().length;
    $("#charCount").textContent = count + " 字";
    $("#saveBtn").classList.toggle("is-muted", count === 0);
  }

  async function saveDiary() {
    const input = $("#diaryInput");
    const text = input.value.trim();
    if (!text) {
      const body = $(".write-body");
      body.classList.remove("is-shaking");
      void body.offsetWidth;
      body.classList.add("is-shaking");
      toast("先写下一两句话，再保存吧");
      input.focus();
      return;
    }
    const btn = $("#saveBtn");
    if (btn.disabled) return;
    btn.disabled = true;
    btn.classList.add("is-saving");
    const isEdit = Boolean(state.editingId);
    btn.textContent = isEdit ? "更新中…" : "保存中…";

    const previous = isEdit ? getEntry(state.editingId) : null;
    const result = await API.saveDiary({
      id: state.editingId || "e-" + state.draft.date,
      date: state.draft.date,
      time: state.draft.time,
      text: text,
      media: state.draftMedia
    });
    const entry = result.entry;
    entry.echoNote = previous ? previous.echoNote : "";

    const index = state.entries.findIndex((item) => item.id === entry.id);
    if (index >= 0) state.entries[index] = entry;
    else state.entries.push(entry);
    // 同一天只保留一篇
    state.entries = state.entries.filter((item) => item.id === entry.id || item.date !== entry.date);

    state.editingId = null;
    state.currentEntryId = entry.id;
    state.selectedDate = entry.date;
    renderHome();
    renderSaved(entry, isEdit ? "update" : "create");

    btn.disabled = false;
    btn.classList.remove("is-saving");
    btn.textContent = "保存";
  }

  function renderSaved(entry, mode) {
    if (!entry) return;
    const updated = mode === "update";
    state.currentEntryId = entry.id;
    state.selectedDate = entry.date;
    const kicker = $("#successKicker");
    if (kicker) kicker.textContent = updated ? "DIARY UPDATED" : "AUTOMATICALLY ARCHIVED";
    const title = $("#successTitle");
    if (title) title.textContent = updated ? "日记已更新" : "日记已收好";
    $("#savedMeta").innerHTML =
      fullDate(entry.date) + " · " + weekdayLong(entry.date) + "<br>" +
      entry.time + (updated ? " 更新归档" : " 自动归档");
    $("#savedSnippet").innerHTML = "<p>" + escapeHTML(snippet(entry.text, 110)) + "</p>";
    const savedMedia = $("#savedMedia");
    if (savedMedia) {
      const media = entry.media || [];
      savedMedia.innerHTML = media.map((item) => mediaCardHTML(item, { compact: true })).join("");
      savedMedia.classList.toggle("has-items", media.length > 0);
    }
    const aiReady = $("#aiReadyText");
    if (aiReady) aiReady.textContent = updated ? "回声也读到了这次修改" : "回声已经读完了这一篇";
    navigate("saved", { step: 2 });
  }

  /* ---------------- detail ---------------- */
  function openDetail(entryId) {
    const entry = getEntry(entryId);
    if (!entry) {
      toast("先写一篇日记，再回来看看吧");
      return;
    }
    state.detailEntryId = entry.id;
    state.selectedDate = entry.date;
    renderHome();

    const d = dateFromKey(entry.date);
    $("#detailYear").textContent = d.getFullYear() + "年 · " + seasonOf(d.getMonth() + 1);
    $("#detailTime").textContent = entry.time + " 记录";
    $("#detailDate").textContent = (d.getMonth() + 1) + "月" + d.getDate() + "日";
    $("#detailWeek").textContent = weekdayLong(entry.date);
    $("#detailText").textContent = entry.text;
    const detailMedia = $("#detailMedia");
    if (detailMedia) {
      const media = entry.media || [];
      detailMedia.innerHTML = media.map((item) => mediaCardHTML(item, {})).join("");
      detailMedia.classList.toggle("has-items", media.length > 0);
    }

    const hasNote = Boolean(entry.echoNote);
    $("#echoNoteText").textContent = hasNote
      ? entry.echoNote
      : "回声还没留下回响。去聊两句，让它把这一篇读给你听。";
    $("#detailChatLink").innerHTML =
      (hasNote ? "和回声继续聊" : "和回声聊聊") +
      '<svg class="icon icon-sm"><use href="#i-arrow-right"/></svg>';

    navigate("detail", { step: 4 });
  }

  /* ---------------- chat ---------------- */
  function openChat(entryId, origin) {
    const entry = getEntry(entryId);
    if (!entry) {
      toast("先写一篇日记，再来和回声聊吧");
      return;
    }
    state.chatEntryId = entry.id;
    state.detailEntryId = entry.id;
    state.selectedDate = entry.date;
    state.chat = {
      origin: origin || "home",
      turn: 0,
      busy: false,
      ctaShown: false,
      firstUserText: ""
    };

    const today = isToday(entry.date);
    $("#chatStatus").textContent = today
      ? "已读完你今天的日记"
      : "已读完 " + monthDay(entry.date) + "的日记";
    $("#chatDay").textContent = today
      ? "今天 · " + monthDay(entry.date)
      : monthDay(entry.date) + " · " + weekdayLong(entry.date);
    $("#contextLabelText").textContent = today ? "你刚写的" : "你写的 · " + monthDay(entry.date);
    $("#contextText").textContent = snippet(entry.text, 88);
    $("#messages").innerHTML = "";
    $("#quickReplies").innerHTML = "";
    $("#chatInput").value = "";
    $("#chatInput").disabled = false;
    $("#sendBtn").disabled = false;

    navigate("chat", { step: 3 });

    if (today) {
      addMessage(
        "ai",
        "我读完了。" + fullDate(entry.date) + "，" + weekdayLong(entry.date) +
        "，你写下「<span class=\"quote\">" + escapeHTML(snippet(entry.text, 36)) +
        "</span>」——我在这句上停了一会儿。"
      );
      addMessage("ai", "谢谢你把它留在这里。今天这几个瞬间里，哪一个最让你放松？", 90);
      const windHint = /风|走|散步|路上/.test(entry.text);
      renderQuickReplies([
        { label: windHint ? "就是下班路上那阵风" : "写下来的时候，轻松了一点" },
        { label: "其实今天有点累" },
        { label: "你读到了什么？" }
      ]);
    } else {
      const relative = entry.date === "2026-10-26" ? "昨天" : monthDay(entry.date);
      const todayEntry = getEntryByDate(TODAY_KEY);
      if (todayEntry) {
        addMessage(
          "ai",
          "今天是 10月27日，你已经写下了今天这一篇。再看" + relative +
          "的这一篇「<span class=\"quote\">" + escapeHTML(snippet(entry.text, 32)) +
          "</span>」——我也还留着。"
        );
        addMessage("ai", "想接着那天聊，还是先看看今天写的那篇？", 90);
        renderQuickReplies([
          { label: "接着那天聊聊" },
          { label: "看看今天的日记", action: "todayDetail" }
        ]);
      } else {
        addMessage(
          "ai",
          "现在是 10月27日，星期二。今天还没有新的日记，不过" + relative +
          "你写过「<span class=\"quote\">" + escapeHTML(snippet(entry.text, 32)) +
          "</span>」。"
        );
        addMessage("ai", "想接着那天聊，还是先写几句今天？", 90);
        renderQuickReplies([
          { label: "接着那天聊聊" },
          { label: "去写今天的日记", action: "write" }
        ]);
      }
    }
    scrollChatBottom();
  }

  function addMessage(role, html, delay) {
    const box = $("#messages");
    if (!box) return null;
    const el = document.createElement("div");
    el.className = "msg " + role;
    if (role === "ai") {
      el.innerHTML = ECHO_AVATAR + '<div class="bubble">' + html + "</div>";
    } else {
      el.innerHTML = '<div class="bubble">' + html + "</div>";
    }
    if (typeof delay === "number") el.style.animationDelay = delay + "ms";
    box.appendChild(el);
    scrollChatBottom();
    return el;
  }

  function showTyping() {
    const box = $("#messages");
    if (!box) return null;
    const el = document.createElement("div");
    el.className = "msg ai";
    el.innerHTML = ECHO_AVATAR +
      '<div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div>';
    box.appendChild(el);
    scrollChatBottom();
    return el;
  }

  function scrollChatBottom() {
    const scroller = $("#chatScroll");
    if (!scroller) return;
    requestAnimationFrame(() => {
      scroller.scrollTop = scroller.scrollHeight;
    });
  }

  function renderQuickReplies(items) {
    const box = $("#quickReplies");
    if (!box) return;
    box.innerHTML = "";
    (items || []).forEach((item, index) => {
      const label = typeof item === "string" ? item : item.label;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quick-chip";
      btn.style.animationDelay = index * 45 + "ms";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        if (state.chat.busy) return;
        if (item.action === "write") {
          openWrite(TODAY_KEY);
          return;
        }
        if (item.action === "todayDetail") {
          const todayEntry = getEntryByDate(TODAY_KEY);
          if (todayEntry) openDetail(todayEntry.id);
          return;
        }
        sendChat(label);
      });
      box.appendChild(btn);
    });
  }

  function addChatCta(entry) {
    const label = isToday(entry.date) ? "回到时间线，看看今天这篇" : "回到时间线，看看这一天";
    addMessage(
      "ai",
      '<div class="cta-lead">现在，要不要回时间线，再看一眼这一篇？</div>' +
      '<button type="button" class="inline-cta" data-action="timeline">' +
        "<span>" + label + "</span>" +
        '<svg class="icon"><use href="#i-arrow-right"/></svg>' +
      "</button>"
    );
  }

  function buildEchoReply(entry, text, turn) {
    const today = isToday(entry.date);
    if (turn === 1) {
      let main;
      if (/风|走|散步|路上/.test(text)) {
        main = "那阵风听起来很轻。你没有急着回家，让风先陪你走了一段——这种不用很大的时刻，往往最管用。";
      } else if (/累|疲惫|加班|烦/.test(text)) {
        main = "嗯，累是真的。你还能在累的时候把这一天写下来，已经是在照顾自己了。今晚不用再勉强自己做什么。";
      } else if (/说说|读到|觉得|帮我/.test(text)) {
        main = "我读到的是「" + snippet(entry.text, 26) + "」。你把它写下来的时候，没有急着评价，只是让这一天有了一个落点。";
      } else if (/开心|不错|好/.test(text)) {
        main = "能听出一点轻快。" + (today ? "今天（27号）" : monthDay(entry.date)) + "的这些小事，值得被记住。";
      } else {
        main = "我听见了。你写下的「" + snippet(entry.text, 30) + "」，加上刚才这句，已经是很诚实的一天了。";
      }

      const previous = sortedEntries().find((item) => item.date < entry.date);
      let follow = "";
      if (previous) {
        const lead = today ? "对了，昨天（" : "再往前（";
        follow = lead + monthDay(previous.date) + "）你写到「" + snippet(previous.text, 24) + "」。" +
          (today ? "今天和昨天连起来看，像是在一点点把自己接住。" : "把这些日子连起来看，你一直在认真过生活。");
      }
      return {
        main: main,
        follow: follow,
        quick: ["嗯，说出来好多了", "明天想早点回家", "帮我把今天收个尾"]
      };
    }
    if (turn === 2) {
      return {
        main: "嗯，我记下了。这些不用急着得出结论，能说出来就已经很好。",
        follow: "",
        quick: []
      };
    }
    return {
      main: "我在。今天（10月27日）的话，慢慢说就好。你写的这些，我都会好好收着。",
      follow: "",
      quick: []
    };
  }

  async function sendChat(rawText) {
    const text = String(rawText || "").trim();
    if (!text || state.chat.busy) return;
    const entry = getEntry(state.chatEntryId);
    if (!entry) return;

    const chatToken = state.chat;
    state.chat.busy = true;
    state.chat.turn += 1;
    if (state.chat.turn === 1) state.chat.firstUserText = text;

    $("#sendBtn").disabled = true;
    $("#quickReplies").innerHTML = "";
    addMessage("user", escapeHTML(text));
    $("#chatInput").value = "";

    const typing = showTyping();
    const reply = buildEchoReply(entry, text, state.chat.turn);
    const apiResult = await API.askEcho({ fallback: reply.main });
    if (state.chat !== chatToken) return; // 演示被重置 / 对话被切换
    if (typing) typing.remove();

    addMessage("ai", escapeHTML((apiResult && apiResult.reply) || reply.main));
    if (reply.follow) {
      await M.wait(260);
      if (state.chat !== chatToken) return;
      addMessage("ai", escapeHTML(reply.follow));
    }
    if (state.chat.turn >= 2 && !state.chat.ctaShown) {
      await M.wait(260);
      if (state.chat !== chatToken) return;
      addChatCta(entry);
      state.chat.ctaShown = true;
    }

    if (entry.date === TODAY_KEY && state.currentEntryId === entry.id) {
      const first = state.chat.firstUserText || text;
      entry.echoNote = "你说「" + snippet(first, 30) + "」。今天这些小事，我都替你记着。";
    }

    if (state.chat.turn >= 2) {
      renderQuickReplies([]);
    } else {
      renderQuickReplies(reply.quick || []);
    }
    state.chat.busy = false;
    $("#sendBtn").disabled = false;
    scrollChatBottom();
  }

  function closeChat() {
    if (state.chat.origin === "saved" && getEntry(state.currentEntryId)) {
      renderSaved(getEntry(state.currentEntryId));
      return;
    }
    if (state.chat.origin === "detail" && getEntry(state.chatEntryId)) {
      openDetail(state.chatEntryId);
      return;
    }
    goHome();
  }

  function resetDemo() {
    state.entries = M.deepClone(M.ENTRIES);
    state.currentEntryId = null;
    state.chatEntryId = null;
    state.detailEntryId = null;
    state.editingId = null;
    state.draftMedia = [];
    state.selectedDate = TODAY_KEY;
    state.viewYear = 2026;
    state.viewMonth = 9;
    state.pickerYear = 2026;
    closeMediaSheet();
    closeMonthPicker();
    state.chat = {
      origin: "home",
      turn: 0,
      busy: false,
      ctaShown: false,
      firstUserText: ""
    };
    const input = $("#diaryInput");
    if (input) input.value = "";
    renderHome();
    goHome(1);
    toast("演示已重置，可以重新走一遍 4 步");
  }

  /* ---------------- events ---------------- */
  function bindEvents() {
    $("#homeAdd").addEventListener("click", () => openWrite(state.selectedDate));

    $("#monthReset").addEventListener("click", openMonthPicker);

    $("#monthSheet").addEventListener("click", (event) => {
      if (event.target.closest("[data-close-month]")) {
        closeMonthPicker();
        return;
      }
      const stepBtn = event.target.closest("[data-year-step]");
      if (stepBtn) {
        const next = state.pickerYear + Number(stepBtn.dataset.yearStep);
        if (next >= 2020 && next <= 2026) {
          state.pickerYear = next;
          renderMonthPicker();
        }
        return;
      }
      const monthBtn = event.target.closest("[data-pick-month]");
      if (monthBtn) {
        const monthIndex = Number(monthBtn.dataset.pickMonth);
        setCalendarMonth(state.pickerYear, monthIndex);
        closeMonthPicker();
        const body = $("#homeBody");
        if (body) body.scrollTop = 0;
        toast("已切换到 " + state.pickerYear + "年" + (monthIndex + 1) + "月");
        return;
      }
      if (event.target.closest("#pickerToday")) {
        setCalendarMonth(2026, 9);
        closeMonthPicker();
        const body = $("#homeBody");
        if (body) body.scrollTop = 0;
        toast("已回到今天 · 10月27日");
      }
    });

    $("#calendarGrid").addEventListener("click", (event) => {
      const cell = event.target.closest(".cal-day");
      if (!cell) return;
      const key = cell.dataset.date;
      if (isFuture(key)) {
        toast("还没到这一天，先写今天吧");
        return;
      }
      state.selectedDate = key;
      $$(".cal-day", $("#calendarGrid")).forEach((item) => {
        const on = item.dataset.date === key;
        item.classList.toggle("is-selected", on);
        item.setAttribute("aria-pressed", on ? "true" : "false");
      });
      renderDayPanel();
      renderTimeline();
    });

    $("#dayPanel").addEventListener("click", (event) => {
      const card = event.target.closest("[data-entry-id]");
      if (card) {
        openDetail(card.dataset.entryId);
        return;
      }
      const writeBtn = event.target.closest('[data-action="write"]');
      if (writeBtn) {
        openWrite(state.selectedDate);
        return;
      }
      if (event.target.closest('[data-action="today"]')) setCalendarMonth(2026, 9);
    });

    $("#timelineList").addEventListener("click", (event) => {
      const item = event.target.closest("[data-entry-id]");
      if (item) openDetail(item.dataset.entryId);
    });

    $("#writeClose").addEventListener("click", () => goHome(state.currentEntryId ? 4 : 1));
    $("#diaryInput").addEventListener("input", updateCharCount);
    $("#saveBtn").addEventListener("click", saveDiary);

    $$("[data-open-media]").forEach((btn) => {
      btn.addEventListener("click", () => openMediaSheet(btn.dataset.openMedia));
    });
    $("#mediaPreview").addEventListener("click", (event) => {
      const removeBtn = event.target.closest("[data-remove-media]");
      if (!removeBtn) return;
      const index = Number(removeBtn.dataset.removeMedia);
      const removed = state.draftMedia[index];
      state.draftMedia.splice(index, 1);
      renderMediaPreview();
      if (removed) toast("已移除" + mediaTypeLabel(removed));
    });
    $("#mediaSheet").addEventListener("click", (event) => {
      if (event.target.closest("[data-close-sheet]")) {
        closeMediaSheet();
        return;
      }
      const artBtn = event.target.closest("[data-pick-art]");
      if (artBtn) {
        const key = artBtn.dataset.pickArt;
        const def = ART_LIBRARY[key];
        if (def) addMedia({ type: "art", key: key, title: def.label });
        return;
      }
      const gifBtn = event.target.closest("[data-pick-gif]");
      if (gifBtn) {
        const key = gifBtn.dataset.pickGif;
        const def = GIF_LIBRARY[key];
        if (def) addMedia({ type: "gif", key: key, title: def.label });
        return;
      }
      const exampleBtn = event.target.closest("[data-example-video]");
      if (exampleBtn) {
        const input = $("#videoUrl");
        if (input) {
          input.value = exampleBtn.dataset.exampleVideo;
          input.classList.remove("is-invalid");
          const error = $("#videoError");
          if (error) error.textContent = "";
        }
        return;
      }
      if (event.target.closest("#videoConfirm")) confirmVideo();
    });
    $("#sheetBody").addEventListener("input", (event) => {
      if (event.target.id === "videoUrl") {
        event.target.classList.remove("is-invalid");
        const error = $("#videoError");
        if (error) error.textContent = "";
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMediaSheet();
        closeMonthPicker();
      }
    });

    $("#savedClose").addEventListener("click", () => goHome(4));
    $("#toHomeFromSaved").addEventListener("click", () => goHome(4));
    $("#toChat").addEventListener("click", () => {
      if (state.currentEntryId && getEntry(state.currentEntryId)) {
        openChat(state.currentEntryId, "saved");
      } else {
        toast("先写一篇日记，再和回声聊吧");
      }
    });

    $("#chatBack").addEventListener("click", closeChat);
    $("#chatReview").addEventListener("click", () => goHome(4));
    $("#sendBtn").addEventListener("click", () => sendChat($("#chatInput").value));
    $("#chatInput").addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        sendChat($("#chatInput").value);
      }
    });
    $("#messages").addEventListener("click", (event) => {
      const timelineBtn = event.target.closest('[data-action="timeline"]');
      if (timelineBtn) goHome(4);
    });

    $("#detailBack").addEventListener("click", () => goHome(4));
    $("#backTimeline").addEventListener("click", () => goHome(4));
    $("#detailChat").addEventListener("click", () => {
      if (getEntry(state.detailEntryId)) openChat(state.detailEntryId, "detail");
    });
    $("#detailChatBtn").addEventListener("click", () => {
      if (getEntry(state.detailEntryId)) openChat(state.detailEntryId, "detail");
    });
    $("#detailChatLink").addEventListener("click", () => {
      if (getEntry(state.detailEntryId)) openChat(state.detailEntryId, "detail");
    });

    $("#railScreens").addEventListener("click", (event) => {
      const btn = event.target.closest("[data-go]");
      if (btn) handleRailJump(btn.dataset.go);
    });
    $("#resetDemo").addEventListener("click", resetDemo);

    const searchPlaceholder = $("#searchPlaceholder");
    if (searchPlaceholder) {
      searchPlaceholder.addEventListener("click", () => {
        toast("日记搜索为 P1 占位，后续版本开放");
      });
    }
    $$(".mood-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        toast("情绪标记为 P1 占位，后续版本开放");
      });
    });
  }

  function init() {
    renderHome();
    bindEvents();
    navigate("home", { step: 1, keepScroll: true });
    setFlow(1);
    updateRailCurrent();
  }

  init();
})();
