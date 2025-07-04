/**
 * NOT FOUND PAGE COMPONENT
 *
 * A user-friendly 404 page with navigation options and branding consistency.
 * This page is displayed when users navigate to non-existent routes.
 *
 * FEATURES:
 * - Consistent branding with AIML Info theme
 * - Clear navigation options
 * - Responsive design
 * - Animated elements for better UX
 * - Search functionality suggestion
 */

import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Search,
  BookOpen,
  ArrowLeft,
  Brain,
  Sparkles,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Animated 404 Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative bg-gradient-to-r from-primary to-blue-600 p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center">
              <Brain className="h-16 w-16 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-bounce" />
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved to a
              different location.
            </p>
          </div>

          {/* Search Suggestion */}
          <Card className="mx-auto max-w-md">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Search className="h-4 w-4" />
                  Try searching for content
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search articles, topics..."
                    className="flex-1"
                  />
                  <Button size="icon" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <Button
              variant="outline"
              asChild
              className="h-auto p-4 flex flex-col gap-2"
            >
              <Link to="/">
                <Home className="h-6 w-6" />
                <span className="font-medium">Go Home</span>
                <span className="text-xs text-muted-foreground">
                  Return to homepage
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="h-auto p-4 flex flex-col gap-2"
            >
              <Link to="/blogs">
                <BookOpen className="h-6 w-6" />
                <span className="font-medium">Browse Blogs</span>
                <span className="text-xs text-muted-foreground">
                  Explore AI & ML articles
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="h-auto p-4 flex flex-col gap-2"
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="font-medium">Go Back</span>
              <span className="text-xs text-muted-foreground">
                Return to previous page
              </span>
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-8 text-sm text-muted-foreground">
            <p>
              If you believe this is an error, please{" "}
              <a
                href="mailto:support@aimlinfo.com"
                className="text-primary hover:underline"
              >
                contact our support team
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
