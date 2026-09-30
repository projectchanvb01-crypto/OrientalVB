# PRD ADDENDUM — ORIENTAL DIGITAL ECOSYSTEM
## Perubahan & Modul Baru terhadap PRD v2.0

| Metadata | Keterangan |
| :--- | :--- |
| **Nama Dokumen** | PRD Oriental Digital Ecosystem — Addendum v2.1 |
| **Berdasarkan** | PRD Oriental Digital Ecosystem v2.0 (24 September 2026) |
| **Tanggal Disusun** | 26 September 2026 |
| **Status** | Draft — hasil sesi discovery dengan Direktur Utama Oriental |
| **Sifat Dokumen** | Melengkapi & merevisi sebagian PRD v2.0; dibaca bersamaan dengan dokumen v2.0 |

---

## 1. Ringkasan Perubahan dari v2.0

Dokumen ini merangkum hasil sesi tanya-jawab lanjutan pasca-review PRD v2.0 (yang sudah live di production). Isinya mencakup: (a) koreksi/klarifikasi atas beberapa poin di v2.0 yang ternyata berbeda dari rencana bisnis terkini, dan (b) lima modul baru yang direncanakan untuk fase pengembangan berikutnya — Tier Loyalty Customer, Oriental Pay, Oriental Learn, Oriental SaaS, dan Multi-Outlet & Regional Governance.

Dua area masih berstatus **Open Item** menunggu dokumen detail tambahan: RBAC (pembatasan per role) dan Accounting (kebutuhan laporan tambahan). Lihat §11.

---

## 2. Update & Klarifikasi terhadap Modul Eksisting v2.0

### 2.1 Loyalty Point Conversion (Final)

| Channel | Konversi | Catatan |
| :--- | :--- | :--- |
| Retail B2C | Rp100.000 = 1 Poin | **Final** — mengoreksi rencana lama Rp150.000 |
| Grosir B2B | Rp200.000 = 1 Poin | Tidak berubah dari v2.0 |
| UKM Supply Kuliner | Rp50.000 = 1 Poin | Tidak berubah dari v2.0 |
| Waste Purchasing | 1 Kg = 1 Poin | Tidak berubah dari v2.0 |
| White Label (Maklon) | Rp10.000 = 1 Poin | Khusus produk asal maklon — lihat §2.4 |

### 2.2 Referral & Affiliate Program (Revisi)

| Tipe | Channel Berlaku | Syarat | Komisi |
| :--- | :--- | :--- | :--- |
| **Referral Bisnis** | UKM Supply Chain | Referrer ≥ Rp60 Jt/bln; Referee aktif ≥ Rp30 Jt/bln | 0,5% dari omset referee |
| **Referral Influencer** | Retail | Self-register + approval sistem (detail menyusul) | 1,0% per produk terjual |

- Referral Bisnis tidak lagi mensyaratkan tier Gold/Silver maupun hold period 20 hari (rencana lama), mengikuti kriteria omset di atas.
- Referral Influencer mengikuti model afiliasi ala Shopee Affiliate — memerlukan **link/kode referral unik per produk per influencer** untuk tracking penjualan (implikasi teknis baru, belum ada di v2.0).
- Mekanisme self-register & approval Influencer akan dibahas detail pada fase berikutnya.

### 2.3 Waste Purchasing (Revisi)

- **Kategori aktif saat ini:** hanya UCO (minyak jelantah). Kategori lain (kardus, plastik, logam, elektronik) tetap ditampilkan di UI namun berstatus **"Coming Soon"**.
- **Formula bagi hasil mitra (direvisi):** `Harga Beli dari Nasabah × 5%` (flat) — bukan margin × partner share % seperti di v2.0.
- **Laporan mitra:** digenerate otomatis per titik penampungan (karena kondisi kerja sama tiap titik dapat berbeda), menjadi bukti transaksi & dasar klaim.
- **Pembayaran bagi hasil:** transfer/manual di luar sistem, berdasarkan laporan tersebut — bukan otomatis ke saldo Oriental Pay.

