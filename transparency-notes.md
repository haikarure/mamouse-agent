# Catatan Transparansi Mamouse Agent

File ini berisi daftar semua elemen transparan yang telah diubah menjadi solid dalam Mamouse Agent. Gunakan catatan ini sebagai referensi untuk mengembalikan efek transparansi jika diperlukan.

## Variabel CSS Root

### Warna dan Transparansi
```css
/* Original */
--background-color: rgba(0, 0, 0, 0); /* Tetap transparan */
--text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
--user-bubble-color: rgba(0, 120, 215, 0.5);
--assistant-bubble-color: rgba(30, 40, 60, 0.5);

/* Modified */
--background-color: #1e1e1e; /* Warna solid gelap */
--text-shadow: none; /* Hapus bayangan teks */
--user-bubble-color: #0078d7; /* Warna solid untuk bubble user */
--assistant-bubble-color: #2d3748; /* Warna solid untuk bubble asisten */
```

### Blur
```css
/* Original */
--blur-light: 8px;
--blur-medium: 15px;
--blur-strong: 25px;

/* Modified */
--blur-light: 0px; /* Hapus blur */
--blur-medium: 0px; /* Hapus blur */
--blur-strong: 0px; /* Hapus blur */
```

### Transparansi
```css
/* Original */
--transparency-light: 0.7;
--transparency-medium: 0.5;
--transparency-strong: 0.3;

/* Modified */
--transparency-light: 1; /* Tidak transparan */
--transparency-medium: 1; /* Tidak transparan */
--transparency-strong: 1; /* Tidak transparan */
```

### Efek Glassmorphism
```css
/* Original */
--glass-border-color: rgba(255, 255, 255, 0.15);
--glass-shadow-color: rgba(0, 0, 0, 0.12);
--glass-highlight: rgba(255, 255, 255, 0.1);
--glass-light: rgba(255, 255, 255, 0.08);
--glass-medium: rgba(255, 255, 255, 0.12);
--glass-strong: rgba(255, 255, 255, 0.18);
--glass-border-light: 1px solid rgba(255, 255, 255, 0.08);
--glass-border-medium: 1px solid rgba(255, 255, 255, 0.15);
--glass-border-strong: 1px solid rgba(255, 255, 255, 0.25);

/* Modified */
--glass-border-color: #ffffff; /* Border solid */
--glass-shadow-color: #000000; /* Bayangan solid */
--glass-highlight: #ffffff; /* Highlight solid */
--glass-light: #f0f0f0; /* Warna solid light */
--glass-medium: #e0e0e0; /* Warna solid medium */
--glass-strong: #d0d0d0; /* Warna solid strong */
--glass-border-light: 1px solid #e0e0e0; /* Border solid light */
--glass-border-medium: 1px solid #d0d0d0; /* Border solid medium */
--glass-border-strong: 1px solid #c0c0c0; /* Border solid strong */
```

### Glow dan Shadow
```css
/* Original */
--glow-primary: rgba(0, 120, 215, 0.4);
--glow-secondary: rgba(76, 194, 255, 0.4);
--glow-accent: rgba(96, 205, 255, 0.4);
--shadow-light: 0 4px 12px rgba(0, 0, 0, 0.1);
--shadow-medium: 0 8px 24px rgba(0, 0, 0, 0.15);
--shadow-strong: 0 12px 36px rgba(0, 0, 0, 0.2);

/* Modified */
--glow-primary: #0078d7; /* Warna solid untuk glow primary */
--glow-secondary: #4cc2ff; /* Warna solid untuk glow secondary */
--glow-accent: #60cdff; /* Warna solid untuk glow accent */
--shadow-light: 0 4px 12px #000000; /* Bayangan solid light */
--shadow-medium: 0 8px 24px #000000; /* Bayangan solid medium */
--shadow-strong: 0 12px 36px #000000; /* Bayangan solid strong */
```

## Input Container

### Background dan Efek
```css
/* Original */
background-color: rgba(20, 25, 40, 0.55); /* Warna latar yang lebih futuristik */
background-image: linear-gradient(
  135deg,
  rgba(var(--primary-color-rgb), 0.05) 0%,
  rgba(var(--tertiary-color-rgb), 0.02) 40%,
  rgba(0, 0, 0, 0.05) 100%
); /* Gradien halus untuk kedalaman */
backdrop-filter: blur(var(--blur-strong)); /* Blur lebih kuat untuk efek glass */
-webkit-backdrop-filter: blur(var(--blur-strong)); /* Untuk Safari */

/* Modified */
background-color: #1e2738; /* Warna latar solid yang lebih futuristik */
background-image: none; /* Hapus gradien */
backdrop-filter: none; /* Hapus blur */
-webkit-backdrop-filter: none; /* Hapus blur untuk Safari */
```

