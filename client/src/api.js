const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://utk-project04.onrender.com'
    : '';

const api = {
  async login(username, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data; // { token, username }
  },

  async register(payload) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.message || 'Registration failed');
      error.field = data.field;
      throw error;
    }

    return data;
  },

  async getCategories() {
    const res = await fetch(`${BASE_URL}/api/categories`);
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  async getQuestions(categoryId) {
    const res = await fetch(
      `${BASE_URL}/api/questions?categoryId=${categoryId}`
    );
    if (!res.ok) throw new Error('Failed to load questions');
    return res.json();
  },

  async addQuestion(token, text, categoryId) {
    const res = await fetch(`${BASE_URL}/api/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, categoryId }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to add question');
    return data;
  },
};

export default api;
