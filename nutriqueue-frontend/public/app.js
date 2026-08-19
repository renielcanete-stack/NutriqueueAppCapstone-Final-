const toJSON = async (r) => {
  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const backendBase = window.location.origin; // same origin as the UI
const mlBase = `${window.location.protocol}//${window.location.hostname}:5001`;

function renderOutput(containerId, data) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  if (!data) return;
  if (typeof data === 'string') {
    el.textContent = data;
    return;
  }
  // If data has raw text (error), show it
  if (data.raw) {
    const p = document.createElement('p');
    p.textContent = data.raw;
    el.appendChild(p);
    return;
  }
  // Render object fields as labeled rows
  const card = document.createElement('div');
  card.className = 'output-card';
  Object.keys(data).forEach((k) => {
    const row = document.createElement('div');
    row.className = 'output-row';
    const key = document.createElement('div');
    key.className = 'output-key';
    key.textContent = k;
    const val = document.createElement('div');
    val.className = 'output-val';
    val.textContent = typeof data[k] === 'object' ? JSON.stringify(data[k]) : String(data[k]);
    row.appendChild(key);
    row.appendChild(val);
    card.appendChild(row);
  });
  el.appendChild(card);
}

document.getElementById('predictRiskBtn').addEventListener('click', async () => {
  const dishName = document.getElementById('dishName').value;
  const userVector = document.getElementById('userVector').value.split(',').map((s) => Number(s.trim()));
  const res = await fetch(`${mlBase}/predict-risk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dishName, userVector }),
  });
  const out = await toJSON(res);
  renderOutput('predictRiskOut', out);
});

document.getElementById('predictWaitBtn').addEventListener('click', async () => {
  const stallId = document.getElementById('waitStallId').value;
  const itemsCount = Number(document.getElementById('itemsCount').value || 0);
  const res = await fetch(`${backendBase}/api/ml/predict-wait-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stallId, itemsCount }),
  });
  const out = await toJSON(res);
  renderOutput('predictWaitOut', out);
});

document.getElementById('healthBtn').addEventListener('click', async () => {
  const studentId = document.getElementById('studentId').value;
  const res = await fetch(`${backendBase}/api/health/profile/${encodeURIComponent(studentId)}`);
  const out = await toJSON(res);
  renderOutput('healthOut', out);
});

document.getElementById('qrBtn').addEventListener('click', async () => {
  const stallId = document.getElementById('qrStallId').value;
  const res = await fetch(`${backendBase}/api/qr/route-stall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stallId }),
  });
  const out = await toJSON(res);
  renderOutput('qrOut', out);
});
