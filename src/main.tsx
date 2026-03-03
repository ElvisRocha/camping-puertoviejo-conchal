import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Initialize i18n BEFORE mounting React so every page has translations ready,
// regardless of which route is the first to render (avoids "useTranslation not
// initialized" errors when navigating directly to /gallery, /contact, etc.)
import "./i18n";

createRoot(document.getElementById("root")!).render(<App />);
