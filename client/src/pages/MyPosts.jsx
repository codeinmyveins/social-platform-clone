import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth.js';

function MyPosts() {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPosts = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/v1/posts/user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.msg || 'Failed to load your posts');
        }

        const data = await res.json();

        setPosts(Array.isArray(data.posts) ? data.posts : []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchMyPosts();
  }, [token]);

  if (loading) return <p className="loading-state">Loading your posts...</p>;
  if (error) return <p className="alert alert--error">{error}</p>;

  return (
    <section className="page-stack">
      <div className="page-header">
        <p className="eyebrow">Your archive</p>
        <h1>My Posts</h1>
      </div>

      {posts.length === 0 && <p className="empty-state">You have not posted anything yet.</p>}

      <div className="post-list">
        {posts.map(post => (
          <article key={post._id} className="post-card">
          <h2 className="post-title">{post.title}</h2>
          <p className="post-content">{post.content}</p>
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="post-image"
            />
          )}

          <div className="post-actions">
            <small>Likes: {post.likedBy?.length || 0}</small>
          </div>
        </article>
      ))}
      </div>
    </section>
  );
}

export default MyPosts;
