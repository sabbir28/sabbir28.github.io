/**
 * AccuFlow 2.1 - Engine Module
 * Main Orchestrator
 */

class AccuFlowApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.viewport = document.getElementById('viewport');
        this.container = document.getElementById('cards-container');
        this.init();
    }

    init() {
        this.setupInteractions();
        this.render();
        window.addEventListener('resize', () => drawConnections());
    }

    setupInteractions() {
        // Panning
        let isPanning = false;
        let startX, startY;
        this.viewport.onmousedown = (e) => {
            // Allow panning if clicking backgrounds (viewport, canvas, container, title)
            const allowed = ['viewport', 'canvas', 'cards-container', 'canvas-title'];
            if (!allowed.some(id => e.target.id === id || e.target.closest('#' + id))) return;

            isPanning = true;
            startX = e.clientX - state.canvas.x;
            startY = e.clientY - state.canvas.y;
            this.viewport.style.cursor = 'grabbing';
        };

        window.onmousemove = (e) => {
            if (!isPanning) return;
            state.canvas.x = e.clientX - startX;
            state.canvas.y = e.clientY - startY;
            this.updateTransform();
        };
        window.onmouseup = () => { isPanning = false; this.viewport.style.cursor = 'grab'; };

    };

        // Zooming
        this.viewport.onwheel = (e) => {
    e.preventDefault();
    const s = state.canvas.scale;
    const ns = Math.min(Math.max(0.1, s + (e.deltaY > 0 ? -0.1 : 0.1)), 3);
    const rect = this.viewport.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    state.canvas.x -= (mx - state.canvas.x) * (ns / s - 1);
    state.canvas.y -= (my - state.canvas.y) * (ns / s - 1);
    state.canvas.scale = ns;
    this.updateTransform();
};

// UI Control Buttons
document.getElementById('reset-view').onclick = () => {
    state.canvas = { x: 50, y: 50, scale: 0.8 };
    this.updateTransform();
};
document.getElementById('re-draw').onclick = () => {
    this.render();
};
document.getElementById('auto-layout').onclick = () => {
    this.autoLayout();
};
    }

focusOn(compId) {
    const card = document.getElementById(compId);
    if (!card) return;
    const x = parseFloat(card.style.left);
    const y = parseFloat(card.style.top);
    state.canvas.x = -x * state.canvas.scale + (window.innerWidth / 2) - 200;
    state.canvas.y = -y * state.canvas.scale + (window.innerHeight / 2) - 150;
    this.updateTransform();
    card.classList.add('animate-pulse-gold');
    setTimeout(() => card.classList.remove('animate-pulse-gold'), 2000);
}

autoLayout() {
    const layout = {
        'journal': { x: 100, y: 100 },
        'ledger': { x: 600, y: 100 },
        'tb': { x: 1100, y: 100 },
        'ws': { x: 1600, y: 100 },
        'is': { x: 2700, y: 100 },
        'bs': { x: 3200, y: 100 },
        'eq': { x: 1100, y: -300 },
        'cf': { x: 600, y: -450 }
    };

    Object.keys(layout).forEach(key => {
        if (state.positions[key]) state.positions[key] = layout[key];
        // Ledger accounts are handled dynamically
        if (key === 'ledger') {
            const ledgers = Object.keys(state.positions).filter(k => k.startsWith('ledger-'));
            ledgers.forEach((l, i) => { state.positions[l] = { x: 600, y: 100 + (i * 180) }; });
        }
    });
    this.render();
}

updateTransform() {
    this.canvas.style.transform = `translate(${state.canvas.x}px, ${state.canvas.y}px) scale(${state.canvas.scale})`;
    if (window.drawConnections) window.drawConnections();
}