### Border dan Shadow
```css
/* Original */
border: none; /* Hapus border untuk memastikan lebar yang tepat */
box-shadow: var(--shadow-medium),
            var(--glow-medium) var(--glow-primary),
            inset 0 1px 1px var(--glass-highlight),
            inset 0 -2px 1px rgba(0, 0, 0, 0.05); /* Bayangan lebih realistis dengan glow dan kedalaman */

/* Modified */
border: 2px solid #0078d7; /* Tambahkan border solid */
box-shadow: 0 4px 12px #000000; /* Bayangan solid */
```

## Chat Container

### Background dan Efek
```css
/* Original */
background-color: transparent !important; /* Pastikan transparan */
backdrop-filter: blur(0); /* Awalnya tidak ada blur */

/* Modified */
background-color: #2d3748 !important; /* Warna latar solid */
backdrop-filter: none; /* Hapus blur */
border: 2px solid #0078d7; /* Tambahkan border solid */
```

### Active State
```css
/* Original */
opacity: 0.95 !important; /* Sedikit lebih opaque */
backdrop-filter: blur(5px); /* Tambahkan blur saat aktif */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); /* Tambahkan bayangan halus */

/* Modified */
opacity: 1 !important; /* Fully opaque */
backdrop-filter: none; /* Hapus blur */
box-shadow: 0 8px 32px #000000; /* Bayangan solid */
```

## Chat Bubbles

### Bubble Content
```css
/* Original */
background-color: var(--assistant-bubble-color) !important;
background-image: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.05) 0%,
  rgba(255, 255, 255, 0.02) 40%,
  rgba(0, 0, 0, 0.05) 100%
); /* Gradien halus untuk kedalaman */
backdrop-filter: blur(var(--blur-medium)); /* Efek blur yang lebih kuat */
-webkit-backdrop-filter: blur(var(--blur-medium)); /* Untuk Safari */
border: var(--glass-border-medium); /* Border dengan variabel */
box-shadow: var(--shadow-medium),
            var(--glow-light) var(--glow-primary),
            inset 0 1px 1px var(--glass-highlight),
            inset 0 -2px 1px rgba(0, 0, 0, 0.05); /* Bayangan lebih realistis dengan efek kedalaman */

/* Modified */
background-color: #2d3748 !important; /* Warna solid untuk bubble */
background-image: none; /* Hapus gradien */
backdrop-filter: none; /* Hapus blur */
-webkit-backdrop-filter: none; /* Hapus blur untuk Safari */
border: 1px solid #0078d7; /* Border solid */
box-shadow: 0 4px 12px #000000; /* Bayangan solid */
```

### Assistant Bubble
```css
/* Original */
background-color: var(--assistant-bubble-color) !important; /* Gunakan variabel tema */
background-image: linear-gradient(
  135deg,
  rgba(var(--primary-color-rgb), 0.05) 0%,
  rgba(var(--tertiary-color-rgb), 0.02) 40%,
  rgba(0, 0, 0, 0.05) 100%
); /* Gradien halus dengan warna tema */
backdrop-filter: blur(var(--blur-strong));
-webkit-backdrop-filter: blur(var(--blur-strong));
box-shadow: var(--shadow-medium),
            var(--glow-medium) var(--glow-primary),
            inset 0 1px 1px var(--glass-highlight),
            inset 0 -2px 1px rgba(0, 0, 0, 0.05); /* Bayangan lebih realistis */
border: var(--glass-border-medium); /* Gunakan variabel tema */

/* Modified */
background-color: #2d3748 !important; /* Warna solid untuk bubble asisten */
background-image: none; /* Hapus gradien */
backdrop-filter: none; /* Hapus blur */
-webkit-backdrop-filter: none; /* Hapus blur untuk Safari */
box-shadow: 0 4px 12px #000000; /* Bayangan solid */
border: 1px solid #0078d7; /* Border solid */
```

