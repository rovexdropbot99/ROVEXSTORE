// =====================================================
// ROVEX STORE - FIREBASE
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {
    apiKey: "AIzaSyAMKO9_wnSIXsBh0U3RV0iJbjgoQdNTpmE",
    authDomain: "rovex-store.firebaseapp.com",
    projectId: "rovex-store",
    storageBucket: "rovex-store.firebasestorage.app",
    messagingSenderId: "295498680940",
    appId: "1:295498680940:web:ec79ee9f544e1958c8e649",
    measurementId: "G-F1731WRLBS"
};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);


// =====================================================
// FIREBASE SERVICES
// =====================================================

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


// =====================================================
// EXPORT
// =====================================================

export {
    app,
    auth,
    db,
    storage
};