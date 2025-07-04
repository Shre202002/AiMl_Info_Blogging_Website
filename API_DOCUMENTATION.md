# AIML Info API Documentation

## Base URL

```
Development: http://localhost:8080/api
Production: https://your-domain.com/api
```

## Authentication

Currently, the API doesn't require authentication. For production, implement JWT tokens or API keys.

## Content-Type

All POST/PUT requests should include:

```
Content-Type: application/json
```

---

## Endpoints

### 1. Get All Blogs

**GET** `/api/blogs`

Fetch blog posts with pagination and filtering.

#### Query Parameters

| Parameter  | Type    | Default | Description                       |
| ---------- | ------- | ------- | --------------------------------- |
| `page`     | number  | 1       | Page number (min: 1)              |
| `limit`    | number  | 10      | Items per page (min: 1, max: 100) |
| `featured` | boolean | -       | Filter by featured posts only     |
| `search`   | string  | -       | Search in title and excerpt       |
| `tag`      | string  | -       | Filter by specific tag            |
| `author`   | string  | -       | Filter by author name             |

#### Example Requests

```bash
# Get first page with 10 items
GET /api/blogs?page=1&limit=10

# Get featured posts only
GET /api/blogs?featured=true

# Search for "machine learning"
GET /api/blogs?search=machine%20learning

# Filter by tag
GET /api/blogs?tag=AI&page=2

# Filter by author
GET /api/blogs?author=John%20Doe
```

#### Response Format

```json
{
  "blogs": [
    {
      "id": "string",
      "title": "string",
      "excerpt": "string",
      "content": "string",
      "author": "string",
      "publishedAt": "2024-01-15T10:30:00.000Z",
      "tags": ["AI", "Machine Learning"],
      "readingTime": 5,
      "featured": true,
      "coverImage": "https://example.com/image.jpg"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

### 2. Get Single Blog

**GET** `/api/blogs/:id`

Fetch a specific blog post by ID.

#### Parameters

| Parameter | Type   | Description                 |
| --------- | ------ | --------------------------- |
| `id`      | string | Unique blog post identifier |

#### Example Request

```bash
GET /api/blogs/1
```

#### Response Format

```json
{
  "blog": {
    "id": "1",
    "title": "The Future of AI in Content Creation",
    "excerpt": "Explore how artificial intelligence is revolutionizing...",
    "content": "# The Future of AI in Content Creation\n\nArtificial Intelligence...",
    "author": "Sarah Chen",
    "publishedAt": "2024-01-15T10:30:00.000Z",
    "tags": ["AI", "Content Marketing", "Technology"],
    "readingTime": 5,
    "featured": true,
    "coverImage": "https://images.unsplash.com/photo-1677442136019-21780ecad995"
  }
}
```

#### Error Responses

```json
// 404 Not Found
{
  "error": "Blog not found",
  "message": "No blog found with ID: 999"
}
```

---

### 3. Create Blog

**POST** `/api/blogs`

Create a new blog post.

#### Request Body

```json
{
  "title": "Your Blog Title",
  "excerpt": "A compelling summary of your blog post...",
  "content": "# Your Blog Content\n\nFull markdown content here...",
  "author": "Author Name",
  "tags": ["AI", "Technology", "Tutorial"],
  "featured": false,
  "coverImage": "https://example.com/cover-image.jpg"
}
```

#### Field Validation

| Field        | Type    | Required | Constraints        |
| ------------ | ------- | -------- | ------------------ |
| `title`      | string  | ✅       | Max 200 characters |
| `excerpt`    | string  | ✅       | Max 500 characters |
| `content`    | string  | ✅       | Min 100 characters |
| `author`     | string  | ✅       | Max 100 characters |
| `tags`       | array   | ✅       | Max 10 tags        |
| `featured`   | boolean | ❌       | Default: false     |
| `coverImage` | string  | ❌       | Valid URL          |

#### Example Request

```bash
curl -X POST http://localhost:8080/api/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with Machine Learning",
    "excerpt": "A beginner-friendly guide to ML concepts...",
    "content": "# Getting Started with Machine Learning\n\nMachine learning is...",
    "author": "Alex Rodriguez",
    "tags": ["Machine Learning", "Beginner", "Tutorial"],
    "featured": false
  }'