### User Bubble
```css
/* Original */
background-color: var(--user-bubble-color) !important;
background-image: linear-gradient(
  135deg,
  rgba(var(--primary-color-rgb), 0.08) 0%,
  rgba(var(--accent-color-rgb), 0.04) 40%,
  rgba(0, 0, 0, 0.03) 100%
); /* Gradien halus dengan warna tema */
backdrop-filter: blur(var(--blur-medium));
-webkit-backdrop-filter: blur(var(--blur-medium));
box-shadow: var(--shadow-medium),
            var(--glow-medium) var(--glow-primary),
            inset 0 1px 1px var(--glass-highlight),
            inset 0 -2px 1px rgba(0, 0, 0, 0.05); /* Bayangan lebih realistis */
border: var(--glass-border-medium); /* Gunakan variabel tema */

/* Modified */
background-color: #0078d7 !important; /* Warna solid untuk bubble user */
background-image: none; /* Hapus gradien */
backdrop-filter: none; /* Hapus blur */
-webkit-backdrop-filter: none; /* Hapus blur untuk Safari */
box-shadow: 0 4px 12px #000000; /* Bayangan solid */
border: 1px solid #0078d7; /* Border solid */
```

## Typing Indicator

### Background dan Efek
```css
/* Original */
background-color: var(--assistant-bubble-color) !important; /* Gunakan variabel tema */
box-shadow: 0 4px 12px var(--glow-primary),
            inset 0 1px 1px var(--glass-highlight) !important; /* Gunakan variabel tema */
backdrop-filter: blur(10px) !important;
-webkit-backdrop-filter: blur(10px) !important;
border: 1px solid var(--glass-border-color) !important; /* Gunakan variabel tema */

/* Modified */
background-color: #2d3748 !important; /* Warna solid untuk typing indicator */
box-shadow: 0 4px 12px #000000 !important; /* Bayangan solid */
backdrop-filter: none !important; /* Hapus blur */
-webkit-backdrop-filter: none !important; /* Hapus blur untuk Safari */
border: 1px solid #0078d7 !important; /* Border solid */
```

### Animasi
```css
/* Original */
@keyframes typingIndicatorPulse {
  0%, 100% {
    box-shadow: 0 4px 12px var(--glow-primary),
                inset 0 1px 1px var(--glass-highlight);
  }
  50% {
    box-shadow: 0 4px 15px var(--glow-secondary),
                0 0 0 1px var(--glass-border-color),
                inset 0 1px 1px var(--glass-highlight);
  }
}

@keyframes typingWave {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.5;
    box-shadow: 0 0 3px var(--glow-primary);
  }
  50% {
    transform: translateY(-10px);
    opacity: 1;
    box-shadow: 0 0 8px var(--glow-secondary);
  }
}

/* Modified */
@keyframes typingIndicatorPulse {
  0%, 100% {
    box-shadow: 0 4px 12px #000000;
  }
  50% {
    box-shadow: 0 4px 15px #000000;
  }
}

@keyframes typingWave {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.5;
    box-shadow: 0 0 3px #0078d7;
  }
  50% {
    transform: translateY(-10px);
    opacity: 1;
    box-shadow: 0 0 8px #0078d7;
  }
}
```

## Status Indicator

### Background dan Efek
```css
/* Original */
background: rgba(20, 25, 40, 0.75);
backdrop-filter: blur(var(--blur-medium));
-webkit-backdrop-filter: blur(var(--blur-medium));
box-shadow: var(--shadow-medium),
            var(--glow-light) var(--glow-primary);
border: var(--glass-border-light);

/* Modified */
background: #1e2738; /* Warna solid */
backdrop-filter: none;
-webkit-backdrop-filter: none;
box-shadow: 0 4px 12px #000000; /* Bayangan solid */
border: 1px solid #0078d7; /* Border solid */
```

