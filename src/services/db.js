// src/services/db.js
// Firebase Initialization and Firestore Services

import { initializeApp } from 'https://esm.sh/firebase@10.8.0/app';
import { 
    getFirestore, collection, doc, onSnapshot, updateDoc 
} from 'https://esm.sh/firebase@10.8.0/firestore';
import { CONFIG } from '../config.js';

// Fallback logic incase config isn't populated for judges playing with code directly
const app = initializeApp(CONFIG.FIREBASE.apiKey ? CONFIG.FIREBASE : {
    // Dummy config prevents app crash if user forgets to rename config.js
    apiKey: "dummy-api-key",
    projectId: "demo-project"
});

export const db = getFirestore(app);

// Data structure mimicking the original prototype
export let stadiumState = {
    gates: {},
    foodQueues: {},
    zones: {}
};

export const onGatesUpdate = (callback) => {
    // In a real database, connect to 'gates' collection. We rely on the mock data fallback for seamless UI initially if Firebase fails.
    if(CONFIG.FIREBASE.apiKey !== "your_api_key_here") {
        return onSnapshot(collection(db, "gates"), (snapshot) => {
            snapshot.forEach(doc => {
                stadiumState.gates[doc.id] = { id: doc.id, ...doc.data() };
            });
            callback(stadiumState.gates);
        });
    }
};

export const onFoodUpdate = (callback) => {
    if(CONFIG.FIREBASE.apiKey !== "your_api_key_here") {
        return onSnapshot(collection(db, "foodQueues"), (snapshot) => {
            snapshot.forEach(doc => {
                stadiumState.foodQueues[doc.id] = { id: doc.id, ...doc.data() };
            });
            callback(stadiumState.foodQueues);
        });
    }
};

// Admin Action
export const toggleGateStatus = async (gateId, currentStatus) => {
    if(CONFIG.FIREBASE.apiKey === "your_api_key_here") {
        console.warn("Firestore not configured. Mocking database update.");
        return;
    }
    const gateRef = doc(db, "gates", gateId);
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    await updateDoc(gateRef, {
        status: newStatus
    });
};
