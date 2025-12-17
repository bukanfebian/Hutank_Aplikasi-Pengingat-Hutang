// ===== HUTANK - Main Application JavaScript =====

// Firebase Configuration
const firebaseConfig = {
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Rate Limiting Configuration
const RATE_LIMIT = {
    maxAttempts: 5,
    windowMs: 60000, // 1 minute
    attempts: {},

    check(action) {
        const now = Date.now();
        const key = action;

        if (!this.attempts[key]) {
            this.attempts[key] = { count: 1, timestamp: now };
            return true;
        }

        if (now - this.attempts[key].timestamp > this.windowMs) {
            this.attempts[key] = { count: 1, timestamp: now };
            return true;
        }

        if (this.attempts[key].count >= this.maxAttempts) {
            return false;
        }

        this.attempts[key].count++;
        return true;
    },

    reset(action) {
        delete this.attempts[action];
    }
};

// Motivational Quotes
const QUOTES = [
    { text: "Bayar Hutank woii, sah sampai jatuh tempo.", author: "@bukanfebian_ (Developer Hutank)" },
    { text: "Setiap cicilan yang dibayar adalah langkah menuju kebebasan finansial.", author: "🎯" },
    { text: "Disiplin hari ini, bebas finansial esok hari.", author: "✨" },
    { text: "Catat, kelola, lunasi. Tiga langkah menuju bebas hutang!", author: "📝" },
    { text: "Jangan malu punya hutang, yang penting ada niat untuk melunasi.", author: "🌟" },
    { text: "Keuangan yang sehat dimulai dari kesadaran akan setiap pengeluaran.", author: "💰" },
    { text: "Cicilan kecil yang rutin lebih baik dari janji besar yang kosong.", author: "🔥" },
    { text: "Hari ini bayar cicilan, esok lebih ringan beban pikiran.", author: "😊" },
    { text: "Hutang adalah guru tentang pentingnya perencanaan keuangan.", author: "📚" },
    { text: "Setiap rupiah yang dilunasi adalah investasi untuk ketenangan jiwa.", author: "💎" },
    { text: "Jangan biarkan hutang mengontrol hidupmu, kontrolah hutangmu!", author: "👊" },
    { text: "Progress is progress, no matter how small. Bayar terus cicilanmu!", author: "🚀" }
];

// App State
let currentUser = null;
let debts = [];
let currentDebtId = null;
let currentFilter = 'all';
let isDataLoading = true;

// DOM Elements
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);


// ... (skip content) ...

function getSkeletonHTML() {
    return Array(3).fill(0).map(() => `
        <div class="skeleton-card">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <div class="skeleton skeleton-text" style="width: 50%;"></div>
                <div class="skeleton skeleton-text" style="width: 20%;"></div>
            </div>
            <div class="skeleton skeleton-text" style="width: 80%;"></div>
            <div style="margin-top: 16px;">
                <div class="skeleton skeleton-text"></div>
            </div>
        </div>
    `).join('');
}

// Initialize App
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    renderAuthScreen();
    renderAppScreen();
    renderModals();

    // Load saved theme
    loadSavedTheme();

    // Auth State Observer
    auth.onAuthStateChanged(handleAuthStateChange);

    // Setup Event Listeners
    setupEventListeners();

    // Setup number formatters for inputs
    setupNumberFormatters();

    // Setup keyboard dismiss for mobile
    setupKeyboardDismiss();

    // Request notification permission
    requestNotificationPermission();
}

function renderAuthScreen() {
    $('#auth-screen').innerHTML = `
        <div class="auth-background">
            <div class="floating-shape shape-1"></div>
            <div class="floating-shape shape-2"></div>
            <div class="floating-shape shape-3"></div>
        </div>
        
        <div class="auth-container">
            <div class="auth-header">
                <div class="auth-logo"><i class="fas fa-piggy-bank"></i></div>
                <h1>Hutank</h1>
                <p>Kelola hutang dengan mudah 💰</p>
            </div>

            <div id="login-form" class="auth-form glass-card">
                <h2>Masuk</h2>
                <div class="form-group">
                    <label for="login-email"><i class="fas fa-envelope"></i> Email</label>
                    <input type="email" id="login-email" placeholder="Masukkan email" required>
                </div>
                <div class="form-group">
                    <label for="login-password"><i class="fas fa-lock"></i> Password</label>
                    <div class="password-input">
                        <input type="password" id="login-password" placeholder="Masukkan password" required>
                        <button type="button" class="toggle-password" tabindex="-1"><i class="fas fa-eye"></i></button>
                    </div>
                </div>

                <div class="auth-options" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 13px;">
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-primary);">
                        <input type="checkbox" id="remember-me"> Ingat Saya
                    </label>
                    <a href="#" id="link-forgot-password" style="color: var(--primary); text-decoration: none; font-weight: 500;">Lupa Password?</a>
                </div>
                <button id="btn-login" class="btn btn-primary btn-block"><i class="fas fa-sign-in-alt"></i> Masuk</button>
                <div class="auth-divider"><span>atau</span></div>
                <button id="btn-google-login" class="btn btn-google btn-block">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
                    Masuk dengan Google
                </button>
                <p class="auth-switch">Belum punya akun? <a href="#" id="show-register">Daftar</a></p>
            </div>

            <div id="register-form" class="auth-form glass-card hidden">
                <h2>Daftar</h2>
                <div class="form-group">
                    <label for="register-name"><i class="fas fa-user"></i> Nama Lengkap</label>
                    <input type="text" id="register-name" placeholder="Masukkan nama" required>
                </div>
                <div class="form-group">
                    <label for="register-email"><i class="fas fa-envelope"></i> Email</label>
                    <input type="email" id="register-email" placeholder="Masukkan email" required>
                </div>
                <div class="form-group">
                    <label for="register-password"><i class="fas fa-lock"></i> Password</label>
                    <div class="password-input">
                        <input type="password" id="register-password" placeholder="Minimal 6 karakter" required>
                        <button type="button" class="toggle-password"><i class="fas fa-eye"></i></button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="register-confirm"><i class="fas fa-lock"></i> Konfirmasi Password</label>
                    <div class="password-input">
                        <input type="password" id="register-confirm" placeholder="Ulangi password" required>
                        <button type="button" class="toggle-password"><i class="fas fa-eye"></i></button>
                    </div>
                </div>
                <button id="btn-register" class="btn btn-primary btn-block"><i class="fas fa-user-plus"></i> Daftar</button>
                <div class="auth-divider"><span>atau</span></div>
                <button id="btn-google-register" class="btn btn-google btn-block">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
                    Daftar dengan Google
                </button>
                <p class="auth-switch">Sudah punya akun? <a href="#" id="show-login">Masuk</a></p>
            </div>
        </div>
    `;
}

