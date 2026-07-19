import axios from 'axios'

const BASE = '/.netlify/functions'
const client = axios.create({ baseURL: BASE })

const MOCK_STORAGE_KEY = 'sarkar_mock_data';
const MOCK_ENABLE_KEY = 'sarkar_use_mock';

export let useMock = localStorage.getItem(MOCK_ENABLE_KEY) === 'true';

const defaultMockStore = {
    members: [],
    tournaments: { upcoming: [], running: [], past: [] },
    scrims: [],
    settings: { posterEnabled: false, posterUrl: '', homePageAiPanel: null },
    studyMotivation: {
        lastQuote: "Your parents are waiting for your success. Don't let them down.",
        count: 0
    }
};

function deduplicateMembers(members) {
    const seen = new Set();
    return members.filter(m => {
        if (seen.has(m._id)) return false;
        seen.add(m._id);
        return true;
    });
}

function loadMockStore() {
    try {
        const raw = localStorage.getItem(MOCK_STORAGE_KEY);
        if (!raw) return { ...defaultMockStore };
        const parsed = JSON.parse(raw);
        // Deduplicate members on load to fix any stale duplicate state
        parsed.members = deduplicateMembers(parsed.members || []);
        return parsed;
    } catch {
        return { ...defaultMockStore };
    }
}

export const mockStore = loadMockStore();

function saveMockStore() {
    // Deduplicate before saving too
    mockStore.members = deduplicateMembers(mockStore.members);
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockStore));
    localStorage.setItem(MOCK_ENABLE_KEY, String(useMock));
}

async function apiCall(method, url, data = null, headers = {}) {
    if (useMock && import.meta.env.DEV) {
        await new Promise(r => setTimeout(r, 200));
        return handleMockRequest(method, url, data);
    }

    try {
        const config = { method, url, data, headers };
        const res = await client(config);

        // Vite proxy fallback or Netlify error page (returns index.html instead of JSON)
        if (typeof res.data === 'string' && res.data.includes('<html')) {
            throw new Error('Received HTML fallback instead of JSON');
        }

        return res.data;
    } catch (err) {
        if (import.meta.env.DEV) {
            console.warn(`[Local Dev] API fail on ${url}. Switching to Mock Mode.`);
            useMock = true;
            saveMockStore();
            return handleMockRequest(method, url, data);
        }
        throw err;
    }
}

function handleMockRequest(method, url, data) {
    const isGet = method.toLowerCase() === 'get';
    if (url.includes('/members') && !url.includes('/admin-members')) {
        if (isGet) return mockStore.members;
        if (data) { mockStore.members.push({ ...data, _id: Date.now().toString(), stats: { kills: 0, matches: 0 } }); saveMockStore(); return { ok: true }; }
    }
    if (url.includes('/tournaments')) {
        if (isGet) return mockStore.tournaments;
        if (data && data.action === 'add') { mockStore.tournaments.upcoming.push({ ...data, _id: Date.now().toString(), participants: [] }); saveMockStore(); return { ok: true }; }
        if (data && data.action === 'register') {
            const t = [...mockStore.tournaments.upcoming, ...mockStore.tournaments.running].find(x => x._id === data.id);
            if (t) {
                if (!t.participants) t.participants = [];
                if (!t.participants.find(p => p.uid === data.participant.uid)) {
                    t.participants.push(data.participant);
                }
                saveMockStore();
            }
            return { ok: true, isPaid: false };
        }
        if (data && data.action === 'update') {
            const t = [...mockStore.tournaments.upcoming, ...mockStore.tournaments.running].find(x => x._id === data.id);
            if (t) {
                Object.assign(t, data);
                saveMockStore();
                return { ok: true };
            }
        }
        if (data && data.action === 'finalize') {
            const tIdx = mockStore.tournaments.running.findIndex(x => x._id === data.id);
            if (tIdx !== -1) {
                const tourney = mockStore.tournaments.running.splice(tIdx, 1)[0];
                tourney.section = 'past';
                delete tourney.prediction;
                mockStore.tournaments.past.push(tourney);
                saveMockStore();
                return { ok: true };
            }
        }
    }
    if (url.includes('/scrims')) {
        if (isGet) return mockStore.scrims;
        if (data && data.action === 'add') { mockStore.scrims.push({ ...data, _id: Date.now().toString() }); saveMockStore(); return { ok: true }; }
    }
    if (url.includes('/settings')) {
        if (isGet) return mockStore.settings;
        if (method.toLowerCase() === 'post') {
            mockStore.settings = { ...mockStore.settings, ...data };
            saveMockStore();
            return { ok: true };
        }
    }
    if (url.includes('/admin-login')) {
        return { token: 'mock-admin-token' };
    }
    if (url.includes('/admin-members')) {
        if (isGet) return mockStore.members;
    }
    if (url.includes('/admin-update-uid')) {
        const { id, uid } = data || {};
        const m = mockStore.members.find(m => m._id === id);
        if (m) { m.uid = uid; saveMockStore(); return { ok: true }; }
        return { ok: false };
    }
    if (url.includes('/send-notification')) {
        return { ok: true };
    }
    if (url.includes('/user-login')) {
        const inputUuid = String(data?.uuid || '');
        let member = mockStore.members.find(m => m.uuid === inputUuid);
        if (!member && inputUuid === 'ashish123') {
            const ashish = { 
                name: 'ASHISH (Creator)', 
                uid: 'ashish123', 
                uuid: 'ashish123', 
                role: 'Leader', 
                _id: 'dev_mock_id', 

                studyTasks: [
                    { id: 1, subject: 'Mathematics', duration: 60, completed: false },
                    { id: 2, subject: 'Physics', duration: 45, completed: true }
                ],
                stats: { tourney: { kills: 87, matches: 120, wins: 5 } } 
            };
            mockStore.members.push(ashish);
            saveMockStore();
            member = ashish;
        }
        if (member) return { ok: true, member };
        throw new Error('Invalid Secret UUID. Try ashish123 for local test.');
    }



    if (url.includes('/update-study-tasks')) {
        const member = mockStore.members.find(m => m._id === data.id);
        if (member) {
            member.studyTasks = data.tasks;
            saveMockStore();
            return { ok: true };
        }
    }

    return { ok: true };
}

