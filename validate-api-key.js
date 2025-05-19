// Script untuk memvalidasi API key Gemini
// Menggunakan library @google/generative-ai (library lama)
const { GoogleGenerativeAI } = require('@google/generative-ai');

// API key yang akan divalidasi
const apiKey = 'AIzaSyASu7datfmFWepnKQc9hsU6SktK_7-e7s8';

// Model yang akan digunakan - coba beberapa model yang berbeda
const models = [
  'gemini-1.5-flash-latest',
  'gemini-1.0-pro',
  'gemini-pro',
  'gemini-1.5-pro-latest'
];

async function validateApiKey() {
  try {
    console.log('Memulai validasi API key...');
    console.log(`API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);

    // Inisialisasi Google Generative AI dengan API key
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('Berhasil menginisialisasi GoogleGenerativeAI');

    // Coba setiap model secara berurutan
    for (const modelName of models) {
      console.log(`\nMencoba model: ${modelName}`);

      try {
        // Dapatkan model generatif
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log('Berhasil mendapatkan model');

        // Coba panggil API dengan prompt sederhana untuk memvalidasi
        const testPrompt = 'Hello, this is a test prompt to validate the API key.';
        console.log('Mengirim prompt test:', testPrompt);

        const result = await model.generateContent(testPrompt);
        console.log('Berhasil mendapatkan respons dari API');

        const response = result.response;
        console.log('API key valid!');
        console.log('Respons dari API:');
        console.log(response.text());

        return {
          valid: true,
          model: modelName,
          message: 'API key valid'
        };
      } catch (modelError) {
        console.error(`Error saat menggunakan model ${modelName}:`, modelError.message);
        // Lanjutkan ke model berikutnya
      }
    }

    // Jika semua model gagal
    console.error('Semua model gagal diakses dengan API key ini');
    return {
      valid: false,
      message: 'Tidak dapat mengakses model Gemini dengan API key ini'
    };
  } catch (error) {
    console.error('Error umum saat memvalidasi API key:', error);

    // Periksa pesan error untuk memberikan informasi yang lebih spesifik
    let errorMessage = 'API key tidak valid';

    if (error.message) {
      if (error.message.includes('API key not valid')) {
        errorMessage = 'API key tidak valid';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Kuota API key telah habis';
      } else if (error.message.includes('permission')) {
        errorMessage = 'API key tidak memiliki izin yang cukup';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit terlampaui, coba lagi nanti';
      } else {
        errorMessage = error.message; // Tampilkan pesan error asli untuk debugging
      }
    }

    return {
      valid: false,
      message: `Error: ${errorMessage}`
    };
  }
}

// Jalankan validasi
validateApiKey()
  .then(result => {
    console.log('\nHasil validasi:', result.valid ? 'API key valid' : 'API key tidak valid');
    if (result.valid) {
      console.log('Model yang berhasil:', result.model);
    } else {
      console.log('Pesan error:', result.message);
    }
    process.exit(result.valid ? 0 : 1);
  })
  .catch(error => {
    console.error('Error tidak terduga:', error);
    process.exit(1);
  });
