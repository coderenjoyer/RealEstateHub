import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key
// This will be used for admin operations on the server side
const getAdminClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error(
      'VITE_SUPABASE_SERVICE_ROLE_KEY is not configured in environment variables. ' +
      'Please add it to your .env file to enable admin operations.'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Update user account status (deactivate/reactivate) - admin only
 * @param userId - The user ID to update
 * @param newStatus - "Active" or "Inactive"
 */
export async function updateAccountStatus(
  userId: string,
  newStatus: "Active" | "Inactive"
) {
  try {
    const supabaseAdmin = getAdminClient()

    console.log(`Updating account status: ${userId} -> ${newStatus}`)

    // Update the status in user metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          status: newStatus
        }
      }
    )

    if (updateError) {
      console.error('Error updating account status:', updateError)
      throw updateError
    }

    const statusText = newStatus === "Active" ? "activated" : "deactivated"
    console.log(`Successfully ${statusText} user: ${userId}`)
    
    // Return the updated status
    return { 
      success: true, 
      message: `Account ${statusText} successfully`,
      status: newStatus
    }
  } catch (error) {
    console.error('Error in updateAccountStatus:', error)
    throw error
  }
}

/**
 * Delete a user account (admin only)
 * This function should only be called after verifying the current user is an admin
 */
export async function deleteUserAccount(userId: string, email: string) {
  try {
    const supabaseAdmin = getAdminClient()

    console.log(`Deleting user account: ${userId} (${email})`)

    // Step 1: Delete from profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId)

    if (profileError) {
      console.error('Error deleting from profiles:', profileError)
      // Continue even if profile deletion fails
    }

    // Step 2: Delete user from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    )

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      throw deleteError
    }

    console.log(`Successfully deleted user: ${email}`)
    return { success: true, message: `User ${email} deleted successfully` }
  } catch (error) {
    console.error('Error in deleteUserAccount:', error)
    throw error
  }
}