function renderAppScreen() {
    $('#app-screen').innerHTML = `
        <header class="app-header glass-header">
            <div class="header-content">
                <div class="header-left">
                    <div class="user-avatar" id="user-avatar"><i class="fas fa-user"></i></div>
                    <div class="header-info">
                        <span class="greeting" id="greeting">Halo!</span>
                        <h2 id="user-name">User</h2>
                    </div>
                </div>
                <div class="header-right">
                    <button class="btn-icon" id="btn-notification">
                        <i class="fas fa-bell"></i>
                        <span class="notification-badge hidden" id="notification-badge">0</span>
                    </button>
                    <button class="btn-icon" id="btn-logout"><i class="fas fa-sign-out-alt"></i></button>
                </div>
            </div>
        </header>

        <main class="app-main">
            <div id="view-home" class="view active"></div>
            <div id="view-list" class="view"></div>
            <div id="view-form" class="view"></div>
            <div id="view-detail" class="view"></div>
            <div id="view-stats" class="view"></div>
            <div id="view-profile" class="view"></div>
        </main>

        <nav class="bottom-nav glass-nav">
            <button class="nav-item active" data-view="home"><i class="fas fa-home"></i><span>Beranda</span></button>
            <button class="nav-item" data-view="list"><i class="fas fa-list"></i><span>Hutang</span></button>
            <button class="nav-item nav-add" id="btn-add-debt"><i class="fas fa-plus"></i></button>
            <button class="nav-item" data-view="stats"><i class="fas fa-chart-bar"></i><span>Statistik</span></button>
            <button class="nav-item" data-view="profile"><i class="fas fa-user"></i><span>Profil</span></button>
        </nav>
    `;
}

