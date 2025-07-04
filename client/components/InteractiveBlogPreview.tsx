import { useState } from "react";
import { Link } from "react-router-dom";
import { BlogPost } from "@shared/blog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, User, Eye, Heart, Share2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveBlogPreviewProps {
  blog: BlogPost;
  featured?: boolean;
  className?: string;
}

export function InteractiveBlogPreview({
  blog,
  featured = false,
  className,
}: InteractiveBlogPreviewProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    Math.floor(Math.random() * 100) + 20,
  );
  const [viewCount] = useState(Math.floor(Math.random() * 1000) + 100);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: `/blog/${blog.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/blog/${blog.id}`,
      );
    }
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-0 bg-gradient-to-br from-background to-background/50",
        "hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500",
        "hover:scale-[1.02] hover:-translate-y-2 cursor-pointer",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 before:hover:opacity-100",
        featured && "md:col-span-2 lg:col-span-2",
        className,
      )}
    >
      <Link to={`/blog/${blog.id}`} className="block h-full">
        {blog.coverImage && (
          <div className="relative overflow-hidden">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className={cn(
                "w-full object-cover group-hover:scale-110 transition-transform duration-700",
                featured ? "h-64 md:h-80" : "h-48",
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleLike}
                className={cn(
                  "p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-110",
                  isLiked
                    ? "bg-red-500 text-white"
                    : "bg-white/10 text-white hover:bg-white/20",
                )}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-110"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {blog.featured && (
              <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground animate-pulse">
                Featured
              </Badge>
            )}

            {/* Reading Progress Indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-primary transition-all duration-300 group-hover:w-full"
                style={{ width: `${(blog.readingTime / 15) * 100}%` }}
              />
            </div>
          </div>
        )}

        <CardHeader className="space-y-3 relative z-10">
          <div className="flex flex-wrap gap-2">
            {blog.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h3
            className={cn(
              "font-bold leading-tight group-hover:text-primary transition-colors duration-300",
              featured ? "text-xl md:text-2xl" : "text-lg",
            )}
          >
            {blog.title}
          </h3>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          <p
            className={cn(
              "text-muted-foreground leading-relaxed",
              featured ? "text-base" : "text-sm",
            )}
          >
            {blog.excerpt}
          </p>

          {/* Interactive Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1 hover:text-primary transition-colors">
                <User className="h-4 w-4" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-primary transition-colors">
                <BookOpen className="h-4 w-4" />
                <span>{blog.readingTime} min</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1 hover:text-primary transition-colors">
                <Eye className="h-3 w-3" />
                <span>{viewCount}</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                <Heart className="h-3 w-3" />
                <span>{likeCount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <time dateTime={blog.publishedAt}>
              {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>

            {/* Reading time indicator */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Clock className="h-3 w-3" />
              <span>Read now</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
