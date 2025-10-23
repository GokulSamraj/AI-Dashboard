# Google Sheets Data Analyzer

A modern Vue.js web application that allows you to paste Google Sheets data and analyze it using AI models from OpenAI and Google Gemini, with automatic fallback support.

## Features

- 📊 **Easy Data Input**: Simply paste your Google Sheets data (tab-separated or CSV format)
- 🤖 **AI-Powered Analysis**: Use natural language prompts to analyze your data with OpenAI and Gemini APIs
- 🔄 **Automatic Fallback**: Tries OpenAI first, automatically falls back to Gemini if needed
- 🔐 **Secure Configuration**: API keys are configured via environment variables
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Analysis**: Get instant insights from your spreadsheet data
- 📋 **Copy Results**: Easily copy analysis results to clipboard
- 🚀 **Modern Stack**: Built with Vue.js 3 and Vite for fast development
- 🔧 **Easy Deployment**: One-click deployment to Vercel

## Quick Start

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AI-Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your API keys to .env file (you can configure one or both)
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:3000`

### Option 2: One-Click Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

## Environment Setup

### 1. Get Your API Keys

#### OpenAI API Key (Primary)
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in with your OpenAI account
3. Click "Create new secret key"
4. Copy your API key

#### Gemini API Key (Fallback)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables

Create a `.env` file in the root directory:
```env
# OpenAI API Key (Primary) - Recommended
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Gemini API Key (Fallback) - Optional
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:**
- At least one API key is required
- You can configure both for automatic fallback support
- OpenAI is tried first, Gemini is used as fallback

**For Vercel Deployment:**
- Add `VITE_OPENAI_API_KEY` and/or `VITE_GEMINI_API_KEY` as environment variables
- The app will work with just one API key configured

## How to Use

1. **Paste Your Data**: Copy data from Google Sheets and paste it into the textarea
   - Copy directly from Google Sheets (tab-separated format)
   - Or export as CSV and paste (comma-separated format)

2. **Enter Your Analysis Request**: Type what you want to know about your data
   - "Analyze sales trends across cities"
   - "Which product performs best?"
   - "Find patterns in the data"
   - "Create a summary report"

3. **Analyze**: Click the "Analyze Data" button or press `Ctrl+Enter`

   The app will automatically try OpenAI first, and if it fails, will fall back to Gemini (if configured).

**Note:** At least one API key should be configured in your `.env` file before starting the application.

## Example Usage

### Sample Data
```
Name	Age	City	Sales	Product
John Doe	28	New York	15000	Product A
Jane Smith	34	Los Angeles	22000	Product B
Mike Johnson	45	Chicago	18000	Product A
Sarah Wilson	29	Houston	25000	Product C
Tom Brown	38	Phoenix	20000	Product B
```

### Sample Prompts
- "Analyze sales trends across cities"
- "Which product performs best?"
- "Find correlations between age and sales"
- "Create a summary report of top performers"
- "Identify any outliers in the data"

## Technical Stack

- **Frontend**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **Styling**: CSS3 with responsive design
- **API**: OpenAI GPT-4o-mini API with Gemini 2.0 Flash fallback
- **Deployment**: Vercel

## File Structure

```
├── src/
│   ├── components/          # Vue components
│   ├── services/           # API services
│   │   └── api.js          # OpenAI, Gemini, and fallback API services
│   ├── App.vue             # Main application component
│   ├── main.js             # Application entry point
│   └── style.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── vercel.json             # Vercel deployment config
├── .env.example            # Environment variables template
└── README.md               # This documentation
```

## CORS Issues

This application has been optimized to avoid CORS issues by:
- Using proper API endpoint structure
- Implementing correct headers for API requests
- Supporting both development and production environments

## API Endpoint Issues

The application has built-in fallback support, but if you encounter issues:

### Primary API (OpenAI)
1. **Check API Key**: Ensure your OpenAI API key is valid and active
2. **Model Availability**: OpenAI may update available models
3. **Current Model**: The app uses `gpt-4o-mini` model with `v1` API

### Fallback API (Gemini)
1. **Check API Key**: Ensure your Gemini API key is valid and active
2. **Model Availability**: Google may update available models
3. **Current Model**: The app uses `gemini-2.0-flash-exp` model

### Alternative Models
If issues persist, you can modify `src/services/api.js`:

**OpenAI models:**
- `gpt-4` (more capable model)
- `gpt-4-turbo` (latest GPT-4 model)
- `gpt-3.5-turbo` (older, cheaper model)

**Gemini models:**
- `gemini-pro` (stable model)
- `gemini-1.5-flash` (faster model)

### How Fallback Works
- **First attempt**: OpenAI API (if key is configured)
- **Automatic fallback**: Gemini API (if OpenAI fails and Gemini key is configured)
- **Error reporting**: Check browser console for detailed error messages

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**
2. **Connect your repository to Vercel**
3. **Set environment variables** in Vercel dashboard:
   - `VITE_OPENAI_API_KEY`: Your OpenAI API key (recommended)
   - `VITE_GEMINI_API_KEY`: Your Gemini API key (optional fallback)
4. **Deploy** - Vercel will automatically build and deploy your app

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to any static hosting service

## Security & Privacy

- **Client-side only**: All processing happens in the browser
- **API key configuration**: API keys are configured via environment variables (not exposed to users)
- **Automatic fallback**: Built-in redundancy with multiple AI providers
- **No data logging**: No data is sent to any server except the configured AI APIs
- **Secure API calls**: All API calls use HTTPS
- **Environment variables**: Sensitive keys are properly managed at build time

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

## Troubleshooting

### Common Issues

1. **"Invalid API key" or "No API keys configured"**
   - Ensure you've copied the correct API keys from OpenAI Platform and/or Google AI Studio
   - Check that you haven't included extra spaces
   - Verify environment variables are set correctly for deployment
   - At least one API key (OpenAI or Gemini) must be configured

2. **API fails with fallback errors**
   - Check browser console for detailed error messages
   - Ensure at least one API key is valid and has available quota
   - The app will show which API failed and which succeeded

3. **"No data found"**
   - Make sure you've pasted actual spreadsheet data
   - Check that your data has headers and at least one data row

4. **"API Error"**
   - Check your internet connection
   - Verify at least one API key is valid and has quota
   - Check browser console for which API failed
   - The app will automatically try the fallback API

5. **Build/Deploy Issues**
   - Ensure all dependencies are installed: `npm install`
   - Check that environment variables are properly configured
   - Verify your `vercel.json` configuration

### Tips

- **Keyboard shortcut**: Use `Ctrl+Enter` (or `Cmd+Enter` on Mac) to quickly analyze
- **Large datasets**: For best results, limit to a few hundred rows
- **Specific prompts**: More specific prompts give better results
- **Data format**: Ensure your data is clean with consistent column headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.