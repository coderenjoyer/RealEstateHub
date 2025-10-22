import { useState, useRef, useEffect } from "react"
import { Search, MoreHorizontal, X, Phone, Video, Minus, Send, Image, Smile, ThumbsUp } from "lucide-react"
import { Button } from "../../components/ui/button"

type ChatMessage = {
  id: number
  sender: 'me' | 'them'
  text: string
  time: string
  type?: 'call'
}

interface MessengerDropdownProps {
  onClose: () => void;
  unreadCount: number;
}

export function MessengerDropdown({ onClose, unreadCount }: MessengerDropdownProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const conversations: Array<{
    id: number
    name: string
    message: string
    time: string
    avatar: string
    unread: boolean
    online: boolean
    subtitle?: string
    messages: ChatMessage[]
  }> = [
    {
      id: 1,
      name: "SD for real this time",
      message: "kiss ko lalat: naay bag oh meeting ...",
      time: "3m",
      avatar: "SD",
      unread: false,
      online: true,
      messages: [
        { id: 1, sender: "them", text: "naa nay meet?", time: "6:20 PM" },
        { id: 2, sender: "me", text: "kiss ko lalat", time: "6:23 PM" },
        { id: 3, sender: "them", text: "@Lorenz James Bas", time: "6:23 PM" },
        { id: 4, sender: "them", text: "naay bag oh meeting oyyy", time: "6:25 PM" }
      ]
    },
    {
      id: 2,
      name: "PH Pokemon TCG Buy And Sell",
      subtitle: "Card Advice By Jezrah",
      message: "Patrick Kim sent a photo.",
      time: "3m",
      avatar: "PP",
      unread: true,
      online: false,
      messages: [
        { id: 1, sender: "them", text: "Patrick Kim sent a photo.", time: "6:15 PM" }
      ]
    },
    {
      id: 3,
      name: "PH Pokemon TCG Buy And Sell",
      subtitle: "Buy&Sell by Jezrah",
      message: "John: Bubble mew psa 10 4k o...",
      time: "4m",
      avatar: "PP",
      unread: true,
      online: false,
      messages: [
        { id: 1, sender: "them", text: "Bubble mew psa 10 4k o...", time: "6:10 PM" }
      ]
    },
    {
      id: 4,
      name: "Eskwadsakalam🔥🔥",
      message: "KITOYI😂: sakpan hilanat...",
      time: "10m",
      avatar: "ES",
      unread: true,
      online: false,
      messages: [
        { id: 1, sender: "them", text: "sakpan hilanat...", time: "5:55 PM" }
      ]
    },
    {
      id: 5,
      name: "Fernandez Manette Ferdinand",
      message: "GD pm kuya on line kiss pka nag ...",
      time: "30m",
      avatar: "FM",
      unread: false,
      online: false,
      messages: [
        { id: 1, sender: "them", text: "Missed audio call", time: "6:44 PM", type: "call" },
        { id: 2, sender: "them", text: "Abot na mama nmu kuya....", time: "6:45 PM" },
        { id: 3, sender: "me", text: "Ga klasi pako pa", time: "6:46 PM" }
      ]
    },
    {
      id: 6,
      name: "Gaymers 🏳️‍🌈",
      message: "You: Gegege sud ko taud2",
      time: "30m",
      avatar: "G",
      unread: false,
      online: false,
      messages: [
        { id: 1, sender: "me", text: "Gegege sud ko taud2", time: "6:30 PM" }
      ]
    }
  ]

  const selectedConversation = conversations.find(c => c.id === selectedChat)
  // ✅ FIXED: Use prop unreadCount instead of local calculation
  // const localUnreadCount = conversations.filter(c => c.unread).length

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      console.log('Files selected:', files)
    }
  }

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓']

  // ✅ FIXED: Use setIsOpen
  useEffect(() => {
    if (!isOpen) {
      onClose()
    }
  }, [isOpen, onClose])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.messenger-dropdown-container')) {
        setIsOpen(false) // ✅ USE setIsOpen
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close on Escape key
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

  const handleCloseChat = () => {
    setSelectedChat(null)
  }

  // ✅ FIXED: Use isOpen in render
  if (!isOpen) return null

  // ✅ FIXED: Use unreadCount in UI (show in header)
  return (
    <div className="messenger-dropdown-container fixed right-20 top-20 w-[380px] max-h-[70vh] z-50 flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
      
      {/* Chat List Dropdown */}
      {!selectedChat && (
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[70vh]">
          {/* Header - ✅ USE unreadCount */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Chats</h2>
                {/* ✅ USE unreadCount - Show badge */}
                {unreadCount > 0 && (
                  <Button size="sm" variant="destructive" className="h-5 w-5 p-0 text-xs">
                    {unreadCount}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setIsOpen(false)} // ✅ USE setIsOpen
                >
                  <MoreHorizontal className="h-5 w-5 text-gray-600" />
                </button>
                <button 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setIsOpen(false)} // ✅ USE setIsOpen
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Messenger"
                className="w-full pl-10 pr-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-200">
            <button className="px-3.5 py-1.5 text-sm font-semibold text-sky-600 bg-sky-50 rounded-full">
              All
            </button>
            <button className="px-3.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">
              Unread
            </button>
            <button className="px-3.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">
              Groups
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center gap-2.5 p-2.5 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                onClick={() => setSelectedChat(conv.id)}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold text-base">
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {conv.name}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {conv.time}
                    </span>
                  </div>
                  {conv.subtitle && (
                    <p className="text-xs text-gray-500 mb-0.5 truncate">
                      {conv.subtitle}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${conv.unread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      {conv.message}
                    </p>
                    {conv.unread && (
                      <div className="h-2.5 w-2.5 bg-sky-500 rounded-full flex-shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-gray-200">
            <button 
              className="w-full text-center text-sky-600 hover:bg-sky-50 py-2 rounded-lg text-sm font-semibold transition-colors"
              onClick={handleViewAll}
            >
              See all in Messenger
            </button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {selectedChat && selectedConversation && (
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex flex-col h-[70vh] w-[380px]">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-purple-600 font-semibold text-xs">
                  {selectedConversation.avatar}
                </div>
                {selectedConversation.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-purple-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm truncate">
                  {selectedConversation.name}
                </h3>
                {selectedConversation.online && (
                  <p className="text-xs text-purple-100">Active now</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <Phone className="h-4 w-4 text-white" />
              </button>
              <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <Video className="h-4 w-4 text-white" />
              </button>
              <button 
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                onClick={handleCloseChat}
              >
                <Minus className="h-4 w-4 text-white" />
              </button>
              <button 
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                onClick={() => setIsOpen(false)} // ✅ USE setIsOpen
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-white min-h-0">
            {selectedConversation.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'them' && (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold text-[10px] mr-2 flex-shrink-0">
                    {selectedConversation.avatar}
                  </div>
                )}
                <div className={`max-w-[72%] ${msg.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {msg.type === 'call' ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gray-100">
                      <div className="p-1 bg-red-100 rounded-full">
                        <Phone className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{msg.text}</p>
                        <p className="text-xs text-gray-500">{msg.time}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`px-3 py-1.5 rounded-2xl ${
                      msg.sender === 'me' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  )}
                  <span className="text-xs text-gray-500 px-1">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-2 border-t border-gray-200 bg-white">
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 max-h-32 overflow-y-auto z-10">
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      className="p-1 hover:bg-gray-100 rounded text-lg"
                      onClick={() => {
                        console.log('Emoji selected:', emoji)
                        setShowEmojiPicker(false)
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-1.5">
              <button 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                onClick={handleFileUpload}
              >
                <Image className="h-4 w-4 text-sky-600" />
              </button>
              <button 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4 text-sky-600" />
              </button>
              <input
                type="text"
                placeholder="Aa"
                className="flex-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                <ThumbsUp className="h-4 w-4 text-sky-600" />
              </button>
              <button className="p-1 bg-sky-500 hover:bg-sky-600 rounded-full transition-colors flex-shrink-0">
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}