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
        let isPanning = false;
        let startX, startY;

        this.viewport.onmousedown = (e) => {
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

        window.onmouseup = () => {
            isPanning = false;
            this.viewport.style.cursor = 'grab';
        };

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
        document.getElementById('randomize-layout').onclick = () => {
            this.randomizeLayout();
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

    randomizeLayout() {
        const components = ['journal', 'ledger', 'tb', 'ws', 'is', 'bs', 'eq', 'cf', 'lab'];
        components.forEach(c => {
            const x = Math.random() * 3000 - 500;
            const y = Math.random() * 2000 - 500;
            state.positions[c] = { x, y };
        });
        // Special case for ledgers
        const ledgers = Object.keys(state.positions).filter(k => k.startsWith('ledger-'));
        ledgers.forEach((l, i) => { state.positions[l] = { x: 800 + (Math.random() * 200), y: 100 + (i * 180) }; });
        this.render();
    }

    autoLayout() {
        const layout = {
            'lab': { x: -400, y: 100 },
            'journal': { x: 100, y: 100 },
            'ledger': { x: 600, y: 100 },
            'tb': { x: 1200, y: 100 },
            'ws': { x: 1800, y: 100 },
            'is': { x: 3000, y: 100 },
            'bs': { x: 3600, y: 100 },
            'eq': { x: 1200, y: -300 },
            'cf': { x: 600, y: -450 }
        };

        Object.keys(layout).forEach(key => {
            state.positions[key] = layout[key];
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

    postTransaction() {
        const date = document.getElementById('lab-date').value || '2026-XX-XX';
        const dAcc = document.getElementById('lab-debit').value;
        const cAcc = document.getElementById('lab-credit').value;
        const amt = parseFloat(document.getElementById('lab-amount').value) || 0;
        const isAdj = document.getElementById('lab-is-adj').checked;

        if (amt <= 0 || dAcc === cAcc) {
            alert("Invalid Transaction: Check amounts and accounts.");
            return;
        }

        const data = getActiveYearData();
        data.transactions.push({
            id: (isAdj ? 'a' : 't') + (data.transactions.length + 1),
            date,
            debitAcc: dAcc,
            creditAcc: cAcc,
            amount: amt,
            desc: isAdj ? 'Adjustment Entry' : 'Manual Entry',
            isAdjustment: isAdj
        });

        // Educational Mode: Only refresh the Journal, don't re-render everything yet
        this.renderJournalOnly();
    }

    renderJournalOnly() {
        // Just refresh the journal card content
        this.render(); // For now full render to keep cards stable, but we will add a 'Process' button for lines
    }

    loadAcademicScenario() {
        if (confirm("Clear all entries and load ABC Traders Scenario?")) {
            loadScenario('ABC_TRADERS');
            this.render();
            if (window.drawConnections) window.drawConnections();
        }
    }

    processCycle() {
        this.render();
        if (window.drawConnections) window.drawConnections();
    }





    render() {
        this.container.innerHTML = '';
        const data = getActiveYearData();
        const tb = calculateTrialBalance();
        const balances = calculateBalances();

        const getAccColor = (acc) => {
            const type = data.accounts[acc]?.type;
            const colors = { Asset: '#0d6efd', Liability: '#dc3545', Equity: '#6f42c1', Revenue: '#198754', Expense: '#fd7e14' };
            return colors[type] || '#6c757d';
        };

        // 0. Transaction & Adjustment Lab
        const labHTML = `
            <div class="p-3">
                <div class="mb-2 text-primary fw-bold small"><i class="bi bi-plus-circle me-1"></i> Post New Entry</div>
                <div class="mb-2">
                    <input type="text" id="lab-date" class="form-control form-control-sm" value="2026-05-01">
                </div>
                <div class="row g-2 mb-2">
                    <div class="col-6">
                        <select id="lab-debit" class="form-select form-select-sm">
                            ${Object.keys(data.accounts).map(a => `<option value="${a}">${a}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-6">
                        <select id="lab-credit" class="form-select form-select-sm">
                            ${Object.keys(data.accounts).map(a => `<option value="${a}">${a}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <input type="number" id="lab-amount" class="form-control form-control-sm mb-2" placeholder="Amount ($)">
                <div class="form-check form-switch mb-3 small">
                    <input class="form-check-input" type="checkbox" id="lab-is-adj">
                    <label class="form-check-label" for="lab-is-adj">Adjusting Entry?</label>
                </div>
                <button onclick="app.postTransaction()" class="btn btn-outline-primary btn-sm w-100 rounded-pill mb-2">Record Journal Entry</button>
                <button onclick="app.processCycle()" class="btn btn-success btn-sm w-100 rounded-pill mb-3 shadow-sm">Process Cycle →</button>
                <button onclick="app.loadAcademicScenario()" class="btn btn-warning btn-sm w-100 rounded-pill shadow-sm">Load ABC Traders Scenario</button>
            </div>
        `;


        this.container.appendChild(createCard('lab', 'Transaction Lab', -400, 100, labHTML));

        // 1. Journal
        const journalHTML = `
            <div class="table-responsive" style="max-height: 400px;">
                <table class="table table-sm m-0 small">
                    <thead><tr><th>Date/ID</th><th>Entry</th><th>Amount</th></tr></thead>
                    <tbody>
                        ${data.transactions.map(t => `
                            <tr id="j-row-${t.id}" class="${t.isAdjustment ? 'bg-warning-subtle' : ''}">
                                <td><div class="extra-small text-muted">${t.id}</div>${t.date}</td>
                                <td><div class="fw-bold" style="color: ${getAccColor(t.debitAcc)}">${t.debitAcc}</div><div class="ps-3 text-muted" style="color: ${getAccColor(t.creditAcc)}">${t.creditAcc}</div></td>
                                <td class="fw-bold text-end ${t.isAdjustment ? 'text-warning' : ''}">$${t.amount.toLocaleString()}</td>
                            </tr>
                        `).reverse().join('')}
                    </tbody>
                </table>
            </div>
        `;
        this.container.appendChild(createCard('journal', 'General Journal (Live)', 100, 100, journalHTML));


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

        // 4. Worksheet (Smart 10-Column)
        const unadjTB = calculateTrialBalance(state.activeYear, 'Unadjusted');
        const adjTotals = calculateAdjustmentTotals();
        const adjTB = calculateTrialBalance(state.activeYear, 'Adjusted');

        const wsHTML = `
            <div class="table-responsive">
                <table class="table table-sm m-0 small text-center" style="min-width: 1200px; font-size: 0.65rem;">
                    <thead>
                        <tr class="bg-light">
                            <th rowspan="2" class="text-start">Account</th>
                            <th colspan="2" class="bg-primary-subtle text-primary">Unadj TB</th>
                            <th colspan="2" class="bg-warning-subtle text-warning">Adjustments</th>
                            <th colspan="2" class="bg-success-subtle text-success">Adjusted TB</th>
                            <th colspan="2">Income</th><th colspan="2">Balance</th>
                        </tr>
                        <tr class="bg-light"><th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th></tr>
                    </thead>
                    <tbody>
                        ${adjTB.map(e => {
            const u = unadjTB.find(x => x.acc === e.acc) || { d: 0, c: 0 };
            const a = adjTotals[e.acc] || { d: 0, c: 0 };
            return `
                                <tr id="ws-row-${e.acc.replace(/\s/g, '')}">
                                    <td class="text-start fw-bold" style="color: ${getAccColor(e.acc)}">${e.acc}</td>
                                    <td>${u.d || ''}</td><td>${u.c || ''}</td>
                                    <td class="text-warning fw-bold">${a.d || ''}</td><td class="text-warning fw-bold">${a.c || ''}</td>
                                    <td class="bg-light-subtle">${e.d || ''}</td><td class="bg-light-subtle">${e.c || ''}</td>
                                    <td>${data.accounts[e.acc].type === 'Expense' ? e.d : ''}</td><td>${data.accounts[e.acc].type === 'Revenue' ? e.c : ''}</td>
                                    <td>${['Asset', 'Liability', 'Equity'].includes(data.accounts[e.acc].type) ? (e.d || '') : ''}</td>
                                    <td>${['Asset', 'Liability', 'Equity'].includes(data.accounts[e.acc].type) ? (e.c || '') : ''}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        const wsCard = createCard('ws', 'Dynamic 10-Column Enterprise Worksheet', 1800, 100, wsHTML);

        wsCard.style.width = '1000px';
        this.container.appendChild(wsCard);

        // 5. Master Equations
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

        // 6. Cash Flow (Academic Scenario Focus)
        const cfHTML = `
            <div class="p-3 small">
                <div class="fw-bold text-primary mb-2">OPERATING ACTIVITIES</div>
                <div class="d-flex justify-content-between"><span>Net Profit</span><span>$${netIncome.toLocaleString()}</span></div>
                <div class="d-flex justify-content-between text-success"><span>(+) Depreciation</span><span>$1,500</span></div>
                <div class="d-flex justify-content-between text-danger"><span>(-) Inc in A/R</span><span>($4,000)</span></div>
                <div class="d-flex justify-content-between text-success"><span>(+) Dec in Inv</span><span>$8,000</span></div>
                <div class="d-flex justify-content-between text-success"><span>(+) Inc in A/P</span><span>$7,000</span></div>
                
                <div class="fw-bold border-top mt-2">INVESTING ACTIVITIES</div>
                <div class="d-flex justify-content-between text-danger"><span>Purchase of Furniture</span><span>($15,000)</span></div>
                
                <div class="fw-bold border-top mt-2">FINANCING ACTIVITIES</div>
                <div class="d-flex justify-content-between text-success"><span>Capital Introduced</span><span>$100,000</span></div>
                
                <div class="h5 fw-bold border-top mt-3 pt-2 text-dark d-flex justify-content-between"><span>Net Cash Flow</span><span>$119,000</span></div>
            </div>
        `;

        this.container.appendChild(createCard('cf', 'Statement of Cash Flows', 600, -450, cfHTML));

        // 7. Income Statement
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

        // 8. Balance Sheet
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

        // 9. Inventory Tracker
        const totalInv = state.inventory.reduce((s, i) => s + (i.qty * i.cost), 0);
        const invHTML = `
            <div class="p-3">
                <table class="table table-sm m-0 small">
                    <thead><tr><th>Item</th><th>Qty</th><th>Cost</th><th>Total</th></tr></thead>
                    <tbody>
                        ${state.inventory.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>$${i.cost}</td><td>$${(i.qty * i.cost).toLocaleString()}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="mt-2 text-end fw-bold text-primary">VALUATION: $${totalInv.toLocaleString()}</div>
            </div>
        `;
        this.container.appendChild(createCard('inventory', 'Real-Time Inventory (FIFO)', 3200, -200, invHTML));

        // 10. Bank Reconciliation
        state.bank.bookBalance = balances['Cash'].d - balances['Cash'].c;
        const adjBank = state.bank.bankBalance + state.bank.depositsInTransit - state.bank.outstandingChecks;
        const bankHTML = `
            <div class="p-3 small">
                <div class="d-flex justify-content-between text-muted mb-1"><span>Bank Statement</span><span>$${state.bank.bankBalance.toLocaleString()}</span></div>
                <div class="d-flex justify-content-between text-success"><span>(+) Deposits in Transit</span><span>$${state.bank.depositsInTransit.toLocaleString()}</span></div>
                <div class="d-flex justify-content-between text-danger"><span>(-) Outstanding Checks</span><span>($${state.bank.outstandingChecks.toLocaleString()})</span></div>
                <div class="d-flex justify-content-between fw-bold border-top pt-1 mb-3"><span>Adjusted Bank Balance</span><span>$${adjBank.toLocaleString()}</span></div>
                
                <div class="d-flex justify-content-between text-muted mb-1"><span>Company Books (Cash)</span><span>$${state.bank.bookBalance.toLocaleString()}</span></div>
                <div class="mt-2 py-1 rounded text-center fw-bold ${Math.abs(adjBank - state.bank.bookBalance) < 1 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} small">
                    ${Math.abs(adjBank - state.bank.bookBalance) < 1 ? '✓ RECONCILED' : '⚠ OUTSIDE RECONCILIATION'}
                </div>
            </div>
        `;
        this.container.appendChild(createCard('bank-rec', 'Enterprise Bank Reconciliation', 3600, -200, bankHTML));


        setTimeout(() => drawConnections(), 500);
        this.updateTransform();
    }
}

window.onload = () => { window.app = new AccuFlowApp(); };