function renderModals() {
    $('#modal-delete').innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content glass-card">
            <div class="modal-icon danger"><i class="fas fa-trash-alt"></i></div>
            <h3>Hapus Hutang?</h3>
            <p>Data hutang ini akan dihapus permanen.</p>
            <div class="modal-actions">
                <button class="btn btn-secondary" id="btn-cancel-delete">Batal</button>
                <button class="btn btn-danger" id="btn-confirm-delete">Hapus</button>
            </div>
        </div>
    `;

    $('#modal-paid').innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content glass-card">
            <div class="modal-icon success"><i class="fas fa-check-circle"></i></div>
            <h3>Bayar Cicilan?</h3>
            <p>Tandai cicilan bulan ini sudah dibayar?</p>
            <div class="modal-actions">
                <button class="btn btn-secondary" id="btn-cancel-paid">Batal</button>
                <button class="btn btn-success" id="btn-confirm-paid">Sudah Bayar</button>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    // Auth Form Toggles
    document.addEventListener('click', (e) => {
        if (e.target.id === 'show-register' || e.target.closest('#show-register')) {
            e.preventDefault();
            $('#login-form').classList.add('hidden');
            $('#register-form').classList.remove('hidden');
        }
        if (e.target.id === 'show-login' || e.target.closest('#show-login')) {
            e.preventDefault();
            $('#register-form').classList.add('hidden');
            $('#login-form').classList.remove('hidden');
        }
    });

    // Password Toggle
    document.addEventListener('click', (e) => {
        if (e.target.closest('.toggle-password')) {
            const btn = e.target.closest('.toggle-password');
            const input = btn.previousElementSibling;
            const icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        }
    });

    // Forgot Password Link
    document.addEventListener('click', (e) => {
        if (e.target.id === 'link-forgot-password' || e.target.closest('#link-forgot-password')) {
            e.preventDefault();
            showResetPasswordModal();
        }
    });

    // Login Button
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-login' || e.target.closest('#btn-login')) {
            handleEmailLogin(e);
        }
    });

    // Register Button
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-register' || e.target.closest('#btn-register')) {
            handleEmailRegister(e);
        }
    });

    // Google Login
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-google-login' || e.target.closest('#btn-google-login') ||
            e.target.id === 'btn-google-register' || e.target.closest('#btn-google-register')) {
            handleGoogleLogin();
        }
    });

    // Logout
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-logout' || e.target.closest('#btn-logout')) {
            handleLogout();
        }
    });

    // Navigation
    document.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item:not(.nav-add)');
        if (navItem) {
            const view = navItem.dataset.view;
            switchView(view);
            $$('.nav-item').forEach(n => n.classList.remove('active'));
            navItem.classList.add('active');
        }
    });

    // Add Debt Button
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-add-debt' || e.target.closest('#btn-add-debt')) {
            showAddForm();
        }
    });

    // Back buttons
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-back-form' || e.target.closest('#btn-back-form') ||
            e.target.id === 'btn-cancel-form' || e.target.closest('#btn-cancel-form')) {
            switchView('list');
        }
        if (e.target.id === 'btn-back-detail' || e.target.closest('#btn-back-detail')) {
            switchView('list');
        }
    });

    // Refresh Quote
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-refresh-quote' || e.target.closest('#btn-refresh-quote')) {
            displayRandomQuote();
        }
    });

    // Notification Button
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-notification' || e.target.closest('#btn-notification')) {
            showNotificationPanel();
        }
    });

    // Filter Tabs
    document.addEventListener('click', (e) => {
        const filterTab = e.target.closest('.filter-tab');
        if (filterTab) {
            currentFilter = filterTab.dataset.filter;
            $$('.filter-tab').forEach(t => t.classList.remove('active'));
            filterTab.classList.add('active');
            renderDebtList();
        }
    });

    // Debt Form Submit
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'debt-form') {
            e.preventDefault();
            handleSaveDebt();
        }
    });

    // Debt Card Click
    document.addEventListener('click', (e) => {
        const debtCard = e.target.closest('.debt-card');
        if (debtCard && !e.target.closest('.debt-actions')) {
            const debtId = debtCard.dataset.id;
            showDebtDetail(debtId);
        }
    });

    // Modal actions
    document.addEventListener('click', (e) => {
        if (e.target.closest('.modal-backdrop') || e.target.id === 'btn-cancel-delete') {
            $('#modal-delete').classList.add('hidden');
        }
        if (e.target.id === 'btn-confirm-delete') {
            confirmDeleteDebt();
        }
        if (e.target.id === 'btn-cancel-paid') {
            $('#modal-paid').classList.add('hidden');
        }
        if (e.target.id === 'btn-confirm-paid') {
            confirmPayDebt();
        }
    });

    // Edit & Delete from Detail
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-edit-debt' || e.target.closest('#btn-edit-debt')) {
            showEditForm(currentDebtId);
        }
        if (e.target.id === 'btn-delete-debt' || e.target.closest('#btn-delete-debt')) {
            $('#modal-delete').classList.remove('hidden');
        }
        if (e.target.id === 'btn-pay-debt' || e.target.closest('#btn-pay-debt')) {
            $('#modal-paid').classList.remove('hidden');
        }
    });
}

// ===== AUTH HANDLERS =====
async function handleAuthStateChange(user) {
    setTimeout(() => {
        $('#loading-screen').classList.add('fade-out');
    }, 1500);

    setTimeout(() => {
        $('#loading-screen').classList.add('hidden');

        if (user) {
            currentUser = user;
            showAppScreen();
            loadUserData();
        } else {
            currentUser = null;
            showAuthScreen();
        }
    }, 2000);
}

function showAuthScreen() {
    $('#auth-screen').classList.remove('hidden');
    $('#app-screen').classList.add('hidden');
}

function showAppScreen() {
    $('#auth-screen').classList.add('hidden');
    $('#app-screen').classList.remove('hidden');
    updateHeader();
    displayRandomQuote();
}

// ===== UI HELPERS =====
function setButtonLoading(btn, isLoading) {
    if (isLoading) {
        btn.classList.add('btn-loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
    }
}

async function handleEmailLogin(e) {
    e.preventDefault();
    // Assuming 'check' is a global function for rate limiting
    if (!RATE_LIMIT.check('login')) {
        showToast('error', 'Terlalu Banyak Percobaan', 'Coba lagi dalam 1 menit.');
        return;
    }

    const email = $('#login-email').value;
    const password = $('#login-password').value;
    // The original call site is a click on a button, not a submit on a form.
    // e.target would be the button itself.
    // To make this work, the event listener should be on the form's submit event.
    // If it remains a click on the button, e.target.querySelector('button[type="submit"]')
    // will not work as e.target is the button, not the form.
    // I'm making a best-effort interpretation based on the provided code snippet.
    // Assuming the button is within a form, and e.target is the form itself (if called from a submit event).
    // If called from a click event on the button, 'e.target' IS the button.
    // I will assume 'e' is the event from the button click, and 'e.target' is the button.
    const btn = e.target.closest('button'); // Find the button that was clicked

    if (!email || !password) {
        showToast('warning', 'Validasi', 'Mohon isi email dan password');
        return;
    }

    setButtonLoading(btn, true);

    try {
        // Handle persistence (Remember Me)
        const rememberMe = $('#remember-me') ? $('#remember-me').checked : false;
        const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
        await auth.setPersistence(persistence);

        await auth.signInWithEmailAndPassword(email, password);
        RATE_LIMIT.reset('login'); // Reset rate limit on success
        showToast('success', 'Berhasil!', 'Selamat datang kembali!');
        // Auth state listener will handle redirect
    } catch (error) {
        console.error('Login error:', error);
        let msg = 'Gagal masuk. Periksa kembali email dan password.';
        if (error.code === 'auth/user-not-found') msg = 'Akun tidak ditemukan.';
        if (error.code === 'auth/wrong-password') msg = 'Password salah.';
        if (error.code === 'auth/too-many-requests') msg = 'Terlalu banyak percobaan. Coba lagi nanti.';
        if (error.code === 'auth/invalid-email') msg = 'Format email tidak valid.'; // Added from original
        if (error.code === 'auth/network-request-failed') msg = 'Gagal terhubung ke server. Periksa koneksi internet.';

        showToast('error', 'Login Gagal', msg);
        setButtonLoading(btn, false);
    }
}

async function handleEmailRegister(e) {
    e.preventDefault();
    const name = $('#register-name').value.trim();
    const email = $('#register-email').value.trim();
    const password = $('#register-password').value;
    const confirm = $('#register-confirm').value;

    // Asumsi event dari button click
    const btn = e.target.closest('button');

    if (!name || !email || !password || !confirm) {
        showToast('warning', 'Data Kurang', 'Mohon lengkapi semua field.');
        return;
    }

    if (name.length < 3) {
        showToast('warning', 'Validasi Nama', 'Nama minimal 3 karakter.');
        return;
    }

    if (password !== confirm) {
        showToast('warning', 'Validasi Password', 'Konfirmasi password tidak cocok.');
        return;
    }

    if (password.length < 6) {
        showToast('warning', 'Password Lemah', 'Password minimal 6 karakter.');
        return;
    }

    if (!RATE_LIMIT.check('register')) {
        showToast('error', 'Terlalu Banyak Percobaan', 'Coba lagi dalam 1 menit.');
        return;
    }

    setButtonLoading(btn, true);

    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        await result.user.updateProfile({ displayName: name });

        // Save user data to database
        await database.ref(`users/${result.user.uid}`).set({
            name: name,
            email: email,
            createdAt: Date.now()
        });

        RATE_LIMIT.reset('register');
        showToast('success', 'Pendaftaran Berhasil', 'Silakan login dengan akun baru Anda.');
        // Berikan delay sedikit sebelum switch/reset form jika perlu, tapi auth listener akan handle redirect
    } catch (error) {
        console.error('Register error:', error);
        let message = 'Terjadi kesalahan saat mendaftar.';

        if (error.code === 'auth/email-already-in-use') message = 'Email ini sudah terdaftar. Silakan login.';
        if (error.code === 'auth/invalid-email') message = 'Format email tidak valid.';
        if (error.code === 'auth/weak-password') message = 'Password terlalu lemah. Tambahkan angka atau simbol.';
        if (error.code === 'auth/network-request-failed') message = 'Gagal terhubung ke server. Periksa koneksi internet.';
        if (error.code === 'auth/operation-not-allowed') message = 'Pendaftaran email sedang dinonaktifkan sementara.';

        showToast('error', 'Gagal Daftar', message);
        setButtonLoading(btn, false);
    }
}

async function handleGoogleLogin() {
    if (!RATE_LIMIT.check('google-auth')) {
        showToast('error', 'Terlalu Banyak Percobaan', 'Coba lagi dalam 1 menit.');
        return;
    }

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        // Try popup first, fallback to redirect
        let result;
        try {
            result = await auth.signInWithPopup(provider);
        } catch (popupError) {
            if (popupError.code === 'auth/popup-blocked') {
                showToast('info', 'Popup Diblokir', 'Menggunakan redirect...');
                await auth.signInWithRedirect(provider);
                return;
            }
            throw popupError;
        }

        // Check if new user
        if (result.additionalUserInfo && result.additionalUserInfo.isNewUser) {
            await database.ref(`users/${result.user.uid}`).set({
                name: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                createdAt: Date.now()
            });
        }

        RATE_LIMIT.reset('google-auth');
        showToast('success', 'Berhasil!', 'Selamat datang!');
    } catch (error) {
        console.error('Google login error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            return;
        } else if (error.code === 'auth/unauthorized-domain') {
            showToast('error', 'Domain Tidak Diizinkan', 'Tambahkan domain ini di Firebase Console > Authentication > Settings.');
        } else if (error.code === 'auth/operation-not-allowed') {
            showToast('error', 'Google Login Belum Aktif', 'Aktifkan Google Sign-In di Firebase Console.');
        } else if (error.code === 'auth/network-request-failed') {
            showToast('error', 'Koneksi Bermasalah', 'Gagal terhubung ke Google. Periksa koneksi internet.');
        } else {
            showToast('error', 'Gagal Login', 'Terjadi kesalahan saat masuk dengan Google. Silakan coba lagi.');
        }
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        showToast('info', 'Logout', 'Anda telah keluar dari akun.');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('error', 'Error', 'Gagal logout.');
    }
}

// ===== USER DATA =====
function updateHeader() {
    if (!currentUser) return;

    const hour = new Date().getHours();
    let greeting = 'Selamat Malam!';
    if (hour >= 5 && hour < 11) greeting = 'Selamat Pagi!';
    else if (hour >= 11 && hour < 15) greeting = 'Selamat Siang!';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore!';

    $('#greeting').textContent = greeting;
    $('#user-name').textContent = currentUser.displayName || 'User';

    const avatar = $('#user-avatar');
    if (currentUser.photoURL) {
        avatar.innerHTML = `<img src="${currentUser.photoURL}" alt="Avatar">`;
    } else {
        avatar.innerHTML = `<i class="fas fa-user"></i>`;
    }
}

function loadUserData() {
    if (!currentUser) return;

    const debtsRef = database.ref(`debts/${currentUser.uid}`);

    debtsRef.on('value', (snapshot) => {
        isDataLoading = false;
        debts = [];
        snapshot.forEach((child) => {
            debts.push({ id: child.key, ...child.val() });
        });

        renderHomeView();
        if (window.renderDebtList) renderDebtList();
        checkDueDates();
    });
}

// ===== VIEWS =====
function switchView(viewName) {
    $$('.view').forEach(v => v.classList.remove('active'));
    const viewEl = $(`#view-${viewName}`);
    if (viewEl) viewEl.classList.add('active');

    if (viewName === 'home') renderHomeView();
    if (viewName === 'list') renderDebtList();
    if (viewName === 'stats') renderStatsView();
    if (viewName === 'profile') renderProfileView();
}

