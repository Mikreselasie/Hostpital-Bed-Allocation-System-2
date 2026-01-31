import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Robust Global Error & Rejection Handler
const reportError = (title, message, detail) => {
  const errorDiv = document.createElement('div');
  errorDiv.id = 'medbed-debugger';
  errorDiv.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(8px);
        color: white; padding: 40px; font-family: 'Inter', sans-serif;
        z-index: 10000; overflow: auto; display: flex; flex-direction: column; align-items: center; justify-content: center;
    `;
  errorDiv.innerHTML = `
        <div style="max-width: 600px; background: white; color: #0f172a; padding: 40px; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
            <div style="background: #fee2e2; color: #991b1b; padding: 12px 20px; border-radius: 12px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; margin-bottom: 20px;">
                Critical System Fault
            </div>
            <h1 style="font-size: 32px; font-weight: 900; margin: 0 0 16px 0; letter-spacing: -0.02em;">${title}</h1>
            <p style="font-size: 16px; color: #64748b; font-weight: 500; margin: 0 0 24px 0; line-height: 1.6;">${message}</p>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #475569; border: 1px solid #e2e8f0; white-space: pre-wrap; word-break: break-all;">
                ${detail}
            </div>
            <button onclick="window.location.reload()" style="margin-top: 32px; background: #4f46e5; color: white; border: none; padding: 16px 32px; border-radius: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                Restart System
            </button>
        </div>
    `;
  if (!document.getElementById('medbed-debugger')) {
    document.body.appendChild(errorDiv);
  }
};

window.onerror = (msg, url, line, col, err) => {
  reportError("Application Runtime Crash", msg, `At: ${url}\nLine: ${line}\nCol: ${col}\n\nStack:\n${err?.stack || 'N/A'}`);
  return false;
};

window.onunhandledrejection = (event) => {
  reportError("Async Operation Fault", "An unhandled promise rejection occurred.", `Reason: ${event.reason}`);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
