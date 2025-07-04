import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AvatarSelector } from "@/components/AvatarSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { generateUserDataPDF, downloadPDF } from "@/utils/pdfExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Trash2,
  Save,
  Lock,
  Mail,
  Globe,
  Eye,
  EyeOff,
  Download,
  Upload,
  Key,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function Settings() {
  const { user, isAuthenticated, logout, updateUserProfile } = useAuth();
  const { config: themeConfig, updateTheme } = useTheme();
  const navigate = useNavigate();

  // Loading states for different sections
  const [loading, setLoading] = useState({
    profile: false,
    privacy: false,
    notifications: false,
    appearance: false,
    password: false,
    export: false,
    delete: false,
  });

  // Form validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Password change dialog
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile settings with validation
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    location: "",
    website: "",
    twitter: "",
    github: "",
    phone: "",
    company: "",
    jobTitle: "",
  });

  // Privacy settings with granular controls
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowFollows: true,
    trackingEnabled: true,
    marketingEmails: false,
    analyticsSharing: true,
    searchEngineIndexing: true,
    showOnlineStatus: true,
  });

  // Comprehensive notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    // Email notifications
    emailComments: true,
    emailLikes: false,
    emailFollows: true,
    emailMentions: true,
    emailBlogUpdates: false,
    emailWeeklyDigest: true,
    emailMonthlyReport: false,
    emailSecurityAlerts: true,

    // Push notifications
    pushComments: true,
    pushLikes: false,
    pushFollows: true,
    pushMentions: true,
    pushMessages: true,

    // Frequency settings
    digestFrequency: "weekly" as "daily" | "weekly" | "monthly" | "never",
    summaryTime: "morning" as "morning" | "afternoon" | "evening",
  });

  // Enhanced appearance settings - synchronized with theme context
  const [appearance, setAppearance] = useState({
    theme: themeConfig.theme,
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    dateFormat: "MM/DD/YYYY" as "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD",
    timeFormat: "12h" as "12h" | "24h",
    compactMode: themeConfig.compactMode,
    animations: themeConfig.animations,
    autoSave: themeConfig.autoSave,
    fontSize: themeConfig.fontSize,
    editorTheme: themeConfig.editorTheme,
  });

  /**
   * THEME SYNCHRONIZATION
   *
   * Keeps the local appearance state synchronized with the global theme context.
   * This ensures settings reflect the current theme state when the page loads.
   */
  useEffect(() => {
    setAppearance((prev) => ({
      ...prev,
      theme: themeConfig.theme,
      compactMode: themeConfig.compactMode,
      animations: themeConfig.animations,
      autoSave: themeConfig.autoSave,
      fontSize: themeConfig.fontSize,
      editorTheme: themeConfig.editorTheme,
    }));
  }, [themeConfig]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Initialize settings from user data and fetch from database
    initializeSettings();
  }, [isAuthenticated, navigate, user]);

  /**
   * SETTINGS INITIALIZATION - DATABASE CONNECTION GUIDE
   *
   * This function loads all user settings from the database when the component mounts.
   *
   * DATABASE TABLES NEEDED:
   *
   * 1. users - Main user information
   *    Columns: id, name, email, avatar_url, phone, bio, location, website,
   *             twitter_handle, github_username, company, job_title, created_at, updated_at
   *
   * 2. user_privacy_settings
   *    Columns: user_id, profile_public, show_email, show_phone, allow_messages,
   *             allow_follows, tracking_enabled, marketing_emails, analytics_sharing,
   *             search_engine_indexing, show_online_status, updated_at
   *
   * 3. user_notification_preferences
   *    Columns: user_id, email_comments, email_likes, email_follows, email_mentions,
   *             email_blog_updates, email_weekly_digest, email_monthly_report,
   *             email_security_alerts, push_comments, push_likes, push_follows,
   *             push_mentions, push_messages, digest_frequency, summary_time, updated_at
   *
   * 4. user_appearance_settings
   *    Columns: user_id, theme, language, timezone, date_format, time_format,
   *             compact_mode, animations, auto_save, font_size, editor_theme, updated_at
   *
   * API ENDPOINTS TO IMPLEMENT:
   *
   * GET /api/user/settings - Fetch all user settings
   * PUT /api/user/profile - Update profile information
   * PUT /api/user/privacy - Update privacy settings
   * PUT /api/user/notifications - Update notification preferences
   * PUT /api/user/appearance - Update appearance settings
   * PUT /api/user/password - Change password
   * POST /api/user/export - Export user data
   * DELETE /api/user/account - Delete user account
   *
   * EXAMPLE IMPLEMENTATION:
   * ```javascript
   * const fetchUserSettings = async () => {
   *   try {
   *     const response = await fetch('/api/user/settings', {
   *       headers: {
   *         'Authorization': `Bearer ${authToken}`,
   *         'Content-Type': 'application/json'
   *       }
   *     });
   *
   *     if (!response.ok) throw new Error('Failed to fetch settings');
   *
   *     const settings = await response.json();
   *
   *     // Update state with fetched settings
   *     setProfileData(settings.profile);
   *     setPrivacySettings(settings.privacy);
   *     setNotificationSettings(settings.notifications);
   *     setAppearance(settings.appearance);
   *
   *   } catch (error) {
   *     console.error('Error fetching settings:', error);
   *     toast({
   *       title: "Error",
   *       description: "Failed to load settings",
   *       variant: "destructive"
   *     });
   *   }
   * };
   * ```
   */
  const initializeSettings = async () => {
    try {
      // TODO: Replace with actual API call
      // await fetchUserSettings();

      // For now, initialize with user data from auth context
      if (user) {
        setProfileData((prev) => ({
          ...prev,
          name: user.name,
          email: user.email,
        }));
      }

      // Load saved settings from localStorage (fallback for demo)
      const savedSettings = localStorage.getItem(`user_settings_${user?.id}`);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.privacy) setPrivacySettings(settings.privacy);
        if (settings.notifications)
          setNotificationSettings(settings.notifications);
        if (settings.appearance) setAppearance(settings.appearance);
      }
    } catch (error) {
      console.error("Error initializing settings:", error);
    }
  };

  /**
   * FORM VALIDATION FUNCTIONS
   *
   * These functions validate user input before sending to the database.
   * Implement client-side validation for better UX and security.
   */
  const validateProfile = (data: typeof profileData) => {
    const newErrors: { [key: string]: string } = {};

    if (!data.name.trim()) {
      newErrors.name = "Name is required";
    } else if (data.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (data.name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (data.website && !/^https?:\/\/.+/.test(data.website)) {
      newErrors.website =
        "Website must be a valid URL (include http:// or https://)";
    }

    if (data.twitter && !/^@?[\w]+$/.test(data.twitter)) {
      newErrors.twitter =
        "Twitter handle can only contain letters, numbers, and underscores";
    }

    if (data.github && !/^[\w-]+$/.test(data.github)) {
      newErrors.github =
        "GitHub username can only contain letters, numbers, and hyphens";
    }

    if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (data.bio && data.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    return newErrors;
  };

  const validatePassword = (data: typeof passwordData) => {
    const newErrors: { [key: string]: string } = {};

    if (!data.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!data.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (data.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (data.newPassword !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const getPasswordStrength = (password: string) => {
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

  /**
   * PROFILE UPDATE HANDLER - DATABASE CONNECTION
   *
   * This function handles profile updates with full validation and database integration.
   *
   * DATABASE ENDPOINT: PUT /api/user/profile
   *
   * REQUEST BODY EXAMPLE:
   * {
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "bio": "AI enthusiast and developer",
   *   "location": "San Francisco, CA",
   *   "website": "https://johndoe.com",
   *   "twitter": "@johndoe",
   *   "github": "johndoe",
   *   "phone": "+1-555-123-4567",
   *   "company": "Tech Corp",
   *   "jobTitle": "Senior Developer"
   * }
   *
   * RESPONSE EXAMPLE:
   * {
   *   "success": true,
   *   "message": "Profile updated successfully",
   *   "user": { updated user object }
   * }
   */
  const handleProfileUpdate = async () => {
    // Validate form data
    const validationErrors = validateProfile(profileData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      });
      return;
    }

    setLoading((prev) => ({ ...prev, profile: true }));
    setErrors({});

    try {
      // TODO: Replace with actual API call
      /*
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();

      // Update auth context with new user data
      updateUser(updatedUser.user);
      */

      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage for demo
      localStorage.setItem(
        `user_settings_${user?.id}`,
        JSON.stringify({
          profile: profileData,
          privacy: privacySettings,
          notifications: notificationSettings,
          appearance: appearance,
        }),
      );

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  /**
   * PRIVACY SETTINGS UPDATE - DATABASE CONNECTION
   *
   * Updates user privacy preferences with immediate effect on profile visibility.
   *
   * DATABASE ENDPOINT: PUT /api/user/privacy
   *
   * REQUEST BODY EXAMPLE:
   * {
   *   "profilePublic": true,
   *   "showEmail": false,
   *   "showPhone": false,
   *   "allowMessages": true,
   *   "allowFollows": true,
   *   "trackingEnabled": true,
   *   "marketingEmails": false,
   *   "analyticsSharing": true,
   *   "searchEngineIndexing": true,
   *   "showOnlineStatus": true
   * }
   *
   * SECURITY CONSIDERATIONS:
   * - Validate that user owns the profile being updated
   * - Log privacy changes for audit trail
   * - Apply changes immediately to profile visibility
   * - Notify user of potential implications (e.g., search engine indexing)
   */
  const handlePrivacyUpdate = async () => {
    setLoading((prev) => ({ ...prev, privacy: true }));

    try {
      // TODO: Replace with actual API call
      /*
      const response = await fetch('/api/user/privacy', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(privacySettings)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update privacy settings');
      }

      // Log privacy change for audit
      await fetch('/api/user/audit-log', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'privacy_settings_updated',
          timestamp: new Date().toISOString(),
          changes: privacySettings
        })
      });
      */

      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Save to localStorage for demo
      const currentSettings = JSON.parse(
        localStorage.getItem(`user_settings_${user?.id}`) || "{}",
      );
      localStorage.setItem(
        `user_settings_${user?.id}`,
        JSON.stringify({
          ...currentSettings,
          privacy: privacySettings,
        }),
      );

      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved and applied.",
      });
    } catch (error: any) {
      console.error("Privacy update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update privacy settings.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, privacy: false }));
    }
  };

  /**
   * NOTIFICATION SETTINGS UPDATE - DATABASE CONNECTION
   *
   * Updates user notification preferences across email and push channels.
   *
   * DATABASE ENDPOINT: PUT /api/user/notifications
   *
   * REQUEST BODY EXAMPLE:
   * {
   *   "emailSettings": {
   *     "comments": true,
   *     "likes": false,
   *     "follows": true,
   *     "mentions": true,
   *     "blogUpdates": false,
   *     "weeklyDigest": true,
   *     "monthlyReport": false,
   *     "securityAlerts": true
   *   },
   *   "pushSettings": {
   *     "comments": true,
   *     "likes": false,
   *     "follows": true,
   *     "mentions": true,
   *     "messages": true
   *   },
   *   "preferences": {
   *     "digestFrequency": "weekly",
   *     "summaryTime": "morning"
   *   }
   * }
   *
   * INTEGRATION REQUIREMENTS:
   * - Update email subscription lists (e.g., SendGrid, Mailchimp)
   * - Configure push notification topics (e.g., Firebase)
   * - Schedule digest emails based on frequency preference
   * - Validate email preferences against legal requirements (GDPR, CAN-SPAM)
   */
  const handleNotificationUpdate = async () => {
    setLoading((prev) => ({ ...prev, notifications: true }));

    try {
      // TODO: Replace with actual API call
      /*
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailSettings: {
            comments: notificationSettings.emailComments,
            likes: notificationSettings.emailLikes,
            follows: notificationSettings.emailFollows,
            mentions: notificationSettings.emailMentions,
            blogUpdates: notificationSettings.emailBlogUpdates,
            weeklyDigest: notificationSettings.emailWeeklyDigest,
            monthlyReport: notificationSettings.emailMonthlyReport,
            securityAlerts: notificationSettings.emailSecurityAlerts
          },
          pushSettings: {
            comments: notificationSettings.pushComments,
            likes: notificationSettings.pushLikes,
            follows: notificationSettings.pushFollows,
            mentions: notificationSettings.pushMentions,
            messages: notificationSettings.pushMessages
          },
          preferences: {
            digestFrequency: notificationSettings.digestFrequency,
            summaryTime: notificationSettings.summaryTime
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update notifications');
      }

      // Update email service subscriptions
      if (notificationSettings.emailWeeklyDigest) {
        await fetch('/api/email/subscribe-digest', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            frequency: notificationSettings.digestFrequency,
            time: notificationSettings.summaryTime
          })
        });
      }
      */

      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Save to localStorage for demo
      const currentSettings = JSON.parse(
        localStorage.getItem(`user_settings_${user?.id}`) || "{}",
      );
      localStorage.setItem(
        `user_settings_${user?.id}`,
        JSON.stringify({
          ...currentSettings,
          notifications: notificationSettings,
        }),
      );

      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved and applied.",
      });
    } catch (error: any) {
      console.error("Notification update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update notification settings.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, notifications: false }));
    }
  };

  /**
   * APPEARANCE SETTINGS UPDATE - DATABASE CONNECTION
   *
   * Updates user interface preferences and applies them immediately.
   *
   * DATABASE ENDPOINT: PUT /api/user/appearance
   *
   * REQUEST BODY EXAMPLE:
   * {
   *   "theme": "dark",
   *   "language": "en",
   *   "timezone": "America/New_York",
   *   "dateFormat": "MM/DD/YYYY",
   *   "timeFormat": "12h",
   *   "compactMode": false,
   *   "animations": true,
   *   "autoSave": true,
   *   "fontSize": "medium",
   *   "editorTheme": "default"
   * }
   *
   * IMMEDIATE EFFECTS:
   * - Apply theme changes to current session
   * - Update language strings if i18n is implemented
   * - Adjust timezone for all date displays
   * - Apply font size and compact mode changes
   */
  const handleAppearanceUpdate = async () => {
    setLoading((prev) => ({ ...prev, appearance: true }));

    try {
      // Update global theme configuration for app-wide changes
      updateTheme({
        theme: appearance.theme,
        fontSize: appearance.fontSize,
        compactMode: appearance.compactMode,
        animations: appearance.animations,
        editorTheme: appearance.editorTheme,
        autoSave: appearance.autoSave,
      });

      // TODO: Replace with actual API call to save preferences
      /*
      const response = await fetch('/api/user/appearance', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appearance)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update appearance');
      }
      */

      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Save to localStorage for demo persistence
      const currentSettings = JSON.parse(
        localStorage.getItem(`user_settings_${user?.id}`) || "{}",
      );
      localStorage.setItem(
        `user_settings_${user?.id}`,
        JSON.stringify({
          ...currentSettings,
          appearance: appearance,
        }),
      );

      toast({
        title: "Appearance updated",
        description:
          "Your theme and display preferences have been saved and applied.",
      });
    } catch (error: any) {
      console.error("Appearance update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update appearance settings.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, appearance: false }));
    }
  };

  /**
   * REAL-TIME THEME PREVIEW HANDLER
   *
   * Updates the appearance state and immediately applies changes to the UI
   * for instant visual feedback. This provides a live preview of changes
   * before the user clicks save.
   *
   * @param field - The appearance setting to update
   * @param value - The new value for the setting
   */
  const handleAppearanceChange = (field: string, value: any) => {
    const newAppearance = { ...appearance, [field]: value };
    setAppearance(newAppearance);

    // Apply theme changes immediately for live preview
    if (
      field === "theme" ||
      field === "fontSize" ||
      field === "compactMode" ||
      field === "animations" ||
      field === "editorTheme" ||
      field === "autoSave"
    ) {
      updateTheme({
        [field]: value,
      });
    }
  };

  /**
   * PASSWORD CHANGE HANDLER - DATABASE CONNECTION
   *
   * Securely updates user password with validation and security measures.
   *
   * DATABASE ENDPOINT: PUT /api/user/password
   *
   * REQUEST BODY EXAMPLE:
   * {
   *   "currentPassword": "current_password_hash",
   *   "newPassword": "new_password_hash"
   * }
   *
   * SECURITY REQUIREMENTS:
   * - Verify current password before allowing change
   * - Hash passwords on client-side before sending (or use HTTPS)
   * - Implement rate limiting to prevent brute force attacks
   * - Log password change attempts for security audit
   * - Invalidate all existing sessions except current one
   * - Send email notification about password change
   */
  const handlePasswordChange = async () => {
    // Validate password form
    const validationErrors = validatePassword(passwordData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading((prev) => ({ ...prev, password: true }));
    setErrors({});

    try {
      // TODO: Replace with actual API call
      /*
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: await hashPassword(passwordData.currentPassword),
          newPassword: await hashPassword(passwordData.newPassword)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          setErrors({ currentPassword: 'Current password is incorrect' });
          return;
        }
        throw new Error(errorData.message || 'Failed to update password');
      }

      // Send security notification email
      await fetch('/api/user/notify-password-change', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      */

      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reset password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordDialog(false);

      toast({
        title: "Password updated",
        description:
          "Your password has been changed successfully. A confirmation email has been sent.",
      });
    } catch (error: any) {
      console.error("Password change error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  const handleAvatarChange = (avatarUrl: string) => {
    // This would typically update the user context and database
    toast({
      title: "Avatar updated",
      description: "Your profile picture has been changed.",
    });
  };

  /**
   * DATA EXPORT HANDLER - USER DATA EXPORT ENDPOINT
   *
   * Exports all user data in compliance with GDPR data portability requirements.
   *
   * API ENDPOINT: POST /api/user/export
   *
   * REQUEST BODY:
   * {
   *   "format": "pdf",           // Format: 'pdf' | 'json' | 'csv' | 'zip'
   *   "includeAnalytics": true,  // Include blog analytics data
   *   "includePosts": true,      // Include all blog posts
   *   "includeComments": true,   // Include user comments
   *   "includeSettings": true    // Include user preferences
   * }
   *
   * SUCCESS RESPONSE (202 Accepted):
   * {
   *   "exportId": "exp_123456789",
   *   "status": "processing",
   *   "estimatedCompletion": "2024-01-15T10:30:00Z",
   *   "downloadUrl": null
   * }
   *
   * DATA INCLUDED:
   * - Profile information
   * - Blog posts and comments
   * - Interaction history
   * - Settings and preferences
   * - Analytics data
   * - Account activity logs
   *
   * COMPLIANCE NOTES:
   * - Must complete within 30 days (GDPR requirement)
   * - Data should be in portable format (JSON, CSV)
   * - Include instructions for data interpretation
   * - Secure download with expiring links
   */
  const handleDataExport = async () => {
    setLoading((prev) => ({ ...prev, export: true }));

    try {
      // TODO: Replace with actual API call
      /*
      const response = await fetch('/api/user/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start data export');
      }

      const exportData = await response.json();

      // Poll for export completion
      const pollExport = async (exportId: string) => {
        const statusResponse = await fetch(`/api/user/export/${exportId}`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });

        const status = await statusResponse.json();

        if (status.status === 'completed') {
          window.open(status.downloadUrl, '_blank');
        } else if (status.status === 'processing') {
          setTimeout(() => pollExport(exportId), 5000);
        }
      };

      pollExport(exportData.exportId);
      */

      // Simulate export for demo
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Create mock export data
      const exportData = {
        user: profileData,
        settings: {
          privacy: privacySettings,
          notifications: notificationSettings,
          appearance: appearance,
        },
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aiml-info-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data export completed",
        description: "Your data has been exported and downloaded successfully.",
      });
    } catch (error: any) {
      console.error("Data export error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, export: false }));
    }
  };

  /**
   * ACCOUNT DELETION HANDLER - DATABASE CONNECTION
   *
   * Permanently deletes user account and all associated data.
   *
   * DATABASE ENDPOINT: DELETE /api/user/account
   *
   * DELETION PROCESS:
   * 1. Verify user identity (require password confirmation)
   * 2. Mark account for deletion (30-day grace period)
   * 3. Send confirmation email with cancellation option
   * 4. After grace period, permanently delete:
   *    - User profile and settings
   *    - Blog posts and comments
   *    - Analytics data
   *    - File uploads
   *    - Session tokens
   *
   * COMPLIANCE REQUIREMENTS:
   * - GDPR "Right to erasure" compliance
   * - Retain minimal data for legal/security purposes
   * - Anonymize rather than delete where legally required
   * - Provide deletion confirmation
   */
  const handleDeleteAccount = async () => {
    setLoading((prev) => ({ ...prev, delete: true }));

    try {
      // TODO: Replace with actual API call
      /*
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmation: 'DELETE_MY_ACCOUNT',
          reason: 'User requested deletion'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      const deletionData = await response.json();

      // Send deletion confirmation email
      await fetch('/api/user/notify-account-deletion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gracePeriodEnd: deletionData.gracePeriodEnd,
          cancellationToken: deletionData.cancellationToken
        })
      });
      */

      // Simulate deletion for demo
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear local data
      localStorage.removeItem(`user_settings_${user?.id}`);

      // Logout and redirect
      logout();
      navigate("/");

      toast({
        title: "Account deletion initiated",
        description:
          "Your account has been scheduled for deletion. You have 30 days to cancel this action.",
      });
    } catch (error: any) {
      console.error("Account deletion error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-4xl">
        <div className="space-y-4 sm:space-y-6">
          {/* Header - Mobile First */}
          <div className="text-center sm:text-left px-2 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto p-1">
              <TabsTrigger
                value="profile"
                className="flex items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Pro</span>
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="flex items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Privacy</span>
                <span className="sm:hidden">Pri</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm"
              >
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Not</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm"
              >
                <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Appearance</span>
                <span className="sm:hidden">App</span>
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="flex items-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm"
              >
                <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Data</span>
                <span className="sm:hidden">Data</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Avatar Selection */}
                <div className="lg:col-span-2">
                  <AvatarSelector
                    currentAvatar={user.avatar}
                    userName={user.name}
                    onAvatarChange={handleAvatarChange}
                  />
                </div>

                {/* Profile Information */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Update your public profile information
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Display Name *</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself, your interests, and expertise..."
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        className={`min-h-[100px] ${errors.bio ? "border-destructive" : ""}`}
                        maxLength={500}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {errors.bio || "Brief description for your profile"}
                        </span>
                        <span>{profileData.bio.length}/500</span>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          className={errors.phone ? "border-destructive" : ""}
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="City, State, Country"
                          value={profileData.location}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              location: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          placeholder="Company or Organization"
                          value={profileData.company}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              company: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          placeholder="Your Role or Position"
                          value={profileData.jobTitle}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              jobTitle: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Links & Social</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            placeholder="https://yourwebsite.com"
                            value={profileData.website}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                website: e.target.value,
                              })
                            }
                            className={
                              errors.website ? "border-destructive" : ""
                            }
                          />
                          {errors.website && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.website}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twitter">Twitter</Label>
                          <Input
                            id="twitter"
                            placeholder="@username or username"
                            value={profileData.twitter}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                twitter: e.target.value,
                              })
                            }
                            className={
                              errors.twitter ? "border-destructive" : ""
                            }
                          />
                          {errors.twitter && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.twitter}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub Username</Label>
                        <Input
                          id="github"
                          placeholder="username"
                          value={profileData.github}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              github: e.target.value,
                            })
                          }
                          className={errors.github ? "border-destructive" : ""}
                        />
                        {errors.github && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.github}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleProfileUpdate}
                        disabled={loading.profile}
                        className="flex-1 sm:flex-none"
                      >
                        {loading.profile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Profile
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setProfileData({
                            name: user?.name || "",
                            email: user?.email || "",
                            bio: "",
                            location: "",
                            website: "",
                            twitter: "",
                            github: "",
                            phone: "",
                            company: "",
                            jobTitle: "",
                          });
                          setErrors({});
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Visibility</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Control who can see your profile and personal information
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-base font-medium">
                        Public Profile
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to all users and search
                        engines
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.profilePublic}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          profilePublic: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1">
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your email address on your public profile
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showEmail}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          showEmail: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1">
                      <Label>Show Phone Number</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your phone number on your profile
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showPhone}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          showPhone: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1">
                      <Label>Show Online Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Let others see when you're online or recently active
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          showOnlineStatus: checked,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interaction Settings</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Control how other users can interact with you
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1">
                      <Label>Allow Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Let other users send you private messages
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          allowMessages: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1">
                      <Label>Allow Follows</Label>
                      <p className="text-sm text-muted-foreground">
                        Let other users follow your blog and activity
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.allowFollows}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          allowFollows: checked,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data & Analytics</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage how your data is used for analytics and marketing
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1">
                      <Label>Usage Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help us improve by sharing anonymous usage data
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.trackingEnabled}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          trackingEnabled: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1">
                      <Label>Analytics Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Share your blog analytics with third-party services
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.analyticsSharing}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          analyticsSharing: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1">
                      <Label>Search Engine Indexing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow search engines to index your profile and content
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.searchEngineIndexing}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          searchEngineIndexing: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex-1">
                      <Label>Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features, updates, and
                        promotions
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.marketingEmails}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          marketingEmails: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handlePrivacyUpdate}
                      disabled={loading.privacy}
                      className="flex-1 sm:flex-none"
                    >
                      {loading.privacy ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Update Privacy Settings
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose which email notifications you want to receive
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Comments & Replies</Label>
                        <p className="text-sm text-muted-foreground">
                          When someone comments on your posts or replies to your
                          comments
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailComments}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailComments: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Likes & Reactions</Label>
                        <p className="text-sm text-muted-foreground">
                          When someone likes your posts or comments
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailLikes}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailLikes: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>New Followers</Label>
                        <p className="text-sm text-muted-foreground">
                          When someone starts following your blog
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailFollows}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailFollows: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Mentions</Label>
                        <p className="text-sm text-muted-foreground">
                          When someone mentions you in a post or comment
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailMentions}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailMentions: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Blog Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Updates about new features and platform news
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailBlogUpdates}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailBlogUpdates: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Security Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Important security notifications (cannot be disabled)
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailSecurityAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailSecurityAlerts: checked,
                          })
                        }
                        disabled
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Email Digest</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Weekly Digest</Label>
                        <p className="text-sm text-muted-foreground">
                          Weekly summary of activity and popular content
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailWeeklyDigest}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailWeeklyDigest: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Monthly Report</Label>
                        <p className="text-sm text-muted-foreground">
                          Monthly analytics and insights about your content
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailMonthlyReport}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailMonthlyReport: checked,
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Digest Frequency</Label>
                        <Select
                          value={notificationSettings.digestFrequency}
                          onValueChange={(value) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              digestFrequency: value as any,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Preferred Time</Label>
                        <Select
                          value={notificationSettings.summaryTime}
                          onValueChange={(value) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              summaryTime: value as any,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">
                              Morning (9 AM)
                            </SelectItem>
                            <SelectItem value="afternoon">
                              Afternoon (2 PM)
                            </SelectItem>
                            <SelectItem value="evening">
                              Evening (6 PM)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Push Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Real-time notifications on your device
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Comments</Label>
                        <p className="text-sm text-muted-foreground">
                          Instant notifications for new comments
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushComments}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            pushComments: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Likes</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications when someone likes your content
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushLikes}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            pushLikes: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Follows</Label>
                        <p className="text-sm text-muted-foreground">
                          When someone starts following you
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushFollows}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            pushFollows: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Mentions</Label>
                        <p className="text-sm text-muted-foreground">
                          When you're mentioned in posts or comments
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushMentions}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            pushMentions: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Direct Messages</Label>
                        <p className="text-sm text-muted-foreground">
                          When you receive private messages
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushMessages}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            pushMessages: checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleNotificationUpdate}
                      disabled={loading.notifications}
                      className="flex-1 sm:flex-none"
                    >
                      {loading.notifications ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4 mr-2" />
                          Update Notifications
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme & Visual</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Customize the visual appearance of the interface
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Color Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          value: "light",
                          label: "Light",
                          preview: "bg-white border-2",
                        },
                        {
                          value: "dark",
                          label: "Dark",
                          preview: "bg-gray-900 border-2",
                        },
                        {
                          value: "system",
                          label: "System",
                          preview:
                            "bg-gradient-to-r from-white to-gray-900 border-2",
                        },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() =>
                            handleAppearanceChange("theme", theme.value)
                          }
                          className={`p-3 rounded-lg border-2 transition-all ${
                            appearance.theme === theme.value
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/50"
                          }`}
                        >
                          <div
                            className={`w-full h-12 rounded mb-2 ${theme.preview}`}
                          />
                          <div className="text-sm font-medium">
                            {theme.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Select
                      value={appearance.fontSize}
                      onValueChange={(value) =>
                        setAppearance({ ...appearance, fontSize: value as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (14px)</SelectItem>
                        <SelectItem value="medium">Medium (16px)</SelectItem>
                        <SelectItem value="large">Large (18px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Editor Theme</Label>
                    <Select
                      value={appearance.editorTheme}
                      onValueChange={(value) =>
                        setAppearance({
                          ...appearance,
                          editorTheme: value as any,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="focus">Focus Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Interface Options</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label>Compact Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Use smaller spacing and reduce padding
                          </p>
                        </div>
                        <Switch
                          checked={appearance.compactMode}
                          onCheckedChange={(checked) =>
                            setAppearance({
                              ...appearance,
                              compactMode: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label>Animations</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable smooth transitions and animations
                          </p>
                        </div>
                        <Switch
                          checked={appearance.animations}
                          onCheckedChange={(checked) =>
                            setAppearance({
                              ...appearance,
                              animations: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label>Auto-save</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically save drafts while writing
                          </p>
                        </div>
                        <Switch
                          checked={appearance.autoSave}
                          onCheckedChange={(checked) =>
                            setAppearance({ ...appearance, autoSave: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Localization</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Set your language, timezone, and date format preferences
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={appearance.language}
                        onValueChange={(value) =>
                          setAppearance({ ...appearance, language: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                          <SelectItem value="es">🇪🇸 Español</SelectItem>
                          <SelectItem value="fr">🇫🇷 Français</SelectItem>
                          <SelectItem value="de">����🇪 Deutsch</SelectItem>
                          <SelectItem value="zh">🇨🇳 中文</SelectItem>
                          <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={appearance.timezone}
                        onValueChange={(value) =>
                          setAppearance({ ...appearance, timezone: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                          <SelectItem value="America/New_York">
                            Eastern Time (GMT-5)
                          </SelectItem>
                          <SelectItem value="America/Chicago">
                            Central Time (GMT-6)
                          </SelectItem>
                          <SelectItem value="America/Denver">
                            Mountain Time (GMT-7)
                          </SelectItem>
                          <SelectItem value="America/Los_Angeles">
                            Pacific Time (GMT-8)
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            London (GMT+0)
                          </SelectItem>
                          <SelectItem value="Europe/Paris">
                            Paris (GMT+1)
                          </SelectItem>
                          <SelectItem value="Asia/Tokyo">
                            Tokyo (GMT+9)
                          </SelectItem>
                          <SelectItem value="Asia/Shanghai">
                            Shanghai (GMT+8)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select
                        value={appearance.dateFormat}
                        onValueChange={(value) =>
                          handleAppearanceChange("dateFormat", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">
                            MM/DD/YYYY (US)
                          </SelectItem>
                          <SelectItem value="DD/MM/YYYY">
                            DD/MM/YYYY (EU)
                          </SelectItem>
                          <SelectItem value="YYYY-MM-DD">
                            YYYY-MM-DD (ISO)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Format</Label>
                      <Select
                        value={appearance.timeFormat}
                        onValueChange={(value) =>
                          handleAppearanceChange("timeFormat", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Enhanced Real-time Preview Section */}
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader className="pb-3 px-4 py-3 sm:px-6 sm:py-4">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        Live Preview
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        See your changes in real-time
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
                      {/* Theme Preview */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-primary">
                          Theme & Appearance
                        </Label>
                        <div
                          className={`p-2 sm:p-3 rounded-lg border transition-all duration-300 ${
                            appearance.theme === "dark"
                              ? "bg-gray-900 border-gray-700 text-white"
                              : appearance.theme === "light"
                                ? "bg-white border-gray-200 text-gray-900"
                                : "bg-gradient-to-r from-white to-gray-100 border-gray-300 text-gray-900"
                          } ${
                            appearance.compactMode
                              ? "py-1 sm:py-2"
                              : "py-2 sm:py-3"
                          }`}
                        >
                          <div
                            className={`${
                              appearance.fontSize === "small"
                                ? "text-xs sm:text-sm"
                                : appearance.fontSize === "large"
                                  ? "text-base sm:text-lg"
                                  : "text-sm sm:text-base"
                            } ${
                              appearance.animations
                                ? "transition-all duration-300"
                                : ""
                            }`}
                          >
                            <div className="font-semibold mb-1">
                              Sample Blog Post
                            </div>
                            <div className="text-opacity-80">
                              This is how your content will appear with current
                              settings.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Date/Time Preview */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-primary">
                          Date & Time Format
                        </Label>
                        <div className="p-2 sm:p-3 bg-muted/30 rounded-lg border space-y-1 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-mono text-xs sm:text-sm">
                              {(() => {
                                const now = new Date();
                                switch (appearance.dateFormat) {
                                  case "DD/MM/YYYY":
                                    return now.toLocaleDateString("en-GB");
                                  case "YYYY-MM-DD":
                                    return now.toISOString().split("T")[0];
                                  default:
                                    return now.toLocaleDateString("en-US");
                                }
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-mono text-xs sm:text-sm">
                              {new Date().toLocaleTimeString("en-US", {
                                hour12: appearance.timeFormat === "12h",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Timezone:
                            </span>
                            <span className="font-mono text-xs truncate max-w-24 sm:max-w-none">
                              {appearance.timezone}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Language:
                            </span>
                            <span className="text-xs sm:text-sm">
                              {appearance.language === "en"
                                ? "🇺🇸 English"
                                : appearance.language === "es"
                                  ? "🇪🇸 Español"
                                  : appearance.language === "fr"
                                    ? "🇫🇷 Français"
                                    : appearance.language === "de"
                                      ? "🇩🇪 Deutsch"
                                      : appearance.language === "zh"
                                        ? "🇨🇳 中文"
                                        : appearance.language === "ja"
                                          ? "🇯🇵 日本語"
                                          : "🇺🇸 English"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Editor Preview */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-primary">
                          Editor Settings
                        </Label>
                        <div
                          className={`p-2 sm:p-3 rounded-lg border font-mono text-xs sm:text-sm ${
                            appearance.editorTheme === "dark"
                              ? "bg-gray-900 text-green-400 border-gray-700"
                              : appearance.editorTheme === "monokai"
                                ? "bg-gray-800 text-yellow-300 border-gray-600"
                                : "bg-gray-50 text-gray-800 border-gray-200"
                          }`}
                        >
                          <div className="text-blue-500">function</div>
                          <div className="ml-2 text-purple-500">
                            createBlog() {`{`}
                          </div>
                          <div className="ml-4">console.log("Hello!");</div>
                          <div className="ml-2">{`}`}</div>
                          {appearance.autoSave && (
                            <div className="mt-1 sm:mt-2 text-xs opacity-70">
                              ✓ Auto-saved
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Feature Toggles Preview */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-primary">
                          Interface Options
                        </Label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div
                            className={`p-1.5 sm:p-2 rounded border text-center ${
                              appearance.compactMode
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            Compact: {appearance.compactMode ? "ON" : "OFF"}
                          </div>
                          <div
                            className={`p-1.5 sm:p-2 rounded border text-center ${
                              appearance.animations
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            Animations: {appearance.animations ? "ON" : "OFF"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleAppearanceUpdate}
                      disabled={loading.appearance}
                      className="flex-1 sm:flex-none"
                    >
                      {loading.appearance ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Palette className="h-4 w-4 mr-2" />
                          Update Appearance
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Export</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Export your data in compliance with data portability rights
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">
                      What's included in your export:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Profile information and settings</li>
                      <li>• All your blog posts and comments</li>
                      <li>• Interaction history and analytics</li>
                      <li>• Account activity logs</li>
                      <li>• Uploaded files and media</li>
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleDataExport}
                    disabled={loading.export}
                    className="w-full sm:w-auto"
                  >
                    {loading.export ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Preparing Export...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download My Data
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage your account security settings
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Last changed: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <Dialog
                      open={passwordDialog}
                      onOpenChange={setPasswordDialog}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Key className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">
                              Current Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="currentPassword"
                                type={
                                  showPasswords.current ? "text" : "password"
                                }
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    currentPassword: e.target.value,
                                  })
                                }
                                className={
                                  errors.currentPassword
                                    ? "border-destructive"
                                    : ""
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    current: !showPasswords.current,
                                  })
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showPasswords.current ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            {errors.currentPassword && (
                              <p className="text-sm text-destructive">
                                {errors.currentPassword}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                              <Input
                                id="newPassword"
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    newPassword: e.target.value,
                                  })
                                }
                                className={
                                  errors.newPassword ? "border-destructive" : ""
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    new: !showPasswords.new,
                                  })
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showPasswords.new ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            {passwordData.newPassword && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span>Password strength</span>
                                  <span
                                    className={`font-medium ${getPasswordStrength(passwordData.newPassword).color.replace("bg-", "text-")}`}
                                  >
                                    {
                                      getPasswordStrength(
                                        passwordData.newPassword,
                                      ).label
                                    }
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    getPasswordStrength(
                                      passwordData.newPassword,
                                    ).percentage
                                  }
                                  className="h-2"
                                />
                              </div>
                            )}
                            {errors.newPassword && (
                              <p className="text-sm text-destructive">
                                {errors.newPassword}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                              Confirm New Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={
                                  showPasswords.confirm ? "text" : "password"
                                }
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                className={
                                  errors.confirmPassword
                                    ? "border-destructive"
                                    : ""
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    confirm: !showPasswords.confirm,
                                  })
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showPasswords.confirm ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            {errors.confirmPassword && (
                              <p className="text-sm text-destructive">
                                {errors.confirmPassword}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={handlePasswordChange}
                              disabled={loading.password}
                              className="flex-1"
                            >
                              {loading.password ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                  Updating...
                                </>
                              ) : (
                                "Update Password"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setPasswordDialog(false);
                                setPasswordData({
                                  currentPassword: "",
                                  newPassword: "",
                                  confirmPassword: "",
                                });
                                setErrors({});
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">
                    Danger Zone
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Irreversible actions that will permanently affect your
                    account
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <h4 className="font-medium text-destructive mb-2">
                      Delete Account
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will permanently delete your account and all
                      associated data. This action cannot be undone. You will
                      have a 30-day grace period to cancel.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete My Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete your account and
                            remove all your data from our servers. You will have
                            30 days to cancel this action before deletion is
                            final.
                            <br />
                            <br />
                            This includes:
                            <br />• Your profile and all blog posts
                            <br />• Comments and interactions
                            <br />• Analytics and activity data
                            <br />• Uploaded files and media
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={loading.delete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {loading.delete ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Deleting...
                              </>
                            ) : (
                              "Delete Account"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
