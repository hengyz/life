export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '';
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '';
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function daysBetween(from: string, to: Date = new Date()): number | null {
  const start = parseDate(from);
  if (!start) return null;
  const diff = to.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function calcAge(birthday: string): string {
  const birth = parseDate(birthday);
  if (!birth) return '未知';

  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return months > 0 ? `${years} 岁 ${months} 个月` : `${years} 岁`;
  }
  if (months > 0) {
    return days > 0 ? `${months} 个月 ${days} 天` : `${months} 个月`;
  }
  const totalDays = daysBetween(birthday);
  return totalDays !== null ? `${totalDays} 天` : '未知';
}
