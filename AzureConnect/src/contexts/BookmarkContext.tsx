import { createContext, useContext, useState, ReactNode } from 'react'

interface BookmarkContextType {
  bookmarkedProperties: number[]
  toggleBookmark: (propertyId: number) => void
  isBookmarked: (propertyId: number) => boolean
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

export function BookmarkProvider({ children }: { children: ReactNode }) {
  // Initialize with 3 properties bookmarked by default (IDs 1, 2, and 3)
  const [bookmarkedProperties, setBookmarkedProperties] = useState<number[]>([1, 2, 3])

  const toggleBookmark = (propertyId: number) => {
    setBookmarkedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const isBookmarked = (propertyId: number) => {
    return bookmarkedProperties.includes(propertyId)
  }

  return (
    <BookmarkContext.Provider value={{ bookmarkedProperties, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  )
}

export function useBookmark() {
  const context = useContext(BookmarkContext)
  if (context === undefined) {
    throw new Error('useBookmark must be used within a BookmarkProvider')
  }
  return context
}
