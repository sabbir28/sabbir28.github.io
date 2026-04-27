/**
 * AccuFlow 2.1 - Connections Module
 * Visual Flow Engine
 */

function drawPath(fromId, toId, color = '#6c757d') {
    const fromEl = document.getElementById(fromId);
    const toEl = document.getElementById(toId);
    const svg = document.getElementById('connections-svg');

    if (!fromEl || !toEl || !svg) return;

    const s = state.canvas.scale;
    const canvasEl = document.getElementById('canvas');
    const cRect = canvasEl.getBoundingClientRect();
    const fRect = fromEl.getBoundingClientRect();
    const tRect = toEl.getBoundingClientRect();

    const x1 = (fRect.right - cRect.left) / s;
    const y1 = (fRect.top + fRect.height / 2 - cRect.top) / s;
    const x2 = (tRect.left - cRect.left) / s;
    const y2 = (tRect.top + tRect.height / 2 - cRect.top) / s;

    const cp1x = x1 + (x2 - x1) / 2;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp1x} ${y2}, ${x2} ${y2}`);
    path.setAttribute("class", "svg-line");
    path.style.stroke = color;
    svg.appendChild(path);
}


function drawConnections() {
    const svg = document.getElementById('connections-svg');
    if (!svg) return;
    svg.innerHTML = '';

    const data = getActiveYearData();
    const getAccColor = (acc) => {
        const type = data.accounts[acc]?.type;
        const colors = { Asset: '#0d6efd', Liability: '#dc3545', Equity: '#6f42c1', Revenue: '#198754', Expense: '#fd7e14' };
        return colors[type] || '#6c757d';
    };

    // Flow 1: Journal -> Ledgers
    data.transactions.forEach(t => {
        const slugDebit = t.debitAcc.replace(/\s/g, '');
        const slugCredit = t.creditAcc.replace(/\s/g, '');
        drawPath(`j-row-${t.id}`, `ledger-${slugDebit}`, getAccColor(t.debitAcc));
        drawPath(`j-row-${t.id}`, `ledger-${slugCredit}`, getAccColor(t.creditAcc));
    });

    // Flow 2: Ledgers -> TB -> Worksheet/Statements
    Object.keys(data.accounts).forEach(acc => {
        const slug = acc.replace(/\s/g, '');
        // Note: Ledger balance element ID in engine.js is ledger-bal-${slug}
        drawPath(`ledger-bal-${slug}`, `tb-row-${slug}`, getAccColor(acc));

        // Connections to IS and BS
        if (document.getElementById(`is-row-${slug}`)) {
            drawPath(`tb-row-${slug}`, `is-row-${slug}`, getAccColor(acc));
        }
        if (document.getElementById(`bs-row-${slug}`)) {
            drawPath(`tb-row-${slug}`, `bs-row-${slug}`, getAccColor(acc));
        }

        // Cash Flow & Bank Rec Connection
        if (acc === 'Cash') {
            drawPath(`ledger-bal-${slug}`, 'cf', getAccColor(acc));
            drawPath(`ledger-bal-${slug}`, 'bank-rec', getAccColor(acc));
        }
    });
}




window.drawPath = drawPath;
window.drawConnections = drawConnections;
