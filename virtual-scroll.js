// Virtual Scrolling untuk Bubble Chat

// Variabel untuk melacak posisi scroll virtual
let virtualScrollTop = 0;
let contentHeight = 0;
let viewportHeight = 0;
let contentArea = null;
let bubbleSpacing = 5; // Jarak antar bubble dalam pixel (dikurangi dari 10px menjadi 5px)

// Inisialisasi virtual scrolling
function initVirtualScroll() {
  contentArea = document.getElementById('bubble-content-area');
  if (!contentArea) return;

  // Ukuran viewport
  viewportHeight = contentArea.clientHeight;

  // Tambahkan event listener untuk wheel
  document.addEventListener('wheel', handleWheel, { passive: false });

  // Tambahkan event listener untuk keyboard
  document.addEventListener('keydown', handleKeyDown);
}

// Fungsi untuk memposisikan semua bubble berdasarkan virtualScrollTop
function positionBubbles() {
  const bubbles = document.querySelectorAll('.standalone-bubble');
  bubbles.forEach(bubble => {
    if (bubble.dataset.originalTop) {
      const originalTop = parseInt(bubble.dataset.originalTop, 10);
      bubble.style.top = (originalTop - virtualScrollTop) + 'px';
    }
  });
}

// Fungsi untuk menambahkan bubble baru
function addBubbleToVirtualScroll(bubble, isUser) {
  if (!contentArea) return;

  // Tambahkan ke DOM terlebih dahulu agar bisa mendapatkan ukuran yang benar
  contentArea.appendChild(bubble);

  // Reposisi semua bubble untuk memastikan posisi yang rapi
  repositionAllBubbles();

  // Update contentHeight
  updateContentHeight();

  // Auto-scroll ke bubble terbaru
  scrollToBottom();

  return bubble;
}

// Fungsi untuk scroll ke bawah
function scrollToBottom() {
  // Atur virtualScrollTop ke 0 untuk menampilkan bubble dari atas
  virtualScrollTop = 0;

  // Posisikan ulang semua bubble
  positionBubbles();
}

// Handle wheel event
function handleWheel(e) {
  if (isMouseOverContent(e)) {
    e.preventDefault();
    virtualScrollTop = Math.max(0, Math.min(contentHeight - viewportHeight, virtualScrollTop + e.deltaY * 0.5));
    positionBubbles();
  }
}

// Handle keyboard event
function handleKeyDown(e) {
  if (e.key === 'PageUp') {
    virtualScrollTop = Math.max(0, virtualScrollTop - viewportHeight * 0.8);
    positionBubbles();
  } else if (e.key === 'PageDown') {
    virtualScrollTop = Math.min(contentHeight - viewportHeight, virtualScrollTop + viewportHeight * 0.8);
    positionBubbles();
  } else if (e.key === 'Home') {
    virtualScrollTop = 0;
    positionBubbles();
  } else if (e.key === 'End') {
    scrollToBottom();
  }
}

// Fungsi untuk memeriksa apakah mouse berada di atas area konten
function isMouseOverContent(e) {
  if (!contentArea) return false;

  const rect = contentArea.getBoundingClientRect();
  return (
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  );
}

// Fungsi untuk menghapus bubble dari virtual scroll
function removeBubbleFromVirtualScroll(bubble) {
  if (!contentArea || !bubble) return;

  // Hapus bubble dari DOM
  if (contentArea.contains(bubble)) {
    contentArea.removeChild(bubble);
  }

  // Reposisi semua bubble yang tersisa
  repositionAllBubbles();

  // Update contentHeight
  updateContentHeight();
}

// Fungsi untuk memperbarui contentHeight
function updateContentHeight() {
  const bubbles = document.querySelectorAll('.standalone-bubble');
  contentHeight = 0;

  bubbles.forEach(bubble => {
    if (bubble.dataset.originalTop) {
      const originalTop = parseInt(bubble.dataset.originalTop, 10);
      contentHeight = Math.max(contentHeight, originalTop + bubble.offsetHeight);
    }
  });

  // Tambahkan padding bawah
  contentHeight += 20;
}

// Fungsi untuk reposisi semua bubble
function repositionAllBubbles() {
  const bubbles = Array.from(document.querySelectorAll('.standalone-bubble'));

  // Urutkan bubble berdasarkan timestamp
  bubbles.sort((a, b) => {
    const aTime = parseInt(a.dataset.timestamp || '0', 10);
    const bTime = parseInt(b.dataset.timestamp || '0', 10);
    return aTime - bTime;
  });

  // Gunakan jarak yang lebih konsisten
  const fixedSpacing = 5; // Jarak yang lebih kecil dan konsisten
  let currentTop = 5; // Margin atas yang lebih kecil untuk bubble pertama

  // Reposisi semua bubble dengan jarak yang konsisten
  bubbles.forEach(bubble => {
    // Pastikan bubble terlihat
    bubble.style.opacity = '1';
    bubble.style.visibility = 'visible';

    // Atur posisi
    bubble.dataset.originalTop = currentTop;
    bubble.style.top = (currentTop - virtualScrollTop) + 'px';

    // Tambahkan tinggi bubble dan jarak tetap
    currentTop += bubble.offsetHeight + fixedSpacing;
  });
}

// Inisialisasi saat DOM dimuat
document.addEventListener('DOMContentLoaded', initVirtualScroll);

// Export fungsi-fungsi yang diperlukan
window.virtualScroll = {
  addBubble: addBubbleToVirtualScroll,
  removeBubble: removeBubbleFromVirtualScroll,
  scrollToBottom: scrollToBottom
};
