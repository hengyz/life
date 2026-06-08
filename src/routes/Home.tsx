import { ModuleEntryCard } from '../components/ModuleEntryCard';

export function Home() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-warm-200/40 blur-3xl" />
        <div className="absolute -right-10 top-48 h-48 w-48 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute bottom-32 left-1/3 h-40 w-40 rounded-full bg-warm-300/20 blur-3xl" />
      </div>

      <div className="page-container relative flex min-h-dvh flex-col pb-10 pt-12">
        <header className="mb-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-3xl shadow-soft backdrop-blur-sm">
            ✨
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">光影生活</h1>
          <p className="mx-auto mt-3 max-w-xs text-base leading-relaxed text-ink/50">
            记录光影里的每一天
          </p>
        </header>

        <section className="flex-1">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-ink/30">
            选择模块
          </p>
          <div className="space-y-4">
            <ModuleEntryCard
              icon="💍"
              title="备婚规划"
              description="婚礼前的计划安排与预算管理"
              to="/prep"
              accent="rose"
              large
            />
            <ModuleEntryCard
              icon="🐾"
              title="狗狗成长"
              description="记录毛孩子的每一天"
              to="/dog"
              accent="amber"
              large
            />
          </div>
        </section>

        <footer className="mt-12 text-center">
          <p className="text-xs text-ink/30">life.guangying.world</p>
        </footer>
      </div>
    </div>
  );
}
