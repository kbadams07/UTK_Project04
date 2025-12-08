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
    return data;
  },

  async register(payload) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async getCategories() {
    const res = await fetch(`${BASE_URL}/api/categories`);
    return res.json();
  },

  async getQuestions(categoryId) {
    const res = await fetch(
      `${BASE_URL}/api/questions?categoryId=${categoryId}`
    );
    return res.json();
  },

  async getAnswers(questionId) {
    const res = await fetch(
      `${BASE_URL}/api/answers?questionId=${questionId}`
    );
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

    return res.json();
  },

  async addAnswer(token, text, questionId) {
    const res = await fetch(`${BASE_URL}/api/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, questionId }),
    });

    return res.json();
  },
};

export default api;
