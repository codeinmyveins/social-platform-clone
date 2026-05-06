import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth.js';

function Feed() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingUserId, setFollowingUserId] = useState('');
  const [error, setError] = useState('');

  const toggleLike = async (postId, isLiked) => {
    const currentUserId = user?.userId;
    if (!currentUserId) return;

    setError('');
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id !== postId) return post;

        const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
        const nextLikedBy = isLiked
          ? likedBy.filter(id => id.toString() !== currentUserId)
          : [...likedBy, currentUserId];

        return {
          ...post,
          likedBy: nextLikedBy,
        };
      })
    );

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
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post._id !== postId) return post;

          const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
          const nextLikedBy = isLiked
            ? [...likedBy, currentUserId]
            : likedBy.filter(id => id.toString() !== currentUserId);

          return {
            ...post,
            likedBy: nextLikedBy,
          };
        })
      );
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

  if (loading) return <p className="loading-state">Loading feed...</p>;
  if (error) return <p className="alert alert--error">{error}</p>;

  const visiblePosts = posts.filter(post => post.createdBy?._id !== user?.userId);

  return (
    <section className="page-stack">
      <div className="page-header">
        <p className="eyebrow">Latest posts</p>
        <h1>Feed</h1>
      </div>

      {visiblePosts.length === 0 && <p className="empty-state">No posts from other users yet.</p>}

      <div className="post-list">
        {visiblePosts.map(post => {
        const author = post.createdBy;
        const authorId = author?._id;
        const followers = Array.isArray(author?.followers) ? author.followers : [];
        const isMyPost = authorId === user?.userId;
        const isFollowing = followers.some(id => id.toString() === user?.userId);
        const isWorking = followingUserId === authorId;
        const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
        const isLiked = likedBy.some(id => id.toString() === user?.userId);

        return (
          <article
            key={post._id}
            className="post-card"
          >
          <div className="post-card__top">
            <div className="identity">
              {author?.profilePic && (
                <img
                  src={author.profilePic}
                  alt={author.username || 'User'}
                  className="avatar"
                />
              )}
              <div>
                {authorId ? (
                  <Link to={`/users/${authorId}`} className="author-link">
                    @{author?.username || 'Unknown'}
                  </Link>
                ) : (
                  <strong>@{author?.username || 'Unknown'}</strong>
                )}
                <br />
                <small>{followers.length} followers</small>
              </div>
            </div>

            {authorId && !isMyPost && (
              <button
                type="button"
                className="button button--ghost"
                onClick={() => toggleFollow(authorId, isFollowing)}
                disabled={isWorking}
              >
                {isWorking ? 'Saving...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>

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
            <small>Likes: {likedBy.length}</small>
            <button
              type="button"
              className={isLiked ? 'heart-button heart-button--liked' : 'heart-button'}
              onClick={() => toggleLike(post._id, isLiked)}
              aria-pressed={isLiked}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
              title={isLiked ? 'Unlike post' : 'Like post'}
            >
              {isLiked ? '♥' : '♡'}
            </button>
          </div>
        </article>
        );
      })}
      </div>
    </section>
  );
}

export default Feed;
