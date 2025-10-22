# AI Spreadsheet Dashboard

A Google Sheets-like spreadsheet application with integrated AI assistance. Built with Vue.js 3 and Vite.

## Features

- **Spreadsheet Grid**: Excel-like interface with cell editing, navigation, and formula support
- **AI Integration**: Built-in AI panel with prompt-based assistance
- **Multi-API Support**: Supports OpenAI GPT, Claude, and Google Gemini APIs with automatic fallbacks
- **Real-time Analysis**: Get insights, generate formulas, and analyze data on demand
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: API keys are stored securely in your browser

## Getting Started

### Prerequisites

- Node.js 16+ or npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AI-Dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### API Setup

1. Click the "⚙️ Settings" button in the toolbar
2. Configure your API keys:
   - **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Claude**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
   - **Gemini**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

3. Test each API connection using the "Test" buttons
4. Save your settings

## Usage

### Basic Spreadsheet Operations

- **Select cells**: Click any cell to select it
- **Edit cells**: Double-click to enter edit mode, or select a cell and type in the formula bar
- **Navigate**: Use arrow keys, Tab, or click to move between cells
- **Add rows/columns**: Use the "+ Row" and "+ Column" buttons
- **Clear data**: Use the "Clear" button to reset all cells

### AI Features

1. **Select a cell** or work with the currently selected cell
2. **Enter a prompt** in the AI panel:
   - "Analyze the data in this column"
   - "Generate a formula to calculate the sum"
   - "Fill this series based on the pattern"
   - "What insights can you provide from this data?"

3. **Use quick actions** for common tasks:
   - Analyze Data: Get insights about the current area
   - Generate Formula: Create formulas based on context
   - Fill Series: Automatically continue patterns
   - Summarize: Get key statistics and summaries

### API Fallback

The application automatically tries alternative APIs if your primary choice fails:
1. Attempts your selected API first
2. Falls back to the next available API
3. Continues until all options are exhausted

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Deployment

This application is designed to be hosting-friendly and can be deployed to:

- **Vercel**: Connect your repository and deploy automatically
- **Netlify**: Drag and drop the `dist/` folder or connect to Git
- **Any static hosting**: Upload the `dist/` folder contents

## Environment Variables

API keys are stored in localStorage for security and convenience. No server-side environment variables are required.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Security Notes

- API keys are stored only in your browser's localStorage
- No API keys are sent to any server except the respective AI API endpoints
- The application runs entirely client-side
- Always keep your API keys secure and never share them

## Troubleshooting

**API Keys Not Working:**
- Ensure you have sufficient credits/quota on your AI platform
- Check that the API key has the correct permissions
- Verify the API key is copied correctly (no extra spaces)

**Build Issues:**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Ensure you're using Node.js 16 or later

**Performance Issues:**
- Large spreadsheets (1000+ cells) may impact performance
- Consider breaking large data into multiple sheets