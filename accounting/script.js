/**
 * AccuFlow - Accounting Cycle Logic
 */

// --- State Management ---
const state = {
    currentStep: 1,
    transactions: [
        { id: 1, date: '2026-04-01', debit: 'Cash', credit: 'Common Stock', amount: 10000, desc: 'Initial investment' },
        { id: 2, date: '2026-04-05', debit: 'Supplies', credit: 'Accounts Payable', amount: 500, desc: 'Purchased supplies on account' },
        { id: 3, date: '2026-04-10', debit: 'Accounts Receivable', credit: 'Service Revenue', amount: 3000, desc: 'Billed client for services' },
        { id: 4, date: '2026-04-15', debit: 'Rent Expense', credit: 'Cash', amount: 1200, desc: 'Paid monthly rent' }
    ],
    accounts: {
        'Cash': { type: 'Asset', normal: 'Debit' },
        'Accounts Receivable': { type: 'Asset', normal: 'Debit' },
        'Supplies': { type: 'Asset', normal: 'Debit' },
        'Equipment': { type: 'Asset', normal: 'Debit' },
        'Accounts Payable': { type: 'Liability', normal: 'Credit' },
        'Common Stock': { type: 'Equity', normal: 'Credit' },
        'Retained Earnings': { type: 'Equity', normal: 'Credit' },
        'Service Revenue': { type: 'Revenue', normal: 'Credit' },
        'Rent Expense': { type: 'Expense', normal: 'Debit' },
        'Salary Expense': { type: 'Expense', normal: 'Debit' }
    }
};

// --- Core Logic ---

function getLedger() {
    const ledger = {};
    // Initialize ledger
    Object.keys(state.accounts).forEach(acc => {
        ledger[acc] = { debits: [], credits: [] };
    });

    // Populate from transactions
    state.transactions.forEach(t => {
        if (ledger[t.debit]) ledger[t.debit].debits.push({ date: t.date, amount: t.amount, desc: t.desc });
        if (ledger[t.credit]) ledger[t.credit].credits.push({ date: t.date, amount: t.amount, desc: t.desc });
    });

    return ledger;
}

function getTrialBalance() {
    const ledger = getLedger();
    const tb = [];
    let totalDebit = 0;
    let totalCredit = 0;

    Object.keys(state.accounts).forEach(acc => {
        const dSum = ledger[acc].debits.reduce((sum, item) => sum + item.amount, 0);
        const cSum = ledger[acc].credits.reduce((sum, item) => sum + item.amount, 0);
        const balance = state.accounts[acc].normal === 'Debit' ? dSum - cSum : cSum - dSum;

        if (balance !== 0) {
            tb.push({
                account: acc,
                debit: state.accounts[acc].normal === 'Debit' ? balance : 0,
                credit: state.accounts[acc].normal === 'Credit' ? balance : 0
            });
            totalDebit += (state.accounts[acc].normal === 'Debit' ? balance : 0);
            totalCredit += (state.accounts[acc].normal === 'Credit' ? balance : 0);
        }
    });

    return { entries: tb, totalDebit, totalCredit };
}

function getFinancialStatements() {
    const tb = getTrialBalance();
    const incomeStatement = { revenue: [], expenses: [], netIncome: 0 };
    const balanceSheet = { assets: [], liabilities: [], equity: [], totalAssets: 0, totalLiabilitiesEquity: 0 };

    tb.entries.forEach(e => {
        const type = state.accounts[e.account].type;
        const balance = e.debit || e.credit;

        if (type === 'Revenue') incomeStatement.revenue.push({ account: e.account, amount: balance });
        else if (type === 'Expense') incomeStatement.expenses.push({ account: e.account, amount: balance });
        else if (type === 'Asset') balanceSheet.assets.push({ account: e.account, amount: balance });
        else if (type === 'Liability') balanceSheet.liabilities.push({ account: e.account, amount: balance });
        else if (type === 'Equity') balanceSheet.equity.push({ account: e.account, amount: balance });
    });

    const totalRev = incomeStatement.revenue.reduce((s, i) => s + i.amount, 0);
    const totalExp = incomeStatement.expenses.reduce((s, i) => s + i.amount, 0);
    incomeStatement.netIncome = totalRev - totalExp;

    balanceSheet.equity.push({ account: 'Retained Earnings (Net Income)', amount: incomeStatement.netIncome });

    balanceSheet.totalAssets = balanceSheet.assets.reduce((s, i) => s + i.amount, 0);
    balanceSheet.totalLiabilitiesEquity =
        balanceSheet.liabilities.reduce((s, i) => s + i.amount, 0) +
        balanceSheet.equity.reduce((s, i) => s + i.amount, 0);

    return { incomeStatement, balanceSheet };
}

// --- Rendering Engine ---

const containers = {
    journal: () => `
        <div class="journal-view animate-fade">
            <div class="controls">
                <button class="btn btn-primary" id="add-entry">Add Transaction</button>
            </div>
            <div class="table-container glass-card">
                <table>
                    <thead>
                        <tr><th>Date</th><th>Account & Description</th><th>Debit</th><th>Credit</th></tr>
                    </thead>
                    <tbody>
                        ${state.transactions.map(t => `
                            <tr>
                                <td>${t.date}</td>
                                <td><div class="debit-line">${t.debit}</div><div class="credit-line">${t.credit}</div><small style="margin-left:2rem; font-style:italic; color:var(--text-secondary)">(${t.desc})</small></td>
                                <td>$${t.amount.toLocaleString()}</td>
                                <td></td>
                            </tr>
                            <tr><td></td><td></td><td></td><td>$${t.amount.toLocaleString()}</td></tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `,
    ledger: () => {
        const ledger = getLedger();
        return `
            <div class="ledger-grid animate-fade">
                ${Object.keys(ledger).map(acc => {
                    const dItems = ledger[acc].debits;
                    const cItems = ledger[acc].credits;
                    const dSum = dItems.reduce((s, i) => s + i.amount, 0);
                    const cSum = cItems.reduce((s, i) => s + i.amount, 0);
                    const bal = state.accounts[acc].normal === 'Debit' ? dSum - cSum : cSum - dSum;

                    return `
                        <div class="glass-card t-account">
                            <div class="t-account-title">${acc}</div>
                            <div class="t-account-body">
                                <div class="t-side">
                                    ${dItems.map(i => `<div class="t-entry"><span>${i.date}</span><span>$${i.amount}</span></div>`).join('')}
                                </div>
                                <div class="t-side">
                                    ${cItems.map(i => `<div class="t-entry"><span>${i.date}</span><span>$${i.amount}</span></div>`).join('')}
                                </div>
                            </div>
                            <div class="t-balance">Balance: $${bal.toLocaleString()}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    trial: () => {
        const tb = getTrialBalance();
        return `
            <div class="glass-card animate-fade">
                <table>
                    <thead>
                        <tr><th>Account</th><th>Debit</th><th>Credit</th></tr>
                    </thead>
                    <tbody>
                        ${tb.entries.map(e => `
                            <tr>
                                <td>${e.account}</td>
                                <td>${e.debit ? '$' + e.debit.toLocaleString() : ''}</td>
                                <td>${e.credit ? '$' + e.credit.toLocaleString() : ''}</td>
                            </tr>
                        `).join('')}
                        <tr class="statement-total">
                            <td>TOTAL</td>
                            <td>$${tb.totalDebit.toLocaleString()}</td>
                            <td>$${tb.totalCredit.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    },
    statements: () => {
        const { incomeStatement, balanceSheet } = getFinancialStatements();
        return `
            <div class="grid-2 animate-fade">
                <div class="glass-card">
                    <h3 style="margin-bottom:1.5rem; text-align:center">Income Statement</h3>
                    <div class="statement-row"><strong>Revenues</strong></div>
                    ${incomeStatement.revenue.map(r => `<div class="statement-row indent-1"><span>${r.account}</span><span>$${r.amount.toLocaleString()}</span></div>`).join('')}
                    <div class="statement-row"><strong>Expenses</strong></div>
                    ${incomeStatement.expenses.map(e => `<div class="statement-row indent-1"><span>${e.account}</span><span>($${e.amount.toLocaleString()})</span></div>`).join('')}
                    <div class="statement-row statement-total"><strong>Net Income</strong><span>$${incomeStatement.netIncome.toLocaleString()}</span></div>
                </div>

                <div class="glass-card" style="margin-top:2rem">
                    <h3 style="margin-bottom:1.5rem; text-align:center">Balance Sheet</h3>
                    <div class="statement-row"><strong>Assets</strong></div>
                    ${balanceSheet.assets.map(a => `<div class="statement-row indent-1"><span>${a.account}</span><span>$${a.amount.toLocaleString()}</span></div>`).join('')}
                    <div class="statement-row statement-total"><strong>Total Assets</strong><span>$${balanceSheet.totalAssets.toLocaleString()}</span></div>

                    <div class="statement-row" style="margin-top:1rem"><strong>Liabilities</strong></div>
                    ${balanceSheet.liabilities.map(l => `<div class="statement-row indent-1"><span>${l.account}</span><span>$${l.amount.toLocaleString()}</span></div>`).join('')}

                    <div class="statement-row" style="margin-top:1rem"><strong>Equity</strong></div>
                    ${balanceSheet.equity.map(e => `<div class="statement-row indent-1"><span>${e.account}</span><span>$${e.amount.toLocaleString()}</span></div>`).join('')}
                    <div class="statement-row statement-total"><strong>Total Liabilities & Equity</strong><span>$${balanceSheet.totalLiabilitiesEquity.toLocaleString()}</span></div>
                </div>
            </div>
        `;
    }
};

function render() {
    const main = document.getElementById('visual-content');
    const title = document.getElementById('current-step-title');
    const indicator = document.getElementById('step-indicator');
    const fill = document.querySelector('.progress-fill');

    fill.style.width = `${(state.currentStep / 6) * 100}%`;
    indicator.innerText = `Step ${state.currentStep} of 6`;

    switch(state.currentStep) {
        case 1:
            title.innerText = "General Journal";
            main.innerHTML = containers.journal();
            setupJournalEvents();
            break;
        case 2:
            title.innerText = "General Ledger (T-Accounts)";
            main.innerHTML = containers.ledger();
            break;
        case 3:
            title.innerText = "Unadjusted Trial Balance";
            main.innerHTML = containers.trial();
            break;
        case 4:
            title.innerText = "Adjusting Entries (WIP)";
            main.innerHTML = containers.journal(); // Reuse journal for adjustments for now
            break;
        case 5:
            title.innerText = "Adjusted Trial Balance";
            main.innerHTML = containers.trial();
            break;
        case 6:
            title.innerText = "Financial Statements";
            main.innerHTML = containers.statements();
            break;
    }
}

// --- Event Listeners ---

function setupJournalEvents() {
    const addBtn = document.getElementById('add-entry');
    const modal = document.getElementById('entry-modal');
    const cancel = document.getElementById('modal-cancel');
    const save = document.getElementById('modal-save');

    if (addBtn) addBtn.onclick = () => modal.classList.add('active');
    cancel.onclick = () => modal.classList.remove('active');

    save.onclick = () => {
        const date = document.getElementById('t-date').value;
        const debit = document.getElementById('t-debit-acc').value;
        const credit = document.getElementById('t-credit-acc').value;
        const amount = parseFloat(document.getElementById('t-amount').value);

        if (date && debit && credit && !isNaN(amount)) {
            state.transactions.push({
                id: Date.now(),
                date,
                debit,
                credit,
                amount,
                desc: `Manual entry: ${debit}/${credit}`
            });
            modal.classList.remove('active');
            render();
        } else {
            alert('Please fill all fields correctly.');
        }
    };
}

document.querySelectorAll('.nav-links li').forEach(li => {
    li.onclick = () => {
        document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));
        li.classList.add('active');
        state.currentStep = parseInt(li.getAttribute('data-step'));
        render();
    };
});

// Initialize
render();
