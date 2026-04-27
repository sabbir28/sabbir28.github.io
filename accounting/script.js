/**
 * AccuFlow Canvas - Infinite Accounting Board
 */

// --- Configuration & State ---
const state = {
    transactions: [
        { id: 't1', date: 'Jan 1', debitAcc: 'Cash', creditAcc: 'Common Stock', amount: 50000, desc: 'Started company with cash investment' },
        { id: 't2', date: 'Jan 3', debitAcc: 'Equipment', creditAcc: 'Cash', amount: 15000, desc: 'Purchased machinery with cash' },
        { id: 't3', date: 'Jan 5', debitAcc: 'Supplies', creditAcc: 'Accounts Payable', amount: 2000, desc: 'Bought office supplies on credit' },
        { id: 't4', date: 'Jan 8', debitAcc: 'Accounts Receivable', creditAcc: 'Service Revenue', amount: 8000, desc: 'Performed consulting services on account' },
        { id: 't5', date: 'Jan 15', debitAcc: 'Cash', creditAcc: 'Accounts Receivable', amount: 4000, desc: 'Received partial payment from client' },
        { id: 't6', date: 'Jan 20', debitAcc: 'Accounts Payable', creditAcc: 'Cash', amount: 1000, desc: 'Paid part of the library owed' },
        { id: 't7', date: 'Jan 30', debitAcc: 'Salary Expense', creditAcc: 'Cash', amount: 3500, desc: 'Paid employee salaries' },
        { id: 't8', date: 'Feb 1', debitAcc: 'Prepaid Rent', creditAcc: 'Cash', amount: 6000, desc: 'Paid 6 months rent in advance' },
        { id: 't9', date: 'Feb 5', debitAcc: 'Cash', creditAcc: 'Service Revenue', amount: 12000, desc: 'Received cash for consulting services' },
        { id: 't10', date: 'Feb 10', debitAcc: 'Drawings', creditAcc: 'Cash', amount: 1000, desc: 'Owner withdrew cash for personal use' },
        // Adjustments
        { id: 'a1', date: 'Feb 28', debitAcc: 'Supplies Expense', creditAcc: 'Supplies', amount: 1500, desc: 'Supplies used during the month', isAdjustment: true },
        { id: 'a2', date: 'Feb 28', debitAcc: 'Rent Expense', creditAcc: 'Prepaid Rent', amount: 1000, desc: 'Monthly rent expired', isAdjustment: true },
        { id: 'a3', date: 'Feb 28', debitAcc: 'Depreciation Expense', creditAcc: 'Accumulated Depreciation', amount: 250, desc: 'Monthly depreciation on equipment', isAdjustment: true }
    ],
    accounts: {
        'Cash': { type: 'Asset', normal: 'Debit' },
        'Accounts Receivable': { type: 'Asset', normal: 'Debit' },
        'Supplies': { type: 'Asset', normal: 'Debit' },
        'Equipment': { type: 'Asset', normal: 'Debit' },
        'Prepaid Rent': { type: 'Asset', normal: 'Debit' },
        'Accumulated Depreciation': { type: 'Asset', normal: 'Credit' }, // Contra-asset
        'Accounts Payable': { type: 'Liability', normal: 'Credit' },
        'Common Stock': { type: 'Equity', normal: 'Credit' },
        'Drawings': { type: 'Equity', normal: 'Debit' },
        'Service Revenue': { type: 'Revenue', normal: 'Credit' },
        'Salary Expense': { type: 'Expense', normal: 'Debit' },
        'Supplies Expense': { type: 'Expense', normal: 'Debit' },
        'Rent Expense': { type: 'Expense', normal: 'Debit' },
        'Depreciation Expense': { type: 'Expense', normal: 'Debit' }
    },


    canvas: { x: 50, y: 50, scale: 1, isDragging: false, startX: 0, startY: 0 },
    cardDragging: { id: null, startX: 0, startY: 0 },
    positions: {} // Persistence for card positions
};



// --- Panning Logic ---
const viewport = document.getElementById('viewport');
const canvas = document.getElementById('canvas');

viewport.onmousedown = (e) => {
    state.canvas.isDragging = true;
    state.canvas.startX = e.clientX - state.canvas.x;
    state.canvas.startY = e.clientY - state.canvas.y;
};

