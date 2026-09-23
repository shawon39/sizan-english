(() => {
  "use strict";
  const NAME = "Sizan";
  const LESSONS = window.LESSONS;
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
  let toastTimer;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400); }

  /* ---------------- storage ---------------- */
  const KEY = "sizan-english-v1";
  const defaults = { done: {}, streak: 0, lastDay: null, words: {}, sentences: [], slow: false, hideHowto: false };
  let state;
  try { state = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { state = Object.assign({}, defaults); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: progress lives for this visit only */ } }

  const isDone = (id) => !!state.done[id];
  const unlocked = (id) => id === 1 || isDone(id - 1) || isDone(id);
  const currentLesson = () => LESSONS.find((l) => !isDone(l.id)) || null;
  const doneCount = () => LESSONS.filter((l) => isDone(l.id)).length;
  const wordCount = () => Object.keys(state.words).length;
  function liveStreak() {
    if (!state.lastDay) return 0;
    return (state.lastDay === dayStr() || state.lastDay === addDays(-1)) ? state.streak : 0;
  }
  const INTERVALS = [0, 1, 3, 7, 14, 30];
  function dueWords() {
    const t = dayStr();
    return Object.entries(state.words).filter(([, w]) => w.due <= t).map(([en, w]) => ({ ...findWord(en), box: w.box })).filter((w) => w.en);
  }
  function findWord(en) { for (const l of LESSONS) { const w = l.words.find((x) => x.en === en); if (w) return { ...w, lesson: l.id }; } return {}; }

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
    if (!canSpeak) { toast("এই ফোনে শব্দ শোনা যাচ্ছে না 😕"); return Promise.resolve(); }
    return new Promise((resolve) => {
      speechSynthesis.cancel();
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
    for (const a of alts) { const heard = new Set(clean(a).split(" ")); const hit = want.filter((w) => heard.has(w)).length; best = Math.max(best, hit / want.length); }
    return best;
  }

  /* ---------------- shell ---------------- */
  const slowBtn = () => `<button class="pill-btn" data-act="slow" aria-pressed="${state.slow}" title="ধীরে শোনো">🐢 ${state.slow ? "ধীরে: চালু" : "ধীরে"}</button>`;
  function shell(active, inner) {
    return `
      <header class="topbar"><div class="wrap">
        <a class="brand en" href="#/" style="color:inherit;text-decoration:none"><img src="icon.svg" alt=""><span>${NAME} <b>English</b></span></a>
        ${slowBtn()}
      </div></header>
      <main class="wrap page">${inner}</main>
      <nav class="tabs" aria-label="মেনু"><div class="wrap">
        <a class="tab ${active === "home" ? "active" : ""}" href="#/" style="text-decoration:none"><span class="ico">🏠</span>হোম</a>
        <a class="tab ${active === "review" ? "active" : ""}" href="#/review" style="text-decoration:none"><span class="ico">🔁</span>রিভিউ</a>
        <a class="tab ${active === "words" ? "active" : ""}" href="#/words" style="text-decoration:none"><span class="ico">📒</span>শব্দভাণ্ডার</a>
      </div></nav>`;
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    const cur = currentLesson();
    const due = dueWords().length;
    const hr = new Date().getHours();
    const doneToday = state.lastDay === dayStr();
    const greet = hr < 12 ? "শুভ সকাল" : hr < 17 ? "শুভ দুপুর" : "শুভ সন্ধ্যা";
    const howto = state.hideHowto ? "" : `
      <div class="card howto">
        <button class="x" data-act="hide-howto" aria-label="বন্ধ করো">✕</button>
        <h3>কিভাবে শিখবে? 🌱</h3>
        <ul>
          <li><span>📅</span><span>প্রতিদিন <b>১টা পাঠ</b>। মাত্র ১৫ মিনিট।</span></li>
          <li><span>🔊</span><span>প্রতিটা বাক্য শোনো, তারপর <b>জোরে জোরে</b> বলো।</span></li>
          <li><span>🔁</span><span>রিভিউ করলে শব্দ আর ভুলে যাবে না।</span></li>
          <li><span>😊</span><span>ভুল হলে ভয় নেই। ভুল থেকেই শেখা হয়।</span></li>
        </ul>
      </div>`;
    const hero = cur ? `
      <div class="card hero">
        <span class="big-emoji" aria-hidden="true">${cur.emoji}</span>
        <span class="tag">${doneToday ? `✅ আজকের কাজ শেষ · পরের পাঠ ${bnNum(cur.id)}` : `আজকের পাঠ · পাঠ ${bnNum(cur.id)}`}</span>
        <h2>${esc(cur.title)}</h2>
        <div class="sub">${esc(cur.bn)}</div>
        <div class="meta"><span>⏱ ~১৫ মিনিট</span><span>🆕 ${bnNum(cur.words.length)}টা নতুন শব্দ</span></div>
        <a class="btn" href="#/lesson/${cur.id}" style="text-decoration:none">${doneToday ? "চাইলে এখনই শুরু করো ▶" : "শুরু করো ▶"}</a>
      </div>` : `
      <div class="card hero">
        <span class="big-emoji" aria-hidden="true">🏆</span>
        <span class="tag">সব পাঠ শেষ!</span>
        <h2>Great job, ${NAME}!</h2>
        <div class="sub">১২টা পাঠই শেষ। এখন রিভিউ করো, আর যেকোনো পাঠ আবার পড়ো।</div>
        <a class="btn" href="#/review" style="text-decoration:none">রিভিউ করো 🔁</a>
      </div>`;
    const reviewCard = due ? `
      <a class="card review-card" href="#/review" style="text-decoration:none;color:inherit">
        <span class="ico">🔁</span>
        <span><div class="t">রিভিউ বাকি: ${bnNum(due)}টা শব্দ</div><div class="d">২ মিনিটে ঝালিয়ে নাও</div></span>
        <span class="go">›</span>
      </a>` : "";
    const rows = LESSONS.map((l) => {
      const d = isDone(l.id), c = cur && cur.id === l.id, u = unlocked(l.id);
      const cls = d ? "done" : c ? "current" : u ? "" : "locked";
      const st = d ? "✓ শেষ" : c ? (state.lastDay === dayStr() ? "পরের" : "আজ") : u ? "খোলা" : "🔒";
      return `<li><button class="lesson-row ${cls}" data-go="${l.id}" ${u ? "" : 'aria-disabled="true"'}>
        <span class="num" aria-hidden="true">${l.emoji}</span>
        <span><div class="ttl">${bnNum(l.id)}. ${esc(l.title)}</div><div class="sub">${esc(l.bn)}</div></span>
        <span class="state">${st}</span></button></li>`;
    }).join("");
    app.innerHTML = shell("home", `
      <div class="stack">
        <div class="hello"><h1 class="en">Hi ${NAME} 👋</h1><p>${greet}! ${doneToday ? "আজকের পাঠ শেষ। দারুণ কাজ! 🎉" : "চলো আজকে একটু ইংরেজি শিখি।"}</p></div>
        ${howto}
        ${hero}
        <div class="stats">
          <div class="stat"><div class="n">🔥 ${bnNum(liveStreak())}</div><div class="l">দিন টানা</div></div>
          <div class="stat"><div class="n">⭐ ${bnNum(doneCount())}/${bnNum(LESSONS.length)}</div><div class="l">পাঠ শেষ</div></div>
          <div class="stat"><div class="n">📚 ${bnNum(wordCount())}</div><div class="l">শব্দ শিখেছ</div></div>
        </div>
        ${reviewCard}
      </div>
      <h2 class="section-title">তোমার পথ 🗺️</h2>
      <ul class="path">${rows}</ul>`);
  }

  /* ---------------- lesson player ---------------- */
  let L = null, steps = [], si = 0, score = { right: 0, total: 0 };

  function makeQuestions(lesson) {
    const q = [];
    const ws = shuffle(lesson.words).slice(0, 3);
    ws.forEach((w, i) => q.push({ kind: i === 1 ? "bn2en" : "en2bn", w, pool: lesson.words }));
    const buildable = shuffle(lesson.examples.filter((e) => { const n = tokens(e.en).length; return n >= 3 && n <= 6; }));
    lesson.fill.forEach((f, i) => {
      q.push({ kind: "fill", f });
      if (buildable[i]) q.push({ kind: "build", e: buildable[i] });
    });
    const rest = lesson.examples.filter((e) => !buildable.slice(0, 2).includes(e));
    const le = shuffle(rest)[0] || lesson.examples[0];
    q.push({ kind: "listen", e: le, pool: lesson.examples });
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
    if (!L || !unlocked(id)) { location.hash = "#/"; return; }
    score = { right: 0, total: 0 };
    steps = [];
    warmupQuestions(L).forEach((q) => steps.push({ type: "q", q }));
    steps.push({ type: "words" }, { type: "pattern" }, { type: "examples" });
    makeQuestions(L).forEach((q) => steps.push({ type: "q", q }));
    steps.push({ type: "speak" }, { type: "story" }, { type: "write" }, { type: "done" });
    si = 0;
    renderStep();
  }

  const TAGS = { words: "📘 নতুন শব্দ", pattern: "🧩 আজকের নিয়ম", examples: "💬 উদাহরণ", speak: "🗣️ জোরে বলো", story: "📖 ছোট গল্প", write: "✍️ নিজে লেখো" };

  function frame(inner, foot) {
    const pct = Math.round((si / (steps.length - 1)) * 100);
    app.innerHTML = `
      <div class="lesson">
        <div class="lbar"><div class="wrap">
          <button class="close" data-act="quit" aria-label="পাঠ বন্ধ করো">✕</button>
          <div class="prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
          ${slowBtn()}
        </div></div>
        <main class="wrap lbody">${inner}</main>
        <footer class="lfoot" id="foot"><div class="wrap">${foot}</div></footer>
      </div>`;
    window.scrollTo(0, 0);
  }
  const nextBtn = (label = "এগিয়ে যাও →", dis = false) => `<button class="btn primary" data-act="next" ${dis ? "disabled" : ""}>${label}</button>`;
  function next() { if (canSpeak) speechSynthesis.cancel(); si = Math.min(si + 1, steps.length - 1); renderStep(); }

  function renderStep() {
    const st = steps[si];
    ({ words: stepWords, pattern: stepPattern, examples: stepExamples, q: stepQ, speak: stepSpeak, story: stepStory, write: stepWrite, done: stepDone })[st.type](st);
  }

  function stepWords() {
    const cards = L.words.map((w, i) => `
      <button class="wcard" data-say="${esc(w.en)}" data-i="${i}">
        <span class="chk" aria-hidden="true"></span>
        <div class="em" aria-hidden="true">${w.emoji}</div>
        <div class="w">${esc(w.en)}</div>
        <div class="say">উচ্চারণ: ${esc(w.say)}</div>
        <div class="m">${esc(w.bn)}</div>
      </button>`).join("");
    frame(`<span class="steptag">${TAGS.words}</span>
      <h2 class="step-title">আজকের ${bnNum(L.words.length)}টা শব্দ</h2>
      <p class="step-help">প্রতিটা কার্ডে ট্যাপ করো। শোনো, তারপর নিজে একবার বলো। 🔊</p>
      <div class="word-grid">${cards}</div>`, nextBtn());
    app.querySelectorAll(".wcard").forEach((c) => c.addEventListener("click", () => { c.classList.add("heard"); c.querySelector(".chk").textContent = "✓"; }));
  }

  function chips(arr, lang) { return arr.map(([t, r]) => `<span class="chip ${r} ${lang}">${esc(t)}</span>`).join(" "); }
  function stepPattern() {
    const p = L.pattern;
    const roles = new Set([...p.compare.bn, ...p.compare.en].map((x) => x[1]));
    const legend = [["s", "কে"], ["v", "কাজ / হওয়া"], ["o", "কী / কেমন"], ["q", "প্রশ্ন"]].filter(([r]) => roles.has(r))
      .map(([r, t]) => `<span><i style="background:var(--${r})"></i>${t}</span>`).join("");
    const rows = p.rows.map((r) => `<div class="frow"><span class="fe">${esc(r.en)}</span><span class="fb">${esc(r.bn)}</span></div>`).join("");
    frame(`<span class="steptag">${TAGS.pattern}</span>
      <h2 class="step-title">বাক্য বানানোর ছাঁচ</h2>
      <p class="step-help">মুখস্থ না, শুধু ছাঁচটা দেখো। খালি জায়গায় শব্দ বদলালেই নতুন বাক্য!</p>
      <div class="formula">${rows}</div>
      <div class="card compare">
        <div class="cmp-row"><span class="cmp-lbl">বাংলা</span>${chips(p.compare.bn, "bn")}</div>
        <div class="cmp-arrow" aria-hidden="true">⬇</div>
        <div class="cmp-row"><span class="cmp-lbl">English</span>${chips(p.compare.en, "en")}
          <button class="speak" data-say="${esc(p.compare.en.map((x) => x[0]).join(" "))}" aria-label="শোনো">🔊</button></div>
        <div class="legend">${legend}</div>
        <ul class="points">${p.points.map((t) => `<li><span>${t}</span></li>`).join("")}</ul>
      </div>`, nextBtn());
  }

  function sentList(list) {
    return list.map((e) => `<button class="sent" data-say="${esc(e.en)}"><span class="txt"><div class="se">${esc(e.en)}</div><div class="sb">${esc(e.bn)}</div></span><span class="speak" aria-hidden="true">🔊</span></button>`).join("");
  }
  function stepExamples() {
    frame(`<span class="steptag">${TAGS.examples}</span>
      <h2 class="step-title">ছাঁচটা কাজে লাগাই</h2>
      <p class="step-help">প্রতিটা বাক্যে ট্যাপ করে শোনো। তারপর জোরে পড়ো।</p>
      ${sentList(L.examples)}`, nextBtn());
  }

  /* ----- questions ----- */
  function stepQ(st) {
    const q = st.q;
    const same = (s) => s.type === "q" && !s.retried && !!s.q.warm === !!q.warm;
    const qIdx = steps.slice(0, si + 1).filter(same).length;
    const qTot = steps.filter(same).length;
    const tag = st.retried ? "🔄 আরেকবার চেষ্টা" : q.warm ? `🔁 ওয়ার্ম-আপ ${bnNum(qIdx)}/${bnNum(qTot)}` : `🎯 অনুশীলন ${bnNum(qIdx)}/${bnNum(qTot)}`;
    let body = "", opts = [], answer = "", optLang = "bn", sayText = "";
    if (q.kind === "en2bn") {
      answer = q.w.bn; optLang = "bn"; sayText = q.w.en;
      opts = shuffle([q.w.bn, ...shuffle(q.pool.filter((w) => w.bn !== q.w.bn)).slice(0, 3).map((w) => w.bn)]);
      body = `<p class="step-help">${q.warm ? "আগের শেখা শব্দ! " : ""}এই শব্দের মানে কী?</p>
        <div class="card qcard"><div class="qem">${q.w.emoji}</div><div class="qe">${esc(q.w.en)}</div>
        <div style="margin-top:10px;display:flex;justify-content:center"><button class="speak" data-say="${esc(q.w.en)}" aria-label="শোনো">🔊</button></div></div>`;
    } else if (q.kind === "bn2en") {
      answer = q.w.en; optLang = "en";
      opts = shuffle([q.w.en, ...shuffle(q.pool.filter((w) => w.en !== q.w.en)).slice(0, 3).map((w) => w.en)]);
      body = `<p class="step-help">ইংরেজিতে কী হবে?</p><div class="card qcard"><div class="qem">${q.w.emoji}</div><div class="qb">${esc(q.w.bn)}</div></div>`;
    } else if (q.kind === "fill") {
      answer = q.f.a; optLang = "en";
      opts = shuffle(q.f.opts);
      const s = esc(q.f.q).replace("___", '<span class="blank">&nbsp;?&nbsp;</span>');
      body = `<p class="step-help">খালি জায়গায় কোনটা বসবে?</p><div class="card qcard"><div class="qe" style="font-size:27px">${s}</div><div class="qsub">${esc(q.f.bn)}</div></div>`;
    } else if (q.kind === "listen") {
      answer = q.e.en; optLang = "en";
      opts = shuffle([q.e.en, ...shuffle(q.pool.filter((e) => e.en !== q.e.en)).slice(0, 2).map((e) => e.en)]);
      body = `<p class="step-help">মন দিয়ে শোনো। কোন বাক্যটা শুনলে?</p>
        <div class="card qcard"><div style="display:flex;justify-content:center"><button class="speak lg" data-say="${esc(q.e.en)}" aria-label="আবার শোনো">🔊</button></div>
        <div class="qsub">শুনতে ট্যাপ করো</div></div>`;
      sayText = q.e.en;
    } else if (q.kind === "build") {
      return stepBuild(st, tag);
    }
    frame(`<span class="steptag">${tag}</span>${body}
      <div class="opts">${opts.map((o) => `<button class="opt ${optLang}" data-opt="${esc(o)}">${esc(o)}</button>`).join("")}</div>`,
      nextBtn("উত্তর বাছো", true));
    if (sayText) setTimeout(() => speak(sayText, app.querySelector(".speak")), 350);
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
    frame(`<span class="steptag">${tag}</span>
      <p class="step-help">বাংলা বাক্যটা ইংরেজিতে সাজাও।</p>
      <div class="card qcard"><div class="qb">${esc(q.e.bn)}</div></div>
      <div class="answer-zone" id="zone"></div>
      <div class="tiles" id="bank">${bank.map((b) => `<button class="tile" data-i="${b.i}">${esc(b.t)}</button>`).join("")}</div>`,
      nextBtn("যাচাই করো", true));
    const zone = app.querySelector("#zone"), bankEl = app.querySelector("#bank"), check = app.querySelector("[data-act=next]");
    check.dataset.act = "check";
    const placed = [];
    const refresh = () => { check.disabled = placed.length !== target.length; };
    bankEl.addEventListener("click", (e) => {
      const t = e.target.closest(".tile"); if (!t || t.classList.contains("used")) return;
      t.classList.add("used"); placed.push(t);
      const c = document.createElement("button"); c.className = "tile"; c.textContent = t.textContent; c.dataset.i = t.dataset.i;
      c.addEventListener("click", () => { if (zone.dataset.locked) return; placed.splice(placed.indexOf(t), 1); t.classList.remove("used"); c.remove(); refresh(); });
      zone.appendChild(c); refresh();
    });
    check.addEventListener("click", () => {
      zone.dataset.locked = "1";
      const built = placed.map((p) => p.textContent).join(" ");
      const ok = built.toLowerCase() === target.join(" ").toLowerCase();
      feedback(ok, q.e.en, q, st);
    }, { once: true });
  }

  const PRAISE = ["দারুণ!", "একদম ঠিক!", "খুব ভালো!", "শাবাশ!", "চমৎকার!"];
  function feedback(ok, answer, q, st) {
    if (!st.counted) { st.counted = true; if (!q.warm) { score.total++; if (ok) score.right++; } }
    if (!ok && !st.retried && !q.warm) {
      // ask it once more at the end of the practice block
      let insertAt = si + 1; while (steps[insertAt] && steps[insertAt].type === "q") insertAt++;
      steps.splice(insertAt, 0, { type: "q", q, retried: true, counted: true });
      st.retried = true;
    }
    const foot = document.getElementById("foot");
    foot.className = "lfoot " + (ok ? "good" : "bad");
    foot.querySelector(".wrap").innerHTML = `
      <div class="feedback"><span class="fi">${ok ? "✅" : "💡"}</span>
        <div><div class="ft">${ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : "প্রায় হয়েছে! সঠিক উত্তর:"}</div>
        ${ok ? "" : `<div class="fa en" style="font-weight:800">${esc(answer)}</div>`}</div></div>
      ${nextBtn(ok ? "পরেরটা →" : "বুঝেছি →")}`;
    const say = q.kind === "fill" ? q.f.q.replace("___", q.f.a) : q.e ? q.e.en : q.w.en;
    speak(say);
  }

  function stepSpeak() {
    const list = shuffle(L.examples).slice(0, 3);
    const cards = list.map((e, i) => `
      <div class="spk" data-i="${i}">
        <div class="se">${esc(e.en)}</div><div class="sb">${esc(e.bn)}</div>
        <div class="acts">
          <button data-say="${esc(e.en)}">🔊 শোনো</button>
          ${SR ? `<button class="mic" data-mic="${i}">🎤 এবার তুমি বলো</button>` : `<button class="mic" data-said="${i}">✅ আমি বলেছি</button>`}
        </div>
        <div class="res" aria-live="polite"></div>
      </div>`).join("");
    frame(`<span class="steptag">${TAGS.speak}</span>
      <h2 class="step-title">শোনো, তারপর জোরে বলো</h2>
      <p class="step-help">${SR ? "🎤 চাপো, তারপর বাক্যটা বলো। ফোন শুনে বলে দেবে কেমন হলো।" : "প্রথমে শোনো, তারপর ৩ বার জোরে বলো।"}</p>
      ${cards}`, nextBtn());
    app.querySelectorAll("[data-said]").forEach((b) => b.addEventListener("click", () => {
      const box = b.closest(".spk"); box.classList.add("done"); box.querySelector(".res").className = "res ok"; box.querySelector(".res").textContent = "শাবাশ! 👏";
    }));
    app.querySelectorAll("[data-mic]").forEach((b) => b.addEventListener("click", async () => {
      const box = b.closest(".spk"), res = box.querySelector(".res"), e = list[+b.dataset.mic];
      if (canSpeak) speechSynthesis.cancel();
      b.classList.add("rec"); b.textContent = "🔴 শুনছি... বলো";
      try {
        const alts = await listenOnce();
        const s = matchScore(e.en, alts);
        if (!alts.length) { res.className = "res try"; res.textContent = "কিছু শুনতে পাইনি। আবার চেষ্টা করো 🙂"; }
        else if (s >= 0.7) { res.className = "res ok"; res.textContent = "দারুণ! একদম ঠিক বলেছ 👏"; box.classList.add("done"); }
        else { res.className = "res try"; res.innerHTML = `প্রায় হয়েছে! আমি শুনলাম: <span class="en">“${esc(alts[0])}”</span>। আবার চেষ্টা করো।`; }
      } catch (err) {
        res.className = "res try";
        res.textContent = err === "not-allowed" ? "মাইক্রোফোনের অনুমতি দাও, অথবা শুধু জোরে বলো।" : "মাইক কাজ করছে না। শুধু জোরে ৩ বার বলো 🙂";
      }
      b.classList.remove("rec"); b.textContent = "🎤 আবার বলো";
    }));
  }

  function stepStory() {
    const s = L.story;
    frame(`<span class="steptag">${TAGS.story}</span>
      <div class="story-head" style="margin-top:12px">
        <button class="speak lg" data-act="play-story" aria-label="পুরো গল্প শোনো">▶</button>
        <div><h3>${esc(s.title)}</h3><div class="muted">${esc(s.bn)}</div></div>
      </div>
      <p class="step-help" style="margin-top:12px">▶ চাপলে পুরো গল্প শুনবে। কোনো লাইনের মানে জানতে ওই লাইনে ট্যাপ করো।</p>
      <div class="story">${s.lines.map((l, i) => `<button class="sline" data-line="${i}"><div class="se">${esc(l.en)}</div><div class="sb">${esc(l.bn)}</div></button>`).join("")}</div>
      <button class="btn ghost toggle-bn" data-act="all-bn">সব বাংলা দেখাও</button>`, nextBtn());
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
    frame(`<span class="steptag">${TAGS.write}</span>
      <h2 class="step-title">${esc(w.prompt)}</h2>
      <p class="step-help">নিজের জীবন নিয়ে লেখো। ভুল হলেও সমস্যা নেই!</p>
      <textarea class="write-box" id="wbox" autocapitalize="sentences" autocomplete="off" spellcheck="true" aria-label="তোমার বাক্য">${esc(w.start)}</textarea>
      <div class="hint">উদাহরণ: <b>${esc(w.hint)}</b></div>`, nextBtn("জমা দাও ✓", true));
    const box = app.querySelector("#wbox"), btn = app.querySelector("[data-act=next]");
    const upd = () => { btn.disabled = tokens(box.value).length < 2 || box.value.trim() === w.start.trim(); };
    box.addEventListener("input", upd);
    box.focus(); box.setSelectionRange(box.value.length, box.value.length);
    btn.dataset.act = "submit-write";
    btn.addEventListener("click", () => {
      let text = box.value.trim().replace(/\s+/g, " ");
      text = text.charAt(0).toUpperCase() + text.slice(1);
      if (!/[.!?]$/.test(text)) text += ".";
      state.sentences.unshift({ text, lesson: L.id, day: dayStr() }); state.sentences = state.sentences.slice(0, 100); save();
      speak(text);
      const foot = document.getElementById("foot");
      foot.className = "lfoot good";
      foot.querySelector(".wrap").innerHTML = `<div class="feedback"><span class="fi">✍️</span><div><div class="ft">চমৎকার! তুমি নিজে ইংরেজি লিখলে!</div><div class="fa en" style="font-weight:800">${esc(text)}</div></div></div>${nextBtn("শেষ করো 🎉")}`;
    }, { once: true });
  }

  function stepDone() {
    const first = !isDone(L.id);
    const today = dayStr();
    if (state.lastDay !== today) { state.streak = state.lastDay === addDays(-1) ? state.streak + 1 : 1; state.lastDay = today; }
    const prev = state.done[L.id];
    state.done[L.id] = { right: score.right, total: score.total, day: today, best: Math.max(score.right, prev ? prev.best || prev.right : 0) };
    L.words.forEach((w) => { if (!state.words[w.en]) state.words[w.en] = { box: 1, due: addDays(1) }; });
    save();
    const pct = score.total ? score.right / score.total : 1;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
    const nextL = LESSONS.find((l) => l.id === L.id + 1);
    frame(`<div class="done-wrap">
        <div class="big">${"⭐".repeat(stars)}${"☆".repeat(3 - stars)}</div>
        <h2>শাবাশ, ${NAME}! 🎉</h2>
        <p class="muted">পাঠ ${bnNum(L.id)} শেষ${first ? "" : " (আবার অনুশীলন)"}। আজকের কাজ হয়ে গেছে!</p>
        <div class="stats">
          <div class="stat"><div class="n">🎯 ${bnNum(score.right)}/${bnNum(score.total)}</div><div class="l">সঠিক উত্তর</div></div>
          <div class="stat"><div class="n">🔥 ${bnNum(state.streak)}</div><div class="l">দিন টানা</div></div>
          <div class="stat"><div class="n">📚 ${bnNum(wordCount())}</div><div class="l">মোট শব্দ</div></div>
        </div>
        <div class="card" style="margin-top:18px;text-align:left">
          <b>আজ তুমি শিখলে:</b>
          <div class="en" style="font-weight:800;margin-top:6px">${L.pattern.rows.map((r) => esc(r.en)).join(" · ")}</div>
          <div class="muted" style="margin-top:6px">${nextL ? `কালকের পাঠ: <span class="en" style="font-weight:800">${esc(nextL.title)}</span>` : "তুমি সব পাঠ শেষ করেছ! 🏆"}</div>
        </div>
      </div>`, `<a class="btn primary" href="#/" style="text-decoration:none">হোমে যাও 🏠</a>`);
    confetti();
    speak(`Great job, ${NAME}!`);
  }
  function confetti() {
    const c = document.createElement("div"); c.className = "confetti";
    const colors = ["#0F9D76", "#F59E0B", "#2563EB", "#E8590C", "#7C3AED", "#EC4899"];
    for (let i = 0; i < 60; i++) { const p = document.createElement("i"); p.style.left = Math.random() * 100 + "%"; p.style.background = colors[i % colors.length]; p.style.animationDelay = Math.random() * 0.6 + "s"; p.style.animationDuration = 1.4 + Math.random() * 1.2 + "s"; c.appendChild(p); }
    document.body.appendChild(c); setTimeout(() => c.remove(), 3500);
  }

  /* ---------------- review ---------------- */
  let rq = [], ri = 0, rflip = false, rstats = { ok: 0, again: 0 };
  function startReview() {
    rq = shuffle(dueWords()).slice(0, 12); ri = 0; rflip = false; rstats = { ok: 0, again: 0 };
    renderReview();
  }
  function renderReview() {
    if (!wordCount()) {
      app.innerHTML = shell("review", `<div class="empty"><div class="big">🌱</div><h2>এখনো কোনো শব্দ নেই</h2><p>প্রথম পাঠ শেষ করলে এখানে শব্দ আসবে।</p><a class="btn primary" href="#/" style="text-decoration:none;margin-top:14px">পাঠ শুরু করো</a></div>`);
      return;
    }
    if (ri >= rq.length) {
      const msg = rq.length ? `আজকের রিভিউ শেষ! মনে ছিল ${bnNum(rstats.ok)}টা।` : "আজ রিভিউ করার মতো কিছু নেই। কাল আবার এসো!";
      app.innerHTML = shell("review", `<div class="empty"><div class="big">${rq.length ? "👏" : "✅"}</div><h2>${msg}</h2><p>শব্দগুলো সঠিক সময়ে আবার ফিরে আসবে।</p>
        <div class="row2" style="margin-top:16px"><a class="btn ghost" href="#/words" style="text-decoration:none">📒 সব শব্দ</a><a class="btn primary" href="#/" style="text-decoration:none">🏠 হোম</a></div></div>`);
      return;
    }
    const w = rq[ri];
    app.innerHTML = shell("review", `
      <div class="stack">
        <div class="prog" aria-hidden="true"><i style="width:${Math.round((ri / rq.length) * 100)}%"></i></div>
        <p class="step-help" style="margin:0">শব্দটা দেখে মানে মনে করো, তারপর কার্ড উল্টাও। (${bnNum(ri + 1)}/${bnNum(rq.length)})</p>
        <button class="card flash" data-act="flip" aria-label="কার্ড উল্টাও">
          <div class="em">${w.emoji}</div><div class="w">${esc(w.en)}</div>
          ${rflip ? `<div class="m">${esc(w.bn)}</div><div class="say">উচ্চারণ: ${esc(w.say)}</div>` : `<div class="say">👆 ট্যাপ করে মানে দেখো</div>`}
        </button>
        ${rflip ? `<div class="row2"><button class="btn ghost" data-act="r-again">😅 ভুলে গেছি</button><button class="btn primary" data-act="r-ok">😊 মনে ছিল</button></div>`
                : `<button class="btn primary" data-act="flip">মানে দেখো</button>`}
      </div>`);
    if (!rflip) speak(w.en);
  }
  function grade(ok) {
    const w = rq[ri], rec = state.words[w.en];
    if (ok) { rec.box = Math.min(rec.box + 1, 5); rec.due = addDays(INTERVALS[rec.box]); rstats.ok++; }
    else { rec.box = 1; rec.due = addDays(1); rstats.again++; }
    save(); ri++; rflip = false; renderReview();
  }

  /* ---------------- words page ---------------- */
  function renderWords() {
    const learned = LESSONS.filter((l) => isDone(l.id));
    const due = dueWords().length;
    const groups = learned.map((l) => `
      <h2 class="section-title">${l.emoji} পাঠ ${bnNum(l.id)} · <span class="en">${esc(l.title)}</span></h2>
      <div class="wlist">${l.words.map((w) => `<button class="witem" data-say="${esc(w.en)}"><span class="em">${w.emoji}</span><span class="txt"><div class="w">${esc(w.en)}</div><div class="m">${esc(w.bn)} · ${esc(w.say)}</div></span><span class="speak" aria-hidden="true">🔊</span></button>`).join("")}</div>`).join("");
    const sents = state.sentences.length ? `
      <h2 class="section-title">✍️ আমার লেখা বাক্য</h2>
      <div class="wlist">${state.sentences.slice(0, 20).map((s) => `<button class="witem" data-say="${esc(s.text)}"><span class="txt"><div class="my-sent">${esc(s.text)}</div><div class="m">পাঠ ${bnNum(s.lesson)}</div></span><span class="speak" aria-hidden="true">🔊</span></button>`).join("")}</div>` : "";
    app.innerHTML = shell("words", learned.length ? `
      <div class="hello"><h1 class="en" style="font-size:26px">My Words 📒</h1><p>তুমি এ পর্যন্ত ${bnNum(wordCount())}টা শব্দ শিখেছ।</p></div>
      ${due ? `<a class="card review-card" href="#/review" style="text-decoration:none;color:inherit;margin-top:14px"><span class="ico">🔁</span><span><div class="t">রিভিউ বাকি: ${bnNum(due)}টা শব্দ</div><div class="d">এখনই ঝালিয়ে নাও</div></span><span class="go">›</span></a>` : ""}
      ${groups}${sents}
      <button class="link-danger" data-act="reset">সব অগ্রগতি মুছে নতুন করে শুরু করো</button>` :
      `<div class="empty"><div class="big">📒</div><h2>শব্দভাণ্ডার এখনো খালি</h2><p>প্রথম পাঠ শেষ করলে শেখা শব্দগুলো এখানে জমা হবে।</p><a class="btn primary" href="#/" style="text-decoration:none;margin-top:14px">পাঠ শুরু করো</a></div>`);
  }

  /* ---------------- events & routing ---------------- */
  document.addEventListener("click", (e) => {
    const sayEl = e.target.closest("[data-say]");
    if (sayEl) { const b = sayEl.classList.contains("speak") ? sayEl : sayEl.querySelector(".speak"); speak(sayEl.dataset.say, b); }
    const go = e.target.closest("[data-go]");
    if (go) { const id = +go.dataset.go; if (unlocked(id)) location.hash = `#/lesson/${id}`; else toast("আগের পাঠ শেষ করলে এটা খুলবে 🔒"); return; }
    const act = e.target.closest("[data-act]");
    if (!act) return;
    const a = act.dataset.act;
    if (a === "next") next();
    else if (a === "slow") { state.slow = !state.slow; save(); document.querySelectorAll('[data-act="slow"]').forEach((b) => { b.setAttribute("aria-pressed", state.slow); b.textContent = `🐢 ${state.slow ? "ধীরে: চালু" : "ধীরে"}`; }); toast(state.slow ? "এখন ধীরে ধীরে বলবে 🐢" : "স্বাভাবিক গতিতে বলবে"); }
    else if (a === "quit") { if (canSpeak) speechSynthesis.cancel(); location.hash = "#/"; }
    else if (a === "hide-howto") { state.hideHowto = true; save(); renderHome(); }
    else if (a === "play-story") playStory(act);
    else if (a === "all-bn") { const ls = app.querySelectorAll(".sline"); const open = [...ls].every((l) => l.classList.contains("open")); ls.forEach((l) => l.classList.toggle("open", !open)); act.textContent = open ? "সব বাংলা দেখাও" : "বাংলা লুকাও"; }
    else if (a === "flip") { rflip = true; renderReview(); }
    else if (a === "r-ok") grade(true);
    else if (a === "r-again") grade(false);
    else if (a === "reset") { if (confirm("সত্যিই সব অগ্রগতি মুছে ফেলবে?")) { state = Object.assign({}, defaults); save(); location.hash = "#/"; renderHome(); } }
  });

  function route() {
    const h = location.hash || "#/";
    const m = h.match(/^#\/lesson\/(\d+)/);
    if (canSpeak) speechSynthesis.cancel();
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
