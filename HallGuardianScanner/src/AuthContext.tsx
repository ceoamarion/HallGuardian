// ─── Auth context: stores JWT + user across the app ──────────────────────────
import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

interface User {
    id: number;
    email: string;
    role: string;
    schoolId: number;
}

interface AuthCtx {
    token: string | null;
    user: User | null;
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const savedToken = await SecureStore.getItemAsync("hg_token");
                const savedUser = await SecureStore.getItemAsync("hg_user");
                if (savedToken && savedUser) {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const signIn = async (t: string, u: User) => {
        await SecureStore.setItemAsync("hg_token", t);
        await SecureStore.setItemAsync("hg_user", JSON.stringify(u));
        setToken(t);
        setUser(u);
    };

    const signOut = async () => {
        await SecureStore.deleteItemAsync("hg_token");
        await SecureStore.deleteItemAsync("hg_user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
