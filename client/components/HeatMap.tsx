import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Mouse,
  MousePointer,
  Clock,
  Eye,
  Target,
  Zap,
  Activity,
  MapPin,
} from "lucide-react";

interface InteractionPoint {
  x: number;
  y: number;
  type: "click" | "hover" | "scroll" | "selection";
  timestamp: number;
  duration?: number; // for hover and scroll
  element?: string;
  userId?: string;
  isLoggedIn: boolean;
}

interface HeatMapData {
  blogId: string;
  blogTitle: string;
  interactions: InteractionPoint[];
  scrollDepth: { depth: number; users: number; avgTime: number }[];
  popularSections: {
    section: string;
    interactions: number;
    avgTime: number;
    userTypes: { loggedIn: number; guest: number };
  }[];
}

interface HeatMapProps {
  blogId: string;
  showLive?: boolean;
}

export function HeatMap({ blogId, showLive = false }: HeatMapProps) {
  const [heatMapData, setHeatMapData] = useState<HeatMapData | null>(null);
  const [activeView, setActiveView] = useState<"clicks" | "hover" | "scroll">(
    "clicks",
  );
  const [intensity, setIntensity] = useState([50]);
  const [userFilter, setUserFilter] = useState<"all" | "loggedIn" | "guest">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const heatMapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHeatMapData();
  }, [blogId]);

  const fetchHeatMapData = async () => {
    try {
      // Simulate API call - in real app this would fetch from analytics API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData: HeatMapData = {
        blogId,
        blogTitle: "Understanding Transformer Architecture",
        interactions: [
          // Header interactions
          {
            x: 50,
            y: 15,
            type: "click",
            timestamp: Date.now() - 1000,
            element: "title",
            isLoggedIn: true,
          },
          {
            x: 45,
            y: 18,
            type: "hover",
            timestamp: Date.now() - 2000,
            duration: 3000,
            element: "author",
            isLoggedIn: false,
          },

          // Introduction section (high interaction)
          {
            x: 30,
            y: 25,
            type: "click",
            timestamp: Date.now() - 3000,
            element: "introduction",
            isLoggedIn: true,
          },
          {
            x: 35,
            y: 28,
            type: "hover",
            timestamp: Date.now() - 4000,
            duration: 5000,
            element: "introduction",
            isLoggedIn: true,
          },
          {
            x: 40,
            y: 30,
            type: "selection",
            timestamp: Date.now() - 5000,
            element: "introduction",
            isLoggedIn: false,
          },
          {
            x: 25,
            y: 32,
            type: "click",
            timestamp: Date.now() - 6000,
            element: "introduction",
            isLoggedIn: false,
          },

          // Mid-content (medium interaction)
          {
            x: 55,
            y: 45,
            type: "hover",
            timestamp: Date.now() - 7000,
            duration: 2000,
            element: "diagram",
            isLoggedIn: true,
          },
          {
            x: 60,
            y: 50,
            type: "click",
            timestamp: Date.now() - 8000,
            element: "code-block",
            isLoggedIn: true,
          },
          {
            x: 45,
            y: 52,
            type: "selection",
            timestamp: Date.now() - 9000,
            element: "code-block",
            isLoggedIn: false,
          },

          // Conclusion (lower interaction)
          {
            x: 30,
            y: 75,
            type: "hover",
            timestamp: Date.now() - 10000,
            duration: 1500,
            element: "conclusion",
            isLoggedIn: false,
          },
          {
            x: 35,
            y: 80,
            type: "scroll",
            timestamp: Date.now() - 11000,
            element: "conclusion",
            isLoggedIn: true,
          },

          // Comments section (varied interaction)
          {
            x: 25,
            y: 90,
            type: "click",
            timestamp: Date.now() - 12000,
            element: "comments",
            isLoggedIn: true,
          },
          {
            x: 70,
            y: 92,
            type: "click",
            timestamp: Date.now() - 13000,
            element: "comment-form",
            isLoggedIn: true,
          },
        ],
        scrollDepth: [
          { depth: 25, users: 156, avgTime: 15 },
          { depth: 50, users: 134, avgTime: 45 },
          { depth: 75, users: 98, avgTime: 35 },
          { depth: 100, users: 67, avgTime: 25 },
        ],
        popularSections: [
          {
            section: "Introduction",
            interactions: 245,
            avgTime: 34,
            userTypes: { loggedIn: 145, guest: 100 },
          },
          {
            section: "Transformer Architecture",
            interactions: 189,
            avgTime: 67,
            userTypes: { loggedIn: 123, guest: 66 },
          },
          {
            section: "Code Examples",
            interactions: 156,
            avgTime: 89,
            userTypes: { loggedIn: 112, guest: 44 },
          },
          {
            section: "Mathematical Foundations",
            interactions: 98,
            avgTime: 45,
            userTypes: { loggedIn: 78, guest: 20 },
          },
          {
            section: "Conclusion",
            interactions: 76,
            avgTime: 23,
            userTypes: { loggedIn: 45, guest: 31 },
          },
        ],
      };

      setHeatMapData(mockData);
    } catch (error) {
      console.error("Error fetching heat map data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredInteractions = () => {
    if (!heatMapData) return [];

    return heatMapData.interactions.filter((interaction) => {
      const typeMatch = interaction.type === activeView;
      const userMatch =
        userFilter === "all" ||
        (userFilter === "loggedIn" && interaction.isLoggedIn) ||
        (userFilter === "guest" && !interaction.isLoggedIn);

      return typeMatch && userMatch;
    });
  };

  const getInteractionColor = (interaction: InteractionPoint) => {
    const baseColors = {
      click: "rgba(239, 68, 68, 0.6)", // red
      hover: "rgba(59, 130, 246, 0.6)", // blue
      scroll: "rgba(34, 197, 94, 0.6)", // green
      selection: "rgba(168, 85, 247, 0.6)", // purple
    };

    return interaction.isLoggedIn
      ? baseColors[interaction.type]
      : baseColors[interaction.type].replace("0.6", "0.4");
  };

  const getInteractionSize = (interaction: InteractionPoint) => {
    if (interaction.type === "hover" && interaction.duration) {
      return Math.min(20 + (interaction.duration / 1000) * 2, 40);
    }
    return interaction.type === "click" ? 16 : 12;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!heatMapData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Heat Map Data</h3>
          <p className="text-muted-foreground">
            Heat map data is not available for this blog post yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredInteractions = getFilteredInteractions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Interaction Heat Map
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Visual representation of where users interact most with "
            {heatMapData.blogTitle}"
          </p>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeView}
            onValueChange={(value) => setActiveView(value as any)}
          >
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <TabsList className="grid w-full lg:w-auto grid-cols-3">
                <TabsTrigger value="clicks" className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Clicks
                </TabsTrigger>
                <TabsTrigger value="hover" className="flex items-center gap-2">
                  <Mouse className="h-4 w-4" />
                  Hover
                </TabsTrigger>
                <TabsTrigger value="scroll" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Scroll
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">User Type:</label>
                  <div className="flex gap-1">
                    {["all", "loggedIn", "guest"].map((filter) => (
                      <Button
                        key={filter}
                        variant={userFilter === filter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUserFilter(filter as any)}
                        className="h-8 px-3"
                      >
                        {filter === "all"
                          ? "All"
                          : filter === "loggedIn"
                            ? "Members"
                            : "Guests"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Intensity:</label>
                  <div className="w-24">
                    <Slider
                      value={intensity}
                      onValueChange={setIntensity}
                      max={100}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {intensity[0]}%
                  </span>
                </div>
              </div>
            </div>

            <TabsContent value={activeView} className="space-y-4">
              {/* Heat Map Visualization */}
              <div className="relative border rounded-lg overflow-hidden bg-muted/10">
                <div
                  ref={heatMapRef}
                  className="relative h-96 w-full bg-gradient-to-b from-background to-muted/20"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.05) 100%)",
                  }}
                >
                  {/* Simulated blog content sections */}
                  <div className="absolute inset-0 p-4 space-y-4 pointer-events-none">
                    <div className="h-12 bg-muted/30 rounded border-l-4 border-primary" />
                    <div className="h-16 bg-muted/20 rounded" />
                    <div className="h-24 bg-muted/20 rounded" />
                    <div className="h-20 bg-muted/20 rounded" />
                    <div className="h-16 bg-muted/20 rounded" />
                    <div className="h-12 bg-muted/30 rounded border-l-4 border-secondary" />
                  </div>

                  {/* Interaction Points */}
                  {filteredInteractions.map((interaction, index) => (
                    <div
                      key={index}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${interaction.x}%`,
                        top: `${interaction.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        className="rounded-full animate-pulse"
                        style={{
                          width: `${getInteractionSize(interaction)}px`,
                          height: `${getInteractionSize(interaction)}px`,
                          backgroundColor: getInteractionColor(interaction),
                          opacity: intensity[0] / 100,
                          boxShadow: `0 0 ${getInteractionSize(interaction) / 2}px ${getInteractionColor(interaction)}`,
                        }}
                      />
                      {interaction.type === "hover" &&
                        interaction.duration &&
                        interaction.duration > 3000 && (
                          <div
                            className="absolute inset-0 rounded-full border-2 animate-ping"
                            style={{
                              borderColor: getInteractionColor(interaction),
                              animationDuration: "2s",
                            }}
                          />
                        )}
                    </div>
                  ))}

                  {/* Legend */}
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
                    <div className="text-xs font-medium mb-2">
                      Interaction Legend
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-red-500/60" />
                        <span>Clicks</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-blue-500/60" />
                        <span>Hover (time-based size)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-green-500/60" />
                        <span>Scroll points</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-purple-500/60" />
                        <span>Text selection</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-foreground/60" />
                        <span>Members (darker)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-foreground/30" />
                        <span>Guests (lighter)</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats overlay */}
                  <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs font-medium mb-1">Current View</div>
                    <div className="text-lg font-bold">
                      {filteredInteractions.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activeView} interactions
                    </div>
                  </div>
                </div>
              </div>

              {/* Interaction Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Hotspot Density
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((filteredInteractions.length / 100) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Above average interaction rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Avg. Interaction Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(
                        filteredInteractions
                          .filter((i) => i.duration)
                          .reduce((acc, i) => acc + (i.duration || 0), 0) /
                          filteredInteractions.filter((i) => i.duration)
                            .length /
                          1000,
                      ) || 0}
                      s
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Time spent on interactions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Engagement Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.min(
                        Math.round((filteredInteractions.length / 10) * 8.5),
                        100,
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Out of 100 engagement points
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Section Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Popular Content Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {heatMapData.popularSections.map((section, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{section.section}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MousePointer className="h-3 w-3" />
                      {section.interactions} interactions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {section.avgTime}s avg time
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {section.userTypes.loggedIn} members
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {section.userTypes.guest} guests
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scroll Depth Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Scroll Depth Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {heatMapData.scrollDepth.map((depth, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium">{depth.depth}%</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{depth.users} users reached</span>
                    <span className="text-xs text-muted-foreground">
                      {depth.avgTime}s avg
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-1000"
                      style={{ width: `${(depth.users / 156) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
