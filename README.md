# Luban website

This is the public site for Luban, a youth-led nonprofit that runs free business programs for Canadian high school students. It's live at [lubancanada.com](https://lubancanada.com).

The site is plain HTML, CSS and JavaScript. There's no framework, no build step and no package.json, so what's in the repo is what gets served.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `spc.html` | Stock Pitch Competition |
| `econ.html` | Economics Competition |
| `discovering-entrepreneurship.html` | Discovering Entrepreneurship |
| `paper-trading-simulation.html` | Paper Trading Simulation event page |
| `sim-guide.html` | How to use the Market Lab |
| `terms.html` | Terms and contest rules |
| `privacy.html` | Privacy policy |

Styles, scripts and images live in `assets/css`, `assets/js` and `assets/images`.

## Working on it

Open any page in a browser, or serve the folder so links between pages behave like production:

```bash
npx serve .
```

`vercel.json` turns on clean URLs, so `/spc` serves `spc.html`. It also sets the security headers. Keep links extensionless to match.

## Deploying

The site is a Vercel project and every push to `main` goes straight to production. Check your change locally first, on a phone-width window too, since a lot of students visit from their phones.

## The simulator

`simulator-prototype/` is a separate git repo: the Market Lab trading simulator, deployed on its own at [sim.lubancanada.com](https://sim.lubancanada.com). It has its own README. Commit and push it from inside that folder. This repo only stores a pointer to it, and `.vercelignore` keeps it out of the site deploy.
