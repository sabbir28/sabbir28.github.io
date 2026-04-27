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
            if (e.target !== this.viewport && e.target !== this.canvas) return;
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
    }

    updateTransform() {
        this.canvas.style.transform = `translate(${state.canvas.x}px, ${state.canvas.y}px) scale(${state.canvas.scale})`;
        drawConnections();
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

        // 4. Master Control
        const totalAssets = tb.filter(e => data.accounts[e.acc].type === 'Asset').reduce((s, i) => s + (e.d - e.c), 0); // Need fix here in loop
        // Simplified for now
        this.container.appendChild(createCard('eq', 'Master Dashboard', 100, -200, '<div class="p-3 text-center h4 fw-bold">System Online</div>'));

        setTimeout(() => drawConnections(), 300);
        this.updateTransform();
    }
}

window.onload = () => { window.app = new AccuFlowApp(); };
