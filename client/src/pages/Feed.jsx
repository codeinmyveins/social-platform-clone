import React, { useEffect, useState } from 'react';
import { useAuth } from '../App.jsx';

function Feed() {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toggleLike = async (postId) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || 'Failed to like post');
      }

      const data = await res.json();

      setPosts(prev =>
        prev.map(p =>
          p._id === postId ? data.post : p
        )
      );

    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/v1/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.msg || 'Failed to load posts');
        }

        const data = await res.json();

        setPosts(Array.isArray(data.posts) ? data.posts : []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPosts();
  }, [token]);

  if (loading) return <p>Loading feed...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Feed</h2>

      {posts.length === 0 && <p>No posts yet.</p>}

      {posts.map(post => (
        <article
          key={post._id}
          style={{
            border: '1px solid #ddd',
            padding: '0.75rem',
            marginBottom: '0.75rem'
          }}
        >
          <p>{post.createdBy?.username || 'Unknown'}</p>

          <h3>{post.title}</h3>
          <p>{post.content}</p>
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              style={{
                width: '100%',
                maxHeight: '320px',
                objectFit: 'cover',
                borderRadius: '12px',
                marginBottom: '0.75rem',
              }}
            />
          )}

          {/* better to rely on likedBy */}
          <small>Likes: {post.likedBy?.length || 0}</small>

          <button onClick={() => toggleLike(post._id)}>
            Like
          </button>
        </article>
      ))}
    </div>
  );
}

export default Feed;
