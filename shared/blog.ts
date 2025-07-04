/**
 * Shared blog types between client and server
 */

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  tags: string[];
  readingTime: number;
  featured: boolean;
  coverImage?: string;
}

export interface CreateBlogRequest {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  featured: boolean;
  coverImage?: string;
}

export interface BlogListResponse {
  blogs: BlogPost[];
  total: number;
  page: number;
  limit: number;
}

export interface BlogResponse {
  blog: BlogPost;
}
