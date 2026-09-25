(() => {
  "use strict";
  const NAME = "Sizan";
  const FREE_LESSONS = 3;
  const LESSONS = window.LESSONS;
  const ic = window.ic;
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");

  /* ---------------- helpers ---------------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const bnNum = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clean = (s) => s.toLowerCase().replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ").trim();
  const tokens = (s) => s.replace(/[.!?,]/g, "").split(/\s+/).filter(Boolean);
  const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return dayStr(d); };
  const TILE = ["t1", "t2", "t3", "t4", "t5", "t6"];
  const tile = (icon, i, size = "") => `<span class="tile-ic ${TILE[i % TILE.length]} ${size}" aria-hidden="true">${ic(icon)}</span>`;
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

  /* ---------------- storage ---------------- */
  const KEY = "sizan-english-v1";
  const defaults = { done: {}, streak: 0, lastDay: null, words: {}, sentences: [], slow: false, hideHowto: false, dailyLock: true };
  let state;
  try { state = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { state = Object.assign({}, defaults); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: progress lives for this visit only */ } }

  const isDone = (id) => !!state.done[id];
  const firstDay = (id) => state.done[id] && (state.done[id].first || state.done[id].day);
  const newToday = () => LESSONS.filter((l) => firstDay(l.id) === dayStr()).length;
  // Lessons 1-3 are always open. After that, a lesson opens the day after the previous one was first finished.
  const gated = (id) => state.dailyLock && id > FREE_LESSONS;
  const unlocked = (id) => isDone(id) || !gated(id) || (isDone(id - 1) && firstDay(id - 1) < dayStr());
  const waitingForTomorrow = (id) => !unlocked(id) && isDone(id - 1);
  const lockMsg = (id) => waitingForTomorrow(id) ? "আজকের পাঠ শেষ। এই পাঠ কাল খুলবে।" : "আগের পাঠ শেষ করলে এটা খুলবে।";
  const currentLesson = () => LESSONS.find((l) => !isDone(l.id)) || null;
  const doneCount = () => LESSONS.filter((l) => isDone(l.id)).length;
  const wordCount = () => Object.keys(state.words).length;
  const liveStreak = () => (!state.lastDay ? 0 : (state.lastDay === dayStr() || state.lastDay === addDays(-1)) ? state.streak : 0);
  const INTERVALS = [0, 1, 3, 7, 14, 30];
  function findWord(en) { for (const l of LESSONS) { const i = l.words.findIndex((x) => x.en === en); if (i > -1) return { ...l.words[i], lesson: l.id, idx: i }; } return {}; }
  function dueWords() {
    const t = dayStr();
    return Object.entries(state.words).filter(([, w]) => w.due <= t).map(([en, w]) => ({ ...findWord(en), box: w.box })).filter((w) => w.en);
  }

  /* ---------------- speech ---------------- */
  let voice = null;
  const canSpeak = "speechSynthesis" in window;
  function pickVoice() {
    if (!canSpeak) return;
    const vs = speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
    voice = vs.find((v) => /en[-_]US/i.test(v.lang) && /Google|Samantha|Aria|Jenny|Natural/i.test(v.name))
      || vs.find((v) => /en[-_](US|GB)/i.test(v.lang)) || vs[0] || null;
  }
  if (canSpeak) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text, btn) {
    if (!canSpeak) { toast("এই ফোনে শব্দ শোনা যাচ্ছে না"); return Promise.resolve(); }
    return new Promise((resolve) => {
      speechSynthesis.cancel();
      document.querySelectorAll(".playing").forEach((b) => b.classList.remove("playing"));
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = voice ? voice.lang : "en-US";
      u.rate = state.slow ? 0.6 : 0.85;
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
  const spk = (text, extra = "") => `<button class="speak ${extra}" data-say="${esc(text)}" aria-label="শোনো">${ic("volume")}</button>`;

  /* ---------------- shell ---------------- */
  const slowBtn = () => `<button class="pill-btn" data-act="slow" aria-pressed="${state.slow}">${ic("walk")}<span>${state.slow ? "ধীরে: চালু" : "ধীরে"}</span></button>`;
  function shell(active, inner) {
    const tab = (id, href, icon, label) => `<a class="tab ${active === id ? "active" : ""}" href="${href}">${ic(icon)}<span>${label}</span></a>`;
    return `
      <header class="topbar"><div class="wrap">
        <a class="brand" href="#/"><img src="icon.svg" alt="" width="32" height="32"><span class="en">${NAME} <b>English</b></span></a>
        <div class="top-actions">${slowBtn()}<button class="icon-btn" data-act="settings" aria-label="সেটিংস">${ic("settings")}</button></div>
      </div></header>
      <main class="wrap page">${inner}</main>
      <nav class="tabs" aria-label="মেনু"><div class="wrap">
        ${tab("home", "#/", "home", "হোম")}${tab("review", "#/review", "refresh", "রিভিউ")}${tab("words", "#/words", "notebook", "শব্দভাণ্ডার")}
      </div></nav>`;
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    const cur = currentLesson();
    const due = dueWords().length;
    const n = newToday();
    const hr = new Date().getHours();
    const greet = hr < 12 ? "শুভ সকাল" : hr < 17 ? "শুভ দুপুর" : "শুভ সন্ধ্যা";
    const sub = cur && waitingForTomorrow(cur.id) ? "আজকের পাঠ শেষ। দারুণ কাজ!" : n ? "খুব ভালো চলছে! চাইলে আরেকটা পাঠ করো।" : "চলো আজকে একটু ইংরেজি শিখি।";
    const howto = state.hideHowto ? "" : `
      <div class="card howto">
        <div class="howto-head"><h3>কিভাবে শিখবে?</h3><button class="icon-btn" data-act="hide-howto" aria-label="বন্ধ করো">${ic("x")}</button></div>
        <ul>
          <li>${ic("calendar", "c1")}<span>দিনে <b>১টা পাঠ</b> (১৫ মিনিট) যথেষ্ট।</span></li>
          <li>${ic("volume", "c2")}<span>প্রতিটা বাক্য শোনো, তারপর <b>জোরে জোরে</b> বলো।</span></li>
          <li>${ic("refresh", "c3")}<span>রিভিউ করলে শব্দ আর ভুলে যাবে না।</span></li>
          <li>${ic("mood-smile", "c4")}<span>ভুল হলে ভয় নেই। ভুল থেকেই শেখা হয়।</span></li>
        </ul>
      </div>`;
    let hero;
    if (!cur) {
      hero = `<div class="card hero"><span class="hero-ic">${ic("trophy")}</span>
        <span class="tag">সব পাঠ শেষ</span><h2 class="en">Great job, ${NAME}!</h2>
        <div class="sub">১২টা পাঠই শেষ। এখন রিভিউ করো, আর যেকোনো পাঠ আবার পড়ো।</div>
        <a class="btn light" href="#/review">${ic("refresh")}রিভিউ করো</a></div>`;
    } else if (waitingForTomorrow(cur.id)) {
      hero = `<div class="card hero rest"><span class="hero-ic">${ic("calendar-check")}</span>
        <span class="tag">আজকের পাঠ শেষ</span><h2>কাল আবার দেখা হবে!</h2>
        <div class="sub">নতুন পাঠ <b class="en">${esc(cur.title)}</b> কাল খুলবে। এখন রিভিউ করে শব্দগুলো পাকা করো।</div>
        <a class="btn light" href="#/review">${ic("refresh")}রিভিউ করো</a></div>`;
    } else {
      hero = `<div class="card hero"><span class="hero-ic">${ic(cur.icon)}</span>
        <span class="tag">${n ? "পরের পাঠ" : "আজকের পাঠ"} · পাঠ ${bnNum(cur.id)}</span>
        <h2 class="en">${esc(cur.title)}</h2><div class="sub">${esc(cur.bn)}</div>
        <div class="meta"><span>${ic("clock")}১৫ মিনিট</span><span>${ic("sparkles")}${bnNum(cur.words.length)}টা নতুন শব্দ</span></div>
        <a class="btn light" href="#/lesson/${cur.id}">${ic("f-player-play")}শুরু করো</a></div>`;
    }
    const reviewCard = due ? `
      <a class="card review-card" href="#/review">${tile("refresh", 2)}
        <span class="rc-txt"><span class="t">রিভিউ বাকি: ${bnNum(due)}টা শব্দ</span><span class="d">২ মিনিটে ঝালিয়ে নাও</span></span>
        ${ic("chevron-right", "go")}</a>` : "";
    const rows = LESSONS.map((l, i) => {
      const d = isDone(l.id), c = cur && cur.id === l.id, u = unlocked(l.id), wait = waitingForTomorrow(l.id);
      const cls = d ? "done" : c && u ? "current" : u ? "open" : "locked";
      const st = d ? `${ic("check")}শেষ` : wait ? `${ic("clock")}কাল` : u ? "শুরু" : ic("lock");
      return `<li><button class="lesson-row ${cls}" data-go="${l.id}" ${u ? "" : 'aria-disabled="true"'}>
        ${tile(l.icon, i)}
        <span class="lr-txt"><span class="ttl en">${esc(l.title)}</span><span class="sub">পাঠ ${bnNum(l.id)} · ${esc(l.bn)}</span></span>
        <span class="state">${st}</span></button></li>`;
    }).join("");
    app.innerHTML = shell("home", `
      <div class="stack">
        <div class="hello"><h1 class="en">Hi ${NAME} ${ic("hand-stop", "wave")}</h1><p>${greet}! ${sub}</p></div>
        ${howto}
        ${hero}
        <div class="stats">
          <div class="stat">${ic("f-flame", "s-flame")}<span class="n">${bnNum(liveStreak())}</span><span class="l">দিন টানা</span></div>
          <div class="stat">${ic("f-star", "s-star")}<span class="n">${bnNum(doneCount())}/${bnNum(LESSONS.length)}</span><span class="l">পাঠ শেষ</span></div>
          <div class="stat">${ic("books", "s-book")}<span class="n">${bnNum(wordCount())}</span><span class="l">শব্দ শিখেছ</span></div>
        </div>
        ${reviewCard}
      </div>
      <h2 class="section-title">${ic("route")}তোমার পথ</h2>
      <ul class="path">${rows}</ul>`);
  }

  /* ---------------- lesson player ---------------- */
  let L = null, steps = [], si = 0, score = { right: 0, total: 0 };

  function makeQuestions(lesson) {
    const q = [];
    shuffle(lesson.words).slice(0, 3).forEach((w, i) => q.push({ kind: i === 1 ? "bn2en" : "en2bn", w, pool: lesson.words }));
    const buildable = shuffle(lesson.examples.filter((e) => { const n = tokens(e.en).length; return n >= 3 && n <= 6; }));
    lesson.fill.forEach((f, i) => { q.push({ kind: "fill", f }); if (buildable[i]) q.push({ kind: "build", e: buildable[i] }); });
    const rest = lesson.examples.filter((e) => !buildable.slice(0, 2).includes(e));
    q.push({ kind: "listen", e: shuffle(rest)[0] || lesson.examples[0], pool: lesson.examples });
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
    if (!unlocked(id)) { toast(lockMsg(id)); location.hash = "#/"; return; }
    score = { right: 0, total: 0 };
    steps = [];
    warmupQuestions(L).forEach((q) => steps.push({ type: "q", q }));
    steps.push({ type: "words" }, { type: "pattern" }, { type: "examples" });
    makeQuestions(L).forEach((q) => steps.push({ type: "q", q }));
    steps.push({ type: "speak" }, { type: "story" }, { type: "write" }, { type: "done" });
    si = 0;
    renderStep();
  }

  const TAGS = {
    words: ["book-2", "নতুন শব্দ"], pattern: ["puzzle", "আজকের নিয়ম"], examples: ["message-2", "উদাহরণ"],
    speak: ["microphone", "জোরে বলো"], story: ["book", "ছোট গল্প"], write: ["pencil", "নিজে লেখো"]
  };
  const tagHtml = (icon, text, cls = "") => `<span class="steptag ${cls}">${ic(icon)}${text}</span>`;

  function frame(inner, foot) {
    const pct = Math.round((si / (steps.length - 1)) * 100);
    app.innerHTML = `
      <div class="lesson">
        <div class="lbar"><div class="wrap">
          <button class="icon-btn close" data-act="quit" aria-label="পাঠ বন্ধ করো">${ic("x")}</button>
          <div class="prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
          ${slowBtn()}
        </div></div>
        <main class="wrap lbody">${inner}</main>
        <footer class="lfoot" id="foot"><div class="wrap">${foot}</div></footer>
      </div>`;
    window.scrollTo(0, 0);
  }
  const nextBtn = (label = "এগিয়ে যাও", dis = false, act = "next") => `<button class="btn primary" data-act="${act}" ${dis ? "disabled" : ""}>${label}${ic("arrow-right")}</button>`;
  function next() { stopSpeech(); si = Math.min(si + 1, steps.length - 1); renderStep(); }
  function renderStep() {
    const st = steps[si];
    ({ words: stepWords, pattern: stepPattern, examples: stepExamples, q: stepQ, speak: stepSpeak, story: stepStory, write: stepWrite, done: stepDone })[st.type](st);
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
    frame(`${tagHtml(...TAGS.words)}
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
    frame(`${tagHtml(...TAGS.pattern)}
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

  function sentList(list, hl) {
    return list.map((e, i) => `<button class="sent" data-say="${esc(e.en)}"><span class="num">${bnNum(i + 1)}</span><span class="txt"><span class="se en">${highlight(e.en, hl)}</span><span class="sb">${esc(e.bn)}</span></span><span class="speak sm" aria-hidden="true">${ic("volume")}</span></button>`).join("");
  }
  function stepExamples() {
    frame(`${tagHtml(...TAGS.examples)}
      <h2 class="step-title">ছাঁচটা কাজে লাগাই</h2>
      <p class="step-help">রঙিন শব্দগুলো খেয়াল করো। প্রতিটা বাক্যে ট্যাপ করে শোনো, তারপর জোরে পড়ো।</p>
      <div class="sent-list">${sentList(L.examples, L.hl)}</div>`, nextBtn());
  }

  /* ----- questions ----- */
  function stepQ(st) {
    const q = st.q;
    const same = (s) => s.type === "q" && !s.isRetry && !!s.q.warm === !!q.warm;
    const qIdx = steps.slice(0, si + 1).filter(same).length, qTot = steps.filter(same).length;
    const tag = st.isRetry ? tagHtml("rotate-clockwise", "আরেকবার চেষ্টা", "amber")
      : q.warm ? tagHtml("refresh", `ওয়ার্ম-আপ ${bnNum(qIdx)}/${bnNum(qTot)}`, "amber") : tagHtml("target", `অনুশীলন ${bnNum(qIdx)}/${bnNum(qTot)}`);
    if (q.kind === "build") return stepBuild(st, tag);
    let body = "", opts = [], answer = "", optLang = "bn", sayText = "";
    const wi = q.w ? findWord(q.w.en).idx || 0 : 0;
    if (q.kind === "en2bn") {
      answer = q.w.bn; sayText = q.w.en;
      opts = shuffle([q.w.bn, ...shuffle(q.pool.filter((w) => w.bn !== q.w.bn)).slice(0, 3).map((w) => w.bn)]);
      body = `<h2 class="q-title">${q.warm ? "আগের শেখা শব্দ! " : ""}এই শব্দের মানে কী?</h2>
        <div class="card qcard">${tile(q.w.icon, wi, "xl")}<div class="qe en">${esc(q.w.en)}</div>${spk(q.w.en)}</div>`;
    } else if (q.kind === "bn2en") {
      answer = q.w.en; optLang = "en";
      opts = shuffle([q.w.en, ...shuffle(q.pool.filter((w) => w.en !== q.w.en)).slice(0, 3).map((w) => w.en)]);
      body = `<h2 class="q-title">ইংরেজিতে কী হবে?</h2><div class="card qcard">${tile(q.w.icon, wi, "xl")}<div class="qb">${esc(q.w.bn)}</div></div>`;
    } else if (q.kind === "fill") {
      answer = q.f.a; optLang = "en"; opts = shuffle(q.f.opts);
      const s = esc(q.f.q).replace("___", '<span class="blank">?</span>');
      body = `<h2 class="q-title">খালি জায়গায় কোনটা বসবে?</h2><div class="card qcard"><div class="qe en sm">${s}</div><div class="qsub">${esc(q.f.bn)}</div></div>`;
    } else if (q.kind === "listen") {
      answer = q.e.en; optLang = "en"; sayText = q.e.en;
      opts = shuffle([q.e.en, ...shuffle(q.pool.filter((e) => e.en !== q.e.en)).slice(0, 2).map((e) => e.en)]);
      body = `<h2 class="q-title">মন দিয়ে শোনো। কোন বাক্যটা শুনলে?</h2>
        <div class="card qcard">${spk(q.e.en, "xl")}<div class="qsub">আবার শুনতে ট্যাপ করো</div></div>`;
    }
    frame(`${tag}${body}<div class="opts">${opts.map((o) => `<button class="opt ${optLang}" data-opt="${esc(o)}">${esc(o)}</button>`).join("")}</div>`,
      nextBtn("উত্তর বাছো", true));
    if (sayText) setTimeout(() => speak(sayText, app.querySelector(".qcard .speak")), 350);
    app.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
      const ok = b.dataset.opt === answer;
      app.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (x.dataset.opt === answer) x.classList.add("correct"); });
      if (!ok) b.classList.add("wrong");
      feedback(ok, answer, q, st);
    }));
  }

  function stepBuild(st, tag) {
    const q = st.q, target = tokens(q.e.en);
    const bank = shuffle(target.map((t, i) => ({ t, i })));
    frame(`${tag}<h2 class="q-title">বাংলা বাক্যটা ইংরেজিতে সাজাও</h2>
      <div class="card qcard"><div class="qb">${esc(q.e.bn)}</div></div>
      <div class="answer-zone" id="zone"></div>
      <div class="tiles" id="bank">${bank.map((b) => `<button class="tile en" data-i="${b.i}">${esc(b.t)}</button>`).join("")}</div>`,
      nextBtn("যাচাই করো", true, "check"));
    const zone = app.querySelector("#zone"), bankEl = app.querySelector("#bank"), check = app.querySelector("[data-act=check]");
    const placed = [];
    const refresh = () => { check.disabled = placed.length !== target.length; };
    bankEl.addEventListener("click", (e) => {
      const t = e.target.closest(".tile"); if (!t || t.classList.contains("used") || zone.dataset.locked) return;
      t.classList.add("used"); placed.push(t);
      const c = document.createElement("button"); c.className = "tile en"; c.textContent = t.textContent;
      c.addEventListener("click", () => { if (zone.dataset.locked) return; placed.splice(placed.indexOf(t), 1); t.classList.remove("used"); c.remove(); refresh(); });
      zone.appendChild(c); refresh();
    });
    check.addEventListener("click", () => {
      zone.dataset.locked = "1";
      const ok = placed.map((p) => p.textContent).join(" ").toLowerCase() === target.join(" ").toLowerCase();
      zone.classList.add(ok ? "ok" : "bad");
      feedback(ok, q.e.en, q, st);
    }, { once: true });
  }

  const PRAISE = ["দারুণ!", "একদম ঠিক!", "খুব ভালো!", "শাবাশ!", "চমৎকার!"];
  function feedback(ok, answer, q, st) {
    if (!st.counted) { st.counted = true; if (!q.warm) { score.total++; if (ok) score.right++; } }
    if (!ok && !st.isRetry && !st.hadRetry && !q.warm) {
      let at = si + 1; while (steps[at] && steps[at].type === "q") at++;
      steps.splice(at, 0, { type: "q", q, isRetry: true, counted: true });
      st.hadRetry = true;
    }
    const foot = document.getElementById("foot");
    foot.className = "lfoot " + (ok ? "good" : "bad");
    foot.querySelector(".wrap").innerHTML = `
      <div class="feedback">${ic(ok ? "f-circle-check" : "f-bulb", "fi")}
        <div><div class="ft">${ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : "প্রায় হয়েছে! সঠিক উত্তর:"}</div>
        ${ok ? "" : `<div class="fa ${/[a-z]/i.test(answer) ? "en" : ""}">${esc(answer)}</div>`}</div></div>
      ${nextBtn(ok ? "পরেরটা" : "বুঝেছি")}`;
    speak(q.kind === "fill" ? q.f.q.replace("___", q.f.a) : q.e ? q.e.en : q.w.en);
  }

  function stepSpeak() {
    const list = shuffle(L.examples).slice(0, 3);
    const cards = list.map((e, i) => `
      <div class="spk">
        <div class="se en">${highlight(e.en, L.hl)}</div><div class="sb">${esc(e.bn)}</div>
        <div class="acts">
          <button class="act" data-say="${esc(e.en)}">${ic("volume")}শোনো</button>
          ${SR ? `<button class="act mic" data-mic="${i}">${ic("microphone")}<span>এবার তুমি বলো</span></button>` : `<button class="act mic" data-said="${i}">${ic("check")}<span>আমি বলেছি</span></button>`}
        </div>
        <div class="res" aria-live="polite"></div>
      </div>`).join("");
    frame(`${tagHtml(...TAGS.speak)}
      <h2 class="step-title">শোনো, তারপর জোরে বলো</h2>
      <p class="step-help">${SR ? "মাইক বাটন চাপো, তারপর বাক্যটা বলো। ফোন শুনে বলে দেবে কেমন হলো।" : "প্রথমে শোনো, তারপর ৩ বার জোরে বলো।"}</p>
      ${cards}`, nextBtn());
    const ok = (box, msg) => { box.classList.add("done"); const r = box.querySelector(".res"); r.className = "res ok"; r.innerHTML = `${ic("f-circle-check")}${msg}`; };
    app.querySelectorAll("[data-said]").forEach((b) => b.addEventListener("click", () => ok(b.closest(".spk"), "শাবাশ!")));
    app.querySelectorAll("[data-mic]").forEach((b) => b.addEventListener("click", async () => {
      const box = b.closest(".spk"), res = box.querySelector(".res"), e = list[+b.dataset.mic];
      stopSpeech();
      b.classList.add("rec"); b.querySelector("span").textContent = "শুনছি... বলো";
      try {
        const alts = await listenOnce();
        if (!alts.length) { res.className = "res try"; res.textContent = "কিছু শুনতে পাইনি। আবার চেষ্টা করো।"; }
        else if (matchScore(e.en, alts) >= 0.7) ok(box, "দারুণ! একদম ঠিক বলেছ।");
        else { res.className = "res try"; res.innerHTML = `প্রায় হয়েছে! আমি শুনলাম: <span class="en">“${esc(alts[0])}”</span>। আবার চেষ্টা করো।`; }
      } catch (err) {
        res.className = "res try";
        res.textContent = err === "not-allowed" ? "মাইক্রোফোনের অনুমতি দাও, অথবা শুধু জোরে বলো।" : "মাইক কাজ করছে না। শুধু জোরে ৩ বার বলো।";
      }
      b.classList.remove("rec"); b.querySelector("span").textContent = "আবার বলো";
    }));
  }

  function stepStory() {
    const s = L.story;
    frame(`${tagHtml(...TAGS.story)}
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
    frame(`${tagHtml(...TAGS.write)}
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
      state.sentences.unshift({ text, lesson: L.id, day: dayStr() }); state.sentences = state.sentences.slice(0, 100); save();
      speak(text);
      const foot = document.getElementById("foot");
      foot.className = "lfoot good";
      foot.querySelector(".wrap").innerHTML = `<div class="feedback">${ic("f-circle-check", "fi")}<div><div class="ft">চমৎকার! তুমি নিজে ইংরেজি লিখলে!</div><div class="fa en">${esc(text)}</div></div></div>${nextBtn("শেষ করো")}`;
    }, { once: true });
  }

  function stepDone() {
    const first = !isDone(L.id), today = dayStr();
    if (state.lastDay !== today) { state.streak = state.lastDay === addDays(-1) ? state.streak + 1 : 1; state.lastDay = today; }
    const prev = state.done[L.id];
    state.done[L.id] = { right: score.right, total: score.total, day: today, first: prev ? (prev.first || prev.day) : today, best: Math.max(score.right, prev ? prev.best || prev.right : 0) };
    L.words.forEach((w) => { if (!state.words[w.en]) state.words[w.en] = { box: 1, due: addDays(1) }; });
    save();
    const pct = score.total ? score.right / score.total : 1;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
    const nextL = LESSONS.find((l) => l.id === L.id + 1);
    let nextMsg = "তুমি সব পাঠ শেষ করেছ!";
    if (nextL) nextMsg = unlocked(nextL.id) ? `পরের পাঠ: <b class="en">${esc(nextL.title)}</b>` : `পরের পাঠ <b class="en">${esc(nextL.title)}</b> কাল খুলবে।`;
    frame(`<div class="done-wrap">
        <div class="stars">${[0, 1, 2].map((i) => ic(i < stars ? "f-star" : "star", i < stars ? "on" : "")).join("")}</div>
        <h2>শাবাশ, <span class="en">${NAME}</span>!</h2>
        <p class="muted">পাঠ ${bnNum(L.id)} শেষ${first ? "" : " (আবার অনুশীলন)"}।</p>
        <div class="stats">
          <div class="stat">${ic("target", "s-target")}<span class="n">${bnNum(score.right)}/${bnNum(score.total)}</span><span class="l">সঠিক উত্তর</span></div>
          <div class="stat">${ic("f-flame", "s-flame")}<span class="n">${bnNum(state.streak)}</span><span class="l">দিন টানা</span></div>
          <div class="stat">${ic("books", "s-book")}<span class="n">${bnNum(wordCount())}</span><span class="l">মোট শব্দ</span></div>
        </div>
        <div class="card learned">
          <div class="lt">আজ তুমি শিখলে</div>
          <div class="lp en">${L.pattern.rows.map((r) => esc(r.en)).join("<br>")}</div>
          <div class="ln">${ic("arrow-right")}<span>${nextMsg}</span></div>
        </div>
      </div>`, `<a class="btn primary" href="#/">${ic("home")}হোমে যাও</a>`);
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

  /* ---------------- review ---------------- */
  let rq = [], ri = 0, rflip = false, rstats = { ok: 0 };
  function startReview() { rq = shuffle(dueWords()).slice(0, 12); ri = 0; rflip = false; rstats = { ok: 0 }; renderReview(); }
  const empty = (icon, title, text, btns) => `<div class="empty">${tile(icon, 0, "xl")}<h2>${title}</h2><p>${text}</p>${btns}</div>`;
  function renderReview() {
    if (!wordCount()) {
      app.innerHTML = shell("review", empty("seedling", "এখনো কোনো শব্দ নেই", "প্রথম পাঠ শেষ করলে এখানে শব্দ আসবে।", `<a class="btn primary" href="#/">${ic("f-player-play")}পাঠ শুরু করো</a>`));
      return;
    }
    if (ri >= rq.length) {
      const msg = rq.length ? `রিভিউ শেষ! মনে ছিল ${bnNum(rstats.ok)}/${bnNum(rq.length)}টা।` : "আজ রিভিউ করার মতো কিছু নেই";
      app.innerHTML = shell("review", empty(rq.length ? "trophy" : "calendar-check", msg, rq.length ? "শব্দগুলো ঠিক সময়ে আবার ফিরে আসবে।" : "কাল আবার এসো। শব্দগুলো সময়মতো ফিরে আসবে।",
        `<div class="row2"><a class="btn ghost" href="#/words">${ic("notebook")}সব শব্দ</a><a class="btn primary" href="#/">${ic("home")}হোম</a></div>`));
      return;
    }
    const w = rq[ri];
    app.innerHTML = shell("review", `
      <div class="stack">
        <div class="rv-top"><span class="steptag">${ic("refresh")}রিভিউ ${bnNum(ri + 1)}/${bnNum(rq.length)}</span></div>
        <div class="prog"><i style="width:${Math.round((ri / rq.length) * 100)}%"></i></div>
        <button class="card flash ${rflip ? "flipped" : ""}" data-act="flip" aria-label="কার্ড উল্টাও">
          ${tile(w.icon, w.idx || 0, "xl")}<span class="w en">${esc(w.en)}</span>
          ${rflip ? `<span class="m">${esc(w.bn)}</span><span class="say">উচ্চারণ: ${esc(w.say)}</span><span class="fx en">${esc(w.ex[0])}</span><span class="fxb">${esc(w.ex[1])}</span>`
                  : `<span class="say">${ic("hand-click")}ট্যাপ করে মানে দেখো</span>`}
        </button>
        ${rflip ? `<div class="row2"><button class="btn ghost" data-act="r-again">${ic("mood-sad")}ভুলে গেছি</button><button class="btn primary" data-act="r-ok">${ic("mood-happy")}মনে ছিল</button></div>`
                : `<button class="btn primary" data-act="flip">${ic("eye")}মানে দেখো</button>`}
      </div>`);
    speak(rflip ? w.ex[0] : w.en);
  }
  function grade(ok) {
    const w = rq[ri], rec = state.words[w.en];
    if (ok) { rec.box = Math.min(rec.box + 1, 5); rec.due = addDays(INTERVALS[rec.box]); rstats.ok++; }
    else { rec.box = 1; rec.due = addDays(1); }
    save(); ri++; rflip = false; renderReview();
  }

  /* ---------------- words page ---------------- */
  function renderWords() {
    const learned = LESSONS.filter((l) => isDone(l.id));
    if (!learned.length) {
      app.innerHTML = shell("words", empty("notebook", "শব্দভাণ্ডার এখনো খালি", "প্রথম পাঠ শেষ করলে শেখা শব্দগুলো এখানে জমা হবে।", `<a class="btn primary" href="#/">${ic("f-player-play")}পাঠ শুরু করো</a>`));
      return;
    }
    const due = dueWords().length;
    const groups = learned.map((l) => `
      <h2 class="section-title">${ic(l.icon)}<span>পাঠ ${bnNum(l.id)} · <span class="en">${esc(l.title)}</span></span></h2>
      <div class="wlist">${l.words.map((w, i) => `<button class="witem" data-say="${esc(w.en)}">${tile(w.icon, i)}<span class="txt"><span class="w en">${esc(w.en)}</span><span class="m">${esc(w.bn)} · ${esc(w.say)}</span></span>${ic("volume", "vol")}</button>`).join("")}</div>`).join("");
    const sents = state.sentences.length ? `
      <h2 class="section-title">${ic("pencil")}<span>আমার লেখা বাক্য</span></h2>
      <div class="wlist">${state.sentences.slice(0, 20).map((s) => `<button class="witem" data-say="${esc(s.text)}"><span class="txt"><span class="w en my">${esc(s.text)}</span><span class="m">পাঠ ${bnNum(s.lesson)}</span></span>${ic("volume", "vol")}</button>`).join("")}</div>` : "";
    app.innerHTML = shell("words", `
      <div class="hello"><h1 class="en">My Words</h1><p>তুমি এ পর্যন্ত ${bnNum(wordCount())}টা শব্দ শিখেছ।</p></div>
      ${due ? `<a class="card review-card" href="#/review" style="margin-top:14px">${tile("refresh", 2)}<span class="rc-txt"><span class="t">রিভিউ বাকি: ${bnNum(due)}টা শব্দ</span><span class="d">এখনই ঝালিয়ে নাও</span></span>${ic("chevron-right", "go")}</a>` : ""}
      ${groups}${sents}
      <button class="link-danger" data-act="reset">সব অগ্রগতি মুছে নতুন করে শুরু করো</button>`);
  }

  /* ---------------- settings ---------------- */
  function openSettings() {
    const dlg = document.createElement("dialog");
    dlg.className = "settings";
    dlg.innerHTML = `
      <div class="howto-head"><h3>সেটিংস</h3><button class="icon-btn" data-close aria-label="বন্ধ করো">${ic("x")}</button></div>
      <label class="set-row"><input type="checkbox" id="dailyLock" ${state.dailyLock ? "checked" : ""}>
        <span><b>প্রতিদিন ১টা করে নতুন পাঠ</b><small>প্রথম ৩টা পাঠ সবসময় খোলা। বন্ধ করলে সব পাঠ খুলে যাবে।</small></span></label>`;
    document.body.appendChild(dlg);
    dlg.querySelector("#dailyLock").addEventListener("change", (e) => { state.dailyLock = e.target.checked; save(); route(); });
    dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
    dlg.addEventListener("close", () => dlg.remove());
    dlg.showModal();
  }

  /* ---------------- events & routing ---------------- */
  document.addEventListener("click", (e) => {
    const sayEl = e.target.closest("[data-say]");
    if (sayEl) { const b = sayEl.classList.contains("speak") ? sayEl : sayEl.querySelector(".speak, .chk, .vol"); speak(sayEl.dataset.say, b); }
    const go = e.target.closest("[data-go]");
    if (go) {
      const id = +go.dataset.go;
      if (unlocked(id)) location.hash = `#/lesson/${id}`;
      else toast(lockMsg(id));
      return;
    }
    const act = e.target.closest("[data-act]");
    if (!act) return;
    const a = act.dataset.act;
    if (a === "next") next();
    else if (a === "slow") {
      state.slow = !state.slow; save();
      document.querySelectorAll('[data-act="slow"]').forEach((b) => { b.setAttribute("aria-pressed", state.slow); b.querySelector("span").textContent = state.slow ? "ধীরে: চালু" : "ধীরে"; });
      toast(state.slow ? "এখন ধীরে ধীরে বলবে" : "স্বাভাবিক গতিতে বলবে");
    }
    else if (a === "quit") { stopSpeech(); location.hash = "#/"; }
    else if (a === "settings") openSettings();
    else if (a === "hide-howto") { state.hideHowto = true; save(); renderHome(); }
    else if (a === "play-story") playStory(act);
    else if (a === "all-bn") { const ls = app.querySelectorAll(".sline"); const open = [...ls].every((l) => l.classList.contains("open")); ls.forEach((l) => l.classList.toggle("open", !open)); act.innerHTML = `${ic(open ? "eye" : "eye-off")}<span>${open ? "সব বাংলা দেখাও" : "বাংলা লুকাও"}</span>`; }
    else if (a === "flip") { rflip = true; renderReview(); }
    else if (a === "r-ok") grade(true);
    else if (a === "r-again") grade(false);
    else if (a === "reset") { if (confirm("সত্যিই সব অগ্রগতি মুছে ফেলবে?")) { state = Object.assign({}, defaults); save(); location.hash = "#/"; renderHome(); } }
  });

  function route() {
    const h = location.hash || "#/";
    const m = h.match(/^#\/lesson\/(\d+)/);
    stopSpeech();
    document.querySelectorAll(".confetti").forEach((c) => c.remove());
    if (m) startLesson(+m[1]);
    else if (h.startsWith("#/review")) startReview();
    else if (h.startsWith("#/words")) renderWords();
    else renderHome();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
