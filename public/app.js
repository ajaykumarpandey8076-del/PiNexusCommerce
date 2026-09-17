// ==========================================
// PiNexusCommerce - Compact UI & Voice State Fix
// ==========================================

function renderCommerceAssistant() {
  let assistantContainer = document.getElementById('commerce-assistant-container');
  if (!assistantContainer) {
    assistantContainer = document.createElement('div');
    assistantContainer.id = 'commerce-assistant-container';
    
    // Insert cleanly below the Global Commerce Opportunities header block, not at absolute top
    const targetEl = document.querySelector('main') || document.body;
    targetEl.insertBefore(assistantContainer, targetEl.firstChild);
  }

  assistantContainer.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold text-gray-800 text-xs flex items-center gap-1.5">
        🤖 AI Commerce Assistant
      </h3>
      <button onclick="resetCommerceRequest()" class="text-[10px] text-purple-600 hover:underline font-medium">
        Start New Request
      </button>
    </div>

    <div id="chat-messages" class="space-y-1.5 mb-2">
      ${window.chatHistory.length === 0 ? '<p class="text-gray-400 italic text-[11px]">Type or speak your requirement...</p>' : 
        window.chatHistory.map(msg => `<div><strong>${msg.sender}:</strong>${msg.text}</div>`).join('')}
    </div>

    <!-- Listening status hidden by default as requested -->
    <div id="voice-status" class="text-[10px] text-red-600 font-semibold mb-2 hidden animate-pulse">🔴 Listening... Speak now.</div>

    <div class="flex gap-2 items-center">
      <input type="text" id="assistantInput" placeholder="Type what you need..." class="flex-1 p-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-purple-600" />
      <button onclick="handleUserSubmit()" class="bg-purple-600 text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-purple-700 transition">
        Send
      </button>
      <button onclick="toggleVoiceRecording()" id="mic-btn" class="bg-gray-100 hover:bg-purple-100 text-gray-700 px-2.5 py-2 rounded-xl text-xs transition" title="Voice Command">
        🎙️ Voice
      </button>
    </div>

    <div id="smart-matches-results" class="mt-2"></div>
  `;
}

let recognition = null;
function toggleVoiceRecording() {
  const statusEl = document.getElementById('voice-status');
  const inputEl = document.getElementById('assistantInput');

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition is not supported in your browser.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  // Show listening state ONLY when active
  if (statusEl) statusEl.classList.remove('hidden');

  recognition.onresult = (event) => {
    const speechText = event.results[0][0].transcript;
    inputEl.value = speechText;
    if (statusEl) statusEl.classList.add('hidden');
  };

  recognition.onerror = () => {
    if (statusEl) statusEl.classList.add('hidden');
    alert('Voice recognition error.');
  };

  recognition.onend = () => {
    if (statusEl) statusEl.classList.add('hidden');
  };

  recognition.start();
}

