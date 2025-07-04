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
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import {
  Brain,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Github,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  Sparkles,
} from "lucide-react";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: SignupModalProps) {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});
  const nameRef = useRef<HTMLInputElement>(null);

  // Focus name input when modal opens
  useEffect(() => {
    if (isOpen && nameRef.current) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[^a-zA-Z\d]/.test(password),
    ];

    score = checks.filter(Boolean).length;
    return {
      score,
      percentage: (score / 5) * 100,
      label:
        score < 2 ? "Weak" : score < 4 ? "Fair" : score < 5 ? "Good" : "Strong",
      color:
        score < 2
          ? "bg-red-500"
          : score < 4
            ? "bg-yellow-500"
            : score < 5
              ? "bg-blue-500"
              : "bg-green-500",
    };
  };

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        const strength = calculatePasswordStrength(value);
        if (strength.score < 3) return "Password is too weak";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (formData.password !== value) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

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
    const nameError = validateField("name", formData.name);
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);
    const confirmPasswordError = validateField(
      "confirmPassword",
      formData.confirmPassword,
    );

    const newErrors = {
      ...(nameError && { name: nameError }),
      ...(emailError && { email: emailError }),
      ...(passwordError && { password: passwordError }),
      ...(confirmPasswordError && { confirmPassword: confirmPasswordError }),
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    return Object.keys(newErrors).length === 0 && acceptTerms;
  };

  /**
   * USER REGISTRATION API INTEGRATION - ACCOUNT CREATION ENDPOINT
   *
   * This function handles new user registration and account creation.
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
   *     "avatar": null,
   *     "createdAt": "2024-01-15T10:30:00Z"
   *   },
   *   "token": "jwt_access_token_here",
   *   "refreshToken": "refresh_token_here"
   * }
   *
   * ERROR RESPONSES:
   * - 409 Conflict: Email already exists
   * - 400 Bad Request: Invalid input data
   * - 422 Unprocessable Entity: Validation errors
   * - 500 Internal Server Error
   *
   * DATABASE OPERATIONS:
   * 1. Check if email already exists in users table
   * 2. Hash password using bcrypt (cost factor 12)
   * 3. Insert new user record into users table
   * 4. Create default user preferences
   * 5. Generate JWT token for auto-login
   * 6. Send welcome email (optional)
   *
   * USER TABLE STRUCTURE:
   * - id: UUID primary key
   * - name: VARCHAR(100) NOT NULL
   * - email: VARCHAR(255) UNIQUE NOT NULL
   * - password_hash: VARCHAR(255) NOT NULL
   * - avatar_url: VARCHAR(500) NULL
   * - email_verified: BOOLEAN DEFAULT FALSE
   * - created_at: TIMESTAMP DEFAULT NOW()
   * - updated_at: TIMESTAMP DEFAULT NOW()
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Call signup function which makes API request to POST /api/auth/register
      // This will create new user account and automatically log them in
      await signup(formData.name, formData.email, formData.password);
      onClose();

      // Reset form on successful registration
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setAcceptTerms(false);
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error("Signup failed:", error);
      // Display user-friendly error message for registration conflicts
      setErrors({
        email: "This email is already registered. Please try another.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: string) => {
    console.log(`Sign up with ${provider}`);
    // Handle social signup
  };

  const getFieldStatus = (field: string, value: string) => {
    if (!touched[field as keyof typeof touched]) return "default";
    if (errors[field as keyof typeof errors]) return "error";
    if (value && !validateField(field, value)) return "success";
    return "default";
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[480px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl border border-primary/10 shadow-2xl shadow-primary/5">
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
              Join AIML Info
            </DialogTitle>
            <p className="text-center text-muted-foreground text-xs sm:text-sm px-2">
              Create your account to start your AI journey
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
            </div>
            <div className="relative">
              <Input
                ref={nameRef}
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                onBlur={(e) => handleFieldBlur("name", e.target.value)}
                className={`pr-10 transition-all duration-200 ${
                  getFieldStatus("name", formData.name) === "error"
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : getFieldStatus("name", formData.name) === "success"
                      ? "border-green-500 focus-visible:ring-green-500/20"
                      : "focus-visible:ring-primary/20"
                }`}
              />
              {getFieldStatus("name", formData.name) === "success" && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {getFieldStatus("name", formData.name) === "error" && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </div>
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-1 duration-200">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="signup-email" className="text-sm font-medium">
                Email Address
              </Label>
            </div>
            <div className="relative">
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={(e) => handleFieldBlur("email", e.target.value)}
                className={`pr-10 transition-all duration-200 ${
                  getFieldStatus("email", formData.email) === "error"
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : getFieldStatus("email", formData.email) === "success"
                      ? "border-green-500 focus-visible:ring-green-500/20"
                      : "focus-visible:ring-primary/20"
                }`}
              />
              {getFieldStatus("email", formData.email) === "success" && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {getFieldStatus("email", formData.email) === "error" && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-1 duration-200">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="signup-password" className="text-sm font-medium">
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                onBlur={(e) => handleFieldBlur("password", e.target.value)}
                className={`pr-20 transition-all duration-200 ${
                  getFieldStatus("password", formData.password) === "error"
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : getFieldStatus("password", formData.password) ===
                        "success"
                      ? "border-green-500 focus-visible:ring-green-500/20"
                      : "focus-visible:ring-primary/20"
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {getFieldStatus("password", formData.password) ===
                  "success" && <Shield className="h-4 w-4 text-green-500" />}
                {getFieldStatus("password", formData.password) === "error" && (
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

            {formData.password && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Password strength
                  </span>
                  <span
                    className={`font-medium ${
                      passwordStrength.score < 2
                        ? "text-red-500"
                        : passwordStrength.score < 4
                          ? "text-yellow-500"
                          : passwordStrength.score < 5
                            ? "text-blue-500"
                            : "text-green-500"
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <Progress value={passwordStrength.percentage} className="h-2" />
              </div>
            )}

            {errors.password && (
              <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-1 duration-200">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleFieldChange("confirmPassword", e.target.value)
                }
                onBlur={(e) =>
                  handleFieldBlur("confirmPassword", e.target.value)
                }
                className={`pr-20 transition-all duration-200 ${
                  getFieldStatus(
                    "confirmPassword",
                    formData.confirmPassword,
                  ) === "error"
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : getFieldStatus(
                          "confirmPassword",
                          formData.confirmPassword,
                        ) === "success"
                      ? "border-green-500 focus-visible:ring-green-500/20"
                      : "focus-visible:ring-primary/20"
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {getFieldStatus("confirmPassword", formData.confirmPassword) ===
                  "success" && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {getFieldStatus("confirmPassword", formData.confirmPassword) ===
                  "error" && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 hover:bg-muted rounded"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-left-1 duration-200">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg border border-muted">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={setAcceptTerms}
              className="mt-0.5"
            />
            <div className="text-sm leading-5">
              <label
                htmlFor="terms"
                className="text-muted-foreground cursor-pointer"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-primary hover:text-primary/80 underline font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-primary hover:text-primary/80 underline font-medium"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-primary via-blue-600 to-primary hover:from-primary/90 hover:via-blue-600/90 hover:to-primary/90 text-white font-medium shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100"
            disabled={isLoading || !acceptTerms}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
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
            onClick={() => handleSocialSignup("Google")}
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
            onClick={() => handleSocialSignup("GitHub")}
            className="relative overflow-hidden group hover:scale-105 transition-all duration-200 hover:shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:text-primary/80 transition-colors font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
