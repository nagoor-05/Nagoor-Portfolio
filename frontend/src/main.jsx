import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { PortfolioProvider } from "./context/PortfolioContext.jsx";
import { SoundProvider } from "./context/SoundContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PortfolioProvider>
        <SoundProvider>
          <Suspense fallback={<div className="center-screen">Loading</div>}>
            <App />
          </Suspense>
        </SoundProvider>
      </PortfolioProvider>
    </BrowserRouter>
  </React.StrictMode>
);
