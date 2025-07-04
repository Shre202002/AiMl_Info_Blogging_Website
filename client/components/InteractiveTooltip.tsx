import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InteractiveTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  delayDuration?: number;
}

export function InteractiveTooltip({
  children,
  content,
  side = "top",
  className,
  delayDuration = 300,
}: InteractiveTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "transition-transform duration-200 hover:scale-105",
              className,
            )}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="animate-in fade-in-0 zoom-in-95 duration-200 bg-popover/95 backdrop-blur-sm border shadow-lg"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