### 2.4 White Label (Klarifikasi Penting)

- Poin **Rp10.000 = 1 Poin** diberikan kepada **end customer** yang membeli produk hasil maklon, dihitung dari nilai transaksi pembelian — bukan dari nilai produksi/kontrak antara Oriental dan mitra maklon seperti tersirat di wording v2.0.
- Poin ini **tidak digabung** dengan poin retail biasa (Rp100.000 = 1 Poin) untuk produk yang sama.
- **Implikasi teknis:** produk hasil maklon perlu ditandai asal-usulnya (misal field `maklonPartnerId` di data master Product) agar POS tahu rate mana yang berlaku saat checkout.
- **Mitra Maklon sendiri tidak mendapat insentif poin** — kompensasi mereka murni dari kontrak komersial produksi (di luar sistem poin).
- Direncanakan ~10 mitra maklon per daerah.

### 2.5 Grosir POS

- Limit kredit (Termin/TOP) ditentukan oleh **Admin Manager**; sistem otomatis memblokir order baru jika piutang existing member belum lunas.
- **Nota Biru** (arsip pembukuan/dasar jurnal SAK) dicetak fisik untuk setiap transaksi.

### 2.6 Retail POS

- Validasi anti-minus tetap **hard lock tanpa pengecualian**.
- E-Receipt **tidak menggunakan integrasi WhatsApp Business API** — cukup melalui log riwayat transaksi in-app (menghindari biaya gateway).
- **Metode pembayaran baru:** Oriental Pay ditambahkan sebagai opsi pembayaran (lihat §5) — di samping Tunai, QRIS, Transfer Bank, Debit/EDC yang sudah ada.
- Kupon Doorprize kelipatan Rp150.000: dihitung **per transaksi tunggal** (bukan akumulasi periode), berlaku universal untuk semua pembeli kecuali staff internal, dan terpisah dari mekanisme voucher redemption poin.

### 2.7 UKM Supply Chain

- Perubahan standing order (harian/mingguan) **diterima otomatis oleh sistem**, tanpa approval manual.
- Fitur "Buffer Stock + One-Click Order" (POS mandiri berbasis mitra, contoh: mitra melihat stok gudangnya sendiri lalu langsung reorder) **dipindahkan scope-nya menjadi bagian dari Oriental SaaS** (§7) — bukan bagian dari MVP UKM Supply Chain yang live saat ini.

---

## 3. RBAC — Update Model Izin

- Model **checklist-based** dikonfirmasi tetap dipakai, berfungsi sebagai **override** di atas 6 role tetap yang sudah ada di v2.0 (bukan pengganti penuh).
- Delegasi antar role tetap bersifat **satu arah** (sesuai diagram v2.0).
- Role baru **Regional** ditambahkan sehubungan dengan ekspansi multi-outlet (lihat §8).

> **Open Item:** Detail pembatasan akses tambahan per role (termasuk role Regional) menunggu dokumen terpisah — lihat §11.

---

## 4. Tier Loyalty Customer (Modul Baru)

**Scope:** Khusus channel **UKM Supply Chain**.

**Basis Evaluasi:** Rolling 3 bulan, dievaluasi ulang setiap bulan berdasarkan rata-rata belanja bulanan dalam window tersebut.

| Tier | Ambang Batas (avg. belanja/bulan) | Diskon Tambahan | Multiplier Poin |
| :--- | :--- | :--- | :--- |
| Reguler | < Rp10 Juta | – | – |
| Bronze | Rp10 Jt – 20 Jt | – *(belum final)* | – *(belum final)* |
| Silver | Rp20 Jt – 40 Jt | – *(belum final)* | – *(belum final)* |
| Gold | Rp40 Jt – 70 Jt | – | +10% |
| Platinum | > Rp70 Jt | Extra 1% | +15% |

