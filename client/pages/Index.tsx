import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BlogPost, BlogListResponse } from "@shared/blog";
import { Header } from "@/components/Header";
import { BlogCard } from "@/components/BlogCard";
import { AdSpace } from "@/components/AdSpace";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { InteractiveSearch } from "@/components/InteractiveSearch";
import { BlogCardSkeleton } from "@/components/SkeletonLoader";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Footer } from "@/components/Footer";
import { InteractiveBlogPreview } from "@/components/InteractiveBlogPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Brain, Sparkles, TrendingUp, Users, User, Clock } from "lucide-react";

export default function Index() {
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPost[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  /**
   * HOMEPAGE BLOG FETCHING - MULTIPLE API ENDPOINTS
   *
   * This function demonstrates fetching different types of blog content
   * for the homepage layout using multiple API endpoints.
   *
   * FEATURED BLOGS API: GET /api/blogs?featured=true&limit=2
   * RECENT BLOGS API: GET /api/blogs?limit=4&sort=publishedAt:desc
   *
   * QUERY PARAMETERS SUPPORTED:
   * - featured: boolean (filter for featured content)
   * - limit: number (max results per request)
   * - sort: string (sorting: publishedAt:desc, views:desc, likes:desc)
   * - category: string (filter by category)
   * - tags: string[] (filter by tags)
   * - author: string (filter by author ID)
   *
   * SUCCESS RESPONSE STRUCTURE:
   * {
   *   "blogs": [
   *     {
   *       "id": "blog123",
   *       "title": "Amazing Blog Post",
   *       "excerpt": "Short description...",
   *       "author": "user123",
   *       "authorName": "John Doe",
   *       "authorAvatar": "https://example.com/avatar.jpg",
   *       "coverImage": "https://example.com/cover.jpg",
   *       "category": "Technology",
   *       "tags": ["javascript", "web-dev"],
   *       "publishedAt": "2024-01-15T10:30:00Z",
   *       "readingTime": 5,
   *       "featured": true,
   *       "likes": 25,
   *       "views": 1200,
   *       "commentsCount": 8
   *     }
   *   ],
   *   "pagination": {
   *     "total": 150,
   *     "page": 1,
   *     "limit": 4,
   *     "totalPages": 38
   *   }
   * }
   *
   * DATABASE QUERIES EXECUTED:
   * 1. For featured: SELECT * FROM blogs WHERE featured = true ORDER BY publishedAt DESC LIMIT 2
   * 2. For recent: SELECT * FROM blogs ORDER BY publishedAt DESC LIMIT 4
   * 3. JOIN users table for author information
   * 4. COUNT likes, views, comments from related tables
   *
   * CACHING STRATEGY:
   * - Featured blogs: Cache for 1 hour
   * - Recent blogs: Cache for 15 minutes
   * - CDN caching for cover images
   * - Redis cache for frequently accessed data
   *
   * ERROR HANDLING:
   * - 404: No blogs found (show empty state)
   * - 500: Server error (show retry button)
   * - Network errors: Show offline message
   * - Timeout: Show loading spinner with timeout
   */
  const fetchBlogs = async () => {
    try {
      // Fetch featured blogs using the GET /api/blogs endpoint
      // Query: featured=true&limit=2
      const featuredResponse = await fetch("/api/blogs?featured=true&limit=2");
      if (!featuredResponse.ok) {
        throw new Error(
          `Failed to fetch featured blogs: ${featuredResponse.status}`,
        );
      }
      const featuredData = (await featuredResponse.json()) as BlogListResponse;
      setFeaturedBlogs(featuredData.blogs);

      // Fetch recent blogs using the GET /api/blogs endpoint
      // Query: limit=4 (get 4 most recent blogs)
      const recentResponse = await fetch("/api/blogs?limit=4");
      if (!recentResponse.ok) {
        throw new Error(
          `Failed to fetch recent blogs: ${recentResponse.status}`,
        );
      }
      const recentData = (await recentResponse.json()) as BlogListResponse;

      // Filter out featured blogs from recent to avoid duplicates
      setRecentBlogs(recentData.blogs.filter((blog) => !blog.featured));
    } catch (error) {
      console.error("Error fetching blogs:", error);
      // TODO: Show user-friendly error message
      // Example: toast.error("Failed to load blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get search suggestions from all blogs
  const searchSuggestions = [
    ...featuredBlogs.flatMap((blog) => blog.tags),
    ...recentBlogs.flatMap((blog) => blog.tags),
    ...featuredBlogs.map((blog) => blog.title),
    ...recentBlogs.map((blog) => blog.title),
  ].filter((item, index, array) => array.indexOf(item) === index);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <Header />

      {/* Hero Section - Mobile First */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
        <AnimatedBackground />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-background/50" />
        <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>AI-Powered Content Hub</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight px-2 sm:px-0">
              Master AI & Machine Learning
              <span className="block text-primary mt-2">
                with Expert Insights
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto leading-relaxed px-4 sm:px-2 lg:px-0">
              Deep-dive into artificial intelligence and machine learning with
              comprehensive tutorials, latest research, and practical
              implementations.
            </p>

            <div className="space-y-4 sm:space-y-6">
              <div className="px-4 sm:px-0">
                <InteractiveSearch
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onSearch={(term) => {
                    if (term) {
                      window.location.href = `/blogs?search=${encodeURIComponent(term)}`;
                    }
                  }}
                  suggestions={searchSuggestions}
                  placeholder="Search AI & ML topics..."
                  className="w-full max-w-md sm:max-w-lg mx-auto"
                />
              </div>

              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4 justify-center items-center px-4 sm:px-0">
                <Button
                  size="lg"
                  asChild
                  className="w-full sm:w-auto sm:min-w-[160px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 transition-all duration-200 text-sm sm:text-base h-11 sm:h-12"
                >
                  <Link to="/blogs">Explore Articles</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto sm:min-w-[160px] hover:scale-105 transition-all duration-200 text-sm sm:text-base h-11 sm:h-12"
                >
                  <Link to="/blogs">Latest Research</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Mobile First */}
      <section className="py-8 sm:py-12 lg:py-16 border-y bg-muted/20">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: Brain, label: "AI Articles", value: 500, suffix: "+" },
              { icon: Users, label: "Readers", value: 50, suffix: "K+" },
              { icon: TrendingUp, label: "Growth", value: 200, suffix: "%" },
              { icon: Sparkles, label: "Topics", value: 25, suffix: "+" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center space-y-2 sm:space-y-3 group hover:scale-105 sm:hover:scale-110 transition-all duration-300 cursor-pointer p-3 sm:p-4 rounded-lg hover:bg-primary/5"
              >
                <div className="relative">
                  <stat.icon
                    className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary mx-auto animate-float group-hover:text-primary/80 transition-colors"
                    style={{ animationDelay: `${index * 0.5}s` }}
                  />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-all duration-300 group-hover:scale-150" />
                </div>
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  className="text-xl sm:text-2xl lg:text-3xl font-bold group-hover:text-primary transition-colors"
                />
                <div className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Space - Hidden for now */}
      {/* <section className="py-8">
        <div className="container">
          <AdSpace
            size="leaderboard"
            className="mx-auto"
            label="Sponsored Content"
          />
        </div>
      </section> */}

      {/* Featured Articles - Mobile First */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <Badge
              variant="outline"
              className="text-primary border-primary/20 text-xs sm:text-sm"
            >
              Featured Content
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold px-4 sm:px-0">
              Editor's Picks
            </h2>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-0">
              Handpicked articles that showcase the latest breakthroughs and
              insights in AI technology.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-max">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={
                    i === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""
                  }
                >
                  <BlogCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-max">
              {/* Main featured article - larger on desktop, normal on mobile */}
              {featuredBlogs[0] && (
                <div className="sm:col-span-2 lg:col-span-2 lg:row-span-2">
                  <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden border-0 bg-gradient-to-br from-background to-background/50 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full">
                    <Link
                      to={`/blog/${featuredBlogs[0].id}`}
                      className="block h-full"
                    >
                      {featuredBlogs[0].coverImage && (
                        <div className="relative overflow-hidden">
                          <img
                            src={featuredBlogs[0].coverImage}
                            alt={featuredBlogs[0].title}
                            className="w-full h-48 sm:h-56 lg:h-64 xl:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          <Badge className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-primary/90 text-primary-foreground text-xs">
                            Featured
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="space-y-3 p-4 sm:p-6">
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {featuredBlogs[0].tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                          {featuredBlogs[0].title}
                        </h3>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {featuredBlogs[0].excerpt}
                        </p>
                        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="truncate">
                                {featuredBlogs[0].author}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>
                                {featuredBlogs[0].readingTime} min read
                              </span>
                            </div>
                          </div>
                          <time
                            dateTime={featuredBlogs[0].publishedAt}
                            className="text-xs sm:text-sm"
                          >
                            {new Date(
                              featuredBlogs[0].publishedAt,
                            ).toLocaleDateString()}
                          </time>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </div>
              )}

              {/* Secondary featured articles - smaller cards */}
              {featuredBlogs.slice(1).map((blog) => (
                <Card
                  key={blog.id}
                  className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden border-0 bg-gradient-to-br from-background to-background/50 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full"
                >
                  <Link to={`/blog/${blog.id}`} className="block h-full">
                    {blog.coverImage && (
                      <div className="relative overflow-hidden">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    )}
                    <CardHeader className="space-y-2 p-4">
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="text-sm font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{blog.author}</span>
                        <span>{blog.readingTime}m</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}

              {/* Add recent blogs to fill the grid */}
              {recentBlogs.slice(0, 3).map((blog) => (
                <Card
                  key={blog.id}
                  className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden border-0 bg-gradient-to-br from-background to-background/50 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full"
                >
                  <Link to={`/blog/${blog.id}`} className="block h-full">
                    {blog.coverImage && (
                      <div className="relative overflow-hidden">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    )}
                    <CardHeader className="space-y-2 p-4">
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="text-sm font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{blog.author}</span>
                        <span>{blog.readingTime}m</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ad Space - Hidden for now */}
      {/* <section className="py-8">
        <div className="container flex justify-center">
          <AdSpace size="rectangle" />
        </div>
      </section> */}

      {/* Recent Articles - Mobile First */}
      <section className="py-8 sm:py-12 lg:py-16 bg-muted/10">
        <div className="container px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
                Latest Articles
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
                Stay updated with the newest developments in AI and technology.
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="mx-auto sm:mx-0 text-sm"
            >
              <Link to="/blogs">View All</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {recentBlogs.map((blog) => (
                <InteractiveBlogPreview key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Mobile First */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold px-4 sm:px-0">
            Stay Updated with Latest AIML Trends
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-0">
            Join our community of AI and ML practitioners. Discover the latest
            research, tutorials, and breakthrough insights in artificial
            intelligence.
          </p>
          <div className="px-4 sm:px-0">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto sm:min-w-[200px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 transition-all duration-200 text-sm sm:text-base h-11 sm:h-12"
            >
              <Link to="/blogs">Explore All Articles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
