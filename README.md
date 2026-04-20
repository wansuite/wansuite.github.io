# wansuite.github.io

Personal site of Xuhu Wan — Associate Professor at HKUST (Department of ISOM), principal of SFG and AGR systematic trading strategies.

## Stack
Plain HTML + Tailwind CSS (Play CDN) + Chart.js. No build step. Just push and GitHub Pages serves it.

## Edit
- `index.html` — main hedge-fund landing (SFG / AGR cards)
- `research.html` — papers and research areas
- `teaching.html` — courses
- `about.html` — bio + contact
- `assets/js/charts.js` — replace `makeCurve(...)` with real fund NAV arrays
- Performance metrics (YTD / Sharpe / Max DD) live as text in `index.html` — edit there.

## Deploy
Pushed to `main`; GitHub Pages serves from root at https://wansuite.github.io
