# English Version

# Hutank - Debt Reminder Application

Hutank is a web-based application (PWA) designed to help you record, manage, and track your debt status. With a modern interface and comprehensive features, this application aims to help you achieve financial freedom.

## ✨ Key Features

*   **User Authentication**: Supports Login/Register with Email & Password as well as Login with Google.
*   **Concise Dashboard**: Displays a summary of active debts, total remaining debt, due debts, and paid-off debts.
*   **Debt Management**:
    *   Add new debt with details (App Name/Lender, Total Loan, Remaining, Tenor, Monthly Bill, Due Date).
    *   Edit and Delete debt data.
    *   Mark this month's installment as "Paid".
*   **Due Date Reminder**: Displays a list of debts that must be paid soon (D-5).
*   **Statistics**: Visualization of your financial summary.
*   **Motivational Quotes**: Wise words about finance that change randomly.
*   **PWA Support**: Can be installed on mobile devices like a native application.

## 🛠️ Technologies Used

*   **Frontend**: HTML5, CSS3, JavaScript (Vanilla).
*   **Backend / Database**: Firebase (Authentication & Realtime Database).
*   **Font & Icon**: Google Fonts (Poppins), FontAwesome 6.5.

## 🚀 How to Run the Project

### 1. Firebase Configuration
This application requires a connection to Firebase. You need to create your own Firebase project:

1.  Open the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project or use an existing one.
3.  Go to **Project settings** (gear icon) > **General**.
4.  In the "Your apps" section, click the **</>** (Web) icon to add a web app.
5.  Copy the `firebaseConfig` configuration that appears.
6.  Open the `app.js` file in your text editor.
7.  Find the section `const firebaseConfig = { ... };` at the beginning.
8.  Replace the content of `firebaseConfig` with your own configuration.

Example:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDa...",
    authDomain: "project-id.firebaseapp.com",
    databaseURL: "https://project-id.firebaseio.com",
    projectId: "project-id",
    storageBucket: "project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef..."
};
```

9. **Important**: Make sure you enable **Authentication** (Email/Password & Google) and **Realtime Database** in your Firebase Console.

### 2. Running the Application
I recommend using Nginx or Live Server in VS Code.

**Using VS Code Live Server:**
1.  Install the **Live Server** extension in VS Code.
2.  Right-click on the `index.html` file.
3.  Select **Open with Live Server**.

**Using Nginx:**
1.  Install Nginx on your computer.
2.  Open a terminal or admin command prompt (CMD/PowerShell).
3.  Navigate to your project folder.
4.  Run the following command:
```bash
nginx -c /path/to/nginx.conf
```
5.  Open your browser and access `http://localhost:8080`.

## 📱 Project Structure

```
hutank/
├── index.html          # Main HTML file
├── style.css           # Styling (CSS)
├── app.js              # Application Logic & Firebase Configuration
├── manifest.json       # PWA Configuration
├── sw.js               # Service Worker for PWA
├── database.rules.json # Firebase Realtime Database Rules Settings
└── icons/              # Application icons folder
```

---
# Indonesian Version
# Hutank - Aplikasi Pengingat Hutang

Hutank adalah aplikasi berbasis web (PWA) yang dirancang untuk membantu Anda mencatat, mengelola, dan mengingatkan status hutang piutang Anda. Dengan antarmuka yang modern dan fitur yang lengkap, aplikasi ini bertujuan untuk membantu Anda mencapai kebebasan finansial.

## ✨ Fitur Utama

*   **Autentikasi Pengguna**: Mendukung Login/Register dengan Email & Password serta Login dengan Google.
*   **Dashboard Ringkas**: Menampilkan ringkasan hutang aktif, total sisa hutang, hutang jatuh tempo, dan hutang lunas.
*   **Manajemen Hutang**:
    *   Tambah hutang baru dengan detail (Nama Aplikasi/Pemberi Pinjaman, Total Pinjaman, Sisa, Tenor, Tagihan Bulanan, Tanggal Jatuh Tempo).
    *   Edit dan Hapus data hutang.
    *   Tandai cicilan bulan ini sebagai "Sudah Dibayar".
*   **Pengingat Jatuh Tempo**: Menampilkan daftar hutang yang harus dibayar dalam waktu dekat (H-5).
*   **Statistik**: Visualisasi ringkasan keuangan Anda.
*   **Quotes Motivasi**: Kata-kata bijak seputar keuangan yang berganti secara acak.
*   **PWA Support**: Dapat diinstal di perangkat mobile layaknya aplikasi native.

## 🛠️ Teknologi yang Digunakan

*   **Frontend**: HTML5, CSS3 , JavaScript (Vanilla).
*   **Backend / Database**: Firebase (Authentication & Realtime Database).
*   **Font & Icon**: Google Fonts (Poppins), FontAwesome 6.5.

## 🚀 Cara Menjalankan Project

### 1. Konfigurasi Firebase
Aplikasi ini memerlukan koneksi ke Firebase. Anda perlu membuat project Firebase sendiri:

1.  Buka [Firebase Console](https://console.firebase.google.com/).
2.  Buat project baru atau gunakan project yang sudah ada.
3.  Masuk ke menu **Project settings** (ikon gir) > **General**.
4.  Pada bagian "Your apps", klik ikon **</>** (Web) untuk menambahkan aplikasi web.
5.  Salin konfigurasi `firebaseConfig` yang muncul.
6.  Buka file `app.js` di text editor Anda.
7.  Cari bagian `const firebaseConfig = { ... };` di baris awal.
8.  Ganti isi `firebaseConfig` dengan konfigurasi milik Anda sendiri.

Contoh:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDa...",
    authDomain: "project-id.firebaseapp.com",
    databaseURL: "https://project-id.firebaseio.com",
    projectId: "project-id",
    storageBucket: "project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef..."
};
```

9. **Penting**: Pastikan Anda mengaktifkan **Authentication** (Email/Password & Google) dan **Realtime Database** di Firebase Console Anda.

### 2. Menjalankan Aplikasi
saya sarankan untuk mengunakan Nginx atau liveserver di VS code.

**Menggunakan VS Code Live Server:**
1.  Install ekstensi **Live Server** di VS Code.
2.  Klik kanan pada file `index.html`.
3.  Pilih **Open with Live Server**.

**Menggunakan Nginx:**
1.  Install Nginx di komputer Anda.
2.  Buka terminal atau command admin (CMD/PowerShell).
3.  Navigasi ke folder project Anda.
4.  Jalankan perintah berikut:
```bash
nginx -c /path/to/nginx.conf
```
5.  Buka browser dan akses `http://localhost:8080`.

## 📱 Struktur Project

```
hutank/
├── index.html          # File HTML utama
├── style.css           # Styling (CSS)
├── app.js              # Logika aplikasi & Configurasi Firebase
├── manifest.json       # Konfigurasi PWA
├── sw.js               # Service Worker untuk PWA
├── database.rules.json # Settingan Rules Firebase Realtime Database
└── icons/              # Folder ikon aplikasi
```


