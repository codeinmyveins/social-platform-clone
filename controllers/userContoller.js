const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const {NotFoundError, BadRequestError} = require('../errors')

const getProfile = async (req,res) => {
    const id = req.params.id
    const user = await User.findById({_id:id}).select('-password')
    if(!user) throw new NotFoundError(`User with ${id} not found.`)
    res.status(StatusCodes.OK).json({user})
}

const getAllProfiles = async (req,res) =>{
    const user = await User.find({}).select('-password')
    if(!user.length) throw new NotFoundError(`users not found`)
    res.status(StatusCodes.OK).json({user})
}

const updateProfile = async (req, res) => {
    const { body: { name, bio, username }, user: { userId } } = req
    if (!name || !bio || !username) throw new BadRequestError('Cannot update, check fields are not empty')
    const user = await User.findByIdAndUpdate(
        userId,
        { name, bio, username },
        { returnDocument: 'after', runValidators: true } 
    ).select('-password')
    if (!user) throw new NotFoundError(`User not found.`)
    res.status(StatusCodes.OK).json({ user })
}

const updateProfilePicture = async (req, res) => {
  if (!req.file) {
    throw new BadRequestError('Please upload an image');
  }

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'social-media-app/profile-pictures' },
      (error, uploadedResult) => {
        if (error) return reject(error);
        resolve(uploadedResult);
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  });

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { profilePic: result.secure_url },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  res.status(StatusCodes.OK).json({ user });
};
module.exports = {
    getProfile,
    updateProfile,
    getAllProfiles,
    updateProfilePicture,
}