const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/User');


/* GET users listing. */
router.get('/signup', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const foundUser = User.find({ email }).exec();
    if (foundUser) {
      return res.status(403).json({
        message: 'Already exists'
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hash
    });
    const newUser = await user.save();
    res.status(201).json({
      message: 'User Created'
    })
  } catch (error) {
    res.status(500).json({ error: error })
  }
});

router.get('/signin', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const foundUser = await User.findOne({ email }).exec();
    if (foundUser) {
      const match = await bcrypt.compare(password, foundUser.password);
      if (match) {
        const expireIn = Date.now() + 3600000;
        const token = await jwt.sign({ email, id: foundUser._id }, 'this is very very secret key', { expiresIn: '1h' });
        return res.status(201).json({ email, token, expireIn })
      }
      return res.status(401).json({ message: 'Authentication Failed' })
    } else {
      res.status(401).json({
        message: 'Authentication Failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error
    })
  }
});

module.exports = router;
