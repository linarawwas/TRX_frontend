import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
const isProd =  process.env.NODE_ENV === "production";

if ("serviceWorker" in navigator && isProd) {
  let refreshed = false;

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("[SW] scope:", reg.scope);

      // Prevent reload loops
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshed) return;
        refreshed = true;
        window.location.reload();
      });

      // If there’s already an updated worker waiting, prompt the user
      maybePromptUpdate(reg);

      // When a new SW is found, watch it
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener("statechange", () => {
          // 'installed' + controller present => it's an update (not first install)
          if (sw.state === "installed" && navigator.serviceWorker.controller) {
            maybePromptUpdate(reg);
          }
        });
      });
    } catch (e) {
      console.error("[SW] register failed", e);
    }
  });
}

function maybePromptUpdate(reg) {
  const waiting = reg.waiting;
  if (!waiting) return;
  // TODO: show a toast/dialog:
  // "تحديث متوفر للتطبيق — تحديث الآن؟"
  // On user confirm:
  waiting.postMessage("SKIP_WAITING"); // sw.js should handle this
}