### Status Indicator States
```css
/* Original */
.status-indicator.listening {
  background: linear-gradient(135deg,
    rgba(var(--primary-color-rgb), 0.5) 0%,
    rgba(var(--tertiary-color-rgb), 0.4) 100%);
}

.status-indicator.processing {
  background: linear-gradient(135deg,
    rgba(var(--warning-color-rgb), 0.5) 0%,
    rgba(var(--accent-color-rgb), 0.4) 100%);
}

.status-indicator.error {
  background: linear-gradient(135deg,
    rgba(var(--error-color-rgb), 0.5) 0%,
    rgba(255, 100, 100, 0.4) 100%);
}

.status-indicator.success {
  background: linear-gradient(135deg,
    rgba(var(--success-color-rgb), 0.5) 0%,
    rgba(100, 255, 150, 0.4) 100%);
}

/* Modified */
.status-indicator.listening {
  background: #0078d7; /* Warna solid primary */
}

.status-indicator.processing {
  background: #ffcc00; /* Warna solid warning */
}

.status-indicator.error {
  background: #ff3333; /* Warna solid error */
}

.status-indicator.success {
  background: #00cc66; /* Warna solid success */
}
```

## Connection Status

### Background dan Efek
```css
/* Original */
.connection-status-container {
  background-color: rgba(0, 0, 0, 0.7); /* Latar belakang gelap */
}

.connection-status-message {
  background: linear-gradient(135deg,
    rgba(20, 25, 40, 0.85) 0%,
    rgba(15, 20, 35, 0.95) 100%);
  backdrop-filter: blur(var(--blur-strong));
  -webkit-backdrop-filter: blur(var(--blur-strong));
  box-shadow: var(--shadow-strong),
              var(--glow-medium) var(--glow-primary);
  border: var(--glass-border-medium);
}

/* Modified */
.connection-status-container {
  background-color: #000000; /* Latar belakang solid */
}

.connection-status-message {
  background: #1e2738; /* Warna solid */
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: 0 8px 24px #000000; /* Bayangan solid */
  border: 1px solid #0078d7; /* Border solid */
}
```

## Buttons

### Background dan Efek
```css
/* Original */
backdrop-filter: blur(var(--blur-medium)); /* Efek blur untuk tombol */
-webkit-backdrop-filter: blur(var(--blur-medium)); /* Untuk Safari */
border: var(--glass-border-light); /* Border dengan variabel */
box-shadow: var(--shadow-light),
            inset 0 1px 1px var(--glass-highlight); /* Bayangan dengan variabel */
text-shadow: var(--text-shadow); /* Bayangan teks */

/* Modified */
backdrop-filter: none; /* Hapus blur */
-webkit-backdrop-filter: none; /* Hapus blur untuk Safari */
border: 1px solid #0078d7; /* Border solid */
box-shadow: 0 4px 12px #000000; /* Bayangan solid */
text-shadow: none; /* Hapus bayangan teks */
```

## Slide Menu

### Background dan Efek
```css
/* Original */
background: linear-gradient(180deg,
              rgba(20, 25, 40, 0.55) 0%,
              rgba(15, 20, 35, 0.65) 100%); /* Gradien yang selaras dengan input container */
backdrop-filter: blur(18px); /* Blur yang sama dengan input container */
-webkit-backdrop-filter: blur(18px); /* Untuk Safari */

/* Modified */
background: #1e2738; /* Warna solid */
backdrop-filter: none; /* Hapus blur */
-webkit-backdrop-filter: none; /* Hapus blur untuk Safari */
```

## Status Messages

### Background dan Efek
```css
/* Original */
.status-message.success {
  background-color: rgba(0, 200, 0, 0.2);
  color: #00ff00;
  border: 1px solid rgba(0, 200, 0, 0.3);
}

.status-message.error {
  background-color: rgba(200, 0, 0, 0.2);
  color: #ff5555;
  border: 1px solid rgba(200, 0, 0, 0.3);
}

.status-message.info {
  background-color: rgba(0, 100, 200, 0.2);
  color: #55aaff;
  border: 1px solid rgba(0, 100, 200, 0.3);
}

/* Modified */
.status-message.success {
  background-color: #004d00; /* Warna solid hijau gelap */
  color: #00ff00;
  border: 1px solid #00cc00; /* Border solid hijau */
}

.status-message.error {
  background-color: #4d0000; /* Warna solid merah gelap */
  color: #ff5555;
  border: 1px solid #cc0000; /* Border solid merah */
}

.status-message.info {
  background-color: #00264d; /* Warna solid biru gelap */
  color: #55aaff;
  border: 1px solid #0064cc; /* Border solid biru */
}
```

## Voice Visualizer

