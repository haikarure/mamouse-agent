# Panduan Pengaturan API Key

Dokumen ini berisi panduan untuk mendapatkan dan mengatur API key yang diperlukan oleh Mamouse Agent. Beberapa fitur Mamouse Agent memerlukan API key dari layanan pihak ketiga untuk berfungsi dengan baik.

## Daftar API Key yang Diperlukan

Berikut adalah daftar API key yang diperlukan oleh Mamouse Agent:

1. **Gemini API** - Diperlukan untuk fungsi chat AI dan analisis gambar
2. **OpenWeatherMap API** - Diperlukan untuk widget cuaca
3. **NewsAPI** - Diperlukan untuk widget berita
4. **Google Maps API** - Diperlukan untuk widget waktu perjalanan
5. **Alpha Vantage API** - Diperlukan untuk widget saham

## Cara Mendapatkan API Key

### 1. Gemini API

Gemini API adalah layanan AI dari Google yang digunakan oleh Mamouse Agent untuk fungsi chat dan analisis gambar.

**Langkah-langkah:**
1. Kunjungi [Google AI Studio](https://aistudio.google.com/apikey)
2. Masuk dengan akun Google Anda
3. Klik "Create API Key"
4. Salin API key yang dihasilkan

### 2. OpenWeatherMap API

OpenWeatherMap API digunakan untuk mendapatkan informasi cuaca.

**Langkah-langkah:**
1. Kunjungi [OpenWeatherMap](https://home.openweathermap.org/users/sign_up)
2. Daftar akun baru atau masuk dengan akun yang sudah ada
3. Setelah masuk, kunjungi [halaman API keys](https://home.openweathermap.org/api_keys)
4. Buat API key baru atau gunakan yang sudah ada
5. Salin API key yang dihasilkan

### 3. NewsAPI

NewsAPI digunakan untuk mendapatkan berita terkini dari berbagai sumber.

**Langkah-langkah:**
1. Kunjungi [NewsAPI](https://newsapi.org/register)
2. Daftar akun baru
3. Setelah mendaftar, Anda akan menerima API key melalui email
4. Salin API key tersebut

### 4. Google Maps API

Google Maps API digunakan untuk mendapatkan estimasi waktu perjalanan.

**Langkah-langkah:**
1. Kunjungi [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan "Distance Matrix API" dan "Geocoding API"
4. Buat API key baru di [halaman Credentials](https://console.cloud.google.com/apis/credentials)
5. Salin API key yang dihasilkan

### 5. Alpha Vantage API

Alpha Vantage API digunakan untuk mendapatkan informasi saham.

**Langkah-langkah:**
1. Kunjungi [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Isi formulir pendaftaran
3. Setelah mendaftar, Anda akan menerima API key
4. Salin API key tersebut

## Cara Mengatur API Key di Mamouse Agent

Ada dua cara untuk mengatur API key di Mamouse Agent:

### Metode 1: Melalui File .env

1. Salin file `.env.example` menjadi `.env` di direktori Mamouse Agent
2. Buka file `.env` dengan editor teks
3. Isi nilai untuk setiap API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
   NEWS_API_KEY=your_newsapi_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   ```
4. Simpan file dan restart Mamouse Agent

### Metode 2: Melalui Menu Pengaturan

1. Buka Mamouse Agent
2. Klik ikon menu (hamburger) di pojok kiri atas
3. Pilih "Pengaturan"
4. Pilih tab "API Keys"
5. Masukkan API key untuk setiap layanan
6. Klik "Simpan"

## Catatan Penting

- **Keamanan**: Jaga API key Anda tetap rahasia. Jangan bagikan API key Anda dengan orang lain.
- **Batas Penggunaan**: Sebagian besar API memiliki batas penggunaan gratis. Periksa dokumentasi masing-masing layanan untuk informasi lebih lanjut.
- **Biaya**: Beberapa API mungkin mengenakan biaya untuk penggunaan yang melebihi batas gratis. Pastikan untuk memeriksa struktur harga masing-masing layanan.

## Troubleshooting

Jika Anda mengalami masalah dengan API key:

1. **API Key Tidak Valid**: Pastikan Anda telah menyalin API key dengan benar, tanpa spasi tambahan.
2. **Batas Penggunaan Terlampaui**: Periksa apakah Anda telah melampaui batas penggunaan gratis.
3. **API Tidak Aktif**: Beberapa API (seperti Google Maps) memerlukan aktivasi eksplisit di dashboard.
4. **Masalah Jaringan**: Pastikan komputer Anda terhubung ke internet.

## Dukungan

Jika Anda memerlukan bantuan lebih lanjut dengan pengaturan API key, silakan:

1. Periksa dokumentasi resmi masing-masing layanan
2. Kunjungi forum dukungan masing-masing layanan
3. Hubungi tim dukungan Mamouse Agent melalui [email dukungan]

---

Dengan mengatur API key yang diperlukan, Anda dapat memanfaatkan semua fitur Mamouse Agent secara maksimal. Selamat menggunakan!
