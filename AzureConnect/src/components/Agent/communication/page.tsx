"use client"

import { useState } from "react"
import { Sidebar } from "@/sidebar"
import { Plus, Send } from "lucide-react"
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

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log("[v0] Sending message:", messageInput)
      setMessageInput("")
    }
  }

  return (
    <div className="flex min-h-screen bg-[#b8d4e6]">
      <Sidebar />

      {/* Conversations List */}
      <div className="w-80 bg-white/40 backdrop-blur-sm border-r border-white/20">
        <div className="p-4 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            <Badge variant="destructive" className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
              1
            </Badge>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/60">
            <Plus className="h-4 w-4" />
          </Button>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message here..."
              className="flex-1 bg-white/60 border-white/40 placeholder:text-gray-500"
            />
            <Button onClick={handleSendMessage} size="icon" className="bg-white/60 hover:bg-white/80 text-gray-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
