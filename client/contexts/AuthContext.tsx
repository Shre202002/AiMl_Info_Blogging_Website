import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  // Avatar update function for real-time header updates
  updateUserAvatar: (avatarUrl: string) => void;
  // Full user profile update function
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in (localStorage for demo)
        const savedUser = localStorage.getItem("aiml_user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("aiml_user");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * USER LOGIN - AUTHENTICATION API INTEGRATION
   *
   * Authenticates user credentials and establishes session.
   *
   * API ENDPOINT: POST /api/auth/login
   *
   * REQUEST BODY:
   * {
   *   "email": "user@example.com",
   *   "password": "userPassword123"
   * }
   *
   * SUCCESS RESPONSE (200):
   * {
   *   "user": {
   *     "id": "user123",
   *     "name": "John Doe",
   *     "email": "user@example.com",
   *     "avatar": "https://example.com/avatar.jpg"
   *   },
   *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "refreshToken": "refresh_token_string_here",
   *   "expiresIn": 3600
   * }
   *
   * DATABASE OPERATIONS:
   * 1. Query users table for email
   * 2. Verify password hash using bcrypt
   * 3. Update last_login timestamp
   * 4. Create new session record
   * 5. Log login attempt for security audit
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to POST /api/auth/login
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });

      // Simulate API call for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock user data - replace with actual API response
      const mockUser: User = {
        id: "user_" + Date.now(),
        name: email.split("@")[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      setUser(mockUser);
      localStorage.setItem("aiml_user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * USER REGISTRATION - ACCOUNT CREATION API INTEGRATION
   *
   * Creates new user account and automatically logs them in.
   *
   * API ENDPOINT: POST /api/auth/register
   *
   * REQUEST BODY:
   * {
   *   "name": "John Doe",
   *   "email": "user@example.com",
   *   "password": "securePassword123"
   * }
   *
   * SUCCESS RESPONSE (201):
   * {
   *   "user": {
   *     "id": "user123",
   *     "name": "John Doe",
   *     "email": "user@example.com",
   *     "avatar": null
   *   },
   *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "refreshToken": "refresh_token_string_here"
   * }
   *
   * DATABASE OPERATIONS:
   * 1. Check if email already exists in users table
   * 2. Hash password using bcrypt (cost factor 12)
   * 3. INSERT new user record
   * 4. Create default user preferences
   * 5. Generate JWT token for auto-login
   * 6. Send welcome email (optional)
   */
  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to POST /api/auth/register
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password })
      // });

      // Simulate API call for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock user data - replace with actual API response
      const mockUser: User = {
        id: "user_" + Date.now(),
        name: name,
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      setUser(mockUser);
      localStorage.setItem("aiml_user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("aiml_user");
  };

  /**
   * UPDATE USER AVATAR - Real-time Header Update
   *
   * This function updates the user's avatar in the authentication context,
   * which immediately reflects in the header and throughout the application.
   *
   * @param avatarUrl - The new avatar URL to set
   *
   * INTEGRATION WITH BACKEND:
   * - This should be called after successful avatar update API call
   * - The avatar URL should be the final stored URL from your file service
   * - Consider CDN caching and add cache-busting parameters if needed
   */
  const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarUrl };
      setUser(updatedUser);

      // Update localStorage to persist the change
      localStorage.setItem("aiml_user", JSON.stringify(updatedUser));
    }
  };

  /**
   * UPDATE USER PROFILE - Comprehensive Profile Updates
   *
   * Updates any user profile fields and persists the changes.
   * This enables real-time updates across the application.
   *
   * @param updates - Partial user object with fields to update
   *
   * USAGE EXAMPLES:
   * - updateUserProfile({ name: "New Name", bio: "New bio" })
   * - updateUserProfile({ email: "new@email.com" })
   * - updateUserProfile({ avatar: "new-avatar-url.jpg" })
   */
  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Persist to localStorage for demo purposes
      // In production, this would be handled by your backend API
      localStorage.setItem("aiml_user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading,
    updateUserAvatar,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