// ── User Auth & Identity ─────────────────────────────────────
export async function userLogin(uuid) {
    return apiCall('post', '/user-login', { uuid })
}

// ── Members & Stats ──────────────────────────────────────────
export async function getMembers() {
    return apiCall('get', '/members')
}

export async function submitMember(data) {
    return apiCall('post', '/members', data)
}

// ── Tournaments ──────────────────────────────────────────────
export async function getTournaments() {
    return apiCall('get', '/tournaments')
}

export async function registerForTournament(tourneyId, participant) {
    return apiCall('post', '/tournaments', { action: 'register', id: tourneyId, participant })
}

// ── Admin auth ─────────────────────────────────────────────
export async function adminLogin(email, password) {
    return apiCall('post', '/admin-login', { email, password })
}

// ── Admin management ─────────────────────────────────────────
export async function adminGetMembers(adminToken) {
    return apiCall('get', '/admin-members', null, { Authorization: `Bearer ${adminToken}` })
}

export async function adminUpdateStats(id, stats, adminToken, category = 'tourney') {
    return apiCall('put', `/admin-members?id=${id}&action=stats&category=${category}`, stats, { Authorization: `Bearer ${adminToken}` })
}

export async function adminManageTournament(action, data, adminToken) {
    return apiCall('post', '/tournaments', { action, ...data }, { Authorization: `Bearer ${adminToken}` })
}

export async function adminDeleteMember(id, adminToken) {
    return apiCall('delete', `/admin-members?id=${id}`, null, { Authorization: `Bearer ${adminToken}` })
}

export async function adminUpdateRole(id, role, adminToken) {
    return apiCall('put', `/admin-members?id=${id}&action=role`, { role }, { Authorization: `Bearer ${adminToken}` })
}

export async function adminUpdateMemberUuid(id, uuid, adminToken) {
    return apiCall('post', `/admin-update-uid`, { id, uuid }, { Authorization: `Bearer ${adminToken}` })
}

export async function adminSendNotification(title, body, adminToken) {
    return apiCall('post', `/send-notification`, { title, body }, { Authorization: `Bearer ${adminToken}` })
}

export async function savePushSubscription(uid, subscription, siteToken, memberId = null) {
    return apiCall('post', '/save-push-subscription', { uid, subscription, memberId }, { Authorization: `Bearer ${siteToken}` })
}

// ── Scrims (International) ──────────────────────────────────
export async function getScrims() {
    return apiCall('get', '/scrims')
}

export async function adminManageScrim(action, data, adminToken) {
    return apiCall('post', '/scrims', { action, ...data }, { Authorization: `Bearer ${adminToken}` })
}

// ── Settings ──────────────────────────────────────────────────
export async function getSettings() {
    return apiCall('get', '/settings')
}

export async function adminUpdateSettings(data, adminToken) {
    return apiCall('post', '/settings', data, { Authorization: `Bearer ${adminToken}` })
}



export async function updateStudyTasks(id, tasks) {
    return apiCall('post', '/update-study-tasks', { id, tasks })
}

// ── Demo Data Helper ─────────────────────────────────────────
export async function loadDemoData(adminToken) {
    const demoMembers = [
        { name: 'SARKAR_BOSS', uid: '112233', role: 'Leader' },
        { name: 'Elite_Gamer', uid: '445566', role: 'Member' },
        { name: 'Ghost_Killer', uid: '778899', role: 'Member' },
        { name: 'Aura_Legend', uid: '990011', role: 'Member' }
    ]

    const demoTourneys = [
        {
            title: 'SARKAR CHAMPIONS LEAGUE', date: '28 Feb', prize: '10,000 INR',
            section: 'upcoming', type: 'Squad', teamSize: 4,
            description: 'The ultimate showdown of the Sarkar Guild.',
            entryFee: '100 per person',
            prizes: { winner: '5,000', runner: '3,000', mvp: '2,000' }
        }
    ]

    if (useMock && import.meta.env.DEV) {
        mockStore.members = demoMembers.map(m => ({ ...m, _id: Math.random().toString(), stats: { tourney: { kills: Math.floor(Math.random() * 30), matches: Math.floor(Math.random() * 10) } } }));
        mockStore.tournaments.upcoming = demoTourneys.map(t => ({ ...t, _id: Math.random().toString(), participants: [] }));
        mockStore.scrims = [
            { _id: '1', title: 'SARKAR VS BDT (BD)', opponent: 'BDT', date: '5 March' }
        ];
        mockStore.settings = {
            posterEnabled: false,
            posterUrl: '',
            homePageAiPanel: {
                visible: true,
                title: "SARKAR 3.0 LAUNCHED",
                content: "SARKAR 3.0 IS HERE\nThe ultimate guild experience evolved.\n\n➤ NEW AI Tournament Predictor\n➤ Advanced Player Statistics\n➤ Real-time Push Notifications"
            }
        };
        saveMockStore();
        return { ok: true };
    }

    for (const m of demoMembers) await submitMember(m)
    for (const t of demoTourneys) await adminManageTournament('add', t, adminToken)

    return { ok: true }
}
