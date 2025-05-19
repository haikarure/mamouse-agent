// Standalone Bubble Chat Manager

// Variabel global untuk menyimpan state bubble
const bubbleState = {
  bubbles: [], // Array untuk menyimpan semua bubble yang aktif
  autoHideDelay: 300000, // Delay sebelum auto-hide (5 menit)
  maxBubbles: 50, // Maksimum jumlah bubble yang ditampilkan secara bersamaan
  bubbleLifetime: 600000, // Waktu hidup maksimum bubble (10 menit)
};

// Fungsi untuk membuat bubble chat yang berdiri sendiri
function createStandaloneBubble(message, isTypingIndicator = false) {
  console.log('createStandaloneBubble dipanggil dengan:',
    message ? `message (isUser: ${message.isUser}, id: ${message.id || 'undefined'})` : 'message undefined',
    `isTypingIndicator: ${isTypingIndicator}`);

  try {
    // Validasi input
    if (!message) {
      console.error('Message tidak valid');
      return null;
    }

    // Buat elemen bubble
    const bubble = document.createElement('div');
    bubble.className = `standalone-bubble ${message.isUser ? 'user' : 'assistant'}`;
    bubble.dataset.messageId = message.id || Date.now().toString();
    bubble.dataset.timestamp = Date.now().toString();

    console.log(`Bubble dibuat dengan ID: ${bubble.dataset.messageId}, class: ${bubble.className}`);

    // Tambahkan animasi yang sesuai
    if (message.isUser) {
      bubble.style.animationName = 'userBubbleEntrance';
    } else {
      bubble.style.animationName = 'assistantBubbleEntrance';
    }

    // Atur posisi awal bubble
    const computedStyle = getComputedStyle(document.documentElement);
    const inputTopPosition = parseFloat(computedStyle.getPropertyValue('--input-top-position')) || 5;
    const inputHeight = parseFloat(computedStyle.getPropertyValue('--input-height')) || 9;
    const baseTop = inputTopPosition + inputHeight + 0.5; // Mengurangi jarak menjadi 0.5vh agar lebih dekat dengan input

    // Atur posisi awal
    bubble.style.top = `${baseTop}vh`;
    console.log(`Posisi awal bubble: top=${baseTop}vh`);

    // Atur posisi horizontal (selalu di tengah)
    bubble.style.left = '50%';
    bubble.style.right = 'auto';

    // Tidak menambahkan tombol tutup lagi karena tidak diperlukan

    // Tambahkan timer auto-hide
    const autoHideTimer = document.createElement('div');
    autoHideTimer.className = 'auto-hide-timer';
    bubble.appendChild(autoHideTimer);

  if (isTypingIndicator) {
    // Buat indikator mengetik yang compact
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'bubble-content typing-indicator';

    // Buat container untuk titik-titik animasi
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'typing-dots';

    // Buat tiga titik untuk animasi wave
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'typing-dot';
      dotsContainer.appendChild(dot);
    }

    // Tambahkan container titik ke indikator
    typingIndicator.appendChild(dotsContainer);

    // Tambahkan indikator ke bubble
    bubble.appendChild(typingIndicator);
  } else {
    // Buat konten pesan normal
    const content = document.createElement('div');
    content.className = 'bubble-content';

    // Gunakan innerHTML untuk mendukung format teks dasar
    if (message.text && typeof message.text === 'string') {
      // Konversi URL menjadi link yang dapat diklik
      const textWithLinks = message.text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      // Konversi baris baru menjadi <br>
      const formattedText = textWithLinks.replace(/\n/g, '<br>');

      content.innerHTML = formattedText;
    } else {
      content.textContent = message.text || '';
    }

    bubble.appendChild(content);
  }

  // Tambahkan bubble ke virtual scroll
  try {
    if (window.virtualScroll && window.virtualScroll.addBubble) {
      console.log('Menambahkan bubble ke virtual scroll');
      window.virtualScroll.addBubble(bubble, message.isUser);
    } else {
      // Fallback ke body jika virtual scroll tidak tersedia
      console.log('Virtual scroll tidak tersedia, menambahkan bubble ke body');
      document.body.appendChild(bubble);
    }

    console.log('Bubble berhasil ditambahkan ke DOM');
  } catch (appendError) {
    console.error('Error saat menambahkan bubble ke DOM:', appendError);
    console.error('Detail error:', appendError.stack);
    return null;
  }

  // Tambahkan ke state
  try {
    bubbleState.bubbles.push({
      element: bubble,
      id: bubble.dataset.messageId,
      timestamp: parseInt(bubble.dataset.timestamp),
      isUser: message.isUser,
      autoHideTimeout: null
    });

    console.log(`Bubble ditambahkan ke state, total bubbles: ${bubbleState.bubbles.length}`);
  } catch (stateError) {
    console.error('Error saat menambahkan bubble ke state:', stateError);
  }

  // Batasi jumlah bubble yang ditampilkan
  try {
    limitBubbles();
  } catch (limitError) {
    console.error('Error saat membatasi jumlah bubble:', limitError);
  }

  console.log('createStandaloneBubble selesai, mengembalikan bubble');
  return bubble;
} catch (error) {
  console.error('Error saat membuat standalone bubble:', error);
  console.error('Detail error:', error.stack);
  return null;
}
}