### Background dan Efek
```css
/* Original */
.voice-visualizer-container {
  position: fixed;
  top: var(--chat-top-normal);
  left: 90%;
  transform: translateX(-90%);
  width: var(--chat-width-normal);
  min-width: var(--min-width-normal);
  max-width: var(--max-width-normal);
  height: 100px;
  display: none;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
  z-index: 90;
  pointer-events: auto !important;
}

/* Modified */
.voice-visualizer-container {
  position: fixed;
  top: var(--chat-top-normal);
  left: 90%;
  transform: translateX(-90%);
  width: var(--chat-width-normal);
  min-width: var(--min-width-normal);
  max-width: var(--max-width-normal);
  height: 100px;
  display: none;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
  z-index: 90;
  pointer-events: auto !important;
  background-color: #2d3748; /* Warna solid */
  border: 1px solid #0078d7; /* Border solid */
}
```

### Canvas Visualizer
```css
/* Original */
// Konfigurasi visualisasi
const barCount = 30;
const barWidth = (visualizerCanvas.width / barCount) - 2;

// Dapatkan warna dari CSS
let accentColor = '#ff0066'; // Default fallback
let primaryColor = '#00c6ff'; // Default fallback

// Create gradient for bars
const gradient = ctx.createLinearGradient(0, 0, 0, visualizerCanvas.height);
gradient.addColorStop(0, accentColor);
gradient.addColorStop(1, primaryColor);

/* Modified */
// Konfigurasi visualisasi
const barCount = 30;
const barWidth = (visualizerCanvas.width / barCount) - 2;

// Gunakan warna solid
let accentColor = '#ff0066'; // Warna solid
let primaryColor = '#00c6ff'; // Warna solid

// Gunakan warna solid alih-alih gradient
ctx.fillStyle = primaryColor;
```

## Efek Shine

### Input Container Shine
```css
/* Original */
.input-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: skewX(-25deg);
  animation: inputShine 12s infinite ease-in-out;
  pointer-events: none;
  z-index: 1;
}

/* Modified */
.input-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    #ffffff,
    transparent
  );
  transform: skewX(-25deg);
  animation: inputShine 12s infinite ease-in-out;
  pointer-events: none;
  z-index: 1;
  opacity: 0.1; /* Rendahkan opacity alih-alih menggunakan transparansi */
}
```

### Bubble Content Shine
```css
/* Original */
.assistant .bubble-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  transform: skewX(-25deg);
  animation: shine 8s infinite ease-in-out;
  pointer-events: none;
}

/* Modified */
.assistant .bubble-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    #ffffff,
    transparent
  );
  transform: skewX(-25deg);
  animation: shine 8s infinite ease-in-out;
  pointer-events: none;
  opacity: 0.05; /* Rendahkan opacity alih-alih menggunakan transparansi */
}
```

## Efek Ripple

### Button Ripple
```css
/* Original */
.submit-button::after, .voice-button::after, .menu-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(var(--primary-color-rgb), 0.7);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.submit-button:active::after, .voice-button:active::after, .menu-button:active::after {
  animation: ripple 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes ripple {
  0% {
    transform: scale(0, 0) translate(-50%, -50%);
    opacity: 0.7;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: scale(25, 25) translate(-50%, -50%);
    opacity: 0;
  }
}

/* Modified */
.submit-button::after, .voice-button::after, .menu-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: #0078d7; /* Warna solid primary */
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.submit-button:active::after, .voice-button:active::after, .menu-button:active::after {
  animation: ripple 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes ripple {
  0% {
    transform: scale(0, 0) translate(-50%, -50%);
    opacity: 0.7;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: scale(25, 25) translate(-50%, -50%);
    opacity: 0;
  }
}
```

### General Ripple
```css
/* Original */
.ripple {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transform: scale(0);
  animation: ripple-animation 0.6s cubic-bezier(0, 0.2, 0.8, 1);
  pointer-events: none !important;
  z-index: 10;
}

@keyframes ripple-animation {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

/* Modified */
.ripple {
  position: absolute;
  background-color: #ffffff; /* Warna solid putih */
  border-radius: 50%;
  transform: scale(0);
  animation: ripple-animation 0.6s cubic-bezier(0, 0.2, 0.8, 1);
  pointer-events: none !important;
  z-index: 10;
  opacity: 0.6; /* Rendahkan opacity alih-alih menggunakan transparansi */
}

@keyframes ripple-animation {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}
```

## Connection Spinner

