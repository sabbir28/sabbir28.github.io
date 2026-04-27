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
            transactions: [
                { id: 't1', date: 'Jan 1', debitAcc: 'Cash', creditAcc: 'Common Stock', amount: 50000, desc: 'Initial investment' },
                { id: 't2', date: 'Jan 15', debitAcc: 'Equipment', creditAcc: 'Cash', amount: 20000, desc: 'Asset purchase' },
                { id: 't3', date: 'Feb 1', debitAcc: 'Supplies', creditAcc: 'Accounts Payable', amount: 3000, desc: 'Credit purchase' },
                { id: 'a1', date: 'Feb 28', debitAcc: 'Supplies Expense', creditAcc: 'Supplies', amount: 2000, desc: 'Monthly adjustment', isAdjustment: true },
                { id: 'a2', date: 'Feb 28', debitAcc: 'Depreciation Expense', creditAcc: 'Accumulated Depreciation', amount: 500, desc: 'Monthly depreciation', isAdjustment: true }
            ],
            accounts: {
                'Cash': { type: 'Asset', normal: 'Debit' },
                'Supplies': { type: 'Asset', normal: 'Debit' },
                'Equipment': { type: 'Asset', normal: 'Debit' },
                'Accumulated Depreciation': { type: 'Asset', normal: 'Credit' },
                'Accounts Receivable': { type: 'Asset', normal: 'Debit' },
                'Prepaid Rent': { type: 'Asset', normal: 'Debit' },
                'Accounts Payable': { type: 'Liability', normal: 'Credit' },
                'Common Stock': { type: 'Equity', normal: 'Credit' },
                'Drawings': { type: 'Equity', normal: 'Debit' },
                'Service Revenue': { type: 'Revenue', normal: 'Credit' },
                'Salary Expense': { type: 'Expense', normal: 'Debit' },
                'Supplies Expense': { type: 'Expense', normal: 'Debit' },
                'Rent Expense': { type: 'Expense', normal: 'Debit' },
                'Depreciation Expense': { type: 'Expense', normal: 'Debit' }
            }
        }
    },
    inventory: [
        { id: 'inv1', name: 'Widget 1.0', qty: 100, cost: 10 },
        { id: 'inv2', name: 'Widget 2.0', qty: 50, cost: 20 }
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

function getActiveYearData() {
    return state.years[state.activeYear];
}

function calculateBalances(year = state.activeYear) {
    const data = state.years[year];
    const ledger = {};
    Object.keys(data.accounts).forEach(acc => ledger[acc] = { d: 0, c: 0 });

    data.transactions.forEach(t => {
        ledger[t.debitAcc].d += t.amount;
        ledger[t.creditAcc].c += t.amount;
    });
    return ledger;
}

function calculateTrialBalance(year = state.activeYear) {
    const ledger = calculateBalances(year);
    const data = state.years[year];
    const tb = [];
    Object.keys(ledger).forEach(acc => {
        const bal = data.accounts[acc].normal === 'Debit' ? ledger[acc].d - ledger[acc].c : ledger[acc].c - ledger[acc].d;
        if (bal !== 0 || ledger[acc].d !== 0 || ledger[acc].c !== 0) {
            tb.push({ acc, d: data.accounts[acc].normal === 'Debit' ? Math.max(0, bal) : Math.max(0, -bal), c: data.accounts[acc].normal === 'Credit' ? Math.max(0, bal) : Math.max(0, -bal) });
        }
    });
    return tb;
}

window.state = state;
window.getActiveYearData = getActiveYearData;
window.calculateBalances = calculateBalances;
window.calculateTrialBalance = calculateTrialBalance;
