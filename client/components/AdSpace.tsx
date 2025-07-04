import { cn } from "@/lib/utils";

interface AdSpaceProps {
  size:
    | "banner"
    | "rectangle"
    | "skyscraper"
    | "large-rectangle"
    | "leaderboard";
  className?: string;
  label?: string;
}

const adSizes = {
  banner: "w-full h-24", // 728x90
  rectangle: "w-80 h-64", // 300x250
  skyscraper: "w-40 h-[600px]", // 160x600
  "large-rectangle": "w-96 h-80", // 336x280
  leaderboard: "w-full h-32", // 728x90
};

export function AdSpace({ size, className, label }: AdSpaceProps) {
  return (
    <div
      className={cn(
        "border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center bg-muted/10 relative group hover:border-muted-foreground/30 transition-colors",
        adSizes[size],
        className,
      )}
    >
      <div className="text-center text-sm text-muted-foreground">
        <div className="font-medium">{label || "Advertisement"}</div>
        <div className="text-xs opacity-60 mt-1">Google AdSense Space</div>
      </div>

      {/* Corner indicator */}
      <div className="absolute top-2 right-2 text-xs text-muted-foreground/40 font-mono">
        AD
      </div>
    </div>
  );
}