### Border dan Animasi
```css
/* Original */
.connection-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  border-left-color: var(--accent-color);
  animation: spin 1s linear infinite;
  box-shadow: var(--glow-light) var(--glow-primary);
}

/* Modified */
.connection-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #333333; /* Warna solid gelap */
  border-radius: 50%;
  border-top-color: var(--primary-color);
  border-left-color: var(--accent-color);
  animation: spin 1s linear infinite;
  box-shadow: 0 0 5px #0078d7; /* Bayangan solid */
}
```

## Theme Options

### Background dan Efek
```css
/* Original */
.theme-option[data-theme="light"] {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.4) 0%, rgba(255, 131, 100, 0.3) 100%);
  border-color: rgba(255, 107, 107, 0.5);
  color: #ffffff !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7),
               0 0 5px rgba(0, 0, 0, 0.5);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25),
              0 0 15px rgba(255, 107, 107, 0.3);
}

.theme-option[data-theme="neon"] {
  background: linear-gradient(135deg, rgba(10, 239, 255, 0.3) 0%, rgba(123, 0, 255, 0.2) 100%);
  border-color: rgba(10, 239, 255, 0.4);
  box-shadow: 0 0 15px rgba(10, 239, 255, 0.4);
}

/* Modified */
.theme-option[data-theme="light"] {
  background: #ff6b6b; /* Warna solid */
  border-color: #ff6b6b; /* Warna solid */
  color: #ffffff !important;
  text-shadow: none;
  box-shadow: 0 3px 10px #000000; /* Bayangan solid */
}

.theme-option[data-theme="neon"] {
  background: #0aefff; /* Warna solid */
  border-color: #0aefff; /* Warna solid */
  box-shadow: 0 0 15px #0aefff; /* Bayangan solid */
}
```

## Transparent Window

### Global Transparency
```css
/* Original */
.transparent-window {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  resize: none !important;
  pointer-events: none !important;
}

/* Modified */
.transparent-window {
  background-color: #1e1e1e !important; /* Warna solid gelap */
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  resize: none !important;
  pointer-events: none !important;
}
```

## Efek Partikel Latar Belakang

### Background dan Efek
```css
/* Original */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, rgba(var(--primary-color-rgb), 0.03) 0%, transparent 40%),
              radial-gradient(circle at 80% 20%, rgba(var(--secondary-color-rgb), 0.03) 0%, transparent 35%),
              radial-gradient(circle at 20% 80%, rgba(var(--accent-color-rgb), 0.03) 0%, transparent 35%);
  pointer-events: none;
  z-index: -1;
  opacity: 0.7;
  animation: backgroundShift 15s ease-in-out infinite alternate;
}

/* Modified */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, #0078d7 0%, transparent 40%),
              radial-gradient(circle at 80% 20%, #2b88d8 0%, transparent 35%),
              radial-gradient(circle at 20% 80%, #60cdff 0%, transparent 35%);
  pointer-events: none;
  z-index: -1;
  opacity: 0.03; /* Rendahkan opacity alih-alih menggunakan transparansi dalam gradient */
  animation: backgroundShift 15s ease-in-out infinite alternate;
}
```

## Efek Glow Border pada Input Container

### Hover Effect
```css
/* Original */
.input-container:hover::before {
  content: '';
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  border-radius: 30px;
  background: linear-gradient(
    135deg,
    rgba(var(--primary-color-rgb), 0.5),
    rgba(var(--tertiary-color-rgb), 0.3),
    rgba(var(--accent-color-rgb), 0.5)
  );
  z-index: -1;
  opacity: 0.5;
  filter: blur(3px);
  animation: borderGlow 3s infinite alternate;
  pointer-events: none;
}

@keyframes borderGlow {
  0% {
    opacity: 0.3;
    filter: blur(2px);
  }
  100% {
    opacity: 0.6;
    filter: blur(4px);
  }
}

/* Modified */
.input-container:hover::before {
  content: '';
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  border-radius: 30px;
  background: linear-gradient(
    135deg,
    #0078d7,
    #4cc2ff,
    #60cdff
  );
  z-index: -1;
  opacity: 0.3; /* Rendahkan opacity alih-alih menggunakan transparansi dalam gradient */
  filter: blur(3px);
  animation: borderGlow 3s infinite alternate;
  pointer-events: none;
}

@keyframes borderGlow {
  0% {
    opacity: 0.2;
    filter: blur(2px);
  }
  100% {
    opacity: 0.4;
    filter: blur(4px);
  }
}
```

