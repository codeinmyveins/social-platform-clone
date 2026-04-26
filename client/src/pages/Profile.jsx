import React, { useEffect, useState } from 'react';
import { useAuth } from '../App.jsx';

function Profile() {
  const { token, user } = useAuth(); // user contains userId, name, username, email from JWT
  const [profile, setProfile] = useState({ name: '', username: '', bio: '', profilePic: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.userId) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/v1/users/${user.userId}`, {
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
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user, token]);

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
    if (!user?.userId) return;
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

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>My Profile</h2>
      {savedMsg && <p style={{ color: 'green' }}>{savedMsg}</p>}
      {profile.profilePic && (
        <img
          src={profile.profilePic}
          alt={profile.username || 'Profile'}
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'cover',
            borderRadius: '50%',
            display: 'block',
            marginBottom: '1rem',
          }}
        />
      )}
      <form onSubmit={handleImageUpload} style={{ marginBottom: '1.5rem' }}>
        <div>
          <label htmlFor="profile-image">Profile Picture</label>
          <input
            id="profile-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <button type="submit" disabled={uploadingImage}>
          {uploadingImage ? 'Uploading…' : 'Upload Image'}
        </button>
      </form>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input name="name" value={profile.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Username</label>
          <input name="username" value={profile.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Bio</label>
          <textarea name="bio" value={profile.bio} onChange={handleChange} rows={3} />
        </div>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}

export default Profile;
