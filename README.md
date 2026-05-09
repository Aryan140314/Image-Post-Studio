# Image-Post-Studio

Image-Post-Studio is a full-stack image posting project with a React frontend and an Express backend. Users can upload an image with a caption, preview it before publishing, view all posts, edit captions, and delete posts. Images are uploaded to ImageKit and post data is stored in MongoDB.

## Tech Stack

### Frontend

- React 19
- Vite
- JavaScript
- CSS
- Fetch API

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer
- ImageKit
- dotenv

## Techniques Used

### Frontend Techniques

- React functional components
- `useState` for form, preview, loading, success, error, and editing states
- `useEffect` for initial post loading and preview URL cleanup
- File upload using `FormData`
- API integration using the Fetch API
- Inline image preview with `URL.createObjectURL()`
- Conditional rendering for loading, empty state, success, and error UI
- Responsive UI layout with custom CSS
- Vite proxy setup for local backend communication

### Backend Techniques

- REST API development with Express
- CRUD operations with MongoDB and Mongoose
- File upload handling with `multipart/form-data`
- In-memory image handling using `multer.memoryStorage()`
- Cloud image upload with ImageKit
- Environment variable management with dotenv
- MongoDB ObjectId validation before update and delete operations

## Features

- Create a post with image and caption
- Preview selected image before upload
- Fetch and display all posts
- Update an existing post caption
- Delete a post
- Store uploaded image URLs in MongoDB
- Connect frontend and backend in local development with Vite proxy

## Project Structure

```text
Image-Post-Studio/
|-- README.md
|-- .gitignore
|-- Backend/
|   |-- .env.example
|   |-- package.json
|   |-- package-lock.json
|   |-- server.js
|   `-- src/
|       |-- app.js
|       |-- db/
|       |   `-- db.js
|       |-- models/
|       |   `-- post.model.js
|       `-- services/
|           `-- storage.service.js
`-- Frontend/
    |-- package.json
    |-- package-lock.json
    |-- vite.config.js
    |-- index.html
    |-- public/
    `-- src/
        |-- App.jsx
        |-- App.css
        |-- index.css
        `-- main.jsx
```

## How It Works

1. The React frontend sends a `multipart/form-data` request with `caption` and `image`.
2. The Express backend receives the file using `multer`.
3. The image buffer is uploaded to ImageKit.
4. The returned image URL and caption are saved in MongoDB.
5. The frontend fetches the saved posts and displays them in the dashboard.

## API Endpoints

### `POST /create-post`

Creates a new post.

Form fields:

- `image`: image file
- `caption`: text caption

### `GET /posts`

Fetches all posts.

### `PATCH /posts/:id`

Updates the caption of a post.

Request body:

```json
{
  "caption": "Updated caption"
}
```

### `DELETE /posts/:id`

Deletes a post by ID.

## Environment Variables

### Backend

Create a `.env` file inside `Backend/`:

```env
MONGO_URI=your_mongodb_connection_string
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

### Frontend

The frontend works locally through the Vite proxy. If you want to connect it to a deployed backend, you can set:

```env
VITE_API_BASE=http://localhost:3000
```

## Installation And Run

### 1. Start the backend

```bash
cd Backend
npm install
node server.js
```

Backend runs on:

```text
http://localhost:3000
```

### 2. Start the frontend

Open a new terminal:

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on the Vite development server, usually:

```text
http://localhost:5173
```

## Frontend Behavior

- On page load, the frontend fetches all posts from the backend.
- When a user selects an image, a preview is shown before upload.
- After creating a post, the new post is added to the top of the feed.
- Users can edit a caption inline.
- Users can delete any existing post from the feed.

## Notes

- `Backend/.env` is ignored from GitHub.
- `node_modules` and frontend build files are ignored from GitHub.
- The local frontend proxy is configured in `Frontend/vite.config.js`.

## Future Improvements

- Add backend validation middleware
- Add centralized error handling
- Delete images from ImageKit when posts are deleted
- Add authentication
- Add pagination or infinite scrolling
- Deploy frontend and backend
