import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import App from "./App";
import "../index.css";
import "react-toastify/dist/ReactToastify.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container with id 'root' was not found in the document.");
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

const isProd = process.env.NODE_ENV === "production";

if ("serviceWorker" in navigator && isProd) {
  let refreshed = false;

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      // eslint-disable-next-line no-console
      console.log("[SW] scope:", reg.scope);

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshed) return;
        refreshed = true;
        window.location.reload();
      });

      maybePromptUpdate(reg);

      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener("statechange", () => {
          if (sw.state === "installed" && navigator.serviceWorker.controller) {
            maybePromptUpdate(reg);
          }
        });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[SW] register failed", e);
    }
  });
}

function maybePromptUpdate(reg: ServiceWorkerRegistration) {
  const waiting = reg.waiting;
  if (!waiting) return;
  waiting.postMessage("SKIP_WAITING");
}