// Fungsi untuk menampilkan bubble
function showBubble(bubble) {
  // Bubble sudah terlihat karena CSS diubah, tidak perlu menambahkan class show
  // Tetapi tetap tambahkan class untuk konsistensi
  bubble.classList.add('show');

  // Pastikan bubble terlihat
  bubble.style.opacity = '1';
  bubble.style.visibility = 'visible';

  // Atur ulang posisi semua bubble untuk memastikan tidak tumpang tindih
  // Ini akan memanggil repositionAllBubbles() melalui virtual scroll
  if (window.virtualScroll && window.virtualScroll.addBubble) {
    // Bubble sudah ditambahkan ke virtual scroll di createStandaloneBubble
    // Tidak perlu menambahkannya lagi
  } else {
    // Fallback jika virtual scroll tidak tersedia
    const isUser = bubble.classList.contains('user');
    repositionBubbles(isUser);
  }

  // Set timer untuk auto-hide
  const bubbleInfo = bubbleState.bubbles.find(b => b.element === bubble);
  if (bubbleInfo) {
    // Batalkan timer yang ada jika ada
    if (bubbleInfo.autoHideTimeout) {
      clearTimeout(bubbleInfo.autoHideTimeout);
    }

    // Set timer baru
    bubbleInfo.autoHideTimeout = setTimeout(() => {
      hideBubble(bubble);
    }, bubbleState.autoHideDelay);

    // Set timer untuk lifetime maksimum
    setTimeout(() => {
      if (document.body.contains(bubble)) {
        hideBubble(bubble);
      }
    }, bubbleState.bubbleLifetime);
  }
}

// Fungsi untuk menyembunyikan bubble
function hideBubble(bubble) {
  // Tambahkan class hide untuk animasi keluar
  bubble.classList.add('hide');
  bubble.classList.remove('show');

  // Simpan informasi apakah bubble adalah user atau assistant
  const isUser = bubble.classList.contains('user');

  // Hapus bubble dari DOM setelah animasi selesai
  setTimeout(() => {
    // Hapus dari virtual scroll jika tersedia
    if (window.virtualScroll && window.virtualScroll.removeBubble) {
      window.virtualScroll.removeBubble(bubble);
    }
    // Fallback ke body jika virtual scroll tidak tersedia
    else if (document.body.contains(bubble)) {
      document.body.removeChild(bubble);
    }

    // Hapus dari state
    const index = bubbleState.bubbles.findIndex(b => b.element === bubble);
    if (index !== -1) {
      bubbleState.bubbles.splice(index, 1);
    }
  }, 500); // Sesuaikan dengan durasi animasi
}

// Fungsi untuk mengatur ulang posisi bubble yang tersisa
function repositionBubbles(isUserType) {
  // Dapatkan semua bubble (baik user maupun assistant)
  const allBubbles = bubbleState.bubbles.filter(b =>
    b.element && document.body.contains(b.element)
  );

  if (allBubbles.length > 0) {
    // Dapatkan posisi top dari CSS
    const computedStyle = getComputedStyle(document.documentElement);
    const inputTopPosition = parseFloat(computedStyle.getPropertyValue('--input-top-position')) || 5;
    const inputHeight = parseFloat(computedStyle.getPropertyValue('--input-height')) || 9;

    // Posisi dasar (tepat di bawah input container)
    const baseTop = inputTopPosition + inputHeight + 0.5; // Mengurangi jarak menjadi 0.5vh agar lebih dekat dengan input

    // Tinggi offset untuk setiap bubble (dalam vh)
    const offsetHeight = 5; // 5vh offset untuk setiap bubble (dikurangi dari 8vh)

    // Urutkan semua bubble berdasarkan timestamp (yang paling lama dulu)
    allBubbles.sort((a, b) => a.timestamp - b.timestamp);

    // Atur posisi untuk semua bubble berdasarkan urutan timestamp
    allBubbles.forEach((bubbleInfo, index) => {
      if (bubbleInfo.element) {
        // Pastikan bubble terlihat
        bubbleInfo.element.style.opacity = '1';
        bubbleInfo.element.style.visibility = 'visible';

        // Atur posisi vertikal
        const newTop = baseTop + (index * offsetHeight);
        bubbleInfo.element.style.top = `${newTop}vh`;

        // Pastikan posisi horizontal di tengah
        bubbleInfo.element.style.left = '50%';
        bubbleInfo.element.style.right = 'auto';

        // Tambahkan class show untuk konsistensi
        bubbleInfo.element.classList.add('show');
      }
    });
  }
}