function displayRandomQuote() {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const quoteText = $('#quote-text');
    const quoteAuthor = $('#quote-author');

    if (quoteText) {
        quoteText.style.opacity = '0';
        setTimeout(() => {
            quoteText.textContent = `"${quote.text}"`;
            quoteAuthor.textContent = quote.author;
            quoteText.style.opacity = '1';
        }, 200);
    }
}

function renderHomeView() {
    const activeDebts = debts.filter(d => d.status === 'active');
    const completedDebts = debts.filter(d => d.status === 'completed');
    const totalAmount = activeDebts.reduce((sum, d) => sum + (d.monthlyBill * (d.tenor - d.paidMonths)), 0);
    const dueSoon = activeDebts.filter(d => getDaysUntilDue(d.dueDate) <= 5).length;

    $('#view-home').innerHTML = `
        <div class="quote-card glass-card animate-float">
            <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
            <p class="quote-text" id="quote-text" style="transition: opacity 0.2s">Loading...</p>
            <div class="quote-author" id="quote-author">✨</div>
            <button class="btn-refresh-quote" id="btn-refresh-quote"><i class="fas fa-sync-alt"></i></button>
        </div>

        <div class="summary-section">
            <h3 class="section-title"><i class="fas fa-chart-pie"></i> Ringkasan</h3>
            <div class="summary-cards">
                <div class="summary-card glass-card">
                    <div class="summary-icon bg-gradient-primary"><i class="fas fa-list"></i></div>
                    <div class="summary-info">
                        <span class="summary-value">${activeDebts.length}</span>
                        <span class="summary-label">Hutang Aktif</span>
                    </div>
                </div>
                <div class="summary-card glass-card">
                    <div class="summary-icon bg-gradient-warning"><i class="fas fa-money-bill-wave"></i></div>
                    <div class="summary-info">
                        <span class="summary-value">${formatCurrency(totalAmount)}</span>
                        <span class="summary-label">Sisa Hutang</span>
                    </div>
                </div>
                <div class="summary-card glass-card">
                    <div class="summary-icon bg-gradient-danger"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="summary-info">
                        <span class="summary-value">${dueSoon}</span>
                        <span class="summary-label">Jatuh Tempo</span>
                    </div>
                </div>
                <div class="summary-card glass-card">
                    <div class="summary-icon bg-gradient-success"><i class="fas fa-check-circle"></i></div>
                    <div class="summary-info">
                        <span class="summary-value">${completedDebts.length}</span>
                        <span class="summary-label">Lunas</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="upcoming-section">
            <h3 class="section-title"><i class="fas fa-clock"></i> Jatuh Tempo Terdekat</h3>
            <div id="upcoming-list" class="upcoming-list">
                ${renderUpcomingDebts(activeDebts)}
            </div>
        </div>
    `;

    displayRandomQuote();
}

function renderUpcomingDebts(activeDebts) {
    const sorted = [...activeDebts]
        .map(d => ({ ...d, daysUntil: getDaysUntilDue(d.dueDate) }))
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 3);

    if (sorted.length === 0) {
        return `<div class="empty-state glass-card"><i class="fas fa-smile-beam"></i><p>Tidak ada hutang aktif</p></div>`;
    }

    return sorted.map(d => `
        <div class="debt-card" data-id="${d.id}">
            <div class="debt-card-header">
                <span class="debt-app-name">${escapeHtml(d.appName)}</span>
                <span class="debt-status ${d.daysUntil <= 2 ? 'danger' : d.daysUntil <= 5 ? 'active' : 'active'}">
                    ${d.daysUntil <= 0 ? 'Hari Ini!' : d.daysUntil + ' hari lagi'}
                </span>
            </div>
            <div class="debt-card-body">
                <span class="debt-amount">${formatCurrency(d.monthlyBill)}</span>
                <div class="debt-due">
                    <span class="debt-due-label">Tanggal</span>
                    <span class="debt-due-date">${d.dueDate}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== STATS VIEW =====
function renderStatsView() {
    const activeDebts = debts.filter(d => d.status === 'active');
    const completedDebts = debts.filter(d => d.status === 'completed');
    const totalDebt = activeDebts.reduce((sum, d) => sum + (d.monthlyBill * (d.tenor - d.paidMonths)), 0);
    const totalPaid = debts.reduce((sum, d) => sum + (d.monthlyBill * d.paidMonths), 0);
    const monthlyPayment = activeDebts.reduce((sum, d) => sum + d.monthlyBill, 0);

    // Calculate by app
    const debtByApp = {};
    activeDebts.forEach(d => {
        const remaining = d.monthlyBill * (d.tenor - d.paidMonths);
        debtByApp[d.appName] = (debtByApp[d.appName] || 0) + remaining;
    });

    const sortedApps = Object.entries(debtByApp).sort((a, b) => b[1] - a[1]);

    $('#view-stats').innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-chart-bar"></i> Statistik</h2>
        </div>
        
        <div class="stats-overview glass-card">
            <h3 class="stats-title">Ringkasan Keuangan</h3>
            
            <div class="stat-item">
                <div class="stat-label">Total Sisa Hutang</div>
                <div class="stat-value danger">${formatCurrency(totalDebt)}</div>
            </div>
            
            <div class="stat-item">
                <div class="stat-label">Total Sudah Dibayar</div>
                <div class="stat-value success">${formatCurrency(totalPaid)}</div>
            </div>
            
            <div class="stat-item">
                <div class="stat-label">Pembayaran per Bulan</div>
                <div class="stat-value primary">${formatCurrency(monthlyPayment)}</div>
            </div>
        </div>
        
        <div class="stats-breakdown glass-card">
            <h3 class="stats-title">Hutang per Aplikasi</h3>
            ${sortedApps.length === 0 ?
            '<p class="no-data">Belum ada data hutang</p>' :
            sortedApps.map(([name, amount], i) => `
                    <div class="stat-bar-item">
                        <div class="stat-bar-header">
                            <span class="stat-bar-name">${escapeHtml(name)}</span>
                            <span class="stat-bar-amount">${formatCurrency(amount)}</span>
                        </div>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: ${(amount / totalDebt * 100).toFixed(0)}%; background: ${getColorByIndex(i)}"></div>
                        </div>
                    </div>
                `).join('')
        }
        </div>
        
        <div class="stats-summary glass-card">
            <div class="stat-box">
                <i class="fas fa-list"></i>
                <span class="stat-box-value">${activeDebts.length}</span>
                <span class="stat-box-label">Hutang Aktif</span>
            </div>
            <div class="stat-box">
                <i class="fas fa-check-circle"></i>
                <span class="stat-box-value">${completedDebts.length}</span>
                <span class="stat-box-label">Lunas</span>
            </div>
            <div class="stat-box">
                <i class="fas fa-percentage"></i>
                <span class="stat-box-value">${totalDebt > 0 ? Math.round(totalPaid / (totalPaid + totalDebt) * 100) : 0}%</span>
                <span class="stat-box-label">Progress</span>
            </div>
        </div>
    `;
}

function getColorByIndex(index) {
    const colors = ['#667eea', '#f093fb', '#48bb78', '#f6ad55', '#fc8181', '#63b3ed'];
    return colors[index % colors.length];
}

