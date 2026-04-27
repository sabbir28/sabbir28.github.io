/**
 * AccuFlow 2.0 - Enterprise Infinite Accounting Board
 * $1B Architecture Rewrite
 */

class AccuFlowEngine {
    constructor() {
        this.state = {
            activeYear: 2026,
            years: {
                2025: {
                    transactions: [
                        { id: 'y1-t1', date: 'Dec 15', debitAcc: 'Cash', creditAcc: 'Service Revenue', amount: 5000, desc: 'End of year service' }
                    ],
                    accounts: {
                        'Cash': { type: 'Asset', normal: 'Debit', balance: 5000 },
                        'Service Revenue': { type: 'Revenue', normal: 'Credit', balance: 5000 }
                    }
                },
                2026: {
                    transactions: [
                        { id: 't1', date: 'Jan 1', debitAcc: 'Cash', creditAcc: 'Common Stock', amount: 50000, desc: 'Initial investment' },
                        { id: 't2', date: 'Jan 15', debitAcc: 'Equipment', creditAcc: 'Cash', amount: 20000, desc: 'Asset purchase' },
                        { id: 't3', date: 'Feb 1', debitAcc: 'Supplies', creditAcc: 'Accounts Payable', amount: 3000, desc: 'Credit purchase' },
                        { id: 'a1', date: 'Feb 28', debitAcc: 'Supplies Expense', creditAcc: 'Supplies', amount: 2000, desc: 'Monthly adjustment', isAdjustment: true }
                    ],
                    accounts: {
                        'Cash': { type: 'Asset', normal: 'Debit' },
                        'Supplies': { type: 'Asset', normal: 'Debit' },
                        'Equipment': { type: 'Asset', normal: 'Debit' },
                        'Accumulated Depreciation': { type: 'Asset', normal: 'Credit' },
                        'Accounts Payable': { type: 'Liability', normal: 'Credit' },
                        'Common Stock': { type: 'Equity', normal: 'Credit' },
                        'Service Revenue': { type: 'Revenue', normal: 'Credit' },
                        'Supplies Expense': { type: 'Expense', normal: 'Debit' },
                        'Depreciation Expense': { type: 'Expense', normal: 'Debit' }
                    }
                }
            },
            inventory: [
                { id: 'inv1', name: 'Widget A', qty: 100, cost: 10 },
                { id: 'inv2', name: 'Widget B', qty: 50, cost: 20 }
            ],
            bank: {
                bookBalance: 0,
                bankBalance: 32000,
                depositsInTransit: 5000,
                outstandingChecks: 2500
            },
            canvas: { x: 50, y: 50, scale: 0.8 },
            positions: {}
        };

        this.canvas = document.getElementById('canvas');
        this.viewport = document.getElementById('viewport');
        this.svg = document.getElementById('connections-svg');
        this.container = document.getElementById('cards-container');

        this.init();
    }

    init() {
        this.setupPanning();
        this.setupZoom();
        this.render();
        window.addEventListener('resize', () => this.drawConnections());
    }

    // --- Core Logic ---
    getYearData(year = this.state.activeYear) {
        return this.state.years[year];
    }

    calculateBalances(year = this.state.activeYear) {
        const data = this.getYearData(year);
        const ledger = {};
        Object.keys(data.accounts).forEach(acc => ledger[acc] = { d: 0, c: 0 });

        data.transactions.forEach(t => {
            ledger[t.debitAcc].d += t.amount;
            ledger[t.creditAcc].c += t.amount;
        });
        return ledger;
    }

    // --- Helpers ---
    getAccColor(acc) {
        const data = this.getYearData();
        const type = data.accounts[acc]?.type;
        if (type === 'Asset') return '#0d6efd';
        if (type === 'Liability') return '#dc3545';
        if (type === 'Equity') return '#6f42c1';
        if (type === 'Revenue') return '#198754';
        if (type === 'Expense') return '#fd7e14';
        return '#6c757d';
    }

    getAccTypeClass(acc) {
        const data = this.getYearData();
        const type = data.accounts[acc]?.type;
        return type ? `card-${type.toLowerCase()}` : '';
    }

    getAccTypeRowClass(acc) {
        const data = this.getYearData();
        const type = data.accounts[acc]?.type;
        return type ? `row-${type.toLowerCase()}` : '';
    }

