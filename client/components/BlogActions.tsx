import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Share2,
  Heart,
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link2,
  Flag,
  Download,
} from "lucide-react";

interface BlogActionsProps {
  blogId: string;
  blogTitle: string;
  blogUrl?: string;
  initialLikes?: number;
  initialBookmarked?: boolean;
  initialLiked?: boolean;
  showComments?: boolean;
  className?: string;
}

export function BlogActions({
  blogId,
  blogTitle,
  blogUrl,
  initialLikes = 0,
  initialBookmarked = false,
  initialLiked = false,
  showComments = true,
  className = "",
}: BlogActionsProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const currentUrl = blogUrl || `${window.location.origin}/blog/${blogId}`;

  // Handle like/unlike
  const handleLike = async () => {
    try {
      const newLiked = !isLiked;
      setIsLiked(newLiked);
      setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

      // TODO: Connect to your database
      // await fetch(`/api/blogs/${blogId}/like`, {
      //   method: newLiked ? 'POST' : 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${authToken}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      toast({
        title: newLiked ? "Liked!" : "Unliked",
        description: newLiked
          ? "Added to your liked posts"
          : "Removed from liked posts",
      });
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  // Handle bookmark/unbookmark
  const handleBookmark = async () => {
    try {
      const newBookmarked = !isBookmarked;
      setIsBookmarked(newBookmarked);

      // TODO: Connect to your database
      // await fetch(`/api/blogs/${blogId}/bookmark`, {
      //   method: newBookmarked ? 'POST' : 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${authToken}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      toast({
        title: newBookmarked ? "Bookmarked!" : "Bookmark removed",
        description: newBookmarked
          ? "Saved to your reading list"
          : "Removed from reading list",
      });
    } catch (error) {
      // Revert on error
      setIsBookmarked(!isBookmarked);
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      });
    }
  };

  // Handle sharing
  const handleShare = async (platform: string) => {
    const text = `Check out this article: ${blogTitle}`;
    const url = currentUrl;

    try {
      switch (platform) {
        case "copy":
          await navigator.clipboard.writeText(url);
          toast({
            title: "Copied!",
            description: "Link copied to clipboard",
          });
          break;

        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            "_blank",
          );
          break;

        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            "_blank",
          );
          break;

        case "linkedin":
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            "_blank",
          );
          break;

        case "email":
          window.open(
            `mailto:?subject=${encodeURIComponent(blogTitle)}&body=${encodeURIComponent(text + "\n\n" + url)}`,
            "_blank",
          );
          break;

        case "native":
          if (navigator.share) {
            await navigator.share({
              title: blogTitle,
              text: text,
              url: url,
            });
          } else {
            throw new Error("Native sharing not supported");
          }
          break;
      }

      setShareDialogOpen(false);

      // TODO: Track sharing analytics
      // await fetch(`/api/blogs/${blogId}/analytics`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     action: 'share',
      //     platform: platform,
      //     timestamp: new Date().toISOString()
      //   })
      // });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not share this post",
        variant: "destructive",
      });
    }
  };

  // Handle comments
  const handleComments = () => {
    // Scroll to comments section or open comments dialog
    const commentsSection = document.getElementById("comments-section");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    } else {
      toast({
        title: "Comments",
        description: "Comments section coming soon!",
      });
    }
  };

  // Handle report
  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe",
    });
  };

  // Handle download/save as PDF
  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Preparing PDF version...",
    });
    // TODO: Implement PDF generation
  };

  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
      {/* Like Button - Mobile First */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={`h-8 sm:h-9 px-2 sm:px-3 transition-all duration-200 ${
          isLiked
            ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            : "hover:text-red-500"
        }`}
      >
        <Heart
          className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
        />
        <span className="text-xs sm:text-sm">{likeCount}</span>
      </Button>

      {/* Bookmark Button - Mobile First */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBookmark}
        className={`h-8 sm:h-9 px-2 sm:px-3 transition-all duration-200 ${
          isBookmarked
            ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            : "hover:text-blue-500"
        }`}
      >
        <Bookmark
          className={`h-3 w-3 sm:h-4 sm:w-4 ${isBookmarked ? "fill-current" : ""}`}
        />
        <span className="sr-only">Bookmark</span>
      </Button>

      {/* Comments Button - Mobile First */}
      {showComments && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleComments}
          className="h-8 sm:h-9 px-2 sm:px-3 hover:text-green-500"
        >
          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-1" />
          <span className="text-xs sm:text-sm hidden sm:inline">Comment</span>
          <span className="sr-only sm:hidden">Comment</span>
        </Button>
      )}

      {/* Share Button with Dialog - Mobile First */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 sm:h-9 px-2 sm:px-3 hover:text-primary"
          >
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-1" />
            <span className="text-xs sm:text-sm hidden sm:inline">Share</span>
            <span className="sr-only sm:hidden">Share</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Share this article
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* URL Copy - Mobile First */}
            <div className="space-y-2">
              <Label htmlFor="share-url" className="text-sm font-medium">
                Article URL
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="share-url"
                  value={currentUrl}
                  readOnly
                  className="flex-1 text-sm h-10"
                />
                <Button
                  size="sm"
                  onClick={() => handleShare("copy")}
                  className="flex-shrink-0 h-10 px-3"
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
            </div>

            {/* Social Share Buttons - Mobile First */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare("twitter")}
                className="flex items-center gap-1 sm:gap-2 h-10 text-sm"
              >
                <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("facebook")}
                className="flex items-center gap-1 sm:gap-2 h-10 text-sm"
              >
                <Facebook className="h-3 w-3 sm:h-4 sm:w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("linkedin")}
                className="flex items-center gap-1 sm:gap-2 h-10 text-sm"
              >
                <Linkedin className="h-3 w-3 sm:h-4 sm:w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare("email")}
                className="flex items-center gap-1 sm:gap-2 h-10 text-sm"
              >
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                Email
              </Button>
            </div>

            {/* Native Share (if supported) - Mobile First */}
            {navigator.share && (
              <Button
                variant="outline"
                onClick={() => handleShare("native")}
                className="w-full flex items-center gap-2 h-10 text-sm"
              >
                <Share2 className="h-4 w-4" />
                Share via...
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* More Actions - Mobile First */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleDownload} className="text-sm">
            <Download className="mr-2 h-4 w-4" />
            Save as PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleShare("copy")}
            className="text-sm"
          >
            <Link2 className="mr-2 h-4 w-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleReport}
            className="text-red-600 text-sm"
          >
            <Flag className="mr-2 h-4 w-4" />
            Report article
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
