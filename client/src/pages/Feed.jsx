import React, { useEffect, useState } from 'react';
import { useAuth } from '../App.jsx';

function Feed() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingUserId, setFollowingUserId] = useState('');
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

  const toggleFollow = async (targetUserId, isFollowing) => {
    setFollowingUserId(targetUserId);
    setError('');

    try {
      const res = await fetch(`/api/v1/users/${targetUserId}/follow`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || 'Failed to update follow status');
      }

      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.createdBy?._id !== targetUserId) return post;

          const followers = Array.isArray(post.createdBy.followers)
            ? post.createdBy.followers
            : [];

          const nextFollowers = isFollowing
            ? followers.filter(id => id.toString() !== user.userId)
            : [...followers, user.userId];

          return {
            ...post,
            createdBy: {
              ...post.createdBy,
              followers: nextFollowers,
            },
          };
        })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setFollowingUserId('');
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

      {posts.map(post => {
        const author = post.createdBy;
        const authorId = author?._id;
        const followers = Array.isArray(author?.followers) ? author.followers : [];
        const isMyPost = authorId === user?.userId;
        const isFollowing = followers.some(id => id.toString() === user?.userId);
        const isWorking = followingUserId === authorId;

        return (
          <article
            key={post._id}
            style={{
              border: '1px solid #ddd',
              padding: '0.75rem',
              marginBottom: '0.75rem'
            }}
          >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {author?.profilePic && (
                <img
                  src={author.profilePic}
                  alt={author.username || 'User'}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              )}
              <div>
                <strong>@{author?.username || 'Unknown'}</strong>
                <br />
                <small>{followers.length} followers</small>
              </div>
            </div>

            {authorId && !isMyPost && (
              <button
                type="button"
                onClick={() => toggleFollow(authorId, isFollowing)}
                disabled={isWorking}
              >
                {isWorking ? 'Saving...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>

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
        );
      })}
    </div>
  );
}

export default Feed;
