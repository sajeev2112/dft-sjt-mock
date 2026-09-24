# DFT SJT Mock Paper

An unofficial practice site for the UK Dental Foundation Training (DFT) Situational Judgement Test.

**Try it:** https://dft-sjt-mock.sajeev-r13.workers.dev

- 96 original questions in three papers: Paper 1 (standard), and Papers 2 and 3 (harder)
- Ranking items you drag into order, and best-three-of-eight items, both marked with the live test's near-miss scoring
- Quick 10 quizzes, a 56-question full mock, and weak-spot, area and theme quizzes
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
SELECT q, comment, datetime(t / 1000, 'unixepoch') AS sent FROM feedback ORDER BY t DESC;
```
