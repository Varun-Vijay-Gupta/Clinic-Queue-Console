import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

async function prepare() {
  if (typeof window !== "undefined") {
    const { worker } = await import("./mocks");
    await worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    });
  }
}

void prepare().then(() => {
  const rootEl = document.getElementById("app");
  if (!rootEl) {
    throw new Error("Root element #app not found");
  }
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
