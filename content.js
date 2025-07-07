// content.js - Content Script for AI Prompt Optimizer
// Injected into ChatGPT, Gemini, Perplexity, etc. Finds the prompt textbox and send button, intercepts user input, and replaces with optimized prompt.

// List of supported AI chatbot hostnames
const SUPPORTED_HOSTS = [
  "chat.openai.com",
  "gemini.google.com",
  "www.perplexity.ai"
];

/**
 * Check if current site is supported
 */
function isSupportedSite() {
  return SUPPORTED_HOSTS.includes(window.location.hostname);
}

/**
 * Check if optimization is enabled
 */
function isOptimizationEnabled() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['optimizerEnabled'], (result) => {
      resolve(result.optimizerEnabled !== false); // Default to true if not set
    });
  });
}

/**
 * Try to find the main prompt textbox on the page
 * Returns the element or null
 */
function findPromptTextbox() {
  // Try common selectors for AI chatbots
  const selectors = [
    // ChatGPT
    'textarea[data-testid="text-input"]',
    'textarea[placeholder*="message"]',
    // Gemini
    'div[contenteditable="true"][role="textbox"]',
    // Perplexity
    'input[type="text"][placeholder*="message"]',
    // Fallbacks
    'textarea',
    'input[type="text"]',
    'div[contenteditable="true"]'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

/**
 * Try to find the send button for the chat input
 * Returns the element or null
 */
function findSendButton() {
  // Try common selectors for send buttons
  const selectors = [
    'button[data-testid="send-button"]',
    'button[aria-label="Send message"]',
    'button[type="submit"]',
    'button[aria-label*="Send"]',
    'button:has(svg[aria-label*="Send"])',
    'button'
  ];
  for (const sel of selectors) {
    // Only return if button is visible and enabled
    const btn = document.querySelector(sel);
    if (btn && !btn.disabled && btn.offsetParent !== null) return btn;
  }
  return null;
}

/**
 * Poll or observe for textbox and send button
 * Calls callback(textbox, sendButton) when both are found
 */
function waitForInputElements(callback) {
  let textbox = findPromptTextbox();
  let sendButton = findSendButton();
  if (textbox && sendButton) {
    callback(textbox, sendButton);
    return;
  }
  // Use MutationObserver to watch for dynamic loading
  const observer = new MutationObserver(() => {
    textbox = findPromptTextbox();
    sendButton = findSendButton();
    if (textbox && sendButton) {
      observer.disconnect();
      callback(textbox, sendButton);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Show a temporary visual indicator in the textbox
 */
function showOptimizingIndicator(textbox) {
  if (textbox.tagName === 'DIV' && textbox.isContentEditable) {
    textbox.dataset.prev = textbox.innerText;
    textbox.innerText = 'Optimizing...';
  } else {
    textbox.dataset.prev = textbox.value;
    textbox.value = 'Optimizing...';
  }
  textbox.disabled = true;
}

/**
 * Restore the textbox to its previous value
 */
function restoreTextbox(textbox) {
  if (textbox.tagName === 'DIV' && textbox.isContentEditable) {
    textbox.innerText = textbox.dataset.prev || '';
  } else {
    textbox.value = textbox.dataset.prev || '';
  }
  textbox.disabled = false;
}

/**
 * Replace textbox content with optimized prompt and trigger send
 */
function replaceAndSend(textbox, sendButton, optimizedPrompt) {
  // Set value/content
  if (textbox.tagName === 'DIV' && textbox.isContentEditable) {
    textbox.innerText = optimizedPrompt;
    // Dispatch input event for React/Vue/Angular
    textbox.dispatchEvent(new Event('input', { bubbles: true }));
    textbox.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    textbox.value = optimizedPrompt;
    textbox.dispatchEvent(new Event('input', { bubbles: true }));
    textbox.dispatchEvent(new Event('change', { bubbles: true }));
  }
  // Click send button
  sendButton.click();
}

/**
 * Main logic: intercept input, optimize, and send
 */
function setupPromptInterceptor(textbox, sendButton) {
  // Prevent duplicate listeners
  if (textbox.dataset.optimizerAttached) return;
  textbox.dataset.optimizerAttached = 'true';

  // Intercept Enter key
  textbox.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      // Check if optimization is enabled
      const enabled = await isOptimizationEnabled();
      if (!enabled) return; // Let the default behavior happen
      
      event.preventDefault();
      const promptText = textbox.tagName === 'DIV' && textbox.isContentEditable
        ? textbox.innerText
        : textbox.value;
      if (!promptText.trim()) return;
      showOptimizingIndicator(textbox);
      try {
        chrome.runtime.sendMessage(
          { action: 'optimizePrompt', promptText },
          (response) => {
            if (response && response.success) {
              replaceAndSend(textbox, sendButton, response.optimized_prompt);
            } else {
              restoreTextbox(textbox);
              alert('Prompt optimization failed: ' + (response?.error || 'Unknown error'));
            }
          }
        );
      } catch (err) {
        restoreTextbox(textbox);
        alert('Prompt optimization error: ' + err.message);
      }
    }
  }, true);

  // Intercept send button click
  sendButton.addEventListener('click', async (event) => {
    // Check if optimization is enabled
    const enabled = await isOptimizationEnabled();
    if (!enabled) return; // Let the default behavior happen
    
    // Only intercept if textbox has value
    const promptText = textbox.tagName === 'DIV' && textbox.isContentEditable
      ? textbox.innerText
      : textbox.value;
    if (!promptText.trim()) return;
    event.preventDefault();
    showOptimizingIndicator(textbox);
    try {
      chrome.runtime.sendMessage(
        { action: 'optimizePrompt', promptText },
        (response) => {
          if (response && response.success) {
            replaceAndSend(textbox, sendButton, response.optimized_prompt);
          } else {
            restoreTextbox(textbox);
            alert('Prompt optimization failed: ' + (response?.error || 'Unknown error'));
          }
        }
      );
    } catch (err) {
      restoreTextbox(textbox);
      alert('Prompt optimization error: ' + err.message);
    }
  }, true);
}

// Only run on supported sites
if (isSupportedSite()) {
  waitForInputElements((textbox, sendButton) => {
    setupPromptInterceptor(textbox, sendButton);
  });
} 