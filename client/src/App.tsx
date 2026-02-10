import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { SearchPage } from './components/search/SearchResults';
import { BrowsePage } from './components/entries/EntryList';
import { EntryDetail } from './components/entries/EntryDetail';
import { EntryForm } from './components/entries/EntryForm';
import { ImportWizard } from './components/import/ImportWizard';
import { DashboardPage } from './components/dashboard/Dashboard';
import { EquipmentPage } from './components/entries/EquipmentPage';
import { LoginPage } from './components/auth/LoginPage';
import * as api from './services/api';

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  // Check if already authenticated on mount
  useEffect(() => {
    api.checkAuth()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false));
  }, []);

  // Show nothing while checking auth status
  if (authenticated === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
        Loading...
      </div>
    );
  }

  // Show login page if not authenticated
  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell onLogout={() => setAuthenticated(false)} />}>
          <Route path="/" element={<SearchPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/entry/:id" element={<EntryDetail />} />
          <Route path="/add" element={<EntryForm />} />
          <Route path="/edit/:id" element={<EntryForm />} />
          <Route path="/import" element={<ImportWizard />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
