import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Search', icon: 'search' },
  { path: '/browse', label: 'Browse', icon: 'list' },
  { path: '/add', label: 'Add Entry', icon: 'plus' },
  { path: '/import', label: 'Import', icon: 'upload' },
  { path: '/dashboard', label: 'Dashboard', icon: 'chart' },
  { path: '/equipment', label: 'Equipment', icon: 'wrench' },
];

const icons: Record<string, string> = {
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  list: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  plus: 'M12 4v16m8-8H4',
  upload: 'M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0h6m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4',
  wrench: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
};

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name] || icons.list} />
    </svg>
  );
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        backgroundColor: 'var(--color-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: 'var(--space-5) var(--space-5)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <img
          src="/Kul-Horizontal-Logo-Black@0.25x.png"
          alt="K'UL Chocolate"
          style={{
            width: '100%',
            maxWidth: 180,
            height: 'auto',
            objectFit: 'contain',
            /* White logo on dark sidebar — no filter needed */
            marginBottom: 'var(--space-2)',
          }}
        />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-3)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                color: isActive ? 'var(--color-sidebar-text)' : 'var(--color-sidebar-text-muted)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive ? 500 : 400,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--color-sidebar-text-muted)',
          fontSize: 'var(--font-size-xs)',
        }}
      >
        KUL FYX v1.0
      </div>
    </aside>
  );
}