// ===== PROFILE VIEW =====
function renderProfileView() {
    if (!currentUser) return;

    $('#view-profile').innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-user"></i> Profil</h2>
        </div>
        
        <div class="profile-card glass-card">
            <div class="profile-avatar-large" id="profile-avatar-large">
                ${currentUser.photoURL ?
            `<img src="${currentUser.photoURL}" alt="Avatar">` :
            `<i class="fas fa-user"></i>`
        }
            </div>
            
            <h2 class="profile-name">${escapeHtml(currentUser.displayName || 'User')}</h2>
            <p class="profile-email">${escapeHtml(currentUser.email)}</p>
            
            <div class="profile-stats">
                <div class="profile-stat">
                    <span class="profile-stat-value">${debts.filter(d => d.status === 'active').length}</span>
                    <span class="profile-stat-label">Hutang Aktif</span>
                </div>
                <div class="profile-stat">
                    <span class="profile-stat-value">${debts.filter(d => d.status === 'completed').length}</span>
                    <span class="profile-stat-label">Lunas</span>
                </div>
            </div>
        </div>
        
        <div class="profile-menu glass-card">
            <button class="profile-menu-item" id="btn-edit-profile">
                <i class="fas fa-edit"></i>
                <span>Edit Profil</span>
                <i class="fas fa-chevron-right"></i>
            </button>
            <button class="profile-menu-item" id="btn-change-photo">
                <i class="fas fa-camera"></i>
                <span>Ganti Foto Profil</span>
                <i class="fas fa-chevron-right"></i>
            </button>
            <button class="profile-menu-item" id="btn-change-theme">
                <i class="fas fa-palette"></i>
                <span>Ganti Tema</span>
                <i class="fas fa-chevron-right"></i>
            </button>
            <button class="profile-menu-item" id="btn-notification-settings">
                <i class="fas fa-bell"></i>
                <span>Pengaturan Notifikasi</span>
                <i class="fas fa-chevron-right"></i>
            </button>
            <button class="profile-menu-item" id="btn-about">
                <i class="fas fa-info-circle"></i>
                <span>Tentang Aplikasi</span>
                <i class="fas fa-chevron-right"></i>
            </button>
            <button class="profile-menu-item danger" id="btn-logout-profile">
                <i class="fas fa-sign-out-alt"></i>
                <span>Keluar</span>
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;

    // Add event listeners for profile menu
    setTimeout(() => {
        const logoutBtn = $('#btn-logout-profile');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        const editProfileBtn = $('#btn-edit-profile');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', showEditProfileModal);
        }

        const changePhotoBtn = $('#btn-change-photo');
        if (changePhotoBtn) {
            changePhotoBtn.addEventListener('click', showChangePhotoModal);
        }

        const changeThemeBtn = $('#btn-change-theme');
        if (changeThemeBtn) {
            changeThemeBtn.addEventListener('click', showThemeModal);
        }

        const notifSettingsBtn = $('#btn-notification-settings');
        if (notifSettingsBtn) {
            notifSettingsBtn.addEventListener('click', () => {
                requestNotificationPermission();
                showToast('info', 'Notifikasi', Notification.permission === 'granted' ? 'Notifikasi sudah aktif!' : 'Silakan izinkan notifikasi di browser.');
            });
        }

        const aboutBtn = $('#btn-about');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', () => {
                showToast('info', 'Hutank v1.0', 'Aplikasi pengingat hutang dibuat @Bukanfebian_❤️');
            });
        }
    }, 100);
}

function showEditProfileModal() {
    // Create modal for editing profile
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'modal-edit-profile';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content glass-card">
            <h3>Edit Profil</h3>
            <div class="form-group">
                <label><i class="fas fa-user"></i> Nama</label>
                <input type="text" id="edit-profile-name" value="${escapeHtml(currentUser.displayName || '')}" placeholder="Nama Anda">
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" id="btn-cancel-edit-profile">Batal</button>
                <button class="btn btn-primary" id="btn-save-profile">Simpan</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Event listeners
    $('#btn-cancel-edit-profile').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.remove());

    $('#btn-save-profile').addEventListener('click', async () => {
        const newName = $('#edit-profile-name').value.trim();
        if (newName) {
            try {
                await currentUser.updateProfile({ displayName: newName });
                await database.ref(`users/${currentUser.uid}/name`).set(newName);
                showToast('success', 'Berhasil!', 'Profil berhasil diperbarui.');
                modal.remove();
                updateHeader();
                renderProfileView();
            } catch (error) {
                showToast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan.');
            }
        }
    });
}

// ===== CHANGE PHOTO MODAL =====
function showChangePhotoModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'modal-change-photo';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content glass-card">
            <h3><i class="fas fa-camera"></i> Ganti Foto Profil</h3>
            
            <div class="photo-preview-container">
                <div class="photo-preview" id="photo-preview">
                    ${currentUser.photoURL ?
            `<img src="${currentUser.photoURL}" alt="Preview">` :
            `<i class="fas fa-user"></i>`
        }
                </div>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-upload"></i> Upload Foto</label>
                <input type="file" id="photo-file-input" accept="image/*" class="file-input">
                <span class="form-hint">Format: JPG, PNG. Maks 2MB</span>
            </div>
            
            <div class="form-divider"><span>atau</span></div>
            
            <div class="form-group">
                <label><i class="fas fa-link"></i> URL Foto</label>
                <input type="url" id="photo-url-input" placeholder="https://example.com/photo.jpg" value="${currentUser.photoURL || ''}">
                <span class="form-hint">Paste link gambar dari internet</span>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-secondary" id="btn-cancel-photo">Batal</button>
                <button class="btn btn-primary" id="btn-save-photo">Simpan</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Preview from file
    const fileInput = modal.querySelector('#photo-file-input');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast('error', 'File Terlalu Besar', 'Maksimal 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                modal.querySelector('#photo-preview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                modal.querySelector('#photo-url-input').value = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Preview from URL
    const urlInput = modal.querySelector('#photo-url-input');
    urlInput.addEventListener('change', () => {
        const url = urlInput.value.trim();
        if (url) {
            modal.querySelector('#photo-preview').innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-exclamation-triangle\\'></i>'">`;
        }
    });

    // Close modal
    modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.remove());
    modal.querySelector('#btn-cancel-photo').addEventListener('click', () => modal.remove());

    // Save photo
    modal.querySelector('#btn-save-photo').addEventListener('click', async () => {
        const photoURL = modal.querySelector('#photo-url-input').value.trim();

        if (!photoURL) {
            showToast('warning', 'Perhatian', 'Pilih foto atau masukkan URL');
            return;
        }

        try {
            await currentUser.updateProfile({ photoURL: photoURL });
            await database.ref(`users/${currentUser.uid}/photoURL`).set(photoURL);
            showToast('success', 'Berhasil!', 'Foto profil berhasil diperbarui.');
            modal.remove();
            updateHeader();
            renderProfileView();
        } catch (error) {
            console.error('Photo update error:', error);
            showToast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan foto.');
        }
    });
}