**Kebijakan Downgrade:** Turun tier jika tidak bisa mempertahankan rata-rata bulanan selama 3 bulan berjalan. Member akan **dinotifikasi terlebih dahulu** sebelum evaluasi agar berkesempatan mempertahankan tier; efek downgrade berlaku langsung begitu evaluasi terjadi.

**Masa Berlaku:** 3 bulan, atau selama masih aktif dan tidak turun tier.

**Member Baru:** Default mulai dari tier Reguler.

> **Open Item:** Benefit spesifik untuk tier Bronze & Silver belum final, akan ditambahkan kemudian.

---

## 5. Oriental Pay (Modul Baru — rebranding dari "Oriental Money")

- **Model:** Closed-loop penuh. Fitur transfer antar member dan penarikan ke rekening bank **ditiadakan** — saldo hanya dapat digunakan untuk belanja di dalam ekosistem Oriental.
- **Terpisah dari Oriental Point** — dua ledger/saldo yang berbeda.
- **Sumber dana:** komisi referral, cashback, dan hasil penjualan waste — otomatis masuk ke saldo Oriental Pay tanpa klaim manual.
- **Fungsi pembayaran:** dapat digunakan sebagai metode pembayaran transaksi di Oriental Retail, Oriental SaaS UKM, dan modul ekosistem lain, selama masih dalam ekosistem Oriental.
- **Status Regulasi:** untuk saat ini tetap **internal**, belum diajukan sebagai e-money berizin resmi BI/OJK. **Dicatat sebagai risiko** yang perlu dipantau — potensi masuk cakupan pengawasan Bank Indonesia jika skala transaksi membesar.
- **Timeline:** belum ditentukan.
- **Perlakuan akuntansi** (liabilitas saldo pelanggan, dll): menunggu pembahasan lanjutan bersama akuntan — lihat §11.

---

## 6. Oriental Learn (Modul Baru)

- **Timeline:** dibangun bersamaan dengan rencana ekspansi 1 tahun ke depan.
- **Model Pengajar:** internal Oriental dan/atau eksternal; kompetensi pengajar eksternal diverifikasi oleh **Owner/Pusat** sebelum konten dipublikasikan.
- **Kategori Materi:**
  1. Eksklusif untuk komunitas UKM member
  2. Eksklusif untuk tim internal Oriental yang menjadi member
  3. Materi umum untuk publik
- **Model Harga:** campuran — ada kursus berbayar, ada yang gratis. Member mendapat diskon **up to 30%**, dengan nilai diskon yang dapat berbeda tiap materi/kursus.
- **Insentif:** menyelesaikan kursus memberikan poin Oriental Point kepada member.

---

## 7. Oriental SaaS (Modul Baru)

- **Model Bisnis:** subscription tahunan, kisaran harga **Rp1–2 juta/tahun**.
- **Target Pasar:** dijual bebas ke UKM di luar ekosistem Oriental, sebagai revenue stream tambahan. Pelanggan tetap didaftarkan sebagai **Oriental Member** (untuk keperluan profiling/targeted ads).
- **Fitur MVP:** POS mandiri untuk mitra UKM, terintegrasi otomatis dengan Oriental Supply — termasuk fitur buffer stock alert + one-click reorder (dipindahkan dari scope UKM Supply Chain, lihat §2.7).
- **Billing:** memerlukan integrasi payment gateway untuk pembayaran subscription tahunan.
- **Tim Pengelola:** ditangani oleh tim khusus Oriental SaaS (terpisah dari tim Oriental Supply), termasuk untuk billing dan customer support.

---

## 8. Multi-Outlet & Regional Governance (Modul Baru)

- **Target Ekspansi:** 2 cabang baru dalam 1 tahun ke depan (multi-store & multi-warehouse).
- **Kesiapan Sistem:** sistem harus siap secara teknis mendukung semua lini bisnis (Retail, Grosir, UKM Supply, Waste, White Label) di outlet manapun. Komposisi bisnis aktual per lokasi disesuaikan dengan kondisi daerah, dikonfigurasi melalui pendekatan **checklist-based** (aktif/nonaktif per lini bisnis, per outlet).
- **Model Stok:** setiap outlet memiliki stok independen sendiri, namun dapat menerima **transfer stok antar cabang**. *(Fitur baru: Stock Transfer antar Outlet — belum ada di v2.0)*