// Fungsi untuk membatasi jumlah bubble yang ditampilkan
function limitBubbles() {
  // Jika jumlah bubble melebihi batas maksimum
  if (bubbleState.bubbles.length > bubbleState.maxBubbles) {
    // Urutkan bubble berdasarkan timestamp (yang paling lama dulu)
    bubbleState.bubbles.sort((a, b) => a.timestamp - b.timestamp);

    // Hapus bubble yang paling lama
    const oldestBubble = bubbleState.bubbles[0];
    if (oldestBubble && oldestBubble.element) {
      hideBubble(oldestBubble.element);
    }
  }
}

// Fungsi untuk memperbarui konten bubble
function updateBubbleContent(bubbleId, text) {
  console.log(`Memperbarui konten bubble dengan ID: ${bubbleId}, teks: ${text && text.substring ? text.substring(0, 50) + (text.length > 50 ? '...' : '') : 'undefined'}`);

  try {
    // Cari bubble berdasarkan ID
    const bubbleInfo = bubbleState.bubbles.find(b => b.id === bubbleId);
    if (!bubbleInfo || !bubbleInfo.element) {
      console.error(`Bubble dengan ID ${bubbleId} tidak ditemukan, mencoba membuat bubble baru`);

      // Buat bubble baru jika tidak ditemukan
      const newBubble = showMessage({
        id: bubbleId,
        text: text || 'Respons dari Gemini API',
        isUser: false,
        timestamp: new Date().toISOString()
      });

      if (newBubble) {
        console.log(`Bubble baru berhasil dibuat dengan ID: ${bubbleId}`);
      }

      return;
    }

    // Pastikan bubble masih ada di DOM
    if (!document.body.contains(bubbleInfo.element)) {
      console.error(`Bubble dengan ID ${bubbleId} tidak ada di DOM, mencoba membuat bubble baru`);

      // Buat bubble baru jika tidak ada di DOM
      const newBubble = showMessage({
        id: bubbleId,
        text: text || 'Respons dari Gemini API',
        isUser: false,
        timestamp: new Date().toISOString()
      });

      if (newBubble) {
        console.log(`Bubble baru berhasil dibuat dengan ID: ${bubbleId}`);
      }

      return;
    }

    // Dapatkan elemen konten
    const contentElement = bubbleInfo.element.querySelector('.bubble-content');
    if (!contentElement) {
      console.error(`Elemen konten tidak ditemukan di bubble ${bubbleId}, mencoba membuat ulang konten`);

      // Buat elemen konten baru jika tidak ditemukan
      const newContent = document.createElement('div');
      newContent.className = 'bubble-content';

      // Hapus semua child nodes dari bubble
      while (bubbleInfo.element.firstChild) {
        bubbleInfo.element.removeChild(bubbleInfo.element.firstChild);
      }

      // Tambahkan konten baru ke bubble
      bubbleInfo.element.appendChild(newContent);

      // Update referensi ke elemen konten
      const updatedContentElement = bubbleInfo.element.querySelector('.bubble-content');

      if (!updatedContentElement) {
        console.error(`Gagal membuat ulang elemen konten untuk bubble ${bubbleId}`);
        return;
      }

      // Format teks dengan link dan baris baru
      if (text && typeof text === 'string') {
        // Konversi URL menjadi link yang dapat diklik
        const textWithLinks = text.replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // Konversi baris baru menjadi <br>
        const formattedText = textWithLinks.replace(/\n/g, '<br>');

        updatedContentElement.innerHTML = formattedText;
      } else {
        updatedContentElement.textContent = text || '';
      }

      console.log(`Elemen konten berhasil dibuat ulang untuk bubble ${bubbleId}`);

      return;
    }

    // Cek apakah ini adalah indikator mengetik
    const isTypingIndicator = contentElement.classList.contains('typing-indicator');
    console.log(`Elemen konten adalah indikator mengetik: ${isTypingIndicator}`);

    if (isTypingIndicator) {
      console.log('Mengkonversi indikator mengetik menjadi konten teks');

      // Hapus semua child nodes dari elemen konten
      while (contentElement.firstChild) {
        contentElement.removeChild(contentElement.firstChild);
      }

      // Hapus class typing-indicator
      contentElement.classList.remove('typing-indicator');

      // Format teks dengan link dan baris baru
      if (text && typeof text === 'string') {
        // Konversi URL menjadi link yang dapat diklik
        const textWithLinks = text.replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // Konversi baris baru menjadi <br>
        const formattedText = textWithLinks.replace(/\n/g, '<br>');

        contentElement.innerHTML = formattedText;
      } else {
        contentElement.textContent = text || '';
      }
    } else {
      // Update teks dengan format
      if (text && typeof text === 'string') {
        // Konversi URL menjadi link yang dapat diklik
        const textWithLinks = text.replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // Konversi baris baru menjadi <br>
        const formattedText = textWithLinks.replace(/\n/g, '<br>');

        contentElement.innerHTML = formattedText;
      } else {
        contentElement.textContent = text || '';
      }
    }

    // Reset timer auto-hide
    if (bubbleInfo.autoHideTimeout) {
      clearTimeout(bubbleInfo.autoHideTimeout);
    }

    bubbleInfo.autoHideTimeout = setTimeout(() => {
      hideBubble(bubbleInfo.element);
    }, bubbleState.autoHideDelay);

    console.log(`Konten bubble ${bubbleId} berhasil diperbarui`);
  } catch (error) {
    console.error(`Error saat memperbarui konten bubble ${bubbleId}:`, error);
    console.error('Detail error:', error.stack);

    // Coba buat bubble baru sebagai fallback
    try {
      const fallbackBubble = showMessage({
        id: bubbleId,
        text: text || 'Respons dari Gemini API',
        isUser: false,
        timestamp: new Date().toISOString()
      });

      if (fallbackBubble) {
        console.log(`Bubble fallback berhasil dibuat dengan ID: ${bubbleId}`);
      }
    } catch (fallbackError) {
      console.error('Error saat membuat bubble fallback:', fallbackError);
    }
  }
}

