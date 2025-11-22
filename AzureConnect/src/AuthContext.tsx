import { createContext, useContext, useState, useEffect } from "react";
import supabase from "./supabaseClient";
import type { Session } from "@supabase/supabase-js";

interface SignupParams {
	firstName: string;
	lastName: string;
	mobileNumber: string;
	email: string;
	password: string;
}

interface SignInParams {
	email: string;
	password: string;
}

interface ResetPasswordParams {
	email: string;
}

interface UpdatePasswordParams {
	password: string;
}

interface AuthContextValue {
	session: Session | null;
	isLoading: boolean;
	signupNewUser: (
		params: SignupParams
	) => Promise<{ success: boolean; data?: unknown; error?: string }>;
	signIn: (
		params: SignInParams
	) => Promise<{ success: boolean; data?: unknown; error?: string }>;
	signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
	signOut: () => Promise<{ success: boolean; error?: string }>;
	resetPasswordForEmail: (
		params: ResetPasswordParams
	) => Promise<{ success: boolean; error?: string }>;
	updateUserPassword: (
		params: UpdatePasswordParams
	) => Promise<{ success: boolean; error?: string }>;
}

const Authcontext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			const { data } = await supabase.auth.getSession();
			if (isMounted) {
				setSession(data.session ?? null);
				setIsLoading(false);
			}
		})();

		// Listen for auth state changes (e.g., when user comes from email reset link)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (isMounted) {
				setSession(session);
			}
		});

		return () => {
			isMounted = false;
			subscription.unsubscribe();
		};
	}, []);

	const signupNewUser: AuthContextValue["signupNewUser"] = async ({
		firstName,
		lastName,
		mobileNumber,
		email,
		password,
	}: SignupParams) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					first_name: firstName,
					last_name: lastName,
					mobile_number: mobileNumber,
					role: "user",
				},
			},
		});

		if (error) {
			console.error(error);
			return { success: false, error: error.message };
		}
		return { success: true, data };
	};

	const signIn: AuthContextValue["signIn"] = async ({ email, password }) => {
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			console.error(error);
			return { success: false, error: error.message };
		}

		// Check if user is deactivated
		if (data.session?.user?.user_metadata?.status === "Inactive") {
			// Sign out immediately if account is deactivated
			await supabase.auth.signOut();
			return { success: false, error: "This account has been deactivated. Please contact an administrator." };
		}

		setSession(data.session ?? null);
		return { success: true, data };
	};

	const signInWithGoogle: AuthContextValue["signInWithGoogle"] = async () => {
		const redirectUrl = `${window.location.origin}/login`;
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: redirectUrl,
			},
		});
		if (error) {
			console.error(error);
			return { success: false, error: error.message };
		}
		return { success: true };
	};

	const signOut: AuthContextValue["signOut"] = async () => {
		// Clear session state immediately to prevent UI issues
		setSession(null);
		
		try {
			// Attempt to sign out from Supabase
			const { error } = await supabase.auth.signOut();
			
			// Ignore "Auth session missing" errors since we're already logged out
			if (error && !error.message.includes('session')) {
				console.error('Logout error:', error);
				// Even if there's an error, we've already cleared local session
				// So we still consider it a success for the user
			}
			
			return { success: true };
		} catch (err: any) {
			console.error('Exception during logout:', err);
			// Still return success since local state is cleared
			return { success: true };
		}
	};

	const resetPasswordForEmail: AuthContextValue["resetPasswordForEmail"] = async ({
		email,
	}: ResetPasswordParams) => {
		const redirectUrl = `${window.location.origin}/login/reset`;
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: redirectUrl,
		});
		if (error) {
			console.error(error);
			return { success: false, error: error.message };
		}
		return { success: true };
	};

	const updateUserPassword: AuthContextValue["updateUserPassword"] = async ({
		password,
	}: UpdatePasswordParams) => {
		const { error } = await supabase.auth.updateUser({
			password: password,
		});
		if (error) {
			console.error(error);
			return { success: false, error: error.message };
		}
		// Update session state after password change
		// The auth state change listener will automatically update the session,
		// but we fetch it here to ensure we have the latest session
		const { data: sessionData } = await supabase.auth.getSession();
		if (sessionData.session) {
			setSession(sessionData.session);
		}
		return { success: true };
	};

	return (
		<Authcontext.Provider
			value={{
				session,
				isLoading,
				signupNewUser,
				signIn,
				signInWithGoogle,
				signOut,
				resetPasswordForEmail,
				updateUserPassword,
			}}
		>
			{children}
		</Authcontext.Provider>
	);
};

export const useAuth = (): AuthContextValue => {
	const ctx = useContext(Authcontext);
	if (!ctx) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return ctx;
};