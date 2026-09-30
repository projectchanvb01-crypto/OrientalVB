# STANDAR OPERASIONAL PROSEDUR (SOP) OPERASIONAL KASIR, GUDANG & ADMIN
## Oriental Digital Ecosystem — PWA Offline Resilience, Security & Go-Live (Sprint 7)

---

### 1. SOP Penanganan Kasir Saat Jaringan Internet Terputus (PWA Offline Mode)

#### 1.1 Prinsip Dasar Operasional Offline
* **Zero Downtime:** Operasional kasir di toko fisik (Kasir 1, 2, dan 3) **TIDAK BOLEH BERHENTI** walau koneksi internet atau jaringan lokal terputus total.
* **IndexedDB Local Storage:** Seluruh transaksi belanja, data member One Identity, dan katalog harga tersimpan secara lokal dan aman di browser melalui pustaka **Dexie.js**.
* **Keabsahan Struk Belanja:** Nomor faktur yang diterbitkan saat offline berformat resmi (`INV-RET-...` / `INV-OFF-...`), diakui sah, dan struk thermal 58/80mm maupun nota 3 rangkap dot-matrix tetap wajib dicetak dan diserahkan kepada pembeli.

#### 1.2 Prosedur Kasir Saat Indikator Berubah ke "OFFLINE"
1. **Deteksi Visual:**
   * Header terminal kasir akan menampilkan lencana berkedip merah: `🔴 OFFLINE (DEXIE) • X Pending Sync`.
   * Banner peringatan di atas layar kasir otomatis muncul dengan informasi jumlah transaksi offline yang tersimpan di memori browser.
2. **Transaksi Normal:**
   * Kasir tetap memindai (*scan*) barcode produk, memilih varian satuan (Pcs, Renceng, Karton), dan menerapkan kupon promo seperti biasa.
   * Penghitungan poin One Identity dan kupon undian doorprize tetap terakumulasi secara lokal.
3. **Pembayaran yang Diizinkan saat Offline:**
   * ✅ **Tunai (Cash):** Selalu diprioritaskan.
   * ✅ **EDC Debit / Kartu Kredit Offline:** Dengan mencatat 4 digit terakhir dan nomor approval EDC fisik.
   * ⚠️ **QRIS Dinamis:** Bila jaringan internet padam total, gunakan QRIS Statis cetak toko atau alihkan pelanggan ke pembayaran Tunai.
4. **Penyimpanan Lokal:**
   * Begitu tombol "Selesaikan Transaksi" ditekan, data nota otomatis masuk ke tabel `offlineTransactions` di Dexie.js IndexedDB dengan status `isSynced: false`.

#### 1.3 Prosedur Pemulihan Jaringan & Sinkronisasi Otomatis
1. **Auto-Recovery:**
   * Begitu perangkat tablet/PC kasir mendeteksi koneksi internet pulih (`window.online`), sistem PWA secara otomatis mengeksekusi sinkronisasi *background* ke endpoint `POST /api/v1/pos/sync-offline`.
2. **Jaminan Anti-Duplikasi (Idempotency Guarantee):**
   * Server pusat memvalidasi keunikan setiap nomor invoice (`processedInvoices Set`). Jika nomor faktur yang sama terkirim lebih dari satu kali, server mengabaikan duplikat tanpa menggandakan jurnal keuangan atau memotong stok dua kali.
3. **Sinkronisasi Manual:**
   * Kasir atau Supervisor dapat membuka **Pusat Sinkronisasi Offline** (klik badge offline di header) dan menekan tombol **"Sinkronkan Sekarang"**.
   * Notifikasi hijau akan muncul: `X transaksi offline berhasil disinkronkan ke server pusat tanpa duplikasi!`.

---

### 2. SOP Pengawasan Uang Fisik Kasir (Cash Float & Blind Closing)

#### 2.1 Modal Awal Kasir (Cash Float)
* Setiap awal shift (Shift Pagi / Shift Sore), kasir wajib memasukkan nominal uang modal awal (pecahan kecil uang kembalian) yang disetujui Kepala Toko / PIC.
* Standar modal awal: **Rp 500.000** (pecahan Rp 2.000, Rp 5.000, Rp 10.000, Rp 20.000).

