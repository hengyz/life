import { getToken } from './auth';
import type {
  MediaInput,
  PetProfile,
  PrepBudgetItem,
  PrepChecklistItem,
  PrepOverview,
  PrepProfile,
  TimelineListResponse,
  TimelineNode,
} from './types';

const API_BASE = '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }

  return res.json();
}

// Public API
export function fetchPet(): Promise<PetProfile> {
  return request<PetProfile>('/pet');
}

export function fetchTimeline(params?: {
  order?: 'asc' | 'desc';
  limit?: number;
  cursor?: string;
}): Promise<TimelineListResponse> {
  const search = new URLSearchParams();
  if (params?.order) search.set('order', params.order);
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.cursor) search.set('cursor', params.cursor);
  const qs = search.toString();
  return request<TimelineListResponse>(`/timeline${qs ? `?${qs}` : ''}`);
}

export function fetchTimelineNode(id: number): Promise<TimelineNode> {
  return request<TimelineNode>(`/timeline/${id}`);
}

// Admin API
export function adminLogin(password: string): Promise<{ token: string }> {
  return request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function adminFetchPet(): Promise<PetProfile> {
  return request<PetProfile>('/admin/pet', {}, true);
}

export function adminUpdatePet(data: Partial<PetProfile>): Promise<PetProfile> {
  return request<PetProfile>(
    '/admin/pet',
    { method: 'PUT', body: JSON.stringify(data) },
    true,
  );
}

export function adminFetchTimeline(order: 'asc' | 'desc' = 'desc'): Promise<{ nodes: TimelineNode[] }> {
  return request(`/admin/timeline?order=${order}`, {}, true);
}

export function adminCreateNode(data: {
  title: string;
  content?: string;
  event_date: string;
  location?: string;
  tags?: string[];
  cover_url?: string;
  visibility?: 'public' | 'private';
  sort_order?: number;
  media?: MediaInput[];
}): Promise<TimelineNode> {
  return request<TimelineNode>(
    '/admin/timeline',
    { method: 'POST', body: JSON.stringify(data) },
    true,
  );
}

export function adminUpdateNode(
  id: number,
  data: Partial<{
    title: string;
    content: string;
    event_date: string;
    location: string;
    tags: string[];
    cover_url: string;
    visibility: 'public' | 'private';
    sort_order: number;
    media: MediaInput[];
  }>,
): Promise<TimelineNode> {
  return request<TimelineNode>(
    `/admin/timeline/${id}`,
    { method: 'PUT', body: JSON.stringify(data) },
    true,
  );
}

export function adminDeleteNode(id: number): Promise<{ success: boolean }> {
  return request(`/admin/timeline/${id}`, { method: 'DELETE' }, true);
}

export type UploadFolder = 'dog' | 'prep';

export async function adminUploadImage(
  file: File,
  folder: UploadFolder,
): Promise<{ url: string; key: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  form.append('capturedAt', new Date(file.lastModified).toISOString());

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/admin/media/upload`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!res.ok) {
    let message = '上传失败';
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }

  return res.json();
}

export async function adminUploadImages(
  files: File[],
  folder: UploadFolder,
): Promise<{ urls: string[]; failed: number }> {
  if (files.length === 0) return { urls: [], failed: 0 };

  const results = await Promise.allSettled(files.map((file) => adminUploadImage(file, folder)));
  const urls: string[] = [];
  let failed = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      urls.push(result.value.url);
    } else {
      failed += 1;
    }
  }

  if (urls.length === 0 && failed > 0) {
    const reason = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
    throw reason.reason instanceof ApiError
      ? reason.reason
      : new ApiError('上传失败', 500);
  }

  return { urls, failed };
}

// Prep API
export function fetchPrepOverview(): Promise<PrepOverview> {
  return request<PrepOverview>('/prep');
}

export function fetchPrepBudget(): Promise<{ items: PrepBudgetItem[] }> {
  return request('/prep/budget');
}

export function fetchPrepChecklist(): Promise<{ items: PrepChecklistItem[] }> {
  return request('/prep/checklist');
}

export function adminFetchPrep(): Promise<PrepProfile> {
  return request<PrepProfile>('/admin/prep', {}, true);
}

export function adminUpdatePrep(data: Partial<PrepProfile>): Promise<PrepProfile> {
  return request<PrepProfile>('/admin/prep', { method: 'PUT', body: JSON.stringify(data) }, true);
}

export function adminFetchPrepBudget(): Promise<{ items: PrepBudgetItem[] }> {
  return request('/admin/prep/budget', {}, true);
}

export function adminCreateBudgetItem(
  data: Partial<PrepBudgetItem>,
): Promise<PrepBudgetItem> {
  return request<PrepBudgetItem>(
    '/admin/prep/budget',
    { method: 'POST', body: JSON.stringify(data) },
    true,
  );
}

export function adminUpdateBudgetItem(
  id: number,
  data: Partial<PrepBudgetItem>,
): Promise<PrepBudgetItem> {
  return request<PrepBudgetItem>(
    `/admin/prep/budget/${id}`,
    { method: 'PUT', body: JSON.stringify(data) },
    true,
  );
}

export function adminDeleteBudgetItem(id: number): Promise<{ success: boolean }> {
  return request(`/admin/prep/budget/${id}`, { method: 'DELETE' }, true);
}

export function adminFetchPrepChecklist(): Promise<{ items: PrepChecklistItem[] }> {
  return request('/admin/prep/checklist', {}, true);
}

export function adminCreateChecklistItem(
  data: Partial<PrepChecklistItem>,
): Promise<PrepChecklistItem> {
  return request<PrepChecklistItem>(
    '/admin/prep/checklist',
    { method: 'POST', body: JSON.stringify(data) },
    true,
  );
}

export function adminUpdateChecklistItem(
  id: number,
  data: Partial<PrepChecklistItem>,
): Promise<PrepChecklistItem> {
  return request<PrepChecklistItem>(
    `/admin/prep/checklist/${id}`,
    { method: 'PUT', body: JSON.stringify(data) },
    true,
  );
}

export function adminDeleteChecklistItem(id: number): Promise<{ success: boolean }> {
  return request(`/admin/prep/checklist/${id}`, { method: 'DELETE' }, true);
}

export { ApiError };
