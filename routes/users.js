const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const User = require('../model/user');
const passportConfig = require('../config/passport');
const passportJWT = passport.authenticate('jwt', { session: false });


const getToken = (user) => {
  return jwt.sign({
    id: user._id,
    email: user.email,
  }, process.env.TOKEN_KEY, { expiresIn: 60 });
}

router.post('/auth', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();

    if (user) return res.status(401).json({ message: 'Email already exists' });

    const newUser = new User({ email, password });
    await newUser.save();
    const token = getToken(newUser);
    res.status(200).json({ accessToken: token });
  } catch (error) {
    res.status(401).json({ error: error })
  }
});

router.post('/signin', passport.authenticate('local', { session: false }), async (req, res, next) => {
  const token = getToken(req.user);
  res.status(200).json({ accessToken: token });
});

router.get('/secret', passportJWT, async (req, res, next) => {
  res.status(200).json('secret page')
});





module.exports = router;
