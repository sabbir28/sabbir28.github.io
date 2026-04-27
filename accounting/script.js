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
        { id: 't10', date: 'Feb 10', debitAcc: 'Drawings', creditAcc: 'Cash', amount: 1000, desc: 'Owner withdrew cash for personal use' }
    ],
    accounts: {
        'Cash': { type: 'Asset', normal: 'Debit' },
        'Accounts Receivable': { type: 'Asset', normal: 'Debit' },
        'Supplies': { type: 'Asset', normal: 'Debit' },
        'Equipment': { type: 'Asset', normal: 'Debit' },
        'Prepaid Rent': { type: 'Asset', normal: 'Debit' },
        'Accounts Payable': { type: 'Liability', normal: 'Credit' },
        'Common Stock': { type: 'Equity', normal: 'Credit' },
        'Drawings': { type: 'Equity', normal: 'Debit' },
        'Service Revenue': { type: 'Revenue', normal: 'Credit' },
        'Salary Expense': { type: 'Expense', normal: 'Debit' }
    },

    canvas: { x: 0, y: 0, scale: 1, isDragging: false, startX: 0, startY: 0 }
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
    canvas.style.transform = `translate(calc(-50% + ${state.canvas.x}px), calc(-50% + ${state.canvas.y}px))`;
    drawConnections(); // Redraw lines when moving
}

document.getElementById('reset-view').onclick = () => {
    state.canvas.x = 0;
    state.canvas.y = 0;
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

function createCard(id, title, x, y, content) {
    const card = document.createElement('div');
    card.id = id;
    card.className = 'card animate-fade';
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    card.innerHTML = `
        <div class="card-header"><h6 class="m-0 fw-bold">${title}</h6></div>
        <div class="card-body p-0">${content}</div>
        <div class="connection-point dot-in"></div>
        <div class="connection-point dot-out"></div>
    `;
    return card;
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
                    <tr id="j-row-${t.id}">
                        <td>${t.date}</td>
                        <td><div class="fw-bold">${t.debitAcc}</div><div class="ps-3 text-muted">${t.creditAcc}</div></td>
                        <td class="debit-val">$${t.amount}</td>
                        <td class="credit-val">$${t.amount}</td>
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
            <div class="p-2 border-top text-center fw-bold small">Balance: $${(ledger[acc].d.reduce((s, i) => s + i.amount, 0) - ledger[acc].c.reduce((s, i) => s + i.amount, 0)).toLocaleString()}</div>
        `;
        container.appendChild(createCard(`ledger-${acc.replace(/\s/g, '')}`, `Ledger: ${acc}`, 1100, 100 + (i * 180), tContent));
    });

    // 4. Trial Balance (Column 4)
    const tb = getTrialBalance();
    const tbContent = `
        <table class="table table-sm m-0">
            <thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead>
            <tbody>
                ${tb.map(e => `<tr><td>${e.acc}</td><td class="debit-val">${e.d ? '$' + e.d : ''}</td><td class="credit-val">${e.c ? '$' + e.c : ''}</td></tr>`).join('')}
                <tr class="fw-bold table-secondary"><td>Total</td><td>$${tb.reduce((s, i) => s + i.d, 0)}</td><td>$${tb.reduce((s, i) => s + i.c, 0)}</td></tr>
            </tbody>
        </table>
    `;
    container.appendChild(createCard('tb-card', 'Trial Balance', 1600, 100, tbContent));

    // 5. Balance Sheet (Column 5)
    const bsContent = `
        <div class="p-3">
            <h6 class="fw-bold border-bottom pb-2">Assets</h6>
            ${tb.filter(e => state.accounts[e.acc].type === 'Asset').map(e => `<div class="d-flex justify-content-between"><span>${e.acc}</span><span>$${e.d}</span></div>`).join('')}
            <h6 class="fw-bold border-bottom pb-2 mt-3">Liabilities & Equity</h6>
            ${tb.filter(e => ['Liability', 'Equity'].includes(state.accounts[e.acc].type)).map(e => `<div class="d-flex justify-content-between"><span>${e.acc}</span><span>$${e.c || e.d}</span></div>`).join('')}
            <div class="mt-3 pt-2 border-top fw-bold text-primary d-flex justify-content-between">
                <span>Total Assets</span>
                <span>$${tb.filter(e => state.accounts[e.acc].type === 'Asset').reduce((s, i) => s + i.d, 0)}</span>
            </div>
        </div>
    `;
    container.appendChild(createCard('bs-card', 'Balance Sheet', 2100, 100, bsContent));


    // Wait for DOM to settle then draw lines
    setTimeout(drawConnections, 100);
}

// --- Connection Drawing ---

function drawConnections() {
    const svg = document.getElementById('connections-svg');
    svg.innerHTML = svg.innerHTML.split('</defs>')[0] + '</defs>'; // Keep defs

    // Connect Source to Journal
    state.transactions.forEach(t => {
        drawLine(`t-card-${t.id}`, 'journal-card');
    });

    // Connect Journal to Ledger
    Object.keys(state.accounts).forEach(acc => {
        drawLine('journal-card', `ledger-${acc.replace(/\s/g, '')}`);
    });

    // Connect Ledger to TB
    drawLine('ledger-Cash', 'tb-card'); // Just show one for demo or all
    drawLine('tb-card', 'bs-card');
}

function drawLine(fromId, toId) {
    const fromEl = document.getElementById(fromId);
    const toEl = document.getElementById(toId);
    const svg = document.getElementById('connections-svg');

    if (!fromEl || !toEl) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Calculate relative coordinates in canvas space
    const x1 = (fromRect.right - canvasRect.left);
    const y1 = (fromRect.top + fromRect.height / 2 - canvasRect.top);
    const x2 = (toRect.left - canvasRect.left);
    const y2 = (toRect.top + toRect.height / 2 - canvasRect.top);

    const cp1x = x1 + (x2 - x1) / 2;
    const cp2x = x1 + (x2 - x1) / 2;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
    path.setAttribute("d", d);
    path.setAttribute("class", "svg-line");
    svg.appendChild(path);
}

document.getElementById('re-draw').onclick = drawConnections;
window.onresize = drawConnections;

// Initialize
renderAll();
updateTransform();
