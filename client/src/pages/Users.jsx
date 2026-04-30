import React, { useEffect, useState } from 'react';
import { useAuth } from '../App.jsx';

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

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2>Users</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {users.length === 0 && <p>No users found.</p>}

      {users.map(profile => {
        const isMe = profile._id === user?.userId;
        const followers = Array.isArray(profile.followers) ? profile.followers : [];
        const isFollowing = followers.some(id => id.toString() === user?.userId);
        const isWorking = followingUserId === profile._id;

        return (
          <article
            key={profile._id}
            style={{
              border: '1px solid #ddd',
              padding: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {profile.profilePic && (
                <img
                  src={profile.profilePic}
                  alt={profile.username || profile.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                />
              )}

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{profile.name}</h3>
                <p style={{ margin: '0.25rem 0' }}>@{profile.username}</p>
                {profile.bio && <p style={{ margin: 0 }}>{profile.bio}</p>}
                <small>{followers.length} followers</small>
              </div>

              {!isMe && (
                <button
                  type="button"
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
  );
}

export default Users;
