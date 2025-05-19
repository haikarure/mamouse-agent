// Voice Tabs Manager
// Menangani tab di menu voice settings

document.addEventListener('DOMContentLoaded', () => {
  // Dapatkan semua tab dan konten tab
  const voiceTabs = document.querySelectorAll('.voice-tab');
  const voiceTabContents = document.querySelectorAll('.voice-tab-content');
  
  // Dapatkan elemen-elemen voice settings
  const voiceActivationToggle = document.getElementById('voice-activation-toggle');
  const voiceActivationToggleText = document.getElementById('voice-activation-toggle-text');
  const wakeWordToggle = document.getElementById('wake-word-toggle');
  const wakeWordToggleText = document.getElementById('wake-word-toggle-text');
  const wakeWordsInput = document.getElementById('wake-words');
  const micSensitivity = document.getElementById('mic-sensitivity');
  const micSensitivityValue = document.getElementById('mic-sensitivity-value');
  const speechLanguage = document.getElementById('speech-language');
  const autoDetectLanguageToggle = document.getElementById('auto-detect-language-toggle');
  const autoDetectLanguageToggleText = document.getElementById('auto-detect-language-toggle-text');
  
  // TTS elements
  const ttsToggle = document.getElementById('tts-toggle');
  const ttsToggleText = document.getElementById('tts-toggle-text');
  const elevenLabsApiKey = document.getElementById('elevenlabs-api-key');
  const validateElevenLabsApiKeyBtn = document.getElementById('validate-elevenlabs-api-key-btn');
  const voiceGenderMale = document.getElementById('voice-gender-male');
  const voiceGenderFemale = document.getElementById('voice-gender-female');
  const elevenLabsVoice = document.getElementById('elevenlabs-voice');
  const testVoiceBtn = document.getElementById('test-voice-btn');
  const ttsSpeed = document.getElementById('tts-speed');
  const ttsSpeedValue = document.getElementById('tts-speed-value');
  const ttsPitch = document.getElementById('tts-pitch');
  const ttsPitchValue = document.getElementById('tts-pitch-value');
  const ttsVolume = document.getElementById('tts-volume');
  const ttsVolumeValue = document.getElementById('tts-volume-value');
  
  // Conversation elements
  const continuousConversationToggle = document.getElementById('continuous-conversation-toggle');
  const continuousConversationToggleText = document.getElementById('continuous-conversation-toggle-text');
  const autoRespondToggle = document.getElementById('auto-respond-toggle');
  const autoRespondToggleText = document.getElementById('auto-respond-toggle-text');
  const conversationTimeout = document.getElementById('conversation-timeout');
  const conversationTimeoutValue = document.getElementById('conversation-timeout-value');
  const saveConversationToggle = document.getElementById('save-conversation-toggle');
  const saveConversationToggleText = document.getElementById('save-conversation-toggle-text');
  const conversationFolder = document.getElementById('conversation-folder');
  const browseFolderBtn = document.getElementById('browse-folder-btn');
  
  // Reset button
  const resetVoiceSettingsBtn = document.getElementById('reset-voice-settings-btn');
  
  // Status message
  const voiceStatus = document.getElementById('voice-status');
  
  // Tambahkan event listener untuk tab
  voiceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Hapus class active dari semua tab
      voiceTabs.forEach(t => t.classList.remove('active'));
      
      // Tambahkan class active ke tab yang diklik
      tab.classList.add('active');
      
      // Dapatkan tab yang aktif
      const activeTab = tab.dataset.tab;
      
      // Sembunyikan semua konten tab
      voiceTabContents.forEach(content => content.classList.remove('active'));
      
      // Tampilkan konten tab yang aktif
      document.getElementById(`${activeTab}-tab`).classList.add('active');
    });
  });
  
  // Fungsi untuk menampilkan status
  function showStatus(type, message, duration = 3000) {
    if (!voiceStatus) return;
    
    // Hapus semua class status
    voiceStatus.classList.remove('success', 'error', 'info');
    
    // Tambahkan class yang sesuai
    voiceStatus.classList.add(type);
    
    // Set pesan
    voiceStatus.textContent = message;
    
    // Tampilkan status
    voiceStatus.style.display = 'block';
    
    // Sembunyikan setelah durasi tertentu
    if (duration > 0) {
      setTimeout(() => {
        voiceStatus.style.display = 'none';
      }, duration);
    }
  }
  
  // Event listener untuk voice activation toggle
  if (voiceActivationToggle) {
    voiceActivationToggle.addEventListener('change', () => {
      const isActive = voiceActivationToggle.checked;
      if (voiceActivationToggleText) {
        voiceActivationToggleText.textContent = isActive ? 'Aktif' : 'Nonaktif';
      }
      
      // Simpan ke localStorage
      localStorage.setItem('voiceActivation', isActive);
      
      // Update UI
      if (wakeWordToggle) {
        wakeWordToggle.disabled = !isActive;
      }
      if (wakeWordsInput) {
        wakeWordsInput.disabled = !isActive || !wakeWordToggle.checked;
      }
      
      showStatus('info', `Voice activation ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }
  
  // Event listener untuk wake word toggle
  if (wakeWordToggle) {
    wakeWordToggle.addEventListener('change', () => {
      const isActive = wakeWordToggle.checked;
      if (wakeWordToggleText) {
        wakeWordToggleText.textContent = isActive ? 'Aktif' : 'Nonaktif';
      }
      
      // Simpan ke localStorage
      localStorage.setItem('wakeWordDetection', isActive);
      
      // Update UI
      if (wakeWordsInput) {
        wakeWordsInput.disabled = !isActive || !voiceActivationToggle.checked;
      }
      
      showStatus('info', `Wake word detection ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }
  
  // Event listener untuk wake words input
  if (wakeWordsInput) {
    wakeWordsInput.addEventListener('change', () => {
      // Simpan ke localStorage
      localStorage.setItem('wakeWords', wakeWordsInput.value);
      
      showStatus('info', 'Wake words disimpan');
    });
  }
  
  // Event listener untuk mic sensitivity
  if (micSensitivity) {
    micSensitivity.addEventListener('input', () => {
      if (micSensitivityValue) {
        micSensitivityValue.textContent = micSensitivity.value;
      }
      
      // Simpan ke localStorage
      localStorage.setItem('micSensitivity', micSensitivity.value);
    });
  }
  
  // Event listener untuk speech language
  if (speechLanguage) {
    speechLanguage.addEventListener('change', () => {
      // Simpan ke localStorage
      localStorage.setItem('speechLanguage', speechLanguage.value);
      
      showStatus('info', `Bahasa pengenalan suara diubah ke ${speechLanguage.options[speechLanguage.selectedIndex].text}`);
    });
  }
  
  // Event listener untuk auto detect language toggle
  if (autoDetectLanguageToggle) {
    autoDetectLanguageToggle.addEventListener('change', () => {
      const isActive = autoDetectLanguageToggle.checked;
      if (autoDetectLanguageToggleText) {
        autoDetectLanguageToggleText.textContent = isActive ? 'Aktif' : 'Nonaktif';
      }
      
      // Simpan ke localStorage
      localStorage.setItem('autoDetectLanguage', isActive);
      
      // Update UI
      if (speechLanguage) {
        speechLanguage.disabled = isActive;
      }
      
      showStatus('info', `Deteksi otomatis bahasa ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }
  
  // Event listener untuk tts toggle
  if (ttsToggle) {
    ttsToggle.addEventListener('change', () => {
      const isActive = ttsToggle.checked;
      if (ttsToggleText) {
        ttsToggleText.textContent = isActive ? 'Aktif' : 'Nonaktif';
      }
      
      // Simpan ke localStorage
      localStorage.setItem('ttsEnabled', isActive);
      
      showStatus('info', `Text-to-speech ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }
  
  // Event listener untuk voice gender
  if (voiceGenderMale && voiceGenderFemale) {
    voiceGenderMale.addEventListener('change', () => {
      if (voiceGenderMale.checked) {
        // Simpan ke localStorage
        localStorage.setItem('voiceGender', 'male');
        
        // Update UI
        updateVoiceOptions('male');
      }
    });
    
    voiceGenderFemale.addEventListener('change', () => {
      if (voiceGenderFemale.checked) {
        // Simpan ke localStorage
        localStorage.setItem('voiceGender', 'female');
        
        // Update UI
        updateVoiceOptions('female');
      }
    });
  }
  
  // Fungsi untuk update opsi suara berdasarkan gender
  function updateVoiceOptions(gender) {
    if (!elevenLabsVoice) return;
    
    // Sembunyikan semua optgroup
    const maleVoices = document.getElementById('male-voices');
    const femaleVoices = document.getElementById('female-voices');
    
    if (maleVoices && femaleVoices) {
      if (gender === 'male') {
        maleVoices.style.display = 'block';
        femaleVoices.style.display = 'none';
        
        // Pilih suara pria pertama
        if (maleVoices.querySelector('option')) {
          elevenLabsVoice.value = maleVoices.querySelector('option').value;
        }
      } else {
        maleVoices.style.display = 'none';
        femaleVoices.style.display = 'block';
        
        // Pilih suara wanita pertama
        if (femaleVoices.querySelector('option')) {
          elevenLabsVoice.value = femaleVoices.querySelector('option').value;
        }
      }
      
      // Simpan ke localStorage
      localStorage.setItem('elevenLabsVoice', elevenLabsVoice.value);
    }
  }
  
  // Event listener untuk test voice button
  if (testVoiceBtn) {
    testVoiceBtn.addEventListener('click', () => {
      // TODO: Implementasi test voice
      showStatus('info', 'Fitur test voice akan segera tersedia');
    });
  }
  
  // Event listener untuk tts speed
  if (ttsSpeed) {
    ttsSpeed.addEventListener('input', () => {
      if (ttsSpeedValue) {
        ttsSpeedValue.textContent = ttsSpeed.value;
      }
      
      // Simpan ke localStorage
      localStorage.setItem('ttsSpeed', ttsSpeed.value);
    });
  }
  
  // Event listener untuk tts pitch
  if (ttsPitch) {
    ttsPitch.addEventListener('input', () => {
      if (ttsPitchValue) {
        ttsPitchValue.textContent = ttsPitch.value;
      }
      
      // Simpan ke localStorage
      localStorage.setItem('ttsPitch', ttsPitch.value);
    });
  }
  
  // Event listener untuk tts volume
  if (ttsVolume) {
    ttsVolume.addEventListener('input', () => {
      if (ttsVolumeValue) {
        ttsVolumeValue.textContent = ttsVolume.value;
      }
      
      // Simpan ke localStorage
      localStorage.setItem('ttsVolume', ttsVolume.value);
    });
  }
  
  // Event listener untuk continuous conversation toggle
  if (continuousConversationToggle) {
    continuousConversationToggle.addEventListener('change', () => {
      const isActive = continuousConversationToggle.checked;
      if (continuousConversationToggleText) {
        continuousConversationToggleText.textContent = isActive ? 'Aktif' : 'Nonaktif';
      }
      
      // Simpan ke localStorage
      localStorage.setItem('continuousConversation', isActive);
      
      showStatus('info', `Percakapan berkelanjutan ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }
  
  // Event listener untuk auto respond toggle
  if (autoRespondToggle) {
    autoRespondToggle.addEventListener('change', () => {
      const isActive = autoRespondToggle.checked;
      if (autoRespondToggleText) {
        autoRespondToggleText.textContent = isActive ? 'Aktif' : 'Nonaktif';
      }
      
      // Simpan ke localStorage
      localStorage.setItem('autoRespond', isActive);
      
      showStatus('info', `Respons otomatis ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }
  
  // Event listener untuk conversation timeout
  if (conversationTimeout) {
    conversationTimeout.addEventListener('input', () => {
      if (conversationTimeoutValue) {
        conversationTimeoutValue.textContent = conversationTimeout.value;
      }
      
      // Simpan ke localStorage
      localStorage.setItem('conversationTimeout', conversationTimeout.value);
    });
  }
  
  // Event listener untuk save conversation toggle
  if (saveConversationToggle) {
    saveConversationToggle.addEventListener('change', () => {
      const isActive = saveConversationToggle.checked;
      if (saveConversationToggleText) {
        saveConversationToggleText.textContent = isActive ? 'Aktif' : 'Nonaktif';
      }
      
      // Simpan ke localStorage
      localStorage.setItem('saveConversation', isActive);
      
      // Update UI
      if (conversationFolder) {
        conversationFolder.disabled = !isActive;
      }
      if (browseFolderBtn) {
        browseFolderBtn.disabled = !isActive;
      }
      
      showStatus('info', `Simpan transkripsi percakapan ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    });
  }
  
  // Event listener untuk browse folder button
  if (browseFolderBtn) {
    browseFolderBtn.addEventListener('click', () => {
      // TODO: Implementasi browse folder
      showStatus('info', 'Fitur browse folder akan segera tersedia');
    });
  }
  
  // Event listener untuk reset button
  if (resetVoiceSettingsBtn) {
    resetVoiceSettingsBtn.addEventListener('click', () => {
      // Reset semua pengaturan ke default
      resetVoiceSettings();
      
      showStatus('success', 'Pengaturan suara telah direset ke default');
    });
  }
  
  // Fungsi untuk reset voice settings
  function resetVoiceSettings() {
    // Speech Recognition
    if (voiceActivationToggle) {
      voiceActivationToggle.checked = true;
      if (voiceActivationToggleText) {
        voiceActivationToggleText.textContent = 'Aktif';
      }
    }
    
    if (wakeWordToggle) {
      wakeWordToggle.checked = true;
      if (wakeWordToggleText) {
        wakeWordToggleText.textContent = 'Aktif';
      }
    }
    
    if (wakeWordsInput) {
      wakeWordsInput.value = 'hey mamouse, hai mamouse, halo mamouse, ok mamouse';
      wakeWordsInput.disabled = false;
    }
    
    if (micSensitivity) {
      micSensitivity.value = '0.7';
      if (micSensitivityValue) {
        micSensitivityValue.textContent = '0.7';
      }
    }
    
    if (speechLanguage) {
      speechLanguage.value = 'id-ID';
      speechLanguage.disabled = false;
    }
    
    if (autoDetectLanguageToggle) {
      autoDetectLanguageToggle.checked = false;
      if (autoDetectLanguageToggleText) {
        autoDetectLanguageToggleText.textContent = 'Nonaktif';
      }
    }
    
    // Text-to-Speech
    if (ttsToggle) {
      ttsToggle.checked = true;
      if (ttsToggleText) {
        ttsToggleText.textContent = 'Aktif';
      }
    }
    
    if (voiceGenderMale) {
      voiceGenderMale.checked = true;
      updateVoiceOptions('male');
    }
    
    if (ttsSpeed) {
      ttsSpeed.value = '1.0';
      if (ttsSpeedValue) {
        ttsSpeedValue.textContent = '1.0';
      }
    }
    
    if (ttsPitch) {
      ttsPitch.value = '1.0';
      if (ttsPitchValue) {
        ttsPitchValue.textContent = '1.0';
      }
    }
    
    if (ttsVolume) {
      ttsVolume.value = '1.0';
      if (ttsVolumeValue) {
        ttsVolumeValue.textContent = '1.0';
      }
    }
    
    // Conversation
    if (continuousConversationToggle) {
      continuousConversationToggle.checked = true;
      if (continuousConversationToggleText) {
        continuousConversationToggleText.textContent = 'Aktif';
      }
    }
    
    if (autoRespondToggle) {
      autoRespondToggle.checked = true;
      if (autoRespondToggleText) {
        autoRespondToggleText.textContent = 'Aktif';
      }
    }
    
    if (conversationTimeout) {
      conversationTimeout.value = '10';
      if (conversationTimeoutValue) {
        conversationTimeoutValue.textContent = '10';
      }
    }
    
    if (saveConversationToggle) {
      saveConversationToggle.checked = false;
      if (saveConversationToggleText) {
        saveConversationToggleText.textContent = 'Nonaktif';
      }
    }
    
    if (conversationFolder) {
      conversationFolder.value = '';
      conversationFolder.disabled = true;
    }
    
    if (browseFolderBtn) {
      browseFolderBtn.disabled = true;
    }
    
    // Simpan semua pengaturan ke localStorage
    localStorage.setItem('voiceActivation', true);
    localStorage.setItem('wakeWordDetection', true);
    localStorage.setItem('wakeWords', 'hey mamouse, hai mamouse, halo mamouse, ok mamouse');
    localStorage.setItem('micSensitivity', '0.7');
    localStorage.setItem('speechLanguage', 'id-ID');
    localStorage.setItem('autoDetectLanguage', false);
    localStorage.setItem('ttsEnabled', true);
    localStorage.setItem('voiceGender', 'male');
    localStorage.setItem('ttsSpeed', '1.0');
    localStorage.setItem('ttsPitch', '1.0');
    localStorage.setItem('ttsVolume', '1.0');
    localStorage.setItem('continuousConversation', true);
    localStorage.setItem('autoRespond', true);
    localStorage.setItem('conversationTimeout', '10');
    localStorage.setItem('saveConversation', false);
    localStorage.setItem('conversationFolder', '');
  }
  
  // Load settings from localStorage
  function loadVoiceSettings() {
    // Speech Recognition
    if (voiceActivationToggle) {
      const voiceActivation = localStorage.getItem('voiceActivation');
      voiceActivationToggle.checked = voiceActivation === null ? true : voiceActivation === 'true';
      if (voiceActivationToggleText) {
        voiceActivationToggleText.textContent = voiceActivationToggle.checked ? 'Aktif' : 'Nonaktif';
      }
    }
    
    if (wakeWordToggle) {
      const wakeWordDetection = localStorage.getItem('wakeWordDetection');
      wakeWordToggle.checked = wakeWordDetection === null ? true : wakeWordDetection === 'true';
      if (wakeWordToggleText) {
        wakeWordToggleText.textContent = wakeWordToggle.checked ? 'Aktif' : 'Nonaktif';
      }
    }
    
    if (wakeWordsInput) {
      const wakeWords = localStorage.getItem('wakeWords');
      if (wakeWords) {
        wakeWordsInput.value = wakeWords;
      }
      wakeWordsInput.disabled = !voiceActivationToggle.checked || !wakeWordToggle.checked;
    }
    
    if (micSensitivity) {
      const sensitivity = localStorage.getItem('micSensitivity');
      if (sensitivity) {
        micSensitivity.value = sensitivity;
        if (micSensitivityValue) {
          micSensitivityValue.textContent = sensitivity;
        }
      }
    }
    
    if (speechLanguage) {
      const language = localStorage.getItem('speechLanguage');
      if (language) {
        speechLanguage.value = language;
      }
    }
    
    if (autoDetectLanguageToggle) {
      const autoDetect = localStorage.getItem('autoDetectLanguage');
      autoDetectLanguageToggle.checked = autoDetect === 'true';
      if (autoDetectLanguageToggleText) {
        autoDetectLanguageToggleText.textContent = autoDetectLanguageToggle.checked ? 'Aktif' : 'Nonaktif';
      }
      if (speechLanguage) {
        speechLanguage.disabled = autoDetectLanguageToggle.checked;
      }
    }
    
    // Text-to-Speech
    if (ttsToggle) {
      const ttsEnabled = localStorage.getItem('ttsEnabled');
      ttsToggle.checked = ttsEnabled === null ? true : ttsEnabled === 'true';
      if (ttsToggleText) {
        ttsToggleText.textContent = ttsToggle.checked ? 'Aktif' : 'Nonaktif';
      }
    }
    
    if (voiceGenderMale && voiceGenderFemale) {
      const gender = localStorage.getItem('voiceGender');
      if (gender === 'female') {
        voiceGenderFemale.checked = true;
        voiceGenderMale.checked = false;
        updateVoiceOptions('female');
      } else {
        voiceGenderMale.checked = true;
        voiceGenderFemale.checked = false;
        updateVoiceOptions('male');
      }
    }
    
    if (elevenLabsVoice) {
      const voice = localStorage.getItem('elevenLabsVoice');
      if (voice) {
        elevenLabsVoice.value = voice;
      }
    }
    
    if (ttsSpeed) {
      const speed = localStorage.getItem('ttsSpeed');
      if (speed) {
        ttsSpeed.value = speed;
        if (ttsSpeedValue) {
          ttsSpeedValue.textContent = speed;
        }
      }
    }
    
    if (ttsPitch) {
      const pitch = localStorage.getItem('ttsPitch');
      if (pitch) {
        ttsPitch.value = pitch;
        if (ttsPitchValue) {
          ttsPitchValue.textContent = pitch;
        }
      }
    }
    
    if (ttsVolume) {
      const volume = localStorage.getItem('ttsVolume');
      if (volume) {
        ttsVolume.value = volume;
        if (ttsVolumeValue) {
          ttsVolumeValue.textContent = volume;
        }
      }
    }
    
    // Conversation
    if (continuousConversationToggle) {
      const continuous = localStorage.getItem('continuousConversation');
      continuousConversationToggle.checked = continuous === null ? true : continuous === 'true';
      if (continuousConversationToggleText) {
        continuousConversationToggleText.textContent = continuousConversationToggle.checked ? 'Aktif' : 'Nonaktif';
      }
    }
    
    if (autoRespondToggle) {
      const autoRespond = localStorage.getItem('autoRespond');
      autoRespondToggle.checked = autoRespond === null ? true : autoRespond === 'true';
      if (autoRespondToggleText) {
        autoRespondToggleText.textContent = autoRespondToggle.checked ? 'Aktif' : 'Nonaktif';
      }
    }
    
    if (conversationTimeout) {
      const timeout = localStorage.getItem('conversationTimeout');
      if (timeout) {
        conversationTimeout.value = timeout;
        if (conversationTimeoutValue) {
          conversationTimeoutValue.textContent = timeout;
        }
      }
    }
    
    if (saveConversationToggle) {
      const saveConversation = localStorage.getItem('saveConversation');
      saveConversationToggle.checked = saveConversation === 'true';
      if (saveConversationToggleText) {
        saveConversationToggleText.textContent = saveConversationToggle.checked ? 'Aktif' : 'Nonaktif';
      }
    }
    
    if (conversationFolder) {
      const folder = localStorage.getItem('conversationFolder');
      if (folder) {
        conversationFolder.value = folder;
      }
      conversationFolder.disabled = !saveConversationToggle.checked;
    }
    
    if (browseFolderBtn) {
      browseFolderBtn.disabled = !saveConversationToggle.checked;
    }
  }
  
  // Load settings saat halaman dimuat
  loadVoiceSettings();
});