```

#### Response Format

```json
{
  "blog": {
    "id": "1704447600000",
    "title": "Getting Started with Machine Learning",
    "excerpt": "A beginner-friendly guide to ML concepts...",
    "content": "# Getting Started with Machine Learning...",
    "author": "Alex Rodriguez",
    "publishedAt": "2024-01-15T10:30:00.000Z",
    "tags": ["Machine Learning", "Beginner", "Tutorial"],
    "readingTime": 8,
    "featured": false,
    "coverImage": null
  }
}
```

---

### 4. Update Blog

**PUT** `/api/blogs/:id`

Update an existing blog post. All fields are optional.

#### Parameters

| Parameter | Type   | Description            |
| --------- | ------ | ---------------------- |
| `id`      | string | Blog post ID to update |

#### Request Body (All Optional)

```json
{
  "title": "Updated Blog Title",
  "excerpt": "Updated excerpt...",
  "content": "Updated content...",
  "author": "Updated Author",
  "tags": ["Updated", "Tags"],
  "featured": true,
  "coverImage": "https://example.com/new-image.jpg"
}
```

#### Example Request

```bash
curl -X PUT http://localhost:8080/api/blogs/1 \
  -H "Content-Type: application/json" \
  -d '{
    "featured": true,
    "tags": ["AI", "Featured", "Popular"]
  }'
```

#### Response Format

```json
{
  "blog": {
    "id": "1",
    "title": "Original Title",
    "excerpt": "Original excerpt...",
    "content": "Original content...",
    "author": "Original Author",
    "publishedAt": "2024-01-15T10:30:00.000Z",
    "tags": ["AI", "Featured", "Popular"],
    "readingTime": 5,
    "featured": true,
    "coverImage": "original-image.jpg"
  }
}
```

---

### 5. Delete Blog

**DELETE** `/api/blogs/:id`

Permanently delete a blog post.

#### Parameters

| Parameter | Type   | Description            |
| --------- | ------ | ---------------------- |
| `id`      | string | Blog post ID to delete |

#### Example Request

```bash
curl -X DELETE http://localhost:8080/api/blogs/1
```

#### Response

- **204 No Content**: Successfully deleted
- **404 Not Found**: Blog doesn't exist

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "field": "fieldName"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful GET/PUT request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Validation errors
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Frontend Integration Examples

### JavaScript/TypeScript Examples

```typescript
// Fetch all blogs
const fetchBlogs = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/blogs?page=${page}&limit=${limit}`);
  return await response.json();
};

// Fetch single blog
const fetchBlog = async (id: string) => {
  const response = await fetch(`/api/blogs/${id}`);
  if (!response.ok) throw new Error("Blog not found");
  return await response.json();
};

// Create new blog
const createBlog = async (blogData: CreateBlogRequest) => {
  const response = await fetch("/api/blogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blogData),
  });
  return await response.json();
};

// Update blog
const updateBlog = async (id: string, updates: Partial<CreateBlogRequest>) => {
  const response = await fetch(`/api/blogs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return await response.json();
};

// Delete blog
const deleteBlog = async (id: string) => {
  const response = await fetch(`/api/blogs/${id}`, {
    method: "DELETE",
  });
  return response.ok;
};
```

---

## Database Integration Guide

### Recommended Database Schema

#### MongoDB Example

```javascript
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  excerpt: { type: String, required: true, maxlength: 500 },
  content: { type: String, required: true, minlength: 100 },
  author: { type: String, required: true, maxlength: 100 },
  tags: [{ type: String, maxlength: 50 }],
  featured: { type: Boolean, default: false },
  coverImage: { type: String },
  readingTime: { type: Number, required: true },
  publishedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date }, // For soft delete
});
```

#### PostgreSQL Example

```sql
CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  excerpt VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  tags TEXT[], -- Array of tags
  featured BOOLEAN DEFAULT FALSE,
  cover_image VARCHAR(500),
  reading_time INTEGER NOT NULL,
  published_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL -- For soft delete
);
```

### Database Integration Steps

1. **Replace In-Memory Storage**: Replace the `blogs` array with database queries
2. **Add Connection**: Set up database connection in your environment
3. **Environment Variables**: Add database configuration
4. **Error Handling**: Implement proper database error handling
5. **Validation**: Add server-side validation
6. **Indexing**: Add database indexes for performance
7. **Authentication**: Implement user authentication for protected routes

### Environment Variables Example

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aiml_info
DB_USER=your_username
DB_PASSWORD=your_password

# MongoDB Alternative
MONGODB_URI=mongodb://localhost:27017/aiml_info

# JWT Secret (for authentication)
JWT_SECRET=your-super-secret-key
```

This documentation provides everything needed to connect your frontend to a backend database!
