import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Components
import Navbar from './components/Layout/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AskQuestion from './pages/AskQuestion'
import QuestionDetail from './pages/QuestionDetail'
import Profile from './pages/Profile'
import ProtectedRoute from './components/Auth/ProtectedRoute'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading StackIt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          <Route path="/users/:id" element={<Profile />} />
          
          {/* Protected Routes */}
          <Route path="/ask" element={
            <ProtectedRoute>
              <AskQuestion />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App