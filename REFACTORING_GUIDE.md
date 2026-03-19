# MetaAnalysis Pro — Refactored Structure

## 📁 Project Structure

```
Claude-sysrevmet/
├── index.html          # Main HTML file (clean structure)
├── css/
│   └── style.css       # All styles extracted here
├── js/
│   ├── main.js         # Main application module (ES Module)
│   ├── state.js        # State management module
│   ├── firebase-config.js  # Firebase configuration
│   └── legacy-compat.js    # Legacy functions (to be migrated)
└── README.md           # This file
```

## 🎯 Refactoring Summary

### Completed
1. ✅ **CSS Extraction** - All styles from `<style>` tags moved to `css/style.css`
2. ✅ **Firebase Config** - Created modular Firebase configuration in `js/firebase-config.js`
3. ✅ **State Management** - Centralized state in `js/state.js` with ES Module exports
4. ✅ **Main Application** - Core functions in `js/main.js` using ES Modules
5. ✅ **Clean HTML** - Restructured `index.html` with proper module imports

### TODO: Migration Needed
The following functions from the original `index.html` need to be migrated to modular files:

- **Search Functions** (PubMed, Europe PMC, Semantic Scholar, CORE, CrossRef)
- **PICO Builder** (Boolean query builder)
- **AI Extractor** (Groq API integration)
- **Statistics** (Meta-analysis calculations)
- **Forest Plot** (D3.js rendering)
- **Funnel Plot** (Visualization)
- **GRADE** (Certainty assessment)
- **RoB Assessment** (Risk of Bias tools)
- **Report Generation** (Export functions)

## 🔧 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Get your configuration from Project Settings
4. Update `js/firebase-config.js` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 🚀 Usage

### Local Development
Due to ES Modules, you need to serve the files via HTTP:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Production
Deploy to Firebase Hosting, Vercel, Netlify, or any static hosting service.

## 📦 Module Structure

### `js/state.js`
Central state management:
- Application state object
- Study design classification utilities
- Save/Load functions

### `js/main.js`
Core application logic:
- Navigation (`showTab`)
- UI utilities (`showToast`, `toggleSidebar`, `toggleTheme`)
- Study management
- Groq API integration
- Extraction history

### `js/firebase-config.js`
Firebase initialization:
- App initialization
- Auth, Firestore, Storage exports

### `js/legacy-compat.js`
Temporary compatibility layer:
- Original functions from `index.html`
- Should be gradually migrated to proper modules

## 🎨 CSS Organization

The `css/style.css` file is organized by component:
1. Design Tokens (CSS Variables)
2. Reset & Base
3. App Shell (Sidebar, Topbar, Main)
4. Components (Cards, Buttons, Tables, etc.)
5. Utilities
6. Responsive

## ⚠️ Important Notes

1. **CORS**: Some API endpoints (Semantic Scholar, CORE) may require CORS proxy
2. **API Keys**: Groq API key stored in localStorage
3. **Browser Support**: Requires modern browser with ES Module support
4. **LocalStorage**: All data currently stored locally (migrate to Firebase)

## 📝 Next Steps

1. Migrate remaining functions from `legacy-compat.js` to proper modules
2. Implement Firebase Firestore for cloud storage
3. Add user authentication
4. Create build process (optional, using Vite/Webpack)
5. Add unit tests
6. Implement service worker for offline support

## 🔗 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [ES Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Groq API Docs](https://console.groq.com/docs)
- [PRISMA 2020 Guidelines](https://www.prisma-statement.org/)
- [Cochrane Handbook](https://training.cochrane.org/handbook)
