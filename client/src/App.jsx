import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Keywords from './pages/Keywords';
import Settings from './pages/Settings';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/keywords', label: 'Keywords' },
  { to: '/settings', label: 'Settings' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50">
        <nav className="border-b border-neutral-200 bg-white sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-base font-bold text-neutral-900">
                  Reddit Monitor
                </span>
              </div>
              <div className="flex gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-8 py-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/keywords" element={<Keywords />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
