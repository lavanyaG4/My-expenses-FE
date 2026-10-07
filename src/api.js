import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
})

const getToken = () => localStorage.getItem('mycash_token')

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload)
  return response.data
}

export const loginUser = async (payload) => {
  const response = await api.post('/auth/login', payload)
  return response.data
}

export const getExpenses = async () => {
  const response = await api.get('/expenses')
  return response.data
}

export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary')
  return response.data
}

export const saveExpense = async (id, payload) => {
  if (id) {
    const response = await api.put(`/expenses/${id}`, payload)
    return response.data
  }

  const response = await api.post('/expenses', payload)
  return response.data
}

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`)
  return response.data
}

export const askChatbot = async (message) => {
  const response = await api.post('/chat', { message })
  return response.data
}