// ===== THEME MODAL =====
const THEMES = {
    default: {
        name: 'Purple Magic',
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
    },
    ocean: {
        name: 'Ocean Blue',
        primary: '#0077b6',
        secondary: '#00b4d8',
        accent: '#90e0ef',
        gradient: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)'
    },
    sunset: {
        name: 'Sunset Orange',
        primary: '#ff6b35',
        secondary: '#f7931e',
        accent: '#ffd23f',
        gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd23f 100%)'
    },
    forest: {
        name: 'Forest Green',
        primary: '#2d6a4f',
        secondary: '#40916c',
        accent: '#95d5b2',
        gradient: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 50%, #95d5b2 100%)'
    },
    rose: {
        name: 'Rose Pink',
        primary: '#e63946',
        secondary: '#f48c9f',
        accent: '#ffd6e0',
        gradient: 'linear-gradient(135deg, #e63946 0%, #f48c9f 50%, #ffd6e0 100%)'
    },
    dark: {
        name: 'Dark Mode',
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#818cf8',
        gradient: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 50%, #3d3d5c 100%)'
    }
};

function showThemeModal() {
    const currentTheme = localStorage.getItem('hutank-theme') || 'default';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'modal-theme';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content glass-card">
            <h3><i class="fas fa-palette"></i> Pilih Tema</h3>
            
            <div class="theme-grid">
                ${Object.entries(THEMES).map(([key, theme]) => `
                    <button class="theme-item ${currentTheme === key ? 'active' : ''}" data-theme="${key}">
                        <div class="theme-preview" style="background: ${theme.gradient}"></div>
                        <span class="theme-name">${theme.name}</span>
                    </button>
                `).join('')}
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-secondary" id="btn-cancel-theme">Tutup</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Theme selection
    modal.querySelectorAll('.theme-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const themeName = btn.dataset.theme;
            applyTheme(themeName);
            localStorage.setItem('hutank-theme', themeName);

            // Update active state
            modal.querySelectorAll('.theme-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            showToast('success', 'Tema Berubah', `Tema ${THEMES[themeName].name} diterapkan!`);
        });
    });

    // Close modal
    modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.remove());
    modal.querySelector('#btn-cancel-theme').addEventListener('click', () => modal.remove());
}

function applyTheme(themeName) {
    const theme = THEMES[themeName] || THEMES.default;
    const root = document.documentElement;

    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-dark', theme.secondary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--gradient-bg', theme.gradient);
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`);

    // Update body background
    document.body.style.background = theme.gradient;
    document.body.style.backgroundAttachment = 'fixed';

    // Update header background
    const header = document.querySelector('.app-header');
    if (header) {
        header.style.background = `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
    }

    // Update bottom nav
    const nav = document.querySelector('.bottom-nav');
    if (nav) {
        nav.style.background = `linear-gradient(135deg, ${theme.primary}ee 0%, ${theme.secondary}ee 100%)`;
    }

    // Update nav add button
    const navAdd = document.querySelector('.nav-add');
    if (navAdd) {
        navAdd.style.background = `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
    }
}

// Load saved theme on init
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('hutank-theme');
    if (savedTheme && THEMES[savedTheme]) {
        applyTheme(savedTheme);
    }
}

// ===== INPUT FORMATTERS =====
function formatNumberInput(input) {
    // Remove non-digits
    let value = input.value.replace(/\D/g, '');
    // Add dots as thousand separators
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = value;
}

function getNumberValue(input) {
    // Remove dots and convert to number
    return parseInt(input.value.replace(/\./g, '')) || 0;
}

// Setup number input formatters
function setupNumberFormatters() {
    document.addEventListener('input', (e) => {
        if (e.target.id === 'monthly-bill') {
            formatNumberInput(e.target);
        }
    });
}

// Dismiss keyboard on mobile when tapping outside input
function setupKeyboardDismiss() {
    document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('input, textarea, select')) {
            document.activeElement?.blur();
        }
    });

    // Also add a done button behavior - blur on Enter
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'textarea') {
            e.target.blur();
        }
    });
}

// ===== NOTIFICATION PANEL =====
function showNotificationPanel() {
    const activeDebts = debts.filter(d => d.status === 'active');
    const dueSoon = activeDebts
        .map(d => ({ ...d, daysUntil: getDaysUntilDue(d.dueDate) }))
        .filter(d => d.daysUntil <= 7)
        .sort((a, b) => a.daysUntil - b.daysUntil);

    // Create notification panel
    const panel = document.createElement('div');
    panel.className = 'notification-panel';
    panel.id = 'notification-panel';
    panel.innerHTML = `
        <div class="notification-backdrop"></div>
        <div class="notification-content glass-card">
            <div class="notification-header">
                <h3><i class="fas fa-bell"></i> Notifikasi</h3>
                <button class="btn-close-notif" id="btn-close-notif"><i class="fas fa-times"></i></button>
            </div>
            <div class="notification-body">
                ${dueSoon.length === 0 ?
            `<div class="empty-notification">
                        <i class="fas fa-check-circle"></i>
                        <p>Tidak ada hutang yang jatuh tempo dalam 7 hari ke depan 🎉</p>
                    </div>` :
            dueSoon.map(d => `
                        <div class="notification-item ${d.daysUntil <= 2 ? 'urgent' : ''}">
                            <div class="notif-icon ${d.daysUntil <= 2 ? 'danger' : 'warning'}">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="notif-content">
                                <div class="notif-title">${escapeHtml(d.appName)}</div>
                                <div class="notif-desc">${formatCurrency(d.monthlyBill)} - ${d.daysUntil <= 0 ? 'Jatuh tempo HARI INI!' : 'Jatuh tempo ' + d.daysUntil + ' hari lagi'}</div>
                            </div>
                        </div>
                    `).join('')
        }
            </div>
            ${Notification.permission !== 'granted' ? `
                <div class="notification-footer">
                    <button class="btn btn-primary btn-block" id="btn-enable-notif">
                        <i class="fas fa-bell"></i> Aktifkan Notifikasi Push
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    document.body.appendChild(panel);

    // Animate in
    setTimeout(() => panel.classList.add('active'), 10);

    // Event listeners
    const closePanel = () => {
        panel.classList.remove('active');
        setTimeout(() => panel.remove(), 300);
    };

    panel.querySelector('.notification-backdrop').addEventListener('click', closePanel);
    panel.querySelector('#btn-close-notif').addEventListener('click', closePanel);

    const enableBtn = panel.querySelector('#btn-enable-notif');
    if (enableBtn) {
        enableBtn.addEventListener('click', async () => {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                showToast('success', 'Berhasil!', 'Notifikasi push berhasil diaktifkan!');
                closePanel();
            } else {
                showToast('warning', 'Ditolak', 'Izin notifikasi ditolak. Anda bisa mengaktifkannya dari pengaturan browser.');
            }
        });
    }
}

function renderDebtList() {
    let filtered = debts;
    if (currentFilter === 'active') filtered = debts.filter(d => d.status === 'active');
    if (currentFilter === 'completed') filtered = debts.filter(d => d.status === 'completed');

    let listContent = '';

    if (isDataLoading) {
        listContent = getSkeletonHTML();
    } else if (filtered.length === 0) {
        listContent = `<div class="empty-state glass-card"><i class="fas fa-inbox"></i><p>Belum ada hutang</p></div>`;
    } else {
        listContent = filtered.sort((a, b) => b.createdAt - a.createdAt).map(d => renderDebtCard(d)).join('');
    }

    const viewList = $('#view-list');
    if (!viewList) return;

    viewList.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-list-alt"></i> Daftar Hutang</h2>
            <div class="filter-tabs">
                <button class="filter-tab ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Semua</button>
                <button class="filter-tab ${currentFilter === 'active' ? 'active' : ''}" data-filter="active">Aktif</button>
                <button class="filter-tab ${currentFilter === 'completed' ? 'active' : ''}" data-filter="completed">Lunas</button>
            </div>
        </div>
        <div id="debt-list" class="debt-list">
            ${listContent}
        </div>
    `;

    // Attach filter listeners
    viewList.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            renderDebtList();
        });
    });
}

