import React from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, Eye, ArrowUp, ArrowDown, CheckCircle } from 'lucide-react'

const QuestionCard = ({ question }) => {
  const {
    _id,
    title,
    description,
    tags,
    author,
    answers = [],
    acceptedAnswer,
    votes = { upvotes: [], downvotes: [] },
    views = 0,
    createdAt,
    voteScore = 0,
    answerCount = 0
  } = question

  const truncateDescription = (text, maxLength = 150) => {
    const strippedText = text.replace(/<[^>]*>/g, '')
    return strippedText.length > maxLength 
      ? strippedText.substring(0, maxLength) + '...'
      : strippedText
  }

  return (
    <div className="card p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-transparent hover:border-primary-500">
      <div className="flex items-start justify-between">
        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <Link 
            to={`/questions/${_id}`}
            className="block group"
          >
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors duration-200 mb-2 line-clamp-2">
              {title}
            </h3>
          </Link>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {truncateDescription(description)}
          </p>
 
           {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.isArray(tags) && tags.map((tag, index) => (
              <span key={index} className="tag">
                {typeof tag === "string" ? tag : tag?.label || tag?.value || ""}
              </span>
            ))}
          </div>

          {/* Author and Time */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {author?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-gray-700">{author?.username}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-center space-y-4 ml-6 min-w-0">
          {/* Vote Score */}
          <div className="flex flex-col items-center">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
              voteScore > 0 ? 'bg-green-100 text-green-700' : 
              voteScore < 0 ? 'bg-red-100 text-red-700' : 
              'bg-gray-100 text-gray-600'
            }`}>
              {voteScore > 0 && <ArrowUp className="w-3 h-3" />}
              {voteScore < 0 && <ArrowDown className="w-3 h-3" />}
              <span>{Math.abs(voteScore)}</span>
            </div>
            <span className="text-xs text-gray-400 mt-1">votes</span>
          </div>

          {/* Answer Count */}
          <div className="flex flex-col items-center">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
              acceptedAnswer ? 'bg-green-100 text-green-700' : 
              answerCount > 0 ? 'bg-blue-100 text-blue-700' : 
              'bg-gray-100 text-gray-600'
            }`}>
              {acceptedAnswer && <CheckCircle className="w-3 h-3" />}
              <MessageCircle className="w-3 h-3" />
              <span>{answerCount}</span>
            </div>
            <span className="text-xs text-gray-400 mt-1">answers</span>
          </div>

          {/* Views */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
              <Eye className="w-3 h-3" />
              <span>{views}</span>
            </div>
            <span className="text-xs text-gray-400 mt-1">views</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard