import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, Home, Heart, MessageSquare, Calendar, AlertCircle, Wrench } from "lucide-react"
import { useNotifications } from "../../hooks/useNotifications"

interface NotificationDropdownProps {
  onClose: () => void;
  unreadCount: number;
}

export function NotificationDropdown({ onClose, unreadCount: propUnreadCount }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(true) // Always open when rendered
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all')
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  // Format time ago string
  const formatTimeAgo = (createdAt: string): string => {
    const now = new Date()
    const created = new Date(createdAt)
    const seconds = Math.floor((now.getTime() - created.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return created.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Home className="h-4 w-4 text-sky-600" />
      case 'message':
        return <MessageSquare className="h-4 w-4 text-green-600" />
      case 'favorite':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'appointment':
        return <Calendar className="h-4 w-4 text-purple-600" />
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-blue-600" />
      case 'system':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  // Filter notifications based on active filter
  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'unread') {
      return !notification.read
    }
    return true // 'all' filter
  })

  // NEW: Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.notification-dropdown-container')) {
        setIsOpen(false) // ✅ USE setIsOpen
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // NEW: Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false) // ✅ USE setIsOpen
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])


  if (!isOpen) return null

  return (
    <div className="notification-dropdown-container fixed right-4 top-20 w-[380px] max-h-[70vh] z-50 flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
      {/* Dropdown Content */}
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button 
                  className="p-1.5 hover:bg-sky-100 rounded-full transition-colors"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <CheckCheck className="h-5 w-5 text-sky-600" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1">
            <button 
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                activeFilter === 'all' 
                  ? 'text-sky-600 bg-sky-100' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                activeFilter === 'unread' 
                  ? 'text-sky-600 bg-sky-100' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter('unread')}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="h-8 w-8 border-4 border-gray-300 border-t-sky-600 rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : (filteredNotifications && filteredNotifications.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-lg font-medium">
                {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
              <p className="text-sm">
                {activeFilter === 'unread' ? 'You\'re all caught up!' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                data-notification
                data-read={notification.read}
                className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                  !notification.read ? 'bg-sky-50/50' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    notification.type === 'property' ? 'bg-sky-100' :
                    notification.type === 'message' ? 'bg-green-100' :
                    notification.type === 'favorite' ? 'bg-red-100' :
                    notification.type === 'appointment' ? 'bg-purple-100' : 
                    notification.type === 'system' ? 'bg-blue-100' :
                    notification.type === 'maintenance' ? 'bg-blue-100' :'bg-orange-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`font-semibold text-sm ${
                      !notification.read ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-sky-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    !notification.read ? 'text-gray-800' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                </div>

                {/* Read indicator */}
                {notification.read && (
                  <div className="flex-shrink-0 mt-1">
                    <Check className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}