window.onmousemove = (e) => {
    if (!state.canvas.isDragging) return;
    state.canvas.x = e.clientX - state.canvas.startX;
    state.canvas.y = e.clientY - state.canvas.startY;
    updateTransform();
};

window.onmouseup = () => {
    state.canvas.isDragging = false;
};

function updateTransform() {
    canvas.style.transform = `translate(${state.canvas.x}px, ${state.canvas.y}px) scale(${state.canvas.scale})`;
    drawConnections();
}

viewport.onwheel = (e) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    const delta = -e.deltaY;
    const oldScale = state.canvas.scale;
    const newScale = Math.min(Math.max(0.1, oldScale + delta * zoomSpeed), 5);

    // Zoom toward mouse pointer
    const rect = viewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    state.canvas.x -= (mouseX - state.canvas.x) * (newScale / oldScale - 1);
    state.canvas.y -= (mouseY - state.canvas.y) * (newScale / oldScale - 1);

    state.canvas.scale = newScale;
    updateTransform();
};



document.getElementById('reset-view').onclick = () => {
    state.canvas.x = 50;
    state.canvas.y = 50;
    updateTransform();
};


// --- Accounting Logic ---

function getLedger() {
    const ledger = {};
    Object.keys(state.accounts).forEach(acc => ledger[acc] = { d: [], c: [] });
    state.transactions.forEach(t => {
        ledger[t.debitAcc].d.push({ amount: t.amount, ref: t.id });
        ledger[t.creditAcc].c.push({ amount: t.amount, ref: t.id });
    });
    return ledger;
}

function getTrialBalance() {
    const ledger = getLedger();
    const tb = [];
    Object.keys(ledger).forEach(acc => {
        const dSum = ledger[acc].d.reduce((s, i) => s + i.amount, 0);
        const cSum = ledger[acc].c.reduce((s, i) => s + i.amount, 0);
        const bal = state.accounts[acc].normal === 'Debit' ? dSum - cSum : cSum - dSum;
        if (bal !== 0) {
            tb.push({ acc, d: state.accounts[acc].normal === 'Debit' ? bal : 0, c: state.accounts[acc].normal === 'Credit' ? bal : 0 });
        }
    });
    return tb;
}

// --- Rendering Logic ---

function createCard(id, title, x, y, content, typeClass = '') {
    const pos = state.positions[id] || { x, y };
    const card = document.createElement('div');
    card.id = id;
    card.className = `card animate-fade ${typeClass}`;
    card.style.left = `${pos.x}px`;
    card.style.top = `${pos.y}px`;
    card.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="m-0 fw-bold">${title}</h6>
            <div class="d-flex gap-2 align-items-center">
                <i class="bi bi-question-circle text-primary cursor-pointer" onclick="showHelp('${id}')" title="Explain This"></i>
                <i class="bi bi-arrows-move small text-muted"></i>
            </div>
        </div>

        <div class="card-body p-0">${content}</div>
        <div class="connection-point dot-in"></div>
        <div class="connection-point dot-out"></div>
    `;

    // Interactivity: Dragging
    const header = card.querySelector('.card-header');
    header.onmousedown = (e) => {
        e.stopPropagation();
        state.cardDragging.id = id;
        state.cardDragging.startX = e.clientX / state.canvas.scale - pos.x;
        state.cardDragging.startY = e.clientY / state.canvas.scale - pos.y;
    };

    return card;
}

const explanations = {
    'journal-card': 'The General Journal is the book of original entry where transactions are recorded in chronological order using double-entry accounting (Debits = Credits).',
    'ledger': 'The General Ledger (T-Accounts) categorizes transactions by account, allowing you to see the individual flow of every dollar and the final ending balance.',
    'tb-card': 'The Trial Balance verifies that total debits equal total credits after all ledger postings, ensuring the mathematical accuracy of the books.',
    'ws-card': 'The 10-Column Worksheet is an internal tool used to calculate adjustments (like used supplies or expired rent) before preparing formal financial statements.',
    'is-card': 'The Income Statement reports the company\'s financial performance over a specific period by subtracting Expenses from Revenues to find Net Income.',
    'bs-card': 'The Balance Sheet (Position Statement) shows the company\'s financial standing at a point in time, following the Master Equation: Assets = Liabilities + Equity.',
    'equation-card': 'The Accounting Equation (A = L + E) is the foundation of all accounting. Every transaction affects at least two accounts to keep this equation in perfect balance.',
    'cf-card': 'The Statement of Cash Flows shows where cash came from and where it went, categorized into Operating (daily business), Investing (assets), and Financing (owners/loans).'
};

function showHelp(id) {
    const key = Object.keys(explanations).find(k => id.startsWith(k)) || 'ledger';
    const text = explanations[key];

    // Create a simple toast-like overlay
    let overlay = document.getElementById('help-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'help-overlay';
        overlay.className = 'fixed-top w-100 h-100 d-flex align-items-center justify-content-center';
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '9999';
        overlay.onclick = () => overlay.remove();
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div class="bg-white p-4 rounded shadow-lg animate-fade" style="max-width: 500px;">
            <h5 class="fw-bold border-bottom pb-2 mb-3">Accounting Insight</h5>
            <p>${text}</p>
            <div class="text-end mt-3"><button class="btn btn-primary btn-sm">Got it!</button></div>
        </div>
    `;
}


window.addEventListener('mousemove', (e) => {
    if (state.cardDragging.id) {
        const el = document.getElementById(state.cardDragging.id);
        const x = e.clientX / state.canvas.scale - state.cardDragging.startX;
        const y = e.clientY / state.canvas.scale - state.cardDragging.startY;
        state.positions[state.cardDragging.id] = { x, y };
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        drawConnections();
    }
});

window.addEventListener('mouseup', () => {
    state.cardDragging.id = null;
});

function getAccTypeClass(acc) {
    const type = state.accounts[acc]?.type;
    if (type === 'Asset') return 'card-asset';
    if (type === 'Liability') return 'card-liability';
    if (type === 'Equity') return 'card-equity';
    if (type === 'Revenue') return 'card-revenue';
    if (type === 'Expense') return 'card-expense';
    return '';
}

function getAccTypeRowClass(acc) {
    const type = state.accounts[acc]?.type;
    if (type === 'Asset') return 'row-asset';
    if (type === 'Liability') return 'row-liability';
    if (type === 'Equity') return 'row-equity';
    if (type === 'Revenue') return 'row-revenue';
    if (type === 'Expense') return 'row-expense';
    return '';
}

function getAccColor(acc) {
    const type = state.accounts[acc]?.type;
    if (type === 'Asset') return '#0d6efd';
    if (type === 'Liability') return '#dc3545';
    if (type === 'Equity') return '#6f42c1';
    if (type === 'Revenue') return '#198754';
    if (type === 'Expense') return '#fd7e14';
    return '#6c757d';
}





