const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const postController = require('../controllers/postController');

router.post('/', auth, postController.createPost);
router.get('/topic/:topic', auth, postController.getPostsByTopic);
router.post('/:id/interact', auth, postController.interact);
router.get('/topic/:topic/most-active', auth, postController.getMostActivePost);
router.get('/topic/:topic/expired', auth, postController.getExpiredPostsByTopic);

module.exports = router;
