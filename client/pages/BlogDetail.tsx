import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BlogPost, BlogResponse } from "@shared/blog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogActions } from "@/components/BlogActions";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Eye,
  MessageCircle,
  Mail,
} from "lucide-react";

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enable interaction tracking for this blog post
  const { totalInteractions } = useInteractionTracking({
    blogId: id || "unknown",
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      fetchBlog(id);
    }
  }, [id]);

  /**
   * SINGLE BLOG API INTEGRATION
   *
   * This function demonstrates fetching a single blog post by ID.
   *
   * API Endpoint: GET /api/blogs/:id
   * Parameters:
   * - id: Unique blog post identifier (from URL params)
   *
   * Error Handling:
   * - 404: Blog not found (show not found page)
   * - 500: Server error (show error message)
   * - Network: Connection issues (show retry option)
   */
  const fetchBlog = async (blogId: string) => {
    try {
      // Validate blog ID
      if (!blogId) {
        throw new Error("Blog ID is required");
      }

      // Fetch single blog post using GET /api/blogs/:id
      const response = await fetch(`/api/blogs/${blogId}`);

      // Handle different HTTP status codes
      if (response.status === 404) {
        setError("Blog post not found");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch blog: ${response.status}`);
      }

      const data = (await response.json()) as BlogResponse;
      setBlog(data.blog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      setError("Failed to load blog post");
      // TODO: Add retry functionality
      // Example: Add a "Try Again" button that calls fetchBlog(blogId)
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (content: string) => {
    return content
      .split("\n")
      .map((paragraph, index) => {
        if (paragraph.trim() === "") return null;

        if (paragraph.startsWith("# ")) {
          return (
            <h1
              key={index}
              className="text-3xl md:text-4xl font-bold mt-8 mb-4 first:mt-0"
            >
              {paragraph.replace("# ", "")}
            </h1>
          );
        }

        if (paragraph.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="text-2xl md:text-3xl font-bold mt-8 mb-4"
            >
              {paragraph.replace("## ", "")}
            </h2>
          );
        }

        if (paragraph.startsWith("### ")) {
          return (
            <h3 key={index} className="text-xl md:text-2xl font-bold mt-6 mb-3">
              {paragraph.replace("### ", "")}
            </h3>
          );
        }

        if (paragraph.match(/^\d+\./)) {
          return (
            <div key={index} className="my-2 ml-4">
              <p className="text-lg leading-relaxed">{paragraph}</p>
            </div>
          );
        }

        if (paragraph.startsWith("- ")) {
          return (
            <div key={index} className="my-2 ml-4">
              <p className="text-lg leading-relaxed">{paragraph}</p>
            </div>
          );
        }

        return (
          <p
            key={index}
            className="text-lg leading-relaxed mb-4 text-muted-foreground"
          >
            {paragraph}
          </p>
        );
      })
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="bg-muted h-8 rounded w-1/4 mb-8" />
            <div className="bg-muted h-64 rounded mb-8" />
            <div className="space-y-4">
              <div className="bg-muted h-4 rounded w-3/4" />
              <div className="bg-muted h-4 rounded w-1/2" />
              <div className="bg-muted h-4 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-3xl font-bold">Blog Not Found</h1>
            <p className="text-muted-foreground">
              The blog post you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button - Mobile First */}
          <Button
            variant="ghost"
            asChild
            className="mb-4 sm:mb-6 lg:mb-8 h-9 px-3"
          >
            <Link to="/" className="flex items-center space-x-2 text-sm">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>

          {/* Article Header - Mobile First */}
          <article className="space-y-6 sm:space-y-8">
            <header className="space-y-4 sm:space-y-6">
              {blog.coverImage && (
                <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-48 sm:h-64 lg:h-80 xl:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {blog.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {blog.featured && (
                    <Badge className="bg-primary/90 text-primary-foreground text-xs">
                      Featured
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                  {blog.title}
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  {blog.excerpt}
                </p>

                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:gap-6 text-xs sm:text-sm text-muted-foreground border-b pb-4 sm:pb-6">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium">{blog.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <time dateTime={blog.publishedAt}>
                      {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{blog.readingTime} min read</span>
                  </div>
                  <div className="sm:ml-auto">
                    <BlogActions
                      blogId={blog.id}
                      blogTitle={blog.title}
                      initialLikes={Math.floor(Math.random() * 100) + 10}
                      initialBookmarked={false}
                      initialLiked={false}
                      showComments={true}
                    />
                  </div>
                </div>
              </div>
            </header>

            {/* Ad Space - Hidden for now */}
            {/* <div className="flex justify-center">
              <AdSpace size="leaderboard" />
            </div> */}

            {/* Article Content - Mobile First */}
            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
              <div className="space-y-4 sm:space-y-6">
                {formatContent(blog.content)}
              </div>
            </div>

            {/* Article Footer - Mobile First */}
            <footer className="border-t pt-6 sm:pt-8 space-y-6 sm:space-y-8">
              {/* Article Actions - Mobile First */}
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  Was this article helpful? Let us know!
                </div>
                <div className="flex justify-center sm:justify-end">
                  <BlogActions
                    blogId={blog.id}
                    blogTitle={blog.title}
                    initialLikes={Math.floor(Math.random() * 100) + 10}
                    initialBookmarked={false}
                    initialLiked={false}
                    showComments={true}
                  />
                </div>
              </div>

              {/* Author Section - Mobile First */}
              <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-muted/30 rounded-lg">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold mb-2 text-base sm:text-lg">
                    About the Author
                  </h3>
                  <p className="text-muted-foreground mb-2 sm:mb-3 text-sm sm:text-base">
                    {blog.author}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Passionate about AI and Machine Learning. Sharing insights
                    and knowledge with the community.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto sm:flex-shrink-0 text-sm"
                >
                  Follow
                </Button>
              </div>

              {/* Comments Section - Mobile First */}
              <div id="comments-section" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
                    Comments
                  </h3>
                  <Badge
                    variant="outline"
                    className="self-center sm:self-auto text-xs sm:text-sm"
                  >
                    {Math.floor(Math.random() * 25) + 5} comments
                  </Badge>
                </div>

                <div className="text-center py-8 sm:py-12 border-2 border-dashed border-muted rounded-lg">
                  <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h4 className="text-base sm:text-lg font-medium mb-2">
                    Join the Discussion
                  </h4>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">
                    Comments feature coming soon! Share your thoughts and engage
                    with other readers.
                  </p>
                  <Button variant="outline" className="text-sm">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Notify me when available
                  </Button>
                </div>
              </div>

              {/* Call to Action - Mobile First */}
              <div className="text-center p-4 sm:p-6 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Start Your AI Journey
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 px-2 sm:px-0">
                  Ready to share your own insights about AI and Machine
                  Learning?
                </p>
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 text-sm sm:text-base h-10 sm:h-11"
                >
                  <Link to="/dashboard">Write Your Own Blog</Link>
                </Button>
              </div>
            </footer>
          </article>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
