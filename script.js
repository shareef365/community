// Google Sheets Configuration
// Instructions: 
// 1. Create a Google Sheet with columns: Name, Category, Description, Link, Features, Type
// 2. Share the sheet: File -> Share -> Publish to web
// 3. Copy the Sheet ID from the URL (the long string between /d/ and /edit)
// 4. Replace 'YOUR_SHEET_ID_HERE' below with your actual ID.
const SHEET_ID = '1noPP3HC5dW6k8EUAxsmwEBtJH16oBORwXssfRKn7h3A';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let groups = [
    // Fallback data in case the sheet fails to load
    {
        name: "TG EAPCET 2026 - Main Group",
        category: "TG EAPCET",
        description: "Official community Group 1. Join if you haven't yet! If full, check Group 2.",
        link: "https://chat.whatsapp.com/example-tg-g1",
        features: ["Daily Practice (DPPs)", "Formula Sheets", "Expert Tips"],
        type: "group"
    },
    {
        name: "Official WhatsApp Channel",
        category: "Official Channel",
        description: "Follow our official channel for one-way announcements and universal updates.",
        link: "https://whatsapp.com/channel/example",
        features: ["Universal Alerts", "Privacy Guaranteed", "Direct Admin Links"],
        type: "channel"
    }
];

const exams = {
    "TG EAPCET": "May 9, 2026 09:00:00",
    "AP EAPCET": "May 12, 2026 09:00:00"
};

