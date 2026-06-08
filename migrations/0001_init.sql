-- Pet profile
CREATE TABLE IF NOT EXISTS pet_profile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  birthday TEXT DEFAULT '',
  home_date TEXT DEFAULT '',
  breed TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Timeline nodes
CREATE TABLE IF NOT EXISTS timeline_nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_id INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL DEFAULT '',
  content TEXT DEFAULT '',
  event_date TEXT NOT NULL,
  location TEXT DEFAULT '',
  tags TEXT DEFAULT '[]',
  cover_url TEXT DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (pet_id) REFERENCES pet_profile(id)
);

CREATE INDEX IF NOT EXISTS idx_timeline_nodes_event_date ON timeline_nodes(event_date);
CREATE INDEX IF NOT EXISTS idx_timeline_nodes_visibility ON timeline_nodes(visibility);
CREATE INDEX IF NOT EXISTS idx_timeline_nodes_sort_order ON timeline_nodes(sort_order);

-- Timeline media
CREATE TABLE IF NOT EXISTS timeline_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (node_id) REFERENCES timeline_nodes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_timeline_media_node_id ON timeline_media(node_id);

-- Seed default pet profile
INSERT INTO pet_profile (name, avatar_url, birthday, home_date, breed, gender, description)
VALUES ('小狗', '', '', '', '', '', '欢迎来到光影生活');
