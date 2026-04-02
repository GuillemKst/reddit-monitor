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
      <div className="min-h-screen bg-white">
        <nav className="border-b border-neutral-100 sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-neutral-900 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-neutral-900 tracking-tight">
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
                      `px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                        isActive
                          ? 'bg-neutral-100 text-neutral-900'
                          : 'text-neutral-400 hover:text-neutral-600'
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

        <main className="max-w-4xl mx-auto px-6 py-10">
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
