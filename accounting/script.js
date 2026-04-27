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

    // --- UI Engine ---
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

        // 4. Standard Cycle Cards (Legacy Migration with 2.0 visuals)
        data.transactions.forEach((t, i) => {
            this.container.appendChild(this.createCard(`t-${t.id}`, `Source: ${t.date}`, 100, 100 + (i * 150), `<div class="p-3 small">${t.desc}<br><b>$${t.amount.toLocaleString()}</b></div>`));
        });

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
        // Placeholder for new advanced curved paths
    }

    showInsight(id) {
        alert("AccuFlow 2.0 Business Insight for: " + id);
    }
}

const engine = new AccuFlowEngine();
window.engine = engine;
