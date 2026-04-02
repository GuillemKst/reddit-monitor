import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Keywords from './pages/Keywords';
import Settings from './pages/Settings';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📡' },
  { to: '/keywords', label: 'Keywords', icon: '🔑' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📡</span>
                <span className="text-lg font-bold tracking-tight text-white">
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
                      `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-orange-500/15 text-orange-400'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`
                    }
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