    calculateTrialBalance(year = this.state.activeYear) {
        const ledger = this.calculateBalances(year);
        const data = this.getYearData(year);
        const tb = [];
        Object.keys(ledger).forEach(acc => {
            const bal = data.accounts[acc].normal === 'Debit' ? ledger[acc].d - ledger[acc].c : ledger[acc].c - ledger[acc].d;
            if (bal !== 0) {
                tb.push({ acc, d: data.accounts[acc].normal === 'Debit' ? bal : 0, c: data.accounts[acc].normal === 'Credit' ? bal : 0 });
            }
        });
        return tb;
    }

    createCard(id, title, x, y, content, typeClass = '') {
        const pos = this.state.positions[id] || { x, y };
        const card = document.createElement('div');
        card.id = id;
        card.className = `card shadow-hover ${typeClass}`;
        card.style.left = `${pos.x}px`;
        card.style.top = `${pos.y}px`;
        card.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <span class="fw-bold small">${title}</span>
                <div class="d-flex gap-2">
                    <i class="bi bi-info-circle text-primary cursor-pointer" onclick="engine.showInsight('${id}')"></i>
                    <i class="bi bi-arrows-move text-muted grab-handle"></i>
                </div>
            </div>
            <div class="card-body p-0">${content}</div>
        `;

        const handle = card.querySelector('.grab-handle');
        handle.onmousedown = (e) => {
            const startX = e.clientX / this.state.canvas.scale - pos.x;
            const startY = e.clientY / this.state.canvas.scale - pos.y;

            const move = (me) => {
                const nx = me.clientX / this.state.canvas.scale - startX;
                const ny = me.clientY / this.state.canvas.scale - startY;
                pos.x = nx; pos.y = ny;
                card.style.left = `${nx}px`;
                card.style.top = `${ny}px`;
                this.state.positions[id] = { x: nx, y: ny };
                this.drawConnections();
            };
            const up = () => {
                window.removeEventListener('mousemove', move);
                window.removeEventListener('mouseup', up);
            };
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', up);
        };

        return card;
    }

    render() {
        this.container.innerHTML = '';
        const data = this.getYearData();
        const ledger = this.calculateBalances();

        // 1. Comparison Widget
        const compContent = `
            <div class="p-3">
                <div class="d-flex justify-content-between mb-2"><span>2025 Balance</span><span class="fw-bold">$5,000</span></div>
                <div class="d-flex justify-content-between border-top pt-2"><span>2026 Current</span><span class="fw-bold text-primary">$${Object.values(ledger).reduce((s, i) => s + i.d, 0).toLocaleString()}</span></div>
            </div>
        `;
        this.container.appendChild(this.createCard('comparison', 'Multi-Year Glance', 100, -200, compContent));

        // 2. Bank Reconciliation
        const bank = this.state.bank;
        const bankContent = `
            <div class="p-3 small">
                <div class="d-flex justify-content-between"><span>Bank Balance</span><span>$${bank.bankBalance.toLocaleString()}</span></div>
                <div class="d-flex justify-content-between text-success"><span>+ Deposits in Transit</span><span>$${bank.depositsInTransit.toLocaleString()}</span></div>
                <div class="d-flex justify-content-between text-danger"><span>- Outstanding Checks</span><span>($${bank.outstandingChecks.toLocaleString()})</span></div>
                <div class="fw-bold border-top mt-2 d-flex justify-content-between"><span>Adjusted Bank</span><span>$${(bank.bankBalance + bank.depositsInTransit - bank.outstandingChecks).toLocaleString()}</span></div>
            </div>
        `;
        this.container.appendChild(this.createCard('bank-rec', 'Bank Reconciliation', 600, -200, bankContent));

        // 3. Inventory Ledger
        const invContent = `
            <table class="table table-sm m-0 small">
                <thead><tr><th>Item</th><th>Qty</th><th>Cost</th><th>Total</th></tr></thead>
                <tbody>
                    ${this.state.inventory.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>$${i.cost}</td><td class="fw-bold">$${i.qty * i.cost}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
        this.container.appendChild(this.createCard('inventory', 'Inventory Ledger (FIFO)', 1100, -200, invContent));

        // 4. Standard Cycle Cards (Premium Enterprise Style)

        // 4a. General Journal
        const journalContent = `
            <table class="table table-sm m-0 small">
                <thead><tr><th>Date</th><th>Entry</th><th>Debit</th><th>Credit</th></tr></thead>
                <tbody>
                    ${data.transactions.map(t => `
                        <tr id="j-row-${t.id}" class="${this.getAccTypeRowClass(t.debitAcc)}">
                            <td>${t.date}</td>
                            <td>
                                <div class="fw-bold" style="color: ${this.getAccColor(t.debitAcc)}">${t.debitAcc}</div>
                                <div class="ps-3 text-muted" style="color: ${this.getAccColor(t.creditAcc)}">${t.creditAcc}</div>
                                ${t.isAdjustment ? '<span class="badge bg-info-subtle text-info p-1" style="font-size:0.5rem">ADJUSTMENT</span>' : ''}
                            </td>
                            <td class="text-primary fw-bold">$${t.amount.toLocaleString()}</td>
                            <td class="text-success fw-bold">$${t.amount.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        this.container.appendChild(this.createCard('journal', 'General Journal (Verified)', 600, 100, journalContent));

        // 4b. Ledgers
        const tb = this.calculateTrialBalance();
        Object.keys(ledger).forEach((acc, i) => {
            const bal = data.accounts[acc].normal === 'Debit' ? ledger[acc].d - ledger[acc].c : ledger[acc].c - ledger[acc].d;
            const content = `
                <div class="row g-0 text-center border-bottom pb-1 small">
                    <div class="col-6 border-end">Debit</div><div class="col-6">Credit</div>
                </div>
                <div class="row g-0 text-center py-2 min-vh-10" style="min-height: 50px;">
                    <div class="col-6 border-end text-primary">${ledger[acc].d ? '$' + ledger[acc].d.toLocaleString() : ''}</div>
                    <div class="col-6 text-success">${ledger[acc].c ? '$' + ledger[acc].c.toLocaleString() : ''}</div>
                </div>
                <div id="bal-${acc.replace(/\s/g, '')}" class="p-2 border-top text-center fw-bold" style="color: ${this.getAccColor(acc)}">Ending Balance: $${bal.toLocaleString()}</div>
            `;
            this.container.appendChild(this.createCard(`ledger-${acc.replace(/\s/g, '')}`, `Ledger: ${acc}`, 1100, 100 + (i * 160), content, this.getAccTypeClass(acc)));
        });

        // 4c. Trial Balance
        const tbContent = `
            <table class="table table-sm m-0 small">
                <thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead>
                <tbody>
                    ${tb.map(e => `<tr id="tb-${e.acc.replace(/\s/g, '')}"><td style="color: ${this.getAccColor(e.acc)}; font-weight: 600;">${e.acc}</td><td class="text-primary">${e.d ? '$' + e.d.toLocaleString() : ''}</td><td class="text-success">${e.c ? '$' + e.c.toLocaleString() : ''}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
        this.container.appendChild(this.createCard('tb', 'Working Trial Balance', 1600, 100, tbContent));

        // 4d. 10-Column Worksheet
        const wsContent = `
            <div class="table-responsive">
                <table class="table table-sm m-0 small text-center" style="min-width: 1000px; font-size: 0.65rem;">
                    <thead class="bg-light">
                        <tr><th rowspan="2" class="text-start">Account</th><th colspan="2">Unadjusted TB</th><th colspan="2">Adjustments</th><th colspan="2">Adjusted TB</th><th colspan="2">Income Stat.</th><th colspan="2">Balance Sheet</th></tr>
                        <tr><th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th></tr>
                    </thead>
                    <tbody>
                        ${tb.map(e => {
            const isRev = data.accounts[e.acc].type === 'Revenue';
            const isExp = data.accounts[e.acc].type === 'Expense';
            const adjD = data.transactions.filter(t => t.isAdjustment && t.debitAcc === e.acc).reduce((s, i) => s + i.amount, 0);
            const adjC = data.transactions.filter(t => t.isAdjustment && t.creditAcc === e.acc).reduce((s, i) => s + i.amount, 0);
            const finalD = Math.max(0, e.d + adjD - adjC);
            const finalC = Math.max(0, e.c + adjC - adjD);
            return `
                                <tr id="ws-${e.acc.replace(/\s/g, '')}">
                                    <td class="text-start fw-bold" style="color: ${this.getAccColor(e.acc)}">${e.acc}</td>
                                    <td>${e.d || ''}</td><td>${e.c || ''}</td>
                                    <td class="text-primary">${adjD || ''}</td><td class="text-danger">${adjC || ''}</td>
                                    <td class="fw-bold">${finalD || ''}</td><td class="fw-bold">${finalC || ''}</td>
                                    <td>${isExp ? finalD : ''}</td><td>${isRev ? finalC : ''}</td>
                                    <td>${!isRev && !isExp ? finalD : ''}</td><td>${!isRev && !isExp ? finalC : ''}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        const wsCard = this.createCard('ws', 'Enterprise 10-Column Worksheet', 2100, 100, wsContent);
        wsCard.style.width = '1000px';
        this.container.appendChild(wsCard);

        // 4e. Comparative Income Statement
        const netIncome = tb.filter(e => data.accounts[e.acc].type === 'Revenue').reduce((s, i) => s + i.c, 0) - tb.filter(e => data.accounts[e.acc].type === 'Expense').reduce((s, i) => s + i.d, 0);
        const isContent = `
            <div class="p-3">
                <div class="row fw-bold border-bottom pb-1 mb-2 small text-muted"><div class="col-6">Description</div><div class="col-3 text-end">2026</div><div class="col-3 text-end">2025</div></div>
                <div class="fw-bold text-success mb-1 small">REVENUES</div>
                ${tb.filter(e => data.accounts[e.acc].type === 'Revenue').map(e => `<div class="row small mb-1"><div class="col-6">${e.acc}</div><div class="col-3 text-end">$${e.c.toLocaleString()}</div><div class="col-3 text-end">$5,000</div></div>`).join('')}
                <div class="fw-bold text-danger mt-3 mb-1 small">EXPENSES</div>
                ${tb.filter(e => data.accounts[e.acc].type === 'Expense').map(e => `<div class="row small mb-1"><div class="col-6">${e.acc}</div><div class="col-3 text-end">$${e.d.toLocaleString()}</div><div class="col-3 text-end">$0</div></div>`).join('')}
                <div class="row fw-bold border-top mt-3 pt-2 text-primary">
                    <div class="col-6">NET INCOME</div>
                    <div class="col-3 text-end">$${netIncome.toLocaleString()}</div>
                    <div class="col-3 text-end">$5,000</div>
                </div>
            </div>
        `;
        this.container.appendChild(this.createCard('is', 'Comparative Income Statement', 3200, 100, isContent));

        // 4f. Comparative Balance Sheet
        const totalAssets = tb.filter(e => data.accounts[e.acc].type === 'Asset').reduce((s, i) => s + (i.d - i.c), 0);
        const totalLE = (tb.filter(e => ['Liability', 'Equity'].includes(data.accounts[e.acc].type)).reduce((s, i) => s + (i.c - i.d), 0) + netIncome);
        const bsContent = `
            <div class="row g-0">
                <div class="col-6 border-end p-3">
                    <h6 class="fw-bold text-primary border-bottom pb-1 small">ASSETS</h6>
                    ${tb.filter(e => data.accounts[e.acc].type === 'Asset').map(e => `<div class="d-flex justify-content-between small"><span>${e.acc}</span><span>$${(e.d - e.c).toLocaleString()}</span></div>`).join('')}
                    <div class="d-flex justify-content-between fw-bold border-top mt-2 pt-1 text-primary"><span>Total Assets</span><span>$${totalAssets.toLocaleString()}</span></div>
                </div>
                <div class="col-6 p-3">
                    <h6 class="fw-bold text-danger border-bottom pb-1 small">LIABILITIES & EQUITY</h6>
                    ${tb.filter(e => data.accounts[e.acc].type === 'Liability').map(e => `<div class="d-flex justify-content-between small"><span>${e.acc}</span><span>$${(e.c - e.d).toLocaleString()}</span></div>`).join('')}
                    ${tb.filter(e => data.accounts[e.acc].type === 'Equity').map(e => `<div class="d-flex justify-content-between small"><span>${e.acc}</span><span>$${(e.c - e.d).toLocaleString()}</span></div>`).join('')}
                    <div class="d-flex justify-content-between small text-success"><span>Retained Earnings</span><span>$${netIncome.toLocaleString()}</span></div>
                    <div class="d-flex justify-content-between fw-bold border-top mt-2 pt-1 text-danger"><span>Total L&E</span><span>$${totalLE.toLocaleString()}</span></div>
                </div>
            </div>
        `;
        const bsCard = this.createCard('bs', 'Comparative Balance Sheet', 3700, 100, bsContent);
        bsCard.style.width = '700px';
        this.container.appendChild(bsCard);

        // 4g. Master Equation Dashboard
        const eqContent = `
            <div class="p-3 text-center">
                <div class="row align-items-center">
                    <div class="col-5"><div class="h3 fw-bold text-primary">$${totalAssets.toLocaleString()}</div><small>ASSETS</small></div>
                    <div class="col-2 h3 text-muted">=</div>
                    <div class="col-5"><div class="h3 fw-bold text-dark">$${totalLE.toLocaleString()}</div><small>LIABILITIES + EQUITY</small></div>
                </div>
                <div class="mt-3 py-1 rounded shadow-sm ${Math.abs(totalAssets - totalLE) < 1 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} fw-bold">
                    ${Math.abs(totalAssets - totalLE) < 1 ? '✓ SYSTEM BALANCED' : '✗ SYSTEM UNBALANCED'}
                </div>
            </div>
        `;
        const eqCard = this.createCard('eq', 'Master Control Engine', 1600, -400, eqContent);
        eqCard.style.width = '600px';
        this.container.appendChild(eqCard);


        // Trigger connections
        setTimeout(() => this.drawConnections(), 200);
        this.updateTransform();
    }


    // --- Interaction Systems ---
    setupPanning() {
        let isDragging = false;
        let startX, startY;

        this.viewport.onmousedown = (e) => {
            if (e.target !== this.viewport && e.target !== this.canvas) return;
            isDragging = true;
            startX = e.clientX - this.state.canvas.x;
            startY = e.clientY - this.state.canvas.y;
            this.viewport.style.cursor = 'grabbing';
        };

        window.onmousemove = (e) => {
            if (!isDragging) return;
            this.state.canvas.x = e.clientX - startX;
            this.state.canvas.y = e.clientY - startY;
            this.updateTransform();
        };

        window.onmouseup = () => {
            isDragging = false;
            this.viewport.style.cursor = 'grab';
        };
    }

    setupZoom() {
        this.viewport.onwheel = (e) => {
            e.preventDefault();
            const s = this.state.canvas.scale;
            const ns = Math.min(Math.max(0.1, s + (e.deltaY > 0 ? -0.1 : 0.1)), 3);

            const rect = this.viewport.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            this.state.canvas.x -= (mx - this.state.canvas.x) * (ns / s - 1);
            this.state.canvas.y -= (my - this.state.canvas.y) * (ns / s - 1);
            this.state.canvas.scale = ns;
            this.updateTransform();
        };
    }

    updateTransform() {
        this.canvas.style.transform = `translate(${this.state.canvas.x}px, ${this.state.canvas.y}px) scale(${this.state.canvas.scale})`;
        this.drawConnections();
    }

    drawConnections() {
        this.svg.innerHTML = '';
        const s = this.state.canvas.scale;
        const canvasRect = this.canvas.getBoundingClientRect();

        const drawPath = (fromId, toId, color = '#6c757d') => {
            const fromEl = document.getElementById(fromId);
            const toEl = document.getElementById(toId);
            if (!fromEl || !toEl) return;

            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();

            const x1 = (fromRect.right - canvasRect.left) / s;
            const y1 = (fromRect.top + fromRect.height / 2 - canvasRect.top) / s;
            const x2 = (toRect.left - canvasRect.left) / s;
            const y2 = (toRect.top + toRect.height / 2 - canvasRect.top) / s;

            const cp1x = x1 + (x2 - x1) / 2;
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp1x} ${y2}, ${x2} ${y2}`);
            path.setAttribute("class", "svg-line");
            path.style.stroke = color;
            this.svg.appendChild(path);
        };

        const data = this.getYearData();
        data.transactions.forEach(t => {
            drawPath(`j-row-${t.id}`, `ledger-${t.debitAcc.replace(/\s/g, '')}`, this.getAccColor(t.debitAcc));
            drawPath(`j-row-${t.id}`, `ledger-${t.creditAcc.replace(/\s/g, '')}`, this.getAccColor(t.creditAcc));
        });

        Object.keys(data.accounts).forEach(acc => {
            const slug = acc.replace(/\s/g, '');
            drawPath(`bal-${slug}`, `tb-${slug}`, this.getAccColor(acc));
        });
    }


    showInsight(id) {
        alert("AccuFlow 2.0 Business Insight for: " + id);
    }
}

const engine = new AccuFlowEngine();
window.engine = engine;
