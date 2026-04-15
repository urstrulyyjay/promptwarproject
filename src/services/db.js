// src/services/db.js
// Firebase Initialization and Firestore Services — graceful fallback
// NO top-level await — everything is lazy to prevent blocking module load

import { CONFIG } from '../config.js';

export let app = null;
export let db = null;

const isFirebaseConfigured = CONFIG.FIREBASE &&
    CONFIG.FIREBASE.apiKey &&
    CONFIG.FIREBASE.apiKey !== "demo-api-key" &&
    CONFIG.FIREBASE.apiKey !== "your_api_key_here" &&
    CONFIG.FIREBASE.apiKey !== "dummy-api-key";

// Lazy init — called on demand, never blocks module load
let _initPromise = null;
function lazyInit() {
    if (!isFirebaseConfigured) return Promise.resolve(false);
    if (_initPromise) return _initPromise;
    _initPromise = (async () => {
        try {
            const firebaseApp = await import('https://esm.sh/firebase@10.8.0/app');
            const firestoreMod = await import('https://esm.sh/firebase@10.8.0/firestore');
            app = firebaseApp.initializeApp(CONFIG.FIREBASE);
            db = firestoreMod.getFirestore(app);
            console.log("Firebase initialized successfully.");
            return true;
        } catch (e) {
            console.warn("Firebase init failed, using offline mock data:", e.message);
            return false;
        }
    })();
    return _initPromise;
}

// Data structure mimicking the original prototype
export let stadiumState = {
    gates: {},
    foodQueues: {},
    zones: {}
};

export const onGatesUpdate = (callback) => {
    if (!isFirebaseConfigured) return;
    lazyInit().then(ok => {
        if (!ok || !db) return;
        import('https://esm.sh/firebase@10.8.0/firestore').then((mod) => {
            mod.onSnapshot(mod.collection(db, "gates"), (snapshot) => {
                snapshot.forEach(d => {
                    stadiumState.gates[d.id] = { id: d.id, ...d.data() };
                });
                callback(stadiumState.gates);
            });
        }).catch(e => console.warn("Gates listener failed:", e.message));
    });
};

export const onFoodUpdate = (callback) => {
    if (!isFirebaseConfigured) return;
    lazyInit().then(ok => {
        if (!ok || !db) return;
        import('https://esm.sh/firebase@10.8.0/firestore').then((mod) => {
            mod.onSnapshot(mod.collection(db, "foodQueues"), (snapshot) => {
                snapshot.forEach(d => {
                    stadiumState.foodQueues[d.id] = { id: d.id, ...d.data() };
                });
                callback(stadiumState.foodQueues);
            });
        }).catch(e => console.warn("Food listener failed:", e.message));
    });
};

// Admin Action
export const toggleGateStatus = async (gateId, currentStatus) => {
    if (!isFirebaseConfigured) {
        console.warn("Firestore not configured. Mocking database update.");
        return;
    }
    const ok = await lazyInit();
    if (!ok || !db) return;
    try {
        const mod = await import('https://esm.sh/firebase@10.8.0/firestore');
        const gateRef = mod.doc(db, "gates", gateId);
        const newStatus = currentStatus === 'open' ? 'closed' : 'open';
        await mod.updateDoc(gateRef, { status: newStatus });
    } catch (e) {
        console.warn("Toggle gate failed:", e.message);
    }
};
