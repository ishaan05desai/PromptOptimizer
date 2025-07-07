// popup.js - Vanilla JavaScript version of the popup UI
// This replaces popup.jsx to work without build tools

document.addEventListener('DOMContentLoaded', function() {
  // State variables
  let apiKey = '';
  let showKey = false;
  let status = 'Ready';
  let enabled = true;

  // DOM elements
  const root = document.getElementById('root');
  
  // Create the popup UI
  function createPopup() {
    root.innerHTML = `
      <div class="p-4 rounded-lg bg-white shadow-md w-full max-w-xs mx-auto">
        <h1 class="text-xl font-bold mb-2 text-gray-800">AI Prompt Optimizer</h1>
        
        <div class="mb-4 flex items-center justify-between">
          <span class="text-sm text-gray-600">Enable Optimization</span>
          <button id="toggleBtn" class="w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-300 focus:outline-none">
            <span id="toggleSlider" class="bg-white w-4 h-4 rounded-full shadow-md transform duration-300"></span>
          </button>
        </div>
        
        <div class="mb-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Optimizer API Key</label>
          <div class="flex items-center gap-2">
            <input id="apiKeyInput" type="password" class="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter your Gemini API key" autocomplete="off">
            <button id="showKeyBtn" class="text-xs text-blue-600 hover:underline">Show</button>
          </div>
          <button id="saveBtn" class="mt-2 w-full bg-blue-600 text-white rounded py-1 font-semibold hover:bg-blue-700 transition">Save API Key</button>
        </div>
        
        <div id="status" class="mt-4 text-xs text-gray-500 min-h-[20px]">${status}</div>
        
        <div class="mt-2 text-xs text-gray-400">
          <span>Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" class="underline">Google AI Studio</a>.</span>
        </div>
      </div>
    `;
  }

  // Update toggle button appearance
  function updateToggle() {
    const toggleBtn = document.getElementById('toggleBtn');
    const toggleSlider = document.getElementById('toggleSlider');
    
    if (enabled) {
      toggleBtn.classList.add('bg-blue-500');
      toggleSlider.classList.add('translate-x-4');
    } else {
      toggleBtn.classList.remove('bg-blue-500');
      toggleSlider.classList.remove('translate-x-4');
    }
  }

  // Update status display
  function updateStatus(newStatus) {
    status = newStatus;
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = status;
    }
  }

  // Load data from chrome.storage
  function loadData() {
    chrome.storage.sync.get(['optimizerApiKey', 'optimizerEnabled'], (result) => {
      if (result.optimizerApiKey) {
        apiKey = result.optimizerApiKey;
        const input = document.getElementById('apiKeyInput');
        if (input) input.value = apiKey;
      }
      if (typeof result.optimizerEnabled === 'boolean') {
        enabled = result.optimizerEnabled;
        updateToggle();
      }
    });
  }

  // Save API key
  function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    apiKey = input.value;
    
    updateStatus('Saving...');
    chrome.storage.sync.set({ optimizerApiKey: apiKey }, () => {
      if (chrome.runtime.lastError) {
        updateStatus('Error saving API key');
      } else {
        updateStatus('API key saved!');
        setTimeout(() => updateStatus('Ready'), 1200);
      }
    });
  }

  // Save enabled state
  function saveEnabled(val) {
    enabled = val;
    chrome.storage.sync.set({ optimizerEnabled: val });
    updateToggle();
  }

  // Toggle API key visibility
  function toggleKeyVisibility() {
    const input = document.getElementById('apiKeyInput');
    const btn = document.getElementById('showKeyBtn');
    
    showKey = !showKey;
    input.type = showKey ? 'text' : 'password';
    btn.textContent = showKey ? 'Hide' : 'Show';
  }

  // Event listeners
  function setupEventListeners() {
    // Toggle button
    document.getElementById('toggleBtn').addEventListener('click', () => {
      saveEnabled(!enabled);
    });

    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveApiKey);

    // Show/hide key button
    document.getElementById('showKeyBtn').addEventListener('click', toggleKeyVisibility);

    // Enter key on input
    document.getElementById('apiKeyInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveApiKey();
      }
    });
  }

  // Initialize
  createPopup();
  loadData();
  setupEventListeners();
}); 