// Fungsi untuk menampilkan pesan dalam bubble standalone
function showMessage(message) {
  console.log('showMessage dipanggil dengan pesan:', message);

  if (!message) {
    console.error('Pesan tidak valid, tidak dapat menampilkan bubble');
    return null;
  }

  try {
    // Cek apakah bubble dengan ID yang sama sudah ada
    if (message.id) {
      const existingBubble = bubbleState.bubbles.find(b => b.id === message.id);
      if (existingBubble && existingBubble.element && document.body.contains(existingBubble.element)) {
        console.log(`Bubble dengan ID ${message.id} sudah ada, mengupdate konten`);

        // Update konten bubble yang sudah ada
        try {
          updateBubbleContent(message.id, message.text || '');
          console.log(`Konten bubble ${message.id} berhasil diperbarui`);
          return existingBubble.element;
        } catch (updateError) {
          console.error(`Error saat mengupdate bubble yang sudah ada:`, updateError);
          // Lanjutkan untuk membuat bubble baru
        }
      }
    }

    // Buat bubble baru
    console.log('Membuat bubble baru dengan createStandaloneBubble');
    const bubble = createStandaloneBubble(message);

    if (!bubble) {
      console.error('createStandaloneBubble mengembalikan null atau undefined');
      return null;
    }

    console.log('Bubble berhasil dibuat, ID:', bubble.dataset.messageId);

    // Tampilkan bubble
    console.log('Menampilkan bubble dengan showBubble');
    showBubble(bubble);
    console.log('Bubble berhasil ditampilkan');

    // Pastikan bubble terlihat dengan mengatur style secara langsung
    bubble.style.opacity = '1';
    bubble.style.visibility = 'visible';
    bubble.style.display = 'flex';

    // Pastikan bubble ada di DOM
    if (!document.body.contains(bubble)) {
      console.log('Bubble tidak ada di DOM, menambahkan ke body');
      document.body.appendChild(bubble);
    }

    return bubble;
  } catch (error) {
    console.error('Error saat menampilkan pesan dalam bubble:', error);
    console.error('Detail error:', error.stack);

    // Coba fallback dengan menambahkan langsung ke body
    try {
      console.log('Mencoba fallback dengan menambahkan bubble langsung ke body');

      // Buat elemen bubble secara manual
      const fallbackBubble = document.createElement('div');
      fallbackBubble.className = `standalone-bubble ${message.isUser ? 'user' : 'assistant'}`;
      fallbackBubble.dataset.messageId = message.id || Date.now().toString();
      fallbackBubble.dataset.timestamp = Date.now().toString();

      // Atur style untuk memastikan terlihat
      fallbackBubble.style.position = 'fixed';
      fallbackBubble.style.top = '50vh';
      fallbackBubble.style.left = '50%';
      fallbackBubble.style.transform = 'translate(-50%, -50%)';
      fallbackBubble.style.opacity = '1';
      fallbackBubble.style.visibility = 'visible';
      fallbackBubble.style.zIndex = '9999';

      // Buat konten
      const content = document.createElement('div');
      content.className = 'bubble-content';
      content.textContent = message.text || 'Pesan dari Gemini API';

      // Tambahkan konten ke bubble
      fallbackBubble.appendChild(content);

      // Tambahkan ke body
      document.body.appendChild(fallbackBubble);

      console.log('Fallback bubble berhasil ditambahkan ke body');

      return fallbackBubble;
    } catch (fallbackError) {
      console.error('Error saat membuat fallback bubble:', fallbackError);
      return null;
    }
  }
}

