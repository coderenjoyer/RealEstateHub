"use client"

import { useState, useRef } from "react"
import { Sidebar } from "@/components/ui/agentsidebar"
import { Send, Image as ImageIcon, Paperclip, Smile, X } from "lucide-react"
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
}

interface Message {
  id: string
  sender: "user" | "other"
  text: string
  timestamp: string
  avatar: string
  images?: string[]
  files?: { name: string; size: string }[]
}

interface AttachedFile {
  name: string
  size: number
  type: string
  url: string
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Khalil Peque",
    lastMessage: "GGYAAG FROM NATA BA",
    avatar: "/cozy-suburban-house.png",
    unread: false,
  },
  {
    id: "2",
    name: "Jeff",
    lastMessage: "from num num",
    avatar: "/cozy-suburban-house.png",
    unread: true,
  },
  {
    id: "3",
    name: "Jeff",
    lastMessage: "from num num",
    avatar: "/cozy-suburban-house.png",
    unread: true,
  },
]

const messages: Message[] = [
  {
    id: "1",
    sender: "other",
    text: "This is a message",
    timestamp: "Thu Dec 3 05 pm",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "2",
    sender: "other",
    text: "This is a message",
    timestamp: "Thu Dec 3 05 pm",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "3",
    sender: "other",
    text: "This is a message",
    timestamp: "Thu Dec 3 05 pm",
    avatar: "/cozy-suburban-house.png",
  },
  {
    id: "4",
    sender: "user",
    text: "This is a message",
    timestamp: "Thu Dec 3 - Khalil",
    avatar: "/diverse-group.png",
  },
  {
    id: "5",
    sender: "user",
    text: "This is a message",
    timestamp: "Thu Dec 3 - Khalil",
    avatar: "/diverse-group.png",
  },
  {
    id: "6",
    sender: "user",
    text: "This is a message",
    timestamp: "Thu Dec 3 - Khalil",
    avatar: "/diverse-group.png",
  },
]

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [messageInput, setMessageInput] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachedImages, setAttachedImages] = useState<AttachedFile[]>([])
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const emojis = [
    "😊", "😂", "❤️", "👍", "🎉", "😍", "🔥", "✨", 
    "💯", "🙏", "😢", "😎", "🤔", "😴", "🥳", "😱",
    "💪", "👏", "🙌", "✌️", "🤝", "💖", "⭐", "🌟"
  ]

  const handleSendMessage = () => {
    if (messageInput.trim() || attachedImages.length > 0 || attachedFiles.length > 0) {
      console.log("[v0] Sending message:", {
        text: messageInput,
        images: attachedImages,
        files: attachedFiles
      })
      setMessageInput("")
      setShowEmojiPicker(false)
      setAttachedImages([])
      setAttachedFiles([])
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: AttachedFile[] = []
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file)
          newImages.push({
            name: file.name,
            size: file.size,
            type: file.type,
            url: url
          })
        }
      })
      setAttachedImages(prev => [...prev, ...newImages])
    }
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles: AttachedFile[] = []
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file)
        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          url: url
        })
      })
      setAttachedFiles(prev => [...prev, ...newFiles])
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setAttachedImages(prev => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].url)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].url)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="flex min-h-screen bg-[#49769F]">
      <Sidebar />

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Conversations List */}
      <div className="w-80 bg-white/40 backdrop-blur-sm border-r border-white/20">
        <div className="p-4 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            <Badge variant="destructive" className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
              1
            </Badge>
          </div>
        </div>

        <div className="overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-white/30 transition-colors border-b border-white/10 ${
                selectedConversation.id === conversation.id ? "bg-[#7eb3d4]" : ""
              }`}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                <AvatarFallback>KP</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800">{conversation.name}</p>
                  {conversation.unread && <div className="h-2 w-2 rounded-full bg-red-500" />}
                </div>
                <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/40 backdrop-blur-sm border-b border-white/20 p-4 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
            <AvatarFallback>KP</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-gray-800 text-lg">{selectedConversation.name}</h3>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#BDD8E9]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "other" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.avatar || "/placeholder.svg"} />
                  <AvatarFallback>KP</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-md ${
                  message.sender === "user" ? "bg-[#8b5cf6] text-white" : "bg-[#3b82f6] text-white"
                } rounded-lg p-3`}
              >
                <p className="text-xs opacity-80 mb-1">{message.timestamp}</p>
                <p className="text-sm">{message.text}</p>
              </div>
              {message.sender === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.avatar || "/placeholder.svg"} />
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white/40 backdrop-blur-sm border-t border-white/20">
          {/* Attached Images Preview */}
          {attachedImages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={image.url} 
                    alt={image.name}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-white/60"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg truncate">
                    {image.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                  <Paperclip className="h-4 w-4 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              {/* Emoji Picker Dropdown - Positioned to the right */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b">
                    <span className="text-sm font-semibold text-gray-700">Pick an emoji</span>
                    <button 
                      onClick={() => setShowEmojiPicker(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder="Type your message here..."
                className="flex-1 bg-white/60 border-white/40 placeholder:text-gray-500 pr-32"
              />
              
              {/* Action Buttons Inside Input */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button 
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  size="icon" 
                  variant="ghost"
                  className="h-8 w-8 hover:bg-white/80 text-gray-600"
                  title="Add emoji"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  size="icon" 
                  variant="ghost"
                  className="h-8 w-8 hover:bg-white/80 text-gray-600"
                  title="Add images"
                >
                  <ImageIcon className="h-4 w-4" />
                  {attachedImages.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {attachedImages.length}
                    </span>
                  )}
                </Button>
                <Button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  size="icon" 
                  variant="ghost"
                  className="h-8 w-8 hover:bg-white/80 text-gray-600"
                  title="Add files"
                >
                  <Paperclip className="h-4 w-4" />
                  {attachedFiles.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {attachedFiles.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={handleSendMessage} 
              size="icon" 
              className="bg-blue-500 hover:bg-blue-600 text-white h-10 w-10 shrink-0"
              title="Send message"
              disabled={!messageInput.trim() && attachedImages.length === 0 && attachedFiles.length === 0}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}