# Sizan English

Daily 15-minute English lessons for a complete beginner (Bangla + English).

- Live: https://sizan-english.netlify.app
- 12 lessons. Each one: warm-up, 6 new words (each with an example sentence), sentence pattern (Bangla vs English word order), 8 examples, practice, speaking, a mini story, and writing one sentence.
- Lessons 1-3 are always open. After that, one new lesson opens per day (the day after the previous one is finished). Finished lessons stay open to repeat anytime. A settings toggle (gear icon) turns this off to open all lessons.
- Built-in spaced-repetition review (1, 3, 7, 14, 30 days).
- Plain HTML/CSS/JS. No build step. Progress is saved in the browser (localStorage).
- Fonts: Noto Sans Bengali (Bangla) and Nunito (English) from Google Fonts.
- Icons: SVG from Tabler Icons (MIT), bundled in `icons.js`.
- Audio uses the browser's speech voices. The speaking check uses the browser's speech recognition when available.

## Add or edit lessons
Edit `lessons.js`. Each lesson has `words`, `pattern`, `examples`, `fill`, `story`, and `write`.
If you use a new icon name, regenerate `icons.js` from the Tabler icon set.
