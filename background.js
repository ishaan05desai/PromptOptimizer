// background.js - Service Worker for AI Prompt Optimizer
// Handles API key storage, receives prompt optimization requests from content.js, calls Gemini-2.0-Flash, and returns optimized prompts.

// Placeholder for API key. Canvas will inject at runtime if needed.
const API_KEY = ""; // Set via popup and chrome.storage.sync

// Gemini-2.0-Flash endpoint for content generation
const OPTIMIZER_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

// Instruction for the optimizer AI
const OPTIMIZATION_INSTRUCTION = "Given the following user prompt, provide the best JSON formatting of this prompt to make it as simple as possible for an AI to understand. Focus on clarity, structure, and explicit instructions. Output only the JSON object, with no additional text or markdown formatting outside the JSON. The JSON should contain a single key, 'optimized_prompt', whose value is the rephrased prompt. If the original prompt is already clear, simply rephrase it concisely. Example: {'optimized_prompt': 'Summarize the key points of the attached document and determine its overall sentiment (positive, negative, or neutral).'}";

/**
 * Retrieve the API key from chrome.storage.sync
 * @returns {Promise<string>} The API key
 */
async function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(["optimizerApiKey"], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving API key:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else if (result.optimizerApiKey) {
        resolve(result.optimizerApiKey);
      } else {
        console.error("No API key found in storage.");
        reject("No API key found");
      }
    });
  });
}

/**
 * Optimize a user prompt using Gemini-2.0-Flash
 * @param {string} promptText - The user's original prompt
 * @param {string} apiKey - The API key for Gemini
 * @returns {Promise<string>} The optimized prompt
 */
async function optimizePrompt(promptText, apiKey) {
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${OPTIMIZATION_INSTRUCTION}\n\nOriginal Prompt: ${promptText}` }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          optimized_prompt: { type: "STRING" }
        },
        required: ["optimized_prompt"]
      }
    }
  };

  try {
    const response = await fetch(OPTIMIZER_API_URL + encodeURIComponent(apiKey), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Optimizer API error: ${response.status}`);
    }
    const data = await response.json();
    // Gemini returns the response in a nested structure; extract the JSON
    let optimized = null;
    if (data && data.candidates && data.candidates.length > 0) {
      // Try to parse the JSON from the text response
      try {
        const text = data.candidates[0].content.parts[0].text;
        const json = JSON.parse(text);
        optimized = json.optimized_prompt;
      } catch (e) {
        console.error("Failed to parse optimizer response:", e, data);
        throw new Error("Malformed response from optimizer AI");
      }
    }
    if (!optimized) {
      throw new Error("No optimized prompt found in response");
    }
    return optimized;
  } catch (err) {
    console.error("Error optimizing prompt:", err);
    throw err;
  }
}

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "optimizePrompt" && message.promptText) {
    (async () => {
      try {
        const apiKey = await getApiKey();
        const optimizedPrompt = await optimizePrompt(message.promptText, apiKey);
        sendResponse({ success: true, optimized_prompt: optimizedPrompt });
      } catch (err) {
        sendResponse({ success: false, error: err.message || err.toString() });
      }
    })();
    // Indicate async response
    return true;
  }
  // For other actions, do nothing
}); 