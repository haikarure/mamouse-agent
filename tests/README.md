# Pengujian untuk Mamouse Agent

Direktori ini berisi pengujian untuk Mamouse Agent. Pengujian dibagi menjadi beberapa kategori:

- **Unit Tests**: Pengujian untuk fungsi dan kelas individual
- **Integration Tests**: Pengujian untuk interaksi antar komponen
- **End-to-End Tests**: Pengujian untuk alur pengguna lengkap

## Menjalankan Pengujian

Untuk menjalankan semua pengujian:

```bash
npm test
```

Untuk menjalankan kategori pengujian tertentu:

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e
```

## Struktur Direktori

```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/               # End-to-end tests
├── fixtures/          # Test fixtures
└── helpers/           # Test helpers
```

## Menulis Pengujian Baru

### Unit Tests

Unit tests harus fokus pada pengujian fungsi atau kelas individual. Setiap unit test harus independen dan tidak bergantung pada state dari test lain.

Contoh:

```javascript
// tests/unit/gemini-service.test.js
const geminiService = require('../../gemini-service');

describe('GeminiService', () => {
  test('should initialize with valid API key', () => {
    // Test code here
  });

  test('should return error with invalid API key', () => {
    // Test code here
  });
});
```

### Integration Tests

Integration tests harus fokus pada pengujian interaksi antar komponen. Misalnya, pengujian interaksi antara gemini-service.js dan tools.js.

### End-to-End Tests

End-to-end tests harus fokus pada pengujian alur pengguna lengkap. Misalnya, pengujian proses dari input pengguna hingga respons dari model AI.

## Best Practices

1. **Isolasi**: Setiap test harus berjalan secara independen
2. **Mocking**: Gunakan mocking untuk dependencies eksternal
3. **Assertions**: Gunakan assertions yang spesifik
4. **Coverage**: Usahakan untuk mencapai coverage yang tinggi
5. **Maintenance**: Perbarui test saat kode berubah
