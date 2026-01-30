const API_URL = import.meta.env.VITE_API_URL || '';

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    elo: number;
    tier: string;
    avatar: string;
  };
  error?: string;
}

// Sign up - calls backend API
export const signup = async (
  email: string,
  password: string,
  username: string
): Promise<AuthResponse> => {
  try {
    console.log('📝 Attempting signup to:', `${API_URL}/api/auth/signup`);

    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Signup failed:', data.error);
      return { success: false, error: data.error || 'Signup failed' };
    }

    console.log('✅ Signup successful!');
    return { success: true, token: data.token, user: data.user };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Signup network error:', errorMsg, 'API URL:', API_URL);
    return { success: false, error: `Network error: ${errorMsg}` };
  }
};

// Sign in - calls backend API
export const signin = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    console.log('🔐 Attempting signin to:', `${API_URL}/api/auth/signin`);

    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Signin failed:', data.error);
      return { success: false, error: data.error || 'Signin failed' };
    }

    console.log('✅ Signin successful!');
    return { success: true, token: data.token, user: data.user };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Signin network error:', errorMsg, 'API URL:', API_URL);
    return { success: false, error: `Network error: ${errorMsg}` };
  }
};

// Get user by ID - calls backend API with token
export const getUserById = async (userId: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Verify token by checking with backend
export const verifySessionToken = async (token: string) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { valid: true, userId: data.user?.id };
    } else {
      return { valid: false, userId: null };
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, userId: null };
  }
};

// Update user profile - calls backend API
export const updateUserProfile = async (userId: string, token: string, updates: any) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Update failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Network error during update' };
  }
};
