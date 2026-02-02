import React from 'react';
import { Upload } from './components/Upload';
import { Summary } from './components/Summary';
import { TopReleases } from './components/TopReleases';
import { TopTracks } from './components/TopTracks';
import { ReleasesList } from './components/ReleasesList';
import './styles/App.css';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎵 Bandcamper</h1>
          <p>Analyze your Bandcamp sales performance</p>
        </div>
      </header>

      <main className="app-main">
        <section className="upload-section">
          <Upload />
        </section>

        <section className="dashboard-section">
          <Summary />
          <div style={{ marginTop: 16 }}>
            <ReleasesList />
          </div>
        </section>

        <section className="charts-section">
          <div className="charts-grid">
            <TopReleases />
            <TopTracks />
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Bandcamper © 2026 | Data stays private on your device</p>
      </footer>
      </div>
    </DataProvider>
  );
}

export default App;