function renderDebtCard(debt) {
    const progress = Math.round((debt.paidMonths / debt.tenor) * 100);
    const daysUntil = getDaysUntilDue(debt.dueDate);

    return `
        <div class="debt-card" data-id="${debt.id}">
            <div class="debt-card-header">
                <span class="debt-app-name">${escapeHtml(debt.appName)}</span>
                <span class="debt-status ${debt.status === 'completed' ? 'completed' : daysUntil <= 2 ? 'danger' : 'active'}">
                    ${debt.status === 'completed' ? 'Lunas' : daysUntil <= 0 ? 'Hari Ini!' : daysUntil + ' hari'}
                </span>
            </div>
            <div class="debt-card-body">
                <span class="debt-amount">${formatCurrency(debt.monthlyBill)}/bln</span>
                <div class="debt-due">
                    <span class="debt-due-label">Jatuh Tempo</span>
                    <span class="debt-due-date">Tgl ${debt.dueDate}</span>
                </div>
            </div>
            <div class="debt-progress">
                <div class="debt-progress-bar" style="width: ${progress}%"></div>
            </div>
            <div class="debt-progress-text">
                <span>${debt.paidMonths}/${debt.tenor} bulan</span>
                <span>${progress}%</span>
            </div>
        </div>
    `;
}

function showAddForm() {
    currentDebtId = null;
    renderForm('Tambah Hutang Baru', {});
    switchView('form');
}

function showEditForm(debtId) {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;
    currentDebtId = debtId;
    renderForm('Edit Hutang', debt);
    switchView('form');
}

function renderForm(title, data) {
    const today = new Date().toISOString().split('T')[0];

    $('#view-form').innerHTML = `
        <div class="view-header">
            <button class="btn-back" id="btn-back-form"><i class="fas fa-arrow-left"></i></button>
            <h2><i class="fas ${currentDebtId ? 'fa-edit' : 'fa-plus-circle'}"></i> ${title}</h2>
        </div>
        
        <form id="debt-form" class="debt-form glass-card">
            <input type="hidden" id="debt-id" value="${data.id || ''}">
            
            <div class="form-info-box">
                <i class="fas fa-info-circle"></i>
                <p>Isi form di bawah untuk mencatat hutang cicilan Anda. Data ini akan membantu mengingatkan jadwal pembayaran.</p>
            </div>
            
            <div class="form-group">
                <label for="app-name"><i class="fas fa-mobile-alt"></i> Nama Aplikasi / Sumber</label>
                <input type="text" id="app-name" placeholder="Contoh: Shopee PayLater, Kredivo, Akulaku" value="${escapeHtml(data.appName || '')}" required>
                <span class="form-hint">Nama aplikasi pinjaman atau sumber hutang Anda</span>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="monthly-bill"><i class="fas fa-money-bill"></i> Tagihan/Bulan (Rp)</label>
                    <input type="tel" inputmode="numeric" id="monthly-bill" placeholder="500.000" value="${data.monthlyBill ? parseInt(data.monthlyBill).toLocaleString('id-ID').replace(/\./g, '.') : ''}" required>
                    <span class="form-hint">Nominal cicilan per bulan</span>
                </div>
                <div class="form-group">
                    <label for="tenor"><i class="fas fa-calendar-alt"></i> Tenor (Bulan)</label>
                    <input type="number" id="tenor" placeholder="12" min="1" value="${data.tenor || ''}" required>
                    <span class="form-hint">Total lama cicilan dalam bulan</span>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="due-date"><i class="fas fa-calendar-day"></i> Tanggal Jatuh Tempo</label>
                    <input type="number" id="due-date" placeholder="15" min="1" max="31" value="${data.dueDate || ''}" required>
                    <span class="form-hint">Tanggal bayar setiap bulannya (1-31)</span>
                </div>
                <div class="form-group">
                    <label for="start-date"><i class="fas fa-calendar-plus"></i> Tanggal Mulai Cicilan</label>
                    <input type="date" id="start-date" value="${data.startDate || today}" required>
                    <span class="form-hint">Kapan cicilan pertama dimulai</span>
                </div>
            </div>

            <div class="form-group">
                <label for="paid-months"><i class="fas fa-check-double"></i> Bulan Sudah Dibayar</label>
                <input type="number" id="paid-months" placeholder="0" min="0" value="${data.paidMonths || 0}">
                <span class="form-hint">Berapa bulan cicilan yang sudah dibayar (0 jika baru mulai)</span>
            </div>

            <div class="form-group">
                <label for="notes"><i class="fas fa-sticky-note"></i> Catatan (Opsional)</label>
                <textarea id="notes" placeholder="Contoh: Cicilan HP Samsung S24">${escapeHtml(data.notes || '')}</textarea>
                <span class="form-hint">Keterangan tambahan untuk hutang ini</span>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="btn-cancel-form"><i class="fas fa-times"></i> Batal</button>
                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan</button>
            </div>
        </form>
    `;
}

async function handleSaveDebt() {
    if (!currentUser) return;

    // Get monthly bill value - remove dots first if formatted
    const monthlyBillInput = $('#monthly-bill').value.replace(/\./g, '');

    const data = {
        appName: $('#app-name').value.trim(),
        monthlyBill: parseInt(monthlyBillInput) || 0,
        tenor: parseInt($('#tenor').value) || 0,
        dueDate: parseInt($('#due-date').value) || 1,
        startDate: $('#start-date').value,
        paidMonths: parseInt($('#paid-months').value) || 0,
        notes: $('#notes').value.trim(),
        status: 'active',
        updatedAt: Date.now()
    };

    // Calculate completion date
    const startDate = new Date(data.startDate);
    const completionDate = new Date(startDate);
    completionDate.setMonth(completionDate.getMonth() + data.tenor);
    data.completionDate = completionDate.toISOString().split('T')[0];

    // Check if completed
    if (data.paidMonths >= data.tenor) {
        data.status = 'completed';
    }

    try {
        if (currentDebtId) {
            await database.ref(`debts/${currentUser.uid}/${currentDebtId}`).update(data);
            showToast('success', 'Berhasil!', 'Hutang berhasil diperbarui.');
        } else {
            data.createdAt = Date.now();
            await database.ref(`debts/${currentUser.uid}`).push(data);
            showToast('success', 'Berhasil!', 'Hutang baru berhasil ditambahkan.');
        }
        switchView('list');
    } catch (error) {
        console.error('Save error:', error);
        showToast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan.');
    }
}

