import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  onLogout?: () => void;
}

export function AppShell({ onLogout }: AppShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar onLogout={onLogout} />
      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          padding: 'var(--space-10) var(--space-8)',
          maxWidth: `calc(var(--content-max-width) + var(--sidebar-width) + var(--space-16))`,
        }}
      >
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
