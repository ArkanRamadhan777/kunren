import {
  CalendarCheck,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  PanelLeftOpen,
  Repeat,
  Settings2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import LogoMark from '../brand/LogoMark';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/rundown', label: 'Calendar', icon: CalendarCheck },
  { to: '/setting-rundown', label: 'Routine Plan', icon: Settings2 },
  { to: '/life-rules', label: 'Rules', icon: ShieldCheck },
  { to: '/habits', label: 'Habits', icon: Repeat },
  { to: '/review', label: 'Review', icon: ClipboardList },
];

function SidebarContent({ collapsed = false, onNavigate, onToggle }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-full flex-col">
      <div className={`mb-7 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <LogoMark className={`${collapsed ? 'h-12 w-12 text-3xl' : 'h-11 w-11 text-2xl'} animate-pop`} />
        <div className={collapsed ? 'hidden' : 'animate-fade-up'}>
          <p className="brand-wordmark text-xl">kunren</p>
          <p className="text-xs font-bold text-neutral-600">Build your daily discipline</p>
        </div>
      </div>

      <nav className={collapsed ? 'space-y-3' : 'space-y-2'}>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              style={{ animationDelay: `${index * 35}ms` }}
              className={({ isActive }) =>
                `group relative flex animate-slide-in-left items-center gap-3 overflow-hidden rounded-md border-2 border-structly-black font-black transition duration-200 ease-out active:translate-x-0.5 active:translate-y-0.5 ${
                  collapsed ? 'h-12 w-12 justify-center p-0' : 'px-4 py-3'
                } ${
                  isActive
                    ? 'active translate-x-1 bg-structly-blue text-white shadow-brutal-sm'
                    : 'bg-white hover:-translate-y-0.5 hover:shadow-brutal-sm'
                }`
              }
            >
              <span className="absolute inset-y-0 left-0 w-1 -translate-x-full bg-structly-yellow transition-transform group-hover:translate-x-0 group-[.active]:translate-x-0" />
              <Icon className="relative z-10 h-5 w-5 transition-transform duration-200 group-hover:rotate-[-6deg] group-hover:scale-110" />
              {collapsed ? null : <span className="relative z-10">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={collapsed ? 'mt-auto flex animate-fade-up flex-col items-center gap-3' : 'mt-auto animate-fade-up rounded-md border-2 border-structly-black bg-structly-gray p-3'}>
        {collapsed ? (
          <>
            <Button variant="neutral" className="h-12 min-h-12 w-12 px-0" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
            {onToggle ? (
              <Button variant="neutral" className="h-12 min-h-12 w-12 bg-structly-gray px-0" onClick={onToggle} aria-label="Open sidebar">
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-xs font-black uppercase">Active account</p>
            <p className="mt-1 truncate text-sm font-bold">{user?.email}</p>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
              <Button variant="neutral" className="h-10 min-h-10" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
              {onToggle ? (
                <Button variant="neutral" className="h-10 min-h-10 px-3" onClick={onToggle} aria-label="Close sidebar">
                  <X className="h-5 w-5" />
                </Button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-structly-ink">
      <aside className={`fixed left-0 top-0 hidden h-screen animate-slide-in-left border-r-2 border-structly-black bg-structly-white p-5 transition-[width,transform] duration-500 ease-out 2xl:block ${collapsed ? 'w-24' : 'w-72'}`}>
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-structly-black bg-structly-white px-3 py-3 2xl:hidden">
        <div className="flex items-center gap-2 font-black">
          <LogoMark className="h-9 w-9 text-xl" />
          <span className="brand-wordmark">kunren</span>
        </div>
        <Button variant="neutral" className="h-10 min-h-10 px-3" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-structly-black/40 transition-opacity duration-300 ease-out 2xl:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
      >
        <div
          className={`ml-auto h-full w-80 max-w-[90vw] overflow-y-auto border-l-2 border-structly-black bg-structly-white p-4 shadow-brutal-lg transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex justify-end">
            <Button variant="neutral" className="h-10 min-h-10 px-3" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </div>
      </div>

      <main className={`px-2 py-3 transition-[margin,padding] duration-500 ease-out sm:px-4 sm:py-6 lg:px-8 lg:py-8 ${collapsed ? '2xl:ml-24' : '2xl:ml-72'}`}>
        <div className="min-h-[calc(100vh-3rem)] animate-fade-up bg-structly-white p-3 sm:rounded-lg sm:p-4 sm:shadow-brutal lg:min-h-[calc(100vh-4rem)] lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
