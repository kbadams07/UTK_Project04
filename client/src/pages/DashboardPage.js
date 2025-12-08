import React, { useEffect, useState } from 'react';
import api from '../api';

function DashboardPage({ user, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState('');

  // ✅ NEW STATE FOR ANSWERS
  const [answers, setAnswers] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');

  // ✅ LOAD ANSWERS FOR A QUESTION
  const loadAnswers = async (questionId) => {
    setActiveQuestion(questionId);
    const data = await api.getAnswers(questionId);
    setAnswers((prev) => ({ ...prev, [questionId]: data }));
  };

  useEffect(() => {
    api
      .getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message));
  }, []);

  const loadQuestions = (category) => {
    setSelectedCategory(category);
    setError('');
    setAnswers({});
    setActiveQuestion(null);

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

  // ✅ POST A NEW ANSWER
  const handleAddAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim() || !activeQuestion) return;

    try {
      const created = await api.addAnswer(
        user.token,
        newAnswer.trim(),
        activeQuestion
      );

      setAnswers((prev) => ({
        ...prev,
        [activeQuestion]: [...(prev[activeQuestion] || []), created],
      }));

      setNewAnswer('');
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
                  <li key={q._id} style={{ marginBottom: '16px' }}>
                    <div
                      style={{ cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => loadAnswers(q._id)}
                    >
                      {q.text}
                    </div>

                    <div style={{ fontSize: '12px', color: '#666' }}>
                      by {q.user?.username || 'Unknown'}
                    </div>

                    {/* ✅ DISPLAY ANSWERS */}
                    {answers[q._id] && answers[q._id].length > 0 && (
                      <ul style={{ marginTop: '8px' }}>
                        {answers[q._id].map((a) => (
                          <li key={a._id} style={{ marginBottom: '6px' }}>
                            <strong>{a.user?.username}:</strong> {a.text}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* ✅ ANSWER FORM (ONLY FOR ACTIVE QUESTION) */}
                    {activeQuestion === q._id && (
                      <form
                        onSubmit={handleAddAnswer}
                        style={{ marginTop: '8px' }}
                      >
                        <textarea
                          value={newAnswer}
                          onChange={(e) =>
                            setNewAnswer(e.target.value)
                          }
                          placeholder="Write a response..."
                        />
                        <button type="submit">Post Answer</button>
                      </form>
                    )}
                  </li>
                ))}

                {questions.length === 0 && (
                  <li className="placeholder">No questions yet.</li>
                )}
              </ul>

              {/* ✅ ADD QUESTION (UNCHANGED) */}
              <form
                onSubmit={handleAddQuestion}
                className="new-question-form"
              >
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
