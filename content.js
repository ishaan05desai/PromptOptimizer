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
  const anElement = () => {
    const textbox = findPromptTextbox();
    const sendButton = findSendButton();
    if (textbox && sendButton) {
      console.log("Found elements, attempting to attach listeners:", { textbox, sendButton });
      // Stop polling once elements are found
      clearInterval(intervalId);
      // Pass the found elements to the callback
      callback(textbox, sendButton);
    } else {
        console.log("Still looking for elements...");
    }
  }
  const intervalId = setInterval(anElement, 500);
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
function replaceAndSend(textbox, _sendButton, optimizedPrompt) {
  // Set value/content
  if (textbox.tagName === 'DIV' && textbox.isContentEditable) {
    textbox.innerText = optimizedPrompt;
    // Dispatch input event for React/Vue/Angular
    textbox.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    textbox.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  } else {
    textbox.value = optimizedPrompt;
    textbox.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    textbox.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }
  
  // Re-enable the textbox after filling it
  textbox.disabled = false;
  
  // **THE FIX:** Wait for the browser to repaint the UI with the new prompt text
  // before attempting to click the send button.
  requestAnimationFrame(() => {
    // A second frame wait is even more robust for complex web apps.
    requestAnimationFrame(() => {
      // Re-find the send button to get the freshest reference
      const currentSendButton = findSendButton();
      if (currentSendButton) {
        currentSendButton.click();
      } else {
        console.error("AI Prompt Optimizer: Could not find the send button to click.");
        restoreTextbox(textbox); // Restore original prompt if send fails
        alert("AI Prompt Optimizer: Could not send the optimized prompt.");
      }
    });
  });
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
      event.preventDefault();
      event.stopImmediatePropagation();
      const enabled = await isOptimizationEnabled();

      if (!enabled) {
        // Find the form and submit it directly if optimization is disabled
        const form = textbox.closest('form');
        if (form) {
            form.requestSubmit();
        } else {
            sendButton.click();
        }
        return;
      }
      
      const promptText = textbox.tagName === 'DIV' && textbox.isContentEditable
        ? textbox.innerText
        : textbox.value;
      
      if (!promptText.trim()) {
        return;
      }

      showOptimizingIndicator(textbox);
      try {
        chrome.runtime.sendMessage(
          { action: 'optimizePrompt', promptText },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log("Context invalidated, likely due to extension reload.");
              restoreTextbox(textbox);
              return;
            }
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

}

// Only run on supported sites
if (isSupportedSite()) {
  waitForInputElements((textbox, sendButton) => {
    setupPromptInterceptor(textbox, sendButton);
  });
}