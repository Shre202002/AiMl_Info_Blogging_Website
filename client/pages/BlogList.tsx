import { useEffect, useState } from "react";
import { BlogPost, BlogListResponse } from "@shared/blog";
import { Header } from "@/components/Header";
import { BlogCard } from "@/components/BlogCard";
import { AdSpace } from "@/components/AdSpace";
import { InteractiveSearch } from "@/components/InteractiveSearch";
import { BlogCardSkeleton } from "@/components/SkeletonLoader";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { InteractiveButton } from "@/components/InteractiveButton";
import { InteractiveBlogPreview } from "@/components/InteractiveBlogPreview";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 12;

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  /**
   * BLOG LIST API INTEGRATION
   *
   * This function demonstrates pagination and filtering with the blog API.
   *
   * API Endpoint: GET /api/blogs
   * Supported query parameters:
   * - page: Page number for pagination
   * - limit: Number of items per page
   * - search: Search term for title/excerpt
   * - tag: Filter by specific tag
   * - featured: Filter by featured status
   * - author: Filter by author name
   *
   * Example URLs:
   * - /api/blogs?page=1&limit=12
   * - /api/blogs?search=machine%20learning&page=2
   * - /api/blogs?tag=AI&featured=true
   */
  const fetchBlogs = async () => {
    try {
      setLoading(true);

      // Build query string with filters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add search filter if active
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      // Add tag filter if selected
      if (selectedTag) {
        params.append("tag", selectedTag);
      }

      // Make API request with query parameters
      const response = await fetch(`/api/blogs?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }

      const data = (await response.json()) as BlogListResponse;
      setBlogs(data.blogs);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (error) {
      console.error("Error fetching blogs:", error);
      // TODO: Implement user-friendly error handling
      // Example: setError("Failed to load blogs. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const allTags = [...new Set(blogs.flatMap((blog) => blog.tags))];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || blog.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            All Blog Posts
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our complete collection of AI & ML insights, tutorials, and
            research analysis.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <InteractiveSearch
            value={searchTerm}
            onChange={setSearchTerm}
            suggestions={allTags}
            placeholder="Search articles and topics..."
          />

          {/* Tags Filter */}
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 px-4 sm:px-0">
            <InteractiveButton
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
              className="text-xs sm:text-sm"
            >
              All Topics
            </InteractiveButton>
            {allTags.slice(0, window.innerWidth < 768 ? 6 : 10).map((tag) => (
              <InteractiveButton
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className="text-xs sm:text-sm"
              >
                <span className="truncate max-w-20 sm:max-w-none">{tag}</span>
              </InteractiveButton>
            ))}
          </div>
        </div>

        {/* Ad Space - Hidden for now */}
        {/* <div className="flex justify-center">
          <AdSpace size="leaderboard" />
        </div> */}

        {/* Blog Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center space-y-4 py-12">
            <h3 className="text-2xl font-semibold">No articles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedTag(null);
              }}
              className="text-xs sm:text-sm"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog, index) => (
              <div key={blog.id}>
                <InteractiveBlogPreview blog={blog} />
                {/* Insert ad every 6 posts - Hidden for now */}
                {/* {(index + 1) % 6 === 0 && (
                  <div className="col-span-full flex justify-center my-8">
                    <AdSpace size="rectangle" />
                  </div>
                )} */}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <InteractiveButton
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </InteractiveButton>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <InteractiveButton
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </InteractiveButton>
              );
            })}

            <InteractiveButton
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </InteractiveButton>
          </div>
        )}

        {/* Bottom Ad - Hidden for now */}
        {/* <div className="flex justify-center pt-8">
          <AdSpace size="leaderboard" />
        </div> */}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Footer */}
      <Footer />
    </div>
  );
}
