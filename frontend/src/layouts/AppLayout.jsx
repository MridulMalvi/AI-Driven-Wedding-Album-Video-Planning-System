import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarHeart, ClipboardList, LayoutDashboard,
  LogOut, Menu, Plus, Settings, Users, WandSparkles, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navs = {
  client: [
    { to: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/client/weddings/new', label: 'Create Wedding', icon: Plus },
    { to: '/client/dashboard', label: 'My Weddings', icon: CalendarHeart },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/weddings', label: 'Weddings', icon: CalendarHeart },
    { to: '/admin/dashboard?people=clients', label: 'Clients', icon: Users },
  ],
};

function NavItems({ items, onNavigate }) {
  return (
    <nav className="mt-10 space-y-1">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={label}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ' +
            (isActive ? 'bg-blush text-wine' : 'text-stone-500 hover:bg-stone-50')
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function UserCard({ user, onLogout }) {
  return (
    <div className="rounded-2xl bg-[#fdf6f3] p-4">
      <p className="text-xs text-stone-500">Signed in as</p>
      <p className="mt-1 text-sm font-bold">{user?.name}</p>
      <p className="text-xs capitalize text-gold">{user?.role}</p>
      <button
        onClick={onLogout}
        className="mt-4 flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-wine transition"
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = navs[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen lg:flex">

      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-stone-100 bg-white px-5 py-7 lg:flex lg:flex-col">
        <button
          onClick={() => navigate(`/${user?.role || 'client'}/dashboard`)}
          className="flex items-center gap-3 px-3 text-left"
        >
          <span className="rounded-2xl bg-wine p-2 text-white"><CalendarHeart size={21} /></span>
          <span className="font-display text-2xl">WeddingAI</span>
        </button>
        <p className="mt-3 px-3 text-xs text-stone-400">AI wedding production studio</p>
        <NavItems items={items} onNavigate={() => { }} />
        <div className="mt-auto"><UserCard user={user} onLogout={handleLogout} /></div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={closeMobile} />
      )}

      {/* Mobile drawer */}
      <div
        className={
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white px-5 py-7 shadow-2xl transition-transform duration-300 lg:hidden ' +
          (mobileOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => { navigate(`/${user?.role || 'client'}/dashboard`); closeMobile(); }}
            className="flex items-center gap-3 text-left"
          >
            <span className="rounded-2xl bg-wine p-2 text-white"><CalendarHeart size={21} /></span>
            <span className="font-display text-2xl">WeddingAI</span>
          </button>
          <button
            onClick={closeMobile}
            className="rounded-xl p-2 text-stone-500 hover:bg-stone-100 transition"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>
        <p className="mt-3 px-3 text-xs text-stone-400">AI wedding production studio</p>
        <NavItems items={items} onNavigate={closeMobile} />
        <div className="mt-auto"><UserCard user={user} onLogout={handleLogout} /></div>
      </div>

      {/* Main */}
      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-stone-100 bg-white px-5 py-4 lg:px-10">
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-stone-600 hover:bg-stone-100 transition"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <button
              onClick={() => navigate(`/${user?.role || 'client'}/dashboard`)}
              className="font-display text-xl"
            >
              WeddingAI
            </button>
          </div>

          {/* Desktop tagline */}
          <div className="hidden text-sm text-stone-400 lg:block">
            A more thoughtful way to plan every frame.
          </div>

          {/* Role-aware CTA */}
          {user?.role === 'client' && (
            <button onClick={() => navigate('/client/weddings/new')} className="btn-primary text-xs">
              <Plus size={16} /> Create wedding
            </button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin/weddings')} className="btn-primary text-xs">
              <CalendarHeart size={16} /> View weddings
            </button>
          )}
        </header>

        <div className="mx-auto max-w-7xl p-5 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
