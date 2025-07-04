import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Activity,
  Eye,
  Users,
  Target,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

interface LiveInteractionPoint {
  x: number;
  y: number;
  type: "click" | "hover" | "scroll";
  timestamp: number;
  isLoggedIn: boolean;
  id: string;
}

interface LiveHeatMapProps {
  enabled?: boolean;
  showLiveIndicator?: boolean;
}

export function LiveHeatMap({
  enabled = false,
  showLiveIndicator = true,
}: LiveHeatMapProps) {
  const [isActive, setIsActive] = useState(enabled);
  const [liveInteractions, setLiveInteractions] = useState<
    LiveInteractionPoint[]
  >([]);
  const [showLabels, setShowLabels] = useState(true);
  const [autoFade, setAutoFade] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      // Simulate live interactions
      intervalRef.current = setInterval(
        () => {
          if (Math.random() > 0.3) {
            // 70% chance of new interaction
            const newInteraction: LiveInteractionPoint = {
              x: Math.random() * 90 + 5, // 5% to 95% to avoid edges
              y: Math.random() * 80 + 10, // 10% to 90% to avoid header/footer
              type: ["click", "hover", "scroll"][
                Math.floor(Math.random() * 3)
              ] as any,
              timestamp: Date.now(),
              isLoggedIn: Math.random() > 0.4, // 60% logged in users
              id: Math.random().toString(36).substr(2, 9),
            };

            setLiveInteractions((prev) => {
              const updated = [...prev, newInteraction];
              // Keep only last 50 interactions for performance
              return updated.slice(-50);
            });

            // Auto-fade after 5 seconds if enabled
            if (autoFade) {
              setTimeout(() => {
                setLiveInteractions((prev) =>
                  prev.filter(
                    (interaction) => interaction.id !== newInteraction.id,
                  ),
                );
              }, 5000);
            }
          }
        },
        800 + Math.random() * 1200,
      ); // Random interval between 0.8-2s
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, autoFade]);

  const clearInteractions = () => {
    setLiveInteractions([]);
  };

  const getInteractionColor = (interaction: LiveInteractionPoint) => {
    const colors = {
      click: interaction.isLoggedIn
        ? "rgba(239, 68, 68, 0.8)"
        : "rgba(239, 68, 68, 0.5)",
      hover: interaction.isLoggedIn
        ? "rgba(59, 130, 246, 0.8)"
        : "rgba(59, 130, 246, 0.5)",
      scroll: interaction.isLoggedIn
        ? "rgba(34, 197, 94, 0.8)"
        : "rgba(34, 197, 94, 0.5)",
    };
    return colors[interaction.type];
  };

  const getInteractionSize = (interaction: LiveInteractionPoint) => {
    const age = Date.now() - interaction.timestamp;
    const maxSize = interaction.type === "click" ? 20 : 16;
    const minSize = 8;

    if (age > 3000) {
      return minSize + (maxSize - minSize) * (1 - (age - 3000) / 2000);
    }
    return maxSize;
  };

  const activeUsers = new Set(
    liveInteractions.map((i) => `${i.x}-${i.y}-${i.isLoggedIn}`),
  ).size;
  const recentInteractions = liveInteractions.filter(
    (i) => Date.now() - i.timestamp < 10000,
  );

  return (
    <Card className={`relative ${isActive ? "ring-2 ring-primary/20" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Heat Map
            {showLiveIndicator && isActive && (
              <Badge variant="outline" className="ml-2 animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                LIVE
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearInteractions}
              disabled={liveInteractions.length === 0}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />~{activeUsers} active users
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {recentInteractions.length} recent interactions
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-labels"
                checked={showLabels}
                onCheckedChange={setShowLabels}
              />
              <Label htmlFor="show-labels" className="text-sm">
                Show labels
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-fade"
                checked={autoFade}
                onCheckedChange={setAutoFade}
              />
              <Label htmlFor="auto-fade" className="text-sm">
                Auto-fade
              </Label>
            </div>
          </div>

          {/* Live Heat Map */}
          <div
            ref={containerRef}
            className="relative h-80 bg-gradient-to-b from-background to-muted/20 border rounded-lg overflow-hidden"
          >
            {/* Simulated page content */}
            <div className="absolute inset-0 p-4 space-y-3 opacity-30 pointer-events-none">
              <div className="h-8 bg-muted rounded border-l-4 border-primary" />
              <div className="h-12 bg-muted/60 rounded" />
              <div className="h-16 bg-muted/60 rounded" />
              <div className="h-12 bg-muted/60 rounded" />
              <div className="h-20 bg-muted/60 rounded" />
              <div className="h-8 bg-muted rounded border-l-4 border-secondary" />
            </div>

            {/* Live Interaction Points */}
            {liveInteractions.map((interaction) => {
              const age = Date.now() - interaction.timestamp;
              const opacity = Math.max(0.1, 1 - age / 8000); // Fade over 8 seconds
              const size = getInteractionSize(interaction);

              return (
                <div
                  key={interaction.id}
                  className="absolute pointer-events-none transition-all duration-300"
                  style={{
                    left: `${interaction.x}%`,
                    top: `${interaction.y}%`,
                    transform: "translate(-50%, -50%)",
                    opacity,
                  }}
                >
                  <div
                    className="rounded-full animate-pulse"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: getInteractionColor(interaction),
                      boxShadow: `0 0 ${size / 2}px ${getInteractionColor(interaction)}`,
                    }}
                  />

                  {/* Ripple effect for new interactions */}
                  {age < 1000 && (
                    <div
                      className="absolute inset-0 rounded-full border-2 animate-ping"
                      style={{
                        borderColor: getInteractionColor(interaction),
                        animationDuration: "1.5s",
                      }}
                    />
                  )}

                  {/* Labels */}
                  {showLabels && age < 3000 && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs whitespace-nowrap">
                      {interaction.type}{" "}
                      {interaction.isLoggedIn ? "(member)" : "(guest)"}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Status overlay */}
            {!isActive && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click "Start" to begin live tracking
                  </p>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Click</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Hover</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Scroll</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-red-500">
                {liveInteractions.filter((i) => i.type === "click").length}
              </div>
              <div className="text-xs text-muted-foreground">Clicks</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-blue-500">
                {liveInteractions.filter((i) => i.type === "hover").length}
              </div>
              <div className="text-xs text-muted-foreground">Hovers</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-green-500">
                {liveInteractions.filter((i) => i.type === "scroll").length}
              </div>
              <div className="text-xs text-muted-foreground">Scrolls</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
