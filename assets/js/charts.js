// Real fund NAV curves loaded from assets/data/funds.json
// Source: live trading records, 2024-03-18 to 2026-03-23.

const COLORS = {
  SFG: { line: '#1e3a5f', fill: 'rgba(30,58,95,0.10)' },
  AGR: { line: '#7a2e2e', fill: 'rgba(122,46,46,0.10)' },
};

const sharedOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#1c1917',
      borderColor: '#57534e',
      borderWidth: 1,
      titleFont: { family: 'JetBrains Mono', size: 11 },
      bodyFont:  { family: 'JetBrains Mono', size: 11 },
      padding: 8,
      callbacks: {
        title: (items) => items[0].label,
        label: (item) => `NAV  ${Number(item.parsed.y).toLocaleString('en-US', {maximumFractionDigits:0})}`,
      }
    }
  },
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: {
      display: true,
      grid: { display: false },
      ticks: {
        color: '#a8a29e',
        font: { family: 'JetBrains Mono', size: 9 },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 6,
        callback: function(value) {
          const lbl = this.getLabelForValue(value);
          return lbl ? lbl.slice(0, 7) : ''; // YYYY-MM
        }
      }
    },
    y: {
      display: true,
      position: 'right',
      grid: { color: 'rgba(0,0,0,0.04)' },
      border: { display: false },
      ticks: {
        color: '#a8a29e',
        font: { family: 'JetBrains Mono', size: 9 },
        callback: (v) => (v / 1000).toFixed(0) + 'k'
      }
    }
  },
  elements: {
    point: { radius: 0, hoverRadius: 4 },
    line:  { tension: 0.2, borderWidth: 2 }
  }
};

async function renderFunds() {
  let funds;
  try {
    const res = await fetch('assets/data/funds.json');
    funds = await res.json();
  } catch (e) {
    console.error('Failed to load funds data', e);
    return;
  }

  ['SFG', 'AGR'].forEach(name => {
    const el = document.getElementById(`chart-${name.toLowerCase()}`);
    if (!el || !funds[name]) return;
    const f = funds[name];
    const c = COLORS[name];
    new Chart(el, {
      type: 'line',
      data: {
        labels: f.dates,
        datasets: [{
          data: f.wealth,
          borderColor: c.line,
          backgroundColor: c.fill,
          fill: true,
        }]
      },
      options: sharedOptions
    });
  });
}

renderFunds();
