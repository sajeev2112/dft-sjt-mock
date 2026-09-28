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
SELECT (q - 1) / 32 + 1 AS paper, (q - 1) % 32 + 1 AS question, comment, datetime(t / 1000, 'unixepoch') AS sent
FROM feedback_v2 ORDER BY t DESC;
```

## Cross-device sync

The **Sync** button in the top bar lets anyone save their progress under a username and a 4–8 digit PIN, then continue on another device. There's no account or email.

- **Automatic:** a linked device saves a few seconds after each change and loads the newest copy on start-up. If two devices changed at once, it asks which copy to keep.
- **Protected:** PINs are salted and hashed. Every 5 wrong PINs lock the name for 15 minutes, doubling each time, and the endpoint is rate-limited.
- **Deletable:** you can stop syncing on a device, or delete your saved copy, at any time.
- **Stored in D1:** saved copies live in the `sync` table.

## Private dashboard

Open `/admin` on the site (for example https://dft-sjt-mock.sajeev-r13.workers.dev/admin) and sign in with the dashboard password. It shows:

- visitors, returning visitors and home-screen app users
- answers per day
- **keys to recheck**: questions where people's answers disagree with the key, scored with the live test's marking
- "I disagree" comments
- recent errors

The page itself holds no data. Everything comes from `/api/admin`, which only answers with the password. To set the password, add a **secret** named `ADMIN_KEY` under the Worker's Settings → Variables and Secrets in the Cloudflare dashboard. Password attempts are rate-limited, and the page is marked noindex.

## Private visitor stats

Visits are counted anonymously in D1, one row per browser per day. They're never shown on the site. Run these queries in the D1 console:

```sql
-- Visitors and page views per day (app = opened from the home screen)
SELECT day, COUNT(*) AS visitors, SUM(views) AS page_views, SUM(app) AS app_users
FROM visits GROUP BY day ORDER BY day DESC LIMIT 30;

-- All-time unique visitors, and people who have answered at least one question
SELECT (SELECT COUNT(DISTINCT client) FROM visits) AS visitors,
       (SELECT COUNT(DISTINCT client) FROM answers_v2) AS answering;

-- The most-answered questions
SELECT (q - 1) / 32 + 1 AS paper, (q - 1) % 32 + 1 AS question, COUNT(*) AS answers
FROM answers_v2 GROUP BY q ORDER BY answers DESC LIMIT 10;
```

## Error alerts

`.github/workflows/site-health.yml` runs every hour. It checks the site, the GitHub Pages copy, the stats API and the error counts from `/api/health`. If anything fails, it opens a `site-alert` issue, which makes GitHub email the repo owner. When the site recovers, it closes the issue. Error messages are kept in D1 and never shown in the public issue:

```sql
SELECT datetime(t / 1000, 'unixepoch') AS at, kind, msg FROM errors ORDER BY t DESC LIMIT 50;
```
