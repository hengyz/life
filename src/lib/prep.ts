export function formatMoney(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export const BUDGET_STATUS_LABELS: Record<string, string> = {
  planned: '待支出',
  paid: '已支付',
  cancelled: '已取消',
};

export function groupByCategory<T extends { category: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = item.category || '未分类';
    const list = map.get(key) || [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}
