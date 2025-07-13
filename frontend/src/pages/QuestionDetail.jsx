import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'
import RichTextEditor from '../components/Editor/RichTextEditor'
import { 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Eye, 
  CheckCircle, 
  User,
  Calendar,
  Award
} from 'lucide-react'

const QuestionDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answerContent, setAnswerContent] = useState('')
  const [submittingAnswer, setSubmittingAnswer] = useState(false)

  useEffect(() => {
    fetchQuestion()
  }, [id])

  const fetchQuestion = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/questions/${id}`)
      setQuestion(response.data)
    } catch (error) {
      console.error('Fetch question error:', error)
      toast.error('Question not found')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (type, targetType, targetId) => {
    if (!user) {
      toast.error('Please log in to vote')
      return
    }

    try {
      const endpoint = targetType === 'question' ? 
        `/api/questions/${targetId}/vote` : 
        `/api/answers/${targetId}/vote`
      
      await axios.post(endpoint, { type })
      fetchQuestion()
    } catch (error) {
      console.error('Vote error:', error)
      toast.error('Failed to vote')
    }
  }

  const handleAcceptAnswer = async (answerId) => {
    if (!user || question.author._id !== user._id) {
      return
    }

    try {
      await axios.post(`/api/answers/${answerId}/accept`)
      toast.success('Answer accepted!')
      fetchQuestion()
    } catch (error) {
      console.error('Accept answer error:', error)
      toast.error('Failed to accept answer')
    }
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please log in to answer')
      return
    }

    if (!answerContent.trim() || answerContent === '<p><br></p>') {
      toast.error('Please write an answer')
      return
    }

    setSubmittingAnswer(true)

    try {
      await axios.post('/api/answers', {
        content: answerContent,
        questionId: id
      })
      toast.success('Answer posted successfully!')
      setAnswerContent('')
      fetchQuestion()
    } catch (error) {
      console.error('Submit answer error:', error)
      toast.error('Failed to post answer')
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const VoteButtons = ({ item, type, itemId }) => {
    const hasUpvoted = user && item.votes.upvotes.includes(user._id)
    const hasDownvoted = user && item.votes.downvotes.includes(user._id)
    const voteScore = item.votes.upvotes.length - item.votes.downvotes.length

    return (
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={() => handleVote('up', type, itemId)}
          className={`vote-btn ${hasUpvoted ? 'active' : ''}`}
          disabled={!user}
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        
        <span className={`text-lg font-bold ${
          voteScore > 0 ? 'text-green-600' : 
          voteScore < 0 ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {voteScore}
        </span>
        
        <button
          onClick={() => handleVote('down', type, itemId)}
          className={`vote-btn ${hasDownvoted ? 'active' : ''}`}
          disabled={!user}
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Question not found</h2>
        <Link to="/" className="btn-primary">
          Back to Questions
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Question */}
      <div className="card p-8">
        <div className="flex items-start space-x-6">
          {/* Vote Buttons */}
          <VoteButtons 
            item={question} 
            type="question" 
            itemId={question._id} 
          />

          {/* Question Content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {question.title}
            </h1>

            <div 
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            {/* Question Meta */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{question.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{question.answers.length} answers</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {question.author.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-800">{question.author.username}</p>
                  <p className="text-gray-500">
                    asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {question.answers
          .sort((a, b) => {
            // Sort accepted answer first, then by vote score
            if (a.isAccepted && !b.isAccepted) return -1
            if (!a.isAccepted && b.isAccepted) return 1
            return (b.votes.upvotes.length - b.votes.downvotes.length) - 
                   (a.votes.upvotes.length - a.votes.downvotes.length)
          })
          .map((answer) => (
            <div 
              key={answer._id} 
              className={`card p-8 ${answer.isAccepted ? 'border-l-4 border-green-500 bg-green-50/50' : ''}`}
            >
              <div className="flex items-start space-x-6">
                {/* Vote Buttons */}
                <div className="flex flex-col items-center space-y-2">
                  <VoteButtons 
                    item={answer} 
                    type="answer" 
                    itemId={answer._id} 
                  />
                  
                  {/* Accept Button */}
                  {user && question.author._id === user._id && !answer.isAccepted && (
                    <button
                      onClick={() => handleAcceptAnswer(answer._id)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                      title="Accept this answer"
                    >
                      <CheckCircle className="w-6 h-6" />
                    </button>
                  )}
                  
                  {answer.isAccepted && (
                    <div className="p-2 text-green-600" title="Accepted answer">
                      <CheckCircle className="w-6 h-6 fill-current" />
                    </div>
                  )}
                </div>

                {/* Answer Content */}
                <div className="flex-1">
                  {answer.isAccepted && (
                    <div className="flex items-center space-x-2 mb-4 text-green-600">
                      <CheckCircle className="w-5 h-5 fill-current" />
                      <span className="font-medium">Accepted Answer</span>
                    </div>
                  )}

                  <div 
                    className="prose max-w-none mb-6"
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />

                  {/* Answer Meta */}
                  <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {answer.author.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">{answer.author.username}</p>
                        <p className="text-gray-500">
                          answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Answer Form */}
      {user ? (
        <div className="card p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Your Answer</h3>
          
          <form onSubmit={handleSubmitAnswer}>
            <div className="mb-6">
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here. Be thorough and explain your solution step by step."
              />
            </div>

            <button
              type="submit"
              disabled={submittingAnswer}
              className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingAnswer ? (
                <div className="flex items-center space-x-2">
                  <div className="loading-spinner"></div>
                  <span>Posting Answer...</span>
                </div>
              ) : (
                'Post Your Answer'
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Want to Answer?</h3>
          <p className="text-gray-600 mb-6">
            You need to be logged in to post an answer
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/login" className="btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn-secondary">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionDetail