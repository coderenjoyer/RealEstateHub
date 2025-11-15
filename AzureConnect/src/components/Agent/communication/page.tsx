"use client"

import { useState, useRef, useEffect } from "react"
import { AgentCommunicationLayout } from "@/components/layouts/AgentCommunicationLayout"
import { Plus, Send, Paperclip, Trash2, Search, MoreVertical, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Conversation {
  id: string
  name: string
  lastMessage: string
  avatar: string
  unread?: boolean
  time: string
}

interface Message {
  id: string
  conversationId: string
  sender: "user" | "other"
  text: string
  timestamp: string
  avatar: string
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Khalil Peque",
    lastMessage: "Hey there! I'm interested in the downtown property you listed.",
    avatar: "/cozy-suburban-house.png",
    unread: false,
    time: "2m ago"
  },
  {
    id: "2",
    name: "Jeff Morrison",
    lastMessage: "The inspection report for the Oak Street property is ready.",
    avatar: "/cozy-suburban-house.png",
    unread: true,
    time: "5m ago"
  },
  {
    id: "3",
    name: "Sarah Chen",
    lastMessage: "Thanks for the market analysis. I'll review it tomorrow.",
    avatar: "/cozy-suburban-house.png",
    unread: false,
    time: "1h ago"
  },
]

