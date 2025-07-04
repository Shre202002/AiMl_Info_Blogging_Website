import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

/**
 * THEME SYSTEM CONFIGURATION
 *
 * This context manages the application's theme and appearance settings,
 * providing real-time updates when users change their preferences in settings.
 *
 * FEATURES:
 * - Real-time theme switching (light/dark/system)
 * - Font size adjustments across the application
 * - Interface mode changes (compact/normal)
 * - Animation preferences
 * - Persistence across browser sessions
 *
 * INTEGRATION WITH BACKEND:
 * - Settings are loaded from user preferences in database
 * - Changes are automatically synced when user updates settings
 * - Fallback to localStorage for demo purposes
 */

// Theme configuration interface
interface ThemeConfig {
  // Color theme options
  theme: "light" | "dark" | "system";

  // Typography settings
  fontSize: "small" | "medium" | "large";

  // Interface preferences
  compactMode: boolean;
  animations: boolean;

  // Editor-specific settings
  editorTheme: "default" | "minimal" | "focus";

  // Auto-save preference
  autoSave: boolean;
}

// Default theme configuration
const defaultTheme: ThemeConfig = {
  theme: "system",
  fontSize: "medium",
  compactMode: false,
  animations: true,
  editorTheme: "default",
  autoSave: true,
};

// Theme context interface
interface ThemeContextType {
  config: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  applyTheme: (config: ThemeConfig) => void;
  isDarkMode: boolean;
  cssVariables: Record<string, string>;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * THEME HOOK - Easy access to theme functionality
 *
 * Use this hook in any component to access theme settings and updates.
 *
 * EXAMPLE USAGE:
 * ```tsx
 * const { config, updateTheme, isDarkMode } = useTheme();
 *
 * // Update font size
 * updateTheme({ fontSize: "large" });
 *
 * // Toggle compact mode
 * updateTheme({ compactMode: !config.compactMode });
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * THEME PROVIDER COMPONENT
 *
 * This component manages the application's theme state and applies CSS custom properties
 * for real-time visual updates when settings change.
 *
 * CSS CUSTOM PROPERTIES MANAGED:
 * - --font-size-base: Base font size for the application
 * - --spacing-unit: Spacing multiplier for compact mode
 * - --animation-duration: Animation timing based on user preference
 * - --editor-theme: Editor-specific styling variables
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [config, setConfig] = useState<ThemeConfig>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  /**
   * SYSTEM THEME DETECTION
   *
   * Automatically detects the user's system theme preference and applies it
   * when the theme is set to "system" mode.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateSystemTheme = () => {
      if (config.theme === "system") {
        setIsDarkMode(mediaQuery.matches);
        applyDarkModeClass(mediaQuery.matches);
      }
    };

    // Initial check
    updateSystemTheme();

    // Listen for system theme changes
    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, [config.theme]);

  /**
   * THEME INITIALIZATION
   *
   * Loads saved theme preferences on component mount and applies them to the DOM.
   */
  useEffect(() => {
    loadSavedTheme();
  }, []);

  /**
   * CSS VARIABLES UPDATE
   *
   * Updates CSS custom properties whenever theme configuration changes,
   * providing real-time visual feedback for settings changes.
   */
  useEffect(() => {
    applyCSSVariables();
  }, [config]);

  /**
   * LOAD SAVED THEME PREFERENCES
   *
   * Retrieves theme settings from localStorage or backend API.
   * In production, this would fetch from user's saved preferences.
   */
  const loadSavedTheme = () => {
    try {
      // TODO: Replace with API call in production
      // const response = await fetch('/api/user/appearance');
      // const savedConfig = await response.json();

      // For demo: load from localStorage
      const saved = localStorage.getItem("aiml_theme_config");
      if (saved) {
        const savedConfig = JSON.parse(saved);
        setConfig({ ...defaultTheme, ...savedConfig });
        applyTheme({ ...defaultTheme, ...savedConfig });
      }
    } catch (error) {
      console.error("Failed to load theme preferences:", error);
    }
  };

  /**
   * APPLY DARK MODE CLASS
   *
   * Toggles the 'dark' class on the document element for CSS-based theme switching.
   */
  const applyDarkModeClass = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  /**
   * APPLY CSS CUSTOM PROPERTIES
   *
   * Updates CSS variables for real-time visual changes without page reload.
   * These variables are used throughout the application's CSS.
   */
  const applyCSSVariables = () => {
    const root = document.documentElement;

    // Font size mapping
    const fontSizes = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };

    // Spacing multiplier for compact mode
    const spacingMultiplier = config.compactMode ? "0.75" : "1";

    // Animation duration based on preference
    const animationDuration = config.animations ? "0.2s" : "0s";

    // Apply the CSS custom properties
    root.style.setProperty("--font-size-base", fontSizes[config.fontSize]);
    root.style.setProperty("--spacing-multiplier", spacingMultiplier);
    root.style.setProperty("--animation-duration", animationDuration);
    root.style.setProperty("--editor-theme", config.editorTheme);

    // Compact mode body class for additional styling
    if (config.compactMode) {
      document.body.classList.add("compact-mode");
    } else {
      document.body.classList.remove("compact-mode");
    }

    // Animation preference body class
    if (!config.animations) {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }
  };

  /**
   * UPDATE THEME CONFIGURATION
   *
   * Updates specific theme settings and persists them.
   * This function enables real-time theme updates from the settings page.
   *
   * @param updates - Partial theme configuration to update
   */
  const updateTheme = (updates: Partial<ThemeConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);

    // Persist to localStorage for demo
    // In production, this would save to backend API
    localStorage.setItem("aiml_theme_config", JSON.stringify(newConfig));

    // Apply theme changes immediately
    applyTheme(newConfig);
  };

  /**
   * APPLY COMPLETE THEME CONFIGURATION
   *
   * Applies a complete theme configuration, including dark mode detection.
   * Used for initial theme application and settings updates.
   *
   * @param themeConfig - Complete theme configuration to apply
   */
  const applyTheme = (themeConfig: ThemeConfig) => {
    // Handle dark mode application
    if (themeConfig.theme === "light") {
      setIsDarkMode(false);
      applyDarkModeClass(false);
    } else if (themeConfig.theme === "dark") {
      setIsDarkMode(true);
      applyDarkModeClass(true);
    } else {
      // System theme
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setIsDarkMode(systemDark);
      applyDarkModeClass(systemDark);
    }
  };

  /**
   * CSS VARIABLES OBJECT
   *
   * Provides access to current CSS variables for components that need
   * to read theme values programmatically.
   */
  const cssVariables = {
    fontSize: config.fontSize,
    spacingMultiplier: config.compactMode ? "0.75" : "1",
    animationDuration: config.animations ? "0.2s" : "0s",
    editorTheme: config.editorTheme,
  };

  // Provider value with all theme functionality
  const value: ThemeContextType = {
    config,
    updateTheme,
    applyTheme,
    isDarkMode,
    cssVariables,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
