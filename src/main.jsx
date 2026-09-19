import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/css/index.css';
import App from './App';

// Simple, ultra-fast in-memory cache for API GET requests (instant navigation)
const apiCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

const originalFetch = window.fetch;
window.fetch = async (...args) => {
    let [resource, config] = args;
    if (typeof resource === 'string' && resource.includes('/api/')) {
        config = config || {};
        const method = (config.method || 'GET').toUpperCase();
        
        // Globally inject authorization token
        const token = sessionStorage.getItem('erp_token');
        if (token) {
            config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${token}`
            };
        }
        
        // If it's a mutation (POST, PUT, DELETE), clear the entire GET cache 
        // to guarantee that subsequent page loads always fetch fresh data!
        if (method !== 'GET') {
            apiCache.clear();
        } 
        else {
            // For GET requests, check our in-memory cache for instant loads
            // Bypass cache if the fetch options explicitly request no-store/no-cache
            const cacheKey = resource;
            const cached = apiCache.get(cacheKey);
            const bypassCache = config.cache === 'no-store' || config.cache === 'no-cache';
            
            if (cached && !bypassCache && (Date.now() - cached.timestamp < CACHE_TTL)) {
                // Must return a cloned response because bodies can only be consumed once
                return cached.response.clone();
            }
            
            args[0] = resource;
            args[1] = config;
            
            const res = await originalFetch.call(window, ...args);
            if (res.ok && !bypassCache) {
                apiCache.set(cacheKey, {
                    timestamp: Date.now(),
                    response: res.clone()
                });
            }
            return res;
        }
        
        args[0] = resource;
        args[1] = config;
    }
    return originalFetch.call(window, ...args);
};

// Ensure true Back-Forward Cache (bfcache) restorations forcefully reload
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

// Synchronize sessionStorage across tabs
if (!sessionStorage.length) {
    // New tab: Ask other tabs for session storage
    localStorage.setItem('getSessionStorage', Date.now().toString());
}

window.addEventListener('storage', (event) => {
    if (event.key === 'getSessionStorage') {
        // Another tab asked for the sessionStorage -> send it if we have it
        if (sessionStorage.length) {
            localStorage.setItem('sessionStorageData', JSON.stringify(sessionStorage));
            localStorage.removeItem('sessionStorageData');
        }
    } else if (event.key === 'sessionStorageData' && !sessionStorage.length) {
        // Another tab sent data -> receive it
        if (event.newValue) {
            const data = JSON.parse(event.newValue);
            for (const key in data) {
                sessionStorage.setItem(key, data[key]);
            }
            // Trigger a reload to correctly apply the newly synced tokens
            window.location.reload();
        }
    }
});

// Instantly load theme from localStorage to prevent flash of default colors
const savedPrimary = localStorage.getItem('theme_primary');
if (savedPrimary) {
    document.documentElement.style.setProperty('--primary-color', savedPrimary);
    document.documentElement.style.setProperty('--primary-bg', `linear-gradient(135deg, ${savedPrimary}, ${savedPrimary}dd)`);
}
const savedSecondary = localStorage.getItem('theme_secondary');
if (savedSecondary) {
    document.documentElement.style.setProperty('--secondary-color', savedSecondary);
    document.documentElement.style.setProperty('--secondary-bg', savedSecondary + '15');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
