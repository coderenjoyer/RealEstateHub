import { useState, useEffect } from "react"
import { Bell, MoreHorizontal, Check, CheckCheck, Home, Heart, MessageSquare, Calendar, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"

type Notification = {
  id: number
  title: string
  message: string
  time: string
  type: 'property' | 'message' | 'favorite' | 'appointment' | 'system'
  read: boolean
  icon: string
}

interface NotificationDropdownProps {
  onClose: () => void;
  unreadCount: number;  // ✅ NEW
}

export function NotificationDropdown({ onClose, unreadCount }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(true) // Always open when rendered

  const notifications: Notification[] = [
    {
      id: 1,
      title: "New Property Match",
      message: "A 3-bedroom house in Downtown matches your preferences",
      time: "2m",
      type: 'property',
      read: false,
      icon: "🏠"
    },
    {
      id: 2,
      title: "Message from Agent",
      message: "Sarah Johnson sent you a message about the property viewing",
      time: "5m",
      type: 'message',
      read: false,
      icon: "💬"
    },
    {
      id: 3,
      title: "Property Added to Favorites",
      message: "You saved 'Modern Apartment in City Center' to your favorites",
      time: "1h",
      type: 'favorite',
      read: true,
      icon: "❤️"
    },
    {
      id: 4,
      title: "Appointment Reminder",
      message: "Property viewing scheduled for tomorrow at 2:00 PM",
      time: "2h",
      type: 'appointment',
      read: true,
      icon: "📅"
    },
    {
      id: 5,
      title: "Price Drop Alert",
      message: "The house you're interested in has reduced its price by $15,000",
      time: "3h",
      type: 'property',
      read: false,
      icon: "💰"
    },
    {
      id: 6,
      title: "System Update",
      message: "New features have been added to your dashboard",
      time: "1d",
      type: 'system',
      read: true,
      icon: "⚙️"
    },
    {
      id: 7,
      title: "New Message",
      message: "Mike Chen wants to schedule a property tour",
      time: "1d",
      type: 'message',
      read: true,
      icon: "💬"
    },
    {
      id: 8,
      title: "Market Update",
      message: "Real estate prices in your area have increased by 3.2%",
      time: "2d",
      type: 'system',
      read: true,
      icon: "📊"
    }
  ]

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
      case 'system':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const markAsRead = (id: number) => {
    console.log('Mark as read:', id)
  }

  const markAllAsRead = () => {
    console.log('Mark all as read')
  }

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

  const handleViewAll = () => {
    setIsOpen(false) // ✅ USE setIsOpen
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="notification-dropdown-container fixed right-4 top-20 w-[380px] max-h-[70vh] z-50 flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
      {/* Dropdown Content */}
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[70vh]">
        {/* Header - ✅ USE unreadCount + Button + setIsOpen */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-blue-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* ✅ UNREADCOUNT USED - Show badge */}
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <Button size="sm" variant="destructive" className="h-5 w-5 p-0 text-xs">
                  {unreadCount}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                className="p-1.5 hover:bg-sky-100 rounded-full transition-colors"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-5 w-5 text-sky-600" />
              </button>
              <button 
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setIsOpen(false)} // ✅ USE setIsOpen
              >
                <MoreHorizontal className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1">
            <button className="px-3.5 py-1.5 text-sm font-semibold text-sky-600 bg-sky-100 rounded-full">
              All
            </button>
            <button className="px-3.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">
              Unread
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                  !notification.read ? 'bg-sky-50/50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    notification.type === 'property' ? 'bg-sky-100' :
                    notification.type === 'message' ? 'bg-green-100' :
                    notification.type === 'favorite' ? 'bg-red-100' :
                    notification.type === 'appointment' ? 'bg-purple-100' :
                    'bg-orange-100'
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
                        {notification.time}
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

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button 
            className="w-full text-center text-sky-600 hover:bg-sky-100 py-2 rounded-lg text-sm font-semibold transition-colors"
            onClick={handleViewAll}
          >
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  )
}