# Mamouse Agent

Mamouse Agent adalah aplikasi desktop yang berfungsi sebagai asisten AI personal dengan kemampuan multimodal untuk membantu berbagai tugas sehari-hari.

## Konsep Dasar

Mamouse Agent dirancang untuk menjadi asisten AI yang dapat:

1. **Berinteraksi dengan Komputer** - Melihat dan menggunakan aplikasi di komputer, mengakses dan mengelola file, serta melakukan tugas-tugas otomatis.

2. **Memahami dan Merespons** - Memproses input pengguna melalui teks dan suara, serta memberikan respons yang relevan dan membantu.

## Fitur

- **Menu Bar** dengan tombol minimize dan close
- **Input Box** dengan efek neon berputar
- **Visualisasi Suara** saat mode input suara aktif
- **Chat Bubble** dengan latar abu-abu transparan
- **Menu Slide** dengan animasi mulus
- **Sistem Tema** yang dapat disesuaikan
- **Shortcut Global** (Alt+Space) untuk menampilkan/menyembunyikan aplikasi

## Cara Menjalankan

1. Pastikan Node.js dan npm terinstal di sistem Anda
2. Buka terminal di direktori proyek
3. Salin file `.env.example` menjadi `.env` dan isi dengan API key Gemini Anda
4. Jalankan perintah berikut:

```bash
# Instal dependensi
npm install

# Jalankan aplikasi
npm start
```

## Konfigurasi Gemini API

Untuk menggunakan fitur Gemini API, Anda perlu:

