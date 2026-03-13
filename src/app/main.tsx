import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import App from "./App";
import "../index.css";
import "react-toastify/dist/ReactToastify.css";
import { createLogger } from "../utils/logger";

const logger = createLogger("service-worker");

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
      logger.info("Registered service worker.", reg.scope);

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
      logger.error("Service worker registration failed.", e);
    }
  });
}

function maybePromptUpdate(reg: ServiceWorkerRegistration) {
  const waiting = reg.waiting;
  if (!waiting) return;
  waiting.postMessage("SKIP_WAITING");
}


