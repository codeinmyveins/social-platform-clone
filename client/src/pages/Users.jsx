import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth.js';

function Users() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingUserId, setFollowingUserId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/v1/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.msg || 'Failed to load users');
        }

        const data = await res.json();
        setUsers(Array.isArray(data.user) ? data.user : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUsers();
  }, [token]);

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

      // Update the button immediately using the same idea as the backend:
      // if I follow someone, my id appears in their followers array.
      setUsers(prevUsers =>
        prevUsers.map(profile => {
          if (profile._id !== targetUserId) return profile;

          const followers = Array.isArray(profile.followers) ? profile.followers : [];
          const nextFollowers = isFollowing
            ? followers.filter(id => id.toString() !== user.userId)
            : [...followers, user.userId];

          return {
            ...profile,
            followers: nextFollowers,
          };
        })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setFollowingUserId('');
    }
  };

  if (loading) return <p className="loading-state">Loading users...</p>;

  return (
    <section className="page-stack">
      <div className="page-header">
        <p className="eyebrow">Community</p>
        <h1>Users</h1>
      </div>
      {error && <p className="alert alert--error">{error}</p>}

      {users.length === 0 && <p className="empty-state">No users found.</p>}

      <div className="user-list">
        {users.map(profile => {
        const isMe = profile._id === user?.userId;
        const followers = Array.isArray(profile.followers) ? profile.followers : [];
        const isFollowing = followers.some(id => id.toString() === user?.userId);
        const isWorking = followingUserId === profile._id;

        return (
          <article
            key={profile._id}
            className="user-card"
          >
            <div className="user-card__body">
              <div className="identity">
                {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt={profile.username || profile.name}
                  className="avatar"
                />
                ) : (
                  <div className="avatar avatar--fallback">
                    {(profile.name || profile.username || '?').charAt(0).toUpperCase()}
                  </div>
              )}

                <div>
                <h3>{profile.name}</h3>
                <p>@{profile.username}</p>
                {profile.bio && <p>{profile.bio}</p>}
                <small>{followers.length} followers</small>
                </div>
              </div>

              {!isMe && (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => toggleFollow(profile._id, isFollowing)}
                  disabled={isWorking}
                >
                  {isWorking ? 'Saving...' : isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </article>
        );
      })}
      </div>
    </section>
  );
}

export default Users;
