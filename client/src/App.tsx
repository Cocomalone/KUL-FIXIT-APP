import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { SearchPage } from './components/search/SearchResults';
import { BrowsePage } from './components/entries/EntryList';
import { EntryDetail } from './components/entries/EntryDetail';
import { EntryForm } from './components/entries/EntryForm';
import { ImportWizard } from './components/import/ImportWizard';
import { DashboardPage } from './components/dashboard/Dashboard';
import { EquipmentPage } from './components/entries/EquipmentPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
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
