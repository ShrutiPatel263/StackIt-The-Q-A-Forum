import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import QuestionList from '../components/Questions/QuestionList'
import { Plus, Filter, Search } from 'lucide-react'

const Home = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('newest')
  const [selectedTag, setSelectedTag] = useState('')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  useEffect(() => {
    fetchQuestions()
  }, [currentPage, sortBy, selectedTag, searchParams])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        sort: sortBy,
        ...(selectedTag && { tag: selectedTag }),
        ...(searchParams.get('search') && { search: searchParams.get('search') })
      })

      const response = await axios.get(`/api/questions?${params}`)
      setQuestions(response.data.questions)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Fetch questions error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() })
    } else {
      setSearchParams({})
    }
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchParams({})
    setSelectedTag('')
    setSearchQuery('')
    setCurrentPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            All Questions
          </h1>
          <p className="text-gray-600">
            Discover and share knowledge with the community
          </p>
        </div>
        
        {user && (
          <Link
            to="/ask"
            className="mt-4 md:mt-0 btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ask Question</span>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </form>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="votes">Most Voted</option>
            <option value="views">Most Viewed</option>
          </select>

          {/* Tag Filter */}
          <input
            type="text"
            placeholder="Filter by tag"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="input-field md:w-48"
          />

          {/* Clear Filters */}
          {(searchParams.get('search') || selectedTag) && (
            <button
              onClick={clearFilters}
              className="btn-secondary whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      <QuestionList questions={questions} loading={loading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>
      )}

      {/* Welcome Message for Guests */}
      {!user && (
        <div className="card p-8 mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Join the StackIt Community
          </h2>
          <p className="text-gray-600 mb-6">
            Sign up to ask questions, provide answers, and connect with developers worldwide
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="btn-primary">
              Sign Up Free
            </Link>
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home