render() {
    this.container.innerHTML = '';
    const data = getActiveYearData();
    const tb = calculateTrialBalance();
    const balances = calculateBalances();

    // Helpers
    const getAccColor = (acc) => {
        const type = data.accounts[acc]?.type;
        const colors = { Asset: '#0d6efd', Liability: '#dc3545', Equity: '#6f42c1', Revenue: '#198754', Expense: '#fd7e14' };
        return colors[type] || '#6c757d';
    };

    // 1. Journal
    const journalHTML = `
            <table class="table table-sm m-0 small">
                <thead><tr><th>Date</th><th>Entry</th><th>Amount</th></tr></thead>
                <tbody>
                    ${data.transactions.map(t => `
                        <tr id="j-row-${t.id}">
                            <td>${t.date}</td>
                            <td><div class="fw-bold" style="color: ${getAccColor(t.debitAcc)}">${t.debitAcc}</div><div class="ps-3 text-muted" style="color: ${getAccColor(t.creditAcc)}">${t.creditAcc}</div></td>
                            <td class="fw-bold text-end">$${t.amount.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    this.container.appendChild(createCard('journal', 'General Journal', 100, 100, journalHTML));

    // 2. Ledgers
    Object.keys(data.accounts).forEach((acc, i) => {
        const bal = data.accounts[acc].normal === 'Debit' ? balances[acc].d - balances[acc].c : balances[acc].c - balances[acc].d;
        const slug = acc.replace(/\s/g, '');
        const html = `
                <div class="row g-0 text-center small border-bottom"><div class="col-6 border-end">D</div><div class="col-6">C</div></div>
                <div class="row g-0 text-center py-2"><div class="col-6 border-end text-primary">$${balances[acc].d ? balances[acc].d.toLocaleString() : ''}</div><div class="col-6 text-success">$${balances[acc].c ? balances[acc].c.toLocaleString() : ''}</div></div>
                <div id="ledger-bal-${slug}" class="p-2 border-top text-center fw-bold small" style="color: ${getAccColor(acc)}">BAL: $${bal.toLocaleString()}</div>
            `;
        this.container.appendChild(createCard(`ledger-${slug}`, `Ledger: ${acc}`, 600, 100 + (i * 160), html));
    });

    // 3. Trial Balance
    const tbHTML = `
            <table class="table table-sm m-0 small">
                <thead><tr><th>Acc</th><th>Debit</th><th>Credit</th></tr></thead>
                <tbody>
                    ${tb.map(e => `<tr id="tb-row-${e.acc.replace(/\s/g, '')}"><td style="color: ${getAccColor(e.acc)}; font-weight: 600;">${e.acc}</td><td>${e.d ? '$' + e.d.toLocaleString() : ''}</td><td>${e.c ? '$' + e.c.toLocaleString() : ''}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    this.container.appendChild(createCard('tb', 'Trial Balance', 1100, 100, tbHTML));

    // 4. Worksheet
    const wsHTML = `
            <div class="table-responsive">
                <table class="table table-sm m-0 small text-center" style="min-width: 1000px; font-size: 0.65rem;">
                    <thead>
                        <tr class="bg-light">
                            <th rowspan="2" class="text-start">Account</th>
                            <th colspan="2">Unadj TB</th><th colspan="2">Adj Entry</th><th colspan="2">Adj TB</th><th colspan="2">Income</th><th colspan="2">Balance</th>
                        </tr>
                        <tr class="bg-light"><th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th></tr>
                    </thead>
                    <tbody>
                        ${tb.map(e => `
                            <tr id="ws-row-${e.acc.replace(/\s/g, '')}">
                                <td class="text-start fw-bold" style="color: ${getAccColor(e.acc)}">${e.acc}</td>
                                <td>${e.d || ''}</td><td>${e.c || ''}</td>
                                <td class="text-primary"></td><td class="text-danger"></td>
                                <td class="fw-bold">${e.d || ''}</td><td class="fw-bold">${e.c || ''}</td>
                                <td>${data.accounts[e.acc].type === 'Expense' ? e.d : ''}</td><td>${data.accounts[e.acc].type === 'Revenue' ? e.c : ''}</td>
                                <td>${['Asset', 'Liability', 'Equity'].includes(data.accounts[e.acc].type) ? (e.d || '') : ''}</td>
                                <td>${['Asset', 'Liability', 'Equity'].includes(data.accounts[e.acc].type) ? (e.c || '') : ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    const wsCard = createCard('ws', 'Enterprise 10-Column Worksheet', 1600, 100, wsHTML);
    wsCard.style.width = '1000px';
    this.container.appendChild(wsCard);


    // 4. Master Control
    const netIncome = tb.filter(e => data.accounts[e.acc].type === 'Revenue').reduce((s, i) => s + i.c, 0) - tb.filter(e => data.accounts[e.acc].type === 'Expense').reduce((s, i) => s + i.d, 0);
    const totalAssets = tb.filter(e => data.accounts[e.acc].type === 'Asset').reduce((s, i) => s + (i.d - i.c), 0);
    const totalLE = (tb.filter(e => ['Liability', 'Equity'].includes(data.accounts[e.acc].type)).reduce((s, i) => s + (i.c - i.d), 0) + netIncome);

    const eqContent = `
            <div class="p-3 text-center">
                <div class="row align-items-center">
                    <div class="col-5"><div class="h3 fw-bold text-primary">$${totalAssets.toLocaleString()}</div><small>ASSETS</small></div>
                    <div class="col-2 h3 text-muted">=</div>
                    <div class="col-5"><div class="h3 fw-bold text-dark">$${totalLE.toLocaleString()}</div><small>L + E</small></div>
                </div>
                <div class="mt-3 py-1 rounded shadow-sm ${Math.abs(totalAssets - totalLE) < 1 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} fw-bold">
                    ${Math.abs(totalAssets - totalLE) < 1 ? '✓ SYSTEM BALANCED' : '✗ SYSTEM UNBALANCED'}
                </div>
            </div>
        `;
    this.container.appendChild(createCard('eq', 'Master Dashboard', 1100, -200, eqContent));

    // 4b. Cash Flow Statement
    const cfHTML = `
            <div class="p-3 small">
                <div class="fw-bold text-primary mb-2">OPERATING ACTIVITIES</div>
                <div class="d-flex justify-content-between"><span>Net Income</span><span>$${netIncome.toLocaleString()}</span></div>
                <div class="d-flex justify-content-between text-muted italic"><span>+ Non-cash adjustments</span><span>$0</span></div>
                <div class="fw-bold border-top mt-2">INVESTING ACTIVITIES</div>
                <div class="d-flex justify-content-between text-danger"><span>Equipment Purchase</span><span>($20,000)</span></div>
                <div class="fw-bold border-top mt-2">FINANCING ACTIVITIES</div>
                <div class="d-flex justify-content-between text-success"><span>Stock Issuance</span><span>$50,000</span></div>
                <div class="h5 fw-bold border-top mt-3 pt-2 text-dark d-flex justify-content-between"><span>Net Cash Increase</span><span>$30,000</span></div>
            </div>
        `;
    this.container.appendChild(createCard('cf', 'Statement of Cash Flows', 600, -450, cfHTML));


    // 5. Income Statement (Comparative)
    const isHTML = `
            <div class="p-3">
                <div class="row fw-bold border-bottom pb-1 mb-2 small text-muted"><div class="col-6">Description</div><div class="col-3 text-end">2026</div><div class="col-3 text-end">2025</div></div>
                <div class="fw-bold text-success mb-1 small">REVENUES</div>
                ${tb.filter(e => data.accounts[e.acc].type === 'Revenue').map(e => `<div id="is-row-${e.acc.replace(/\s/g, '')}" class="row small mb-1"><div class="col-6">${e.acc}</div><div class="col-3 text-end">$${e.c.toLocaleString()}</div><div class="col-3 text-end">$5,000</div></div>`).join('')}
                <div class="fw-bold text-danger mt-3 mb-1 small">EXPENSES</div>
                ${tb.filter(e => data.accounts[e.acc].type === 'Expense').map(e => `<div id="is-row-${e.acc.replace(/\s/g, '')}" class="row small mb-1"><div class="col-6">${e.acc}</div><div class="col-3 text-end">$${e.d.toLocaleString()}</div><div class="col-3 text-end">$0</div></div>`).join('')}
                <div class="row fw-bold border-top mt-3 pt-2 text-primary"><div class="col-6">NET INCOME</div><div class="col-3 text-end">$${netIncome.toLocaleString()}</div><div class="col-3 text-end">$5,000</div></div>
            </div>
        `;
    this.container.appendChild(createCard('is', 'Income Statement (Comparative)', 2100, -200, isHTML));

    // 6. Balance Sheet
    const bsHTML = `
            <div class="row g-0">
                <div class="col-6 border-end p-3">
                    <h6 class="fw-bold text-primary border-bottom small">ASSETS</h6>
                    ${tb.filter(e => data.accounts[e.acc].type === 'Asset').map(e => `<div id="bs-row-${e.acc.replace(/\s/g, '')}" class="d-flex justify-content-between small"><span>${e.acc}</span><span>$${(e.d - e.c).toLocaleString()}</span></div>`).join('')}
                    <div class="d-flex justify-content-between fw-bold border-top mt-1 pt-1 text-primary"><span>Total</span><span>$${totalAssets.toLocaleString()}</span></div>
                </div>
                <div class="col-6 p-3">
                    <h6 class="fw-bold text-danger border-bottom small">LIAB & EQU</h6>
                    ${tb.filter(e => data.accounts[e.acc].type === 'Liability').map(e => `<div id="bs-row-${e.acc.replace(/\s/g, '')}" class="d-flex justify-content-between small"><span>${e.acc}</span><span>$${(e.c - e.d).toLocaleString()}</span></div>`).join('')}
                    ${tb.filter(e => data.accounts[e.acc].type === 'Equity').map(e => `<div id="bs-row-${e.acc.replace(/\s/g, '')}" class="d-flex justify-content-between small"><span>${e.acc}</span><span>$${(e.c - e.d).toLocaleString()}</span></div>`).join('')}
                    <div class="d-flex justify-content-between small text-success"><span>RE</span><span>$${netIncome.toLocaleString()}</span></div>
                    <div class="d-flex justify-content-between fw-bold border-top mt-1 pt-1 text-danger"><span>Total</span><span>$${totalLE.toLocaleString()}</span></div>
                </div>
            </div>
        `;
    const bsCard = createCard('bs', 'Balance Sheet (Enterprise)', 2600, -200, bsHTML);
    bsCard.style.width = '600px';
    this.container.appendChild(bsCard);

    setTimeout(() => drawConnections(), 500);
    this.updateTransform();
}

    }

window.onload = () => { window.app = new AccuFlowApp(); };
