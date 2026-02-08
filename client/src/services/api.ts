const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Entries
export const getEntries = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<any>(`/entries${qs}`);
};
export const getEntry = (id: number) => request<any>(`/entries/${id}`);
export const createEntry = (data: any) => request<any>('/entries', { method: 'POST', body: JSON.stringify(data) });
export const updateEntry = (id: number, data: any) => request<any>(`/entries/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEntry = (id: number) => request<any>(`/entries/${id}`, { method: 'DELETE' });
export const logOccurrence = (entryId: number, data: { reported_by?: string; notes?: string }) =>
  request<any>(`/entries/${entryId}/occurrences`, { method: 'POST', body: JSON.stringify(data) });

// Search
export const searchEntries = (params: Record<string, string>) => {
  const qs = new URLSearchParams(params).toString();
  return request<any>(`/search?${qs}`);
};

// Import
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE}/import/upload`, { method: 'POST', body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error);
  }
  return res.json();
};
export const executeImport = (filePath: string, mapping: Record<string, string>) =>
  request<any>('/import/execute', { method: 'POST', body: JSON.stringify({ filePath, mapping }) });

// Dashboard
export const getDashboardStats = () => request<any>('/dashboard/stats');
export const getFrequentIssues = (limit?: number) =>
  request<any>(`/dashboard/frequent${limit ? `?limit=${limit}` : ''}`);
export const getTrends = (days?: number) =>
  request<any>(`/dashboard/trends${days ? `?days=${days}` : ''}`);

// Equipment
export const getEquipment = () => request<any[]>('/equipment');
export const createEquipment = (data: any) => request<any>('/equipment', { method: 'POST', body: JSON.stringify(data) });

// Topics
export const getTopics = () => request<any[]>('/topics');
export const createTopic = (data: any) => request<any>('/topics', { method: 'POST', body: JSON.stringify(data) });
