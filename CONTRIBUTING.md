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
3. **Buat Branch Baru**: Buat branch baru dari `develop` untuk perubahan Anda.
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/amazing-feature
   ```

   Gunakan konvensi penamaan berikut:
   - `feature/nama-fitur` untuk fitur baru
   - `bugfix/nama-bug` untuk perbaikan bug
   - `docs/nama-perubahan` untuk perubahan dokumentasi
   - `refactor/nama-perubahan` untuk refactoring kode

4. **Buat Perubahan**: Buat perubahan yang diperlukan dan commit dengan menggunakan Conventional Commits.
   ```bash
   git add .
   git commit -m "feat(ui): tambahkan animasi pada input box"
   ```

   Lihat bagian [Conventional Commits](#conventional-commits) untuk detail lebih lanjut.

5. **Sinkronisasi dengan Develop**: Sebelum membuat Pull Request, pastikan branch Anda up-to-date dengan `develop`.
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/amazing-feature
   git rebase develop
   ```

6. **Push ke Branch**: Push perubahan Anda ke branch di fork Anda.
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Buat Pull Request**: Buat pull request dari branch Anda ke branch `develop` repositori asli.
8. **Ikuti Template**: Gunakan template pull request yang disediakan.
9. **Tunggu Review**: Tunggu review dari maintainer.

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

### Conventional Commits

Proyek ini menggunakan [Conventional Commits](https://www.conventionalcommits.org/) untuk pesan commit. Format dasarnya adalah:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Tipe yang umum digunakan:
- `feat`: Fitur baru
- `fix`: Perbaikan bug
- `docs`: Perubahan dokumentasi
- `style`: Perubahan yang tidak memengaruhi arti kode (spasi, format, dll.)
- `refactor`: Perubahan kode yang tidak memperbaiki bug atau menambahkan fitur
- `perf`: Perubahan kode yang meningkatkan performa
- `test`: Menambahkan atau memperbaiki test
- `build`: Perubahan pada sistem build atau dependensi eksternal
- `ci`: Perubahan pada file konfigurasi CI dan script
- `chore`: Perubahan lain yang tidak memodifikasi file src atau test

Contoh:
- `feat(ui): tambahkan animasi pada input box`
- `fix(api): perbaiki error saat validasi API key`
- `docs(readme): perbarui dokumentasi instalasi`

### Workflow Git

Proyek ini menggunakan model branch berikut:
- `master`: Kode produksi yang stabil
- `develop`: Branch pengembangan utama
- `feature/*`: Branch untuk fitur baru
- `bugfix/*`: Branch untuk perbaikan bug
- `release/*`: Branch untuk persiapan rilis

Alur kerja dasar:

1. **Mulai Hari**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Mulai Fitur Baru**
   ```bash
   git checkout -b feature/nama-fitur
   ```

3. **Commit Sering**
   ```bash
   git add .
   git commit -m "feat: implementasi fungsi X"
   ```

4. **Sinkronisasi dengan Develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/nama-fitur
   git rebase develop
   ```

5. **Push dan Buat PR**
   ```bash
   git push -u origin feature/nama-fitur
   # Buat PR di GitHub
   ```

6. **Setelah PR di-merge**
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/nama-fitur
   ```

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
