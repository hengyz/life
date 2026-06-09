import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from '../lib/auth';
import { Button } from './Button';

export function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate('/admin');
  }

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-40 border-b border-warm-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link to="/admin/dashboard" className="font-semibold text-ink">
            光影管理
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            退出
          </Button>
        </div>
        <nav className="mx-auto flex max-w-lg gap-1 px-4 pb-2">
          <NavLink to="/admin/dashboard">概览</NavLink>
          <NavLink to="/admin/pet">狗狗信息</NavLink>
          <NavLink to="/admin/timeline">时间轴</NavLink>
          <NavLink to="/admin/prep">备婚规划</NavLink>
        </nav>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-lg px-3 py-1.5 text-sm text-ink/60 transition-colors hover:bg-warm-50 hover:text-ink"
    >
      {children}
    </Link>
  );
}
