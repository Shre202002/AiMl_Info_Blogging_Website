import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { HeatMap } from "@/components/HeatMap";
import { LiveHeatMap } from "@/components/LiveHeatMap";
import {
  Users,
  Clock,
  Eye,
  TrendingUp,
  UserCheck,
  UserX,
  Calendar,
  BarChart3,
  Activity,
  Target,
} from "lucide-react";

interface BlogAnalytics {
  id: string;
  title: string;
  totalViews: number;
  uniqueViews: number;
  averageTimeSpent: number; // in minutes
  totalTimeSpent: number; // in minutes
  loggedInReaders: number;
  guestReaders: number;
  readingCompletionRate: number; // percentage
  publishedAt: string;
  dailyViews: { date: string; views: number }[];
  readerEngagement: {
    bounceRate: number;
    returnReaders: number;
    shareCount: number;
  };
}

interface AnalyticsProps {
  blogId?: string; // If provided, show analytics for specific blog
}

export function Analytics({ blogId }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<BlogAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [blogId]);

  const fetchAnalytics = async () => {
    try {
      // Simulate API call - in real app, this would be an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock analytics data
      const mockAnalytics: BlogAnalytics[] = [
        {
          id: "1",
          title: "Understanding Transformer Architecture",
          totalViews: 1247,
          uniqueViews: 891,
          averageTimeSpent: 8.5,
          totalTimeSpent: 7599,
          loggedInReaders: 623,
          guestReaders: 624,
          readingCompletionRate: 73,
          publishedAt: "2024-01-15",
          dailyViews: [
            { date: "2024-01-15", views: 45 },
            { date: "2024-01-16", views: 67 },
            { date: "2024-01-17", views: 89 },
            { date: "2024-01-18", views: 112 },
            { date: "2024-01-19", views: 156 },
            { date: "2024-01-20", views: 134 },
            { date: "2024-01-21", views: 98 },
          ],
          readerEngagement: {
            bounceRate: 27,
            returnReaders: 156,
            shareCount: 89,
          },
        },
        {
          id: "2",
          title: "Generative AI: The Creative Revolution",
          totalViews: 892,
          uniqueViews: 645,
          averageTimeSpent: 6.3,
          totalTimeSpent: 5624,
          loggedInReaders: 387,
          guestReaders: 505,
          readingCompletionRate: 68,
          publishedAt: "2024-01-10",
          dailyViews: [
            { date: "2024-01-10", views: 32 },
            { date: "2024-01-11", views: 54 },
            { date: "2024-01-12", views: 78 },
            { date: "2024-01-13", views: 91 },
            { date: "2024-01-14", views: 123 },
            { date: "2024-01-15", views: 98 },
            { date: "2024-01-16", views: 67 },
          ],
          readerEngagement: {
            bounceRate: 32,
            returnReaders: 112,
            shareCount: 56,
          },
        },
        {
          id: "3",
          title: "Quantum Machine Learning Explained",
          totalViews: 634,
          uniqueViews: 456,
          averageTimeSpent: 12.7,
          totalTimeSpent: 8051,
          loggedInReaders: 289,
          guestReaders: 345,
          readingCompletionRate: 81,
          publishedAt: "2024-01-08",
          dailyViews: [
            { date: "2024-01-08", views: 28 },
            { date: "2024-01-09", views: 41 },
            { date: "2024-01-10", views: 59 },
            { date: "2024-01-11", views: 73 },
            { date: "2024-01-12", views: 87 },
            { date: "2024-01-13", views: 94 },
            { date: "2024-01-14", views: 71 },
          ],
          readerEngagement: {
            bounceRate: 19,
            returnReaders: 89,
            shareCount: 78,
          },
        },
      ];

      if (blogId) {
        setAnalytics(mockAnalytics.filter((blog) => blog.id === blogId));
      } else {
        setAnalytics(mockAnalytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalStats = analytics.reduce(
    (acc, blog) => ({
      totalViews: acc.totalViews + blog.totalViews,
      uniqueViews: acc.uniqueViews + blog.uniqueViews,
      totalTimeSpent: acc.totalTimeSpent + blog.totalTimeSpent,
      loggedInReaders: acc.loggedInReaders + blog.loggedInReaders,
      guestReaders: acc.guestReaders + blog.guestReaders,
    }),
    {
      totalViews: 0,
      uniqueViews: 0,
      totalTimeSpent: 0,
      loggedInReaders: 0,
      guestReaders: 0,
    },
  );

  const averageTimeSpent =
    analytics.length > 0
      ? totalStats.totalTimeSpent / totalStats.totalViews
      : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="text-xs sm:text-sm py-2">
            <span className="hidden sm:inline">Heat Map</span>
            <span className="sm:hidden">Heat</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs sm:text-sm py-2">
            <span className="hidden sm:inline">Engagement</span>
            <span className="sm:hidden">Engage</span>
          </TabsTrigger>
          <TabsTrigger value="audience" className="text-xs sm:text-sm py-2">
            <span className="hidden sm:inline">Audience</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Overview Stats - Mobile First */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  <span className="hidden sm:inline">Total Views</span>
                  <span className="sm:hidden">Views</span>
                </CardTitle>
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <AnimatedCounter
                  end={totalStats.totalViews}
                  className="text-lg sm:text-xl lg:text-2xl font-bold"
                />
                <p className="text-xs text-muted-foreground">
                  {totalStats.uniqueViews} unique
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  <span className="hidden sm:inline">Reading Time</span>
                  <span className="sm:hidden">Time</span>
                </CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <AnimatedCounter
                  end={Math.round(averageTimeSpent)}
                  suffix="m"
                  className="text-lg sm:text-xl lg:text-2xl font-bold"
                />
                <p className="text-xs text-muted-foreground">avg. per reader</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  <span className="hidden sm:inline">Logged In</span>
                  <span className="sm:hidden">Users</span>
                </CardTitle>
                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <AnimatedCounter
                  end={totalStats.loggedInReaders}
                  className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600"
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round(
                    (totalStats.loggedInReaders / totalStats.totalViews) * 100,
                  )}
                  %
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  <span className="hidden sm:inline">Guest Readers</span>
                  <span className="sm:hidden">Guests</span>
                </CardTitle>
                <UserX className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <AnimatedCounter
                  end={totalStats.guestReaders}
                  className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600"
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round(
                    (totalStats.guestReaders / totalStats.totalViews) * 100,
                  )}
                  %
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Blog Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Blog Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.map((blog) => (
                  <div
                    key={blog.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{blog.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {new Date(blog.publishedAt).toLocaleDateString()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Views</div>
                        <div className="font-semibold">
                          {blog.totalViews.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg. Time</div>
                        <div className="font-semibold">
                          {blog.averageTimeSpent.toFixed(1)}m
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Completion</div>
                        <div className="font-semibold">
                          {blog.readingCompletionRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Engagement</div>
                        <div className="font-semibold">
                          {100 - blog.readerEngagement.bounceRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Heat Map */}
          <LiveHeatMap enabled={true} />
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4 px-2 sm:px-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary self-center sm:self-auto" />
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-semibold">
                  Interaction Heat Maps
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Visualize where users click, hover, and interact most with
                  your content
                </p>
              </div>
            </div>

            {analytics.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {analytics.slice(0, 3).map((blog) => (
                  <Card key={blog.id} className="overflow-hidden">
                    <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                      <h4 className="text-sm sm:text-base font-medium flex items-center gap-2">
                        <Activity className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{blog.title}</span>
                      </h4>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 pt-0">
                      <div className="bg-muted/20 rounded-lg p-2 sm:p-4">
                        <HeatMap blogId={blog.id} />
                      </div>
                      <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
                        <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded">
                          <div className="text-xs text-red-600 font-medium">
                            Clicks
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-red-700">
                            {Math.floor(Math.random() * 500) + 100}
                          </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                          <div className="text-xs text-blue-600 font-medium">
                            Hovers
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-blue-700">
                            {Math.floor(Math.random() * 300) + 50}
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded">
                          <div className="text-xs text-green-600 font-medium">
                            Scrolls
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-green-700">
                            {Math.floor(Math.random() * 200) + 80}
                          </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded">
                          <div className="text-xs text-purple-600 font-medium">
                            Selections
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-purple-700">
                            {Math.floor(Math.random() * 100) + 20}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <Target className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    No Heat Map Data
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Start publishing blog posts to see interaction heat maps.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-6">
            {analytics.map((blog) => (
              <Card key={blog.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{blog.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {blog.readingCompletionRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Completion Rate
                      </div>
                    </div>

                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {100 - blog.readerEngagement.bounceRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Engagement Rate
                      </div>
                    </div>

                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {blog.readerEngagement.returnReaders}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Return Readers
                      </div>
                    </div>

                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {blog.readerEngagement.shareCount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Shares
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-semibold mb-3">Reading Patterns</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">
                          Total Time Spent
                        </div>
                        <div className="font-semibold">
                          {Math.round(blog.totalTimeSpent / 60)}h{" "}
                          {blog.totalTimeSpent % 60}m
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          Average Session
                        </div>
                        <div className="font-semibold">
                          {blog.averageTimeSpent.toFixed(1)} minutes
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Bounce Rate</div>
                        <div className="font-semibold">
                          {blog.readerEngagement.bounceRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Reader Demographics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics.map((blog) => (
                    <div key={blog.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4">{blog.title}</h4>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-medium mb-3">
                            Reader Type Distribution
                          </h5>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Logged In Users</span>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">
                                  {blog.loggedInReaders}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {Math.round(
                                    (blog.loggedInReaders / blog.totalViews) *
                                      100,
                                  )}
                                  %
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UserX className="h-4 w-4 text-orange-600" />
                                <span className="text-sm">Guest Readers</span>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">
                                  {blog.guestReaders}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {Math.round(
                                    (blog.guestReaders / blog.totalViews) * 100,
                                  )}
                                  %
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium mb-3">
                            Engagement by User Type
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Logged-in avg. time:
                              </span>
                              <span className="font-medium">
                                {(blog.averageTimeSpent * 1.3).toFixed(1)}m
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Guest avg. time:
                              </span>
                              <span className="font-medium">
                                {(blog.averageTimeSpent * 0.7).toFixed(1)}m
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Member completion:
                              </span>
                              <span className="font-medium">
                                {Math.round(blog.readingCompletionRate * 1.2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Guest completion:
                              </span>
                              <span className="font-medium">
                                {Math.round(blog.readingCompletionRate * 0.8)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
