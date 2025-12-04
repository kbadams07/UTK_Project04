import React, { useEffect, useState } from 'react';
import api from '../api';

function DashboardPage({ user, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message));
  }, []);

  const loadQuestions = (category) => {
    setSelectedCategory(category);
    setError('');
    api
      .getQuestions(category._id)
      .then(setQuestions)
      .catch((err) => setError(err.message));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !selectedCategory) return;
    setError('');

    try {
      const created = await api.addQuestion(
        user.token,
        newQuestion.trim(),
        selectedCategory._id
      );
      setQuestions((prev) => [...prev, created]);
      setNewQuestion('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>PetLand Forum</h1>
        <div>
          <span>Welcome, {user.username}</span>{' '}
          <button className="link-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="category-menu">
          <h3>Categories</h3>
          <div className="category-list">
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={
                  selectedCategory && selectedCategory._id === cat._id
                    ? 'category-item active'
                    : 'category-item'
                }
                onClick={() => loadQuestions(cat)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        <main className="questions-area">
          {!selectedCategory && (
            <div className="placeholder">
              Select a Category to view its questions
            </div>
          )}

          {selectedCategory && (
            <>
              <h2>{selectedCategory.name} Questions</h2>

              {error && <div className="error-message">{error}</div>}

              <ul className="question-list">
                {questions.map((q) => (
                  <li key={q._id}>
                    <div className="question-text">{q.text}</div>
                    <div className="question-meta">
                      by {q.user?.username || 'Unknown'} on{' '}
                      {new Date(q.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
                {questions.length === 0 && (
                  <li className="placeholder">No questions yet.</li>
                )}
              </ul>

              <form onSubmit={handleAddQuestion} className="new-question-form">
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ask a new question..."
                />
                <button type="submit">Post Question</button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
