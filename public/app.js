(() => {
  "use strict";
  const NAME = "Sizan";
  const LESSONS = window.LESSONS;
  const UNITS = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]];
  const ic = window.ic;
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");

  /* ---------------- helpers ---------------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const bnNum = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clean = (s) => s.toLowerCase().replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ").trim();
  const tokens = (s) => s.replace(/[.!?,]/g, "").split(/\s+/).filter(Boolean);
  const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return dayStr(d); };
  const daysAgo = (day) => Math.round((Date.parse(dayStr()) - Date.parse(day)) / 864e5);
  const TILE = ["t1", "t2", "t3", "t4", "t5", "t6"];
  const tile = (icon, i, size = "") => `<span class="tile-ic ${TILE[i % TILE.length]} ${size}" aria-hidden="true">${ic(icon)}</span>`;
  const bar = (pct, cls = "") => `<span class="bar ${cls}"><i style="width:${Math.round(Math.max(0, Math.min(1, pct)) * 100)}%"></i></span>`;
  let toastTimer;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600); }
  function highlight(text, words) {
    if (!words || !words.length) return esc(text);
    const set = new Set(words.map((w) => w.toLowerCase()));
    return text.split(/(\s+)/).map((part) => {
      const core = part.replace(/[.!?,]/g, "");
      if (core && set.has(core.toLowerCase())) return esc(part).replace(esc(core), `<mark class="hl">${esc(core)}</mark>`);
      return esc(part);
    }).join("").replace(/<\/mark>(\s+)<mark class="hl">/g, "$1");
  }

  /* ---------------- XP, levels, badges ---------------- */
  // XP: lesson answer +10 (+5 with a hint or on the second try), saying a sentence +5, writing +10,
  // first finish of a lesson +15, review answer +5, test answer +5.
  const LEVELS = [[0, "শুরু"], [150, "শিক্ষার্থী"], [400, "পাঠক"], [800, "বক্তা"], [1300, "লেখক"], [2000, "স্টার"]];
  function levelOf(xp) {
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
    const next = LEVELS[i + 1];
    return { n: i + 1, name: LEVELS[i][1], to: next ? next[0] : null, nextName: next ? next[1] : null,
      pct: next ? (xp - LEVELS[i][0]) / (next[0] - LEVELS[i][0]) : 1 };
  }
  const doneCountOf = (s) => LESSONS.filter((l) => s.done[l.id]).length;
  const wordCountOf = (s) => Object.keys(s.words).length;
  const testBest = (s) => Math.max(0, ...Object.values(s.tests).map((t) => t.best || 0));
  const BADGES = [
    { id: "first", name: "প্রথম পাঠ", desc: "প্রথম পাঠ শেষ করেছ", icon: "book", c: "b1", test: (s) => doneCountOf(s) >= 1 },
    { id: "streak3", name: "৩ দিন টানা", desc: "৩ দিন টানা পড়েছ", icon: "f-flame", c: "b2", test: (s) => s.best >= 3 },
    { id: "test90", name: "টেস্টে ৯০%", desc: "একটা টেস্টে ৯০% পেয়েছ", icon: "trophy", c: "b3", test: (s) => testBest(s) >= 0.9 },
    { id: "words20", name: "শব্দ সংগ্রাহক", desc: "২০টার বেশি শব্দ শিখেছ", icon: "books", c: "b4", test: (s) => wordCountOf(s) >= 20 },
    { id: "streak7", name: "৭ দিন টানা", desc: "৭ দিন টানা পড়েছ", icon: "f-flame", c: "b2", test: (s) => s.best >= 7 },
    { id: "words50", name: "৫০টা শব্দ", desc: "৫০টা শব্দ শিখেছ", icon: "books", c: "b4", test: (s) => wordCountOf(s) >= 50 },
    { id: "test100", name: "নিখুঁত টেস্ট", desc: "একটা টেস্টে সব ঠিক", icon: "f-trophy", c: "b3", test: (s) => testBest(s) >= 1 },
    { id: "all", name: "সব পাঠ শেষ", desc: "১২টা পাঠই শেষ করেছ", icon: "f-star", c: "b1", test: (s) => doneCountOf(s) === LESSONS.length }
  ];

  /* ---------------- storage ---------------- */
  const KEY = "sizan-english-v1", SYNC_KEY = "sizan-english-sync";
  const defaults = () => ({ v: 2, done: {}, streak: 0, best: 0, lastDay: null, words: {}, weak: [], sentences: [], tests: {}, xp: 0, xpLog: {},
    badges: [], resume: null, reviewDay: null, slow: false, hideHowto: false, updatedAt: 0 });
  function migrate(raw) {
    const s = Object.assign(defaults(), raw && typeof raw === "object" ? raw : {});
    for (const k of ["done", "words", "tests", "xpLog"]) if (!s[k] || typeof s[k] !== "object" || Array.isArray(s[k])) s[k] = {};
    for (const k of ["weak", "sentences", "badges"]) if (!Array.isArray(s[k])) s[k] = [];
    if (!raw || raw.v !== 2) {
      // First run after the update: give XP for lessons already finished, and keep old badges quiet.
      s.best = Math.max(s.best || 0, s.streak || 0);
      for (const l of LESSONS) {
        const d = s.done[l.id];
        if (!d) continue;
        s.xp += (d.right || 0) * 10 + 15;
        l.words.forEach((w) => { const r = s.words[w.en]; if (r && !r.added) r.added = d.first || d.day; });
      }
      s.badges = BADGES.filter((b) => b.test(s)).map((b) => b.id);
      s.v = 2;
    }
    for (const r of Object.values(s.words)) { r.miss = r.miss || 0; r.added = r.added || dayStr(); }
    return s;
  }
  const loadJSON = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const stored = loadJSON(KEY);
  let state = migrate(stored);
  let sync = Object.assign({ code: null, at: 0 }, loadJSON(SYNC_KEY));
  function writeLocal() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: progress lives for this visit only */ } }
  if (stored && stored.v !== 2) { state.updatedAt = Date.now(); writeLocal(); }
  function saveSync() { try { localStorage.setItem(SYNC_KEY, JSON.stringify(sync)); } catch (e) { /* ignore */ } }
  function save() { state.updatedAt = Date.now(); writeLocal(); queuePush(); }

  const isDone = (id) => !!state.done[id];
  const firstDay = (id) => state.done[id] && (state.done[id].first || state.done[id].day);
  const newToday = () => LESSONS.filter((l) => firstDay(l.id) === dayStr()).length;
  const nextLesson = () => LESSONS.find((l) => !isDone(l.id)) || null;
  const liveStreak = (s) => (!s.lastDay ? 0 : (s.lastDay === dayStr() || s.lastDay === addDays(-1)) ? s.streak : 0);
  const wordsKnownBefore = (s, days) => { const cut = addDays(-days); return Object.values(s.words).filter((r) => r.added <= cut).length; };
  const unitOf = (id) => UNITS.findIndex((u) => u.includes(id)) + 1;
  const INTERVALS = [0, 1, 3, 7, 14, 30];
  function findWord(en) { for (const l of LESSONS) { const i = l.words.findIndex((x) => x.en === en); if (i > -1) return { ...l.words[i], lesson: l.id, idx: i }; } return null; }
  const learnedWords = () => LESSONS.filter((l) => isDone(l.id)).flatMap((l) => l.words);

  function addXp(n) {
    if (!n) return;
    const t = dayStr();
    state.xp += n;
    state.xpLog[t] = (state.xpLog[t] || 0) + n;
    for (const d of Object.keys(state.xpLog)) if (daysAgo(d) > 60) delete state.xpLog[d];
  }
  function markActive() {
    const t = dayStr();
    if (state.lastDay === t) return;
    state.streak = state.lastDay === addDays(-1) ? state.streak + 1 : 1;
    state.lastDay = t;
    state.best = Math.max(state.best, state.streak);
  }
  function earnBadges() {
    const fresh = BADGES.filter((b) => !state.badges.includes(b.id) && b.test(state));
    fresh.forEach((b) => state.badges.push(b.id));
    return fresh;
  }

  // Mistakes come back in review: a missed word drops to box 1, a missed sentence goes to the weak list.
  function missWord(en) {
    const r = state.words[en] || (state.words[en] = { box: 1, due: addDays(1), added: dayStr(), miss: 0 });
    r.box = 1; r.due = addDays(1); r.miss = (r.miss || 0) + 1;
  }
  const weakKey = (w) => `${w.l}-${w.k}-${w.i}`;
  function addWeak(l, k, i) {
    const key = weakKey({ l, k, i }), old = state.weak.find((w) => weakKey(w) === key);
    if (old) old.due = addDays(1); else state.weak.push({ l, k, i, due: addDays(1) });
    if (state.weak.length > 40) state.weak.shift();
  }
  const missSentence = (q) => addWeak(q.l, q.kind === "fill" ? "f" : "e", q.i);
  function dueItems() {
    const t = dayStr();
    const words = Object.entries(state.words).filter(([en, r]) => r.due <= t && findWord(en)).map(([en, r]) => ({ type: "word", en, miss: r.miss > 0 && r.box <= 1 }));
    const sents = state.weak.filter((w) => w.due <= t && LESSONS[w.l - 1]).map((w) => ({ type: "sent", ref: w, miss: true }));
    return [...sents, ...words];
  }
  const hardWords = (s) => Object.entries(s.words).filter(([, r]) => r.miss > 0 && r.box <= 2).sort((a, b) => b[1].miss - a[1].miss).slice(0, 6).map(([en]) => en);

  /* ---------------- cloud save (Netlify Blobs, by a 6-digit code) ---------------- */
  const API = "/api/progress";
  let syncState = sync.code ? "saved" : "idle", syncTimer = null, pushing = false, pushAgain = false;
  const hasProgress = () => state.xp > 0 || doneCountOf(state) > 0;
  const onTabPage = () => !/^#\/(lesson|test|review|parent)/.test(location.hash);
  function setSync(s) {
    syncState = s;
    document.querySelectorAll("[data-sync]").forEach((el) => { el.className = `chip-sync ${s}`; el.innerHTML = syncChipInner(); });
    if (location.hash.startsWith("#/sync")) renderSync();
  }
  function queuePush(delay = 4000) { clearTimeout(syncTimer); syncTimer = setTimeout(pushNow, delay); }
  async function pushNow() {
    clearTimeout(syncTimer);
    if (pushing) { pushAgain = true; return; }
    if (!sync.code && !hasProgress()) return;
    if (!navigator.onLine) { setSync("offline"); return; }
    pushing = true;
    setSync("saving");
    try {
      const res = await fetch(sync.code ? `${API}?code=${sync.code}` : API, {
        method: sync.code ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(state)
      });
      if (!res.ok) throw new Error(String(res.status));
      if (!sync.code) sync.code = (await res.json()).code;
      sync.at = Date.now();
      saveSync();
      setSync("saved");
    } catch (e) {
      setSync("offline");
    } finally {
      pushing = false;
      if (pushAgain) { pushAgain = false; queuePush(500); }
    }
  }
  async function fetchCode(code) {
    const res = await fetch(`${API}?code=${code}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  }
  async function pullOnStart() {
    if (!sync.code) { if (hasProgress()) pushNow(); return; }
    if (!navigator.onLine) { setSync("offline"); return; }
    try {
      const remote = await fetchCode(sync.code);
      if (remote && (remote.updatedAt || 0) > (state.updatedAt || 0) && onTabPage()) {
        state = migrate(remote);
        writeLocal();
        sync.at = Date.now();
        saveSync();
        setSync("saved");
        route();
      } else if (!remote || state.updatedAt > sync.at) pushNow();
      else setSync("saved");
    } catch (e) {
      setSync("offline");
    }
  }
  async function restore(code) {
    if (!/^\d{6}$/.test(code)) { toast("৬ সংখ্যার কোড লেখো"); return; }
    let remote;
    try { remote = await fetchCode(code); } catch (e) { toast("ইন্টারনেট নেই। পরে আবার চেষ্টা করো।"); return; }
    if (!remote) { toast("এই কোড পাওয়া যায়নি"); return; }
    if (code !== sync.code && hasProgress() && !confirm("এই কোডের অগ্রগতি আনলে এই ফোনের এখনকার অগ্রগতি বদলে যাবে। আনবে?")) return;
    state = migrate(remote);
    writeLocal();
    sync = { code, at: Date.now() };
    saveSync();
    setSync("saved");
    toast("অগ্রগতি ফিরে এসেছে!");
    location.hash = "#/";
  }

  /* ---------------- speech & feel ---------------- */
  let voice = null;
  const canSpeak = "speechSynthesis" in window;
  function pickVoice() {
    if (!canSpeak) return;
    const vs = speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
    voice = vs.find((v) => /en[-_]US/i.test(v.lang) && /Google|Samantha|Aria|Jenny|Natural/i.test(v.name))
      || vs.find((v) => /en[-_](US|GB)/i.test(v.lang)) || vs[0] || null;
  }
  if (canSpeak) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text, btn, rate) {
    if (!canSpeak) { toast("এই ফোনে শব্দ শোনা যাচ্ছে না"); return Promise.resolve(); }
    return new Promise((resolve) => {
      speechSynthesis.cancel();
      document.querySelectorAll(".playing").forEach((b) => b.classList.remove("playing"));
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = voice ? voice.lang : "en-US";
      u.rate = rate || (state.slow ? 0.6 : 0.85);
      const end = () => { btn && btn.classList.remove("playing"); resolve(); };
      u.onend = end; u.onerror = end;
      btn && btn.classList.add("playing");
      setTimeout(() => speechSynthesis.speak(u), 60);
    });
  }
  const stopSpeech = () => { if (canSpeak) speechSynthesis.cancel(); };
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  function listenOnce() {
    return new Promise((resolve, reject) => {
      const r = new SR(); r.lang = "en-US"; r.interimResults = false; r.maxAlternatives = 4;
      let got = false;
      r.onresult = (e) => { got = true; resolve([...e.results[0]].map((a) => a.transcript)); };
      r.onerror = (e) => { if (!got) reject(e.error || "error"); };
      r.onend = () => { if (!got) resolve([]); };
      r.start();
    });
  }
  function matchScore(target, alts) {
    const want = clean(target).split(" ");
    let best = 0;
    for (const a of alts) { const heard = new Set(clean(a).split(" ")); best = Math.max(best, want.filter((w) => heard.has(w)).length / want.length); }
    return best;
  }
  // A short sound and vibration for right and wrong answers.
  let actx = null;
  function feel(ok) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      let t = actx.currentTime;
      (ok ? [660, 990] : [260, 200]).forEach((f) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = ok ? "sine" : "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(ok ? 0.18 : 0.12, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.18);
        t += 0.11;
      });
    } catch (e) { /* no audio: fine */ }
    if (navigator.vibrate) { try { navigator.vibrate(ok ? 25 : [50, 40, 50]); } catch (e) { /* ignore */ } }
  }
  const spk = (text, extra = "") => `<button class="speak ${extra}" data-say="${esc(text)}" aria-label="শোনো">${ic("volume")}</button>`;

  /* ---------------- shell ---------------- */
  const slowBtn = () => `<button class="pill-btn" data-act="slow" aria-pressed="${state.slow}">${ic("walk")}<span>${state.slow ? "ধীরে: চালু" : "ধীরে"}</span></button>`;
  const xpChip = () => `<a class="chip-xp" href="#/progress" aria-label="মোট XP">${ic("f-bolt")}${bnNum(state.xp)}</a>`;
  const streakChip = () => `<span class="chip-streak" aria-label="টানা দিন">${ic("f-flame")}${bnNum(liveStreak(state))}</span>`;
  const SYNC_UI = { saved: ["cloud-check", "সেভ আছে"], saving: ["refresh", "সেভ হচ্ছে"], offline: ["cloud-off", "অফলাইন"], idle: ["cloud-check", "সেভ"] };
  const syncChipInner = () => { const [i, t] = SYNC_UI[syncState]; return `${ic(i)}<span>${t}</span>`; };
  const syncChip = () => `<a class="chip-sync ${syncState}" href="#/sync" data-sync>${syncChipInner()}</a>`;
  function shell(active, inner, right = syncChip()) {
    const tab = (id, href, icon, label) => `<a class="tab ${active === id ? "active" : ""}" href="${href}">${ic(icon)}<span>${label}</span></a>`;
    return `
      <header class="topbar"><div class="wrap">
        <a class="brand" href="#/"><span class="logo en">Aa</span><span class="en">${NAME} <b>English</b></span></a>
        <div class="top-actions">${right}</div>
      </div></header>
      <main class="wrap page">${inner}</main>
      <nav class="tabs" aria-label="মেনু"><div class="wrap">
        ${tab("home", "#/", "home", "হোম")}${tab("review", "#/review", "refresh", "রিভিউ")}${tab("progress", "#/progress", "chart-bar", "অগ্রগতি")}${tab("words", "#/words", "notebook", "শব্দ")}
      </div></nav>`;
  }
  const empty = (icon, title, text, btns) => `<div class="empty">${tile(icon, 0, "xl")}<h2>${title}</h2><p>${text}</p>${btns}</div>`;
  const stars = (pct) => (pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1);
  const starsHtml = (n, cls = "") => `<span class="mini-stars ${cls}">${[0, 1, 2].map((i) => ic(i < n ? "f-star" : "star", i < n ? "on" : "")).join("")}</span>`;

  /* ---------------- home ---------------- */
  const openUnits = new Set();
  function renderHome() {
    const cur = nextLesson();
    const due = dueItems().length;
    const reviewed = state.reviewDay === dayStr();
    const hr = new Date().getHours();
    const greet = hr < 12 ? "শুভ সকাল" : hr < 17 ? "শুভ দুপুর" : "শুভ সন্ধ্যা";
    const sk = liveStreak(state);
    const sub = newToday() ? "আজ দারুণ কাজ করেছ! চাইলে আরো পড়ো।" : sk > 1 ? `তুমি ${bnNum(sk)} দিন টানা পড়ছ। দারুণ!` : "চলো আজকে একটু ইংরেজি শিখি।";
    const lv = levelOf(state.xp);

    const howto = state.hideHowto || doneCountOf(state) ? "" : `
      <div class="card howto">
        <div class="howto-head"><h3>কিভাবে শিখবে?</h3><button class="icon-btn" data-act="hide-howto" aria-label="বন্ধ করো">${ic("x")}</button></div>
        <ul>
          <li>${ic("calendar", "c1")}<span>দিনে <b>১টা পাঠ</b> (১৫ মিনিট) যথেষ্ট।</span></li>
          <li>${ic("volume", "c2")}<span>প্রতিটা বাক্য শোনো, তারপর <b>জোরে জোরে</b> বলো।</span></li>
          <li>${ic("refresh", "c3")}<span>রিভিউ করলে শব্দ আর ভুলে যাবে না।</span></li>
          <li>${ic("mood-smile", "c4")}<span>ভুল হলে ভয় নেই। ভুল থেকেই শেখা হয়।</span></li>
        </ul>
      </div>`;

    const levelCardHome = `
      <a class="card level-card" href="#/progress">
        <div class="lv-row"><span class="lv-badge soft">${bnNum(lv.n)}</span>
          <div class="lv-txt"><div class="lv-n">লেভেল ${bnNum(lv.n)} · ${lv.name}</div>
          <div class="lv-k">${lv.to ? `আর <b>${bnNum(lv.to - state.xp)} XP</b> হলে লেভেল ${bnNum(lv.n + 1)} · ${lv.nextName}` : "তুমি সর্বোচ্চ লেভেলে!"}</div></div>
          ${ic("chevron-right", "go")}</div>
        ${bar(lv.pct, "amber")}
      </a>`;

    // Today's plan: 1. a short review, 2. the next lesson. Nothing is locked: each row opens on its own.
    let planRows = "", btn;
    const hasWords = wordCountOf(state) > 0;
    if (hasWords) {
      const doneRev = reviewed || !due;
      planRows += `<a class="plan-row ${doneRev ? "done" : ""}" href="#/review">
        <span class="pn">${doneRev ? ic("check") : bnNum(1)}</span>
        <span class="pt"><b>${reviewed ? "রিভিউ শেষ!" : due ? `রিভিউ · ${bnNum(due)}টা প্রশ্ন` : "আজ রিভিউ নেই"}</b>
        <small>${reviewed ? "শব্দগুলো মনে থাকবে।" : due ? "২ মিনিট" : "সব শব্দ মনে আছে!"}</small></span></a>`;
    }
    const r = state.resume && LESSONS.find((l) => l.id === state.resume.id && !isDone(l.id)) ? state.resume : null;
    const lessonForPlan = r ? LESSONS[r.id - 1] : cur;
    if (lessonForPlan) {
      const L2 = lessonForPlan;
      const going = r && r.id === L2.id && r.si > 0;
      planRows += `<a class="plan-row current" href="#/lesson/${L2.id}">
        <span class="pn">${bnNum(hasWords ? 2 : 1)}</span>
        <span class="pt"><b>পাঠ ${bnNum(L2.id)} · <span class="en">${esc(L2.title)}</span></b>
        ${going ? `<small class="pp">${bar(r.si / (r.steps.length - 1), "light")}${bnNum(r.si)}/${bnNum(r.steps.length - 1)} ধাপ</small>` : `<small>${esc(L2.bn)} · ১৫ মিনিট</small>`}</span></a>`;
      btn = hasWords && !reviewed && due
        ? `<a class="btn light" href="#/review">${ic("f-player-play")}রিভিউ শুরু করো</a>`
        : `<a class="btn light" href="#/lesson/${L2.id}">${ic("f-player-play")}পাঠ ${bnNum(L2.id)} ${going ? "চালিয়ে যাও" : "শুরু করো"}</a>`;
    } else {
      const u = UNITS.findIndex((_, i) => !state.tests[i + 1]) + 1;
      planRows += `<div class="plan-row current"><span class="pn">${ic("trophy")}</span><span class="pt"><b>১২টা পাঠই শেষ!</b><small>${u ? `টেস্ট ${bnNum(u)} বাকি আছে` : "যেকোনো পাঠ আবার পড়ো"}</small></span></div>`;
      btn = u ? `<a class="btn light" href="#/test/${u}">${ic("trophy")}টেস্ট ${bnNum(u)} দাও</a>` : `<a class="btn light" href="#/review/practice">${ic("refresh")}অনুশীলন করো</a>`;
    }
    const plan = `<section class="plan"><span class="tag">আজকের প্ল্যান · ১৫ মিনিট</span>${planRows}${btn}</section>`;

    app.innerHTML = shell("home", `
      <div class="stack">
        <div class="hello"><h1 class="en">Hi ${NAME} ${ic("hand-stop", "wave")}</h1><p>${greet}! ${sub}</p></div>
        ${howto}
        ${levelCardHome}
        ${plan}
        <div class="stats">
          <div class="stat">${ic("f-flame", "s-flame")}<span class="n">${bnNum(sk)}</span><span class="l">দিন টানা</span></div>
          <div class="stat">${ic("books", "s-book")}<span class="n">${bnNum(wordCountOf(state))}</span><span class="l">শব্দ শিখেছ</span></div>
          <div class="stat">${ic("f-star", "s-star")}<span class="n">${bnNum(doneCountOf(state))}/${bnNum(LESSONS.length)}</span><span class="l">পাঠ শেষ</span></div>
        </div>
      </div>
      <h2 class="section-title">${ic("route")}তোমার পথ</h2>
      ${pathHtml(cur, r)}`, `${xpChip()}${streakChip()}`);
  }
  function pathHtml(cur, r) {
    return UNITS.map((ids, ui) => {
      const u = ui + 1, t = state.tests[u], allDone = ids.every(isDone);
      const range = `পাঠ ${bnNum(ids[0])}-${bnNum(ids[ids.length - 1])}`;
      if (allDone && t && !openUnits.has(u)) {
        return `<button class="unit-done" data-act="unfold" data-u="${u}">
          <span class="tile-ic ok" aria-hidden="true">${ic("trophy")}</span>
          <span class="lr-txt"><span class="ttl">ইউনিট ${bnNum(u)} শেষ · ${range}</span><span class="sub">টেস্ট ${bnNum(u)}: ${bnNum(Math.round(t.best * 10))}/১০ · আবার পড়তে ট্যাপ করো</span></span>
          ${starsHtml(stars(t.best))}</button>`;
      }
      const rows = ids.map((id) => {
        const l = LESSONS[id - 1], d = isDone(id), c = cur && cur.id === id, going = r && r.id === id;
        const cls = d ? "done" : c || going ? "current" : "open";
        const st = d ? `${ic("check")}শেষ` : going ? "চলছে" : "শুরু";
        return `<li><button class="lesson-row ${cls}" data-go="${id}">${tile(l.icon, id - 1)}
          <span class="lr-txt"><span class="ttl en">${esc(l.title)}</span><span class="sub">পাঠ ${bnNum(id)} · ${esc(l.bn)}</span></span>
          <span class="state">${st}</span></button></li>`;
      }).join("");
      const test = `<li><button class="lesson-row test" data-test="${u}"><span class="tile-ic t6" aria-hidden="true">${ic("trophy")}</span>
        <span class="lr-txt"><span class="ttl">টেস্ট ${bnNum(u)} · ১০টা প্রশ্ন</span>
        <span class="sub">${t ? `সেরা: ${bnNum(Math.round(t.best * 10))}/১০ · আবার দিতে পারো` : `${range} এর পরে দাও · সর্বোচ্চ +৫০ XP`}</span></span>
        ${t ? starsHtml(stars(t.best)) : `<span class="state">টেস্ট</span>`}</button></li>`;
      const fold = allDone && t ? `<button class="link" data-act="fold" data-u="${u}">ছোট করো</button>` : "";
      return `<div class="unit-head"><span>ইউনিট ${bnNum(u)} · ${range}</span>${fold}</div><ul class="path">${rows}${test}</ul>`;
    }).join("");
  }

  /* ---------------- players: lesson, review and test ---------------- */
  let P = null, L = null;
  const TAGS = { words: ["book-2", "নতুন শব্দ"], pattern: ["puzzle", "আজকের নিয়ম"], story: ["book", "ছোট গল্প"], write: ["pencil", "নিজে লেখো"] };
  const tagHtml = (icon, text, cls = "") => `<span class="steptag ${cls}">${ic(icon)}${text}</span>`;
  const savedMark = () => `<span class="saved">${ic("cloud-check")}সেভ হয়েছে</span>`;
  function frame(inner, foot) {
    const pct = Math.round((P.si / (P.steps.length - 1)) * 100);
    app.innerHTML = `
      <div class="lesson">
        <div class="lbar"><div class="wrap">
          <button class="icon-btn close" data-act="quit" aria-label="বন্ধ করো">${ic("x")}</button>
          <div class="prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
          ${slowBtn()}
        </div></div>
        <main class="wrap lbody">${inner}</main>
        <footer class="lfoot" id="foot"><div class="wrap">${foot}</div></footer>
      </div>`;
    window.scrollTo(0, 0);
  }
  const nextBtn = (label = "এগিয়ে যাও", dis = false, act = "next") => `<button class="btn primary" data-act="${act}" ${dis ? "disabled" : ""}>${label}${ic("arrow-right")}</button>`;
  function next() { stopSpeech(); P.si = Math.min(P.si + 1, P.steps.length - 1); renderStep(); }
  function renderStep() {
    const st = P.steps[P.si];
    if (P.mode === "lesson" && st.type !== "done") {
      state.resume = { id: L.id, si: P.si, steps: P.steps, score: P.score, gain: P.gain, startXp: P.startXp };
      writeLocal();
    }
    ({ words: stepWords, pattern: stepPattern, ex: stepEx, q: stepQ, story: stepStory, write: stepWrite, done: stepDone, rdone: stepReviewDone, tdone: stepTestDone })[st.type](st);
  }

  /* ----- lesson ----- */
  const canBuild = (e) => { const n = tokens(e.en).length; return n >= 3 && n <= 6; };
  function makeQuestions(lesson) {
    const q = [], ws = shuffle(lesson.words).slice(0, 3);
    q.push({ kind: "en2bn", w: ws[0], pool: lesson.words }, { kind: "bn2en", w: ws[1], pool: lesson.words }, { kind: "listen", w: ws[2], pool: lesson.words });
    const buildable = shuffle(lesson.examples.map((e, i) => ({ e, i })).filter(({ e }) => canBuild(e)));
    lesson.fill.forEach((f, i) => {
      q.push({ kind: "fill", f, l: lesson.id, i });
      if (buildable[i]) q.push({ kind: "build", e: buildable[i].e, l: lesson.id, i: buildable[i].i });
    });
    const used = new Set(buildable.slice(0, 2).map((b) => b.i));
    const rest = lesson.examples.map((e, i) => ({ e, i })).filter(({ i }) => !used.has(i));
    const ls = rest.length ? pick(rest) : { e: lesson.examples[0], i: 0 };
    q.push({ kind: "listenS", e: ls.e, l: lesson.id, i: ls.i, pool: lesson.examples });
    return q;
  }
  function warmupQuestions(lesson) {
    const earlier = LESSONS.filter((l) => l.id < lesson.id && isDone(l.id)).flatMap((l) => l.words);
    if (earlier.length < 4) return [];
    const t = dayStr();
    const due = earlier.filter((w) => state.words[w.en] && state.words[w.en].due <= t);
    const picks = shuffle(due).concat(shuffle(earlier.filter((w) => !due.includes(w)))).slice(0, 3);
    return picks.map((w) => ({ kind: "en2bn", w, pool: earlier, warm: true }));
  }
  function startLesson(id) {
    L = LESSONS.find((l) => l.id === id);
    if (!L) { location.hash = "#/"; return; }
    const r = state.resume;
    if (r && r.id === id && Array.isArray(r.steps) && r.si > 0 && r.si < r.steps.length - 1) {
      P = { mode: "lesson", steps: r.steps, si: r.si, score: r.score, gain: r.gain, startXp: r.startXp };
      toast("যেখানে থেমেছিলে, সেখান থেকে শুরু");
    } else {
      const steps = [];
      warmupQuestions(L).forEach((q) => steps.push({ type: "q", q }));
      steps.push({ type: "words" }, { type: "pattern" });
      L.examples.forEach((e, i) => steps.push({ type: "ex", i }));
      makeQuestions(L).forEach((q) => steps.push({ type: "q", q }));
      steps.push({ type: "story" }, { type: "write" }, { type: "done" });
      P = { mode: "lesson", steps, si: 0, score: { right: 0, total: 0 }, gain: { q: 0, speak: 0, write: 0, bonus: 0 }, startXp: state.xp };
    }
    renderStep();
  }

  function stepWords() {
    const cards = L.words.map((w, i) => `
      <div class="wcard" data-i="${i}">
        <button class="wmain" data-say="${esc(w.en)}" aria-label="${esc(w.en)} শোনো">
          ${tile(w.icon, i, "lg")}
          <span class="wtxt"><span class="w en">${esc(w.en)}</span><span class="say">উচ্চারণ: ${esc(w.say)}</span><span class="m">${esc(w.bn)}</span></span>
          <span class="chk" aria-hidden="true">${ic("volume")}</span>
        </button>
        <button class="wex" data-say="${esc(w.ex[0])}"><span class="en">${highlight(w.ex[0], [w.en])}</span><span class="exb">${esc(w.ex[1])}</span></button>
      </div>`).join("");
    frame(`<div class="tagrow">${tagHtml(...TAGS.words)}${savedMark()}</div>
      <h2 class="step-title">আজকের ${bnNum(L.words.length)}টা শব্দ</h2>
      <p class="step-help">প্রতিটা শব্দে ট্যাপ করে শোনো, তারপর নিজে বলো। নিচের বাক্যেও ট্যাপ করা যায়।</p>
      <div class="word-list">${cards}</div>`, nextBtn());
    app.querySelectorAll(".wmain").forEach((b) => b.addEventListener("click", () => { const c = b.closest(".wcard"); c.classList.add("heard"); c.querySelector(".chk").innerHTML = ic("check"); }));
  }

  const chips = (arr, lang) => arr.map(([t, r]) => `<span class="chip ${r} ${lang}">${esc(t)}</span>`).join("");
  function stepPattern() {
    const p = L.pattern;
    const roles = new Set([...p.compare.bn, ...p.compare.en].map((x) => x[1]));
    const legend = [["s", "কে"], ["v", "কাজ / হওয়া"], ["o", "কী / কেমন"], ["q", "প্রশ্ন"]].filter(([r]) => roles.has(r))
      .map(([r, t]) => `<span><i class="dot ${r}"></i>${t}</span>`).join("");
    const rows = p.rows.map((r) => `<div class="frow"><span class="fe en">${esc(r.en)}</span><span class="fb">${esc(r.bn)}</span></div>`).join("");
    frame(`<div class="tagrow">${tagHtml(...TAGS.pattern)}${savedMark()}</div>
      <h2 class="step-title">বাক্য বানানোর ছাঁচ</h2>
      <p class="step-help">মুখস্থ না, শুধু ছাঁচটা দেখো। খালি জায়গায় শব্দ বদলালেই নতুন বাক্য।</p>
      <div class="formula">${rows}</div>
      <div class="card compare">
        <div class="cmp-head"><span>শব্দের জায়গা দেখো</span>${spk(p.compare.en.map((x) => x[0]).join(" "))}</div>
        <div class="cmp-row"><span class="cmp-lbl">বাংলা</span><span class="chips">${chips(p.compare.bn, "bn")}</span></div>
        <div class="cmp-row"><span class="cmp-lbl">English</span><span class="chips">${chips(p.compare.en, "en")}</span></div>
        <div class="legend">${legend}</div>
      </div>
      <ul class="points">${p.points.map((t) => `<li>${ic("bulb")}<span>${t}</span></li>`).join("")}</ul>`, nextBtn());
  }

  // One example sentence on each screen: listen (it plays by itself), then say it.
  function stepEx(st) {
    const e = L.examples[st.i], n = L.examples.length;
    const dots = L.examples.map((_, i) => `<span class="${i < st.i ? "on" : i === st.i ? "now" : ""}"></span>`).join("");
    frame(`<div class="tagrow">${tagHtml("message-2", `উদাহরণ ${bnNum(st.i + 1)}/${bnNum(n)}`)}${savedMark()}</div>
      <h2 class="step-title">শোনো, তারপর জোরে বলো</h2>
      <div class="card excard">
        ${spk(e.en, "xl")}
        <div class="ex-en en">${highlight(e.en, L.hl)}</div>
        <div class="ex-bn">${esc(e.bn)}</div>
      </div>
      <div class="row2 ex-acts">
        <button class="btn ghost" data-act="say-slow" data-text="${esc(e.en)}">${ic("walk")}ধীরে শোনো</button>
        ${SR ? `<button class="btn soft" data-act="mic">${ic("microphone")}<span>এবার তুমি বলো</span></button>`
             : `<button class="btn soft" data-act="said">${ic("check")}<span>আমি বলেছি</span></button>`}
      </div>
      <div class="res" aria-live="polite"></div>
      <div class="dots" aria-hidden="true">${dots}</div>`, nextBtn("পরেরটা"));
    setTimeout(() => speak(e.en, app.querySelector(".excard .speak")), 350);
  }
  function spokeOk(msg) {
    const st = P.steps[P.si], res = app.querySelector(".res");
    let xp = "";
    if (!st.spoke) { st.spoke = true; addXp(5); P.gain.speak += 5; save(); xp = ` <b class="xp-txt">+৫ XP</b>`; }
    res.className = "res ok";
    res.innerHTML = `${ic("f-circle-check")}<span>${msg}${xp}</span>`;
    feel(true);
  }
  async function useMic(b) {
    const e = L.examples[P.steps[P.si].i], res = app.querySelector(".res");
    stopSpeech();
    b.classList.add("rec"); b.querySelector("span").textContent = "শুনছি... বলো";
    try {
      const alts = await listenOnce();
      if (!alts.length) { res.className = "res try"; res.textContent = "কিছু শুনতে পাইনি। আবার চেষ্টা করো।"; }
      else if (matchScore(e.en, alts) >= 0.7) spokeOk("দারুণ! একদম ঠিক বলেছ।");
      else { res.className = "res try"; res.innerHTML = `প্রায় হয়েছে! আমি শুনলাম: <span class="en">“${esc(alts[0])}”</span>। আবার চেষ্টা করো।`; }
    } catch (err) {
      res.className = "res try";
      res.textContent = err === "not-allowed" ? "মাইক্রোফোনের অনুমতি দাও, অথবা শুধু জোরে বলো।" : "মাইক কাজ করছে না। শুধু জোরে ৩ বার বলো।";
    }
    if (document.body.contains(b)) { b.classList.remove("rec"); b.querySelector("span").textContent = "আবার বলো"; }
  }

  /* ----- questions (shared by lesson, review and test) ----- */
  function optsFrom(right, pool, key, n = 3) {
    const others = shuffle([...new Set(pool.map((x) => x[key]).filter((v) => v !== right))]).slice(0, n - 1);
    return shuffle([right, ...others]);
  }
  function qAnswer(q) {
    if (q.kind === "en2bn" || q.kind === "listen") return { answer: q.w.bn, lang: "bn" };
    if (q.kind === "bn2en") return { answer: q.w.en, lang: "en" };
    if (q.kind === "fill") return { answer: q.f.a, lang: "en" };
    return { answer: q.e.en, lang: "en" };
  }
  function qOptions(q) {
    if (q.kind === "en2bn" || q.kind === "listen") return optsFrom(q.w.bn, q.pool, "bn");
    if (q.kind === "bn2en") return optsFrom(q.w.en, q.pool, "en");
    if (q.kind === "fill") return shuffle(q.f.opts);
    return optsFrom(q.e.en, q.pool, "en");
  }
  function qHead(st) {
    const q = st.q;
    const same = (s) => s.type === "q" && !s.isRetry && !!s.q.warm === !!q.warm;
    const idx = P.steps.slice(0, P.si + 1).filter(same).length, tot = P.steps.filter(same).length;
    let tag;
    if (P.mode === "test") tag = tagHtml("trophy", `টেস্ট ${bnNum(P.unit)} · প্রশ্ন ${bnNum(idx)}/${bnNum(tot)}`, "amber");
    else if (st.isRetry) tag = tagHtml("rotate-clockwise", "আরেকবার চেষ্টা", "amber");
    else if (P.mode === "review") tag = tagHtml("refresh", `রিভিউ ${bnNum(idx)}/${bnNum(tot)}`) + (st.item.miss ? tagHtml("target", "ভুল থেকে", "amber") : "");
    else if (q.warm) tag = tagHtml("refresh", `ওয়ার্ম-আপ ${bnNum(idx)}/${bnNum(tot)}`, "amber");
    else tag = tagHtml("target", `অনুশীলন ${bnNum(idx)}/${bnNum(tot)}`);
    const canHint = P.mode !== "test" && !q.warm && (q.kind === "build" || st.opts.length >= 3);
    const hint = canHint ? `<button class="hint-btn" data-act="hint" ${st.hint ? "disabled" : ""}>${ic("bulb")}<span>${st.hint ? "সাহায্য নিয়েছ" : "সাহায্য"}</span></button>` : "";
    return `<div class="tagrow"><div class="tags">${tag}</div>${hint}</div>`;
  }
  function stepQ(st) {
    const q = st.q;
    st.opts = st.opts || (q.kind === "build" ? [] : qOptions(q));
    const head = qHead(st);
    if (q.kind === "build") return stepBuild(st, head);
    const { answer, lang } = qAnswer(q);
    const wi = q.w ? (findWord(q.w.en) || { idx: 0 }).idx : 0;
    let body = "", say = "";
    if (q.kind === "en2bn") {
      say = q.w.en;
      body = `<h2 class="q-title">${q.warm ? "আগের শেখা শব্দ! " : ""}এই শব্দের মানে কী?</h2>
        <div class="card qcard">${tile(q.w.icon, wi, "xl")}<div class="qe en">${esc(q.w.en)}</div>${spk(q.w.en)}</div>`;
    } else if (q.kind === "listen") {
      say = q.w.en;
      body = `<h2 class="q-title">শোনো। শব্দটার মানে কী?</h2>
        <div class="card qcard">${spk(q.w.en, "xl")}<div class="qe en reveal" hidden>${esc(q.w.en)}</div><div class="qsub">আবার শুনতে ট্যাপ করো</div></div>`;
    } else if (q.kind === "bn2en") {
      body = `<h2 class="q-title">ইংরেজিতে কী হবে?</h2><div class="card qcard">${tile(q.w.icon, wi, "xl")}<div class="qb">${esc(q.w.bn)}</div></div>`;
    } else if (q.kind === "fill") {
      const s = esc(q.f.q).replace("___", '<span class="blank">?</span>');
      body = `<h2 class="q-title">খালি জায়গায় কোনটা বসবে?</h2><div class="card qcard"><div class="qe en sm">${s}</div><div class="qsub">${esc(q.f.bn)}</div></div>`;
    } else {
      say = q.e.en;
      body = `<h2 class="q-title">মন দিয়ে শোনো। কোন বাক্যটা শুনলে?</h2>
        <div class="card qcard">${spk(q.e.en, "xl")}<div class="qsub">আবার শুনতে ট্যাপ করো</div></div>`;
    }
    frame(`${head}${body}<div class="opts">${st.opts.map((o) => `<button class="opt ${lang}" data-opt="${esc(o)}">${esc(o)}</button>`).join("")}</div>`,
      nextBtn("উত্তর বাছো", true));
    if (say) setTimeout(() => speak(say, app.querySelector(".qcard .speak")), 350);
    app.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
      if (b.disabled) return;
      const ok = b.dataset.opt === answer;
      app.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (x.dataset.opt === answer) x.classList.add("correct"); });
      if (!ok) b.classList.add("wrong");
      const rv = app.querySelector(".reveal");
      if (rv) rv.hidden = false;
      const hb = app.querySelector("[data-act=hint]");
      if (hb) hb.disabled = true;
      feedback(ok, st, b.dataset.opt);
    }));
  }
  function stepBuild(st, head) {
    const q = st.q, target = tokens(q.e.en);
    const bank = shuffle(target.map((t, i) => ({ t, i })));
    frame(`${head}<h2 class="q-title">বাংলা বাক্যটা ইংরেজিতে সাজাও</h2>
      <div class="card qcard"><div class="qb">${esc(q.e.bn)}</div></div>
      <div class="answer-zone" id="zone"></div>
      <div class="tiles" id="bank">${bank.map((b) => `<button class="tile en" data-i="${b.i}">${esc(b.t)}</button>`).join("")}</div>`,
      nextBtn("যাচাই করো", true, "check"));
    const zone = app.querySelector("#zone"), bankEl = app.querySelector("#bank"), check = app.querySelector("[data-act=check]");
    const placed = [];
    const refresh = () => { check.disabled = placed.length !== target.length; };
    const put = (t) => {
      t.classList.add("used"); placed.push(t);
      const c = document.createElement("button"); c.className = "tile en"; c.textContent = t.textContent;
      c.addEventListener("click", () => { if (zone.dataset.locked) return; placed.splice(placed.indexOf(t), 1); t.classList.remove("used"); c.remove(); refresh(); });
      zone.appendChild(c); refresh();
    };
    bankEl.addEventListener("click", (e) => {
      const t = e.target.closest(".tile");
      if (!t || t.classList.contains("used") || zone.dataset.locked) return;
      put(t);
    });
    // Hint for word order: start again with the first word already in place.
    P.buildHint = () => {
      zone.innerHTML = ""; placed.splice(0).forEach((t) => t.classList.remove("used")); refresh();
      const first = [...bankEl.querySelectorAll(".tile")].find((t) => t.textContent.toLowerCase() === target[0].toLowerCase());
      if (first) put(first);
    };
    check.addEventListener("click", () => {
      zone.dataset.locked = "1";
      const given = placed.map((p) => p.textContent).join(" ");
      const ok = given.toLowerCase() === target.join(" ").toLowerCase();
      zone.classList.add(ok ? "ok" : "bad");
      const hb = app.querySelector("[data-act=hint]");
      if (hb) hb.disabled = true;
      feedback(ok, st, given);
    }, { once: true });
  }
  function useHint(btn) {
    const st = P.steps[P.si];
    if (st.hint) return;
    st.hint = true;
    if (st.q.kind === "build") P.buildHint();
    else {
      const { answer } = qAnswer(st.q);
      const wrong = [...app.querySelectorAll(".opt:not([disabled])")].filter((b) => b.dataset.opt !== answer);
      const b = pick(wrong);
      if (b) { b.disabled = true; b.classList.add("removed"); b.innerHTML = `<s>${b.innerHTML}</s><span class="rm">সাহায্যে বাদ</span>`; }
    }
    btn.disabled = true;
    btn.querySelector("span").textContent = "সাহায্য নিয়েছ";
  }

  const PRAISE = ["দারুণ!", "একদম ঠিক!", "খুব ভালো!", "শাবাশ!", "চমৎকার!"];
  const answerSpeech = (q) => (q.kind === "fill" ? q.f.q.replace("___", q.f.a) : q.e ? q.e.en : q.w.en);
  function explain(q) {
    if (q.kind === "fill") return `<div class="why">${q.f.why ? `<div>${q.f.why}</div>` : ""}<div><span class="en">${esc(q.f.q.replace("___", q.f.a))}</span> = ${esc(q.f.bn)}</div></div>`;
    if (q.w) return `<div class="why"><b class="en">${esc(q.w.en)}</b> = ${esc(q.w.bn)}</div>`;
    return `<div class="why">${esc(q.e.bn)}</div>`;
  }
  const xpPill = (n) => `<span class="xp-pill">${ic("f-bolt")}+${bnNum(n)} XP</span>`;
  function feedback(ok, st, given) {
    const q = st.q;
    const res = ({ lesson: lessonAnswer, review: reviewAnswer, test: testAnswer })[P.mode](ok, st, given);
    save();
    feel(ok);
    const { answer } = qAnswer(q);
    const foot = document.getElementById("foot");
    foot.className = "lfoot " + (ok ? "good" : "bad");
    foot.querySelector(".wrap").innerHTML = ok
      ? `<div class="feedback">${ic("f-circle-check", "fi")}<div class="fb-body"><div class="ft">${pick(PRAISE)} ${res.xp ? xpPill(res.xp) : ""}</div>${res.note ? `<div class="fn">${res.note}</div>` : ""}</div></div>${nextBtn("পরেরটা")}`
      : `<div class="feedback">${ic("f-bulb", "fi")}<div class="fb-body"><div class="ft">প্রায় হয়েছে! সঠিক উত্তর:</div>
          <div class="fa ${/[a-z]/i.test(answer) ? "en" : ""}">${esc(answer)}</div>${explain(q)}${res.note ? `<div class="fn">${res.note}</div>` : ""}</div></div>${nextBtn("বুঝেছি")}`;
    setTimeout(() => speak(answerSpeech(q)), 300);
  }
  function lessonAnswer(ok, st) {
    const q = st.q;
    let xp = 0, note = "";
    if (!st.counted) { st.counted = true; if (!q.warm) { P.score.total++; if (ok) P.score.right++; } }
    if (ok) { xp = q.warm || st.isRetry || st.hint ? 5 : 10; addXp(xp); P.gain.q += xp; return { xp, note }; }
    if (q.w) missWord(q.w.en); else missSentence(q);
    if (!q.warm && !st.isRetry && !st.hadRetry) {
      let at = P.si + 1;
      while (P.steps[at] && P.steps[at].type === "q") at++;
      P.steps.splice(at, 0, { type: "q", q, isRetry: true, counted: true });
      st.hadRetry = true;
      note = "এই প্রশ্নটা একটু পরে আবার আসবে।";
    }
    return { xp, note };
  }
  function reviewAnswer(ok, st) {
    const it = st.item;
    let xp = 0, note = "";
    if (!st.isRetry) { P.total++; if (ok) P.right++; }
    if (it.type === "word") {
      const r = state.words[it.en];
      if (ok && r && !st.isRetry && r.due <= dayStr()) {
        r.box = Math.min(r.box + 1, 5); r.due = addDays(INTERVALS[r.box]);
        note = `এই শব্দটা ${bnNum(INTERVALS[r.box])} দিন পরে আবার আসবে।`;
      }
      if (!ok) missWord(it.en);
    } else if (ok && !st.isRetry) state.weak = state.weak.filter((w) => weakKey(w) !== weakKey(it.ref));
    else if (!ok) addWeak(it.ref.l, it.ref.k, it.ref.i);
    if (ok) { xp = st.isRetry || st.hint ? 2 : 5; addXp(xp); P.gain += xp; }
    else if (!st.isRetry) { P.steps.splice(P.steps.length - 1, 0, { type: "q", q: st.q, item: it, isRetry: true }); note = "এটা একটু পরে আবার আসবে।"; }
    return { xp, note };
  }
  function testAnswer(ok, st, given) {
    const q = st.q, c = P.cats[q.cat];
    c[1]++;
    if (ok) { c[0]++; P.right++; addXp(5); P.gain += 5; return { xp: 5, note: "" }; }
    if (q.w) missWord(q.w.en); else missSentence(q);
    P.wrong.push({ q, given });
    return { xp: 0, note: "এটা তোমার রিভিউতে যোগ হলো।" };
  }

  function stepStory() {
    const s = L.story;
    frame(`<div class="tagrow">${tagHtml(...TAGS.story)}${savedMark()}</div>
      <div class="story-head">
        <button class="speak xl" data-act="play-story" aria-label="পুরো গল্প শোনো">${ic("f-player-play")}</button>
        <div><h3 class="en">${esc(s.title)}</h3><div class="muted">${esc(s.bn)}</div></div>
      </div>
      <p class="step-help">প্লে বাটন চাপলে পুরো গল্প শুনবে। কোনো লাইনের মানে জানতে ওই লাইনে ট্যাপ করো।</p>
      <div class="story">${s.lines.map((l, i) => `<button class="sline" data-line="${i}"><span class="se en">${highlight(l.en, L.hl)}</span><span class="sb">${esc(l.bn)}</span></button>`).join("")}</div>
      <button class="btn ghost toggle-bn" data-act="all-bn">${ic("eye")}<span>সব বাংলা দেখাও</span></button>`, nextBtn());
    app.querySelectorAll(".sline").forEach((b) => b.addEventListener("click", () => { b.classList.toggle("open"); speak(s.lines[+b.dataset.line].en); }));
  }
  async function playStory(btn) {
    const lines = [...app.querySelectorAll(".sline")];
    btn.classList.add("playing");
    for (let i = 0; i < L.story.lines.length; i++) {
      if (!document.body.contains(btn)) return;
      lines.forEach((l) => l.classList.remove("now")); lines[i].classList.add("now");
      await speak(L.story.lines[i].en);
      await new Promise((r) => setTimeout(r, 350));
    }
    lines.forEach((l) => l.classList.remove("now")); btn.classList.remove("playing");
  }

  function stepWrite() {
    const w = L.write;
    frame(`<div class="tagrow">${tagHtml(...TAGS.write)}${savedMark()}</div>
      <h2 class="step-title">${esc(w.prompt)}</h2>
      <p class="step-help">নিজের জীবন নিয়ে লেখো। ভুল হলেও সমস্যা নেই।</p>
      <textarea class="write-box en" id="wbox" rows="3" autocapitalize="sentences" autocomplete="off" spellcheck="true" aria-label="তোমার বাক্য">${esc(w.start)}</textarea>
      <div class="hint">${ic("bulb")}<span>উদাহরণ: <b class="en">${esc(w.hint)}</b></span></div>`, nextBtn("জমা দাও", true, "submit-write"));
    const box = app.querySelector("#wbox"), btn = app.querySelector("[data-act=submit-write]");
    box.addEventListener("input", () => { btn.disabled = tokens(box.value).length < 2 || box.value.trim() === w.start.trim(); });
    btn.addEventListener("click", () => {
      let text = box.value.trim().replace(/\s+/g, " ");
      text = text.charAt(0).toUpperCase() + text.slice(1);
      if (!/[.!?]$/.test(text)) text += ".";
      state.sentences.unshift({ text, lesson: L.id, day: dayStr() }); state.sentences = state.sentences.slice(0, 100);
      addXp(10); P.gain.write += 10;
      save();
      feel(true);
      speak(text);
      const foot = document.getElementById("foot");
      foot.className = "lfoot good";
      foot.querySelector(".wrap").innerHTML = `<div class="feedback">${ic("f-circle-check", "fi")}<div class="fb-body"><div class="ft">চমৎকার! তুমি নিজে ইংরেজি লিখলে! ${xpPill(10)}</div><div class="fa en">${esc(text)}</div></div></div>${nextBtn("শেষ করো")}`;
    }, { once: true });
  }

  /* ----- end screens ----- */
  function xpCard(total, lines) {
    const rows = lines.length ? lines : [["আজকের অনুশীলন", total]];
    return `<div class="card xp-card"><div class="xp-big"><span class="n">+${bnNum(total)}</span><span class="u">XP</span></div>
      <div class="xp-lines">${rows.map(([t, n]) => `<div><span>${t}</span><b>+${bnNum(n)}</b></div>`).join("")}</div></div>`;
  }
  function levelBlock(startXp) {
    const lv = levelOf(state.xp), up = levelOf(startXp).n < lv.n;
    return `<div class="card lv-block ${up ? "up" : ""}">
      <div class="lv-row"><span class="lv-badge">${bnNum(lv.n)}</span>
        <div class="lv-txt"><div class="lv-k">${up ? "লেভেল আপ!" : "তোমার লেভেল"}</div><div class="lv-n">${up ? "এখন তুমি " : ""}লেভেল ${bnNum(lv.n)} · ${lv.name}</div></div></div>
      ${bar(lv.pct, "amber")}
      <div class="lv-foot"><span>${bnNum(state.xp)} XP</span><span>${lv.to ? `লেভেল ${bnNum(lv.n + 1)}: ${bnNum(lv.to)} XP` : "সর্বোচ্চ লেভেল!"}</span></div></div>`;
  }
  const badgeNew = (b) => `<div class="card badge-new"><span class="bdg ${b.c}">${ic(b.icon)}</span><div><div class="bk">নতুন ব্যাজ!</div><div class="bn">${b.name} · ${b.desc}</div></div></div>`;
  function endButtons(primary) {
    return `<div class="foot-btns">${primary}<a class="btn ghost" href="#/">${ic("home")}আজকের মতো শেষ, হোমে যাও</a></div>`;
  }
  function stepDone() {
    if (!P.finished) {
      P.finished = true;
      const t = dayStr(), prev = state.done[L.id];
      P.first = !prev;
      markActive();
      state.done[L.id] = { right: P.score.right, total: P.score.total, day: t, first: prev ? prev.first || prev.day : t, best: Math.max(P.score.right, prev ? prev.best || prev.right || 0 : 0) };
      L.words.forEach((w) => { if (!state.words[w.en]) state.words[w.en] = { box: 1, due: addDays(1), added: t, miss: 0 }; });
      if (P.first) { addXp(15); P.gain.bonus = 15; }
      state.resume = null;
      P.newBadges = earnBadges();
      save();
      pushNow();
    }
    const g = P.gain, total = g.q + g.speak + g.write + g.bonus;
    const lines = [[`${bnNum(P.score.right)}টা সঠিক উত্তর`, g.q], ["জোরে বলা", g.speak], ["নিজে লেখা", g.write], ["পাঠ শেষ করার বোনাস", g.bonus]].filter(([, n]) => n > 0);
    const wc = wordCountOf(state), before = wordsKnownBefore(state, 7);
    const enc = before > 0 && wc > before ? `তুমি এখন <b>${bnNum(wc)}টা শব্দ</b> জানো! গত সপ্তাহে জানতে ${bnNum(before)}টা।` : `তুমি এখন <b>${bnNum(wc)}টা শব্দ</b> জানো! এভাবেই চালিয়ে যাও।`;
    const u = unitOf(L.id), nextL = LESSONS.find((l) => l.id > L.id && !isDone(l.id)) || nextLesson();
    const primary = UNITS[u - 1].every(isDone) && !state.tests[u]
      ? `<a class="btn primary" href="#/test/${u}">${ic("trophy")}টেস্ট ${bnNum(u)} দাও · ১০টা প্রশ্ন</a>`
      : nextL ? `<a class="btn primary" href="#/lesson/${nextL.id}">পরের পাঠ: <span class="en">${esc(nextL.title)}</span>${ic("arrow-right")}</a>`
      : `<a class="btn primary" href="#/progress">${ic("chart-bar")}আমার অগ্রগতি দেখো</a>`;
    frame(`<div class="done-wrap">
        <div class="trophy">${ic("f-trophy")}</div>
        <h2>শাবাশ, <span class="en">${NAME}</span>!</h2>
        <p class="muted">পাঠ ${bnNum(L.id)} শেষ · <span class="en">${esc(L.title)}</span>${P.first ? "" : " (আবার অনুশীলন)"}</p>
        ${xpCard(total, lines)}
        ${levelBlock(P.startXp)}
        <div class="card info-row">${tile("books", 1)}<div>${enc}</div></div>
        ${P.newBadges.map(badgeNew).join("")}
      </div>`, endButtons(primary));
    confetti();
    speak(`Great job, ${NAME}!`);
  }
  function confetti() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = document.createElement("div"); c.className = "confetti";
    const colors = ["#0F9D76", "#F59E0B", "#2563EB", "#E8590C", "#7C3AED", "#EC4899"];
    for (let i = 0; i < 60; i++) { const p = document.createElement("i"); p.style.left = Math.random() * 100 + "%"; p.style.background = colors[i % colors.length]; p.style.animationDelay = Math.random() * 0.6 + "s"; p.style.animationDuration = 1.4 + Math.random() * 1.2 + "s"; c.appendChild(p); }
    document.body.appendChild(c); setTimeout(() => c.remove(), 3500);
  }

  /* ----- smart review: the app checks each answer ----- */
  function reviewQ(it) {
    if (it.type === "word") {
      const w = findWord(it.en), r = state.words[it.en];
      const pool = learnedWords().length >= 4 ? learnedWords() : LESSONS[w.lesson - 1].words;
      const kinds = !r || r.box <= 1 ? ["en2bn", "listen"] : ["en2bn", "bn2en", "listen"];
      return { kind: pick(kinds), w, pool };
    }
    const { l, k, i } = it.ref, les = LESSONS[l - 1];
    if (k === "f") return { kind: "fill", f: les.fill[i], l, i };
    const e = les.examples[i];
    return canBuild(e) ? { kind: "build", e, l, i } : { kind: "listenS", e, l, i, pool: les.examples };
  }
  function startReview(mode) {
    let items;
    if (mode === "hard") items = hardWords(state).map((en) => ({ type: "word", en, miss: true }));
    else if (mode === "practice") items = shuffle(learnedWords()).slice(0, 8).map((w) => ({ type: "word", en: w.en, miss: false }));
    else items = dueItems();
    items = [...shuffle(items.filter((i) => i.miss)), ...shuffle(items.filter((i) => !i.miss))].slice(0, 10);
    if (!items.length) { renderReviewEmpty(); return; }
    P = { mode: "review", sub: mode, steps: [...items.map((item) => ({ type: "q", q: reviewQ(item), item })), { type: "rdone" }], si: 0, right: 0, total: 0, gain: 0, startXp: state.xp };
    renderStep();
  }
  function renderReviewEmpty() {
    if (!wordCountOf(state)) {
      app.innerHTML = shell("review", empty("seedling", "এখনো কোনো শব্দ নেই", "প্রথম পাঠ শেষ করলে এখানে শব্দ আসবে।", `<a class="btn primary" href="#/">${ic("f-player-play")}পাঠ শুরু করো</a>`));
      return;
    }
    const can = learnedWords().length >= 4;
    app.innerHTML = shell("review", empty("calendar-check", "আজ রিভিউ করার মতো কিছু নেই", "শব্দগুলো ঠিক সময়ে আবার ফিরে আসবে। চাইলে এখন এমনি অনুশীলন করো।",
      `<div class="row2">${can ? `<a class="btn primary" href="#/review/practice">${ic("target")}অনুশীলন</a>` : ""}<a class="btn ghost" href="#/">${ic("home")}হোম</a></div>`));
  }
  function stepReviewDone() {
    if (!P.finished) {
      P.finished = true;
      markActive();
      if (P.sub === "due") state.reviewDay = dayStr();
      P.newBadges = earnBadges();
      save();
      pushNow();
    }
    const cur = nextLesson();
    const primary = cur ? `<a class="btn primary" href="#/lesson/${cur.id}">এবার পাঠ ${bnNum(cur.id)}${ic("arrow-right")}</a>` : `<a class="btn primary" href="#/progress">${ic("chart-bar")}আমার অগ্রগতি দেখো</a>`;
    frame(`<div class="done-wrap">
        <div class="trophy good">${ic("f-circle-check")}</div>
        <h2>রিভিউ শেষ!</h2>
        <p class="muted">মনে ছিল ${bnNum(P.right)}/${bnNum(P.total)}টা। ভুলগুলো আবার আসবে, তাই চিন্তা নেই।</p>
        ${xpCard(P.gain, [])}
        ${levelBlock(P.startXp)}
        ${P.newBadges.map(badgeNew).join("")}
      </div>`, endButtons(primary));
    feel(true);
  }

  /* ----- unit test: 10 mixed questions, never a gate ----- */
  function startTest(u) {
    const ids = UNITS[u - 1];
    if (!ids) { location.hash = "#/"; return; }
    const les = ids.map((id) => LESSONS[id - 1]);
    const words = les.flatMap((l) => l.words);
    const ws = shuffle(words).slice(0, 5);
    const qs = [
      { kind: "listen", w: ws[0], pool: words, cat: "listen" },
      { kind: "en2bn", w: ws[1], pool: words, cat: "word" }, { kind: "en2bn", w: ws[2], pool: words, cat: "word" },
      { kind: "bn2en", w: ws[3], pool: words, cat: "word" }, { kind: "bn2en", w: ws[4], pool: words, cat: "word" }
    ];
    shuffle(les.flatMap((l) => l.fill.map((f, i) => ({ f, l: l.id, i })))).slice(0, 2).forEach((x) => qs.push({ kind: "fill", ...x, cat: "sent" }));
    const exs = shuffle(les.flatMap((l) => l.examples.map((e, i) => ({ e, l: l.id, i }))));
    const b = exs.find((x) => canBuild(x.e));
    if (b) qs.push({ kind: "build", ...b, cat: "sent" });
    exs.filter((x) => x !== b).slice(0, 2).forEach((x) => qs.push({ kind: "listenS", ...x, pool: LESSONS[x.l - 1].examples, cat: "listen" }));
    P = { mode: "test", unit: u, steps: [...shuffle(qs).map((q) => ({ type: "q", q })), { type: "tdone" }], si: 0, right: 0, total: qs.length, gain: 0, startXp: state.xp,
      cats: { listen: [0, 0], word: [0, 0], sent: [0, 0] }, wrong: [] };
    renderStep();
  }
  function stepTestDone() {
    const u = P.unit, pct = P.right / P.total;
    if (!P.finished) {
      P.finished = true;
      markActive();
      const prev = state.tests[u];
      state.tests[u] = { best: Math.max(pct, prev ? prev.best : 0), last: pct, day: dayStr() };
      P.newBadges = earnBadges();
      save();
      pushNow();
    }
    const msg = pct >= 0.9 ? `চমৎকার! ইউনিট ${bnNum(u)} তুমি ভালো শিখেছ।` : pct >= 0.6 ? "ভালো হয়েছে! ভুলগুলো রিভিউ করলে আরো ভালো হবে।" : "চিন্তা নেই! পাঠগুলো আবার পড়ো, তারপর আবার টেস্ট দাও।";
    const cat = (k, t) => { const [r, n] = P.cats[k]; return `<div class="skill"><span>${t}</span><b class="${r === n ? "full" : "part"}">${bnNum(r)}/${bnNum(n)}</b></div>`; };
    // Each missed item: the question, the given answer (crossed out) and the right one.
    const wrong = P.wrong.slice(0, 3).map(({ q, given }) => {
      const toBn = q.kind === "en2bn" || q.kind === "listen";
      const prompt = toBn ? q.w.en : q.kind === "bn2en" ? q.w.bn : q.kind === "fill" ? q.f.bn : q.e.bn;
      const gave = q.kind === "fill" ? q.f.q.replace("___", given) : given;
      const right = toBn ? q.w.bn : q.kind === "bn2en" ? q.w.en : answerSpeech(q);
      return `<div class="card miss-card">
        <div class="mc-top"><span class="mc-q ${toBn ? "en" : ""}">${esc(prompt)}</span>${spk(answerSpeech(q))}</div>
        <div class="mc-bad">${ic("x")}<span class="${toBn ? "" : "en"}">${esc(gave)}</span></div>
        <div class="mc-good">${ic("check")}<span class="${toBn ? "" : "en"}">${esc(right)}</span></div>
      </div>`;
    }).join("");
    const nl = nextLesson();
    const primary = nl ? `<a class="btn primary" href="#/lesson/${nl.id}">এগিয়ে যাও: পাঠ ${bnNum(nl.id)}${ic("arrow-right")}</a>` : `<a class="btn primary" href="#/progress">${ic("chart-bar")}আমার অগ্রগতি দেখো</a>`;
    frame(`<div class="done-wrap">
        <div class="card score-card">
          <div class="ring" style="--p:${Math.round(pct * 100)}"><div><b>${bnNum(P.right)}/${bnNum(P.total)}</b><span>${bnNum(Math.round(pct * 100))}%</span></div></div>
          ${starsHtml(stars(pct), "big")}
          <div class="sc-msg">${msg}</div>
          ${xpPill(P.gain)}
        </div>
        <div class="skills">${cat("listen", "শোনা")}${cat("word", "শব্দ")}${cat("sent", "বাক্য")}</div>
        ${wrong ? `<h3 class="sub-title">যেগুলো আবার দেখবে</h3>${wrong}<p class="muted small">এগুলো তোমার রিভিউতে যোগ হয়েছে।</p>` : ""}
        ${P.newBadges.map(badgeNew).join("")}
      </div>`, `<div class="foot-btns">${primary}<button class="btn ghost" data-act="retest">${ic("refresh")}আবার টেস্ট দাও</button></div>`);
    if (pct >= 0.7) confetti();
  }

  /* ---------------- progress (also the read-only parent view) ---------------- */
  const WEEK = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র"];
  function weekHtml(s) {
    const sinceSat = (new Date().getDay() + 1) % 7;
    const days = WEEK.map((name, i) => { const d = new Date(); d.setDate(d.getDate() - sinceSat + i); const xp = s.xpLog[dayStr(d)] || 0; return { name, xp, today: i === sinceSat, future: i > sinceSat }; });
    const max = Math.max(1, ...days.map((d) => d.xp)), total = days.reduce((a, d) => a + d.xp, 0);
    return `<section class="card week">
      <div class="wk-head"><h2>এই সপ্তাহ</h2><span class="wk-total">${bnNum(total)} XP</span></div>
      <div class="wk-bars">${days.map((d) => `<div class="wk-col ${d.today ? "today" : ""}">${d.xp && d.today ? `<span class="wk-n">${bnNum(d.xp)}</span>` : ""}<span class="wk-bar ${d.xp ? "" : "zero"}" style="height:${d.xp ? Math.max(8, Math.round((d.xp / max) * 80)) : 4}px"></span></div>`).join("")}</div>
      <div class="wk-days">${days.map((d) => `<span class="${d.today ? "today" : ""}">${d.today ? "আজ" : d.name}</span>`).join("")}</div>
    </section>`;
  }
  function progressBody(s, parent) {
    const lv = levelOf(s.xp);
    const path = LEVELS.map(([, name], i) => `<div class="lp ${i + 1 < lv.n ? "past" : i + 1 === lv.n ? "now" : ""}"><span>${bnNum(i + 1)}</span>${name}</div>`).join("");
    const testsDone = Object.keys(s.tests).length;
    const hard = parent ? [] : hardWords(s);
    return `
      <section class="card lv-big">
        <div class="lv-row"><span class="lv-badge">${bnNum(lv.n)}</span>
          <div class="lv-txt"><div class="lv-n">লেভেল ${bnNum(lv.n)} · ${lv.name}</div>
          <div class="lv-k">${bnNum(s.xp)}${lv.to ? ` / ${bnNum(lv.to)} XP · আর ${bnNum(lv.to - s.xp)} XP হলে ${lv.nextName}` : " XP · সর্বোচ্চ লেভেল!"}</div></div></div>
        ${bar(lv.pct, "amber")}
        <div class="lv-path">${path}</div>
      </section>
      ${weekHtml(s)}
      <div class="stats four">
        <div class="stat"><span class="n">${bnNum(wordCountOf(s))}</span><span class="l">শব্দ</span></div>
        <div class="stat"><span class="n">${bnNum(doneCountOf(s))}/${bnNum(LESSONS.length)}</span><span class="l">পাঠ</span></div>
        <div class="stat"><span class="n">${bnNum(testsDone)}/${bnNum(UNITS.length)}</span><span class="l">টেস্ট</span></div>
        <div class="stat"><span class="n">${bnNum(liveStreak(s))}</span><span class="l">দিন টানা</span></div>
      </div>
      <h2 class="section-title">${ic("star")}${parent ? "ব্যাজ" : "আমার ব্যাজ"} · ${bnNum(s.badges.length)}/${bnNum(BADGES.length)}</h2>
      <div class="badges">${BADGES.map((b) => { const on = s.badges.includes(b.id); return `<div class="badge ${on ? "" : "locked"}"><span class="bdg ${on ? b.c : ""}">${ic(on ? b.icon : "lock")}</span>${b.name}</div>`; }).join("")}</div>
      ${hard.length ? `<section class="card hard">
        <h2>এই শব্দগুলো একটু কঠিন লাগছে</h2>
        <div class="hard-words">${hard.map((en) => `<button class="hw en" data-say="${esc(en)}">${esc(en)}</button>`).join("")}</div>
        <a class="btn soft" href="#/review/hard">${ic("target")}এগুলো অনুশীলন করো · ২ মিনিট</a>
      </section>` : ""}`;
  }
  function renderProgress() {
    app.innerHTML = shell("progress", `
      <div class="hello"><h1>আমার অগ্রগতি</h1><p>তুমি দারুণ এগোচ্ছ, <span class="en">${NAME}</span>!</p></div>
      <div class="stack" style="margin-top:14px">${progressBody(state, false)}</div>`);
  }
  async function renderParent(code) {
    const want = location.hash;
    app.innerHTML = `<main class="wrap page">${empty("refresh", "লোড হচ্ছে...", "একটু অপেক্ষা করো।", "")}</main>`;
    let raw;
    try { raw = await fetchCode(code); } catch (e) { raw = undefined; }
    if (location.hash !== want) return;
    if (!raw) {
      app.innerHTML = `<main class="wrap page">${empty("cloud-off", raw === null ? "এই কোড পাওয়া যায়নি" : "ইন্টারনেট নেই", raw === null ? "লিংকটা আবার দেখো।" : "পরে আবার চেষ্টা করো।", `<a class="btn ghost" href="#/">${ic("home")}অ্যাপ খোলো</a>`)}</main>`;
      return;
    }
    const s = migrate(raw);
    const ago = s.lastDay ? daysAgo(s.lastDay) : null;
    const last = ago === null ? "এখনো শুরু করেনি" : ago === 0 ? "আজ পড়েছে" : ago === 1 ? "গতকাল পড়েছে" : `${bnNum(ago)} দিন আগে পড়েছে`;
    const lessons = LESSONS.filter((l) => s.done[l.id]).map((l) => { const d = s.done[l.id]; return `<div class="witem"><span class="txt"><span class="w en">${esc(l.title)}</span><span class="m">পাঠ ${bnNum(l.id)} · সঠিক ${bnNum(d.best || d.right || 0)}/${bnNum(d.total || 0)}</span></span>${ic("check", "vol")}</div>`; }).join("");
    const tests = Object.entries(s.tests).map(([u, t]) => `<div class="witem"><span class="txt"><span class="w">টেস্ট ${bnNum(u)}</span><span class="m">সেরা ${bnNum(Math.round(t.best * 10))}/১০ · শেষবার ${bnNum(Math.round(t.last * 10))}/১০</span></span>${starsHtml(stars(t.best))}</div>`).join("");
    app.innerHTML = `
      <header class="topbar"><div class="wrap">
        <a class="brand" href="#/"><span class="logo en">Aa</span><span class="en">${NAME} <b>English</b></span></a>
        <span class="chip-sync saved">${ic("eye")}<span>শুধু দেখা</span></span>
      </div></header>
      <main class="wrap page parent">
        <div class="hello"><h1><span class="en">${NAME}</span>-এর অগ্রগতি</h1><p>${last} · মোট ${bnNum(s.xp)} XP</p></div>
        <div class="stack" style="margin-top:14px">${progressBody(s, true)}</div>
        ${lessons ? `<h2 class="section-title">${ic("book")}শেষ করা পাঠ</h2><div class="wlist">${lessons}</div>` : ""}
        ${tests ? `<h2 class="section-title">${ic("trophy")}টেস্ট</h2><div class="wlist">${tests}</div>` : ""}
      </main>`;
  }

  /* ---------------- save progress page ---------------- */
  function renderSync() {
    const when = sync.at ? new Date(sync.at) : null;
    const whenTxt = when ? `${dayStr(when) === dayStr() ? "আজ" : when.toLocaleDateString("bn-BD", { day: "numeric", month: "long" })} ${when.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" })}` : "";
    const status = !sync.code
      ? `<section class="card sync-status idle">${ic("cloud-check")}<div><b>এখনো অনলাইনে সেভ হয়নি</b><small>প্রথম পাঠ শুরু করলে নিজে নিজেই সেভ হবে।</small></div></section>
         <button class="btn primary" data-act="sync-now">${ic("cloud-check")}এখনই সেভ করো</button>`
      : syncState === "offline"
      ? `<section class="card sync-status offline">${ic("cloud-off")}<div><b>এখন অফলাইন</b><small>ইন্টারনেট এলে নিজে নিজেই সেভ হবে।${whenTxt ? ` শেষ সেভ: ${whenTxt}` : ""}</small></div></section>`
      : `<section class="card sync-status saved">${ic("cloud-check")}<div><b>${syncState === "saving" ? "সেভ হচ্ছে..." : "অনলাইনে সেভ আছে"}</b><small>${whenTxt ? `শেষ সেভ: ${whenTxt}` : ""}</small></div></section>`;
    const codeCard = sync.code ? `
      <section class="card code-card">
        <div class="cc-head"><h2>তোমার কোড</h2><span class="warn">${ic("lock")}কাউকে দিও না</span></div>
        <div class="code-box"><span class="code en">${sync.code}</span><button class="icon-btn" data-act="copy-code" aria-label="কোড কপি করো">${ic("copy")}</button></div>
        <p>নতুন ফোনে এই কোড দিলে সব অগ্রগতি ফিরে আসবে। কোডটা খাতায় লিখে রাখো।</p>
      </section>
      <button class="card link-row" data-act="share-link">${tile("users", 3)}<span class="lr-txt"><b>অভিভাবকের লিংক</b><small>বাবা/মা শুধু অগ্রগতি দেখতে পারবে। ট্যাপ করে কপি করো।</small></span>${ic("link", "go")}</button>` : "";
    app.innerHTML = shell("progress", `
      <div class="back-row"><a class="icon-btn" href="#/progress" aria-label="পেছনে যাও">${ic("arrow-left")}</a><h1>অগ্রগতি সেভ</h1></div>
      <div class="stack">
        ${status}
        ${codeCard}
        <section class="card restore">
          <h2>অন্য ফোন থেকে আনো</h2>
          <label for="code-in">আগের ফোনের ৬ সংখ্যার কোড লেখো</label>
          <input id="code-in" class="code-in en" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" placeholder="১২৩৪৫৬">
          <button class="btn primary" data-act="restore">${ic("refresh")}অগ্রগতি ফিরিয়ে আনো</button>
        </section>
        <div class="hint">${ic("bulb")}<span>ইন্টারনেট না থাকলেও পড়া যাবে। ইন্টারনেট এলে নিজে নিজেই সেভ হবে।</span></div>
      </div>`);
  }
  async function copyText(text, okMsg) {
    try { await navigator.clipboard.writeText(text); toast(okMsg); }
    catch (e) { prompt("কপি করো:", text); }
  }

  /* ---------------- words page ---------------- */
  function renderWords() {
    const learned = LESSONS.filter((l) => isDone(l.id));
    if (!learned.length) {
      app.innerHTML = shell("words", empty("notebook", "শব্দভাণ্ডার এখনো খালি", "প্রথম পাঠ শেষ করলে শেখা শব্দগুলো এখানে জমা হবে।", `<a class="btn primary" href="#/">${ic("f-player-play")}পাঠ শুরু করো</a>`));
      return;
    }
    const groups = learned.map((l) => `
      <h2 class="section-title">${ic(l.icon)}<span>পাঠ ${bnNum(l.id)} · <span class="en">${esc(l.title)}</span></span></h2>
      <div class="wlist">${l.words.map((w, i) => `<button class="witem" data-say="${esc(w.en)}">${tile(w.icon, i)}<span class="txt"><span class="w en">${esc(w.en)}</span><span class="m">${esc(w.bn)} · ${esc(w.say)}</span></span>${ic("volume", "vol")}</button>`).join("")}</div>`).join("");
    const sents = state.sentences.length ? `
      <h2 class="section-title">${ic("pencil")}<span>আমার লেখা বাক্য</span></h2>
      <div class="wlist">${state.sentences.slice(0, 20).map((s) => `<button class="witem" data-say="${esc(s.text)}"><span class="txt"><span class="w en my">${esc(s.text)}</span><span class="m">পাঠ ${bnNum(s.lesson)}</span></span>${ic("volume", "vol")}</button>`).join("")}</div>` : "";
    app.innerHTML = shell("words", `
      <div class="hello"><h1 class="en">My Words</h1><p>তুমি এ পর্যন্ত ${bnNum(wordCountOf(state))}টা শব্দ শিখেছ। শব্দে ট্যাপ করে শোনো।</p></div>
      ${groups}${sents}
      <button class="link-danger" data-act="reset">সব অগ্রগতি মুছে নতুন করে শুরু করো</button>`);
  }

  /* ---------------- events & routing ---------------- */
  document.addEventListener("click", (e) => {
    const sayEl = e.target.closest("[data-say]");
    if (sayEl) { const b = sayEl.classList.contains("speak") ? sayEl : sayEl.querySelector(".speak, .chk, .vol"); speak(sayEl.dataset.say, b); }
    const go = e.target.closest("[data-go]");
    if (go) { location.hash = `#/lesson/${go.dataset.go}`; return; }
    const tst = e.target.closest("[data-test]");
    if (tst) { location.hash = `#/test/${tst.dataset.test}`; return; }
    const act = e.target.closest("[data-act]");
    if (!act || act.disabled) return;
    const a = act.dataset.act;
    if (a === "next") next();
    else if (a === "slow") {
      state.slow = !state.slow; save();
      document.querySelectorAll('[data-act="slow"]').forEach((b) => { b.setAttribute("aria-pressed", state.slow); b.querySelector("span").textContent = state.slow ? "ধীরে: চালু" : "ধীরে"; });
      toast(state.slow ? "এখন ধীরে ধীরে বলবে" : "স্বাভাবিক গতিতে বলবে");
    }
    else if (a === "quit") { stopSpeech(); location.hash = "#/"; }
    else if (a === "hide-howto") { state.hideHowto = true; save(); renderHome(); }
    else if (a === "play-story") playStory(act);
    else if (a === "all-bn") { const ls = app.querySelectorAll(".sline"); const open = [...ls].every((l) => l.classList.contains("open")); ls.forEach((l) => l.classList.toggle("open", !open)); act.innerHTML = `${ic(open ? "eye" : "eye-off")}<span>${open ? "সব বাংলা দেখাও" : "বাংলা লুকাও"}</span>`; }
    else if (a === "hint") useHint(act);
    else if (a === "say-slow") speak(act.dataset.text, app.querySelector(".excard .speak"), 0.55);
    else if (a === "mic") useMic(act);
    else if (a === "said") spokeOk("শাবাশ! এভাবেই জোরে বলো।");
    else if (a === "retest") startTest(P.unit);
    else if (a === "unfold") { openUnits.add(+act.dataset.u); renderHome(); }
    else if (a === "fold") { openUnits.delete(+act.dataset.u); renderHome(); }
    else if (a === "sync-now") pushNow();
    else if (a === "copy-code") copyText(sync.code, "কোড কপি হয়েছে");
    else if (a === "share-link") copyText(`${location.origin}/#/parent/${sync.code}`, "অভিভাবকের লিংক কপি হয়েছে");
    else if (a === "restore") restore(app.querySelector("#code-in").value.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d)).replace(/\D/g, ""));
    else if (a === "reset") {
      if (confirm("সত্যিই সব অগ্রগতি মুছে ফেলবে?")) { state = migrate(null); save(); pushNow(); location.hash = "#/"; renderHome(); }
    }
  });

  function route() {
    const h = location.hash || "#/";
    let m;
    stopSpeech();
    document.querySelectorAll(".confetti").forEach((c) => c.remove());
    if ((m = h.match(/^#\/lesson\/(\d+)/))) startLesson(+m[1]);
    else if ((m = h.match(/^#\/test\/(\d+)/))) startTest(+m[1]);
    else if ((m = h.match(/^#\/review(?:\/(hard|practice))?/))) startReview(m[1] || "due");
    else if (h.startsWith("#/progress")) renderProgress();
    else if (h.startsWith("#/sync")) renderSync();
    else if (h.startsWith("#/words")) renderWords();
    else if ((m = h.match(/^#\/parent\/(\d{6})/))) renderParent(m[1]);
    else renderHome();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  window.addEventListener("online", () => { if (!sync.code || state.updatedAt > sync.at) pushNow(); else setSync("saved"); });
  window.addEventListener("offline", () => setSync("offline"));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && state.updatedAt > sync.at) pushNow(); });
  if ("serviceWorker" in navigator && window.isSecureContext) navigator.serviceWorker.register("/sw.js").catch(() => { /* offline mode is optional */ });
  route();
  if (!/^#\/parent\//.test(location.hash)) pullOnStart();
})();
