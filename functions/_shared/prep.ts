export interface PrepProfile {
  id: number;
  title: string;
  wedding_date: string;
  total_budget: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PrepBudgetItem {
  id: number;
  category: string;
  name: string;
  estimated_amount: number;
  actual_amount: number;
  status: 'planned' | 'paid' | 'cancelled';
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PrepChecklistItem {
  id: number;
  category: string;
  title: string;
  due_date: string;
  completed: boolean;
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function mapPrepProfile(row: Record<string, unknown>): PrepProfile {
  return {
    id: row.id as number,
    title: (row.title as string) || '',
    wedding_date: (row.wedding_date as string) || '',
    total_budget: Number(row.total_budget) || 0,
    description: (row.description as string) || '',
    created_at: (row.created_at as string) || '',
    updated_at: (row.updated_at as string) || '',
  };
}

export function mapBudgetItem(row: Record<string, unknown>): PrepBudgetItem {
  return {
    id: row.id as number,
    category: (row.category as string) || '',
    name: (row.name as string) || '',
    estimated_amount: Number(row.estimated_amount) || 0,
    actual_amount: Number(row.actual_amount) || 0,
    status: (row.status as PrepBudgetItem['status']) || 'planned',
    notes: (row.notes as string) || '',
    sort_order: (row.sort_order as number) || 0,
    created_at: (row.created_at as string) || '',
    updated_at: (row.updated_at as string) || '',
  };
}

export function mapChecklistItem(row: Record<string, unknown>): PrepChecklistItem {
  return {
    id: row.id as number,
    category: (row.category as string) || '',
    title: (row.title as string) || '',
    due_date: (row.due_date as string) || '',
    completed: Boolean(row.completed),
    notes: (row.notes as string) || '',
    sort_order: (row.sort_order as number) || 0,
    created_at: (row.created_at as string) || '',
    updated_at: (row.updated_at as string) || '',
  };
}

export async function getPrepProfile(db: D1Database): Promise<PrepProfile | null> {
  const row = await db
    .prepare('SELECT * FROM prep_profile ORDER BY id ASC LIMIT 1')
    .first<Record<string, unknown>>();
  return row ? mapPrepProfile(row) : null;
}

export async function getBudgetItems(db: D1Database): Promise<PrepBudgetItem[]> {
  const { results } = await db
    .prepare('SELECT * FROM prep_budget_items ORDER BY sort_order ASC, id ASC')
    .all<Record<string, unknown>>();
  return (results || []).map(mapBudgetItem);
}

export async function getChecklistItems(db: D1Database): Promise<PrepChecklistItem[]> {
  const { results } = await db
    .prepare('SELECT * FROM prep_checklist_items ORDER BY sort_order ASC, id ASC')
    .all<Record<string, unknown>>();
  return (results || []).map(mapChecklistItem);
}

export function summarizeBudget(items: PrepBudgetItem[]) {
  const active = items.filter((i) => i.status !== 'cancelled');
  return {
    estimated: active.reduce((sum, i) => sum + i.estimated_amount, 0),
    actual: active.reduce((sum, i) => sum + i.actual_amount, 0),
    paid: active.filter((i) => i.status === 'paid').length,
    total: active.length,
  };
}

export function summarizeChecklist(items: PrepChecklistItem[]) {
  const completed = items.filter((i) => i.completed).length;
  return { completed, total: items.length };
}
