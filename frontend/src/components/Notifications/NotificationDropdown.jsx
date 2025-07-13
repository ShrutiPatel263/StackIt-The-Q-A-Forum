import React from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, CheckCircle, UserPlus, Bell } from 'lucide-react'

const NotificationDropdown = ({ notifications, onClose, onMarkAsRead }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'answer':
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'accept':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'mention':
        return <UserPlus className="w-4 h-4 text-purple-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id)
    }
    onClose()
  }

  return (
    <div className="absolute right-0 mt-2 w-80 card max-h-96 overflow-y-auto shadow-xl animate-slide-up">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
      </div>
      
      {notifications.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500">
          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="py-2">
          {notifications.map((notification) => (
            <Link
              key={notification._id}
              to={`/questions/${notification.relatedQuestion?._id}`}
              onClick={() => handleNotificationClick(notification)}
              className={`block px-4 py-3 hover:bg-gray-50 transition-colors duration-200 border-l-4 ${
                notification.isRead ? 'border-transparent' : 'border-primary-500 bg-primary-50/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                    {notification.message}
                  </p>
                  {notification.relatedQuestion && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {notification.relatedQuestion.title}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown