import React, { useEffect, useMemo, useState } from 'react'
import { getDashboardSummary, getExpenses, saveExpense, deleteExpense, registerUser, loginUser, askChatbot } from './api'

const demoMessages = [
  {
    sender: 'assistant',
    text: 'Hi! Ask me about your expenses, totals, or categories.',
  },
]

const initialForm = {
  amount: '',
  category: '',
  description: '',
  expense_date: new Date().toISOString().slice(0, 10),
}

const initialAuthForm = {
  name: '',
  email: '',
  password: '',
}

function App() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState({ total_expenses: 0, total_categories: 0, total_transactions: 0 })
  const [formData, setFormData] = useState(initialForm)
  const [authForm, setAuthForm] = useState(initialAuthForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState(demoMessages)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isRegister, setIsRegister] = useState(false)
  const [showPasswordHint, setShowPasswordHint] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('mycash_token') || '')
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('mycash_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const loadData = async () => {
    if (!token) return

    setLoading(true)
    try {
      const [expenseResult, summaryResult] = await Promise.all([getExpenses(), getDashboardSummary()])
      setExpenses(expenseResult)
      setSummary(summaryResult)
    } catch (err) {
      setError('Unable to load data from the server. Showing demo data instead.')
      setExpenses([
        { id: 1, amount: 250, category: 'Food', description: 'Lunch', expense_date: '2026-07-10' },
        { id: 2, amount: 1200, category: 'Travel', description: 'Taxi to office', expense_date: '2026-07-12' },
        { id: 3, amount: 500, category: 'Movies', description: 'Cinema', expense_date: '2026-07-14' },
      ])
      setSummary({ total_expenses: 1950, total_categories: 3, total_transactions: 3 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [token])

  const categoryOptions = ['Food', 'Travel', 'Medicine', 'Movies', 'Utilities', 'Shopping']

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      return new Date(b.expense_date) - new Date(a.expense_date) || b.id - a.id
    })
  }, [expenses])

  const visibleExpenses = useMemo(() => {
    if (selectedCategory === 'All') return sortedExpenses
    return sortedExpenses.filter((expense) => expense.category === selectedCategory)
  }, [selectedCategory, sortedExpenses])

  const handleAuthChange = (e) => {
    const { name, value } = e.target
    setAuthForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (isRegister && authForm.password.length < 8) {
      setError('Password must be at least 8 characters long for registration.')
      return
    }

    try {
      const payload = {
        name: authForm.name,
        email: authForm.email,
        password: authForm.password,
      }

      const result = isRegister ? await registerUser(payload) : await loginUser({ email: authForm.email, password: authForm.password })
      localStorage.setItem('mycash_token', result.token)
      localStorage.setItem('mycash_user', JSON.stringify(result.user))
      setToken(result.token)
      setUser(result.user)
      setAuthForm(initialAuthForm)
      setSuccess(isRegister ? 'Account created successfully.' : 'Logged in successfully.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Authentication failed. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('mycash_token')
    localStorage.removeItem('mycash_user')
    setToken('')
    setUser(null)
    setExpenses([])
    setSummary({ total_expenses: 0, total_categories: 0, total_transactions: 0 })
    setError('')
    setSuccess('You have been logged out.')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData(initialForm)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const amount = Number(formData.amount)
    if (!formData.category || !formData.expense_date || !amount || amount <= 0) {
      setError('Please enter a valid amount, category, and date.')
      return
    }

    try {
      const payload = {
        amount,
        category: formData.category,
        description: formData.description,
        expense_date: formData.expense_date,
      }

      const saved = await saveExpense(editingId, payload)
      if (editingId) {
        setExpenses((prev) => prev.map((item) => (item.id === editingId ? saved : item)))
        setSuccess('Expense updated successfully.')
      } else {
        setExpenses((prev) => [saved, ...prev])
        setSuccess('Expense added successfully.')
      }

      resetForm()
      const refreshedSummary = await getDashboardSummary()
      setSummary(refreshedSummary)
    } catch (err) {
      setError('Unable to save expense right now. Please try again.')
    }
  }

  const handleEdit = (expense) => {
    setEditingId(expense.id)
    setFormData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description || '',
      expense_date: expense.expense_date,
    })
    setError('')
    setSuccess('')
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')
    if (!confirmed) return

    try {
      await deleteExpense(id)
      setExpenses((prev) => prev.filter((expense) => expense.id !== id))
      setSuccess('Expense deleted successfully.')
      if (editingId === id) resetForm()
      const refreshedSummary = await getDashboardSummary()
      setSummary(refreshedSummary)
    } catch (err) {
      setError('Unable to delete expense right now.')
    }
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()

    if (!chatInput.trim()) return

    const userMessage = { sender: 'user', text: chatInput.trim() }
    setChatMessages((prev) => [...prev, userMessage])

    try {
      const response = await askChatbot(chatInput.trim())
      const assistantReply = { sender: 'assistant', text: response.answer }
      setChatMessages((prev) => [...prev, assistantReply])
    } catch (err) {
      const assistantReply = { sender: 'assistant', text: 'I could not answer that right now. Please try again.' }
      setChatMessages((prev) => [...prev, assistantReply])
    }

    setChatInput('')
  }

  if (!token || !user) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-toggle">
            <button type="button" className={`secondary-btn ${!isRegister ? 'active' : ''}`} onClick={() => {
              setIsRegister(false)
              setShowPasswordHint(false)
              setError('')
              setSuccess('')
            }}>
              Login
            </button>
            <button type="button" className={`secondary-btn ${isRegister ? 'active' : ''}`} onClick={() => {
              setIsRegister(true)
              setShowPasswordHint(true)
              setError('')
              setSuccess('')
            }}>
              Register
            </button>
          </div>

          <div className="mode-badge">{isRegister ? 'Register mode' : 'Login mode'}</div>
          <h2>{isRegister ? 'Create account' : 'Welcome back'}</h2>
          <p className="auth-subtitle">{isRegister ? 'Create a new account to manage your own expense data.' : 'Sign in to view your own expense history and dashboard.'}</p>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {isRegister && (
              <label>
                Name
                <input type="text" name="name" value={authForm.name} onChange={handleAuthChange} placeholder="Your name" required />
              </label>
            )}

            <label>
              Email
              <input type="email" name="email" value={authForm.email} onChange={handleAuthChange} placeholder="you@example.com" required />
            </label>

            <label>
              Password
              <input type="password" name="password" value={authForm.password} onChange={handleAuthChange} placeholder="Password" required />
            </label>

            {showPasswordHint && (
              <p className="password-hint">Password must be at least 8 characters long for registration.</p>
            )}

            <button type="submit" className="primary-btn">
              {isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MyCash</p>
          <h1>Track Every Rupee Smarter</h1>
        </div>
      </header>

      <main className="layout-grid">
        <section className="panel form-panel">
          <div className="user-badge">
            <span>Welcome, {user.name}</span>
            <button type="button" className="secondary-btn" onClick={handleLogout}>Logout</button>
          </div>

          <h2>{editingId ? 'Edit Expense' : 'Add New Expense'}</h2>

          <form onSubmit={handleSubmit} className="expense-form">
            <label>
              Amount
              <input type="number" name="amount" min="0.01" step="0.01" value={formData.amount} onChange={handleChange} placeholder="Enter amount" />
            </label>

            <label>
              Category
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="">Select category</option>
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Description
              <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Optional note" />
            </label>

            <label>
              Expense Date
              <input type="date" name="expense_date" value={formData.expense_date} onChange={handleChange} />
            </label>

            <div className="button-row">
              <button type="submit" className="primary-btn">{editingId ? 'Update Expense' : 'Add Expense'}</button>
              {editingId && (
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}
        </section>

        <section className="panel summary-panel">
          <h2>Dashboard Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <span>Total Expenses</span>
              <strong>₹{summary.total_expenses.toLocaleString()}</strong>
            </div>
            <div className="summary-card">
              <span>Total Categories</span>
              <strong>{summary.total_categories}</strong>
            </div>
            <div className="summary-card">
              <span>Total Transactions</span>
              <strong>{summary.total_transactions}</strong>
            </div>
          </div>
        </section>

        <section className="panel list-panel">
          <div className="section-head">
            <h2>Expense List</h2>
            <span>{visibleExpenses.length} items</span>
          </div>

          <div className="category-tabs">
            <button
              className={`tab-btn ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
              type="button"
            >
              All
            </button>
            {categoryOptions.map((category) => (
              <button
                key={category}
                className={`tab-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loader">Loading expenses...</div>
          ) : visibleExpenses.length === 0 ? (
            <div className="empty-state">No expenses added yet for this category.</div>
          ) : (
            <div className="expense-list">
              {visibleExpenses.map((expense) => (
                <article key={expense.id} className="expense-item">
                  <div>
                    <p className="expense-amount">₹{Number(expense.amount).toLocaleString()}</p>
                    <p className="expense-category">{expense.category}</p>
                    <p className="expense-description">{expense.description || 'No description'}</p>
                    <p className="expense-date">{expense.expense_date}</p>
                  </div>
                  <div className="item-actions">
                    <button className="secondary-btn" onClick={() => handleEdit(expense)}>Edit</button>
                    <button className="danger-btn" onClick={() => handleDelete(expense.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel chat-panel">
          <div className="section-head">
            <h2>AI Assistant</h2>
            <span>Ask about expenses</span>
          </div>

          <div className="chat-box">
            {chatMessages.map((message, index) => (
              <div key={index} className={`chat-message ${message.sender}`}>
                <strong>{message.sender === 'user' ? 'You' : 'AI'}:</strong>
                <span>{message.text}</span>
              </div>
            ))}
          </div>

          <form className="chat-form" onSubmit={handleChatSubmit}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask any question about your expenses..."
            />
            <button type="submit" className="primary-btn">Send</button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
