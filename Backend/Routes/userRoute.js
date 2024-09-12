const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/user.model');
const auth = require('../Middleware/auth.middleware');

// @desc    Register a new user
// @route   POST /api/users/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create new user
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });
  
      await user.save();
       // Generated JWT Token using jsonwebtoken
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });
  
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// @route   POST /api/users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '30d',
        });
  
        res.json({
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// @route   GET /api/users/profile/:userId
// @access  Private
router.get('/profile/:userId', auth, async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // @desc    Update user profile
  // @route   PUT /api/users/profile
  // @access  Private
  router.put('/profile', auth, async (req, res) => {
    const { username, bio, profilePicture, password } = req.body;
  
    try {
      const user = await User.findById(req.user._id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.username = username || user.username;
      user.bio = bio || user.bio;
      user.profilePicture = profilePicture || user.profilePicture;
  
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }
  
      const updatedUser = await user.save();
  
      res.json({
        success: true,
        message: 'Profile updated',
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          bio: updatedUser.bio,
          profilePicture: updatedUser.profilePicture,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  module.exports = router;