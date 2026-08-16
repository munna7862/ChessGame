import React from "react";
import { Header } from "./components/Header";
import "./App.css";

export const App: React.FC = () => {
  return (
    <div className="app-container" data-testid="chessforge-app">
      <Header />
      <main className="main-content">
        <div className="hero-card">
          <h1 className="hero-title" data-testid="app-title">
            ChessForge
          </h1>
          <p className="hero-subtitle" data-testid="hero-subtitle">
            A high-performance, local-first chess desktop application engineered
            with Tauri v2, React 19, and Stockfish WASM.
          </p>

          <div className="metrics-grid" data-testid="metrics-grid">
            <div className="metric-item" data-testid="metric-memory">
              <span className="metric-value">&lt; 150 MB</span>
              <span className="metric-label">Memory Footprint</span>
            </div>
            <div className="metric-item" data-testid="metric-fps">
              <span className="metric-value">60 FPS</span>
              <span className="metric-label">Render Budget</span>
            </div>
            <div className="metric-item" data-testid="metric-local">
              <span className="metric-value">100% Local</span>
              <span className="metric-label">Zero Telemetry</span>
            </div>
          </div>

          <div className="feature-list" data-testid="feature-list">
            <span className="feature-badge" data-testid="feature-tauri">
              Tauri v2 Desktop Shell
            </span>
            <span className="feature-badge" data-testid="feature-react">
              React 19 Frontend
            </span>
            <span className="feature-badge" data-testid="feature-domain">
              Decoupled Domain
            </span>
            <span className="feature-badge" data-testid="feature-stockfish">
              Stockfish Engine Bridge
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
