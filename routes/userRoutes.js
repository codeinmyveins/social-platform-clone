const express  = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const upload = require('../middlewares/uploadMiddleware');
const { getProfile, updateProfile, getAllProfiles, updateProfilePicture } = require('../controllers/userContoller')

router.route('/users/profile-picture')
  .patch(authMiddleware, upload.single('image'), updateProfilePicture);

router.route('/users/:id')
.get(getProfile)
.put(authMiddleware, updateProfile)

router.route('/users')
.get(getAllProfiles)


module.exports = router;