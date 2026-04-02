const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export function fetchPosts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/posts?${qs}`);
}

export function updatePostStatus(id, status) {
  return request(`/posts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function updatePostNotes(id, notes) {
  return request(`/posts/${id}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });
}

export function fetchStats() {
  return request('/stats');
}

export function fetchSubreddits() {
  return request('/subreddits');
}

export function fetchKeywords(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/keywords?${qs}`);
}

export function createKeyword(data) {
  return request('/keywords', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateKeyword(id, data) {
  return request(`/keywords/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteKeyword(id) {
  return request(`/keywords/${id}`, { method: 'DELETE' });
}

export function triggerScan() {
  return request('/settings/scan/trigger', { method: 'POST' });
}

export function seedKeywords() {
  return request('/settings/seed-keywords', { method: 'POST' });
}

export function fetchHealth() {
  return request('/settings/health');
}
