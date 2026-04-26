const express  =require('express')
const router = express.Router()
const upload = require('../middlewares/uploadMiddleware');

const {createPost, getAllPosts, getPost, deletePost, getMyPosts, toggleLike} = require('../controllers/postContoller')

router.route('/posts')
.post(upload.single('image'), createPost)
.get(getAllPosts)

router.route('/posts/user').get(getMyPosts)

router.route('/posts/:id')
.get(getPost)
.delete(deletePost)

router.route('/posts/:id/like').patch(toggleLike)

module.exports = router;
