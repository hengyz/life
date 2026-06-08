-- Wedding prep profile
CREATE TABLE IF NOT EXISTS prep_profile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT '备婚规划',
  wedding_date TEXT DEFAULT '',
  total_budget REAL DEFAULT 0,
  description TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Budget items
CREATE TABLE IF NOT EXISTS prep_budget_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  estimated_amount REAL DEFAULT 0,
  actual_amount REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'paid', 'cancelled')),
  notes TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Planning checklist
CREATE TABLE IF NOT EXISTS prep_checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  due_date TEXT DEFAULT '',
  completed INTEGER NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO prep_profile (title, description)
VALUES ('备婚规划', '婚礼前的计划安排与预算管理');
