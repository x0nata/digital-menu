import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/dishes', label: 'Dishes', icon: 'restaurant_menu' },
  { path: '/admin/categories', label: 'Categories', icon: 'category' },
  { path: '/admin/settings', label: 'Settings', icon: 'settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("adminAuthenticated") === "true"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) return null;

  const currentPage = navItems.find(item => location.pathname === item.path)?.label || 'Admin';

  return (
    <div className="min-h-screen bg-creamy flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-variant transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-surface-variant shrink-0">
          <span className="material-symbols-outlined text-brand-red text-3xl">restaurant_menu</span>
          <span className="font-headline-md uppercase text-brand-red text-lg">mmm menu</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-bold transition-colors ${
                location.pathname === item.path
                  ? 'bg-brand-red/10 text-brand-red'
                  : 'text-secondary hover:bg-surface-container-low hover:text-on-background'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="pt-3 mt-3 border-t border-surface-variant">
            <Link
              to="/waiter"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-label-bold text-secondary hover:bg-surface-container-low hover:text-on-background transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              Waiter Scanner
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-surface-variant shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-label-bold text-error hover:bg-error-container transition-colors w-full"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-16 bg-white border-b border-surface-variant flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden material-symbols-outlined text-secondary hover:text-on-background transition-colors"
            >
              menu
            </button>
            <h1 className="font-headline-md text-xl text-on-background">{currentPage}</h1>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary text-sm hover:text-brand-red transition-colors font-label-bold inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            View Menu
          </a>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
