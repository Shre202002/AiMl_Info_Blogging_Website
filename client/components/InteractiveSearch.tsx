import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  suggestions?: string[];
  className?: string;
}

export function InteractiveSearch({
  placeholder = "Search articles...",
  value,
  onChange,
  onSearch,
  suggestions = [],
  className,
}: InteractiveSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions
    .filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase()) &&
        suggestion.toLowerCase() !== value.toLowerCase(),
    )
    .slice(0, 5);

  useEffect(() => {
    setShowSuggestions(
      isFocused && value.length > 0 && filteredSuggestions.length > 0,
    );
  }, [isFocused, value, filteredSuggestions.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestion >= 0) {
        onChange(filteredSuggestions[selectedSuggestion]);
        setShowSuggestions(false);
      } else {
        onSearch?.(value);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn("relative max-w-xs sm:max-w-md mx-auto w-full", className)}
    >
      <div
        className={cn(
          "relative transition-all duration-300",
          isFocused && "scale-105",
        )}
      >
        <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search
            className={cn(
              "h-3 w-3 sm:h-4 sm:w-4 transition-colors duration-200",
              isFocused ? "text-primary" : "text-muted-foreground",
            )}
          />
        </div>

        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
              setShowSuggestions(false);
            }, 200);
          }}
          className={cn(
            "pl-8 pr-16 sm:pl-10 sm:pr-20 transition-all duration-300 w-full",
            isFocused && "ring-2 ring-primary/20 border-primary/50",
          )}
        />

        <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
          {value && (
            <Button
              variant="ghost"
              size="xs"
              onClick={clearSearch}
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="xs"
            onClick={() => onSearch?.(value)}
            className={cn(
              "h-5 w-5 sm:h-6 sm:w-6 p-0 transition-colors duration-200",
              isFocused && "text-primary hover:bg-primary/10",
            )}
          >
            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </Button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "w-full text-left px-4 py-2 hover:bg-accent transition-colors duration-150",
                "first:rounded-t-lg last:rounded-b-lg",
                index === selectedSuggestion && "bg-accent",
              )}
            >
              <span className="text-sm">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