#### 2.2 Batas Maksimal Kas di Laci (Cash Drop Warning)
* **Ambang Batas Maksimal:** **Rp 3.000.000**.
* Bila total uang tunai di laci mencapai atau melebihi Rp 3.000.000, sistem kasir akan menampilkan peringatan berkedip: `⚠️ Setor Brankas!`.
* Kasir wajib memanggil Kepala Toko/Supervisor untuk melakukan setoran brankas tengah shift (*cash drop*) agar laci kasir tetap aman dari risiko pencurian/kehilangan.

#### 2.3 Formulir Penutupan Shift Tanpa Intip Sistem (Blind Closing)
* Kasir menekan tombol **"Blind Closing"** di header terminal kasir.
* Sesuai standar tata kelola anti-kecurangan, kasir **DILARANG** melihat angka omzet sistem saat menghitung uang fisik.
* Kasir menghitung fisik uang kertas dan koin di laci, lalu menginput total nominal fisik ke kolom formulir blind closing.
* **Pencatatan Selisih Kas di Akuntansi SAK:**
  * Bila uang fisik = sistem: Status **BALANCE**.
  * Bila uang fisik < sistem: Status **SHORTAGE (Selisih Kurang)** → Otomatis terbit jurnal penyesuaian beban selisih kas kasir.
  * Bila uang fisik > sistem: Status **OVERAGE (Selisih Lebih)** → Otomatis terbit jurnal penyesuaian pendapatan selisih kas.

---

### 3. SOP Gudang (WMS) & Pengendalian Expired FEFO

1. **Penerimaan Barang (GRN - Goods Receipt Note):**
   * Staf gudang wajib mencatat tanggal kedaluwarsa (*expired date*) dan nomor batch dari supplier.
2. **Penyimpanan Berdasarkan Zona Rak:**
   * **Level Hijau (> 90 Hari):** Disimpan di rak zona buffer (kapasitas besar di belakang).
   * **Level Kuning (31–90 Hari):** Segera dipindahkan ke rak zona picking (mudah dijangkau kasir).
   * **Level Merah (≤ 30 Hari):** Otomatis dipicu oleh *Autonomous Rules Engine* untuk diskon clearance promo di rak obral depan toko.
3. **Stock Opname Harian/Bulanan:**
   * Pengecekan fisik barcode SKU wajib mencocokkan stok fisik dengan saldo kartu stok terkomputerisasi.

---

### 4. Checklist Kesiapan UAT & Go-Live (Sprint 7 Acceptance Criteria)

| No | Modul / Uji Kesiapan | Kriteria Kelulusan | Status Verifikasi |
|---|---|---|---|
| 1 | **PWA Offline Mode Kasir** | Kasir tetap bisa scan barcode, hitung kembalian, dan cetak struk tanpa internet. | ✅ **LULUS (Verified)** |
| 2 | **IndexedDB Sync Queue** | Transaksi tersimpan rapi di Dexie.js dengan penanda `isSynced: false`. | ✅ **LULUS (Verified)** |
| 3 | **Batch Sync Anti-Duplikasi** | Endpoint `POST /pos/sync-offline` menjamin nol duplikasi nota di database server. | ✅ **LULUS (Verified)** |
| 4 | **Simulator Putus Internet** | Sakelar simulasi offline di UI memungkinkan pelatihan kasir & demonstrasi tanpa cabut kabel. | ✅ **LULUS (Verified)** |
| 5 | **Blind Closing Shift Kasir** | Formulir hitung fisik tanpa melihat angka sistem untuk integritas audit SAK. | ✅ **LULUS (Verified)** |
| 6 | **PWA Service Worker Precache** | Asset bundle (JS, CSS, HTML, fonts, icons) ter-cache otomatis untuk akses instan. | ✅ **LULUS (Verified)** |
| 7 | **Zero Critical Bugs** | TypeScript build 100% clean dan zero runtime error pada terminal kasir. | ✅ **LULUS (Verified)** |

---
*Dokumen ini diterbitkan oleh Tim Pengembang Oriental Digital Ecosystem sebagai panduan resmi operasional toko dan standar audit internal.*
