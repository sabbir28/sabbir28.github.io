/**
 * AccuFlow 2.1 - UI Module
 * Interactive Components & Help System
 */

const explanations = {
    'journal': 'The General Journal records all chronological business activities using double-entry logic.',
    'ledger': 'Ledgers (T-Accounts) sort transactions by category and track ending balances.',
    'tb': 'The Trial Balance checks the mathematical equality of Debits and Credits.',
    'ws': 'The 10-Column Worksheet is the "Engine Room" where adjustments and final totals are prepared.',
    'is': 'The Income Statement reports profitability (Revenue - Expenses).',
    'bs': 'The Balance Sheet shows financial position (A = L + E).',
    'eq': 'The Master Control Engine monitors the fundamental accounting balance in real-time.',
    'bank-rec': 'Reconciles the cash reported in your books with the actual bank statement balance.',
    'inventory': 'Tracks stock levels and valuations using FIFO principles.'
};

function showInsight(id) {
    const key = Object.keys(explanations).find(k => id.startsWith(k)) || 'ledger';
    const text = explanations[key];

    let overlay = document.getElementById('help-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'help-overlay';
        overlay.className = 'fixed-top w-100 h-100 d-flex align-items-center justify-content-center';
        overlay.style.background = 'rgba(0,0,0,0.6)';
        overlay.style.backdropFilter = 'blur(4px)';
        overlay.style.zIndex = '9999';
        overlay.onclick = () => overlay.remove();
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div class="bg-white p-4 rounded-4 shadow-lg animate-fade border border-primary border-opacity-25" style="max-width: 500px;">
            <div class="d-flex align-items-center mb-3">
                <div class="bg-primary-subtle p-2 rounded-3 me-2"><i class="bi bi-lightbulb text-primary"></i></div>
                <h5 class="fw-bold m-0">Accounting Insight</h5>
            </div>
            <p class="text-secondary">${text}</p>
            <div class="text-end mt-4"><button class="btn btn-primary px-4 rounded-pill shadow-sm">Understand</button></div>
        </div>
    `;
}

function createCard(id, title, x, y, content, typeClass = '') {
    const pos = state.positions[id] || { x, y };
    const card = document.createElement('div');
    card.id = id;
    card.className = `card ${typeClass}`;
    card.style.left = `${pos.x}px`;
    card.style.top = `${pos.y}px`;
    card.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <span class="fw-bold small text-uppercase tracking-wider">${title}</span>
            <div class="d-flex gap-2">
                <i class="bi bi-question-circle text-primary cursor-pointer" onclick="showInsight('${id}')"></i>
                <i class="bi bi-arrows-move text-muted grab-handle cursor-move"></i>
            </div>
        </div>
        <div class="card-body p-0">${content}</div>
    `;

    const handle = card.querySelector('.grab-handle');
    handle.onmousedown = (e) => {
        const startX = e.clientX / state.canvas.scale - pos.x;
        const startY = e.clientY / state.canvas.scale - pos.y;

        const move = (me) => {
            const nx = me.clientX / state.canvas.scale - startX;
            const ny = me.clientY / state.canvas.scale - startY;
            pos.x = nx; pos.y = ny;
            card.style.left = `${nx}px`;
            card.style.top = `${ny}px`;
            state.positions[id] = { x: nx, y: ny };
            if (window.drawConnections) window.drawConnections();
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

window.createCard = createCard;
window.showInsight = showInsight;
