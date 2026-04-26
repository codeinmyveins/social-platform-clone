import React, { useEffect, useState } from 'react';
import { useAuth } from '../App.jsx';

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

  if (loading) return <p>Loading your posts...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>My Posts</h2>

      {posts.length === 0 && <p>You have not posted anything yet.</p>}

      {posts.map(post => (
        <article
          key={post._id}
          style={{
            border: '1px solid #ddd',
            padding: '0.75rem',
            marginBottom: '0.75rem'
          }}
        >
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

          <small>Likes: {post.likedBy?.length || 0}</small>
        </article>
      ))}
    </div>
  );
}

export default MyPosts;