1. Mendapatkan API key dari [Google AI Studio](https://aistudio.google.com/apikey)
2. Salin file `.env.example` menjadi `.env`
3. Isi `GEMINI_API_KEY` dengan API key Anda
4. Pilih model yang ingin digunakan di `GEMINI_MODEL`

Atau Anda dapat mengatur API key dan model melalui menu pengaturan di aplikasi.

## Cara Build

Untuk membuat aplikasi yang dapat diinstal:

```bash
# Build untuk platform saat ini
npm run build
```

## Struktur Proyek

```
mamouse-agent/
├── assets/                # Aset gambar dan ikon
├── images/                # Folder untuk menyimpan gambar dari kamera
├── main.js               # Proses utama Electron
├── preload.js            # Script preload untuk komunikasi antara main dan renderer
├── config.js             # Konfigurasi aplikasi
├── gemini-service.js     # Layanan untuk integrasi Gemini API
├── mcp-server.js         # Server Model Context Protocol untuk kontrol komputer
├── camera-service.js     # Layanan untuk akses kamera dan analisis gambar
├── camera.html           # Halaman HTML untuk kamera
├── widget-manager.js     # Pengelola widget untuk informasi real-time
├── tools.js              # Definisi dan implementasi tools
├── index.html            # File HTML utama
├── styles.css            # Stylesheet
├── renderer.js           # Script untuk proses renderer
├── .env.example          # Contoh file konfigurasi environment
├── .env                  # File konfigurasi environment (tidak disertakan dalam repo)
├── package.json          # Konfigurasi proyek
└── README.md             # Dokumentasi
```

## Teknologi yang Digunakan

- **Electron** - Framework untuk membangun aplikasi desktop
- **WebSocket** - Untuk komunikasi real-time
- **Web Speech API** - Untuk pengenalan suara
- **HTML/CSS/JavaScript** - Untuk antarmuka pengguna
- **Gemini API** - Model AI dari Google untuk pemrosesan bahasa alami dan analisis gambar
- **Model Context Protocol (MCP)** - Untuk kontrol komputer dan interaksi dengan aplikasi
- **WebRTC** - Untuk akses kamera dan pengambilan gambar
- **OpenWeatherMap API** - Untuk informasi cuaca
- **NewsAPI** - Untuk berita terkini
- **Google Maps API** - Untuk estimasi waktu perjalanan
- **Alpha Vantage API** - Untuk informasi saham
- **dotenv** - Untuk mengelola variabel lingkungan

## Panduan Penggunaan

Mamouse Agent memiliki berbagai fitur yang dapat diakses melalui perintah teks. Berikut adalah panduan penggunaan untuk setiap fitur:

### 1. Chat AI

Mamouse Agent menggunakan Gemini API untuk memberikan respons terhadap pertanyaan dan permintaan pengguna. Anda dapat bertanya tentang berbagai topik, meminta bantuan untuk tugas tertentu, atau sekadar mengobrol.

**Contoh perintah:**
- "Apa itu kecerdasan buatan?"
- "Bagaimana cara membuat kue brownies?"
- "Jelaskan konsep relativitas Einstein"
- "Buatkan saya puisi tentang alam"

### 2. Kontrol Komputer

Mamouse Agent dapat membantu Anda mengontrol komputer dengan perintah sederhana.

#### Screenshot
Mengambil gambar layar komputer Anda.

**Contoh perintah:**
- "Ambil screenshot layar saya"
- "Tunjukkan apa yang ada di layar saya sekarang"

#### Membuka Aplikasi
Membuka aplikasi yang terinstal di komputer Anda.

**Contoh perintah:**
- "Buka Notepad"
- "Jalankan Chrome"
- "Buka aplikasi Kalkulator"

#### Melihat Aplikasi yang Berjalan
Menampilkan daftar aplikasi yang sedang berjalan di komputer Anda.

**Contoh perintah:**
- "Aplikasi apa saja yang sedang berjalan?"
- "Tunjukkan daftar aplikasi yang aktif"

### 3. Kamera dan Analisis Visual

Mamouse Agent dapat mengakses webcam Anda untuk mengambil gambar dan menganalisisnya.

#### Mengaktifkan/Menonaktifkan Kamera
Mengontrol akses ke webcam.

**Contoh perintah:**
- "Aktifkan kamera"
- "Nyalakan kamera"
- "Matikan kamera"
- "Nonaktifkan kamera"

#### Mengambil Gambar
Mengambil gambar dari webcam.

**Contoh perintah:**
- "Ambil gambar"
- "Foto apa yang ada di depan kamera"

#### Menganalisis Gambar
Menganalisis konten visual dari gambar yang diambil.

**Contoh perintah:**
- "Analisis gambar dari kamera"
- "Deskripsikan apa yang kamu lihat di kamera"
- "Apa yang kamu lihat di gambar ini?"

### 4. Widget Informasi Real-time

Mamouse Agent dapat memberikan berbagai informasi real-time melalui widget yang terintegrasi.

#### Cuaca
Mendapatkan informasi cuaca untuk lokasi tertentu.

**Contoh perintah:**
- "Bagaimana cuaca di Jakarta hari ini?"
- "Berapa suhu di Bandung sekarang?"
- "Apakah akan hujan di Surabaya besok?"

#### Berita
Mendapatkan berita terkini dari berbagai kategori.

**Contoh perintah:**
- "Berita terbaru tentang teknologi"
- "Apa berita olahraga hari ini?"
- "Berita bisnis terkini"

#### Kalender
Mendapatkan informasi kalender dan tanggal.

**Contoh perintah:**
- "Tunjukkan kalender bulan ini"
- "Tanggal berapa hari Minggu minggu depan?"
- "Berapa hari lagi sampai tahun baru?"

#### Kurs Mata Uang
Mendapatkan informasi nilai tukar mata uang.

**Contoh perintah:**
- "Berapa nilai tukar USD ke IDR?"
- "Berapa kurs Euro ke Rupiah?"
- "Tunjukkan nilai tukar Yen Jepang ke Rupiah"

#### Saham
Mendapatkan informasi harga saham terkini.

**Contoh perintah:**
- "Bagaimana performa saham AAPL hari ini?"
- "Berapa harga saham Google sekarang?"
- "Tunjukkan data saham Microsoft"

#### Waktu Perjalanan
Mendapatkan estimasi waktu perjalanan antara dua lokasi.

**Contoh perintah:**
- "Berapa lama perjalanan dari Jakarta ke Bandung?"
- "Berapa waktu yang dibutuhkan untuk berjalan kaki dari Stasiun Gambir ke Monas?"
- "Estimasi waktu berkendara dari Semarang ke Yogyakarta"

## Pengembangan Selanjutnya

- ✅ Integrasi dengan Gemini API
- ✅ Streaming respons dari model AI
- ✅ Fungsi pencarian web dan akses informasi real-time
- ✅ Integrasi computer vision untuk interaksi visual
- ✅ Kemampuan untuk berinteraksi dengan aplikasi lain
- Implementasi text-to-speech dengan ElevenLabs
- Penyimpanan dan ekspor percakapan
- Penyimpanan riwayat percakapan di database lokal
- Integrasi dengan layanan kalender dan email
- Dukungan untuk plugin pihak ketiga

## Kontribusi

Kami sangat menghargai kontribusi dari komunitas! Jika Anda ingin berkontribusi pada proyek Mamouse Agent, silakan ikuti langkah-langkah berikut:

### Workflow Kontribusi

1. **Fork repositori** ini ke akun GitHub Anda
2. **Clone fork Anda** ke komputer lokal
   ```bash
   git clone https://github.com/username-anda/mamouse-agent.git
   cd mamouse-agent
   ```
3. **Buat branch baru** untuk fitur atau perbaikan Anda
   ```bash
   git checkout -b feature/nama-fitur
   ```
   Gunakan konvensi penamaan berikut:
   - `feature/nama-fitur` untuk fitur baru
   - `bugfix/nama-bug` untuk perbaikan bug
   - `docs/nama-perubahan` untuk perubahan dokumentasi
   - `refactor/nama-perubahan` untuk refactoring kode

4. **Buat perubahan** dan commit menggunakan [Conventional Commits](https://www.conventionalcommits.org/)
   ```bash
   git add .
   git commit -m "feat(komponen): tambahkan fitur baru"
   ```

5. **Push ke GitHub** dan buat Pull Request
   ```bash
   git push origin feature/nama-fitur
   ```

6. **Buat Pull Request** dari branch Anda ke branch `develop` repositori utama

### Panduan Kontribusi

- Pastikan kode Anda mengikuti gaya dan konvensi yang ada
- Tambahkan komentar yang jelas untuk kode yang kompleks
- Perbarui dokumentasi jika diperlukan
- Pastikan semua test lulus sebelum membuat Pull Request
- Satu Pull Request sebaiknya fokus pada satu perubahan

### Struktur Branch

Proyek ini menggunakan model branch berikut:
- `master`: Kode produksi yang stabil
- `develop`: Branch pengembangan utama
- `feature/*`: Branch untuk fitur baru
- `bugfix/*`: Branch untuk perbaikan bug
- `release/*`: Branch untuk persiapan rilis

### Versioning

Proyek ini menggunakan [Semantic Versioning](https://semver.org/):
- **MAJOR**: Perubahan yang tidak kompatibel dengan versi sebelumnya
- **MINOR**: Fitur baru yang kompatibel dengan versi sebelumnya
- **PATCH**: Perbaikan bug yang kompatibel dengan versi sebelumnya
