# Image-Post-Studio

Image-Post-Studio is a simple backend API for creating image posts. It lets you upload an image, save the hosted image URL, store the caption in MongoDB, fetch all posts, update captions, and delete posts.

The actual Node.js project lives inside the `Backend/` folder.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer
- ImageKit
- dotenv

## Techniques Used

- REST API development with Express
- CRUD operations with MongoDB and Mongoose
- File upload handling using `multipart/form-data`
- In-memory upload processing with `multer.memoryStorage()`
- Cloud image upload using ImageKit
- Environment variable management with dotenv
- MongoDB ObjectId validation before update and delete operations

## Features

- Create a post with image and caption
- Fetch all posts
- Update post caption
- Delete a post
- Store uploaded image URL in MongoDB

## Project Structure

```text
Image-Post-Studio/
|-- README.md
|-- .gitignore
`-- Backend/
    |-- package.json
    |-- package-lock.json
    |-- server.js
    `-- src/
        |-- app.js
        |-- db/
        |   `-- db.js
        |-- models/
        |   `-- post.model.js
        `-- services/
            `-- storage.service.js
```

## API Endpoints

### `POST /create-post`

Creates a new post.

Form data:

- `image`: image file
- `caption`: text caption

### `GET /posts`

Returns all posts from MongoDB.

### `PATCH /posts/:id`

Updates the caption of a post by ID.

Request body:

```json
{
  "caption": "Updated caption"
}
```

### `DELETE /posts/:id`

Deletes a post by ID.

## Environment Variables

Create a `.env` file inside `Backend/` and add:

```env
MONGO_URI=your_mongodb_connection_string
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

## Installation

```bash
cd Backend
npm install
node server.js
```

The server runs on:

```text
http://localhost:3000
```

## Notes

- Uploaded images are sent to ImageKit.
- Post data is stored in MongoDB.
- `node_modules` and `.env` should not be pushed to GitHub.

## Future Improvements

- Add input validation middleware
- Add centralized error handling
- Add image delete support from ImageKit when a post is deleted
- Add pagination for posts
- Add frontend client for creating and viewing posts
