import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import RichTextEditor from '../components/Editor/RichTextEditor'
import TagInput from '../components/Tags/TagInput'
import axios from 'axios'
import toast from 'react-hot-toast'
import { HelpCircle, Send } from 'lucide-react'

const AskQuestion = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const handleDescriptionChange = (value) => {
    setFormData({
      ...formData,
      description: value
    })
    if (errors.description) {
      setErrors({
        ...errors,
        description: ''
      })
    }
  }

  const handleTagsChange = (tags) => {
    setFormData({
      ...formData,
      tags
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }

    if (!formData.description.trim() || formData.description === '<p><br></p>') {
      newErrors.description = 'Description is required'
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/questions', formData)
      toast.success('Question posted successfully!')
      navigate(`/questions/${response.data.question._id}`)
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to post question'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to ask a question.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-orange-600 rounded-full flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Ask a Question</h1>
            <p className="text-gray-600">Get help from the community</p>
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="card p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-primary-500">
        <h3 className="font-semibold text-gray-800 mb-3">Tips for asking a great question:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Be specific and clear in your title</li>
          <li>• Provide context and what you've tried</li>
          <li>• Include relevant code, error messages, or examples</li>
          <li>• Use appropriate tags to help others find your question</li>
        </ul>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card p-8">
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-lg font-semibold text-gray-800 mb-3">
              Question Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's your programming question? Be specific."
              className={`input-field text-lg ${errors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Question Details *
            </label>
            <div className={`${errors.description ? 'ring-2 ring-red-500 rounded-lg' : ''}`}>
              <RichTextEditor
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Provide all the details. What exactly are you trying to achieve? What have you tried? What errors are you getting?"
              />
            </div>
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Tags */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Tags *
            </label>
            <TagInput
              value={formData.tags}
              onChange={handleTagsChange}
              placeholder="Add up to 5 tags to describe what your question is about"
            />
            {errors.tags && (
              <p className="mt-2 text-sm text-red-600">{errors.tags}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Add tags to help others find and answer your question
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-warning disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Post Question</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AskQuestion