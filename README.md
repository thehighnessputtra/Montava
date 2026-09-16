# Monvanta

Monvanta adalah website manajemen keuangan pribadi yang membantu pengguna mencatat, mengelola, dan memantau kondisi keuangan secara terstruktur.

Aplikasi ini dirancang untuk membantu pengguna mengetahui arus pemasukan dan pengeluaran, mengelola wallet, membuat financial goal, serta melihat ringkasan dan laporan transaksi dalam satu dashboard.

## ✨ Fitur

### 📊 Dashboard
- Melihat ringkasan kondisi keuangan.
- Menampilkan total pemasukan.
- Menampilkan total pengeluaran.
- Melihat saldo berdasarkan wallet.
- Melihat informasi transaksi secara ringkas.

### 💰 Wallet Management
- Membuat dan mengelola wallet.
- Memisahkan saldo berdasarkan sumber atau jenis wallet.
- Melihat saldo masing-masing wallet.
- Saldo wallet dihitung berdasarkan transaksi yang tercatat.

### 💸 Transaction Management
- Mencatat transaksi pemasukan.
- Mencatat transaksi pengeluaran.
- Mencatat transfer antar-wallet.
- Menghubungkan transaksi dengan wallet dan kategori.
- Mendukung transaksi yang berkaitan dengan Financial Goal.
- Menghapus transaksi menggunakan mekanisme soft delete.

### 🎯 Financial Goals
- Membuat target keuangan.
- Menentukan target nominal.
- Menentukan target tanggal.
- Melakukan kontribusi dana ke financial goal.
- Melihat progress pencapaian target.
- Mengarsipkan financial goal.
- Transaksi yang berkaitan dengan goal dapat dikelola bersama dengan status goal.

### 🏷️ Category Management
- Mengelola kategori transaksi.
- Menggunakan kategori untuk membedakan jenis pemasukan dan pengeluaran.
- Menampilkan nama kategori pada laporan dan detail transaksi.

### 📈 Financial Report
- Melihat laporan keuangan berdasarkan periode.
- Ringkasan pemasukan dan pengeluaran.
- Rekap pengeluaran berdasarkan kategori.
- Menampilkan detail transaksi.
- Menampilkan wallet dan kategori berdasarkan nama, bukan Firestore document ID.

### 🔐 Authentication
- Sistem autentikasi pengguna.
- Data keuangan dipisahkan berdasarkan user.
- Pengguna hanya dapat mengakses data miliknya sendiri.

## 🛠️ Tech Stack

- **Next.js**
- **React**
- **TypeScript**
- **Firebase / Firestore**
- **Zustand**
- **Tailwind CSS**

## 🏗️ Arsitektur Singkat

Monvanta menggunakan pendekatan pemisahan antara halaman, state management, dan service/data layer.

```text
src/
├── app/                 # Halaman dan routing aplikasi
├── components/          # Komponen UI yang dapat digunakan kembali
├── stores/              # State management menggunakan Zustand
├── services/            # Logic dan akses data Firebase
└── ...
```

Alur data secara umum:

```text
UI / Page
   ↓
Zustand Store
   ↓
Service Layer
   ↓
Firebase Firestore
```

## 🔥 Data Utama

Beberapa data utama yang digunakan aplikasi:

- Users
- Wallets
- Transactions
- Categories
- Financial Goals

Transaksi menjadi salah satu sumber utama dalam perhitungan saldo wallet dan laporan keuangan.

## 🗺️ Development Status

Monvanta masih dalam tahap pengembangan. Beberapa fitur dan struktur aplikasi dapat berubah seiring proses development.

## 📌 Roadmap

Pengembangan berikutnya dapat mencakup:

- Import transaksi dari rekening bank.
- Pengembangan laporan dan visualisasi keuangan.
- Penyempurnaan budgeting.
- Notifikasi financial goal.
- Penyempurnaan authentication dan security rules.
- Deployment production.
- Integrasi layanan keuangan lainnya.

## 👨‍💻 Developer

**Prayogi Dwi Cahyo Putro**

Monvanta dikembangkan sebagai aplikasi web untuk membantu pengelolaan keuangan pribadi secara lebih terstruktur dan mudah dipantau.
