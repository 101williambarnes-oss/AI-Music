import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  caches.keys().then((keys) => {
    keys.forEach((key) => caches.delete(key));
  });
}

function getVisitorId() {
  let vid = localStorage.getItem("hwm_vid");
  if (!vid) {
    vid = crypto.randomUUID();
    localStorage.setItem("hwm_vid", vid);
  }
  return vid;
}
try {
  fetch("/api/visit", {
    method: "POST",
    headers: { "x-visitor-id": getVisitorId() },
  }).catch(() => {});
} catch {}

createRoot(document.getElementById("root")!).render(<App />);