function renderAll() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    // 1. Transaction Source Cards (Column 1)
    state.transactions.forEach((t, i) => {
        const card = createCard(`t-card-${t.id}`, `Source: ${t.date}`, 100, 100 + (i * 220), `
            <div class="p-3">
                <p class="small mb-1">${t.desc}</p>
                <div class="fw-bold">$${t.amount.toLocaleString()}</div>
            </div>
        `);
        container.appendChild(card);
    });

    // 2. General Journal Card (Column 2)
    const journalContent = `
        <table class="table table-sm m-0">
            <thead><tr><th>Date</th><th>Entry</th><th>Debit</th><th>Credit</th></tr></thead>
            <tbody>
                ${state.transactions.map(t => `
                    <tr id="j-row-${t.id}" class="${getAccTypeRowClass(t.debitAcc)}">
                        <td>${t.date}</td>
                        <td id="j-acc-${t.id}">
                            <div class="fw-bold" style="color: ${getAccColor(t.debitAcc)}">${t.debitAcc}</div>
                            <div class="ps-3 text-muted" style="color: ${getAccColor(t.creditAcc)}">${t.creditAcc}</div>
                            ${t.isAdjustment ? '<span class="badge bg-warning text-dark p-1 mt-1" style="font-size:0.5rem">ADJUSTMENT</span>' : ''}
                        </td>
                        <td class="debit-val">$${t.amount.toLocaleString()}</td>
                        <td class="credit-val">$${t.amount.toLocaleString()}</td>
                    </tr>
                `).join('')}



            </tbody>
        </table>
    `;
    container.appendChild(createCard('journal-card', 'General Journal', 600, 100, journalContent));

    // 3. General Ledger T-Accounts (Column 3)
    const ledger = getLedger();
    Object.keys(ledger).forEach((acc, i) => {
        const tContent = `
            <table class="table table-sm t-account-table m-0">
                <thead><tr><th>Debit</th><th>Credit</th></tr></thead>
                <tbody>
                    <tr>
                        <td>${ledger[acc].d.map(item => `<div>$${item.amount}</div>`).join('')}</td>
                        <td>${ledger[acc].c.map(item => `<div>$${item.amount}</div>`).join('')}</td>
                    </tr>
                </tbody>
            </table>
            <div id="ledger-bal-${acc.replace(/\s/g, '')}" class="p-2 border-top text-center fw-bold small" style="color: ${getAccColor(acc)}">Balance: $${(ledger[acc].d.reduce((s, i) => s + i.amount, 0) - ledger[acc].c.reduce((s, i) => s + i.amount, 0)).toLocaleString()}</div>
        `;
        const card = createCard(`ledger-${acc.replace(/\s/g, '')}`, `Ledger: ${acc}`, 1100, 100 + (i * 180), tContent, getAccTypeClass(acc));
        card.querySelector('.card-header h6').style.color = getAccColor(acc);
        container.appendChild(card);



    });

    // 4. Trial Balance (Column 4)
    const tb = getTrialBalance();
    const tbContent = `
        <table class="table table-sm m-0">
            <thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead>
            <tbody>
                ${tb.map(e => `<tr id="tb-row-${e.acc.replace(/\s/g, '')}"><td style="color: ${getAccColor(e.acc)}; font-weight: 600;">${e.acc}</td><td class="debit-val">${e.d ? '$' + e.d.toLocaleString() : ''}</td><td class="credit-val">${e.c ? '$' + e.c.toLocaleString() : ''}</td></tr>`).join('')}
                <tr class="fw-bold table-secondary"><td>Total</td><td>$${tb.reduce((s, i) => s + i.d, 0).toLocaleString()}</td><td>$${tb.reduce((s, i) => s + i.c, 0).toLocaleString()}</td></tr>
            </tbody>


        </table>
    `;
    container.appendChild(createCard('tb-card', 'Trial Balance', 1600, 100, tbContent));

    // 5. Worksheet (Column 5) - Wider Card
    const wsContent = `
        <div class="table-responsive">
            <table class="table table-sm m-0" style="min-width: 800px; font-size: 0.7rem;">
                <thead>
                    <tr class="text-center">
                        <th rowspan="2">Account</th>
                        <th colspan="2">Trial Balance</th>
                        <th colspan="2">Adjustments</th>
                        <th colspan="2">Adjusted TB</th>
                        <th colspan="2">Income Stat.</th>
                        <th colspan="2">Balance Sheet</th>
                    </tr>
                    <tr class="text-center">
                        <th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th><th>D</th><th>C</th>
                    </tr>
                </thead>
                <tbody>
                    ${tb.map(e => {
        const isRev = state.accounts[e.acc].type === 'Revenue';
        const isExp = state.accounts[e.acc].type === 'Expense';
        const isAsset = state.accounts[e.acc].type === 'Asset';
        const isLibEq = ['Liability', 'Equity'].includes(state.accounts[e.acc].type);

        // Calculate adjustments
        const adjD = state.transactions.filter(t => t.isAdjustment && t.debitAcc === e.acc).reduce((s, i) => s + i.amount, 0);
        const adjC = state.transactions.filter(t => t.isAdjustment && t.creditAcc === e.acc).reduce((s, i) => s + i.amount, 0);

        // Adjusted Balance
        let adjBalD = e.d + adjD;
        let adjBalC = e.c + adjC;

        // Netting
        if (state.accounts[e.acc].normal === 'Debit') {
            adjBalD = (e.d || 0) + adjD - adjC;
            adjBalC = 0;
        } else {
            adjBalC = (e.c || 0) + adjC - adjD;
            adjBalD = 0;
        }

        return `
                            <tr id="ws-row-${e.acc.replace(/\s/g, '')}">
                                <td style="color: ${getAccColor(e.acc)}; font-weight: bold;">${e.acc}</td>
                                <td>${e.d ? '$' + e.d.toLocaleString() : ''}</td><td>${e.c ? '$' + e.c.toLocaleString() : ''}</td>
                                <td class="text-primary">${adjD ? '$' + adjD.toLocaleString() : ''}</td><td class="text-danger">${adjC ? '$' + adjC.toLocaleString() : ''}</td>
                                <td class="fw-bold">${adjBalD ? '$' + adjBalD.toLocaleString() : ''}</td><td class="fw-bold">${adjBalC ? '$' + adjBalC.toLocaleString() : ''}</td>
                                <td>${isExp ? '$' + adjBalD.toLocaleString() : ''}</td><td>${isRev ? '$' + adjBalC.toLocaleString() : ''}</td>
                                <td>${isAsset ? '$' + adjBalD.toLocaleString() : ''}</td><td>${isLibEq ? '$' + adjBalC.toLocaleString() : ''}</td>
                            </tr>
                        `;
    }).join('')}

                </tbody>

            </table>
        </div>
    `;
    const wsCard = createCard('ws-card', '10-Column Worksheet', 2100, 100, wsContent);
    wsCard.style.width = '900px';
    container.appendChild(wsCard);


    // 6. Income Statement (Column 6)
    const revs = tb.filter(e => state.accounts[e.acc].type === 'Revenue');
    const exps = tb.filter(e => state.accounts[e.acc].type === 'Expense');
    const netIncome = revs.reduce((s, i) => s + i.c, 0) - exps.reduce((s, i) => s + i.d, 0);

    const isContent = `
        <div class="p-3">
            <h6 class="fw-bold border-bottom pb-2">Revenues</h6>
            ${revs.map(e => `<div id="is-row-${e.acc.replace(/\s/g, '')}" class="d-flex justify-content-between"><span>${e.acc}</span><span>$${e.c}</span></div>`).join('')}
            <h6 class="fw-bold border-bottom pb-2 mt-3">Expenses</h6>
            ${exps.map(e => `<div id="is-row-${e.acc.replace(/\s/g, '')}" class="d-flex justify-content-between"><span>${e.acc}</span><span>$${e.d}</span></div>`).join('')}
            <div class="mt-3 pt-2 border-top fw-bold text-success d-flex justify-content-between">
                <span>Net Income</span>
                <span>$${netIncome.toLocaleString()}</span>
            </div>
        </div>

    `;
    container.appendChild(createCard('is-card', 'Income Statement', 3100, 100, isContent));

    // 7. Balance Sheet (Column 7) - T-Account Layout
    const bsContent = `
        <div class="p-0 container-fluid">
            <div class="row g-0">
                <div class="col-6 border-end p-3">
                    <h6 class="fw-bold border-bottom pb-2 text-primary">ASSETS</h6>
                    ${tb.filter(e => state.accounts[e.acc].type === 'Asset').map(e => `
                        <div id="bs-row-${e.acc.replace(/\s/g, '')}" class="d-flex justify-content-between small mb-1">
                            <span>${e.acc}</span><span class="fw-bold">$${e.d.toLocaleString()}</span>
                        </div>
                    `).join('')}
                    <div class="mt-4 pt-2 border-top fw-bold text-primary d-flex justify-content-between">
                        <span>Total Assets</span>
                        <span>$${tb.filter(e => state.accounts[e.acc].type === 'Asset').reduce((s, i) => s + (i.d - i.c), 0).toLocaleString()}</span>
                    </div>
                </div>
                <div class="col-6 p-3 bg-light">
                    <h6 class="fw-bold border-bottom pb-2 text-danger">LIABILITIES & EQUITY</h6>
                    <div class="mb-3">
                        <small class="text-muted fw-bold">LIABILITIES</small>
                        ${tb.filter(e => state.accounts[e.acc].type === 'Liability').map(e => `
                            <div id="bs-row-${e.acc.replace(/\s/g, '')}" class="d-flex justify-content-between small mb-1">
                                <span>${e.acc}</span><span class="fw-bold">$${(e.c - e.d).toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div>
                        <small class="text-muted fw-bold">EQUITY</small>
                        ${tb.filter(e => state.accounts[e.acc].type === 'Equity').map(e => `
                            <div id="bs-row-${e.acc.replace(/\s/g, '')}" class="d-flex justify-content-between small mb-1">
                                <span>${e.acc}</span><span class="fw-bold">$${(e.c - e.d).toLocaleString()}</span>
                            </div>
                        `).join('')}
                        <div class="d-flex justify-content-between small text-success">
                            <span>Retained Earnings</span><span class="fw-bold">$${netIncome.toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="mt-3 pt-2 border-top fw-bold text-danger d-flex justify-content-between">
                        <span>Total L & E</span>
                        <span>$${(tb.filter(e => ['Liability', 'Equity'].includes(state.accounts[e.acc].type)).reduce((s, i) => s + (i.c - i.d), 0) + netIncome).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    const bsCard = createCard('bs-card', 'Balance Sheet (Position Statement)', 3600, 100, bsContent);
    bsCard.style.width = '700px';
    container.appendChild(bsCard);

    // 8. Accounting Equation Card (Floating at top)
    const totalAssets = tb.filter(e => state.accounts[e.acc].type === 'Asset').reduce((s, i) => s + i.d, 0);
    const totalLiabilities = tb.filter(e => state.accounts[e.acc].type === 'Liability').reduce((s, i) => s + (i.c - i.d), 0);
    const totalEquity = tb.filter(e => state.accounts[e.acc].type === 'Equity').reduce((s, i) => s + (i.c - i.d), 0) + netIncome;

    const eqContent = `
        <div class="p-3 text-center">
            <div class="d-flex justify-content-around align-items-center">
                <div class="px-3">
                    <div class="small text-muted">ASSETS</div>
                    <div class="h4 fw-bold text-primary">$${totalAssets.toLocaleString()}</div>
                </div>
                <div class="h4 text-muted">=</div>
                <div class="px-3">
                    <div class="small text-muted">LIABILITIES</div>
                    <div class="h4 fw-bold text-danger">$${totalLiabilities.toLocaleString()}</div>
                </div>
                <div class="h4 text-muted">+</div>
                <div class="px-3">
                    <div class="small text-muted">EQUITY</div>
                    <div class="h4 fw-bold text-success">$${totalEquity.toLocaleString()}</div>
                </div>
            </div>
            <div class="mt-2 border-top pt-2 small ${totalAssets === (totalLiabilities + totalEquity) ? 'text-success' : 'text-danger fw-bold'}">
                ${totalAssets === (totalLiabilities + totalEquity) ? '✓ Equation Balanced' : '✗ Equation Unbalanced'}
            </div>
        </div>
    `;
    const eqCard = createCard('equation-card', 'Accounting Equation', 1100, -200, eqContent);
    eqCard.style.width = '600px';
    container.appendChild(eqCard);

    // 9. Cash Flow Statement (Column 8) - Indirect Method
    const cashStart = 0;
    const depExp = state.transactions.filter(t => t.debitAcc === 'Depreciation Expense').reduce((s, i) => s + i.amount, 0);
    const arInc = tb.find(e => e.acc === 'Accounts Receivable')?.d || 0;
    const suppInc = tb.find(e => e.acc === 'Supplies')?.d || 0;
    const rentInc = tb.find(e => e.acc === 'Prepaid Rent')?.d || 0;
    const apInc = tb.find(e => e.acc === 'Accounts Payable')?.c || 0;

    const opCash = netIncome + depExp - arInc - suppInc - rentInc + apInc;
    const invCash = -state.transactions.filter(t => t.debitAcc === 'Equipment' && t.creditAcc === 'Cash').reduce((s, i) => s + i.amount, 0);
    const finCash = state.transactions.filter(t => t.creditAcc === 'Common Stock').reduce((s, i) => s + i.amount, 0) - state.transactions.filter(t => t.debitAcc === 'Drawings').reduce((s, i) => s + i.amount, 0);
    const netCash = opCash + invCash + finCash;

    const cfContent = `
        <div class="p-3 small">
            <h6 class="fw-bold border-bottom pb-1">Operating Activities</h6>
            <div class="d-flex justify-content-between"><span>Net Income</span><span>$${netIncome.toLocaleString()}</span></div>
            <div class="d-flex justify-content-between text-muted"><span>+ Depreciation</span><span>$${depExp.toLocaleString()}</span></div>
            <div class="d-flex justify-content-between text-muted"><span>- Increase in AR</span><span>($${arInc.toLocaleString()})</span></div>
            <div class="d-flex justify-content-between text-muted"><span>- Increase in Supplies</span><span>($${suppInc.toLocaleString()})</span></div>
            <div class="d-flex justify-content-between text-muted"><span>- Increase in Prepaid</span><span>($${rentInc.toLocaleString()})</span></div>
            <div class="d-flex justify-content-between text-muted"><span>+ Increase in AP</span><span>$${apInc.toLocaleString()}</span></div>
            <div class="fw-bold border-top mt-1 d-flex justify-content-between"><span>Net Operating</span><span>$${opCash.toLocaleString()}</span></div>

            <h6 class="fw-bold border-bottom pb-1 mt-3">Investing Activities</h6>
            <div class="d-flex justify-content-between text-muted"><span>Purchase Equipment</span><span>($${Math.abs(invCash).toLocaleString()})</span></div>
            <div class="fw-bold border-top mt-1 d-flex justify-content-between"><span>Net Investing</span><span>($${Math.abs(invCash).toLocaleString()})</span></div>

            <h6 class="fw-bold border-bottom pb-1 mt-3">Financing Activities</h6>
            <div class="d-flex justify-content-between text-muted"><span>Common Stock Inv.</span><span>$${state.transactions.filter(t => t.creditAcc === 'Common Stock').reduce((s, i) => s + i.amount, 0).toLocaleString()}</span></div>
            <div class="d-flex justify-content-between text-muted"><span>Owner Drawings</span><span>($${state.transactions.filter(t => t.debitAcc === 'Drawings').reduce((s, i) => s + i.amount, 0).toLocaleString()})</span></div>
            <div class="fw-bold border-top mt-1 d-flex justify-content-between"><span>Net Financing</span><span>$${finCash.toLocaleString()}</span></div>

            <div class="h5 fw-bold border-top pt-2 mt-3 text-primary d-flex justify-content-between">
                <span>Net Cash Flow</span>
                <span>$${netCash.toLocaleString()}</span>
            </div>
        </div>
    `;
    const cfCard = createCard('cf-card', 'Statement of Cash Flows', 4400, 100, cfContent);
    cfCard.style.width = '350px';
    container.appendChild(cfCard);




    // Wait for DOM to settle then draw lines
    setTimeout(drawConnections, 100);
}

// --- Connection Drawing ---

function drawConnections() {
    const svg = document.getElementById('connections-svg');
    svg.innerHTML = svg.innerHTML.split('</defs>')[0] + '</defs>'; // Keep defs

    // Connect Source to Journal Rows
    state.transactions.forEach(t => {
        drawLine(`t-card-${t.id}`, `j-row-${t.id}`, '#6c757d');

        // Connect Journal Acc names to specific Ledger Cards with unique colors
        drawLine(`j-row-${t.id}`, `ledger-${t.debitAcc.replace(/\s/g, '')}`, getAccColor(t.debitAcc));
        drawLine(`j-row-${t.id}`, `ledger-${t.creditAcc.replace(/\s/g, '')}`, getAccColor(t.creditAcc));
    });

    // Granular Row tracking with unique account colors
    Object.keys(state.accounts).forEach(acc => {
        const slug = acc.replace(/\s/g, '');
        const color = getAccColor(acc);

        // Ledger Balance -> Trial Balance Row
        drawLine(`ledger-bal-${slug}`, `tb-row-${slug}`, color);

        // Trial Balance Row -> Worksheet Row
        drawLine(`tb-row-${slug}`, `ws-row-${slug}`, color);

        // Worksheet Row -> Statement Row
        const isRow = document.getElementById(`is-row-${slug}`);
        const bsRow = document.getElementById(`bs-row-${slug}`);

        if (isRow) drawLine(`ws-row-${slug}`, `is-row-${slug}`, color);
        if (bsRow) drawLine(`ws-row-${slug}`, `bs-row-${slug}`, color);
    });
}






function drawLine(fromId, toId, color = '#6c757d') {
    const fromEl = document.getElementById(fromId);
    const toEl = document.getElementById(toId);
    const svg = document.getElementById('connections-svg');

    if (!fromEl || !toEl) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const s = state.canvas.scale;

    // Calculate relative coordinates in canvas space (accounting for scale)
    const x1 = (fromRect.right - canvasRect.left) / s;
    const y1 = (fromRect.top + fromRect.height / 2 - canvasRect.top) / s;
    const x2 = (toRect.left - canvasRect.left) / s;
    const y2 = (toRect.top + toRect.height / 2 - canvasRect.top) / s;


    const cp1x = x1 + (x2 - x1) / 2;
    const cp2x = x1 + (x2 - x1) / 2;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
    path.setAttribute("d", d);
    path.setAttribute("class", "svg-line");
    path.style.stroke = color;
    svg.appendChild(path);
}


document.getElementById('re-draw').onclick = drawConnections;
window.onresize = drawConnections;

// Initialize
renderAll();
updateTransform();
