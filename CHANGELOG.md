# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-19

### Added
- Initial release of AI Prompt Optimizer Chrome Extension
- Support for ChatGPT (chat.openai.com)
- Support for Google Gemini (gemini.google.com)
- Support for Perplexity AI (www.perplexity.ai)
- Automatic prompt optimization using Gemini-2.0-Flash
- Chrome extension popup with API key management
- Toggle to enable/disable optimization
- Visual feedback during optimization process
- Robust textbox and send button detection
- Error handling for API failures
- Manifest V3 compliance

### Features
- Intercepts user prompts on supported AI chatbot websites
- Sends prompts to Gemini-2.0-Flash for optimization
- Replaces original prompt with optimized version
- Automatically sends optimized prompt to the AI chatbot
- Secure API key storage using Chrome's sync storage
- Modern React-based popup interface with Tailwind CSS
- Responsive design for various screen sizes

### Technical Details
- Built with Manifest V3 for Chrome extensions
- React 18 with functional components and hooks
- Tailwind CSS for styling
- Vite for build tooling
- Comprehensive error handling and logging
- Cross-site compatibility with multiple AI platforms 