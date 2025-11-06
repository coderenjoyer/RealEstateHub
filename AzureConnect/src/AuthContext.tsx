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

interface AuthContextValue {
	session: Session | null;
	signupNewUser: (
		params: SignupParams
	) => Promise<{ success: boolean; data?: unknown; error?: string }>;
	signIn: (
		params: SignInParams
	) => Promise<{ success: boolean; data?: unknown; error?: string }>;
	signOut: () => Promise<{ success: boolean; error?: string }>;
}

const Authcontext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			const { data } = await supabase.auth.getSession();
			if (isMounted) {
				setSession(data.session ?? null);
			}
		})();
		return () => {
			isMounted = false;
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
		setSession(data.session ?? null);
		return { success: true, data };
	};

	const signOut: AuthContextValue["signOut"] = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
			return { success: false, error: error.message };
		}
		setSession(null);
		return { success: true };
	};

	return (
		<Authcontext.Provider value={{ session, signupNewUser, signIn, signOut }}>
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