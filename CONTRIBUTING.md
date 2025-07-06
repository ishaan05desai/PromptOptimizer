# Contributing to AI Prompt Optimizer

Thank you for your interest in contributing to the AI Prompt Optimizer Chrome Extension! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Chrome browser for testing
- Google AI Studio API key for Gemini-2.0-Flash

### Setup
1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run package` - Create extension package

### Project Structure
```
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── content.js            # Content script
├── popup.html            # Popup HTML
├── popup.jsx             # React popup component
├── tailwind.config.js    # Tailwind CSS config
├── vite.config.js        # Build configuration
└── package.json          # Dependencies and scripts
```

## Making Changes

### Code Style
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Add JSDoc comments for functions
- Use meaningful variable and function names

### Testing
- Test on all supported platforms (ChatGPT, Gemini, Perplexity)
- Verify API key management works correctly
- Test error handling scenarios
- Ensure popup UI is responsive

### Adding New AI Platforms
1. Add the domain to `SUPPORTED_HOSTS` in `content.js`
2. Update `manifest.json` host permissions
3. Test textbox and send button detection
4. Update documentation

## Submitting Changes

1. Create a feature branch from `main`
2. Make your changes following the code style guidelines
3. Test thoroughly on supported platforms
4. Update documentation if needed
5. Submit a pull request with a clear description

### Pull Request Guidelines
- Provide a clear title and description
- Include screenshots for UI changes
- List any breaking changes
- Reference related issues

## Reporting Issues

When reporting bugs, please include:
- Chrome version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots (if applicable)

## Feature Requests

We welcome feature requests! Please:
- Describe the feature clearly
- Explain the use case
- Consider implementation complexity
- Check if it aligns with the project's goals

## Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the project's coding standards

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to AI Prompt Optimizer! 🚀 