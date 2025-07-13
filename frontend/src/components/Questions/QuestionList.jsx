import React from 'react'
import QuestionCard from './QuestionCard'
import { MessageCircle } from 'lucide-react'

const QuestionList = ({ questions, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="card p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No questions found</h3>
        <p className="text-gray-500">Be the first to ask a question!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <QuestionCard key={question._id} question={question} />
      ))}
    </div>
  )
}

export default QuestionList