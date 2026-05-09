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
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Image Post Studio</p>
          <h1>Turn your tested backend into a working creator dashboard.</h1>
          <p className="hero-text">
            This frontend talks to your Express API, uploads an image with a caption,
            updates captions with patch, deletes posts, and renders the saved feed.
          </p>
        </div>

        <div className="hero-stats">
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
            <p className="section-kicker">New post</p>
            <h2>Upload an image and publish it</h2>
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
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            />
            <span className="upload-title">
              {imageFile ? imageFile.name : 'Choose an image'}
            </span>
            <span className="upload-hint">
              Your backend expects the field name <code>image</code>.
            </span>
          </label>

          {previewUrl ? (
            <div className="preview-frame">
              <img src={previewUrl} alt="Selected preview" />
            </div>
          ) : (
            <div className="preview-placeholder">
              Image preview will appear here before upload.
            </div>
          )}

          {error ? <p className="feedback error">{error}</p> : null}
          {successMessage ? <p className="feedback success">{successMessage}</p> : null}

          <button className="publish-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Publish post'}
          </button>
        </form>

        <section className="feed-card">
          <div className="section-heading">
            <p className="section-kicker">Live feed</p>
            <h2>Posts loaded from your backend</h2>
          </div>

          {isLoading ? <p className="status-text">Loading posts...</p> : null}

          {!isLoading && posts.length === 0 ? (
            <div className="empty-state">
              <p>No posts yet.</p>
              <span>Create one from the form and it will appear here.</span>
            </div>
          ) : null}

          <div className="post-grid">
            {posts.map((post) => {
              const isEditing = editingPostId === post._id;
              const isBusy = pendingActionId === post._id;

              return (
                <article className="post-card" key={post._id || `${post.Image}-${post.caption}`}>
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
                            Edit caption
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
