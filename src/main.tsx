
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Disable context menu on mobile to feel more like a native app
document.addEventListener('contextmenu', (e) => {
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    e.preventDefault();
  }
});

// Prevent overscroll/bounce effect on mobile
document.body.style.overscrollBehavior = 'none';

createRoot(document.getElementById("root")!).render(<App />);
