import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth.js';

function Profile() {
  const { token, user } = useAuth(); // user contains userId, name, username, email from JWT
  const { id } = useParams();
  const profileUserId = id || user?.userId;
  const isOwnProfile = !id || id === user?.userId;
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    bio: '',
    profilePic: '',
    followers: [],
    following: [],
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const isFollowing = profile.followers.some(follower => {
    const followerId = typeof follower === 'string' ? follower : follower?._id;
    return followerId?.toString() === user?.userId;
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileUserId) return;
      setLoading(true);
      setError('');
      setSavedMsg('');
      try {
        const res = await fetch(`/api/v1/users/${profileUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.msg || 'Failed to load profile');
        }
        const data = await res.json();
        const u = data.user;
        setProfile({
          name: u.name || '',
          username: u.username || '',
          bio: u.bio || '',
          profilePic: u.profilePic || '',
          followers: Array.isArray(u.followers) ? u.followers : [],
          following: Array.isArray(u.following) ? u.following : [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (profileUserId) fetchProfile();
  }, [profileUserId, token]);

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    setError('');
    setSavedMsg('');
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setError('Please choose an image first');
      return;
    }

    setUploadingImage(true);
    setError('');
    setSavedMsg('');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const res = await fetch('/api/v1/users/profile-picture', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || 'Failed to upload profile picture');
      }

      const data = await res.json();
      const updatedUser = data.user;

      setProfile(prev => ({
        ...prev,
        profilePic: updatedUser.profilePic || '',
      }));
      setSelectedImage(null);
      setSavedMsg('Profile picture updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwnProfile || !user?.userId) return;
    setSaving(true);
    setError('');
    setSavedMsg('');
    try {
      const res = await fetch(`/api/v1/users/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || 'Failed to update profile');
      }
      await res.json();
      setSavedMsg('Profile updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFollowToggle = async () => {
    if (isOwnProfile || !profileUserId) return;

    setFollowing(true);
    setError('');
    setSavedMsg('');

    try {
      const res = await fetch(`/api/v1/users/${profileUserId}/follow`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || 'Failed to update follow status');
      }

      setProfile(prev => {
        const followers = Array.isArray(prev.followers) ? prev.followers : [];
        const nextFollowers = isFollowing
          ? followers.filter(follower => {
              const followerId = typeof follower === 'string' ? follower : follower?._id;
              return followerId?.toString() !== user?.userId;
            })
          : [
              ...followers,
              {
                _id: user.userId,
                name: user.name,
                username: user.username,
              },
            ];

        return {
          ...prev,
          followers: nextFollowers,
        };
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setFollowing(false);
    }
  };

  if (loading) return <p className="loading-state">Loading profile...</p>;

  return (
    <section className="page-stack">
      <div className="page-header">
        <p className="eyebrow">Account</p>
        <h1>{isOwnProfile ? 'My Profile' : `${profile.name || 'User'}'s Profile`}</h1>
      </div>
      {error && <p className="alert alert--error">{error}</p>}
      {savedMsg && <p className="alert alert--success">{savedMsg}</p>}
      <section className="panel">
        <div className="profile-hero">
          {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt={profile.username || 'Profile'}
              className="avatar avatar--large"
            />
          ) : (
            <div className="avatar avatar--large avatar--fallback">
              {(profile.name || profile.username || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="eyebrow">@{profile.username}</p>
            <h2 className="post-title">{profile.name}</h2>
            {profile.bio && <p className="post-content">{profile.bio}</p>}
            {!isOwnProfile && (
              <button
                type="button"
                className={isFollowing ? 'button button--ghost profile-action' : 'button profile-action'}
                onClick={handleFollowToggle}
                disabled={following}
              >
                {following ? 'Saving...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="stats-row">
          <div className="stat">
            <strong>{profile.followers.length}</strong>
            <span>Followers</span>
          </div>
          <div className="stat">
            <strong>{profile.following.length}</strong>
            <span>Following</span>
          </div>
        </div>

        <div className="profile-grid">
          <div className="mini-list">
            <h3>Followers</h3>
            {profile.followers.length === 0 && <p>No followers yet.</p>}
            {profile.followers.map(follower => (
              <p key={follower._id}>
                @{follower.username}
              </p>
            ))}
          </div>

          <div className="mini-list">
            <h3>Following</h3>
            {profile.following.length === 0 && <p>Not following anyone yet.</p>}
            {profile.following.map(following => (
              <p key={following._id}>
                @{following.username}
              </p>
            ))}
          </div>
        </div>
      </section>
      {isOwnProfile && (
        <>
          <section className="panel">
            <form className="form" onSubmit={handleImageUpload}>
              <div className="field">
                <label htmlFor="profile-image">Profile Picture</label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <button className="button" type="submit" disabled={uploadingImage}>
                {uploadingImage ? 'Uploading…' : 'Upload Image'}
              </button>
            </form>
          </section>
          <section className="panel">
            <form className="form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Name</label>
                <input name="name" value={profile.name} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Username</label>
                <input name="username" value={profile.username} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleChange} rows={3} />
              </div>
              <button className="button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </form>
          </section>
        </>
      )}
    </section>
  );
}

export default Profile;
