const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Post = require('../Models/post.model');
const User = require('../Models/user.model');
const Comment = require('../Models/comment.model');
const auth = require('../Middleware/auth.middleware');

// @desc    Create a stock post
// @route   POST /api/posts
// @access  Private
router.post('/', auth, async (req, res) => {
    const { stockSymbol, title, description, tags } = req.body;
  
    try {
      const post = new Post({
        stockSymbol,
        title,
        description,
        tags,
        user: req.user._id, 
        createdAt: new Date(),
      });
  
      await post.save();
  
      res.status(201).json({
        success: true,
        postId: post._id,
        user: req.user._id,
        message: 'Post created successfully',
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// @desc    Get all stock posts (with filtering and sorting)
// @route   GET /api/posts
// @access  Public
router.get('/', async (req, res) => {
    const { stockSymbol, tags, sortBy } = req.query;
  
    try {
      let query = {};
  
      if (stockSymbol) query.stockSymbol = stockSymbol;
      if (tags) query.tags = { $in: tags.split(',') };
  
      let sort = {};
      if (sortBy === 'date') sort.createdAt = -1; 
      if (sortBy === 'likes') sort.likesCount = -1;
  
      const posts = await Post.find(query).sort(sort).populate('user', 'username');
  
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// @desc    Get a single stock post (with comments)
// @route   GET /api/posts/:postId
// @access  Public
router.get('/:postId', async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId)
        .populate('user', 'username')
        .populate({
          path: 'comments',
          populate: { path: 'user', select: 'username' },
        });
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: `Server error ${error}` });
    }
  });


// @desc    Delete a stock post
// @route   DELETE /api/posts/:postId
// @access  Private
  router.delete('/:postId', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Only the post creator can delete the post
      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this post' });
      }
  
      await Post.deleteOne({ _id: post._id });
  
      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: `Server error ${error}` });
    }
  });

// @desc    Like a post
// @route   POST /api/posts/:postId/like
// @access  Private
router.post('/:postId/like', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      if (post.likes.includes(req.user._id)) {
        return res.status(400).json({ message: 'Post already liked' });
      }
  
      post.likes.push(req.user._id);
      post.likesCount = post.likes.length;
  
      await post.save();
      res.json({ success: true, message: 'Post liked' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // @desc    Unlike a post
// @route   DELETE /api/posts/:postId/like
// @access  Private
router.delete('/:postId/like',auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Post not liked yet' });
    }

    post.likes = post.likes.filter(like => like.toString() !== req.user._id.toString());
    post.likesCount = post.likes.length;

    await post.save();
    res.json({ success: true, message: 'Post unliked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
    
  