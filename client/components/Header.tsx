import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoginModal } from "@/components/LoginModal";
import { SignupModal } from "@/components/SignupModal";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Brain,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Blogs", href: "/blogs" },
    ...(isAuthenticated ? [{ name: "Dashboard", href: "/dashboard" }] : []),
  ];

  return (
    <header className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-3 sm:px-4 lg:px-6 xl:px-8 flex h-14 sm:h-16 items-center justify-between">
        {/* Logo - Mobile First */}
        <Link to="/" className="flex items-center space-x-1 sm:space-x-2 group">
          <div className="relative">
            <Brain className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary group-hover:text-primary/80 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-300 group-hover:scale-150" />
          </div>
          <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-primary transition-all duration-300">
            AIML Info
          </span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 relative group",
                location.pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {item.name}
              {location.pathname === item.href && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Link>
          ))}
        </nav>

        {/* Desktop Auth & User Menu - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 xl:h-9 xl:w-9 rounded-full"
                >
                  <Avatar className="h-7 w-7 xl:h-8 xl:w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-52 xl:w-56"
                align="end"
                forceMount
              >
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{user?.name}</p>
                    <p className="w-[180px] xl:w-[200px] truncate text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsLoginOpen(true)}
                className="hover:scale-105 transition-all duration-200 px-2 xl:px-3 text-sm"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => setIsSignupOpen(true)}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 px-2 xl:px-3 text-sm"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button - Visible on mobile and tablet */}
        <div className="flex items-center space-x-2 lg:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation - Mobile First */}
      {isMenuOpen && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur-xl absolute top-full left-0 right-0 z-[100] shadow-lg">
          <nav className="container px-3 sm:px-4 py-3 sm:py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "block py-2 px-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-muted/50",
                  location.pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <Separator className="my-3" />

            {isAuthenticated ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs sm:text-sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/settings");
                    }}
                  >
                    <Settings className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    Settings
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs sm:text-sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    Log out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full justify-center text-base"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLoginOpen(true);
                  }}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  className="w-full justify-center bg-gradient-to-r from-primary to-primary/80 text-base"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSignupOpen(true);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </header>
  );
}
