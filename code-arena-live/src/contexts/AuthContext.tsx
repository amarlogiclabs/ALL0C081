import React, { createContext, useContext, useEffect, useState } from 'react';
import { signup, signin, getUserById, verifySessionToken } from '@/lib/auth';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  elo: number;
  tier: string;
  avatar?: string;
  total_matches?: number;
  wins?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  session: any;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const tokenVerification = await verifySessionToken(token);
          if (tokenVerification.valid && tokenVerification.userId) {
            const userProfile = await getUserById(tokenVerification.userId, token);
            if (userProfile) {
              setUser(userProfile);
              setUserProfile(userProfile);
              setSession({ token, userId: tokenVerification.userId });
            } else {
              localStorage.removeItem('auth_token');
            }
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const result = await signup(email, password, username);

      if (!result.success) {
        return { data: null, error: result.error };
      }

      // Store token
      localStorage.setItem('auth_token', result.token!);
      if (result.user?.id) localStorage.setItem('userId', result.user.id);

      setSession({ token: result.token, userId: result.user!.id });
      setUser(result.user!);
      setUserProfile(result.user!);

      return { data: { user: result.user }, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signin(email, password);

      if (!result.success) {
        return { data: null, error: result.error };
      }

      // Store token
      localStorage.setItem('auth_token', result.token!);
      if (result.user?.id) localStorage.setItem('userId', result.user.id);

      setSession({ token: result.token, userId: result.user!.id });
      setUser(result.user!);
      setUserProfile(result.user!);

      return { data: { user: result.user }, error: null };
    } catch (error) {
      console.error('Signin error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userId');
      setUser(null);
      setUserProfile(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      console.error('Signout error:', error);
      return { error };
    }
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
