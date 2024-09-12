const express = require('express');
const Comment = require('../Models/comment.model');
const Post = require('../Models/post.model');
const authMiddleware = require('../Middleware/auth.middleware');


const router = express.Router();

// @desc    Add a comment to a post
// @route   POST /api/posts/:postId/comments
// @access  Private
router.post('/:postId/comments', authMiddleware, async (req, res) => {
  const { comment } = req.body;

  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    const newComment = new Comment({
      comment,
      user: req.user._id,
      post: req.params.postId,
      createdAt: new Date(),
    });

    await newComment.save();

    post.comments.push(newComment._id);
    await post.save();

    res.status(201).json({
      success: true,
      commentId: newComment._id,
      user: req.user._id,
      message: 'Comment added successfully',
    });
  } catch (error) {
    res.status(500).json({ message: `Server error ${error.message}` });
  }
});

// @desc    Delete a comment from a post
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
router.delete('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { commentId, postId } = req.params; 
    
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId); 
    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: commentId }, 
    });

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error:', error); 
    res.status(500).json({ message: `Server error ${error.message}` });
  }
});

module.exports = router;
