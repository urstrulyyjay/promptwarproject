// src/services/auth.js
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'https://esm.sh/firebase@10.8.0/auth';
import './db.js';

export const auth = getAuth();

/**
 * Initializes authentication and listens for state changes.
 * @param {Function} onUserLogin Callback when a user logs in.
 * @param {Function} onStaffLogin Callback when staff logs in.
 * @param {Function} onLogout Callback when user logs out.
 */
export const watchAuthState = (onUserLogin, onStaffLogin, onLogout) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // For hackathon simplicity, we determine role via custom claim or UI override
            // Here, we'll store local role selection to simulate proper claims without an admin SDK backend.
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
};

/**
 * Authenticate the user anonymously based on selected role.
 */
export const loginAsRole = async (role) => {
    sessionStorage.setItem('stadium_role', role);
    await signInAnonymously(auth);
};

export const logout = async () => {
    sessionStorage.removeItem('stadium_role');
    await signOut(auth);
};
