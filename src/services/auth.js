// src/services/auth.js
// Graceful auth service — works with or without Firebase
// NO top-level await — everything is lazy

import { CONFIG } from '../config.js';

const isFirebaseConfigured = CONFIG.FIREBASE &&
    CONFIG.FIREBASE.apiKey &&
    CONFIG.FIREBASE.apiKey !== "demo-api-key" &&
    CONFIG.FIREBASE.apiKey !== "your_api_key_here" &&
    CONFIG.FIREBASE.apiKey !== "dummy-api-key";

// Lazy init — only loads Firebase modules when actually needed
let _authPromise = null;
function lazyInitAuth() {
    if (!isFirebaseConfigured) return Promise.resolve(null);
    if (_authPromise) return _authPromise;
    _authPromise = (async () => {
        try {
            const { app } = await import('./db.js');
            // Wait a tick for db.js lazyInit if needed
            const authMod = await import('https://esm.sh/firebase@10.8.0/auth');
            if (app) {
                return {
                    auth: authMod.getAuth(app),
                    signInAnonymously: authMod.signInAnonymously,
                    onAuthStateChanged: authMod.onAuthStateChanged,
                    signOut: authMod.signOut
                };
            }
        } catch (e) {
            console.warn("Firebase Auth not available, using offline mode:", e.message);
        }
        return null;
    })();
    return _authPromise;
}

/**
 * Initializes authentication and listens for state changes.
 * Falls back to a no-op if Firebase isn't configured.
 */
export const watchAuthState = (onUserLogin, onStaffLogin, onLogout) => {
    if (!isFirebaseConfigured) {
        console.log("Auth: Offline mode — role selection handled via direct DOM.");
        return;
    }
    lazyInitAuth().then(authCtx => {
        if (!authCtx) return;
        authCtx.onAuthStateChanged(authCtx.auth, (user) => {
            if (user) {
                const role = sessionStorage.getItem('stadium_role');
                if (role === 'admin') {
                    onStaffLogin();
                } else {
                    onUserLogin();
                }
            } else {
                onLogout();
            }
        });
    });
};

/**
 * Authenticate the user anonymously based on selected role.
 */
export const loginAsRole = async (role) => {
    sessionStorage.setItem('stadium_role', role);
    if (!isFirebaseConfigured) return;
    const authCtx = await lazyInitAuth();
    if (authCtx) {
        try {
            await authCtx.signInAnonymously(authCtx.auth);
        } catch (e) {
            console.warn("Anonymous sign-in failed:", e.message);
        }
    }
};

export const logout = async () => {
    sessionStorage.removeItem('stadium_role');
    if (!isFirebaseConfigured) return;
    const authCtx = await lazyInitAuth();
    if (authCtx) {
        try {
            await authCtx.signOut(authCtx.auth);
        } catch (e) {
            console.warn("Sign-out failed:", e.message);
        }
    }
};
