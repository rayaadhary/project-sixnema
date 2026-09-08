const BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    const err = new Error(detail.detail || `Request gagal (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
};

export const api = {
  base: BASE,
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  listStudents: () => request('/students'),
  createStudent: (payload) => request('/students', { method: 'POST', body: JSON.stringify(payload) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),
  updateGrades: (id, payload) => request(`/students/${id}/grades`, { method: 'PATCH', body: JSON.stringify(payload) }),
  gradeHistory: (id) => request(`/students/${id}/grade-history`),

  listJournals: () => request('/journals'),
  createJournal: (payload) => request('/journals', { method: 'POST', body: JSON.stringify(payload) }),

  listArtworks: () => request('/artworks'),
  createArtwork: (payload) => request('/artworks', { method: 'POST', body: JSON.stringify(payload) }),

  listFeedback: () => request('/feedback'),
  createFeedback: (payload) => request('/feedback', { method: 'POST', body: JSON.stringify(payload) }),

  listAttendance: () => request('/attendance'),
  saveAttendance: (payload) => request('/attendance', { method: 'POST', body: JSON.stringify(payload) }),

  getFlipbookUrl: () => `${BASE}/media/flipbook`,
  uploadFlipbook: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/media/flipbook`, { method: 'POST', credentials: 'include', body: form });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.detail || `Upload gagal (${res.status})`);
    }
    return res.json();
  },
  deleteFlipbook: () => request('/media/flipbook', { method: 'DELETE' }),
};
