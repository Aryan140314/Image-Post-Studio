import { useEffect, useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

function App() {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [pendingActionId, setPendingActionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const totalPosts = posts.length;
  const captionedPosts = posts.filter((post) => post.caption?.trim()).length;
  const selectedImageName = imageFile?.name ?? 'No image selected';

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/posts`);

        if (!response.ok) {
          throw new Error('Could not load posts.');
        }

        const data = await response.json();

        if (isMounted) {
          setPosts(Array.isArray(data.posts) ? data.posts : []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || 'Could not load posts.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!caption.trim()) {
      setError('Please enter a caption.');
      return;
    }

    if (!imageFile) {
      setError('Please choose an image.');
      return;
    }

    const formData = new FormData();
    formData.append('caption', caption.trim());
    formData.append('image', imageFile);

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE}/create-post`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not create post.');
      }

      if (data.post) {
        setPosts((currentPosts) => [data.post, ...currentPosts]);
      }

      setCaption('');
      setImageFile(null);
      setSuccessMessage(data.message || 'Post created successfully.');
    } catch (submitError) {
      setError(submitError.message || 'Could not create post.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(post) {
    setEditingPostId(post._id);
    setEditCaption(post.caption || '');
    setError('');
    setSuccessMessage('');
  }

  function cancelEditing() {
    setEditingPostId('');
    setEditCaption('');
  }

  async function handleDelete(postId) {
    try {
      setPendingActionId(postId);
      setError('');
      setSuccessMessage('');

      const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete post.');
      }

      setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));
      setSuccessMessage(data.message || 'Post deleted successfully.');

      if (editingPostId === postId) {
        cancelEditing();
      }
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete post.');
    } finally {
      setPendingActionId('');
    }
  }

  async function handleUpdate(postId) {
    if (!editCaption.trim()) {
      setError('Please enter a caption before updating.');
      return;
    }

    try {
      setPendingActionId(postId);
      setError('');
      setSuccessMessage('');

      const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caption: editCaption.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not update post.');
      }

      if (data.post) {
        setPosts((currentPosts) =>
          currentPosts.map((post) => (post._id === postId ? data.post : post)),
        );
      }

      cancelEditing();
      setSuccessMessage(data.message || 'Post updated successfully.');
    } catch (updateError) {
      setError(updateError.message || 'Could not update post.');
    } finally {
      setPendingActionId('');
    }
  }

  return (
    <main className="shell">
      <div className="ambient-glow ambient-glow-one" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-two" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Creative Post Studio</p>
          <h1>Make your image-post frontend feel like a polished launch-ready product.</h1>
          <p className="hero-text">
            Your backend already does the heavy lifting. This refreshed interface turns it
            into a cleaner publishing experience with better hierarchy, warmer visuals, and
            a feed that feels more alive.
          </p>

          <div className="hero-pills">
            <span className="hero-pill">Upload images</span>
            <span className="hero-pill">Edit captions</span>
            <span className="hero-pill">Delete posts</span>
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-stats">
            <div className="stat-card featured">
              <span className="stat-label">Frontend scope</span>
              <strong>UI only refresh</strong>
              <p>No backend routes or logic changed.</p>
            </div>
            <div className="stat-card">
              <span className="stat-label">Posts loaded</span>
              <strong>{String(totalPosts).padStart(2, '0')}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Caption coverage</span>
              <strong>
                {totalPosts === 0 ? '0%' : `${Math.round((captionedPosts / totalPosts) * 100)}%`}
              </strong>
            </div>
          </div>

          <div className="hero-note">
            <p className="hero-note-title">Workflow</p>
            <ul className="hero-list">
              <li>Create a post with image + caption.</li>
              <li>Preview before upload.</li>
              <li>Update or remove any saved card.</li>
            </ul>
          </div>
        </div>

        <div className="hero-summary">
          <div className="stat-card">
            <span className="stat-label">Create endpoint</span>
            <strong>POST /create-post</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Manage endpoints</span>
            <strong>GET / PATCH / DELETE</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <form className="composer-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <p className="section-kicker">Compose</p>
            <h2>Create a post with a stronger presentation</h2>
            <p className="section-subtext">
              Add a caption, attach an image, and publish straight into the live feed.
            </p>
          </div>

          <div className="composer-strip">
            <div>
              <span className="mini-label">Selected file</span>
              <strong>{selectedImageName}</strong>
            </div>
            <div>
              <span className="mini-label">Feed size</span>
              <strong>{totalPosts} posts</strong>
            </div>
          </div>

          <label className="field">
            <span>Caption</span>
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Write something short for your post..."
              rows={4}
            />
          </label>

          <label className="upload-zone">
            <span className="upload-kicker">Image upload</span>
            <span className="upload-title">
              {imageFile ? 'Image ready to publish' : 'Choose a file for your next post'}
            </span>
            <span className="upload-hint">
              Your backend expects the field name <code>image</code>.
            </span>
            <input
              className="upload-input"
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            />
          </label>

          {previewUrl ? (
            <div className="preview-frame">
              <img src={previewUrl} alt="Selected preview" />
            </div>
          ) : (
            <div className="preview-placeholder">
              <p>Image preview will appear here before upload.</p>
              <span>Pick a strong visual and it will show up instantly.</span>
            </div>
          )}

          {error ? <p className="feedback error">{error}</p> : null}
          {successMessage ? <p className="feedback success">{successMessage}</p> : null}

          <div className="composer-footer">
            <button className="publish-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish post'}
            </button>
          </div>
        </form>

        <section className="feed-card">
          <div className="feed-heading">
            <div className="section-heading">
              <p className="section-kicker">Live feed</p>
              <h2>Posts loaded from your backend</h2>
              <p className="section-subtext">
                Every card here is rendered from your API response in real time.
              </p>
            </div>

            <div className="feed-badges">
              <span className="count-pill">{totalPosts} total</span>
              <span className="count-pill muted">{isLoading ? 'Syncing' : 'Ready'}</span>
            </div>
          </div>

          {isLoading ? <p className="status-text">Loading posts...</p> : null}

          {!isLoading && posts.length === 0 ? (
            <div className="empty-state">
              <p>No posts yet.</p>
              <span>Create one from the form and it will appear here with the new card design.</span>
            </div>
          ) : null}

          <div className="post-grid">
            {posts.map((post, index) => {
              const isEditing = editingPostId === post._id;
              const isBusy = pendingActionId === post._id;

              return (
                <article className="post-card" key={post._id || `${post.Image}-${post.caption}`}>
                  <div className="post-topline">
                    <span className="post-index">Post {String(index + 1).padStart(2, '0')}</span>
                    <span className="post-status">Live</span>
                  </div>

                  <div className="post-media">
                    <img src={post.Image} alt={post.caption || 'Uploaded post'} />
                  </div>

                  <div className="post-content">
                    {isEditing ? (
                      <textarea
                        className="edit-textarea"
                        value={editCaption}
                        onChange={(event) => setEditCaption(event.target.value)}
                        rows={3}
                      />
                    ) : (
                      <p>{post.caption || 'Untitled post'}</p>
                    )}

                    <div className="post-actions">
                      {isEditing ? (
                        <>
                          <button
                            className="action-button primary"
                            type="button"
                            onClick={() => handleUpdate(post._id)}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            className="action-button secondary"
                            type="button"
                            onClick={cancelEditing}
                            disabled={isBusy}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="action-button primary"
                            type="button"
                            onClick={() => startEditing(post)}
                            disabled={isBusy}
                          >
                            Edit
                          </button>
                          <button
                            className="action-button danger"
                            type="button"
                            onClick={() => handleDelete(post._id)}
                            disabled={isBusy}
                          >
                            {isBusy ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
