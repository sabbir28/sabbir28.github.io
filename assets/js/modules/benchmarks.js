/**
 * MD. SABBIR HOSHEN HOWLADER — INSTITUTIONAL RESEARCH BENCHMARK VISUALIZATION MODULE
 * Interactive multi-sector comparative analysis with animated financial ratio charts.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    function init() {
        const prefersReducedMotion = root.Portfolio.config && root.Portfolio.config.prefersReducedMotion;
        // 10. INSTITUTIONAL RESEARCH BENCHMARK VISUALIZATION ENGINE
        // ==========================================================================
        const researchData = {
        rmg: {
            title: "Ready-Made Garments & Textiles (RMG)",
            subtitle: "Export-Driven Capital Cycle & Working Capital Normalization",
            dupont: {
                roe: "22.4%",
                netMargin: "6.8%",
                assetTurnover: "1.92x",
                equityMultiplier: "1.72x",
                desc: "High volume, low-to-moderate net profit margin compensated by high asset turnover."
            },
            workingCapital: {
                currentRatio: "1.42x",
                cashConversionCycle: "82 Days",
                inventoryDays: "58 Days",
                receivableDays: "44 Days",
                desc: "Back-to-back LC financing model; raw cotton & fabric lead times dictate liquidity buffers."
            },
            capitalEfficiency: {
                icor: "3.6x",
                operatingLeverage: "Moderate",
                capexRoic: "14.8%",
                desc: "Compliance & green factory certification (LEED) drive operational resilience."
            }
        },
        pharma: {
            title: "Pharmaceuticals & Healthcare",
            subtitle: "High Value-Add Formulation & Domestic Market Dominance",
            dupont: {
                roe: "26.8%",
                netMargin: "14.5%",
                assetTurnover: "1.15x",
                equityMultiplier: "1.61x",
                desc: "Premium operating margins driven by branded formulations and local pricing power."
            },
            workingCapital: {
                currentRatio: "1.85x",
                cashConversionCycle: "115 Days",
                inventoryDays: "88 Days",
                receivableDays: "52 Days",
                desc: "Substantial active pharmaceutical ingredient (API) buffers required to safeguard production."
            },
            capitalEfficiency: {
                icor: "4.2x",
                operatingLeverage: "High",
                capexRoic: "18.2%",
                desc: "Strong return on invested capital driven by automated packaging and global GMP facilities."
            }
        },
        banking: {
            title: "Commercial Banking & Financial Institutions",
            subtitle: "Asset-Liability Management, Net Interest Margin (NIM) & NPL Coverage",
            dupont: {
                roe: "15.2%",
                netMargin: "12.8%",
                assetTurnover: "0.08x",
                equityMultiplier: "14.8x",
                desc: "Financial intermediary model; low asset turnover counterbalanced by leveraged balance sheet."
            },
            workingCapital: {
                currentRatio: "1.12x (ADR 84.5%)",
                cashConversionCycle: "N/A (Treasury)",
                inventoryDays: "N/A",
                receivableDays: "N/A",
                desc: "Prudential liquidity maintained through CRR/SLR compliance and Treasury bond yields."
            },
            capitalEfficiency: {
                icor: "N/A",
                operatingLeverage: "Low",
                capexRoic: "11.5% ROA 1.05%",
                desc: "Core earnings anchored by fee-based corporate advisory, trade finance, and LC commissions."
            }
        }
    };

    let currentSector = "rmg";
    let currentMetric = "dupont";

    const sectorPills = document.querySelectorAll(".sector-pill-btn");
    const metricTabs = document.querySelectorAll(".metric-tab-btn");
    const chartTitleElem = document.getElementById("researchChartTitle");
    const chartSvgElem = document.getElementById("researchChartSvg");

    window.renderResearchChart = function (animate = false) {
        const data = researchData[currentSector];
        if (!data || !chartSvgElem) return;

        if (chartTitleElem) {
            chartTitleElem.textContent = `${data.title} — ${currentMetric.toUpperCase()} BENCHMARK`;
        }

        let svgContent = "";
        const metricData = data[currentMetric];

        if (currentMetric === "dupont") {
            svgContent = `
                <g transform="translate(40, 20)">
                    <line x1="0" y1="160" x2="620" y2="160" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
                    <line x1="0" y1="110" x2="620" y2="110" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4" />
                    <line x1="0" y1="60" x2="620" y2="60" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4" />

                    <!-- Bar 1: ROE -->
                    <rect class="chart-animated-bar" x="50" y="40" width="70" height="120" rx="3" fill="url(#goldBarGrad)" />
                    <text x="85" y="30" fill="#c8a85b" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">${metricData.roe}</text>
                    <text x="85" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Return on Equity</text>

                    <!-- Multiply Sign -->
                    <text x="160" y="105" fill="#c8a85b" font-family="'JetBrains Mono', monospace" font-size="18" text-anchor="middle">=</text>

                    <!-- Bar 2: Net Margin -->
                    <rect class="chart-animated-bar" x="200" y="70" width="70" height="90" rx="3" fill="#075b4d" />
                    <text x="235" y="60" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">${metricData.netMargin}</text>
                    <text x="235" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Net Margin</text>

                    <!-- Multiply Sign -->
                    <text x="310" y="105" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="16" text-anchor="middle">&times;</text>

                    <!-- Bar 3: Asset Turnover -->
                    <rect class="chart-animated-bar" x="350" y="60" width="70" height="100" rx="3" fill="#0fa889" />
                    <text x="385" y="50" fill="#0fa889" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">${metricData.assetTurnover}</text>
                    <text x="385" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Asset Turnover</text>

                    <!-- Multiply Sign -->
                    <text x="460" y="105" fill="#0fa889" font-family="'JetBrains Mono', monospace" font-size="16" text-anchor="middle">&times;</text>

                    <!-- Bar 4: Financial Leverage -->
                    <rect class="chart-animated-bar" x="500" y="50" width="70" height="110" rx="3" fill="#102c3d" stroke="#c8a85b" stroke-width="1.5" />
                    <text x="535" y="40" fill="#c8a85b" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">${metricData.equityMultiplier}</text>
                    <text x="535" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Equity Multiplier</text>
                </g>
            `;
        } else if (currentMetric === "workingCapital") {
            svgContent = `
                <g transform="translate(40, 20)">
                    <line x1="0" y1="160" x2="620" y2="160" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
                    
                    <rect class="chart-animated-bar" x="60" y="50" width="90" height="110" rx="3" fill="#0fa889" />
                    <text x="105" y="40" fill="#0fa889" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="middle">${metricData.currentRatio}</text>
                    <text x="105" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Current Ratio</text>

                    <rect class="chart-animated-bar" x="230" y="30" width="90" height="130" rx="3" fill="url(#goldBarGrad)" />
                    <text x="275" y="20" fill="#c8a85b" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="middle">${metricData.cashConversionCycle}</text>
                    <text x="275" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Cash Cycle (CCC)</text>

                    <rect class="chart-animated-bar" x="400" y="70" width="90" height="90" rx="3" fill="#075b4d" />
                    <text x="445" y="60" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="middle">${metricData.inventoryDays}</text>
                    <text x="445" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Inventory Days</text>
                </g>
            `;
        } else {
            svgContent = `
                <g transform="translate(40, 20)">
                    <line x1="0" y1="160" x2="620" y2="160" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
                    
                    <rect class="chart-animated-bar" x="100" y="50" width="120" height="110" rx="3" fill="url(#goldBarGrad)" />
                    <text x="160" y="40" fill="#c8a85b" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="middle">${metricData.capexRoic}</text>
                    <text x="160" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Capex ROIC / Yield</text>

                    <rect class="chart-animated-bar" x="360" y="70" width="120" height="90" rx="3" fill="#0fa889" />
                    <text x="420" y="60" fill="#0fa889" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="middle">${metricData.icor}</text>
                    <text x="420" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Capital-Output (ICOR)</text>
                </g>
            `;
        }

        chartSvgElem.innerHTML = `
            <defs>
                <linearGradient id="goldBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#c8a85b" />
                    <stop offset="100%" stop-color="#8c6c24" />
                </linearGradient>
            </defs>
            ${svgContent}
        `;

        const commentaryElem = document.getElementById("researchCommentary");
        if (commentaryElem) {
            commentaryElem.textContent = metricData.desc;
        }

        // Optional GSAP animation on bars
        if (window.gsap && !prefersReducedMotion) {
            gsap.fromTo(".chart-animated-bar", {
                scaleY: 0,
                transformOrigin: "bottom"
            }, {
                scaleY: 1,
                duration: 0.7,
                stagger: 0.08,
                ease: "power3.out"
            });
        }
    };

    if (sectorPills.length > 0) {
        sectorPills.forEach((pill) => {
            pill.addEventListener("click", () => {
                sectorPills.forEach((p) => p.classList.remove("active"));
                pill.classList.add("active");
                currentSector = pill.getAttribute("data-sector") || "rmg";
                window.renderResearchChart();
            });
        });

        metricTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                metricTabs.forEach((t) => t.classList.remove("active"));
                tab.classList.add("active");
                currentMetric = tab.getAttribute("data-metric") || "dupont";
                window.renderResearchChart();
            });
        });

        window.renderResearchChart();
    }

    // ==========================================================================

    }

    root.Portfolio.benchmarks = {
        init: init
    };
})(typeof window !== "undefined" ? window : this);
