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
        },
        ecotrail: {
            category: "ENVIRONMENTAL FIELDWORK // ROVER SCOUTING",
            title: "Eco-Trail & Mangrove Habitat Reconnaissance",
            status: "EXPEDITION & RECONNAISSANCE LOG",
            summary: "On-site environmental reconnaissance and ecological corridor observation conducted along coastal mangrove trail systems in southern Bangladesh. The project evaluated elevated wooden boardwalk structural integrity, eco-tourism footprint, and native mangrove biodiversity.",
            points: [
                "<strong>Eco-Trail Pathway Mapping:</strong> Assessed elevated wooden boardwalks, mangrove tidal channels, and regional visitor footpaths.",
                "<strong>Scouting Field Readiness:</strong> Tested outdoor navigation protocols, safety logistics, and environmental stewardship guidelines under Rover Scout principles.",
                "<strong>Biodiversity & Conservation Insights:</strong> Documented habitat preservation challenges along coastal wetland ecosystems."
            ],
            tools: "Field Observation Log &bull; GPS Trail Mapping &bull; Rover Scout Expedition Gear",
            location: "Kuakata / Coastal Mangrove Belt, Bangladesh",
            image: "assets/MyPhato/486602102_1898432044300315_7034389853923374296_n.jpg",
            imageAlt: "Md. Sabbir Hoshen on wooden mangrove canopy bridge during eco-trail reconnaissance"
        },
        archives: {
            category: "ACADEMIC RESEARCH // ARCHIVAL STUDY",
            title: "Institutional Accounting Archive & Literature Survey",
            status: "ACADEMIC ARCHIVAL STUDY",
            summary: "An independent literature survey and historical document cataloging project undertaken at the Government Brojomohun College Central Library archives. The study surveyed early commercial statutes, Bangladesh taxation ordinances, and foundational accounting manuals.",
            points: [
                "<strong>Archival Volume Cataloging:</strong> Surveyed physical archive stacks containing foundational texts on South Asian commercial law and public finance.",
                "<strong>Evolution of Statutory Standards:</strong> Traced historical transitions from legacy bookkeeping conventions to modern IFRS/IAS regulatory benchmarks.",
                "<strong>Research Literature Synthesis:</strong> Formulated structured reading annotations supporting undergraduate research in corporate governance."
            ],
            tools: "Central Library Physical Archives &bull; Historical Research Dossier &bull; Comparative Analysis",
            location: "Central Library, Govt. Brojomohun College, Barishal",
            image: "assets/MyPhato/547404569_2038757233601128_4717052026797427268_n.jpg",
            imageAlt: "Md. Sabbir Hoshen in the college library archives surveying financial reference volumes"
        },
        "rural-outreach": {
            category: "COMMUNITY SERVICE // FIELD LOGISTICS",
            title: "Regional Rover Scout Rural Outreach & Route Mapping",
            status: "COMMUNITY FIELD LOGISTICS",
            summary: "Field-based community assessment and route reconnaissance in peri-urban and rural Barishal, organizing field logistics and communication pathways for youth mobilization and community disaster preparedness.",
            points: [
                "<strong>Route Access Reconnaissance:</strong> Mapped local access roads, river crossings, and emergency rally points for community mobilization.",
                "<strong>Scout Team Logistics:</strong> Supervised kit packing, field ration inventories, and rapid communication check-ins during outdoor drills.",
                "<strong>Community Needs Assessment:</strong> Engaged with local neighborhood residents to record primary infrastructure and seasonal flood vulnerability."
            ],
            tools: "Field Logistics Kit &bull; Route Planning &bull; Rover Scout Community Service",
            location: "Barishal Division, Southern Bangladesh",
            image: "assets/MyPhato/548302483_2038758410267677_7757873842697085935_n.jpg",
            imageAlt: "Md. Sabbir Hoshen equipped with travel backpack during rural scouting outreach"
        },
        "green-campus": {
            category: "SUSTAINABILITY // CAMPUS INITIATIVE",
            title: "Campus Environmental Stewardship & Green Audit",
            status: "STUDENT-LED SUSTAINABILITY INITIATIVE",
            summary: "A student-led ecological stewardship project across the historic Government Brojomohun College campus, mapping tree canopy health, waste segregation points, and organizing student environmental patrols.",
            points: [
                "<strong>Canopy Preservation Audit:</strong> Surveyed century-old indigenous trees and campus green spaces to highlight conservation priorities.",
                "<strong>Waste Disposal Mapping:</strong> Identified key disposal choke points across academic buildings to propose improved recycling receptables.",
                "<strong>Peer Volunteer Mobilization:</strong> Encouraged classmates and fellow scouts to adopt zero-litter practices across campus study zones."
            ],
            tools: "Campus Zoning Matrix &bull; Environmental Audit Checklist &bull; Student Outreach",
            location: "Govt. Brojomohun College Campus, Barishal",
            image: "assets/MyPhato/484980983_1889100101900176_4018985165419655048_n.jpg",
            imageAlt: "Md. Sabbir Hoshen standing amidst lush trees on the Brojomohun College campus"
        },
        waterfront: {
            category: "CIVIC OBSERVATION // URBAN WALK",
            title: "Barishal Waterfront Civic Drainage & Riverine Observation",
            status: "URBAN WALK & CIVIC OBSERVATION",
            summary: "A qualitative urban observation study documenting public waterfront promenades, river transport hubs, and canal runoff along the banks of the Kirtankhola River in Barishal.",
            points: [
                "<strong>Riverfront Public Space Utility:</strong> Evaluated civic accessibility, shaded walking corridors, and public space maintenance.",
                "<strong>Waterfront Drainage Inspection:</strong> Observed tidal flow dynamics and canal drainage outlets interacting with municipal waterways.",
                "<strong>Civic Reflection Journal:</strong> Recorded photographic logs and notes on sustainable urban-riverfront coexistence in southern Bangladesh."
            ],
            tools: "Field Walk Logs &bull; Urban Observational Notes &bull; Digital Photography",
            location: "Kirtankhola Riverfront & Lake Park, Barishal",
            image: "assets/MyPhato/568621359_2071978623612322_2164499406392233930_n.jpg",
            imageAlt: "Md. Sabbir Hoshen at the scenic lakeside walkway in Barishal"
        },
        mentoring: {
            category: "COMMUNITY LEADERSHIP // PEER MENTORING",
            title: "Peer Academic Mentoring & Accounting Study Circles",
            status: "ACADEMIC KNOWLEDGE SHARING",
            summary: "Organizing collaborative peer tutoring circles and revision workshops for junior business studies and accounting students at BM College, simplifying complex ledger principles and accounting theory.",
            points: [
                "<strong>Double-Entry Foundations:</strong> Mentored peers on ledger posting, debit-credit equalization, and trial balance reconciliation.",
                "<strong>Exam Problem Workshops:</strong> Structured step-by-step problem-solving walkthroughs for higher secondary and undergraduate accounting exams.",
                "<strong>Academic Confidence Building:</strong> Created an inclusive, open-question study environment fostering conceptual clarity and collaborative growth."
            ],
            tools: "Peer Study Circles &bull; Whiteboard Accounting Demonstrations &bull; Problem Solving Sets",
            location: "Govt. Brojomohun College, Barishal",
            image: "assets/MyPhato/465783742_1795988934544627_8139255824473982833_n.jpg",
            imageAlt: "Md. Sabbir Hoshen smiling outdoors on campus following an academic discussion"
        },
        omorekushe: {
            category: "NATIVE SYSTEMS PROGRAMMING // WIN32",
            title: "Omor Ekushe — Win32 Bengali Keyboard Engine",
            status: "OPEN-SOURCE SOFTWARE UTILITY",
            summary: "A modern, ultra-lightweight, 100% native Win32 Bengali keyboard engine featuring Avro phonetic typing algorithms, XML layout maps, and full options configuration. Built as an open-source linguistic tool for Windows.",
            points: [
                "<strong>Win32 Hook Architecture:</strong> Implements system-level keyboard hooks to capture and transform keystrokes in real-time.",
                "<strong>Phonetic Mapping Algorithm:</strong> Powered by Avro phonetic parsing rules and XML-based custom layout mapping definitions.",
                "<strong>Zero-Bloat Native Performance:</strong> Compiled for Windows with zero external runtime dependencies and minimal memory consumption."
            ],
            tools: "Win32 API &bull; C / C++ &bull; Avro Phonetic Algorithm &bull; XML Layouts",
            link: "https://sabbir28.github.io/OmorEkushe/",
            linkText: "Launch Omor Ekushe Web Portal &nearr;"
        },
        pylua: {
            category: "COMPILER ARCHITECTURE &amp; RUNTIME",
            title: "PyLua — Scripting Language &amp; Virtual Machine",
            status: "LANGUAGE DESIGN EXPERIMENT",
            summary: "A modern scripting language and bytecode virtual machine runtime experiment combining Python syntax elegance with Lua's embeddable execution efficiency. Features a complete language specification, opcode tables, and documentation portal.",
            points: [
                "<strong>Lexical &amp; Syntax Pipeline:</strong> Implements a custom tokenizer, abstract syntax tree (AST) generator, and semantic analyzer.",
                "<strong>Bytecode Virtual Machine:</strong> Custom stack/register-based opcode set designed for fast instruction dispatch and lightweight memory footprint.",
                "<strong>Comprehensive Documentation:</strong> Full documentation portal covering grammar specifications, standard libraries, and embed APIs."
            ],
            tools: "Python &bull; Lua Runtime &bull; Bytecode Compiler &bull; AST Parsing &bull; VM Architecture",
            link: "https://sabbir28.github.io/PyLua/",
            linkText: "Explore PyLua Documentation Portal &nearr;"
        },
        gftp: {
            category: "DEV-OPS &amp; CLI AUTOMATION",
            title: "gftp — Git-Aware Differential FTP Sync CLI",
            status: "PRODUCTION CLI UTILITY",
            summary: "A high-performance C++ command-line tool built for Windows that accelerates website and codebase deployments by performing Git commit differential FTP synchronization in a single command, avoiding redundant uploads.",
            points: [
                "<strong>Git Differential Parsing:</strong> Queries local Git commit trees to isolate only modified, added, or deleted files since the last deployment.",
                "<strong>Automated FTP Upload Pipeline:</strong> Connects to remote FTP servers, mirrors directory structures, and transfers differential payloads with speed.",
                "<strong>Windows CLI Ergonomics:</strong> Single-binary execution with command-line flags, color-coded terminal output, and credential security."
            ],
            tools: "C++17 &bull; Win32 Sockets &bull; Git Tree Parsing &bull; FTP Protocol Engine",
            link: "https://sabbir28.github.io/gftp/",
            linkText: "View gftp CLI Docs &amp; Installation &nearr;"
        },
        casabbir: {
            category: "FULL-STACK WEB &amp; EDUCATION",
            title: "CA Sabbir — Chartered Accountancy Prep Portal",
            status: "WEB APPLICATION &amp; STUDY HUB",
            summary: "A dedicated cloud-deployed web workspace and resource hub designed to streamline Chartered Accountancy (ICAB) curriculum preparation, syllabus tracking, revision notes, and study scheduling.",
            points: [
                "<strong>Curriculum Syllabus Tracker:</strong> Interactive progress checklists covering ICAB Certificate Level modules and statutory chapters.",
                "<strong>Study Resource Library:</strong> Structured repository indexing accounting standards summaries, taxation notes, and past examination problems.",
                "<strong>Cloud Deployment:</strong> Hosted on Vercel with responsive mobile-first interface and fast client-side rendering."
            ],
            tools: "Next.js / React &bull; Vercel Cloud Hosting &bull; ICAB Certificate Curriculum",
            link: "https://casabbir.vercel.app/",
            linkText: "Access CA Sabbir Web App &nearr;"
        },
        timer420: {
            category: "DESKTOP UTILITY &amp; PRODUCTIVITY",
            title: "Timer420 — Transparent Windows Work Timer Overlay",
            status: "NATIVE DESKTOP UTILITY",
            summary: "A high-performance, non-intrusive, transparent desktop work timer for Windows 10 &amp; 11 built in pure C11 with the native Win32 API. Designed for distraction-free deep work, Pomodoro sessions, and time logging.",
            points: [
                "<strong>Transparent DWM Overlay:</strong> Renders seamlessly above desktop windows without stealing focus or interrupting keyboard input.",
                "<strong>Pure C11 Performance:</strong> Ultra-minimal CPU and RAM footprint utilizing direct GDI/DWM composition APIs.",
                "<strong>Web Interactive Simulator:</strong> Companion web simulation portal showcasing live timer configurations and feature previews."
            ],
            tools: "Pure C11 &bull; Win32 Direct API &bull; DWM Desktop Composition &bull; Web Simulator",
            link: "https://sabbir28.github.io/Timer/",
            linkText: "Launch Timer420 Portal &amp; Simulator &nearr;"
        },
        notepadlite: {
            category: "DESKTOP APPLICATION &amp; OPEN SOURCE",
            title: "NotepadLite — Native Windows Text Editor (v26.02.62)",
            status: "BINARY RELEASE &amp; REPOSITORY",
            summary: "A lightweight, zero-bloat native Windows text editor release engineered for instant cold startup, distraction-free document drafting, and essential status bar metrics.",
            points: [
                "<strong>Instantaneous Startup:</strong> Direct Win32 GUI window creation bypassing heavy application frameworks for instant file opening.",
                "<strong>Status Bar &amp; Metrics:</strong> Real-time line and column tracking, character counts, and encoding indicators.",
                "<strong>Published GitHub Release:</strong> Packaged binary release (v26.02.62) with version tracking, bug fixes, and source distribution."
            ],
            tools: "C / C++ &bull; Win32 GUI &bull; GitHub Releases &bull; Windows Binary Packaging",
            link: "https://github.com/sabbir28/Notepad/releases/tag/v26.02.62",
            linkText: "Download NotepadLite Release (v26.02.62) &nearr;"
        }
    };

    window.openProjectModal = function (projectId) {
        const item = projectData[projectId];
        if (!item) return;

        const modal = document.getElementById("projectModal");
        const body = document.getElementById("modalBody");
        if (!modal || !body) return;

        const imageHtml = item.image ? `
            <div class="modal-hero-wrap">
                <img src="${item.image}" alt="${item.imageAlt || item.title}" class="modal-hero-img" loading="lazy">
                <div class="modal-hero-caption">
                    <span>${item.location ? `&bull; ${item.location}` : 'Visual Field Chronicle'}</span>
                    <a href="${item.image}" target="_blank" rel="noopener noreferrer" class="modal-zoom-link">Open High-Res Photo &nearr;</a>
                </div>
            </div>
        ` : '';

        const actionBtnHtml = item.link ? `
            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border-light);">
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="modal-action-btn">
                    ${item.linkText || 'Open External Resource &nearr;'}
                </a>
            </div>
        ` : '';

        body.innerHTML = `
            ${imageHtml}
            <div class="modal-category">${item.category}</div>
            <h3 class="modal-title">${item.title}</h3>
            <span class="modal-tag">${item.status}</span>
            <p class="modal-summary">
                ${item.summary}
            </p>
            <div class="modal-section">
                <div class="modal-section-title">
                    Key Highlights &amp; Technical Architecture
                </div>
                <ul class="modal-list">
                    ${item.points.map((pt) => `<li>${pt}</li>`).join("")}
                </ul>
            </div>
            <div class="modal-section" style="padding-bottom: 0;">
                <div class="modal-section-title">
                    Toolkit, Location &amp; Methodology
                </div>
                <p style="font-family: var(--mono); font-size: 13px; color: var(--navy-midnight);">
                    ${item.tools}
                </p>
                ${item.location ? `
                <p style="font-family: var(--sans); font-size: 13px; color: var(--text-muted); margin-top: 8px;">
                    <strong>Location:</strong> ${item.location}
                </p>` : ''}
            </div>
            ${actionBtnHtml}
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

    function initSecondaryFilter() {
        const filterNav = document.getElementById("secondaryFilterNav");
        const grid = document.getElementById("secondaryGrid");
        if (!filterNav || !grid) return;

        const buttons = filterNav.querySelectorAll(".secondary-filter-btn");
        const cards = grid.querySelectorAll(".secondary-card");

        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const filter = btn.getAttribute("data-filter");
                buttons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                cards.forEach((card) => {
                    const cat = card.getAttribute("data-category");
                    if (filter === "all" || cat === filter) {
                        card.style.display = "flex";
                        card.style.opacity = "1";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    function init() {
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                window.closeProjectModal();
            }
        });
        initSecondaryFilter();
    }

    root.Portfolio.modal = {
        init: init,
        projectData: projectData
    };
})(typeof window !== "undefined" ? window : this);
