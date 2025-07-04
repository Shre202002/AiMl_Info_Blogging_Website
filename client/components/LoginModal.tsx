import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import {
  Brain,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Github,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export function LoginModal({
  isOpen,
  onClose,
  onSwitchToSignup,
}: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});
  const emailRef = useRef<HTMLInputElement>(null);

  // Focus email input when modal opens
  useEffect(() => {
    if (isOpen && emailRef.current) {
      setTimeout(() => emailRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "email":
        if (!value) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = () => {
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);

    const newErrors = {
      ...(emailError && { email: emailError }),
      ...(passwordError && { password: passwordError }),
    };

    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  /**
   * LOGIN API INTEGRATION - AUTHENTICATION ENDPOINT
   *
   * This function handles user authentication and session management.
   *
   * API ENDPOINT: POST /api/auth/login
   *
   * REQUEST BODY:
   * {
   *   "email": "user@example.com",
   *   "password": "hashedPassword"
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
   *   "token": "jwt_access_token_here",
   *   "refreshToken": "refresh_token_here"
   * }
   *
   * ERROR RESPONSES:
   * - 401 Unauthorized: Invalid credentials
   * - 400 Bad Request: Missing email/password
   * - 429 Too Many Requests: Rate limit exceeded
   * - 500 Internal Server Error
   *
   * DATABASE OPERATIONS:
   * 1. Query users table for email
   * 2. Verify password hash using bcrypt
   * 3. Create new session record
   * 4. Generate JWT token with user data
   * 5. Update last_login timestamp
   *
   * SECURITY FEATURES:
   * - Password hashing with bcrypt
   * - JWT token expiration
   * - Rate limiting on failed attempts
   * - Session management
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Call login function which makes API request to POST /api/auth/login
      // This will send user credentials to backend for authentication
      await login(email, password);
      onClose();

      // Reset form on successful login
      setEmail("");
      setPassword("");
      setRememberMe(false);
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error("Login failed:", error);
      // Display user-friendly error message for failed authentication
      setErrors({ email: "Invalid credentials. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    console.log(`Login with ${provider}`);
    // Handle social login
  };

  const getFieldStatus = (field: string, value: string) => {
    if (!touched[field as keyof typeof touched]) return "default";
    if (errors[field as keyof typeof errors]) return "error";
    if (value && !validateField(field, value)) return "success";
    return "default";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[440px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl border border-primary/10 shadow-2xl shadow-primary/5">
        <DialogHeader className="space-y-4 sm:space-y-6 pb-2">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-blue-600/30 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-r from-primary to-blue-600 p-2.5 sm:p-3 rounded-full">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
              Welcome Back
            </DialogTitle>
            <p className="text-center text-muted-foreground text-xs sm:text-sm px-2">
              Sign in to access your AI & ML dashboard
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
                Email Address
              </Label>
            </div>
            <div className="relative">
              <Input
                ref={emailRef}
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={(e) => handleFieldBlur("email", e.target.value)}
                className={`pr-10 h-11 sm:h-10 text-base sm:text-sm transition-all duration-200 ${
                  getFieldStatus("email", email) === "error"
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : getFieldStatus("email", email) === "success"
                      ? "border-green-500 focus-visible:ring-green-500/20"
                      : "focus-visible:ring-primary/20"
                }`}
              />
              {getFieldStatus("email", email) === "success" && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {getFieldStatus("email", email) === "error" && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </div>
            {errors.email && (
              <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-1 duration-200">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Label
                htmlFor="password"
                className="text-xs sm:text-sm font-medium"
              >
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                onBlur={(e) => handleFieldBlur("password", e.target.value)}
                className={`pr-20 h-11 sm:h-10 text-base sm:text-sm transition-all duration-200 ${
                  getFieldStatus("password", password) === "error"
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : getFieldStatus("password", password) === "success"
                      ? "border-green-500 focus-visible:ring-green-500/20"
                      : "focus-visible:ring-primary/20"
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {getFieldStatus("password", password) === "success" && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {getFieldStatus("password", password) === "error" && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 hover:bg-muted rounded"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {errors.password && (
              <p className="text-xs sm:text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-1 duration-200">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
              />
              <Label
                htmlFor="remember"
                className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <button
              type="button"
              className="text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors font-medium hover:underline text-left sm:text-right"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 bg-gradient-to-r from-primary via-blue-600 to-primary hover:from-primary/90 hover:via-blue-600/90 hover:to-primary/90 text-white font-medium shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground font-medium">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin("Google")}
            className="relative overflow-hidden group hover:scale-105 transition-all duration-200 hover:shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin("GitHub")}
            className="relative overflow-hidden group hover:scale-105 transition-all duration-200 hover:shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-primary hover:text-primary/80 transition-colors font-medium hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
