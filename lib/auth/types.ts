// lib/auth/types.ts
export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    verified: boolean;
    image?: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}