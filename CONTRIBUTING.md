# Panduan Kontribusi untuk Mamouse Agent

Terima kasih atas minat Anda untuk berkontribusi pada Mamouse Agent! Setiap kontribusi sangat dihargai, baik itu perbaikan bug, penambahan fitur, peningkatan dokumentasi, atau bahkan hanya melaporkan masalah.

## Daftar Isi
- [Kode Etik](#kode-etik)
- [Cara Berkontribusi](#cara-berkontribusi)
  - [Melaporkan Bug](#melaporkan-bug)
  - [Menyarankan Fitur](#menyarankan-fitur)
  - [Pull Requests](#pull-requests)
- [Panduan Pengembangan](#panduan-pengembangan)
  - [Setup Lingkungan Pengembangan](#setup-lingkungan-pengembangan)
  - [Struktur Kode](#struktur-kode)
  - [Konvensi Kode](#konvensi-kode)
  - [Testing](#testing)
- [Proses Review](#proses-review)

## Kode Etik

Proyek ini dan semua partisipan diatur oleh [Kode Etik](CODE_OF_CONDUCT.md). Dengan berpartisipasi, Anda diharapkan untuk mematuhi kode etik ini. Silakan laporkan perilaku yang tidak dapat diterima ke [email maintainer].

## Cara Berkontribusi

### Melaporkan Bug

Bug adalah bagian dari setiap proyek perangkat lunak, dan kami menghargai laporan Anda!

1. **Periksa Issue yang Ada**: Sebelum membuat issue baru, periksa apakah bug tersebut sudah dilaporkan.
2. **Gunakan Template Bug Report**: Gunakan template yang disediakan saat membuat issue baru.
3. **Berikan Informasi Lengkap**: Sertakan langkah-langkah untuk mereproduksi bug, perilaku yang diharapkan, dan perilaku aktual.
4. **Sertakan Informasi Sistem**: Versi OS, versi Node.js, dan informasi relevan lainnya.
5. **Sertakan Screenshot atau Video**: Jika memungkinkan, sertakan screenshot atau video yang menunjukkan bug.

### Menyarankan Fitur

Kami selalu terbuka untuk ide-ide baru!

1. **Periksa Issue yang Ada**: Periksa apakah fitur yang Anda usulkan sudah diusulkan sebelumnya.
2. **Gunakan Template Feature Request**: Gunakan template yang disediakan saat membuat issue baru.
3. **Jelaskan Masalah yang Dipecahkan**: Jelaskan masalah yang dipecahkan oleh fitur yang Anda usulkan.
4. **Jelaskan Solusi yang Diinginkan**: Berikan deskripsi detail tentang bagaimana fitur tersebut seharusnya bekerja.
5. **Pertimbangkan Alternatif**: Jelaskan alternatif yang telah Anda pertimbangkan.

### Pull Requests

1. **Fork Repositori**: Fork repositori ke akun GitHub Anda.
2. **Clone Repositori**: Clone fork Anda ke mesin lokal Anda.
3. **Buat Branch Baru**: Buat branch baru untuk perubahan Anda.
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Buat Perubahan**: Buat perubahan yang diperlukan dan commit dengan pesan yang jelas.
   ```bash
   git commit -m "Menambahkan fitur amazing-feature"
   ```
5. **Push ke Branch**: Push perubahan Anda ke branch di fork Anda.
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Buat Pull Request**: Buat pull request dari branch Anda ke branch `main` repositori asli.
7. **Ikuti Template**: Gunakan template pull request yang disediakan.
8. **Tunggu Review**: Tunggu review dari maintainer.

## Panduan Pengembangan

### Setup Lingkungan Pengembangan

1. **Prasyarat**:
   - Node.js (v14 atau lebih baru)
   - npm (v6 atau lebih baru)
   - Git

2. **Clone Repositori**:
   ```bash
   git clone https://github.com/yourusername/mamouse-agent.git
   cd mamouse-agent
   ```

3. **Instal Dependensi**:
   ```bash
   npm install
   ```

4. **Setup Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit file .env dengan editor pilihan Anda
   ```

5. **Jalankan dalam Mode Development**:
   ```bash
   npm run dev
   ```

### Struktur Kode

```
mamouse-agent/
├── assets/                # Aset gambar dan ikon
├── docs/                  # Dokumentasi
├── src/                   # Kode sumber
│   ├── main/              # Proses utama Electron
│   ├── renderer/          # Proses renderer
│   ├── services/          # Layanan (API, tools, dll)
│   └── utils/             # Utilitas
├── tests/                 # Unit dan integration tests
├── .env.example           # Contoh file konfigurasi environment
├── package.json           # Konfigurasi proyek
└── README.md              # Dokumentasi
```

### Konvensi Kode

1. **JavaScript/TypeScript**:
   - Gunakan ES6+ features
   - Gunakan camelCase untuk variabel dan fungsi
   - Gunakan PascalCase untuk kelas
   - Gunakan UPPER_CASE untuk konstanta

2. **Komentar**:
   - Gunakan JSDoc untuk dokumentasi fungsi dan kelas
   - Tambahkan komentar untuk kode yang kompleks

3. **Formatting**:
   - Gunakan 2 spasi untuk indentasi
   - Gunakan single quotes untuk string
   - Selalu gunakan semicolons
   - Maksimal 80 karakter per baris

4. **Penamaan**:
   - Gunakan nama yang deskriptif
   - Hindari singkatan yang tidak umum
   - Gunakan prefiks `is` atau `has` untuk boolean

### Testing

1. **Unit Testing**:
   - Tulis unit test untuk fungsi dan kelas baru
   - Gunakan Jest untuk unit testing
   - Pastikan semua test lulus sebelum membuat pull request

2. **Integration Testing**:
   - Tulis integration test untuk fitur baru
   - Gunakan Spectron untuk testing aplikasi Electron

3. **Menjalankan Test**:
   ```bash
   npm test
   ```

## Proses Review

1. **Code Review**:
   - Maintainer akan mereview kode Anda
   - Perubahan mungkin diminta sebelum pull request diterima

2. **CI/CD**:
   - GitHub Actions akan menjalankan test dan linting
   - Pull request harus lulus semua check sebelum diterima

3. **Merge**:
   - Setelah review dan semua check lulus, pull request akan di-merge
   - Perubahan akan tersedia di branch `main`

Terima kasih atas kontribusi Anda!
