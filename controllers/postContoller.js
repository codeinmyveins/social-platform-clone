const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { BadRequestError, NotFoundError } = require('../errors');
const Post = require('../models/Post');
const { StatusCodes } = require('http-status-codes');

// CREATE POST
const createPost = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    throw new BadRequestError('Please provide title and content');
  }

  let image = '';

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'social-media-app/posts' },
        (error, uploadedResult) => {
          if (error) return reject(error);
          resolve(uploadedResult);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    image = result.secure_url;
  }

  const post = await Post.create({
    title,
    content,
    image,
    createdBy: req.user.userId,
  });

  const populatedPost = await Post.findById(post._id)
    .populate('createdBy', 'username name profilePic followers');

  res.status(StatusCodes.CREATED).json({ post: populatedPost });
};

// GET SINGLE POST (PUBLIC)
const getPost = async (req, res) => {
  const { params: { id: postId } } = req;

  const post = await Post.findById(postId)
    .populate('createdBy', 'username name profilePic followers');

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  res.status(StatusCodes.OK).json({ post });
};

// GET ALL POSTS (FEED)
const getAllPosts = async (req, res) => {
  const posts = await Post.find({})
    .sort('-createdAt')
    .populate('createdBy', 'username name profilePic followers');

  res.status(StatusCodes.OK).json({ posts });
};

// GET MY POSTS
const getMyPosts = async (req, res) => {
  const posts = await Post.find({ createdBy: req.user.userId })
    .sort('-createdAt')
    .populate('createdBy', 'username name profilePic followers');

  res.status(StatusCodes.OK).json({ posts });
};

// DELETE POST
const deletePost = async (req, res) => {
  const { user: { userId }, params: { id: postId } } = req;

  const post = await Post.findOneAndDelete({
    _id: postId,
    createdBy: userId,
  });

  if (!post) {
    throw new NotFoundError('Post not found or unauthorized');
  }

  res.status(StatusCodes.OK).json({ msg: 'Post deleted successfully' });
};

// TOGGLE LIKE
const toggleLike = async (req, res) => {
  const { user: { userId }, params: { id: postId } } = req;

  const post = await Post.findById(postId);

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  const alreadyLiked = post.likedBy.some(
    id => id.toString() === userId.toString()
  );

  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter(
      id => id.toString() !== userId.toString()
    );
  } else {
    post.likedBy.push(userId);
  }

  await post.save();

  // populate before sending response
  const updatedPost = await Post.findById(postId)
    .populate('createdBy', 'username name profilePic followers');

  res.status(StatusCodes.OK).json({ post: updatedPost });
};

module.exports = {
  createPost,
  getPost,
  getAllPosts,
  getMyPosts,
  deletePost,
  toggleLike,
};
