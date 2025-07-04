import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BlogPost,
  CreateBlogRequest,
  BlogListResponse,
  BlogResponse,
} from "@shared/blog";
import { Header } from "@/components/Header";
import { BlogEditor } from "@/components/BlogEditor";
import { Analytics } from "@/components/Analytics";
import { AdSpace } from "@/components/AdSpace";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { InteractiveButton } from "@/components/InteractiveButton";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  FileText,
  Sparkles,
  BarChart3,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [myBlogs, setMyBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetchMyBlogs();
  }, [isAuthenticated, navigate]);

  /**
   * FETCH MY BLOGS - DATABASE CONNECTION GUIDE
   *
   * Current Implementation: Fetches from mock API endpoint
   *
   * TO CONNECT TO REAL DATABASE:
   * 1. Replace this endpoint with your backend API
   * 2. Add authentication headers for user-specific blogs
   * 3. Implement pagination for large datasets
   *
   * Example with real DB connection:
   * ```
   * const response = await fetch(`/api/users/${user.id}/blogs?page=${page}&limit=10`, {
   *   headers: {
   *     'Authorization': `Bearer ${authToken}`,
   *     'Content-Type': 'application/json'
   *   }
   * });
   * ```
   *
   * Database Schema Suggestions:
   * - blogs table: id, title, content, author_id, created_at, updated_at
   * - users table: id, name, email, avatar_url, created_at
   * - blog_analytics table: blog_id, user_id, interaction_type, timestamp
   */
  const fetchMyBlogs = async () => {
    try {
      // TODO: Replace with authenticated endpoint once backend is connected
      const response = await fetch("/api/blogs");
      const data = (await response.json()) as BlogListResponse;
      setMyBlogs(data.blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      // TODO: Add proper error handling and user feedback
    }
  };

  /**
   * CREATE BLOG API INTEGRATION
   *
   * This function demonstrates creating a new blog post.
   *
   * API Endpoint: POST /api/blogs
   * Request Body: CreateBlogRequest object
   *
   * Required fields:
   * - title: string (max 200 chars)
   * - excerpt: string (max 500 chars)
   * - content: string (min 100 chars)
   * - author: string (max 100 chars)
   * - tags: string[] (max 10 tags)
   *
   * Optional fields:
   * - featured: boolean (default false)
   * - coverImage: string (valid URL)
   *
   * Auto-generated:
   * - id: unique identifier
   * - publishedAt: current timestamp
   * - readingTime: calculated from content
   */
  const handleCreateBlog = async (blogData: CreateBlogRequest) => {
    try {
      setLoading(true);

      // Create new blog post using POST /api/blogs
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // TODO: Add authentication header when implemented
          // "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(blogData),
      });

      // Handle validation errors (400) and other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create blog");
      }

      const data = (await response.json()) as BlogResponse;

      // Show success message
      toast({
        title: "Blog Published!",
        description: "Your blog post has been successfully published.",
      });

      // Navigate to the newly created blog post
      navigate(`/blog/${data.blog.id}`);
    } catch (error) {
      console.error("Error creating blog:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to publish blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * EDIT BLOG HANDLER
   *
   * Opens the edit modal with the selected blog data pre-filled.
   */
  const handleEditBlog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setIsEditModalOpen(true);
    setActiveTab("edit"); // Switch to edit tab
  };

  /**
   * UPDATE BLOG API INTEGRATION
   *
   * This function demonstrates updating an existing blog post.
   *
   * API Endpoint: PUT /api/blogs/:id
   * Parameters:
   * - id: Blog post ID to update
   *
   * Request Body: Updated blog data
   *
   * Response:
   * - 200 OK: Successfully updated
   * - 404 Not Found: Blog doesn't exist
   * - 500 Server Error: Update failed
   */
  const handleUpdateBlog = async (blogData: CreateBlogRequest) => {
    if (!editingBlog) return;

    try {
      setLoading(true);

      // Update blog post using PUT /api/blogs/:id
      const response = await fetch(`/api/blogs/${editingBlog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // TODO: Add authentication header when implemented
          // "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(blogData),
      });

      // Handle validation errors (400) and other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update blog");
      }

      const data = (await response.json()) as BlogResponse;

      // Update local state
      setMyBlogs((prev) =>
        prev.map((blog) => (blog.id === editingBlog.id ? data.blog : blog)),
      );

      // Show success message
      toast({
        title: "Blog Updated!",
        description: "Your blog post has been successfully updated.",
      });

      // Close edit modal and reset state
      setIsEditModalOpen(false);
      setEditingBlog(null);
      setActiveTab("blogs"); // Switch back to blogs tab
    } catch (error) {
      console.error("Error updating blog:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * DELETE BLOG API INTEGRATION
   *
   * This function demonstrates deleting a blog post.
   *
   * API Endpoint: DELETE /api/blogs/:id
   * Parameters:
   * - id: Blog post ID to delete
   *
   * Response:
   * - 204 No Content: Successfully deleted
   * - 404 Not Found: Blog doesn't exist
   * - 500 Server Error: Delete failed
   *
   * Note: This performs permanent deletion. Consider implementing
   * soft delete (archive) functionality for better UX.
   */
  const handleDeleteBlog = async (blogId: string) => {
    // Confirm deletion with user
    if (
      !confirm(
        "Are you sure you want to delete this blog? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      // Delete blog post using DELETE /api/blogs/:id
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          // TODO: Add authentication header when implemented
          // "Authorization": `Bearer ${authToken}`,
        },
      });

      // Handle different response codes
      if (response.status === 404) {
        toast({
          title: "Blog Not Found",
          description: "This blog post may have already been deleted.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete blog");
      }

      // Update local state to remove deleted blog
      setMyBlogs((prev) => prev.filter((blog) => blog.id !== blogId));

      toast({
        title: "Blog Deleted",
        description: "Your blog post has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stats = {
    totalBlogs: myBlogs.length,
    featuredBlogs: myBlogs.filter((blog) => blog.featured).length,
    totalReadingTime: myBlogs.reduce((acc, blog) => acc + blog.readingTime, 0),
    avgReadingTime:
      myBlogs.length > 0
        ? Math.round(
            myBlogs.reduce((acc, blog) => acc + blog.readingTime, 0) /
              myBlogs.length,
          )
        : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 xl:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header - Mobile First */}
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1 sm:mt-2">
                Manage your AI & ML content and track performance
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={() => setActiveTab("create")}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">New Blog</span>
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-5 h-auto p-1">
              <TabsTrigger
                value="overview"
                className="text-xs sm:text-sm py-2 px-1"
              >
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="text-xs sm:text-sm py-2 px-1"
              >
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Chart</span>
              </TabsTrigger>
              <TabsTrigger
                value="blogs"
                className="text-xs sm:text-sm py-2 px-1"
              >
                <span className="hidden sm:inline">My Blogs</span>
                <span className="sm:hidden">Blogs</span>
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                className="text-xs sm:text-sm py-2 px-1"
                disabled={!editingBlog}
              >
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="text-xs sm:text-sm py-2 px-1"
              >
                <span className="hidden sm:inline">Create</span>
                <span className="sm:hidden">New</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              {/* Stats Grid - Mobile First */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-xs sm:text-sm font-medium">
                      Total Blogs
                    </CardTitle>
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <AnimatedCounter
                      end={stats.totalBlogs}
                      className="text-lg sm:text-xl lg:text-2xl font-bold"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-xs sm:text-sm font-medium">
                      Featured
                    </CardTitle>
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <AnimatedCounter
                      end={stats.featuredBlogs}
                      className="text-lg sm:text-xl lg:text-2xl font-bold"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-xs sm:text-sm font-medium">
                      <span className="hidden sm:inline">
                        Total Reading Time
                      </span>
                      <span className="sm:hidden">Reading Time</span>
                    </CardTitle>
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <AnimatedCounter
                      end={stats.totalReadingTime}
                      suffix="m"
                      className="text-lg sm:text-xl lg:text-2xl font-bold"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-xs sm:text-sm font-medium">
                      <span className="hidden sm:inline">
                        Avg. Reading Time
                      </span>
                      <span className="sm:hidden">Avg. Time</span>
                    </CardTitle>
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <AnimatedCounter
                      end={stats.avgReadingTime}
                      suffix="m"
                      className="text-lg sm:text-xl lg:text-2xl font-bold"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Ad Space */}
              <AdSpace size="leaderboard" className="mx-auto" />

              {/* Recent Blogs */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Blogs</CardTitle>
                </CardHeader>
                <CardContent>
                  {myBlogs.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold">No blogs yet</h3>
                        <p className="text-muted-foreground">
                          Start creating your first AI & ML blog post!
                        </p>
                      </div>
                      <Button onClick={() => setActiveTab("create")}>
                        Create Your First Blog
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myBlogs.slice(0, 5).map((blog) => (
                        <div
                          key={blog.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base truncate">
                              {blog.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                              {blog.excerpt}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  blog.publishedAt,
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {blog.readingTime} min read
                              </span>
                              {blog.featured && (
                                <Badge variant="secondary" className="text-xs">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-end space-x-2 sm:ml-4">
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={`/blog/${blog.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View blog</span>
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Blog Analytics & Reader Insights
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track how readers engage with your content, including
                    reading time and user authentication status
                  </p>
                </CardHeader>
                <CardContent>
                  <Analytics />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blogs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All My Blogs</CardTitle>
                </CardHeader>
                <CardContent>
                  {myBlogs.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold">No blogs yet</h3>
                        <p className="text-muted-foreground">
                          Start creating your first AI & ML blog post!
                        </p>
                      </div>
                      <Button onClick={() => setActiveTab("create")}>
                        Create Your First Blog
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myBlogs.map((blog) => (
                        <div
                          key={blog.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">{blog.title}</h4>
                              {blog.featured && (
                                <Badge variant="secondary">Featured</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {blog.excerpt}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {blog.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>By {blog.author}</span>
                              <span>
                                {new Date(
                                  blog.publishedAt,
                                ).toLocaleDateString()}
                              </span>
                              <span>{blog.readingTime} min read</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={`/blog/${blog.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditBlog(blog)}
                              title="Edit blog"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="edit" className="space-y-4 sm:space-y-6">
              {editingBlog ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                        <Edit3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        <span>Edit Blog Post</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Editing: "{editingBlog.title}"
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBlog(null);
                        setActiveTab("blogs");
                      }}
                    >
                      Cancel
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <BlogEditor
                      onSubmit={handleUpdateBlog}
                      loading={loading}
                      initialData={{
                        title: editingBlog.title,
                        excerpt: editingBlog.excerpt,
                        content: editingBlog.content,
                        author: editingBlog.author,
                        tags: editingBlog.tags,
                        featured: editingBlog.featured,
                        coverImage: editingBlog.coverImage,
                      }}
                      isEditing={true}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 sm:p-8 text-center">
                    <Edit3 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      No Blog Selected for Editing
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      Go to "My Blogs" tab and click the edit button on any blog
                      post to start editing.
                    </p>
                    <Button
                      onClick={() => setActiveTab("blogs")}
                      variant="outline"
                    >
                      Go to My Blogs
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span>Create New Blog Post</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BlogEditor onSubmit={handleCreateBlog} loading={loading} />
                </CardContent>
              </Card>

              {/* Side Ad */}
              <div className="flex justify-center">
                <AdSpace size="rectangle" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Footer */}
      <Footer />
    </div>
  );
}