function showDebtDetail(debtId) {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    currentDebtId = debtId;
    const progress = Math.round((debt.paidMonths / debt.tenor) * 100);
    const remainingMonths = debt.tenor - debt.paidMonths;
    const remainingAmount = debt.monthlyBill * remainingMonths;

    $('#view-detail').innerHTML = `
        <div class="view-header">
            <button class="btn-back" id="btn-back-detail"><i class="fas fa-arrow-left"></i></button>
            <h2><i class="fas fa-info-circle"></i> Detail Hutang</h2>
        </div>
        
        <div class="debt-detail-card">
            <div class="detail-header">
                <h3 class="detail-app-name">${escapeHtml(debt.appName)}</h3>
                <span class="detail-status">${debt.status === 'completed' ? '✅ Lunas' : '⏳ Aktif'}</span>
            </div>
            
            <div class="detail-body">
                <div class="detail-amount">
                    <span class="detail-amount-label">Sisa Hutang</span>
                    <span class="detail-amount-value">${formatCurrency(remainingAmount)}</span>
                </div>
                
                <div class="detail-info-grid">
                    <div class="detail-info-item">
                        <span class="detail-info-label">Tagihan/Bulan</span>
                        <span class="detail-info-value">${formatCurrency(debt.monthlyBill)}</span>
                    </div>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Jatuh Tempo</span>
                        <span class="detail-info-value">Tanggal ${debt.dueDate}</span>
                    </div>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Tenor</span>
                        <span class="detail-info-value">${debt.tenor} bulan</span>
                    </div>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Sudah Bayar</span>
                        <span class="detail-info-value">${debt.paidMonths} bulan</span>
                    </div>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Tanggal Mulai</span>
                        <span class="detail-info-value">${formatDate(debt.startDate)}</span>
                    </div>
                    <div class="detail-info-item">
                        <span class="detail-info-label">Target Lunas</span>
                        <span class="detail-info-value">${formatDate(debt.completionDate)}</span>
                    </div>
                </div>
                
                <div class="detail-progress">
                    <div class="detail-progress-header">
                        <span class="detail-progress-label">Progress Pelunasan</span>
                        <span class="detail-progress-value">${progress}%</span>
                    </div>
                    <div class="debt-progress">
                        <div class="debt-progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                ${debt.notes ? `
                    <div class="detail-notes">
                        <span class="detail-notes-label">Catatan</span>
                        <p class="detail-notes-text">${escapeHtml(debt.notes)}</p>
                    </div>
                ` : ''}
                
                <div class="detail-actions">
                    ${debt.status === 'active' ? `
                        <button class="btn btn-success" id="btn-pay-debt"><i class="fas fa-check"></i> Bayar</button>
                    ` : ''}
                    <button class="btn btn-primary" id="btn-edit-debt"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger" id="btn-delete-debt"><i class="fas fa-trash"></i> Hapus</button>
                </div>
            </div>
        </div>
    `;

    switchView('detail');
}

async function confirmDeleteDebt() {
    if (!currentUser || !currentDebtId) return;

    try {
        await database.ref(`debts/${currentUser.uid}/${currentDebtId}`).remove();
        $('#modal-delete').classList.add('hidden');
        showToast('success', 'Berhasil!', 'Hutang berhasil dihapus.');
        switchView('list');
    } catch (error) {
        console.error('Delete error:', error);
        showToast('error', 'Gagal', 'Terjadi kesalahan saat menghapus.');
    }
}

async function confirmPayDebt() {
    if (!currentUser || !currentDebtId) return;

    const debt = debts.find(d => d.id === currentDebtId);
    if (!debt) return;

    const newPaidMonths = debt.paidMonths + 1;
    const updates = {
        paidMonths: newPaidMonths,
        updatedAt: Date.now()
    };

    if (newPaidMonths >= debt.tenor) {
        updates.status = 'completed';
    }

    try {
        await database.ref(`debts/${currentUser.uid}/${currentDebtId}`).update(updates);
        $('#modal-paid').classList.add('hidden');
        showToast('success', 'Berhasil!', 'Cicilan berhasil dibayar! 🎉');
        showDebtDetail(currentDebtId);
    } catch (error) {
        console.error('Pay error:', error);
        showToast('error', 'Gagal', 'Terjadi kesalahan.');
    }
}

// ===== NOTIFICATIONS =====
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function checkDueDates() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const today = new Date();
    const activeDebts = debts.filter(d => d.status === 'active');

    let dueSoonCount = 0;

    activeDebts.forEach(debt => {
        const daysUntil = getDaysUntilDue(debt.dueDate);

        if (daysUntil >= 0 && daysUntil <= 5) {
            dueSoonCount++;

            // Show notification for debts due in 2-5 days
            if (daysUntil === 5 || daysUntil === 2) {
                showNotification(
                    `${debt.appName} - Jatuh Tempo`,
                    `Cicilan ${formatCurrency(debt.monthlyBill)} jatuh tempo dalam ${daysUntil} hari!`
                );
            }
        }
    });

    // Update badge
    const badge = $('#notification-badge');
    if (badge) {
        if (dueSoonCount > 0) {
            badge.textContent = dueSoonCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            vibrate: [200, 100, 200]
        });
    }
}

// ===== TOAST SYSTEM =====
function showToast(type, title, message) {
    const container = $('#toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check',
        error: 'fa-times',
        warning: 'fa-exclamation',
        info: 'fa-info'
    };

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== HELPERS =====
function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return 'Rp 0';

    // Format with dots as thousand separator (Indonesian format)
    const formatted = Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (amount >= 1000000) {
        const millions = (amount / 1000000).toFixed(1).replace('.', ',');
        return 'Rp ' + millions + 'jt';
    }

    return 'Rp ' + formatted;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDaysUntilDue(dueDay) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let dueDate = new Date(currentYear, currentMonth, dueDay);

    if (dueDate < today) {
        dueDate = new Date(currentYear, currentMonth + 1, dueDay);
    }

    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== RESET PASSWORD =====
function showResetPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'modal-reset-password';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content glass-card animate-zoom-in" style="max-width: 400px;">
            <div class="modal-header">
                <h3><i class="fas fa-key"></i> Reset Password</h3>
            </div>
            <div class="modal-body" style="padding: 20px;">
                <p style="margin-bottom: 20px; font-size: 14px; color: var(--text-secondary); line-height: 1.5;">
                    Masukkan email yang terdaftar. Kami akan mengirimkan instruksi reset password ke inbox Anda.
                </p>
                
                <div class="form-group">
                    <label for="reset-email">Email</label>
                    <input type="email" id="reset-email" placeholder="nama@email.com" class="file-input" style="width: 100%; box-sizing: border-box;">
                </div>
                
                <div class="modal-actions" style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn btn-secondary" id="btn-cancel-reset">Batal</button>
                    <button class="btn btn-primary" id="btn-send-reset">Kirim Link</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Animate enter
    requestAnimationFrame(() => modal.classList.add('active'));

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    modal.querySelector('#btn-cancel-reset').addEventListener('click', closeModal);

    modal.querySelector('#btn-send-reset').addEventListener('click', async () => {
        const emailInput = modal.querySelector('#reset-email');
        const email = emailInput.value.trim();
        const btn = modal.querySelector('#btn-send-reset');

        if (!email) {
            showToast('warning', 'Validasi', 'Masukkan email Anda.');
            return;
        }

        setButtonLoading(btn, true);

        try {
            await auth.sendPasswordResetEmail(email);
            showToast('success', 'Email Terkirim', 'Silakan cek email Anda untuk mereset password.');
            closeModal();
        } catch (error) {
            console.error('Reset password error:', error);
            let msg = 'Gagal mengirim email.';
            if (error.code === 'auth/user-not-found') msg = 'Email tidak terdaftar di sistem.';
            if (error.code === 'auth/invalid-email') msg = 'Format email tidak valid.';
            showToast('error', 'Gagal', msg);
            setButtonLoading(btn, false);
        }
    });
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('SW registration failed:', err);
        });
    });
}