## Tombol-tombol (Submit, Voice, Menu)

### Background dan Efek
```css
/* Original */
.submit-button, .voice-button, .menu-button {
  background: rgba(255, 255, 255, 0.08);
  background-image: linear-gradient(
    135deg,
    rgba(var(--primary-color-rgb), 0.05) 0%,
    rgba(var(--tertiary-color-rgb), 0.02) 40%,
    rgba(0, 0, 0, 0.05) 100%
  );
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer !important;
  transition: all var(--transition-normal);
  border-radius: 50%;
  -webkit-app-region: no-drag !important;
  pointer-events: auto !important;
  position: relative;
  overflow: hidden;
  margin: 0 4px;
  backdrop-filter: blur(var(--blur-medium));
  -webkit-backdrop-filter: blur(var(--blur-medium));
  border: var(--glass-border-light);
  box-shadow: var(--shadow-light),
              inset 0 1px 1px var(--glass-highlight);
  text-shadow: var(--text-shadow);
}

/* Modified */
.submit-button, .voice-button, .menu-button {
  background: #2d3748; /* Warna solid */
  background-image: none; /* Hapus gradien */
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer !important;
  transition: all var(--transition-normal);
  border-radius: 50%;
  -webkit-app-region: no-drag !important;
  pointer-events: auto !important;
  position: relative;
  overflow: hidden;
  margin: 0 4px;
  backdrop-filter: none; /* Hapus blur */
  -webkit-backdrop-filter: none; /* Hapus blur */
  border: 1px solid #0078d7; /* Border solid */
  box-shadow: 0 4px 12px #000000; /* Bayangan solid */
  text-shadow: none; /* Hapus bayangan teks */
}
```

### Efek Glow pada Hover
```css
/* Original */
.submit-button::before, .voice-button::before, .menu-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: radial-gradient(
    circle at center,
    rgba(var(--primary-color-rgb), 0.3),
    transparent 70%
  );
  opacity: 0;
  transition: opacity var(--transition-normal);
  pointer-events: none;
  z-index: -1;
}

.submit-button:hover::before, .voice-button:hover::before, .menu-button:hover::before {
  opacity: 1;
}

/* Modified */
.submit-button::before, .voice-button::before, .menu-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: #0078d7; /* Warna solid */
  opacity: 0;
  transition: opacity var(--transition-normal);
  pointer-events: none;
  z-index: -1;
}

.submit-button:hover::before, .voice-button:hover::before, .menu-button:hover::before {
  opacity: 0.3; /* Rendahkan opacity alih-alih menggunakan transparansi dalam gradient */
}
```

## Menu Items

### Hover Effect
```css
/* Original */
.menu-item:hover .menu-item-icon {
  background: linear-gradient(135deg,
              rgba(var(--primary-color-rgb), 0.25) 0%,
              rgba(var(--tertiary-color-rgb), 0.2) 100%);
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.2),
              0 0 10px rgba(var(--primary-color-rgb), 0.15);
  border-color: rgba(var(--primary-color-rgb), 0.2);
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: linear-gradient(180deg,
              rgba(var(--primary-color-rgb), 0.7),
              rgba(var(--tertiary-color-rgb), 0.7));
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 3px;
}

/* Modified */
.menu-item:hover .menu-item-icon {
  background: #0078d7; /* Warna solid */
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 4px 12px #000000; /* Bayangan solid */
  border-color: #0078d7; /* Border solid */
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: #0078d7; /* Warna solid */
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 3px;
}
```

## Theme Section

### Background dan Efek
```css
/* Original */
.theme-section {
  background: linear-gradient(135deg,
              rgba(10, 15, 25, 0.85) 0%,
              rgba(5, 10, 20, 0.95) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.3) !important;
}

.theme-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: -1;
  border-radius: inherit;
}

/* Modified */
.theme-section {
  background: #0a0f19 !important; /* Warna solid gelap */
  border: 1px solid #ffffff !important; /* Border solid */
  box-shadow: none !important; /* Hapus bayangan */
}

.theme-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000000; /* Warna solid hitam */
  opacity: 0.3; /* Rendahkan opacity alih-alih menggunakan transparansi */
  pointer-events: none;
  z-index: -1;
  border-radius: inherit;
}
```