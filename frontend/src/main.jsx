import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import "./latest-polish.css";
import { PortfolioProvider } from "./context/PortfolioContext.jsx";
import { SoundProvider } from "./context/SoundContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import SoundToggle from "./components/ui/SoundToggle.jsx";
import ThemeControls from "./components/ui/ThemeControls.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PortfolioProvider>
          <SoundProvider>
            <Suspense fallback={<div className="center-screen">Loading</div>}>
              <App />
            </Suspense>
            <SoundToggle />
            <ThemeControls />
          </SoundProvider>
        </PortfolioProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
