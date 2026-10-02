# DFT SJT Mock Paper

An unofficial practice site for the UK Dental Foundation Training (DFT) Situational Judgement Test.

**Try it:** https://dft-sjt-mock.sajeev-r13.workers.dev

- 160 original questions in five papers: Paper 1 (standard), Papers 2 and 3 (harder), and Papers 4 and 5 · Advanced (deliberately harder than the live test, written and checked by a multi-agent question factory)
- Ranking items you drag into order, and best-three-of-eight items, both marked with the live test's near-miss scoring
- A timed mock: 56 random questions in 105 minutes, with a countdown, warnings at 15 and 5 minutes, automatic marking when time runs out and a results summary
- Flags on any question (button or the F key), shown on the question grid, with a Flagged questions quiz
- Quick 10 quizzes, and weak-spot, area and theme quizzes
- Gentle animations between questions and on reveals, switched off for anyone who prefers reduced motion
- A modern design layer (`design.css`, `design.js`): glass header with a sliding nav pill and theme toggle, progress tiles, a timed-mock card, score rings and gauges, smoother drag-to-rank, a prominent Flag for review button, and a one-time tip explaining Sync
- Results by area and by theme, your weakest themes, and progress over time
- A built-in pattern guide with a playbook for each of the 12 themes
- Community stats that show how everyone else answered, plus an "I disagree with this key" button
- Works offline and can be installed on a phone. Progress codes move your progress between devices

The questions are original. They're modelled on patterns in the official 2016 and 2021 DFT practice papers and on GDC and dental defence organisation guidance. The answer keys are reasoned judgements, not official answers. This project isn't affiliated with NHS England, COPDEND, HEIW or NIMDTA.

## How it's built

| Path | What it is |
| --- | --- |
| `docs/` | The static site. Cloudflare serves it, and GitHub Pages serves a mirror copy |
| `docs/questions.js` | The question bank. Run `node tools/build.js` after editing it |
| `docs/guide.js` | The pattern guide and theme playbooks |
| `docs/app.js` | The app |
| `src/worker.js` | The Cloudflare Worker: serves `docs/` plus the anonymous stats API (`/api/answers`, `/api/stats`, `/api/feedback`) |
| `wrangler.jsonc` | Worker config, including the D1 database binding for community stats |
| `tools/build.js` | Validates every question and key, syncs the question list into the Worker, and updates the offline-cache version |

**Privacy:** the stats API stores only a random per-browser ID, the question number and the answer order. IP addresses are hashed into hourly rate-limit buckets and never stored in raw form. Disagreement comments are stored for the site owner to review and are never shown publicly.

To read the feedback, open the D1 console in the Cloudflare dashboard and run:

```sql
SELECT (q - 1) / 32 + 1 AS paper, (q - 1) % 32 + 1 AS question, comment, datetime(t / 1000, 'unixepoch') AS sent
FROM feedback_v2 ORDER BY t DESC;
```

## Cross-device sync

The **Sync** button in the top bar lets anyone save their progress under a username and a 4–8 digit PIN, then continue on another device. There's no account or email.

- **Automatic:** a linked device saves a few seconds after each change and loads the newest copy on start-up. If two devices changed at once, it asks which copy to keep.
- **Protected:** PINs are salted and hashed. Every 5 wrong PINs lock the name for 15 minutes, doubling each time, and the endpoint is rate-limited.
- **Deletable:** you can stop syncing on a device, or delete your saved copy, at any time.
- **Stored in D1:** saved copies live in the `sync` table.

## Error alerts

`.github/workflows/site-health.yml` runs every hour. It checks the site, the GitHub Pages copy, the stats API and the error counts from `/api/health`. If anything fails, it opens a `site-alert` issue, which makes GitHub email the repo owner. When the site recovers, it closes the issue. Error messages are kept in D1 and never shown in the public issue:

```sql
SELECT datetime(t / 1000, 'unixepoch') AS at, kind, msg FROM errors ORDER BY t DESC LIMIT 50;
```