const allMessages: Message[] = [
  // Khalil's messages
  {
    id: "1-1",
    conversationId: "1",
    sender: "other",
    text: "Hey! How are you doing today? I wanted to check in about the downtown property listing.",
    timestamp: "Thu Dec 3, 5:00 PM",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "1-2",
    conversationId: "1",
    sender: "other",
    text: "I've had three interested parties already. The location is really attracting attention!",
    timestamp: "Thu Dec 3, 5:01 PM",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "1-3",
    conversationId: "1",
    sender: "user",
    text: "Hi Khalil! I'm doing great, thanks for asking. That's fantastic news about the interest!",
    timestamp: "Thu Dec 3, 5:02 PM",
    avatar: "/diverse-group.png",
  },
  {
    id: "1-4",
    conversationId: "1",
    sender: "user",
    text: "The downtown location is definitely a hot spot right now. I'll prepare the showing materials for this weekend.",
    timestamp: "Thu Dec 3, 5:02 PM",
    avatar: "/diverse-group.png",
  },
  {
    id: "1-5",
    conversationId: "1",
    sender: "other",
    text: "That's wonderful to hear! Keep up the great work. Let me know if you need anything from my end.",
    timestamp: "Thu Dec 3, 5:03 PM",
    avatar: "/cozy-suburban-house.png",
  },
  // Jeff's messages
  {
    id: "2-1",
    conversationId: "2",
    sender: "other",
    text: "Hi! I have the inspection report ready for the Oak Street property.",
    timestamp: "Thu Dec 3, 3:30 PM",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "2-2",
    conversationId: "2",
    sender: "other",
    text: "Should I email it to you or would you prefer to pick it up in person?",
    timestamp: "Thu Dec 3, 3:31 PM",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "2-3",
    conversationId: "2",
    sender: "user",
    text: "Hey Jeff! Email would be perfect, thanks!",
    timestamp: "Thu Dec 3, 3:45 PM",
    avatar: "/diverse-group.png",
  },
  // Sarah's messages
  {
    id: "3-1",
    conversationId: "3",
    sender: "other",
    text: "Hi there! I received the market analysis you sent over.",
    timestamp: "Thu Dec 3, 2:00 PM",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "3-2",
    conversationId: "3",
    sender: "user",
    text: "Great! Let me know if you have any questions about it.",
    timestamp: "Thu Dec 3, 2:15 PM",
    avatar: "/diverse-group.png",
  },
  {
    id: "3-3",
    conversationId: "3",
    sender: "other",
    text: "Thanks for the market analysis. I'll review it and get back to you by tomorrow.",
    timestamp: "Thu Dec 3, 2:20 PM",
    avatar: "/cozy-suburban-house.png",
  },
]

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [messageInput, setMessageInput] = useState("")
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [messages, setMessages] = useState<Message[]>(
    allMessages.filter(msg => msg.conversationId === conversations[0].id)
  )
  const [isMobileView, setIsMobileView] = useState(false) // For mobile responsiveness
  const [showChatView, setShowChatView] = useState(false) // For mobile toggle between list and chat
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check for mobile view on mount and resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768) // Tailwind's md breakpoint
    }
    
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    
    return () => {
      window.removeEventListener('resize', checkMobileView)
    }
  }, [])

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        conversationId: selectedConversation.id,
        sender: "user",
        text: messageInput,
        timestamp: new Date().toLocaleString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
        avatar: "/diverse-group.png",
      }
      setMessages(prev => [...prev, newMessage])
      setMessageInput("")
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      console.log('Files selected:', files)
      event.target.value = ""
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    setHoveredMessage(null)
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    // Filter messages for the selected conversation
    const conversationMessages = allMessages.filter(msg => msg.conversationId === conversation.id)
    setMessages(conversationMessages)
    
    // For mobile, show the chat view when a conversation is selected
    if (isMobileView) {
      setShowChatView(true)
    }
  }

  const handleBackToConversations = () => {
    setShowChatView(false)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AgentCommunicationLayout>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
        {/* Conversations Sidebar - Hidden on mobile when chat view is active */}
        <div className={`${
          isMobileView && showChatView 
            ? 'hidden' 
            : 'w-full md:w-80'
        } bg-white/70 backdrop-blur-xl border-r border-sky-200/50 shadow-lg flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-sky-200/50 bg-gradient-to-r from-sky-400/10 to-blue-400/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  Messages
                </h2>
                <Badge className="rounded-full h-6 w-6 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-rose-500 to-pink-500 border-0">
                  1
                </Badge>
              </div>
              <Button 
                size="icon" 
                className="h-9 w-9 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-10 bg-white/80 border-sky-200 focus:border-sky-400 focus:ring-sky-400/20 rounded-full text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-sky-100/50 transition-colors border-b border-sky-100/50 ${
                  selectedConversation.id === conversation.id 
                    ? "bg-gradient-to-r from-sky-100 to-blue-100 border-l-4 border-l-sky-500" 
                    : ""
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-sky-200/50">
                    <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white">
                      {conversation.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.unread && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 ring-2 ring-white" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-800 truncate">{conversation.name}</p>
                    <span className="text-xs text-sky-600 font-medium">{conversation.time}</span>
                  </div>
                  <p className={`text-sm truncate ${conversation.unread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                    {conversation.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area - Hidden on mobile when conversation list is active */}
        <div className={`${
          isMobileView && !showChatView 
            ? 'hidden' 
            : 'flex-1'
        } flex flex-col min-w-[300px] md:min-w-[375px]`}>
          {/* Chat Header */}
          <div className="bg-white/70 backdrop-blur-xl border-b border-sky-200/50 p-4 flex items-center justify-between shadow-sm">
            {/* Back button for mobile */}
            {isMobileView && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-9 w-9 rounded-full hover:bg-sky-100 md:hidden mr-2"
                onClick={handleBackToConversations}
              >
                <ArrowLeft className="h-5 w-5 text-sky-600" />
              </Button>
            )}
            
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 ring-2 ring-sky-200">
                <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white font-semibold">
                  {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{selectedConversation.name}</h3>
                <p className="text-xs text-sky-600 font-medium">Active now</p>
              </div>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-9 w-9 rounded-full hover:bg-sky-100"
            >
              <MoreVertical className="h-5 w-5 text-sky-600" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"} group`}
                onMouseEnter={() => setHoveredMessage(message.id)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                {message.sender === "other" && (
                  <Avatar className="h-8 w-8 ring-2 ring-sky-200/50 flex-shrink-0">
                    <AvatarImage src={message.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white text-xs">
                      {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex items-center gap-2 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg ${
                      message.sender === "user" 
                        ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-200" 
                        : "bg-white text-gray-800 shadow-md border border-sky-100"
                    } rounded-2xl p-3 relative transition-all hover:shadow-lg`}
                  >
                    <p className={`text-xs mb-1 ${message.sender === "user" ? "text-sky-100" : "text-sky-600"} font-medium`}>
                      {message.timestamp}
                    </p>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  
                  {/* Delete Button - shows on hover */}
                  {hoveredMessage === message.id && (
                    <button
                      className="p-1.5 hover:bg-rose-100 rounded-full transition-all bg-white shadow-md border border-rose-200 opacity-0 group-hover:opacity-100"
                      onClick={() => handleDeleteMessage(message.id)}
                      title="Delete message"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    </button>
                  )}
                </div>
                
                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 ring-2 ring-sky-200/50 flex-shrink-0">
                    <AvatarImage src={message.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white text-xs">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white/70 backdrop-blur-xl border-t border-sky-200/50 shadow-lg">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="flex gap-2 items-center bg-white rounded-full p-2 shadow-md border border-sky-200">
              <Button 
                onClick={handleFileUpload} 
                size="icon" 
                variant="ghost"
                className="h-9 w-9 rounded-full hover:bg-sky-100 text-sky-600"
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message here..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon" 
                className="h-9 w-9 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AgentCommunicationLayout>
  )
}