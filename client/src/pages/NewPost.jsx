import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.js';

function NewPost() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || 'Failed to create post');
      }
      await res.json();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page-stack page-stack--narrow">
      <div className="page-header">
        <p className="eyebrow">Create</p>
        <h1>New Post</h1>
      </div>
      <div className="panel">
        {error && <p className="alert alert--error">{error}</p>}
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="field">
          <label>Content</label>
          <textarea name="content" value={form.content} onChange={handleChange} required rows={4} />
          </div>
          <div className="field">
          <label htmlFor="post-image">Image</label>
          <input
            id="post-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          </div>
          <button className="button" type="submit">Publish</button>
        </form>
      </div>
    </section>
  );
}

export default NewPost;
