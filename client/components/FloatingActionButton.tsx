import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingActionButton() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2 sm:gap-3">
      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="sm"
          className={cn(
            "h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
            "bg-primary/90 backdrop-blur-sm hover:bg-primary",
          )}
        >
          <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}

      {/* Expanded action buttons */}
      {isExpanded && (
        <div className="flex flex-col gap-2 sm:gap-3 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          <Button
            asChild
            size="sm"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 bg-blue-600 hover:bg-blue-700"
          >
            <Link to="/blogs">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110 bg-green-600 hover:bg-green-700"
          >
            <Link to="/dashboard">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </Link>
          </Button>
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110",
          "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
          isExpanded && "rotate-45",
        )}
      >
        <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </div>
  );
}
