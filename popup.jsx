import React, { useState, useEffect } from "react";

// Main Popup App Component
export default function App() {
  // State for API key, visibility, status, and toggle
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [enabled, setEnabled] = useState(true);

  // Load API key and enabled state from chrome.storage on mount
  useEffect(() => {
    chrome.storage.sync.get(["optimizerApiKey", "optimizerEnabled"], (result) => {
      if (result.optimizerApiKey) setApiKey(result.optimizerApiKey);
      if (typeof result.optimizerEnabled === "boolean") setEnabled(result.optimizerEnabled);
    });
  }, []);

  // Save API key to chrome.storage
  const saveApiKey = () => {
    setStatus("Saving...");
    chrome.storage.sync.set({ optimizerApiKey: apiKey }, () => {
      if (chrome.runtime.lastError) {
        setStatus("Error saving API key");
      } else {
        setStatus("API key saved!");
        setTimeout(() => setStatus("Ready"), 1200);
      }
    });
  };

  // Save enabled toggle to chrome.storage
  const saveEnabled = (val) => {
    setEnabled(val);
    chrome.storage.sync.set({ optimizerEnabled: val });
  };

  return (
    <div className="p-4 rounded-lg bg-white shadow-md w-full max-w-xs mx-auto">
      <h1 className="text-xl font-bold mb-2 text-gray-800">AI Prompt Optimizer</h1>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">Enable Optimization</span>
        <button
          className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-300 focus:outline-none ${enabled ? 'bg-blue-500' : 'bg-gray-200'}`}
          onClick={() => saveEnabled(!enabled)}
          aria-pressed={enabled}
        >
          <span
            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${enabled ? 'translate-x-4' : ''}`}
          />
        </button>
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Optimizer API Key</label>
        <div className="flex items-center gap-2">
          <input
            type={showKey ? "text" : "password"}
            className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            autoComplete="off"
          />
          <button
            className="text-xs text-blue-600 hover:underline"
            onClick={() => setShowKey(v => !v)}
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        <button
          className="mt-2 w-full bg-blue-600 text-white rounded py-1 font-semibold hover:bg-blue-700 transition"
          onClick={saveApiKey}
        >
          Save API Key
        </button>
      </div>
      <div className="mt-4 text-xs text-gray-500 min-h-[20px]">{status}</div>
      <div className="mt-2 text-xs text-gray-400">
        <span>Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>.</span>
      </div>
    </div>
  );
} 