### 8.1 Fitur Pengajuan Harga & Promo Tingkat Cabang

| Aspek | Ketentuan |
| :--- | :--- |
| Submitter | Manager/Kepala Toko cabang setempat |
| Rantai Approval | Kepala Toko → Regional → Super Admin *(Super Admin bersifat sementara sebagai approver akhir)* |
| Lampiran Bukti | Foto (minimal 4 file) atau dokumen perbandingan harga |
| Cakupan | Harga jual dasar produk **dan** promo/diskon tingkat cabang |

> **Open Item:** Scope akses laporan untuk role Regional (di luar approval harga) belum diputuskan.

---

## 9. Accounting — Kebutuhan Tambahan

- Chart of Accounts (COA) akan **divalidasi oleh akuntan** sebelum digunakan untuk laporan resmi.
- Laporan tambahan yang dibutuhkan di luar Laba Rugi/Neraca/Arus Kas:
  1. Laporan penjualan harian
  2. Laporan shift kasir
  3. Laporan transaksi per metode pembayaran
  4. Laporan ringkas outlet (summary)
  5. Laporan produk terlaris
  6. Laporan omzet per periode
  7. Laporan pembatalan transaksi (void)

> **Open Item:** Definisi pasti "laporan penyesuaian" serta format detail (kolom, filter, granularitas per-outlet) menunggu dokumen terpisah. Perlakuan akuntansi untuk saldo Oriental Pay juga akan dibahas pada sesi ini.

---

## 10. Catatan Teknis untuk Tim Vendor

- **Skema harga produk:** karena segmen UKM direncanakan terus bertambah sesuai kebutuhan pasar, kolom harga tetap per segmen (`ukmHotelPrice`, `ukmRestoPrice`, dst.) di tabel Product berpotensi butuh migration tiap ada segmen baru — pertimbangkan struktur tabel harga yang lebih fleksibel (price list per kombinasi produk-segmen) untuk mengakomodasi pertumbuhan ini.
- **Migrasi data historis** (produk, customer, dll dari sistem lama) akan dilakukan melalui mass update/bulk import.
- **UAT** untuk fitur-fitur baru dilakukan oleh Super Admin/Owner.
- **Kepatuhan UU PDP** di-hold untuk saat ini karena sistem masih tahap testing/skala kecil — perlu direview ulang seiring pertumbuhan skala.
- **Observasi arsitektur:** pola "checklist-based" muncul baik untuk RBAC maupun konfigurasi lini bisnis per outlet — dapat dipertimbangkan sebagai satu fondasi teknis (permission/feature engine) yang dipakai bersama, alih-alih dua implementasi terpisah.

---

## 11. Open Items / Backlog

| # | Item | Status |
| :--- | :--- | :--- |
| 1 | Dokumen detail RBAC — pembatasan akses tambahan per role | Menunggu dokumen dari Direktur Utama |
| 2 | Dokumen detail kebutuhan Accounting — definisi & format "laporan penyesuaian" | Menunggu dokumen dari Direktur Utama |
| 3 | KPI / Success Metrics untuk seluruh inisiatif | Akan dibahas menyusul |
| 4 | Mekanisme detail self-register & approval Referral Influencer | Akan dibahas menyusul |
| 5 | Benefit spesifik Tier Loyalty Bronze & Silver | Belum final |
| 6 | Perlakuan akuntansi Oriental Pay (liabilitas saldo pelanggan) | Akan dibahas di sesi Accounting |

---

*PRD Addendum v2.1 — Disusun berdasarkan sesi discovery bersama Direktur Utama Oriental, 26 September 2026.*
