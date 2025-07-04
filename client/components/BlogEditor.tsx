import { useState, useEffect } from "react";
import { CreateBlogRequest } from "@shared/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RichContentEditor,
  ContentBlock,
} from "@/components/RichContentEditor";
import { GoogleBloggerEditor } from "@/components/GoogleBloggerEditor";
import {
  X,
  Plus,
  Sparkles,
  Edit3,
  FileText,
  Layout,
  PenTool,
} from "lucide-react";

interface BlogEditorProps {
  onSubmit: (blog: CreateBlogRequest) => void;
  loading?: boolean;
  initialData?: Partial<CreateBlogRequest>;
  isEditing?: boolean;
}

export function BlogEditor({
  onSubmit,
  loading = false,
  initialData,
  isEditing = false,
}: BlogEditorProps) {
  const [formData, setFormData] = useState<CreateBlogRequest>({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    tags: [],
    featured: false,
    coverImage: "",
  });

  const [richContentBlocks, setRichContentBlocks] = useState<ContentBlock[]>(
    [],
  );
  const [editorMode, setEditorMode] = useState<"wysiwyg" | "rich" | "markdown">(
    "wysiwyg",
  );

  // Convert content blocks to markdown for storage
  const convertBlocksToMarkdown = (blocks: ContentBlock[]): string => {
    return blocks
      .map((block) => {
        if (block.type === "text") {
          return block.content;
        } else if (block.type === "image" && block.imageUrl) {
          const alignment = block.imageAlignment || "center";
          const size = block.imageSize || "medium";
          const alt = block.imageAlt || "";

          // Create a custom markdown syntax for images with metadata
          return `![${alt}](${block.imageUrl} "${alignment}|${size}")`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  };

  // Convert markdown to content blocks
  const convertMarkdownToBlocks = (markdown: string): ContentBlock[] => {
    if (!markdown.trim()) return [];

    const blocks: ContentBlock[] = [];
    const sections = markdown.split(
      /!\[([^\]]*)\]\(([^)]+)\s*(?:"([^"]*)")?\)/,
    );

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      if (i % 4 === 0 && section.trim()) {
        // Text section
        blocks.push({
          id: `block_${Date.now()}_${i}`,
          type: "text",
          content: section.trim(),
        });
      } else if (i % 4 === 1) {
        // Image section
        const alt = section;
        const url = sections[i + 1];
        const metadata = sections[i + 2] || "";
        const [alignment = "center", size = "medium"] = metadata.split("|");

        if (url) {
          blocks.push({
            id: `block_${Date.now()}_${i}`,
            type: "image",
            content: "",
            imageUrl: url,
            imageAlt: alt,
            imageAlignment: alignment as "left" | "center" | "right",
            imageSize: size as "small" | "medium" | "large" | "full",
          });
        }
      }
    }

    return blocks;
  };

  // Pre-fill form data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        excerpt: initialData.excerpt || "",
        content: initialData.content || "",
        author: initialData.author || "",
        tags: initialData.tags || [],
        featured: initialData.featured || false,
        coverImage: initialData.coverImage || "",
      });

      // Convert existing content to rich blocks if available
      if (initialData.content) {
        const blocks = convertMarkdownToBlocks(initialData.content);
        setRichContentBlocks(blocks);
      }
    }
  }, [initialData]);

  // Update content when blocks change
  useEffect(() => {
    if (editorMode === "rich") {
      const markdownContent = convertBlocksToMarkdown(richContentBlocks);
      setFormData((prev) => ({ ...prev, content: markdownContent }));
    }
  }, [richContentBlocks, editorMode]);

  // Handle WYSIWYG content change
  const handleWysiwygChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const [newTag, setNewTag] = useState("");

  /**
   * BLOG SUBMISSION HANDLER - CREATE/UPDATE BLOG ENDPOINT
   *
   * This function handles both creating new blogs and updating existing ones.
   * The parent component determines which API endpoint to call.
   *
   * FOR NEW BLOGS - API ENDPOINT: POST /api/blogs
   * FOR UPDATES - API ENDPOINT: PUT /api/blogs/:id
   *
   * REQUEST BODY STRUCTURE:
   * {
   *   "title": "Blog Post Title",
   *   "content": "Full blog content in HTML/Markdown",
   *   "excerpt": "Short description for preview",
   *   "tags": ["javascript", "web-development", "tutorial"],
   *   "category": "Technology",
   *   "featured": false,
   *   "coverImage": "https://example.com/image.jpg"
   * }
   *
   * SUCCESS RESPONSE (200/201):
   * {
   *   "blog": {
   *     "id": "blog123",
   *     "title": "Blog Post Title",
   *     "content": "Full content...",
   *     "excerpt": "Short description...",
   *     "author": "user123",
   *     "authorName": "John Doe",
   *     "tags": ["javascript", "web-development"],
   *     "category": "Technology",
   *     "featured": false,
   *     "coverImage": "https://example.com/image.jpg",
   *     "publishedAt": "2024-01-15T10:30:00Z",
   *     "updatedAt": "2024-01-15T10:30:00Z",
   *     "readingTime": 5,
   *     "likes": 0,
   *     "views": 0
   *   }
   * }
   *
   * DATABASE OPERATIONS:
   * 1. Validate user authentication and authorization
   * 2. Sanitize and validate input data
   * 3. Calculate reading time from content
   * 4. For new blogs: INSERT into blogs table
   * 5. For updates: UPDATE blogs table WHERE id = :id AND author = :userId
   * 6. Update search index for blog discovery
   * 7. Cache invalidation for blog lists
   *
   * VALIDATION RULES:
   * - title: Required, 5-200 characters
   * - content: Required, minimum 100 characters
   * - excerpt: Optional, maximum 300 characters
   * - tags: Maximum 10 tags, each 1-30 characters
   * - category: Must be from predefined list
   * - coverImage: Must be valid URL if provided
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Send form data to parent component which will make the API call
    // Data is sent to either POST /api/blogs or PUT /api/blogs/:id
    onSubmit(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const generateAIContent = async () => {
    // Only allow AI assist for new blogs, not when editing existing content
    if (isEditing) return;

    // Simulate AI content generation
    const aiSuggestions = {
      excerpt:
        "This AI-generated excerpt provides a compelling summary of your blog post, designed to engage readers and improve SEO performance.",
      content: `# Introduction

This is an AI-generated starting point for your blog post. Feel free to edit and customize this content to match your vision.

## Key Points to Cover

### 1. Main Topic Overview
Start with a broad overview of your main topic. This helps readers understand the context and importance of what you're discussing.

### 2. Deep Dive Analysis
Provide detailed insights and analysis. This is where you can really showcase your expertise and provide value to your readers.

### 3. Practical Applications
Discuss how readers can apply this information in real-world scenarios. Practical examples make your content more valuable and actionable.

## Best Practices

- Keep your content well-structured
- Use headers to organize your thoughts
- Include examples and case studies
- End with actionable takeaways

## Conclusion

Wrap up your post with key insights and next steps for your readers. A strong conclusion encourages engagement and shares.
      `,
    };

    setFormData((prev) => ({
      ...prev,
      excerpt: prev.excerpt || aiSuggestions.excerpt,
      content: prev.content || aiSuggestions.content,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Edit3 className="h-4 w-4 text-primary" />
                  Edit Blog Details
                </>
              ) : (
                "Blog Details"
              )}
            </span>
            {!isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIContent}
                className="flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Assist</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter an engaging title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, author: e.target.value }))
                }
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              type="url"
              value={formData.coverImage}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              placeholder="Write a compelling summary (2-3 sentences)..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, featured: checked }))
              }
            />
            <Label htmlFor="featured">Featured Article</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEditing && <Edit3 className="h-4 w-4 text-primary" />}
            {isEditing ? "Edit Content *" : "Content *"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={editorMode}
            onValueChange={(value) =>
              setEditorMode(value as "wysiwyg" | "rich" | "markdown")
            }
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger
                value="wysiwyg"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <PenTool className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">WYSIWYG</span>
                <span className="sm:hidden">Edit</span>
              </TabsTrigger>
              <TabsTrigger
                value="rich"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Layout className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Blocks</span>
                <span className="sm:hidden">Rich</span>
              </TabsTrigger>
              <TabsTrigger
                value="markdown"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Markdown</span>
                <span className="sm:hidden">MD</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wysiwyg" className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <PenTool className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Google Blogger Style Editor
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Full-featured WYSIWYG editor with rich formatting, tables,
                  links, images, and more.
                </p>
              </div>

              <GoogleBloggerEditor
                value={formData.content}
                onChange={handleWysiwygChange}
                placeholder="Start writing your blog post..."
              />
            </TabsContent>

            <TabsContent value="rich" className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Layout className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Block-Based Editor
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Create sections with text and images. Drag to reorder, click
                  buttons to add content.
                </p>
              </div>

              <RichContentEditor
                value={richContentBlocks}
                onChange={setRichContentBlocks}
                placeholder="Start creating your blog with text and image sections..."
              />
            </TabsContent>

            <TabsContent value="markdown" className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Markdown Editor</span>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Write content using Markdown syntax. Switch between modes to
                  see live conversion.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="sr-only">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }));
                    // Update rich blocks when editing in markdown mode
                    if (editorMode === "markdown") {
                      const blocks = convertMarkdownToBlocks(e.target.value);
                      setRichContentBlocks(blocks);
                    }
                  }}
                  placeholder="Write your blog content using Markdown formatting..."
                  rows={20}
                  className="font-mono"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Tip: Use Markdown formatting (# for headers, ** for bold,
                  etc.)
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
        <Button type="button" variant="outline" className="w-full sm:w-auto">
          Save Draft
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80"
        >
          {loading
            ? isEditing
              ? "Updating..."
              : "Publishing..."
            : isEditing
              ? "Update Blog"
              : "Publish Blog"}
        </Button>
      </div>
    </form>
  );
}
