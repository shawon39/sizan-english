# Sizan English

Daily 15-minute English lessons for a complete beginner (Bangla + English). Made for a phone.

- Live: https://sizan-english.netlify.app
- 12 lessons in 4 units. Each lesson: warm-up, 6 new words, a sentence pattern, 8 examples (one per screen, listen and say), practice, a mini story, and writing one sentence.
- All lessons are open. Do them in any order, and repeat them anytime. A lesson saves each step, so it can continue later.
- Home shows today's plan: a short review first, then the next lesson. Nothing is locked.
- Smart review: the app checks each answer. Mistakes from lessons and tests come back (spaced repetition: 1, 3, 7, 14, 30 days).
- Unit test after every 3 lessons: 10 questions. Not a gate. Wrong items go to review.
- Hints remove one wrong answer. Wrong answers show a short rule in Bangla.
- XP, 6 levels, 8 badges and a weekly chart. Messages compare the learner only with himself.
- Progress is saved on the phone and online (Netlify Blobs) with a 6-digit code. The code restores progress on a new phone, and a read-only link shows progress to a parent.
- Works offline (service worker). Installable on the home screen.

## Files
- `public/`: the site. Plain HTML/CSS/JS, no build step.
  - `lessons.js`: lesson data. Each lesson has `words`, `pattern`, `examples`, `fill` (with a `why` rule), `story` and `write`.
  - `icons.js`: SVG icons from Tabler Icons (MIT). If you use a new icon name, add it to this file.
  - `sw.js`: offline cache. App files are network first.
- `netlify/functions/progress.mjs`: saves and loads progress in Netlify Blobs (`GET`, `POST`, `PUT` on `/api/progress`).
- Fonts: Noto Sans Bengali (Bangla) and Nunito (English) from Google Fonts.
- Audio uses the browser's speech voices. The speaking check uses the browser's speech recognition when available.

## Cost note
Each production deploy uses 15 Netlify credits (the free plan has 300 a month). Collect changes on a branch and merge them to `Develop` together.
