import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import supabase from '@/supabaseClient'
import { useAuth } from '@/AuthContext'

interface BookmarkContextType {
  bookmarkedProperties: number[]
  toggleBookmark: (propertyId: number) => void
  isBookmarked: (propertyId: number) => boolean
  loading: boolean
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

export function useBookmark() {
  const context = useContext(BookmarkContext)
  if (context === undefined) {
    throw new Error('useBookmark must be used within a BookmarkProvider')
  }
  return context
}

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarkedProperties, setBookmarkedProperties] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const { session } = useAuth()

  // Fetch user's bookmarked properties from database
  useEffect(() => {
    if (session?.user?.id) {
      fetchBookmarks()
    } else {
      setBookmarkedProperties([])
      setLoading(false)
    }
  }, [session?.user?.id])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      
      if (!session?.user?.id) {
        return
      }

      // First, check if favorites table exists, if not create it
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', session.user.id)

      if (error) {
        // If table doesn't exist, it will fail silently
        console.error('Error fetching bookmarks:', error)
        setBookmarkedProperties([])
      } else {
        const bookmarkedIds = data.map(item => item.property_id)
        setBookmarkedProperties(bookmarkedIds)
      }
    } catch (error) {
      console.error('Error:', error)
      setBookmarkedProperties([])
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async (propertyId: number) => {
    if (!session?.user?.id) {
      alert('Please sign in to bookmark properties')
      return
    }

    const isCurrentlyBookmarked = bookmarkedProperties.includes(propertyId)

    try {
      if (isCurrentlyBookmarked) {
        // Remove from database
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('property_id', propertyId)

        if (error) {
          console.error('Error removing bookmark:', error)
          alert('Failed to remove bookmark. Please try again.')
          return
        }

        // Update local state
        setBookmarkedProperties(prev => prev.filter(id => id !== propertyId))
      } else {
        // Add to database
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: session.user.id,
            property_id: propertyId
          })

        if (error) {
          console.error('Error adding bookmark:', error)
          alert('Failed to add bookmark. Please try again.')
          return
        }

        // Update local state
        setBookmarkedProperties(prev => [...prev, propertyId])
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const isBookmarked = (propertyId: number) => {
    return bookmarkedProperties.includes(propertyId)
  }

  return (
    <BookmarkContext.Provider value={{ bookmarkedProperties, toggleBookmark, isBookmarked, loading }}>
      {children}
    </BookmarkContext.Provider>
  )
}
