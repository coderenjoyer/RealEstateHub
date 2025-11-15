export interface Conversation {
  id: string
  name: string
  lastMessage: string
  avatar: string
  unread?: boolean
  time: string
}

export interface Message {
  id: string
  conversationId: string
  sender: "user" | "other"
  text: string
  timestamp: string
  avatar: string
}