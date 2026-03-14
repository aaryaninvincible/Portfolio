import { app, db } from './firebase-config.js';
import { collection, addDoc, getDocs, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM Elements
const authOverlay = document.getElementById('auth-overlay');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logoutBtn');

// Auth State Listener (Bypassed Firebase Auth)
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        // User is logged in
        authOverlay.style.display = 'none';
        dashboard.style.display = 'block';

        // Load Data
        loadQueries();
        loadProjects();
        loadStats();
    } else {
        // User is signed out
        authOverlay.style.display = 'flex';
        dashboard.style.display = 'none';
    }
}

// Initial check
checkAuthStatus();

// Login Form Handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();

    const validUsers = new Set([
        'aaryaninvincible',
        'aaryabinvincible',
        'aryan',
        'admin',
        'aryanraikwar78@gmail.com'
    ]);
    const isValidUser = validUsers.has(username);
    const isValidPass = password === '0411' || password === 'admin0411';

    if (isValidUser && isValidPass) {
        console.log("Logged in!");
        authError.style.display = 'none';
        localStorage.setItem('adminLoggedIn', 'true');
        checkAuthStatus(); // load dashboard
    } else {
        authError.textContent = "Invalid username/password. Use your configured admin credentials.";
        authError.style.display = 'block';
    }
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    checkAuthStatus();
    console.log("Logged out");
});

// Load Contact Queries
async function loadQueries() {
    const list = document.getElementById('queriesList');
    try {
        if (!db) throw new Error("Firestore not initialized.");
        const querySnapshot = await getDocs(collection(db, "queries"));

        if (querySnapshot.empty) {
            list.innerHTML = "<p>No new messages.</p>";
            return;
        }

        const items = [];
        querySnapshot.forEach((snap) => items.push({ id: snap.id, ...snap.data() }));
        items.sort((a, b) => {
            const at = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.clientTime || 0).getTime();
            const bt = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.clientTime || 0).getTime();
            return bt - at;
        });

        let html = '';
        items.forEach((data) => {
            const rawDate = data.timestamp?.toDate ? data.timestamp.toDate() : (data.clientTime ? new Date(data.clientTime) : null);
            const date = rawDate ? rawDate.toLocaleString() : 'Unknown Date';
            html += `
                <div class="card">
                    <div style="display:flex; justify-content:space-between;">
                        <h3>${data.name}</h3>
                        <span class="badge">${date}</span>
                    </div>
                    <p style="color:var(--secondary); margin-bottom:10px;">${data.email}</p>
                    <p>${data.message}</p>
                    <button class="btn btn-danger" style="margin-top:15px; width:auto; padding:5px 10px; font-size:0.8rem;" onclick="deleteQuery('${data.id}')">Delete</button>
                </div>
            `;
        });
        list.innerHTML = html;
    } catch (error) {
        console.error("Error loading queries: ", error);
        list.innerHTML = `<p style="color:red">Failed to load queries. Did you configure Firestore rules?</p>`;
    }
}

// Ensure the window can call delete functions from inline handlers
window.deleteQuery = async function (id) {
    if (confirm("Are you sure you want to delete this query?")) {
        await deleteDoc(doc(db, "queries", id));
        loadQueries();
    }
}

// Project Form Handler
const projectForm = document.getElementById('projectForm');
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = projectForm.querySelector('button');
    btn.textContent = "Uploading...";
    btn.disabled = true;

    try {
        const title = document.getElementById('projTitle').value;
        const description = document.getElementById('projDesc').value;
        const techs = document.getElementById('projTech').value.split(',').map(t => t.trim());
        const link = document.getElementById('projLink').value;
        const github = document.getElementById('projGithub').value;
        const category = document.getElementById('projCategory').value;
        const imgUrl = document.getElementById('projImgUrl').value;

        await addDoc(collection(db, "projects"), {
            title, description, techs, link, github, category, imgUrl,
            timestamp: new Date()
        });

        projectForm.reset();
        loadProjects();
        alert("Project added successfully!");
    } catch (error) {
        console.error("Error adding project: ", error);
        alert("Failed to add project.");
    } finally {
        btn.textContent = "Add Project";
        btn.disabled = false;
    }
});

// Load Existing Projects
async function loadProjects() {
    const list = document.getElementById('existingProjectsList');
    try {
        if (!db) throw new Error("Firestore not initialized.");
        const querySnapshot = await getDocs(collection(db, "projects"));

        if (querySnapshot.empty) {
            list.innerHTML = "<p>No projects found.</p>";
            return;
        }

        const items = [];
        querySnapshot.forEach((snap) => items.push({ id: snap.id, ...snap.data() }));
        items.sort((a, b) => {
            const at = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
            const bt = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
            return bt - at;
        });

        let html = '<div class="stats-grid">';
        items.forEach((data) => {
            html += `
                <div class="card" style="margin-bottom:0;">
                    <img src="${data.imgUrl || ''}" style="width:100%; height:150px; object-fit:cover; border-radius:5px; margin-bottom:10px; background:#111;">
                    <h3>${data.title}</h3>
                    <span class="badge" style="margin-bottom:10px; display:inline-block;">${data.category}</span>
                    <button class="btn btn-danger" style="width:100%; padding:5px; font-size:0.9rem; margin-top:10px;" onclick="deleteProject('${data.id}')">Delete</button>
                </div>
            `;
        });
        html += '</div>';
        list.innerHTML = html;
    } catch (error) {
        console.error("Error loading projects: ", error);
        list.innerHTML = `<p style="color:red">Failed to load projects.</p>`;
    }
}

window.deleteProject = async function (id) {
    if (confirm("Are you sure you want to delete this project?")) {
        await deleteDoc(doc(db, "projects", id));
        loadProjects();
    }
}

// Stats Form Logic
const statsForm = document.getElementById('statsForm');
statsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = statsForm.querySelector('button');
    btn.textContent = "Saving...";
    btn.disabled = true;

    try {
        const followers = document.getElementById('instaFollowers').value;
        const views = document.getElementById('instaViews').value;

        // Save to a specific document ID so we can easily read it
        await setDoc(doc(db, "stats", "instagram"), {
            followers,
            views,
            lastUpdated: new Date()
        });

        alert("Stats updated!");
        loadStats();
    } catch (error) {
        console.error("Error saving stats: ", error);
        alert("Failed to save stats.");
    } finally {
        btn.textContent = "Save Stats";
        btn.disabled = false;
    }
});

async function loadStats() {
    try {
        const statSnap = await getDoc(doc(db, "stats", "instagram"));
        if (statSnap.exists()) {
            const data = statSnap.data();
            document.getElementById('currentInstaFollowers').textContent = data.followers || 'N/A';
            document.getElementById('currentInstaViews').textContent = data.views || 'N/A';

            document.getElementById('instaFollowers').value = data.followers || '';
            document.getElementById('instaViews').value = data.views || '';
        }
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}
