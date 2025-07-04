import { Link } from "react-router-dom";
import { BlogPost } from "@shared/blog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  blog: BlogPost;
  featured?: boolean;
  className?: string;
}

export function BlogCard({ blog, featured = false, className }: BlogCardProps) {
  return (
    <Card
      className={cn(
        "group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden border-0 bg-gradient-to-br from-background to-background/50",
        "hover:scale-[1.02] hover:-translate-y-1 cursor-pointer",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 before:hover:opacity-100",
        featured && "md:col-span-2 lg:col-span-2",
        className,
      )}
    >
      <Link to={`/blog/${blog.id}`} className="block">
        {blog.coverImage && (
          <div className="relative overflow-hidden">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className={cn(
                "w-full object-cover group-hover:scale-105 transition-transform duration-500",
                featured ? "h-64 md:h-80" : "h-48",
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            {blog.featured && (
              <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
                Featured
              </Badge>
            )}
          </div>
        )}

        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {blog.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <h3
            className={cn(
              "font-bold leading-tight group-hover:text-primary transition-colors",
              featured ? "text-xl md:text-2xl" : "text-lg",
            )}
          >
            {blog.title}
          </h3>
        </CardHeader>

        <CardContent className="space-y-4">
          <p
            className={cn(
              "text-muted-foreground leading-relaxed",
              featured ? "text-base" : "text-sm",
            )}
          >
            {blog.excerpt}
          </p>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{blog.readingTime} min read</span>
              </div>
            </div>
            <time dateTime={blog.publishedAt}>
              {new Date(blog.publishedAt).toLocaleDateString()}
            </time>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
