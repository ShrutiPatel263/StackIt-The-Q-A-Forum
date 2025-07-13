import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { User, Calendar, Award, MessageCircle, HelpCircle } from 'lucide-react'

const Profile = () => {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [id])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/users/${id}`)
      setUser(response.data.user)
      setStats(response.data.stats)
    } catch (error) {
      console.error('Fetch user profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 animate-pulse">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded mb-2 w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">User not found</h2>
      </div>
    )
  }

  const isOwnProfile = currentUser && currentUser._id === user._id

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="card p-8">
        <div className="flex items-start space-x-8">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{user.username}</h1>
              {user.role === 'admin' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  Admin
                </span>
              )}
            </div>

            <div className="flex items-center space-x-6 text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>{user.reputation} reputation</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="text-gray-600">
              <p className="mb-2">
                <strong>Email:</strong> {isOwnProfile ? user.email : 'Private'}
              </p>
              <p>
                <strong>Last seen:</strong> {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.questions}</h3>
            <p className="text-gray-600">Questions Asked</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.answers}</h3>
            <p className="text-gray-600">Answers Posted</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.reputation}</h3>
            <p className="text-gray-600">Reputation Points</p>
          </div>
        </div>
      )}

      {/* Activity Summary */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity Summary</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Member since</span>
            <span className="font-medium text-gray-800">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Total contributions</span>
            <span className="font-medium text-gray-800">
              {stats ? stats.questions + stats.answers : 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Account status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile