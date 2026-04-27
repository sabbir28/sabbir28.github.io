/**
 * AccuFlow 2.1 - Data Module
 * Enterprise State Management
 */

const state = {
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
            transactions: [],
            accounts: {
                'Cash': { type: 'Asset', normal: 'Debit' },
                'Inventory': { type: 'Asset', normal: 'Debit' },
                'Furniture': { type: 'Asset', normal: 'Debit' },
                'Accumulated Depreciation': { type: 'Asset', normal: 'Credit' },
                'Accounts Receivable': { type: 'Asset', normal: 'Debit' },
                'Accounts Payable': { type: 'Liability', normal: 'Credit' },
                'Capital': { type: 'Equity', normal: 'Credit' },
                'Sales': { type: 'Revenue', normal: 'Credit' },
                'Salary Expense': { type: 'Expense', normal: 'Debit' },
                'Depreciation Expense': { type: 'Expense', normal: 'Debit' },
                'Cost of Goods Sold': { type: 'Expense', normal: 'Debit' }
            }
        }
    },
    inventory: [
        { id: 'inv1', name: 'Widget 1.0', qty: 100, cost: 10 }
    ],
    bank: {
        bookBalance: 0,
        bankBalance: 119000,
        depositsInTransit: 0,
        outstandingChecks: 0
    },
    canvas: { x: 50, y: 50, scale: 0.8 },
    positions: {}
};

function loadScenario(type = 'ABC_TRADERS') {
    if (type === 'ABC_TRADERS') {
        const data = state.years[2026];
        data.transactions = [
            { id: 't1', date: '2026-01-01', debitAcc: 'Cash', creditAcc: 'Capital', amount: 100000, desc: 'Owner investment' },
            { id: 't2', date: '2026-01-05', debitAcc: 'Inventory', creditAcc: 'Cash', amount: 20000, desc: 'Bought goods' },
            { id: 't3', date: '2026-01-10', debitAcc: 'Furniture', creditAcc: 'Accounts Payable', amount: 15000, desc: 'Bought furniture on credit' },
            { id: 't4', date: '2026-01-15', debitAcc: 'Cash', creditAcc: 'Sales', amount: 30000, desc: 'Cash sales' },
            { id: 't5', date: '2026-01-20', debitAcc: 'Accounts Receivable', creditAcc: 'Sales', amount: 10000, desc: 'Credit sales' },
            { id: 't6', date: '2026-01-25', debitAcc: 'Salary Expense', creditAcc: 'Cash', amount: 5000, desc: 'Paid salary' },
            { id: 't7', date: '2026-01-26', debitAcc: 'Accounts Payable', creditAcc: 'Cash', amount: 8000, desc: 'Paid supplier' },
            { id: 't8', date: '2026-01-28', debitAcc: 'Cash', creditAcc: 'Accounts Receivable', amount: 6000, desc: 'Received from debtor' },
            { id: 'a1', date: '2026-01-31', debitAcc: 'Depreciation Expense', creditAcc: 'Accumulated Depreciation', amount: 1500, desc: 'Monthly depreciation', isAdjustment: true },
            { id: 'a2', date: '2026-01-31', debitAcc: 'Cost of Goods Sold', creditAcc: 'Inventory', amount: 12000, desc: 'Closing inventory adjustment', isAdjustment: true }
        ];
        state.inventory = [{ id: 'inv1', name: 'Closing Stock', qty: 8000, cost: 1 }];
    }
}

function getActiveYearData() {
    return state.years[state.activeYear];
}


function calculateBalances(year = state.activeYear, includeAdjustments = true) {
    const data = state.years[year];
    const ledger = {};
    Object.keys(data.accounts).forEach(acc => ledger[acc] = { d: 0, c: 0 });

    data.transactions.forEach(t => {
        if (!includeAdjustments && t.isAdjustment) return;
        ledger[t.debitAcc].d += t.amount;
        ledger[t.creditAcc].c += t.amount;
    });
    return ledger;
}

function calculateAdjustmentTotals(year = state.activeYear) {
    const data = state.years[year];
    const adj = {};
    Object.keys(data.accounts).forEach(acc => adj[acc] = { d: 0, c: 0 });
    data.transactions.filter(t => t.isAdjustment).forEach(t => {
        adj[t.debitAcc].d += t.amount;
        adj[t.creditAcc].c += t.amount;
    });
    return adj;
}

function calculateTrialBalance(year = state.activeYear, type = 'Adjusted') {
    const ledger = calculateBalances(year, type === 'Adjusted');
    const data = state.years[year];
    const tb = [];
    Object.keys(ledger).forEach(acc => {
        const bal = data.accounts[acc].normal === 'Debit' ? ledger[acc].d - ledger[acc].c : ledger[acc].c - ledger[acc].d;
        if (bal !== 0 || ledger[acc].d !== 0 || ledger[acc].c !== 0) {
            tb.push({
                acc,
                d: data.accounts[acc].normal === 'Debit' ? Math.max(0, bal) : Math.max(0, -bal),
                c: data.accounts[acc].normal === 'Credit' ? Math.max(0, bal) : Math.max(0, -bal)
            });
        }
    });
    return tb;
}

window.state = state;
window.getActiveYearData = getActiveYearData;
window.calculateBalances = calculateBalances;
window.calculateTrialBalance = calculateTrialBalance;
window.calculateAdjustmentTotals = calculateAdjustmentTotals;
window.loadScenario = loadScenario;


