import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Dark mode persistence
const savedTheme = localStorage.getItem('expat-theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
