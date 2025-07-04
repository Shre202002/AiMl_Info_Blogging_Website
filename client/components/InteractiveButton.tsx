import { useState, useRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RippleProps {
  x: number;
  y: number;
  size: number;
}

export function InteractiveButton({
  children,
  className,
  onClick,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<RippleProps[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: RippleProps = { x, y, size };
    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);

    // Call original onClick
    onClick?.(event);
  };

  return (
    <Button
      ref={buttonRef}
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95",
        className,
      )}
      onClick={createRipple}
      {...props}
    >
      {children}
      {ripples.map((ripple, index) => (
        <span
          key={index}
          className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animationDuration: "600ms",
          }}
        />
      ))}
    </Button>
  );
}