// Fungsi untuk menampilkan indikator mengetik
function showTypingIndicator() {
  console.log('showTypingIndicator dipanggil');

  try {
    // Buat bubble dengan indikator mengetik
    console.log('Membuat bubble typing indicator dengan createStandaloneBubble');
    const bubble = createStandaloneBubble({ isUser: false, id: 'typing' }, true);

    if (!bubble) {
      console.error('createStandaloneBubble mengembalikan null atau undefined untuk typing indicator');
      return null;
    }

    console.log('Typing indicator bubble berhasil dibuat, ID:', bubble.dataset.messageId);

    // Tampilkan bubble
    console.log('Menampilkan typing indicator bubble dengan showBubble');
    showBubble(bubble);
    console.log('Typing indicator bubble berhasil ditampilkan');

    return bubble;
  } catch (error) {
    console.error('Error saat menampilkan typing indicator:', error);
    console.error('Detail error:', error.stack);
    return null;
  }
}

// Fungsi untuk menghapus semua bubble
function clearAllBubbles() {
  // Salin array untuk menghindari masalah saat iterasi dan modifikasi
  const bubblesToRemove = [...bubbleState.bubbles];

  // Hapus semua bubble
  bubblesToRemove.forEach(bubbleInfo => {
    if (bubbleInfo.element) {
      hideBubble(bubbleInfo.element);
    }
  });
}

// Fungsi untuk mengatur posisi bubble agar tidak tumpang tindih
function adjustBubblePosition(bubble, isUser) {
  // Dapatkan semua bubble yang sudah ada
  const allBubbles = bubbleState.bubbles.filter(b =>
    b.element && document.body.contains(b.element)
  );

  // Dapatkan posisi top dari CSS
  const computedStyle = getComputedStyle(document.documentElement);
  const inputTopPosition = parseFloat(computedStyle.getPropertyValue('--input-top-position')) || 5;
  const inputHeight = parseFloat(computedStyle.getPropertyValue('--input-height')) || 9;

  // Posisi dasar (tepat di bawah input container)
  const baseTop = inputTopPosition + inputHeight + 0.5; // Mengurangi jarak menjadi 0.5vh agar lebih dekat dengan input

  // Tinggi offset untuk setiap bubble baru (dalam vh)
  const offsetHeight = 5; // 5vh offset untuk setiap bubble (dikurangi dari 8vh)

  // Atur posisi horizontal (selalu di tengah)
  bubble.style.left = '50%';
  bubble.style.right = 'auto';

  // Pastikan bubble terlihat
  bubble.style.opacity = '1';
  bubble.style.visibility = 'visible';

  // Hitung posisi top baru berdasarkan jumlah bubble yang sudah ada
  if (allBubbles.length > 0) {
    // Terapkan posisi baru di bawah bubble terakhir
    const newTop = baseTop + (allBubbles.length * offsetHeight);
    bubble.style.top = `${newTop}vh`;
  } else {
    // Jika ini adalah bubble pertama, gunakan posisi dasar
    bubble.style.top = `${baseTop}vh`;
  }
}

// Export fungsi-fungsi yang diperlukan
window.standaloneBubble = {
  showMessage,
  showTypingIndicator,
  updateBubbleContent,
  hideBubble,
  clearAllBubbles
};
