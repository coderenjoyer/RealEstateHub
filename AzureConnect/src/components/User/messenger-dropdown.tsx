import { useState, useRef, useEffect } from "react"
import { Search, X, Phone, Video, Minus, Send, Image, Smile, ThumbsUp, Trash2, Heart } from "lucide-react"

type ChatMessage = {
  id: number
  sender: 'me' | 'them'
  text: string
  time: string
  type?: 'call'
  reactions?: string[]
}

interface MessengerDropdownProps {
  onClose: () => void;
  unreadCount: number;
}

export function MessengerDropdown({ onClose, unreadCount }: MessengerDropdownProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isHoveringEmojiPicker, setIsHoveringEmojiPicker] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all')
  const [conversations, setConversations] = useState<Array<{
    id: number
    name: string
    message: string
    time: string
    avatar: string
    unread: boolean
    online: boolean
    subtitle?: string
    messages: ChatMessage[]
  }>>([
    {
      id: 1,
      name: "Sarah Johnson - Real Estate Agent",
      message: "Hi! I have some great properties that match your criteria...",
      time: "3m",
      avatar: "SJ",
      unread: false,
      online: true,
      messages: [
        { id: 1, sender: "them", text: "Hi! I have some great properties that match your criteria", time: "6:20 PM" },
        { id: 2, sender: "me", text: "That sounds interesting! What areas are you focusing on?", time: "6:23 PM" },
        { id: 3, sender: "them", text: "I have listings in BGC, Makati, and Ortigas. All premium locations", time: "6:25 PM" },
        { id: 4, sender: "them", text: "Would you like to schedule a viewing this weekend?", time: "6:26 PM" }
      ]
    },
    {
      id: 2,
      name: "Property Investment Group",
      subtitle: "Real Estate Investors Network",
      message: "Mike Chen shared a new investment opportunity.",
      time: "3m",
      avatar: "PI",
      unread: true,
      online: false,
      messages: [
        { id: 1, sender: "them", text: "Mike Chen shared a new investment opportunity in Cebu", time: "6:15 PM" }
      ]
    },
    {
      id: 3,
      name: "Luxury Properties Manila",
      subtitle: "Premium Real Estate",
      message: "New luxury condo in BGC - 3BR, 2BA, ₱15M",
      time: "4m",
      avatar: "LP",
      unread: true,
      online: false,
      messages: [
        { id: 1, sender: "them", text: "New luxury condo in BGC - 3BR, 2BA, ₱15M. Interested?", time: "6:10 PM" }
      ]
    },
    {
      id: 4,
      name: "Property Management Team",
      message: "Your rental property maintenance is scheduled for tomorrow",
      time: "10m",
      avatar: "PM",
      unread: true,
      online: false,
      messages: [
        { id: 1, sender: "them", text: "Your rental property maintenance is scheduled for tomorrow at 9 AM", time: "5:55 PM" }
      ]
    },
    {
      id: 5,
      name: "Michael Rodriguez - Mortgage Broker",
      message: "Your loan pre-approval is ready! Let's discuss the next steps",
      time: "30m",
      avatar: "MR",
      unread: false,
      online: false,
      messages: [
        { id: 1, sender: "them", text: "Missed audio call", time: "6:44 PM", type: "call" },
        { id: 2, sender: "them", text: "Your loan pre-approval is ready! Let's discuss the next steps", time: "6:45 PM" },
        { id: 3, sender: "me", text: "Great! I'll call you back in a few minutes", time: "6:46 PM" }
      ]
    },
    {
      id: 6,
      name: "Real Estate News & Updates",
      message: "You: Thanks for the market insights!",
      time: "30m",
      avatar: "RE",
      unread: false,
      online: false,
      messages: [
        { id: 1, sender: "me", text: "Thanks for the market insights! Very helpful", time: "6:30 PM", reactions: [] }
      ]
    },
    {
      id: 7,
      name: "Property Viewing Group",
      message: "You: The penthouse in BGC looks amazing!",
      time: "1h",
      avatar: "PV",
      unread: true,
      online: true,
      messages: [
        { id: 1, sender: "them", text: "Hey! Are you still interested in the BGC penthouse?", time: "5:00 PM", reactions: [] },
        { id: 2, sender: "me", text: "Yes! I'd love to schedule a viewing. When's available?", time: "5:01 PM", reactions: [] },
        { id: 3, sender: "them", text: "I have slots this weekend. Saturday 2 PM or Sunday 10 AM?", time: "5:02 PM", reactions: [] },
        { id: 4, sender: "me", text: "Saturday 2 PM works perfectly for me!", time: "5:03 PM", reactions: [] },
        { id: 5, sender: "them", text: "Great! I'll send you the address and parking details", time: "5:04 PM", reactions: [] },
        { id: 6, sender: "me", text: "Perfect! What's the asking price again?", time: "5:05 PM", reactions: [] },
        { id: 7, sender: "them", text: "It's ₱18M negotiable. The owner is motivated to sell", time: "5:06 PM", reactions: [] },
        { id: 8, sender: "me", text: "That's within my budget range. What about the HOA fees?", time: "5:07 PM", reactions: [] },
        { id: 9, sender: "them", text: "HOA is ₱8,500/month. Includes gym, pool, and 24/7 security", time: "5:08 PM", reactions: [] },
        { id: 10, sender: "me", text: "That's reasonable for the amenities. How old is the building?", time: "5:09 PM", reactions: [] },
        { id: 11, sender: "them", text: "Built in 2018, so it's relatively new. All modern fixtures", time: "5:10 PM", reactions: [] },
        { id: 12, sender: "me", text: "Excellent! What about the view from the unit?", time: "5:11 PM", reactions: [] },
        { id: 13, sender: "them", text: "It has a stunning city view! Floor-to-ceiling windows", time: "5:12 PM", reactions: [] },
        { id: 14, sender: "me", text: "Sounds amazing! I'm really looking forward to the viewing", time: "5:13 PM", reactions: [] },
        { id: 15, sender: "them", text: "I'll also bring the floor plans and recent comparable sales", time: "5:14 PM", reactions: [] },
        { id: 16, sender: "me", text: "That would be very helpful. Thank you for being so thorough!", time: "5:15 PM", reactions: [] },
        { id: 17, sender: "them", text: "My pleasure! I want to make sure you have all the information you need", time: "5:16 PM", reactions: [] },
        { id: 18, sender: "me", text: "I appreciate that. This could be the perfect home for us", time: "5:17 PM", reactions: [] },
        { id: 19, sender: "them", text: "I have a good feeling about this one! See you Saturday", time: "5:18 PM", reactions: [] },
        { id: 20, sender: "me", text: "Looking forward to it! Should I bring anything specific?", time: "5:19 PM", reactions: [] },
        { id: 21, sender: "them", text: "Just bring a valid ID and your pre-approval letter if you have one", time: "5:20 PM", reactions: [] },
        { id: 22, sender: "me", text: "Perfect! I have both ready. See you at 2 PM", time: "5:21 PM", reactions: [] },
        { id: 23, sender: "them", text: "Great! I'll text you the exact address and building access code", time: "5:22 PM", reactions: [] },
        { id: 24, sender: "me", text: "Thank you! I'm excited to see this property", time: "5:23 PM", reactions: [] },
        { id: 25, sender: "them", text: "Me too! It's one of my favorite listings right now", time: "5:24 PM", reactions: [] },
        { id: 26, sender: "me", text: "That's a great sign! Talk to you soon", time: "5:25 PM", reactions: [] },
        { id: 27, sender: "them", text: "Have a great evening! See you Saturday", time: "5:26 PM", reactions: [] },
        { id: 28, sender: "me", text: "You too! Thanks again for everything", time: "5:27 PM", reactions: [] },
        { id: 29, sender: "them", text: "My pleasure! Looking forward to showing you the penthouse", time: "5:28 PM", reactions: [] },
        { id: 30, sender: "me", text: "Same here! Have a wonderful evening", time: "5:29 PM", reactions: [] },
        { id: 31, sender: "them", text: "Thank you! See you Saturday at 2 PM", time: "5:30 PM", reactions: [] },
        { id: 32, sender: "me", text: "Perfect! Have a great rest of your day", time: "5:31 PM", reactions: [] },
        { id: 33, sender: "them", text: "You too! Talk to you soon", time: "5:32 PM", reactions: [] },
        { id: 34, sender: "me", text: "Looking forward to it! Take care", time: "5:33 PM", reactions: [] },
        { id: 35, sender: "them", text: "Same here! See you Saturday", time: "5:34 PM", reactions: [] }
      ]
    }
  ])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const selectedConversation = conversations.find(c => c.id === selectedChat)
  
  // Filter conversations based on active filter
  const filteredConversations = conversations.filter(conv => {
    if (activeFilter === 'unread') {
      return conv.unread
    }
    return true // 'all' filter
  })

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }
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


  const handleDeleteMessage = (messageId: number) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedChat 
          ? { 
              ...conv, 
              messages: conv.messages.filter(msg => msg.id !== messageId) 
            }
          : conv
      )
    )
    setHoveredMessage(null)
  }

  const handleAddReaction = (messageId: number, emoji: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedChat 
          ? { 
              ...conv, 
              messages: conv.messages.map(msg => 
                msg.id === messageId 
                  ? { 
                      ...msg, 
                      reactions: [emoji] // Only one reaction per message
                    }
                  : msg
              )
            }
          : conv
      )
    )
    setShowEmojiPicker(false)
    setIsHoveringEmojiPicker(false)
    setHoveredMessage(null) // Hide options after reacting
  }

  const handleHeartToggle = (messageId: number) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedChat 
          ? { 
              ...conv, 
              messages: conv.messages.map(msg => 
                msg.id === messageId 
                  ? { 
                      ...msg, 
                      reactions: msg.reactions && msg.reactions.includes('❤️') ? [] : ['❤️']
                    }
                  : msg
              )
            }
          : conv
      )
    )
    setIsHoveringEmojiPicker(false)
    setHoveredMessage(null) // Hide options after toggling heart
  }

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓']

  // ✅ FIXED: Use setIsOpen
  useEffect(() => {
    if (!isOpen) {
      onClose()
    }
  }, [isOpen, onClose])

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (selectedChat && selectedConversation) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100)
    }
  }, [selectedChat, selectedConversation])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (selectedConversation) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100)
    }
  }, [selectedConversation?.messages])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.messenger-dropdown-container')) {
        setIsOpen(false) // ✅ USE setIsOpen
        onClose()
      }
      // Close emoji picker when clicking outside
      if (!target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false)
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
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                {/* ✅ USE unreadCount - Show dot */}
                {unreadCount > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
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
                placeholder="Search Messages"
                className="w-full pl-10 pr-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-200">
            <button 
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                activeFilter === 'all' 
                  ? 'text-sky-600 bg-sky-50' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                activeFilter === 'unread' 
                  ? 'text-sky-600 bg-sky-50' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter('unread')}
            >
              Unread
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-lg font-medium">
                  {activeFilter === 'unread' ? 'No unread messages' : 'No conversations'}
                </p>
                <p className="text-sm">
                  {activeFilter === 'unread' ? 'You\'re all caught up!' : 'Start a conversation'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
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
              ))
            )}
          </div>

          {/* Footer */}
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
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-white min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {selectedConversation.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} relative group`}
                onMouseEnter={() => setHoveredMessage(msg.id)}
                onMouseLeave={() => {
                  if (!isHoveringEmojiPicker && !showEmojiPicker) {
                    setHoveredMessage(null)
                  }
                }}
              >
                {msg.sender === 'them' && (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold text-[10px] mr-2 flex-shrink-0">
                    {selectedConversation.avatar}
                  </div>
                )}
                <div className={`max-w-[72%] ${msg.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {msg.type === 'call' ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gray-100 transition-colors">
                      <div className="p-1 bg-red-100 rounded-full">
                        <Phone className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{msg.text}</p>
                        <p className="text-xs text-gray-500">{msg.time}</p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`px-3 py-1.5 rounded-2xl transition-colors relative max-w-[72%] ${
                        msg.sender === 'me' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>

                      {msg.reactions && msg.reactions.length > 0 && (
                        <span 
                          className="absolute -bottom-2  right-0 text-lg select-none pointer-events-none"
                          style={{ lineHeight: '1' }}
                          aria-label="reaction"
                          role="img"
                        >
                          {msg.reactions[0]}
                        </span>
                      )}
                    </div>
                  )} 
                  <span className="text-xs text-gray-500 px-1">{msg.time}</span>
                </div>
                
                {/* Action buttons - show on hover, positioned on the right */}
                {hoveredMessage === msg.id && (
                  <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 ${
                    msg.sender === 'me' ? 'left-2' : 'right-2'
                  }`}>
                    <button
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-md"
                      onClick={() => handleHeartToggle(msg.id)}
                      title={msg.reactions && msg.reactions.includes('❤️') ? "Remove heart" : "Add heart"}
                    >
                      <Heart className={`h-4 w-4 ${
                        msg.reactions && msg.reactions.includes('❤️') 
                          ? 'text-red-500' 
                          : 'text-gray-500'
                      }`} />
                    </button>
                    <button
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-md"
                      onClick={() => {
                        setShowEmojiPicker(true)
                        setIsHoveringEmojiPicker(true)
                      }}
                      title="More reactions"
                    >
                      <Smile className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-md"
                      onClick={() => handleDeleteMessage(msg.id)}
                      title="Delete message"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-2 border-t border-gray-200 bg-white">
            {/* Emoji Picker */}
            {showEmojiPicker && hoveredMessage && (
              <div 
                className="emoji-picker-container absolute bottom-16 right-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 max-h-32 overflow-y-auto z-10"
                onMouseEnter={() => setIsHoveringEmojiPicker(true)}
                onMouseLeave={() => {
                  setIsHoveringEmojiPicker(false)
                  setShowEmojiPicker(false)
                  setHoveredMessage(null)
                }}
              >
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      className="p-1 hover:bg-gray-100 rounded text-lg"
                      onClick={() => {
                        handleAddReaction(hoveredMessage, emoji)
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