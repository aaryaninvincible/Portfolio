// Initialize Firebase
// IMPORTANT: Replace the values below with your actual Firebase project config!
// 1. Go to console.firebase.google.com
// 2. Click "Add Project"
// 3. Follow steps, click the Web icon (</>) to create a web app
// 4. Copy the firebaseConfig object into here.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBlnFJsISYdAn6XFiV-Zac8BaidNj8c4RY",
    authDomain: "portfolio-923c7.firebaseapp.com",
    databaseURL: "https://portfolio-923c7-default-rtdb.firebaseio.com",
    projectId: "portfolio-923c7",
    storageBucket: "portfolio-923c7.firebasestorage.app",
    messagingSenderId: "7632313367",
    appId: "1:7632313367:web:54c413b52131abc9da9052",
    measurementId: "G-FW2M7JRKWH"
};

// Initialize Firebase
let app, db, auth, storage;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log("Firebase initialized successfully (if using actual config)");
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

export { app, db, auth, storage };
