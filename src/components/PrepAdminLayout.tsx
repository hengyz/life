import { Link, NavLink, Outlet } from 'react-router-dom';

const tabs = [
  { to: '/admin/prep', label: '概览', end: true },
  { to: '/admin/prep/profile', label: '基本信息' },
  { to: '/admin/prep/budget', label: '预算' },
  { to: '/admin/prep/checklist', label: '计划' },
];

export function PrepAdminLayout() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-rose-400">备婚规划</p>
          <h1 className="text-xl font-bold text-ink">管理后台</h1>
        </div>
        <Link
          to="/prep"
          className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm text-rose-600 transition-colors hover:bg-rose-100"
        >
          查看前台 →
        </Link>
      </div>

      <nav className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-card">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              [
                'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-rose-500 text-white' : 'text-ink/60 hover:bg-rose-50 hover:text-ink',
              ].join(' ')
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