async function fetchGroupsFromSheet() {
    if (!SHEET_ID || SHEET_ID === 'YOUR_SHEET_ID_HERE') {
        console.log('Using fallback data. Please set your Google Sheet ID in script.js');
        return;
    }

    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();

        // Safety check to ensure we got the Google Visualization response
        if (!text.includes('google.visualization.Query.setResponse')) {
            throw new Error('Spreadsheet not published to web or restricted. Please check Step 2 of the instructions.');
        }

        const jsonData = JSON.parse(text.substring(47).slice(0, -2));

        const rows = jsonData.table.rows.slice(1);
        const fetchedGroups = rows.map(row => {
            return {
                name: row.c[0] ? row.c[0].v : '',
                category: row.c[1] ? row.c[1].v : '',
                description: row.c[2] ? row.c[2].v : '',
                link: row.c[3] ? row.c[3].v : '',
                features: row.c[4] ? row.c[4].v.split(',').map(f => f.trim().replace(/^["']|["']$/g, '')) : [],
                type: row.c[5] ? row.c[5].v : 'group'
            };
        });

        if (fetchedGroups.length > 0) {
            groups = fetchedGroups;
            console.log('Groups successfully synchronized from Google Sheets');
        }
    } catch (error) {
        console.error('Error fetching Google Sheet data:', error);
    }
}

function updateTimers() {
    const timerGrid = document.getElementById('timer-grid');
    if (!timerGrid) return;

    timerGrid.innerHTML = '';

    Object.entries(exams).forEach(([name, date]) => {
        const target = new Date(date).getTime();
        const now = new Date().getTime();
        const diff = target - now;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const timerBox = document.createElement('div');
        timerBox.className = 'bg-white px-8 py-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-4 group hover:border-red-200 transition-all w-80 shadow-sm text-center';
        timerBox.innerHTML = `
            <div class="space-y-1">
                
                <h3 class="text-sm font-black text-slate-900 uppercase italic tracking-tighter"><span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>${name}</h3>
            </div>
            
            <div class="flex items-baseline gap-3 font-mono justify-center">
                <div class="flex flex-col items-center min-w-[40px]">
                    <span class="text-3xl font-black text-red-600 italic leading-none">${d}</span>
                    <span class="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">Days</span>
                </div>
                <span class="text-xl font-black text-red-200 opacity-50 self-start mt-1">:</span>
                <div class="flex flex-col items-center min-w-[40px]">
                    <span class="text-3xl font-black text-red-600 italic leading-none">${h.toString().padStart(2, '0')}</span>
                    <span class="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hrs</span>
                </div>
                <span class="text-xl font-black text-red-200 opacity-50 self-start mt-1">:</span>
                <div class="flex flex-col items-center min-w-[40px]">
                    <span class="text-3xl font-black text-red-600 italic leading-none">${m.toString().padStart(2, '0')}</span>
                    <span class="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">Min</span>
                </div>
                <span class="text-xl font-black text-red-200 opacity-50 self-start mt-1">:</span>
                <div class="flex flex-col items-center min-w-[40px]">
                    <span class="text-3xl font-black text-red-600 italic leading-none animate-pulse">${s.toString().padStart(2, '0')}</span>
                    <span class="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sec</span>
                </div>
            </div>
        `;
        timerGrid.appendChild(timerBox);
    });

    if (window.lucide) lucide.createIcons();
}

function showSimulator() {
    window.open('https://exam.henceprove.com/exams/eapcet-tg-03052025-forenoon', '_blank');
}

document.addEventListener('DOMContentLoaded', async () => {
    const groupGrid = document.getElementById('group-grid');
    const searchInput = document.getElementById('search-groups');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Initial timer call
    updateTimers();
    setInterval(updateTimers, 1000); // Live high-precision countdown

    // Sync from Google Sheets before rendering
    await fetchGroupsFromSheet();

    function renderGroups(filter = 'all', query = '') {
        groupGrid.innerHTML = '';
        const filtered = groups.filter(group => {
            const matchesFilter = filter === 'all' || group.category === filter;
            const matchesQuery = group.name.toLowerCase().includes(query.toLowerCase()) ||
                group.description.toLowerCase().includes(query.toLowerCase());
            return matchesFilter && matchesQuery;
        });

        if (filtered.length === 0) {
            groupGrid.innerHTML = `
                <div class="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <i data-lucide="search-x" class="w-8 h-8"></i>
                    </div>
                    <p class="text-slate-400 text-sm font-bold uppercase tracking-widest">No Tactical Groups Found</p>
                    <p class="text-[10px] text-slate-300 uppercase tracking-widest mt-2">Adjust your filters or search query</p>
                </div>
            `;
            return;
        }

        const container = document.createElement('div');
        container.className = 'flex flex-col gap-4 p-6';

        filtered.forEach(group => {
            const isChannel = group.type === 'channel';
            const card = document.createElement('div');
            card.className = 'group bg-white rounded-2xl border border-slate-100 p-4 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6';

            card.innerHTML = `
                <div class="flex items-start md:items-center gap-5 flex-1">
                    <!-- Icon -->
                    <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                        <i data-lucide="${isChannel ? 'radio' : 'users'}" class="w-6 h-6"></i>
                    </div>
                    
                    <!-- Identity -->
                    <div class="space-y-1 overflow-hidden">
                        <div class="flex items-center gap-3 flex-wrap">
                            <h4 class="text-sm font-black text-slate-900 uppercase italic tracking-tight break-words">${group.name}</h4>
                            <span class="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded-md border border-blue-100 uppercase tracking-widest shrink-0">
                                ${group.category}
                            </span>
                        </div>
                        <p class="text-[10px] font-bold text-slate-400 line-clamp-2 max-w-xl">${group.description}</p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0">
                    <!-- Features -->
                    <div class="flex gap-2">
                        ${group.features.slice(0, 2).map(f => `
                            <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">${f}</span>
                        `).join('')}
                    </div>

                    <!-- Action -->
                    <a href="${group.link}" target="_blank" 
                        class="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 hover:shadow-blue-200">
                        Join Group
                        <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                    </a>
                </div>
            `;
            container.appendChild(card);
        });

        groupGrid.appendChild(container);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Final render
    renderGroups();


    // Search events
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const activeBtn = document.querySelector('.filter-btn.active');
            renderGroups(activeBtn ? activeBtn.dataset.filter : 'all', e.target.value);
        });
    }

    // Filter events
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => {
                    b.classList.remove('active');
                    b.classList.remove('bg-blue-600', 'text-white');
                    b.classList.add('text-slate-500');
                });

                btn.classList.add('active');
                btn.classList.remove('text-slate-500');
                renderGroups(btn.dataset.filter, searchInput ? searchInput.value : '');
            });
        });
    }
});
