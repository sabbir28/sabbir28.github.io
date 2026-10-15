/**
 * MD. SABBIR HOSHEN HOWLADER — CASE STUDY MODAL SYSTEM MODULE
 * Accessible case study drawer modal with dynamic study injection and keyboard control.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    const projectData = {
        financial: {
            category: "FINANCIAL ANALYSIS & VALUATION",
            title: "Financial Statement & DuPont Ratio Modeling",
            status: "COMPLETED ACADEMIC SIMULATION",
            summary: "Comprehensive horizontal, vertical, and 3-stage DuPont decomposition of corporate financial statements to isolate operational drivers of equity profitability and working capital health.",
            points: [
                "<strong>DuPont 3-Stage Model:</strong> Decomposed Return on Equity (ROE) into Net Profit Margin × Total Asset Turnover × Equity Multiplier to identify key value levers.",
                "<strong>Working Capital Ratios:</strong> Evaluated liquidity through Current Ratio, Quick Ratio, and Cash Conversion Cycle benchmarks.",
                "<strong>Financial Normalization:</strong> Normalized multi-period financial statements across balance sheet and income statement line items."
            ],
            tools: "Microsoft Excel &bull; Financial Modeling Formulas &bull; DuPont Architecture"
        },
        accounting: {
            category: "ACCOUNTING SYSTEMS & GOVERNANCE",
            title: "Accounting Projects & Ledger Systems",
            status: "PRACTICAL COURSEWORK & CASE STUDY",
            summary: "Hands-on accounting system implementations covering double-entry ledger architecture, trial balance verification, and computerized ledger workflows.",
            points: [
                "<strong>General Ledger Architecture:</strong> Designed structured Chart of Accounts conforming to IFRS and IAS 1 financial reporting rules.",
                "<strong>Trial Balance Equalization:</strong> Implemented strict verification mechanisms ensuring zero deviation between total debits and credits.",
                "<strong>QuickBooks Workflow:</strong> Simulated journal adjustments, accounts payable/receivable batches, and monthly bank reconciliations."
            ],
            tools: "QuickBooks &bull; Microsoft Excel &bull; Double-Entry General Ledger"
        },
        data: {
            category: "DATA ANALYTICS & BI DASHBOARDS",
            title: "Data Analysis & Dynamic Modeling",
            status: "ANALYTICAL PORTFOLIO ARTIFACT",
            summary: "Leveraging Microsoft Excel and automated Python scripts to clean, transform, and visualize transactional corporate datasets into executive KPI dashboards.",
            points: [
                "<strong>Dynamic Excel Modeling:</strong> Built executive dashboards utilizing XLOOKUP, INDEX/MATCH, and automated PivotTables.",
                "<strong>Variance Monitoring:</strong> Modeled monthly budget vs. actual discrepancies with conditional risk indicators.",
                "<strong>Python ETL Scripts:</strong> Processed raw transaction feeds using Pandas to eliminate anomalies and generate summarized tables."
            ],
            tools: "Python (Pandas) &bull; Microsoft Excel &bull; MySQL Queries"
        },
        research: {
            category: "MACROECONOMIC & INDUSTRIAL RESEARCH",
            title: "Bangladesh Industrial Sector Benchmarking",
            status: "INDEPENDENT ANALYTICAL STUDY",
            summary: "A rigorous comparative cross-sectional study evaluating liquidity buffers, debt leverage, and capital output across Ready-Made Garments (RMG), Pharmaceuticals, and Commercial Banking.",
            points: [
                "<strong>Cross-Sector Ratio Matrix:</strong> Benchmarked working capital cycles (CCC), interest coverage, and net margins across three critical economic engines.",
                "<strong>Liquidity Stress Testing:</strong> Examined working capital stress and trade credit dependencies under foreign exchange volatility.",
                "<strong>Actionable Strategic Findings:</strong> Formulated insights on supply chain financing and working capital rationalization for Bangladeshi exporters."
            ],
            tools: "Financial Statement Synthesis &bull; Ratio Analysis &bull; Empirical Economics"
        }
    };

    window.openProjectModal = function (projectId) {
        const item = projectData[projectId];
        if (!item) return;

        const modal = document.getElementById("projectModal");
        const body = document.getElementById("modalBody");
        if (!modal || !body) return;

        body.innerHTML = `
            <div class="modal-category">${item.category}</div>
            <h3 class="modal-title">${item.title}</h3>
            <span class="modal-tag">${item.status}</span>
            <p class="modal-summary">
                ${item.summary}
            </p>
            <div class="modal-section">
                <div class="modal-section-title">
                    Key Highlights &amp; Analytical Framework
                </div>
                <ul class="modal-list">
                    ${item.points.map((pt) => `<li>${pt}</li>`).join("")}
                </ul>
            </div>
            <div class="modal-section" style="padding-bottom: 0;">
                <div class="modal-section-title">
                    Technical Toolkit &amp; Methodology
                </div>
                <p style="font-family: var(--mono); font-size: 13px; color: var(--navy-midnight);">
                    ${item.tools}
                </p>
            </div>
        `;

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    window.closeProjectModal = function () {
        const modal = document.getElementById("projectModal");
        if (modal) {
            modal.classList.remove("active");
            document.body.style.overflow = "";
        }
    };

    window.closeModalOnBackdrop = function (e) {
        if (e.target === document.getElementById("projectModal")) {
            window.closeProjectModal();
        }
    };

    function init() {
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                window.closeProjectModal();
            }
        });
    }

    root.Portfolio.modal = {
        init: init,
        projectData: projectData
    };
})(typeof window !== "undefined" ? window : this);
